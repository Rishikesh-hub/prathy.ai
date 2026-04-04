from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
import pandas as pd
import logging
import os
from rdkit import Chem
from rdkit.Chem import AllChem, Descriptors, Crippen
from rdkit.Chem import GraphDescriptors
from mordred import Calculator, descriptors

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Drug-Food Interaction API",
    description="API to predict drug-food interactions using SMILES",
    version="1.0.0"
)

# Add CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the model
try:
    model = joblib.load('drug_food_model.joblib')
    logger.info("Model loaded successfully!")
except FileNotFoundError:
    logger.error("Model file not found. Please ensure 'drug_food_model.joblib' exists.")
    model = None

# Load datasets
drug_df = None
food_df = None
training_df = None

def load_datasets():
    """Load drug, food, and training datasets"""
    global drug_df, food_df, training_df
    
    try:
        # Load training dataset (contains both drug and food features)
        if os.path.exists('training_dataset/00_training.csv'):
            training_df = pd.read_csv('training_dataset/00_training.csv')
            logger.info(f"Training dataset loaded: {training_df.shape[0]} rows, {training_df.shape[1]} columns")
        
        # Try to load drug dataset
        if os.path.exists('dug_dataset.csv'):
            drug_df = pd.read_csv('dug_dataset.csv')
            logger.info(f"Drug dataset loaded: {drug_df.shape[0]} rows")
        elif os.path.exists('drug_dataset.csv'):
            drug_df = pd.read_csv('drug_dataset.csv')
            logger.info(f"Drug dataset loaded: {drug_df.shape[0]} rows")
        
        # Try to load food dataset
        if os.path.exists('food_dataset.csv'):
            food_df = pd.read_csv('food_dataset.csv')
            logger.info(f"Food dataset loaded: {food_df.shape[0]} rows")
        
    except Exception as e:
        logger.warning(f"Error loading datasets: {str(e)}")

# Load datasets on startup
load_datasets()

def calculate_18_features(smiles: str) -> list:
    """
    Calculate 18 molecular descriptors from SMILES using RDKit.
    
    Features:
    1. MTPSA - Topological Polar Surface Area
    2. MRVSA9 - MOE Molar Refractivity VSA descriptor, bin 9
    3. MRVSA8 - MOE Molar Refractivity VSA descriptor, bin 8
    4. MRVSA0 - MOE Molar Refractivity VSA descriptor, bin 0
    5. MRVSA2 - MOE Molar Refractivity VSA descriptor, bin 2
    6. slogPVSA2 - MOE LogP VSA descriptor, bin 2
    7. slogPVSA0 - MOE LogP VSA descriptor, bin 0
    8. slogPVSA9 - MOE LogP VSA descriptor, bin 9
    9. PEOEVSA12 - PEOE VSA descriptor, bin 12
    10. PEOEVSA10 - PEOE VSA descriptor, bin 10
    11. PEOEVSA5 - PEOE VSA descriptor, bin 5
    12. PEOEVSA9 - PEOE VSA descriptor, bin 9
    13. EstateVSA7 - E-State VSA descriptor, bin 7
    14. EstateVSA2 - E-State VSA descriptor, bin 2
    15. VSAEstate10+VSAEstate10 - Combined VSA E-State, bin 10
    16. VSAEstate7+VSAEstate7 - Combined VSA E-State, bin 7
    17. EstateVSA0*LabuteASA - E-State bin 0 multiplied by Labute's Approximate Surface Area
    18. EstateVSA1*VSAEstate8 - E-State bin 1 multiplied by VSA E-State bin 8
    
    Args:
        smiles: SMILES string
        
    Returns:
        List of 18 feature values
    """
    try:
        # Parse SMILES
        mol = Chem.MolFromSmiles(smiles)
        if mol is None:
            logger.error(f"Invalid SMILES: {smiles}")
            return None
        
        # Add hydrogens and compute 2D coordinates
        mol = Chem.AddHs(mol)
        AllChem.EmbedMolecule(mol, randomSeed=42)
        AllChem.MMFFOptimizeMolecule(mol)
        
        features = []
        
        # 1. MTPSA (Topological Polar Surface Area)
        mtpsa = Descriptors.TPSA(mol)
        features.append(mtpsa)
        
        # MOE Molar Refractivity VSA Descriptors (bins 0-14)
        mrvsa_descriptors = Descriptors.MRVSA(mol)
        features.append(mrvsa_descriptors[9] if len(mrvsa_descriptors) > 9 else 0.0)  # MRVSA9
        features.append(mrvsa_descriptors[8] if len(mrvsa_descriptors) > 8 else 0.0)  # MRVSA8
        features.append(mrvsa_descriptors[0] if len(mrvsa_descriptors) > 0 else 0.0)  # MRVSA0
        features.append(mrvsa_descriptors[2] if len(mrvsa_descriptors) > 2 else 0.0)  # MRVSA2
        
        # MOE LogP VSA Descriptors (bins 0-14)
        slogpvsa_descriptors = Descriptors.SlogPVSA(mol)
        features.append(slogpvsa_descriptors[2] if len(slogpvsa_descriptors) > 2 else 0.0)  # slogPVSA2
        features.append(slogpvsa_descriptors[0] if len(slogpvsa_descriptors) > 0 else 0.0)  # slogPVSA0
        features.append(slogpvsa_descriptors[9] if len(slogpvsa_descriptors) > 9 else 0.0)  # slogPVSA9
        
        # PEOE VSA Descriptors (bins 0-14)
        peoevsa_descriptors = Descriptors.PEOEVSA(mol)
        features.append(peoevsa_descriptors[12] if len(peoevsa_descriptors) > 12 else 0.0)  # PEOEVSA12
        features.append(peoevsa_descriptors[10] if len(peoevsa_descriptors) > 10 else 0.0)  # PEOEVSA10
        features.append(peoevsa_descriptors[5] if len(peoevsa_descriptors) > 5 else 0.0)   # PEOEVSA5
        features.append(peoevsa_descriptors[9] if len(peoevsa_descriptors) > 9 else 0.0)   # PEOEVSA9
        
        # E-State VSA Descriptors (bins 0-14)
        estatevsa_descriptors = Descriptors.EState_VSA(mol)
        features.append(estatevsa_descriptors[7] if len(estatevsa_descriptors) > 7 else 0.0)  # EstateVSA7
        features.append(estatevsa_descriptors[2] if len(estatevsa_descriptors) > 2 else 0.0)  # EstateVSA2
        
        # VSA E-State Descriptors (bins 0-14)
        vsaestate_descriptors = Descriptors.VSA_EState(mol)
        features.append(2 * (vsaestate_descriptors[10] if len(vsaestate_descriptors) > 10 else 0.0))  # VSAEstate10+VSAEstate10
        features.append(2 * (vsaestate_descriptors[7] if len(vsaestate_descriptors) > 7 else 0.0))   # VSAEstate7+VSAEstate7
        
        # EstateVSA0 * LabuteASA
        labuteasa = Descriptors.LabuteASA(mol)
        estate0 = estatevsa_descriptors[0] if len(estatevsa_descriptors) > 0 else 0.0
        features.append(estate0 * labuteasa)  # EstateVSA0*LabuteASA
        
        # EstateVSA1 * VSAEstate8
        estate1 = estatevsa_descriptors[1] if len(estatevsa_descriptors) > 1 else 0.0
        vsaestate8 = vsaestate_descriptors[8] if len(vsaestate_descriptors) > 8 else 0.0
        features.append(estate1 * vsaestate8)  # EstateVSA1*VSAEstate8
        
        logger.info(f"Successfully calculated 18 features for SMILES: {smiles}")
        return features
        
    except Exception as e:
        logger.error(f"Error calculating features from SMILES '{smiles}': {str(e)}")
        return None

def get_smiles_features(smiles: str, dataset_type: str = None) -> list:
    """
    Get 18 features from SMILES string using RDKit.
    
    Args:
        smiles: SMILES string
        dataset_type: Ignored (for backward compatibility)
        
    Returns:
        List of 18 features or None if calculation fails
    """
    return calculate_18_features(smiles)

# Define request/response models
class SMILESPredictionRequest(BaseModel):
    """Request model for SMILES-based predictions"""
    drug_smiles: str
    food_smiles: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "drug_smiles": "CC(=O)Oc1ccccc1C(=O)O",
                "food_smiles": "C1=CC=C(C=C1)C2=CC(=NN2C3=CC=C(C=C3)S(=O)(=O)N)C(F)(F)F"
            }
        }

class PredictionRequest(BaseModel):
    """Request model for predictions"""
    features: list[float]
    
    class Config:
        json_schema_extra = {
            "example": {
                "features": [0.5, 1.2, 0.3, 2.1]
            }
        }

class PredictionResponse(BaseModel):
    """Response model for predictions"""
    prediction: int
    prediction_label: str
    confidence: float
    drug_features: list[float] = None
    food_features: list[float] = None
    combined_features: list[float] = None

class BatchPredictionRequest(BaseModel):
    """Request model for batch predictions"""
    batch: list[list[float]]

class BatchPredictionResponse(BaseModel):
    """Response model for batch predictions"""
    predictions: list[int]
    labels: list[str]
    confidences: list[float]

# Routes
@app.get("/")
async def root():
    """Welcome endpoint"""
    return {
        "message": "Welcome to Drug-Food Interaction API",
        "status": "Model loaded" if model else "Model not loaded",
        "documentation": "/docs"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "drug_dataset_loaded": drug_df is not None,
        "food_dataset_loaded": food_df is not None
    }

@app.post("/predict-smiles", response_model=PredictionResponse)
async def predict_smiles(request: SMILESPredictionRequest):
    """
    Make prediction using drug and food SMILES.
    
    Process:
    1. Search for drug SMILES in drug dataset, retrieve 18 features
    2. Search for food SMILES in food dataset, retrieve 18 features
    3. Sum both 18-feature vectors
    4. Use the combined 36 features (or sum) for prediction
    
    Parameters:
    - drug_smiles: SMILES string of the drug
    - food_smiles: SMILES string of the food
    
    Returns:
    - prediction: The predicted class (0, 1, or 2)
    - prediction_label: Human-readable label
    - confidence: Confidence score (0-1)
    - drug_features: Retrieved drug features
    - food_features: Retrieved food features
    - combined_features: Sum of drug and food features
    """
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    try:
        # Calculate features for drug SMILES
        drug_features = get_smiles_features(request.drug_smiles)
        if drug_features is None:
            raise HTTPException(status_code=400, detail=f"Invalid drug SMILES: '{request.drug_smiles}'")
        
        # Calculate features for food SMILES
        food_features = get_smiles_features(request.food_smiles)
        if food_features is None:
            raise HTTPException(status_code=400, detail=f"Invalid food SMILES: '{request.food_smiles}'")
        
        # Ensure both have 18 features
        if len(drug_features) < 18:
            drug_features = drug_features + [0.0] * (18 - len(drug_features))
        if len(food_features) < 18:
            food_features = food_features + [0.0] * (18 - len(food_features))
        
        # Sum the 18 features
        combined_features = np.array(drug_features[:18]) + np.array(food_features[:18])
        
        # Make prediction using combined features
        X = combined_features.reshape(1, -1)
        prediction = model.predict(X)[0]
        
        # Get prediction probabilities for confidence
        proba = model.predict_proba(X)[0]
        confidence = float(np.max(proba))
        
        # Map prediction to label
        label_map = {0: "No Interaction", 1: "Minor Interaction", 2: "Major Interaction"}
        prediction_label = label_map.get(int(prediction), "Unknown")
        
        return PredictionResponse(
            prediction=int(prediction),
            prediction_label=prediction_label,
            confidence=confidence,
            drug_features=drug_features[:18],
            food_features=food_features[:18],
            combined_features=combined_features.tolist()
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"SMILES prediction error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Prediction failed: {str(e)}")

@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    """
    Make a single prediction using pre-computed features.
    
    Parameters:
    - features: List of feature values
    
    Returns:
    - prediction: The predicted class (0, 1, or 2)
    - prediction_label: Human-readable label
    - confidence: Confidence score (0-1)
    """
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    try:
        # Convert list to numpy array and reshape for prediction
        X = np.array(request.features).reshape(1, -1)
        
        # Make prediction
        prediction = model.predict(X)[0]
        
        # Get prediction probabilities for confidence
        proba = model.predict_proba(X)[0]
        confidence = float(np.max(proba))
        
        # Map prediction to label
        label_map = {0: "No Interaction", 1: "Minor Interaction", 2: "Major Interaction"}
        prediction_label = label_map.get(int(prediction), "Unknown")
        
        return PredictionResponse(
            prediction=int(prediction),
            prediction_label=prediction_label,
            confidence=confidence
        )
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Prediction failed: {str(e)}")

@app.post("/predict-batch", response_model=BatchPredictionResponse)
async def predict_batch(request: BatchPredictionRequest):
    """
    Make batch predictions.
    
    Parameters:
    - batch: List of feature lists
    
    Returns:
    - predictions: List of predicted classes
    - labels: List of human-readable labels
    - confidences: List of confidence scores
    """
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    try:
        # Convert to numpy array
        X = np.array(request.batch)
        
        # Make predictions
        predictions = model.predict(X)
        probas = model.predict_proba(X)
        confidences = [float(np.max(proba)) for proba in probas]
        
        # Map predictions to labels
        label_map = {0: "No Interaction", 1: "Minor Interaction", 2: "Major Interaction"}
        labels = [label_map.get(int(pred), "Unknown") for pred in predictions]
        
        return BatchPredictionResponse(
            predictions=predictions.tolist(),
            labels=labels,
            confidences=confidences
        )
    except Exception as e:
        logger.error(f"Batch prediction error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Batch prediction failed: {str(e)}")

@app.get("/model-info")
async def model_info():
    """Get information about the loaded model"""
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    return {
        "model_type": str(type(model).__name__),
        "n_estimators": model.n_estimators,
        "max_depth": model.max_depth,
        "learning_rate": model.learning_rate,
        "n_classes": model.n_classes_
    }

@app.get("/reload-datasets")
async def reload_datasets():
    """Reload all datasets from disk"""
    try:
        load_datasets()
        return {
            "status": "Datasets reloaded successfully",
            "drug_dataset_loaded": drug_df is not None,
            "food_dataset_loaded": food_df is not None
        }
    except Exception as e:
        logger.error(f"Error reloading datasets: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to reload datasets: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
