import { Pill, Leaf, AlertTriangle, CheckCircle, AlertCircle, HelpCircle, Clock, Copy, Share2 } from 'lucide-react';
import './InteractionCard.css';

const RISK_CONFIG = {
  HIGH: {
    label: 'Severe Risk',
    icon: <AlertTriangle size={22}/>,
    badgeClass: 'badge-high',
    cardClass: 'card-high',
    barWidth: '100%',
    barColor: 'var(--danger)',
    glow: 'var(--shadow-glow-danger)',
  },
  MODERATE: {
    label: 'Moderate Risk',
    icon: <AlertCircle size={22}/>,
    badgeClass: 'badge-moderate',
    cardClass: 'card-moderate',
    barWidth: '66%',
    barColor: 'var(--warning)',
    glow: '0 0 30px rgba(245,158,11,0.2)',
  },
  LOW: {
    label: 'Low Risk',
    icon: <CheckCircle size={22}/>,
    badgeClass: 'badge-low',
    cardClass: 'card-low',
    barWidth: '33%',
    barColor: 'var(--success)',
    glow: '0 0 30px rgba(16,185,129,0.2)',
  },
  UNKNOWN: {
    label: 'Unknown',
    icon: <HelpCircle size={22}/>,
    badgeClass: 'badge-unknown',
    cardClass: 'card-unknown',
    barWidth: '50%',
    barColor: 'var(--unknown)',
    glow: '0 0 30px rgba(139,92,246,0.2)',
  },
};

function formatTime(iso) {
  return new Date(iso).toLocaleString('en-US', { month:'short', day:'numeric', hour:'numeric', minute:'2-digit', hour12:true });
}

export default function InteractionCard({ result }) {
  const cfg = RISK_CONFIG[result.risk] || RISK_CONFIG.UNKNOWN;

  const copyReport = () => {
    const text = `MedSafe AI — Interaction Report\nDrug: ${result.drug}\nFood: ${result.food}\nRisk: ${cfg.label}\nEffect: ${result.effect}\nAdvice: ${result.advice}`;
    navigator.clipboard.writeText(text).catch(() => {});
  };

  return (
    <div className={`interaction-card glass ${cfg.cardClass} animate-fade-up`} style={{ boxShadow: cfg.glow }}>
      {/* Header */}
      <div className="ic-header">
        <div className={`ic-risk-icon risk-icon-${result.risk?.toLowerCase()}`}>
          {cfg.icon}
        </div>
        <div className="ic-header-text">
          <div className="ic-pair">
            <span className="ic-drug"><Pill size={12}/>{result.drug}</span>
            <span className="ic-plus">+</span>
            <span className="ic-food"><Leaf size={12}/>{result.food}</span>
          </div>
          <div className="ic-severity-row">
            <span className={`badge ${cfg.badgeClass}`}>{cfg.label}</span>
            <span className="ic-timestamp"><Clock size={11}/>{formatTime(result.timestamp)}</span>
          </div>
        </div>
        <div className="ic-actions">
          <button className="ic-action-btn" title="Copy report" onClick={copyReport}>
            <Copy size={14}/>
          </button>
        </div>
      </div>

      {/* Risk bar */}
      <div className="ic-bar-wrap">
        <div className="ic-bar-labels">
          <span>Low</span><span>Moderate</span><span>Severe</span>
        </div>
        <div className="ic-bar-track">
          <div className="ic-bar-fill" style={{ width: cfg.barWidth, background: cfg.barColor }}/>
          <div className="ic-bar-marker" style={{ left: cfg.barWidth, background: cfg.barColor }}/>
        </div>
      </div>

      <div className="ic-divider"/>

      {/* Body */}
      <div className="ic-body">
        <div className="ic-section">
          <h3 className="ic-section-title">⚗️ What Happens</h3>
          <p className="ic-text">{result.effect}</p>
        </div>
        <div className="ic-section">
          <h3 className="ic-section-title">✅ What To Do</h3>
          <p className="ic-text">{result.advice}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="ic-footer">
        <span className="ic-disclaimer">
          ⚠️ For informational use only. Consult your pharmacist or physician before acting on this information.
        </span>
      </div>
    </div>
  );
}
