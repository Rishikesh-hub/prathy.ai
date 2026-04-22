import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import mongoose from 'mongoose';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ── MongoDB Connection ──────────────────────────────────────
const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error('❌ FATAL: MONGO_URI is not defined in backend/.env');
    process.exit(1);
  }
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ FATAL: MongoDB connection error:', err.message);
    process.exit(1);
  }
};
connectDB();

// ── Schemas ─────────────────────────────────────────────────
const interactionSchema = new mongoose.Schema({
  drug: String, food: String, risk: String,
  severity: String, effect: String, advice: String,
  age: Number, weight: Number,
  createdAt: { type: Date, default: Date.now },
});
const Interaction = mongoose.model('Interaction', interactionSchema);

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  name: String, age: Number, weight: Number,
  gender: String, conditions: [String],
  allergies: [String], medications: String,
});
const User = mongoose.model('User', userSchema);

// FIX: Added Feedback schema (FeedbackModal was posting here but route didn't exist)
const feedbackSchema = new mongoose.Schema({
  type: String, name: String, email: String,
  drug: String, food: String, message: String,
  createdAt: { type: Date, default: Date.now },
});
const Feedback = mongoose.model('Feedback', feedbackSchema);

// ── Root ────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.status(200).send(`<h1>Prathy.ai API</h1><p>Running on port ${PORT}</p>`);
});

// ── Auth (minimal, stores real users in MongoDB) ─────────────
app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ success: false, message: 'All fields required' });
  try {
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ success: false, message: 'Email already registered' });
    const user = await User.create({ name, email });
    const token = 'tok_' + Buffer.from(email).toString('base64');
    res.json({ user: { id: user._id, name, email, conditions: [], allergies: [] }, token });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email } = req.body;
  if (!email)
    return res.status(400).json({ success: false, message: 'Email required' });
  try {
    let user = await User.findOne({ email });
    if (!user) {
      const name = email.split('@')[0].replace(/[._]/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
      user = await User.create({ name, email });
    }
    const token = 'tok_' + Buffer.from(email).toString('base64');
    res.json({
      user: {
        id: user._id, name: user.name, email,
        age: user.age, weight: user.weight,
        conditions: user.conditions || [],
        allergies: user.allergies || [],
        medications: user.medications || '',
      },
      token,
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ── Profile ──────────────────────────────────────────────────
app.put('/api/profile', async (req, res) => {
  try {
    const { email, ...data } = req.body;
    if (!email)
      return res.status(400).json({ success: false, message: 'Email required' });
    const updated = await User.findOneAndUpdate(
      { email }, { $set: data }, { new: true, upsert: true }
    );
    res.json({ success: true, data: updated });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.get('/api/profile', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email)
      return res.status(400).json({ success: false, message: 'Email required' });
    const user = await User.findOne({ email });
    res.json({ success: true, data: user || {} });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ── Interactions CRUD ────────────────────────────────────────
app.get('/api/interactions', async (req, res) => {
  try {
    const data = await Interaction.find().sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.get('/api/interactions/:id', async (req, res) => {
  try {
    const item = await Interaction.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: item });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.delete('/api/interactions/:id', async (req, res) => {
  try {
    await Interaction.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ── Predict ──────────────────────────────────────────────────
app.post('/api/predict', async (req, res) => {
  try {
    const { drug, food, age, weight, diseases } = req.body;
    if (!drug || !food)
      return res.status(400).json({ success: false, message: 'Drug and food are required.' });

    const pythonRes = await axios.post('http://127.0.0.1:8000/predict', {
      drug, food,
      age: age || 30,
      weight: weight || 70,
      diseases: diseases || [],
    }, { timeout: 10000 });

    const { prediction, drug_smiles, food_smiles, disease_warnings } = pythonRes.data;

    // FIX: Model has 5 classes (0–4), not 3. Map all 5 correctly.
    const riskMap = {
      0: { risk: 'LOW',      severity: 'Low',    effect: `No significant interaction found for ${drug} and ${food}.` },
      1: { risk: 'LOW',      severity: 'Low',    effect: `Minimal interaction detected. Generally safe to combine.` },
      2: { risk: 'MODERATE', severity: 'Medium', effect: `Moderate interaction detected. Use with caution.` },
      3: { risk: 'MODERATE', severity: 'Medium', effect: `Moderate-high interaction. Monitor closely and consult your doctor.` },
      4: { risk: 'HIGH',     severity: 'High',   effect: `High risk interaction detected! Avoid combining ${drug} with ${food}.` },
    };
    const mapped = riskMap[prediction] ?? riskMap[0];
    const { risk, severity, effect } = mapped;

    let advice = `Consult your healthcare provider before combining ${drug} with ${food}.`;
    if (disease_warnings && disease_warnings.length > 0) {
      advice += ' Disease warnings: ' + disease_warnings.join(' | ');
    }

    // Save to MongoDB
    const saved = await Interaction.create({
      drug, food, severity, risk, effect, advice, age, weight,
    });

    return res.json({
      drug, food, risk, severity, effect, advice,
      drug_smiles, food_smiles, disease_warnings,
      age, weight,
      timestamp: new Date().toISOString(),
      id: saved._id,
    });
  } catch (error) {
    if (error.response?.data?.detail) {
      return res.status(400).json({
        success: false,
        message: error.response.data.detail,
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── Drug/Food proxy lists ────────────────────────────────────
app.get('/api/drugs', async (req, res) => {
  try {
    const r = await axios.get('http://127.0.0.1:8000/drugs', { timeout: 5000 });
    res.json({ drugs: r.data });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Could not fetch drugs from Python API.' });
  }
});

app.get('/api/foods', async (req, res) => {
  try {
    const r = await axios.get('http://127.0.0.1:8000/foods', { timeout: 5000 });
    res.json({ foods: r.data });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Could not fetch foods from Python API.' });
  }
});

// FIX: Added /api/messages — FeedbackModal posts here but route was missing
app.post('/api/messages', async (req, res) => {
  try {
    await Feedback.create(req.body);
    res.json({ success: true, message: 'Feedback received. Thank you!' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ── Health ───────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'Prathy.ai backend running', mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

export default app;
