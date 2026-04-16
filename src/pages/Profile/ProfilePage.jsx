import { useState } from 'react';
import { User, Heart, Save, CheckCircle, Pill } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './ProfilePage.css';

const COMMON_CONDITIONS = ['Diabetes', 'Hypertension', 'Heart Disease', 'Thyroid Disorder', 'Asthma', 'Kidney Disease', 'Liver Disease', 'Epilepsy'];
const COMMON_ALLERGIES = ['Penicillin', 'Sulfa drugs', 'NSAIDs', 'Aspirin', 'Codeine', 'Latex'];

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    age: user?.age || '',
    gender: user?.gender || '',
    weight: user?.weight || '',
    conditions: user?.conditions || [],
    allergies: user?.allergies || [],
    medications: user?.medications || '',
  });
  const [saved, setSaved] = useState(false);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const toggleTag = (field, val) =>
    setForm(p => ({
      ...p,
      [field]: p[field].includes(val) ? p[field].filter(v => v !== val) : [...p[field], val],
    }));

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, email: user?.email };
      const res = await fetch('http://localhost:5000/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        updateProfile(form);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error('Error saving profile', err);
    }
  };

  return (
    <div className="page-container">
      <div className="app-bg"><div className="orb orb-1"/><div className="orb orb-2"/></div>
      <div className="page-content" style={{ maxWidth: 720 }}>
        <div className="profile-header">
          <div className="profile-avatar-lg">{user?.name?.charAt(0)?.toUpperCase()}</div>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{user?.name}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="profile-form">
          {/* Basic Info */}
          <div className="profile-section animate-fade-up">
            <div className="ps-header"><User size={18} style={{ color:'var(--primary)' }}/><h2>Personal Information</h2></div>
            <div className="ps-grid">
              <div className="form-group">
                <label className="form-label">Age</label>
                <input id="profile-age" name="age" type="number" min="1" max="120" className="form-input"
                  placeholder="e.g. 45" value={form.age} onChange={handleChange}/>
              </div>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select id="profile-gender" name="gender" className="form-input" value={form.gender} onChange={handleChange}>
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Weight (kg)</label>
                <input id="profile-weight" name="weight" type="number" min="1" max="300" className="form-input"
                  placeholder="e.g. 72" value={form.weight} onChange={handleChange}/>
              </div>
            </div>
          </div>

          {/* Medical Conditions */}
          <div className="profile-section animate-fade-up" style={{ animationDelay:'0.1s' }}>
            <div className="ps-header"><Heart size={18} style={{ color:'var(--danger-light)' }}/><h2>Medical Conditions</h2></div>
            <p className="ps-desc">Select all that apply — this helps personalize your risk assessments.</p>
            <div className="tag-grid">
              {COMMON_CONDITIONS.map(c => (
                <button key={c} type="button"
                  className={`tag-btn ${form.conditions.includes(c) ? 'tag-btn-active' : ''}`}
                  onClick={() => toggleTag('conditions', c)}>
                  {form.conditions.includes(c) && <CheckCircle size={12}/>} {c}
                </button>
              ))}
            </div>
          </div>

          {/* Allergies */}
          <div className="profile-section animate-fade-up" style={{ animationDelay:'0.15s' }}>
            <div className="ps-header"><Pill size={18} style={{ color:'var(--warning-light)' }}/><h2>Known Drug Allergies</h2></div>
            <p className="ps-desc">Select medications you are allergic to.</p>
            <div className="tag-grid">
              {COMMON_ALLERGIES.map(a => (
                <button key={a} type="button"
                  className={`tag-btn tag-btn-warning ${form.allergies.includes(a) ? 'tag-btn-warning-active' : ''}`}
                  onClick={() => toggleTag('allergies', a)}>
                  {form.allergies.includes(a) && <CheckCircle size={12}/>} {a}
                </button>
              ))}
            </div>
          </div>

          {/* Current Medications */}
          <div className="profile-section animate-fade-up" style={{ animationDelay:'0.2s' }}>
            <div className="ps-header"><Pill size={18} style={{ color:'var(--accent-light)' }}/><h2>Current Medications</h2></div>
            <div className="form-group">
              <label className="form-label">List your medications (one per line)</label>
              <textarea id="profile-medications" name="medications" className="form-input"
                placeholder="e.g. Warfarin 5mg&#10;Lisinopril 10mg&#10;Metformin 500mg"
                rows={4} value={form.medications} onChange={handleChange}
                style={{ resize: 'vertical', minHeight: 100 }}/>
            </div>
          </div>

          <div className="profile-save-row">
            {saved && (
              <div className="save-success animate-fade-up"><CheckCircle size={16}/> Profile saved successfully!</div>
            )}
            <button id="save-profile" type="submit" className="btn-primary">
              <Save size={16}/> Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
