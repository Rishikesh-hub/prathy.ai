from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(
    title="Drug-Food Interactions API",
    description="API for managing and analyzing drug-food interactions",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class Interaction(BaseModel):
    drug: str
    food: str
    severity: str
    description: Optional[str] = ""

class InteractionResponse(Interaction):
    id: int

# Sample database (in-memory)
interactions_db = [
    {"id": 1, "drug": "Aspirin", "food": "Alcohol", "severity": "High", "description": "Can increase risk of stomach bleeding"},
    {"id": 2, "drug": "Metformin", "food": "Vitamin B12 Rich Foods", "severity": "Medium", "description": "May reduce B12 absorption"}
]

# Health Check
@app.get("/api/health")
async def health_check():
    return {"status": "Backend server is running!"}

# GET all interactions
@app.get("/api/interactions", response_model=dict)
async def get_all_interactions():
    return {
        "success": True,
        "data": interactions_db,
        "message": "Interactions fetched successfully"
    }

# GET single interaction by ID
@app.get("/api/interactions/{interaction_id}", response_model=dict)
async def get_interaction(interaction_id: int):
    interaction = next((i for i in interactions_db if i["id"] == interaction_id), None)
    if not interaction:
        raise HTTPException(status_code=404, detail="Interaction not found")
    return {
        "success": True,
        "data": interaction
    }

# POST create new interaction
@app.post("/api/interactions", response_model=dict)
async def create_interaction(interaction: Interaction):
    if not interaction.drug or not interaction.food or not interaction.severity:
        raise HTTPException(status_code=400, detail="Please provide drug, food, and severity")
    
    new_id = max([i["id"] for i in interactions_db]) + 1 if interactions_db else 1
    new_interaction = {
        "id": new_id,
        "drug": interaction.drug,
        "food": interaction.food,
        "severity": interaction.severity,
        "description": interaction.description
    }
    
    interactions_db.append(new_interaction)
    
    return {
        "success": True,
        "message": "Interaction added successfully",
        "data": new_interaction
    }

# PUT update interaction
@app.put("/api/interactions/{interaction_id}", response_model=dict)
async def update_interaction(interaction_id: int, interaction: Interaction):
    existing = next((i for i in interactions_db if i["id"] == interaction_id), None)
    if not existing:
        raise HTTPException(status_code=404, detail="Interaction not found")
    
    existing["drug"] = interaction.drug or existing["drug"]
    existing["food"] = interaction.food or existing["food"]
    existing["severity"] = interaction.severity or existing["severity"]
    existing["description"] = interaction.description or existing["description"]
    
    return {
        "success": True,
        "message": "Interaction updated successfully",
        "data": existing
    }

# DELETE interaction
@app.delete("/api/interactions/{interaction_id}", response_model=dict)
async def delete_interaction(interaction_id: int):
    global interactions_db
    interaction = next((i for i in interactions_db if i["id"] == interaction_id), None)
    if not interaction:
        raise HTTPException(status_code=404, detail="Interaction not found")
    
    interactions_db = [i for i in interactions_db if i["id"] != interaction_id]
    
    return {
        "success": True,
        "message": "Interaction deleted successfully",
        "data": interaction
    }

# SEARCH interactions by drug or food
@app.get("/api/search", response_model=dict)
async def search_interactions(drug: Optional[str] = None, food: Optional[str] = None):
    results = interactions_db
    
    if drug:
        results = [i for i in results if drug.lower() in i["drug"].lower()]
    
    if food:
        results = [i for i in results if food.lower() in i["food"].lower()]
    
    return {
        "success": True,
        "data": results,
        "count": len(results)
    }

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Welcome to Drug-Food Interactions API",
        "version": "1.0.0",
        "docs": "/docs",
        "api_base": "/api"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    print(f"✅ FastAPI Server is running on http://localhost:{port}")
    print(f"📚 API Documentation: http://localhost:{port}/docs")
    uvicorn.run(app, host="0.0.0.0", port=port)
