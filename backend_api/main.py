from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
import xgboost as xgb
import numpy as np
import pandas as pd
from rdkit import Chem
from rdkit.Chem import rdMolDescriptors

app = FastAPI()

# 1. Load the model and datasets
try:
    model = xgb.XGBClassifier()
    model.load_model("drug_food_model.json")
except Exception as e:
    raise HTTPException(status_code=500, detail="drug_food_model.json is missing.")

try:
    drug_dataset_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "combined_drug_dataset.csv")
    food_dataset_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "food_compound_dataset.csv")
    drug_df = pd.read_csv(drug_dataset_path)
    food_df = pd.read_csv(food_dataset_path)
except Exception as e:
    drug_df = None
    food_df = None
    print(f"Error loading datasets: {e}")

def get_base_features(mol):
    if mol is None:
        return None
    
    tpsa = rdMolDescriptors.CalcTPSA(mol)
    smr_vsa = rdMolDescriptors.SMR_VSA_(mol)  # Length 10
    vsa_estate = rdMolDescriptors.CalcVSA_EState_(mol) # Length 10
    estate_vsa = rdMolDescriptors.CalcEState_VSA_(mol) # Length 11
    peoe_vsa = rdMolDescriptors.PEOE_VSA_(mol) # Length 14
    slogp_vsa = rdMolDescriptors.SlogP_VSA_(mol) # Length 12
    labute_asa = rdMolDescriptors.CalcLabuteASA(mol)
    
    feats = {}
    feats['MTPSA'] = tpsa
    for i, v in enumerate(smr_vsa): feats[f'MRVSA{i}'] = v
    for i, v in enumerate(vsa_estate): feats[f'VSAEstate{i}'] = v
    for i, v in enumerate(estate_vsa): feats[f'EstateVSA{i}'] = v
    for i, v in enumerate(peoe_vsa): feats[f'PEOEVSA{i}'] = v
    for i, v in enumerate(slogp_vsa): feats[f'slogPVSA{i}'] = v
    feats['LabuteASA'] = labute_asa
    return feats

class PredictionRequest(BaseModel):
    drug: str
    food: str
    age: int
    weight: float

@app.get("/options")
def get_options():
    if drug_df is None or food_df is None:
        raise HTTPException(status_code=500, detail="Server not properly initialized (datasets missing).")
        
    drugs = drug_df['name'].dropna().astype(str).unique().tolist()
    foods = food_df['food'].dropna().astype(str).unique().tolist()
    
    return {
        "drugs": drugs,
        "foods": foods
    }

@app.post("/predict")
def get_prediction(data: PredictionRequest):
    if model is None or drug_df is None or food_df is None:
        raise HTTPException(status_code=500, detail="Server not properly initialized (model or datasets missing).")
        
    drug_name = data.drug.lower()
    food_name = data.food.lower()
    
    # Retrieve smiles
    drug_row = drug_df[drug_df['name'].str.lower() == drug_name]
    food_row = food_df[food_df['food'].str.lower() == food_name]
    
    if drug_row.empty or food_row.empty:
        raise HTTPException(status_code=400, detail={"error": "Not found"})
        
    drug_smiles = drug_row.iloc[0]['SMILES']
    food_smiles = food_row.iloc[0]['moldb_smiles']
    
    if pd.isna(drug_smiles) or pd.isna(food_smiles):
        raise HTTPException(status_code=400, detail="SMILES data is missing for the given drug or food.")

    # Combine SMILES for descriptor calculation
    combined_smiles = f"{drug_smiles}.{food_smiles}"
    mol = Chem.MolFromSmiles(combined_smiles)
    if mol is None:
        raise HTTPException(status_code=400, detail="Invalid SMILES combination.")
        
    base_feats = get_base_features(mol)
    if base_feats is None:
        raise HTTPException(status_code=400, detail="Failed to calculate features.")

    # Construct the exact 18 features expected by the model
    try:
        features = [
            base_feats['MTPSA'] + base_feats['MTPSA'],
            base_feats['MRVSA9'],
            base_feats['MRVSA8'],
            base_feats['MRVSA0'],
            base_feats['MRVSA2'],
            base_feats['VSAEstate10'] + base_feats['VSAEstate10'],
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
            data.age,
            data.weight
        ]
    except KeyError as e:
        raise HTTPException(status_code=500, detail=f"Missing descriptor feature: {str(e)}")

    # Convert to 2D numpy array
    input_array = np.array([features])
    
    # Run the prediction
    prediction = model.predict(input_array)
    
    return {
        "prediction": int(prediction[0]),
        "drug_smiles": drug_smiles,
        "food_smiles": food_smiles
    }