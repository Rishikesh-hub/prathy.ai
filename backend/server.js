import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import mongoose from 'mongoose';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {});
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ FATAL: MongoDB connection error:', err);
    process.exit(1);
  }
};
connectDB();

// Mongoose Schema
const interactionSchema = new mongoose.Schema({
  drug: String,
  food: String,
  risk: String,
  severity: String,
  effect: String,
  advice: String,
});
const Interaction = mongoose.model('Interaction', interactionSchema);

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  name: String,
  age: Number,
  weight: Number,
  gender: String,
  conditions: [String],
  allergies: [String],
  medications: String
});
const User = mongoose.model('User', userSchema);

// Root route so opening the server in a browser shows a useful page
app.get('/', (req, res) => {
  res.status(200).send(`
    <h1>Drug-Food API</h1>
    <p>The backend is running on port ${PORT}.</p>
    <ul>
      <li><a href="/api/health">/api/health</a></li>
      <li><a href="/api/interactions">/api/interactions</a></li>
      <li>Frontend dev server: <a href="http://localhost:3000">http://localhost:3000</a></li>
    </ul>
  `);
});

// GET: Fetch all interactions
app.get('/api/interactions', async (req, res) => {
  try {
    const data = await Interaction.find();
    res.status(200).json({
      success: true,
      data,
      message: 'Interactions fetched successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching interactions',
      error: error.message
    });
  }
});

// GET: Fetch single interaction by ID
app.get('/api/interactions/:id', async (req, res) => {
  try {
    const interaction = await Interaction.findById(req.params.id);

    if (!interaction) {
      return res.status(404).json({
        success: false,
        message: 'Interaction not found'
      });
    }

    res.status(200).json({
      success: true,
      data: interaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching interaction',
      error: error.message
    });
  }
});

// POST: Add new interaction
app.post('/api/interactions', async (req, res) => {
  try {
    const { drug, food, severity, risk, effect, advice } = req.body;

    // Validation
    if (!drug || !food || !severity) {
      return res.status(400).json({
        success: false,
        message: 'Please provide drug, food, and severity'
      });
    }

    const newInteraction = await Interaction.create({
      drug,
      food,
      severity,
      risk,
      effect,
      advice
    });

    res.status(201).json({
      success: true,
      message: 'Interaction added successfully',
      data: newInteraction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding interaction',
      error: error.message
    });
  }
});

// PUT: Update interaction
app.put('/api/interactions/:id', async (req, res) => {
  try {
    const updated = await Interaction.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Interaction not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Interaction updated successfully',
      data: updated
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating interaction',
      error: error.message
    });
  }
});

// DELETE: Remove interaction
app.delete('/api/interactions/:id', async (req, res) => {
  try {
    const deleted = await Interaction.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Interaction not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Interaction deleted successfully',
      data: deleted
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting interaction',
      error: error.message
    });
  }
});

// Search interactions
app.get('/api/search', async (req, res) => {
  try {
    const { drug, food } = req.query;
    let query = {};
    if (drug) query.drug = { $regex: drug, $options: 'i' };
    if (food) query.food = { $regex: food, $options: 'i' };

    const results = await Interaction.find(query);

    res.status(200).json({
      success: true,
      data: results,
      count: results.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching interactions',
      error: error.message
    });
  }
});

// Profile endpoints
app.put('/api/profile', async (req, res) => {
  try {
    const { email, ...data } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email required' });
    const updated = await User.findOneAndUpdate(
      { email },
      { $set: data },
      { new: true, upsert: true }
    );
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating profile', error: error.message });
  }
});

app.get('/api/profile', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ success: false, message: 'Email required' });
    const user = await User.findOne({ email });
    res.status(200).json({ success: true, data: user || {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching profile', error: error.message });
  }
});

// Predict interaction based on drug and food input
app.post('/api/predict', async (req, res) => {
  try {
    const { drug, food, age, weight, diseases } = req.body;

    if (!drug || !food) {
      return res.status(400).json({
        success: false,
        message: 'Drug and food are required for prediction.'
      });
    }

    const pythonRes = await axios.post('http://127.0.0.1:8000/predict', {
      drug: drug,
      food: food,
      age: age,
      weight: weight,
      diseases: diseases || []
    }, {
      timeout: 3000,
    });

    const { prediction, drug_smiles, food_smiles, disease_warnings } = pythonRes.data;

    let risk, severity, effect, advice;

    if (prediction === 2) {
      risk = 'HIGH';
      severity = 'High';
      effect = 'High risk interaction detected! Please avoid this combination.';
      advice = `Please consult your healthcare provider before combining ${drug} with ${food}.`;
    } else if (prediction === 1) {
      risk = 'MODERATE';
      severity = 'Medium';
      effect = 'Moderate interaction. Proceed with caution.';
      advice = `Please consult your healthcare provider before combining ${drug} with ${food}.`;
    } else {
      risk = 'LOW';
      severity = 'Low';
      effect = `No known significant interaction was found for ${drug} and ${food}.`;
      advice = 'This combination appears generally safe based on current records, but always consult a healthcare provider for medical advice.';
    }

    if (disease_warnings && disease_warnings.length > 0) {
      advice += ' Additional disease warnings: ' + disease_warnings.join(' | ');
    }

    const newInteraction = await Interaction.create({
      drug,
      food,
      severity,
      risk,
      effect,
      advice
    });

    return res.status(200).json({
      drug,
      food,
      risk,
      severity,
      effect,
      advice,
      drug_smiles,
      food_smiles,
      disease_warnings,
      age,
      weight,
      timestamp: new Date().toISOString(),
      id: newInteraction._id
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error predicting interaction',
      error: error.message
    });
  }
});

// Proxy for drugs and foods
app.get('/api/drugs', async (req, res) => {
  try {
    const pythonRes = await axios.get('http://127.0.0.1:8000/drugs', { timeout: 3000 });
    res.status(200).json({ drugs: pythonRes.data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching drugs', error: error.message });
  }
});

app.get('/api/foods', async (req, res) => {
  try {
    const pythonRes = await axios.get('http://127.0.0.1:8000/foods', { timeout: 3000 });
    res.status(200).json({ foods: pythonRes.data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching foods', error: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend server is running!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
  console.log(`📝 API Documentation:`);
  console.log(`   GET    http://localhost:${PORT}/api/interactions`);
  console.log(`   GET    http://localhost:${PORT}/api/interactions/:id`);
  console.log(`   POST   http://localhost:${PORT}/api/interactions`);
  console.log(`   PUT    http://localhost:${PORT}/api/interactions/:id`);
  console.log(`   DELETE http://localhost:${PORT}/api/interactions/:id`);
  console.log(`   POST   http://localhost:${PORT}/api/predict`);
  console.log(`   GET    http://localhost:${PORT}/api/search?drug=name&food=name`);
});

export default app;
