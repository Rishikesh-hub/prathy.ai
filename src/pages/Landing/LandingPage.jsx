import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Zap, Brain, AlertTriangle, CheckCircle, ChevronRight, Pill, Leaf, Activity, Sparkles } from 'lucide-react';
import ContactModal from '../../components/Modals/ContactModal';
import './LandingPage.css';

const STATS = [
  { value: '500+', label: 'Drug interactions tracked' },
  { value: '98%', label: 'Prediction accuracy' },
  { value: '10K+', label: 'Patients protected' },
  { value: '24/7', label: 'Real-time monitoring' },
];

const FEATURES = [
  {
    icon: <Brain size={24} />,
    title: 'AI-Powered Analysis',
    desc: 'Our ML model is trained on thousands of peer-reviewed pharmacological interactions to deliver reliable, evidence-based predictions.',
    color: 'primary',
  },
  {
    icon: <AlertTriangle size={24} />,
    title: 'Instant Risk Alerts',
    desc: 'Color-coded severity levels (Low, Moderate, Severe) give you clear, immediate feedback before it\'s too late.',
    color: 'warning',
  },
  {
    icon: <Shield size={24} />,
    title: 'Patient Safety First',
    desc: 'Built with clinical guidelines in mind, helping patients and caregivers avoid dangerous drug-food combinations.',
    color: 'success',
  },
  {
    icon: <Activity size={24} />,
    title: 'Interaction History',
    desc: 'Log and review all your past interaction checks to monitor ongoing medication safety over time.',
    color: 'accent',
  },
];

const EXAMPLES = [
  { drug: 'Warfarin', food: 'Grapefruit', risk: 'HIGH', effect: 'Dramatically increases drug levels, causing dangerous bleeding.' },
  { drug: 'Atorvastatin', food: 'Grapefruit Juice', risk: 'HIGH', effect: 'Can increase statin levels 83%, risking muscle damage.' },
  { drug: 'Metformin', food: 'Alcohol', risk: 'HIGH', effect: 'Risk of life-threatening lactic acidosis.' },
  { drug: 'Levothyroxine', food: 'Coffee', risk: 'MODERATE', effect: 'Reduces drug absorption by up to 36%.' },
];

const STEPS = [
  { num: '01', title: 'Create Your Profile', desc: 'Enter your health info — age, weight, existing conditions — to personalize risk assessments.' },
  { num: '02', title: 'Enter Drug & Food', desc: 'Type the medication you\'re taking and the food you plan to consume.' },
  { num: '03', title: 'Get AI Prediction', desc: 'Our model analyzes the combination and returns a detailed interaction risk report instantly.' },
  { num: '04', title: 'Stay Safe', desc: 'Follow our clinically-informed recommendations and share the report with your doctor.' },
];

function RiskChip({ risk }) {
  const map = { HIGH: 'badge-high', MODERATE: 'badge-moderate', LOW: 'badge-low' };
  return <span className={`badge ${map[risk] || 'badge-unknown'}`}>{risk}</span>;
}

export default function LandingPage() {
  const [isContactOpen, setIsContactOpen] = useState(false);
  return (
    <div className="landing">
      {/* Background ambient */}
      <div className="app-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      {/* ── HERO ──────────────────────────────── */}
      <section className="hero">
        <div className="hero-badge animate-fade-up">
          <Sparkles size={13} /> AI-Powered Drug Safety
        </div>
        <h1 className="hero-title animate-fade-up" style={{ animationDelay: '0.1s' }}>
          Know Before You Eat.<br />
          <span className="gradient-text">Protect Every Dose.</span>
        </h1>
        <p className="hero-subtitle animate-fade-up" style={{ animationDelay: '0.2s' }}>
          Prathy.ai identifies dangerous drug–food interactions in seconds, so you can make
          informed decisions before a meal puts your medication — or your health — at risk.
        </p>
        <div className="hero-actions animate-fade-up" style={{ animationDelay: '0.3s' }}>
          <Link to="/signup" className="btn-primary btn-lg">
            Start for Free <ChevronRight size={18} />
          </Link>
          <Link to="/login" className="btn-secondary btn-lg">
            Sign In
          </Link>
        </div>

        {/* Stats Row */}
        <div className="hero-stats animate-fade-up" style={{ animationDelay: '0.45s' }}>
          {STATS.map(s => (
            <div key={s.label} className="stat-card">
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────── */}
      <section id="features" className="section">
        <div className="section-center">
          <p className="section-label">Core Capabilities</p>
          <h2 className="section-title">Everything You Need to Stay Safe</h2>
          <p className="section-subtitle">
            A complete platform designed around patient safety, evidence-based pharmacology, and intuitive experience.
          </p>
        </div>
        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <div key={f.title} className={`feature-card feature-${f.color}`} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className={`feature-icon feature-icon-${f.color}`}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── EXAMPLES ──────────────────────────── */}
      <section className="section">
        <div className="section-center">
          <p className="section-label">Real Interactions</p>
          <h2 className="section-title">Dangers Most People Don't Know About</h2>
          <p className="section-subtitle">
            These real drug-food combinations can cause serious harm. Prathy.ai catches them first.
          </p>
        </div>
        <div className="examples-grid">
          {EXAMPLES.map((ex, i) => (
            <div key={i} className="example-card">
              <div className="example-header">
                <div className="example-items">
                  <span className="example-tag tag-drug"><Pill size={12} />{ex.drug}</span>
                  <span className="example-plus">+</span>
                  <span className="example-tag tag-food"><Leaf size={12} />{ex.food}</span>
                </div>
                <RiskChip risk={ex.risk} />
              </div>
              <p className="example-effect">{ex.effect}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────── */}
      <section id="how-it-works" className="section">
        <div className="section-center">
          <p className="section-label">Simple Process</p>
          <h2 className="section-title">How Prathy.ai Works</h2>
          <p className="section-subtitle">Four steps to peace of mind with your medications.</p>
        </div>
        <div className="steps-grid">
          {STEPS.map((s, i) => (
            <div key={s.num} className="step-card">
              <div className="step-number">{s.num}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              {i < STEPS.length - 1 && <div className="step-connector" />}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────── */}
      <section className="section cta-section">
        <div className="cta-card">
          <div className="cta-icon"><CheckCircle size={32} /></div>
          <h2>Ready to Make Every Meal Safer?</h2>
          <p>Join thousands of patients who use Prathy.ai to protect their health every day.</p>
          <div className="cta-actions">
            <Link to="/signup" className="btn-primary btn-lg">
              Create Free Account <ChevronRight size={18} />
            </Link>
          </div>
          <div className="cta-social-proof">
            <div className="cta-avatars">
              {['A','B','C','D'].map(l => <div key={l} className="cta-avatar">{l}</div>)}
            </div>
            <span>Trusted by 10,000+ patients worldwide</span>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────── */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="navbar-logo-icon" style={{ width: 30, height: 30 }}><Sparkles size={14} /></div>
            <span style={{ fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>Prathy<span style={{ color: 'var(--primary)' }}>.ai</span></span>
          </div>
          <p className="footer-disclaimer">
            ⚠️ Prathy.ai is for informational purposes only and does not replace professional medical advice.
            Always consult your physician or pharmacist before making medication decisions.
          </p>
          <p className="footer-copy">© 2026 Prathy.ai. All rights reserved.</p>
          <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={() => setIsContactOpen(true)}>Contact Us</button>
        </div>
      </footer>
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </div>
  );
}
