# FastAPI Backend Setup Guide

## 📋 Prerequisites

- Python 3.9 or higher
- pip (Python package manager)
- Virtual environment (venv)

---

## 🚀 Installation Steps

### Step 1: Create Virtual Environment

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### Step 2: Install Dependencies

```bash
pip install -r requirements.txt
```

Or install individually:
```bash
pip install fastapi uvicorn python-dotenv pydantic
```

### Step 3: Configure Environment

The `.env` file is already configured with:
```env
PORT=8000
DEBUG=True
```

Modify as needed for your environment.

---

## ▶️ Running the Server

### Development Mode

```bash
# From backend_api directory
python main.py
```

Server will run on: **http://localhost:8000**

### Production Mode

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

---

## 📚 API Documentation

FastAPI automatically generates interactive documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI Schema**: http://localhost:8000/openapi.json

---

## 📡 Available Endpoints

### Base URL: `http://localhost:8000/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/interactions` | Get all interactions |
| GET | `/interactions/{id}` | Get single interaction |
| POST | `/interactions` | Create new interaction |
| PUT | `/interactions/{id}` | Update interaction |
| DELETE | `/interactions/{id}` | Delete interaction |
| GET | `/search?drug=name&food=name` | Search interactions |

---

## 🔌 Connecting Frontend to FastAPI

Update `frontend/.env`:
```env
VITE_API_URL=http://localhost:8000/api
```

---

## 📝 Request Examples

### Using Python Requests

```python
import requests

BASE_URL = "http://localhost:8000/api"

# GET all interactions
response = requests.get(f"{BASE_URL}/interactions")
print(response.json())

# POST new interaction
data = {
    "drug": "Aspirin",
    "food": "Alcohol",
    "severity": "High",
    "description": "Increases bleeding risk"
}
response = requests.post(f"{BASE_URL}/interactions", json=data)
print(response.json())

# PUT update interaction
update_data = {
    "severity": "Medium",
    "description": "Updated description"
}
response = requests.put(f"{BASE_URL}/interactions/1", json=update_data)
print(response.json())

# DELETE interaction
response = requests.delete(f"{BASE_URL}/interactions/1")
print(response.json())
```

### Using cURL

```bash
# GET all
curl http://localhost:8000/api/interactions

# POST
curl -X POST http://localhost:8000/api/interactions \
  -H "Content-Type: application/json" \
  -d '{"drug":"Aspirin","food":"Alcohol","severity":"High","description":"Risk"}'

# PUT
curl -X PUT http://localhost:8000/api/interactions/1 \
  -H "Content-Type: application/json" \
  -d '{"severity":"Medium"}'

# DELETE
curl -X DELETE http://localhost:8000/api/interactions/1
```

---

## 🐛 Troubleshooting

### ModuleNotFoundError
Ensure virtual environment is activated:
```bash
# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

### Port Already in Use
Run on a different port:
```bash
python main.py --port 8001
# Or modify .env and run python main.py
```

### CORS Issues
CORS is already enabled in `main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Requirements Installation Issue
```bash
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```

---

## 🔄 Deactivating Virtual Environment

When done, deactivate the virtual environment:
```bash
deactivate
```

---

## 📦 Adding New Dependencies

1. Install with pip:
```bash
pip install new-package
```

2. Update requirements.txt:
```bash
pip freeze > requirements.txt
```

---

## 🚀 Deployment Options

### Heroku
```bash
# Create Procfile
echo "web: uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}" > Procfile

# Deploy
heroku login
heroku create your-app-name
git push heroku main
```

### Railway
```bash
npm install -g railway
railway login
railway init
railway up
```

### AWS Lambda
```bash
pip install mangum
# Modify main.py to use Lambda handler
```

---

## 📚 Learn More

- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [Uvicorn Documentation](https://www.uvicorn.org)
- [Pydantic Documentation](https://docs.pydantic.dev)

Happy coding! 🐍✨
