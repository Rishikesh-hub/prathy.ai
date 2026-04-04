import React, { useState, useEffect } from 'react';
import {
  getInteractions,
  createInteraction,
  updateInteraction,
  deleteInteraction,
  searchInteractions,
} from '../services/interactionApi';

const InteractionExample = () => {
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    drug: '',
    food: '',
    severity: 'Low',
    description: '',
  });

  // Fetch all interactions on component mount
  useEffect(() => {
    fetchInteractions();
  }, []);

  const fetchInteractions = async () => {
    setLoading(true);
    try {
      const response = await getInteractions();
      setInteractions(response.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch interactions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // POST: Add new interaction
  const handleAddInteraction = async (e) => {
    e.preventDefault();
    if (!formData.drug || !formData.food) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const response = await createInteraction(formData);
      setInteractions([...interactions, response.data]);
      setFormData({ drug: '', food: '', severity: 'Low', description: '' });
      alert('Interaction added successfully!');
    } catch (err) {
      alert('Failed to add interaction');
      console.error(err);
    }
  };

  // DELETE: Remove interaction
  const handleDeleteInteraction = async (id) => {
    if (!window.confirm('Are you sure you want to delete this interaction?')) {
      return;
    }

    try {
      await deleteInteraction(id);
      setInteractions(interactions.filter(i => i.id !== id));
      alert('Interaction deleted successfully!');
    } catch (err) {
      alert('Failed to delete interaction');
      console.error(err);
    }
  };

  // SEARCH: Find interactions by drug or food
  const handleSearch = async (searchTerm) => {
    if (!searchTerm) {
      fetchInteractions();
      return;
    }

    setLoading(true);
    try {
      const response = await searchInteractions(searchTerm, null);
      setInteractions(response.data || []);
    } catch (err) {
      setError('Failed to search interactions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Drug-Food Interactions Manager</h1>

      {/* Add Interaction Form */}
      <div style={{ marginBottom: '30px', border: '1px solid #ccc', padding: '20px' }}>
        <h2>Add New Interaction</h2>
        <form onSubmit={handleAddInteraction}>
          <div>
            <label>Drug Name: </label>
            <input
              type="text"
              name="drug"
              value={formData.drug}
              onChange={handleInputChange}
              placeholder="e.g., Aspirin"
              required
            />
          </div>

          <div>
            <label>Food: </label>
            <input
              type="text"
              name="food"
              value={formData.food}
              onChange={handleInputChange}
              placeholder="e.g., Alcohol"
              required
            />
          </div>

          <div>
            <label>Severity: </label>
            <select
              name="severity"
              value={formData.severity}
              onChange={handleInputChange}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>

          <div>
            <label>Description: </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter interaction details"
            />
          </div>

          <button type="submit">Add Interaction</button>
        </form>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search by drug name..."
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {/* Status Messages */}
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Interactions List */}
      <div>
        <h2>Interactions List ({interactions.length})</h2>
        {interactions.length === 0 ? (
          <p>No interactions found</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>ID</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Drug</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Food</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Severity</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Description</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {interactions.map(interaction => (
                <tr key={interaction.id}>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{interaction.id}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{interaction.drug}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{interaction.food}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor: interaction.severity === 'High' ? '#ffcccc' : '#fff3cd'
                    }}>
                      {interaction.severity}
                    </span>
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    {interaction.description}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    <button
                      onClick={() => handleDeleteInteraction(interaction.id)}
                      style={{ backgroundColor: '#ff6b6b', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default InteractionExample;
