import { useState, useRef, useEffect } from 'react';
import { Search, Pill, Leaf, Zap, AlertTriangle, Info, RefreshCw, ChevronRight, Clock, MessageSquareWarning } from 'lucide-react';
import FeedbackModal from '../../components/Modals/FeedbackModal';
import { useAuth } from '../../context/AuthContext';
import { predictInteraction, getDrugs, getFoods, saveToHistory } from '../../services/api';
import InteractionCard from '../../components/Interaction/InteractionCard';
import './Dashboard.css';

const DRUG_SUGGESTIONS = ['Warfarin', 'Atorvastatin', 'Metformin', 'Lisinopril', 'Aspirin', 'Levothyroxine', 'Simvastatin', 'Amlodipine', 'Omeprazole', 'Sertraline'];
const FOOD_SUGGESTIONS = ['Grapefruit', 'Alcohol', 'Spinach', 'Bananas', 'Coffee', 'Dairy', 'Soy', 'Walnuts', 'Cranberry', 'Ginger', 'Salt substitute', 'Refined sugar'];

const RECENT_EXAMPLES = [
  { drug: 'Warfarin', food: 'Grapefruit' },
  { drug: 'Metformin', food: 'Alcohol' },
  { drug: 'Levothyroxine', food: 'Coffee' },
  { drug: 'Lisinopril', food: 'Bananas' },
];

// Removed SuggestInput component as we are using native datalist

export default function Dashboard() {
  const { user } = useAuth();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [drug, setDrug] = useState('');
  const [food, setFood] = useState('');
  const [age, setAge] = useState(user?.age || '');
  const [weight, setWeight] = useState(user?.weight || '');
  const [diseases, setDiseases] = useState(user?.conditions?.join(', ') || '');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [drugOptions, setDrugOptions] = useState(DRUG_SUGGESTIONS);
  const [foodOptions, setFoodOptions] = useState(FOOD_SUGGESTIONS);
  const resultRef = useRef(null);

  useEffect(() => {
    getDrugs()
      .then(data => setDrugOptions(data))
      .catch(err => console.error('Error fetching drugs', err));
      
    getFoods()
      .then(data => setFoodOptions(data))
      .catch(err => console.error('Error fetching foods', err));
  }, []);

  useEffect(() => {
    if (user?.age) setAge(user.age);
    if (user?.weight) setWeight(user.weight);
    if (user?.conditions) setDiseases(user.conditions.join(', '));
  }, [user]);

  const handlePredict = async (e) => {
    e?.preventDefault();
    if (!drug.trim() || !food.trim()) { setError('Please enter both a drug and a food.'); return; }
    if (!age || !weight) { setError('Age and Weight are required.'); return; }
    setError('');
    setLoading(true);
    setResult(null);
    try {
      const diseasesList = diseases.split(',').map(d => d.trim()).filter(d => d);
      const res = await predictInteraction(drug.trim(), food.trim(), parseInt(age, 10), parseFloat(weight), diseasesList);
      saveToHistory(res);
      setResult(res);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
    } catch (err) {
      console.error('Prediction error:', err);
      setError(err.message || 'Prediction failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const tryExample = (ex) => { setDrug(ex.drug); setFood(ex.food); setResult(null); };
  const handleReset = () => { setDrug(''); setFood(''); setResult(null); setError(''); };

  return (
    <div className="page-container">
      <div className="app-bg"><div className="orb orb-1"/><div className="orb orb-2"/><div className="orb orb-3"/></div>

      <div className="page-content dashboard-layout">
        {/* ── LEFT PANEL ── */}
        <div className="dashboard-main">
          <div className="dashboard-header">
            <div>
              <p className="section-label"><Zap size={12}/> AI Predictor</p>
              <h1 className="dashboard-greeting">
                Hello, {user?.name?.split(' ')[0] || 'there'} 👋
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginTop: 6 }}>
                Enter a medication and food below to check for interactions.
              </p>
            </div>
          </div>

          {/* Input Card */}
          <div className="predict-card animate-fade-up">
            <form onSubmit={handlePredict} className="predict-form">
              <div className="form-group">
                <label className="form-label" htmlFor="drug-input">Medication Name</label>
                <div className="input-icon-wrap">
                  <span className="input-icon"><Pill size={16}/></span>
                  <input list="drug-datalist" id="drug-input" className="form-input input-with-icon" value={drug}
                    onChange={(e) => setDrug(e.target.value)} placeholder="e.g. Warfarin" autoComplete="off" />
                  <datalist id="drug-datalist">
                    {drugOptions.map((opt, idx) => <option key={idx} value={opt} />)}
                  </datalist>
                </div>
              </div>

              <div className="predict-vs">
                <div className="vs-line"/><span className="vs-text">+</span><div className="vs-line"/>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="food-input">Food / Drink</label>
                <div className="input-icon-wrap">
                  <span className="input-icon"><Leaf size={16}/></span>
                  <input list="food-datalist" id="food-input" className="form-input input-with-icon" value={food}
                    onChange={(e) => setFood(e.target.value)} placeholder="e.g. Grapefruit" autoComplete="off" />
                  <datalist id="food-datalist">
                    {foodOptions.map((opt, idx) => <option key={idx} value={opt} />)}
                  </datalist>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label" style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', fontWeight: 600 }}>Age</label>
                  <input type="number" className="form-input" value={age} onChange={e => setAge(e.target.value)} placeholder="e.g. 45" required />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label" style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', fontWeight: 600 }}>Weight (kg)</label>
                  <input type="number" className="form-input" value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. 70" required />
                </div>
              </div>
              
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label" style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', fontWeight: 600 }}>Diseases / Conditions (comma separated)</label>
                <input type="text" className="form-input" value={diseases} onChange={e => setDiseases(e.target.value)} placeholder="e.g. diabetes, hypertension" />
              </div>

              {error && (
                <div className="predict-error">
                  <AlertTriangle size={14}/> {error}
                  <div style={{ marginTop: '8px' }}>
                    <button type="button" className="btn-secondary btn-sm mt-2" onClick={() => setIsFeedbackOpen(true)} style={{ display: 'sm-flex', alignItems: 'center', gap: '4px', background: 'transparent' }}>
                      <MessageSquareWarning size={14} style={{ marginRight: '4px' }}/> Report missing item
                    </button>
                  </div>
                </div>
              )}

              <div className="predict-actions">
                <button id="predict-btn" type="submit" className="btn-primary predict-btn" disabled={loading}>
                  {loading
                    ? <><span className="spinner"/> Analyzing…</>
                    : <><Search size={16}/> Check Interaction</>}
                </button>
                {(drug || food || result) && (
                  <button type="button" className="btn-secondary" onClick={handleReset}>
                    <RefreshCw size={15}/> Reset
                  </button>
                )}
              </div>
            </form>

            {/* Loading State */}
            {loading && (
              <div className="predict-loading">
                <div className="loading-orb"/>
                <div>
                  <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>AI is analyzing the interaction…</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Cross-referencing pharmacological database</p>
                </div>
              </div>
            )}
          </div>

          {/* Result */}
          {result && !loading && (
            <div ref={resultRef} className="animate-fade-up" style={{ animationDelay: '0.1s' }}>
              <InteractionCard result={result}/>
              <button type="button" className="btn-secondary btn-sm mt-4" onClick={() => setIsFeedbackOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MessageSquareWarning size={14}/> Provide Feedback on this Report
              </button>
            </div>
          )}

          {/* Info banner */}
          {!result && !loading && (
            <div className="info-banner animate-fade-up" style={{ animationDelay: '0.2s' }}>
              <Info size={16} style={{ color:'var(--primary)', flexShrink:0 }}/>
              <p>Prathy.ai uses pharmacological data to detect interactions. Always consult your pharmacist for clinical decisions.</p>
            </div>
          )}
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="dashboard-sidebar">
          <div className="sidebar-card">
            <div className="sidebar-card-header">
              <Clock size={15} style={{ color:'var(--primary)' }}/>
              <span>Quick Examples</span>
            </div>
            <p className="sidebar-desc">Click to auto-fill and test a known interaction:</p>
            <div className="examples-list">
              {RECENT_EXAMPLES.map((ex, i) => (
                <button key={i} className="example-btn" onClick={() => tryExample(ex)}>
                  <div className="example-btn-content">
                    <span className="example-drug"><Pill size={11}/>{ex.drug}</span>
                    <span style={{ color:'var(--text-muted)', fontSize:'0.75rem' }}>+</span>
                    <span className="example-food"><Leaf size={11}/>{ex.food}</span>
                  </div>
                  <ChevronRight size={13} style={{ color:'var(--text-muted)', flexShrink:0 }}/>
                </button>
              ))}
            </div>
          </div>

          {/* Drug list hint */}
          <div className="sidebar-card">
            <div className="sidebar-card-header">
              <Pill size={15} style={{ color:'var(--primary)' }}/>
              <span>Supported Drugs</span>
            </div>
            <div className="drug-tags">
              {DRUG_SUGGESTIONS.map(d => (
                <button key={d} className="drug-tag" onClick={() => setDrug(d)}>{d}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} initialDrug={drug} initialFood={food} />
    </div>
  );
}
