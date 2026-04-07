import { useState, useRef } from 'react';
import { Search, Pill, Leaf, Zap, AlertTriangle, Info, RefreshCw, ChevronRight, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { interactionService } from '../../services/api';
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

function SuggestInput({ id, icon, label, value, onChange, suggestions, placeholder }) {
  const [open, setOpen] = useState(false);
  const [filtered, setFiltered] = useState([]);

  const handleChange = (e) => {
    const v = e.target.value;
    onChange(v);
    setFiltered(suggestions.filter(s => s.toLowerCase().includes(v.toLowerCase()) && v));
    setOpen(true);
  };

  const pick = (s) => { onChange(s); setOpen(false); };

  return (
    <div className="suggest-wrap">
      <label className="form-label" htmlFor={id}>{label}</label>
      <div className="input-icon-wrap">
        <span className="input-icon">{icon}</span>
        <input id={id} className="form-input input-with-icon" value={value}
          onChange={handleChange} placeholder={placeholder}
          onFocus={() => { setFiltered(suggestions.filter(s => s.toLowerCase().includes(value.toLowerCase()))); setOpen(true); }}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          autoComplete="off"
        />
      </div>
      {open && filtered.length > 0 && (
        <ul className="suggest-list">
          {filtered.slice(0,6).map(s => (
            <li key={s} className="suggest-item" onMouseDown={() => pick(s)}>
              <ChevronRight size={12} /> {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [drug, setDrug] = useState('');
  const [food, setFood] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const resultRef = useRef(null);

  const handlePredict = async (e) => {
    e?.preventDefault();
    if (!drug.trim() || !food.trim()) { setError('Please enter both a drug and a food.'); return; }
    setError('');
    setLoading(true);
    setResult(null);
    try {
      const res = await interactionService.predict(drug.trim(), food.trim());
      interactionService.saveToHistory(res);
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
              <SuggestInput id="drug-input" icon={<Pill size={16}/>} label="Medication Name"
                value={drug} onChange={setDrug} suggestions={DRUG_SUGGESTIONS} placeholder="e.g. Warfarin"/>
              <div className="predict-vs">
                <div className="vs-line"/><span className="vs-text">+</span><div className="vs-line"/>
              </div>
              <SuggestInput id="food-input" icon={<Leaf size={16}/>} label="Food / Drink"
                value={food} onChange={setFood} suggestions={FOOD_SUGGESTIONS} placeholder="e.g. Grapefruit juice"/>

              {error && <div className="predict-error"><AlertTriangle size={14}/> {error}</div>}

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
    </div>
  );
}
