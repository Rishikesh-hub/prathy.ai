# AI-Based Drug-Food Interaction Predictor

A modern React application powered by AI to predict potential interactions between medications and food items. This project includes both Express.js and FastAPI backend options.

## Features
- Real-time interaction analysis
- Personalized user profiles
- Medication history tracking
- Interactive, color-coded risk assessment
- RESTful API endpoints
- Cross-platform compatibility

## Tech Stack
- **Frontend**: React.js, Vite, Framer Motion, Lucide React
- **Backend Option 1**: Express.js (Node.js) with Axios
- **Backend Option 2**: FastAPI (Python) with async/await
- **HTTP Client**: Axios
- **Styling**: Vanilla CSS

---

## 📁 Project Structure

```
AI DRUG FOOD/
├── src/                               # React Frontend
│   ├── components/
│   │   ├── Interaction/
│   │   ├── Navbar/
│   │   └── InteractionExample.jsx
│   ├── pages/
│   ├── services/
│   │   ├── api.js
│   │   └── interactionApi.js
│   ├── context/
│   └── App.jsx
├── backend/                           # Express.js Backend
│   ├── server.js
│   ├── package.json
│   ├── .env
│   └── .gitignore
├── backend_api/                       # FastAPI Backend (Optional)
│   ├── main.py
│   ├── requirements.txt
│   └── .env
├── package.json                       # Frontend dependencies
├── vite.config.js
├── .env                               # Frontend env variables
└── README.md
```

---

## 🚀 Quick Start - Option 1: Express.js Backend

### Prerequisites
- Node.js v16+ and npm

### Step 1: Install Frontend Dependencies
```bash
npm install
```

### Step 2: Install Backend Dependencies
```bash
cd backend
npm install
cd ..
```

### Step 3: Start Both Servers

**Terminal 1 - Backend (Express.js):**
```bash
cd backend
npm start
```
Backend will run on: **http://localhost:5000**

**Terminal 2 - Frontend (React):**
```bash
npm run dev
```
Frontend will run on: **http://localhost:5173**

---

## 🐍 Quick Start - Option 2: FastAPI Backend

### Prerequisites
- Python 3.9+ and pip

### Step 1: Create Python Virtual Environment
```bash
python -m venv venv
```

### Step 2: Activate Virtual Environment

**Windows:**
```bash
venv\Scripts\activate
```

**macOS/Linux:**
```bash
source venv/bin/activate
```

### Step 3: Install FastAPI Dependencies
```bash
cd backend_api
pip install fastapi uvicorn python-dotenv aiofiles
cd ..
```

(Or use `pip install -r requirements.txt` if requirements.txt exists)

### Step 4: Start Both Servers

**Terminal 1 - Backend (FastAPI):**
```bash
cd backend_api
python main.py
```
Backend will run on: **http://localhost:8000**

**Terminal 2 - Frontend (React):**
Update `.env` to:
```
VITE_API_URL=http://localhost:8000/api
```
Then run:
```bash
npm run dev
```

---

## 🔧 Development Commands

### Frontend (React)
```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm build

# Preview production build
npm run preview
```

### Backend - Express.js
```bash
# From backend/ directory

# Install dependencies
npm install

# Development mode (with hot-reload)
npm run dev

# Production mode
npm start
```

### Backend - FastAPI
```bash
# From backend_api/ directory (with venv activated)

# Install dependencies
pip install -r requirements.txt

# Development mode
python main.py

# Production mode
uvicorn main:app --host 0.0.0.0 --port 8000
```

---

## 📡 API Endpoints

### Express.js Backend (http://localhost:5000/api)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/interactions` | Get all interactions |
| GET | `/interactions/:id` | Get single interaction |
| POST | `/interactions` | Create new interaction |
| PUT | `/interactions/:id` | Update interaction |
| DELETE | `/interactions/:id` | Delete interaction |
| GET | `/search?drug=name&food=name` | Search interactions |
| GET | `/health` | Health check |

### FastAPI Backend (http://localhost:8000/api)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/interactions` | Get all interactions |
| GET | `/interactions/{id}` | Get single interaction |
| POST | `/interactions` | Create new interaction |
| PUT | `/interactions/{id}` | Update interaction |
| DELETE | `/interactions/{id}` | Delete interaction |
| GET | `/search` | Search interactions |
| GET | `/health` | Health check |

---

## 💻 Example API Usage

### Using React with Axios

```jsx
import { getInteractions, createInteraction } from './services/interactionApi';

// Fetch all interactions
const fetchData = async () => {
  try {
    const response = await getInteractions();
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
};

// Create new interaction
const addInteraction = async () => {
  const newData = {
    drug: 'Aspirin',
    food: 'Alcohol',
    severity: 'High',
    description: 'Increases bleeding risk'
  };
  try {
    const response = await createInteraction(newData);
    console.log('Created:', response.data);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Using Python Requests with FastAPI

```python
import requests

# Fetch all interactions
response = requests.get('http://localhost:8000/api/interactions')
print(response.json())

# Create new interaction
data = {
    'drug': 'Aspirin',
    'food': 'Alcohol',
    'severity': 'High',
    'description': 'Increases bleeding risk'
}
response = requests.post('http://localhost:8000/api/interactions', json=data)
print(response.json())
```

### Using cURL

```bash
# GET all interactions
curl http://localhost:5000/api/interactions

# POST new interaction
curl -X POST http://localhost:5000/api/interactions \
  -H "Content-Type: application/json" \
  -d '{
    "drug": "Aspirin",
    "food": "Alcohol",
    "severity": "High",
    "description": "Increases bleeding risk"
  }'

# DELETE interaction
curl -X DELETE http://localhost:5000/api/interactions/1
```

---

## ⚙️ Environment Configuration

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

### Express Backend (backend/.env)
```env
PORT=5000
NODE_ENV=development
```

### FastAPI Backend (backend_api/.env)
```env
PORT=8000
DEBUG=True
DATABASE_URL=your_database_url
```

---

## 📊 Example Component

See `src/components/InteractionExample.jsx` for a complete working example with:
- Form to add interactions
- Display all interactions in a table
- Delete functionality
- Search feature

---

## 🐛 Troubleshooting

### CORS Errors
**Express.js:** CORS is enabled in `backend/server.js`
**FastAPI:** Add CORS middleware in `backend_api/main.py`:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Port Already in Use
**Express:** Change PORT in `backend/.env`
**FastAPI:** Run on different port: `python main.py --port 8001`
**Frontend:** Vite will use next available port

### Dependency Issues

**Node.js:**
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Python:**
```bash
deactivate
rm -rf venv
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

### Frontend Can't Connect to Backend
- Verify backend is running on correct port
- Check `VITE_API_URL` in `.env`
- Check browser console for error messages
- Verify CORS is enabled on backend

---

## 📦 Installation Summary

### Quick Setup (Express.js)
```bash
# Frontend
npm install

# Backend
cd backend && npm install && cd ..

# Run in 2 terminals
terminal 1: cd backend && npm start
terminal 2: npm run dev
```

### Quick Setup (FastAPI)
```bash
# Frontend
npm install

# Backend
cd backend_api
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..

# Run in 2 terminals
terminal 1: cd backend_api && python main.py
terminal 2: npm run dev (with VITE_API_URL=http://localhost:8000/api)
```

---

## 📤 Version Control

### Initial Push to GitHub
```bash
git add .
git commit -m "Initial commit: Add React frontend and Express backend"
git push origin main
```

### After Making Changes
```bash
git add .
git commit -m "Describe your changes"
git push origin main
```

---

## 🎓 Next Steps

1. **Database Integration**: Replace mock data with MongoDB, PostgreSQL, or Firebase
2. **Authentication**: Add JWT or OAuth2 authentication
3. **Validation**: Implement input validation and error handling
4. **Deployment**: Deploy to Vercel (frontend), Heroku or Railway (backend)
5. **Testing**: Add unit and integration tests
6. **Documentation**: Add API documentation with Swagger/OpenAPI

---

## 📚 Resources

- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [Vite Guide](https://vitejs.dev)
- [Axios Documentation](https://axios-http.com)

---

## License
This project is licensed under the MIT License.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📞 Support

For issues or questions, please open a GitHub issue or contact the maintainers.

Happy Coding! 🚀

