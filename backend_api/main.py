from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import json
import xgboost as xgb
import numpy as np
import pandas as pd
from rdkit import Chem
from rdkit.Chem import rdMolDescriptors

app = FastAPI()

# Allow requests from React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# ── Load model ──────────────────────────────────────────────
try:
    model = xgb.XGBClassifier()
    model.load_model(os.path.join(BASE_DIR, "drug_food_model.json"))
except Exception as e:
    print(f"ERROR loading model: {e}")
    model = None

# ── Load datasets ───────────────────────────────────────────
try:
    drug_df = pd.read_csv(os.path.join(BASE_DIR, "combined_drug_dataset.csv"))
    food_df = pd.read_csv(os.path.join(BASE_DIR, "food_compound_dataset.csv"))
    # food_compound_dataset.csv is now the clean 71-row file (one compound per food)
except Exception as e:
    drug_df = None
    food_df = None
    print(f"ERROR loading datasets: {e}")

# ── Load disease warnings ────────────────────────────────────
try:
    with open(os.path.join(BASE_DIR, "disease_warnings.json"), "r") as f:
        disease_warning_map = json.load(f)
except Exception as e:
    disease_warning_map = {}
    print(f"ERROR loading disease_warnings.json: {e}")


def get_base_features(mol):
    """Extract the 18 chemical descriptors used by the model."""
    if mol is None:
        return None
    feats = {}
    feats['MTPSA'] = rdMolDescriptors.CalcTPSA(mol)
    feats['LabuteASA'] = rdMolDescriptors.CalcLabuteASA(mol)

    smr_vsa = rdMolDescriptors.SMR_VSA_(mol)          # length 10 → indices 0–9
    for i, v in enumerate(smr_vsa):
        feats[f'MRVSA{i}'] = v

    vsa_estate = rdMolDescriptors.CalcVSA_EState_(mol) # length 10 → indices 0–9
    for i, v in enumerate(vsa_estate):
        feats[f'VSAEstate{i}'] = v

    estate_vsa = rdMolDescriptors.CalcEState_VSA_(mol) # length 11 → indices 0–10
    for i, v in enumerate(estate_vsa):
        feats[f'EstateVSA{i}'] = v

    peoe_vsa = rdMolDescriptors.PEOE_VSA_(mol)         # length 14 → indices 0–13
    for i, v in enumerate(peoe_vsa):
        feats[f'PEOEVSA{i}'] = v

    slogp_vsa = rdMolDescriptors.SlogP_VSA_(mol)       # length 12 → indices 0–11
    for i, v in enumerate(slogp_vsa):
        feats[f'slogPVSA{i}'] = v

    return feats


class PredictionRequest(BaseModel):
    drug: str
    food: str
    age: int
    weight: float
    diseases: list[str] = []


@app.get("/health")
def health():
    return {"status": "FastAPI is running"}


@app.get("/drugs")
def get_drugs():
    if drug_df is None:
        raise HTTPException(status_code=500, detail="Drug dataset not loaded.")
    return drug_df['name'].dropna().astype(str).unique().tolist()


@app.get("/foods")
def get_foods():
    if food_df is None:
        raise HTTPException(status_code=500, detail="Food dataset not loaded.")
    # 'food' column has the real food names (grapefruit, coffee, etc.)
    return food_df['food'].dropna().astype(str).unique().tolist()


@app.post("/predict")
def get_prediction(data: PredictionRequest):
    if model is None or drug_df is None or food_df is None:
        raise HTTPException(status_code=500, detail="Server not properly initialized.")

    drug_name = data.drug.strip().lower()
    food_name = data.food.strip().lower()

    # ── Lookup drug by name (case-insensitive) ───────────────
    drug_row = drug_df[drug_df['name'].str.lower() == drug_name]
    if drug_row.empty:
        raise HTTPException(
            status_code=400,
            detail=f"Drug '{data.drug}' not found in database. Check spelling or use the autocomplete list."
        )

    # ── Lookup food by food column (case-insensitive) ────────
    food_row = food_df[food_df['food'].str.lower() == food_name]
    if food_row.empty:
        raise HTTPException(
            status_code=400,
            detail=f"Food '{data.food}' not found. Supported foods: grapefruit, coffee, banana, milk, etc."
        )

    # FIX: column is 'smiles' (lowercase) in both datasets
    drug_smiles = drug_row.iloc[0]['smiles']
    food_smiles = food_row.iloc[0]['smiles']

    if pd.isna(drug_smiles) or pd.isna(food_smiles):
        raise HTTPException(status_code=400, detail="SMILES data missing for this drug/food pair.")

    # ── Combine SMILES and compute descriptors ───────────────
    combined_smiles = f"{drug_smiles}.{food_smiles}"
    mol = Chem.MolFromSmiles(combined_smiles)
    if mol is None:
        raise HTTPException(status_code=400, detail="Invalid SMILES combination — could not parse molecule.")

    base_feats = get_base_features(mol)
    if base_feats is None:
        raise HTTPException(status_code=400, detail="Failed to calculate molecular features.")

    # ── Build the 20-feature vector (18 chemical + age + weight) ─
    # FIX: VSAEstate index range is 0–9 (not 0–10). VSAEstate10 does not exist.
    try:
        features = [
            base_feats['MTPSA'] + base_feats['MTPSA'],
            base_feats['MRVSA9'],
            base_feats['MRVSA8'],
            base_feats['MRVSA0'],
            base_feats['MRVSA2'],
            base_feats['VSAEstate9'] + base_feats['VSAEstate9'],   # was VSAEstate10 (FIXED)
            base_feats['EstateVSA0'] * base_feats['LabuteASA'],
            base_feats['PEOEVSA12'],
            base_feats['PEOEVSA10'],
            base_feats['PEOEVSA5'],
            base_feats['PEOEVSA9'],
            base_feats['slogPVSA2'],
            base_feats['slogPVSA0'],
            base_feats['slogPVSA9'],
            base_feats['VSAEstate7'] + base_feats['VSAEstate7'],
            base_feats['EstateVSA7'],
            base_feats['EstateVSA2'],
            base_feats['EstateVSA1'] * base_feats['VSAEstate8'],
            float(data.age),
            float(data.weight),
        ]
    except KeyError as e:
        raise HTTPException(status_code=500, detail=f"Missing descriptor key: {str(e)}")

    # ── Run prediction ───────────────────────────────────────
    input_array = np.array([features])
    prediction = int(model.predict(input_array)[0])

    # ── Disease warnings (rule-based, local only) ────────────
    matched_warnings = []
    for disease in data.diseases:
        key = disease.strip().lower()
        if key in disease_warning_map:
            matched_warnings.append(f"{disease}: {disease_warning_map[key]}")

    return {
        "prediction": prediction,
        "drug_smiles": drug_smiles,
        "food_smiles": food_smiles,
        "disease_warnings": matched_warnings,
    }