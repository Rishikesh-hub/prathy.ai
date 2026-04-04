import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Sample database (in-memory)
let interactions = [
  {
    id: 1,
    drug: 'Aspirin',
    food: 'Alcohol',
    severity: 'High',
    description: 'Can increase risk of stomach bleeding'
  },
  {
    id: 2,
    drug: 'Metformin',
    food: 'Vitamin B12 Rich Foods',
    severity: 'Medium',
    description: 'May reduce B12 absorption'
  }
];

// GET: Fetch all interactions
app.get('/api/interactions', (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: interactions,
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
app.get('/api/interactions/:id', (req, res) => {
  try {
    const { id } = req.params;
    const interaction = interactions.find(i => i.id === parseInt(id));

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
app.post('/api/interactions', (req, res) => {
  try {
    const { drug, food, severity, description } = req.body;

    // Validation
    if (!drug || !food || !severity) {
      return res.status(400).json({
        success: false,
        message: 'Please provide drug, food, and severity'
      });
    }

    const newInteraction = {
      id: interactions.length > 0 ? Math.max(...interactions.map(i => i.id)) + 1 : 1,
      drug,
      food,
      severity,
      description: description || ''
    };

    interactions.push(newInteraction);

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
app.put('/api/interactions/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { drug, food, severity, description } = req.body;

    const interactionIndex = interactions.findIndex(i => i.id === parseInt(id));

    if (interactionIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Interaction not found'
      });
    }

    interactions[interactionIndex] = {
      ...interactions[interactionIndex],
      drug: drug || interactions[interactionIndex].drug,
      food: food || interactions[interactionIndex].food,
      severity: severity || interactions[interactionIndex].severity,
      description: description !== undefined ? description : interactions[interactionIndex].description
    };

    res.status(200).json({
      success: true,
      message: 'Interaction updated successfully',
      data: interactions[interactionIndex]
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
app.delete('/api/interactions/:id', (req, res) => {
  try {
    const { id } = req.params;
    const interactionIndex = interactions.findIndex(i => i.id === parseInt(id));

    if (interactionIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Interaction not found'
      });
    }

    const deletedInteraction = interactions.splice(interactionIndex, 1);

    res.status(200).json({
      success: true,
      message: 'Interaction deleted successfully',
      data: deletedInteraction
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
app.get('/api/search', (req, res) => {
  try {
    const { drug, food } = req.query;

    let results = interactions;

    if (drug) {
      results = results.filter(i => i.drug.toLowerCase().includes(drug.toLowerCase()));
    }

    if (food) {
      results = results.filter(i => i.food.toLowerCase().includes(food.toLowerCase()));
    }

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
  console.log(`   GET    http://localhost:${PORT}/api/search?drug=name&food=name`);
});

export default app;
