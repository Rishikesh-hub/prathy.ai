import { useState, useEffect } from 'react';
import { History, Trash2, Search, AlertTriangle, CheckCircle, AlertCircle, HelpCircle, Filter } from 'lucide-react';
import { getHistory } from '../../services/api';
import InteractionCard from '../../components/Interaction/InteractionCard';
import './HistoryPage.css';

const RISK_ICONS = {
  HIGH: <AlertTriangle size={14} style={{ color:'var(--danger-light)' }}/>,
  MODERATE: <AlertCircle size={14} style={{ color:'var(--warning-light)' }}/>,
  LOW: <CheckCircle size={14} style={{ color:'var(--success-light)' }}/>,
  UNKNOWN: <HelpCircle size={14} style={{ color:'#a78bfa' }}/>,
};
const RISK_BADGE = { HIGH:'badge-high', MODERATE:'badge-moderate', LOW:'badge-low', UNKNOWN:'badge-unknown' };

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    getHistory().then(h => { setHistory(h); setLoading(false); });
  }, []);

  const clearHistory = () => {
    localStorage.removeItem('prathy_history');
    setHistory([]);
    setExpanded(null);
  };

  const filtered = history.filter(h => {
    const matchFilter = filter === 'ALL' || h.risk === filter;
    const matchSearch = !search || 
      h.drug?.toLowerCase().includes(search.toLowerCase()) ||
      h.food?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const counts = history.reduce((acc, h) => { acc[h.risk] = (acc[h.risk] || 0) + 1; return acc; }, {});

  return (
    <div className="page-container">
      <div className="app-bg"><div className="orb orb-1"/><div className="orb orb-2"/></div>
      <div className="page-content">
        <div className="history-header">
          <div>
            <p className="section-label"><History size={12}/> Interaction Log</p>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: 6 }}>Check History</h1>
            <p style={{ color:'var(--text-secondary)', fontSize:'0.9rem', marginTop:6 }}>
              {history.length} interaction{history.length !== 1 ? 's' : ''} recorded
            </p>
          </div>
          {history.length > 0 && (
            <button className="btn-danger btn-sm" onClick={clearHistory}><Trash2 size={14}/> Clear All</button>
          )}
        </div>

        {/* Stats Row */}
        {history.length > 0 && (
          <div className="history-stats animate-fade-up">
            {['HIGH','MODERATE','LOW'].map(r => (
              <div key={r} className={`hstat ${r.toLowerCase()}-stat`}>
                {RISK_ICONS[r]}
                <span className="hstat-count">{counts[r] || 0}</span>
                <span className="hstat-label">{r === 'HIGH' ? 'Severe' : r === 'MODERATE' ? 'Moderate' : 'Low'}</span>
              </div>
            ))}
          </div>
        )}

        {/* Controls */}
        {history.length > 0 && (
          <div className="history-controls animate-fade-up" style={{ animationDelay:'0.1s' }}>
            <div className="input-icon-wrap" style={{ flex:1, maxWidth:320 }}>
              <Search size={15} className="input-icon"/>
              <input className="form-input input-with-icon" placeholder="Search drug or food…"
                value={search} onChange={e => setSearch(e.target.value)} style={{ height:40 }}/>
            </div>
            <div className="filter-tabs">
              {['ALL','HIGH','MODERATE','LOW'].map(f => (
                <button key={f} className={`filter-tab ${filter === f ? 'filter-tab-active' : ''}`}
                  onClick={() => setFilter(f)}>
                  {f !== 'ALL' && RISK_ICONS[f]} {f === 'ALL' ? 'All' : f === 'HIGH' ? 'Severe' : f === 'MODERATE' ? 'Moderate' : 'Low'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* List */}
        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:60 }}><div className="spinner-lg"/></div>
        ) : filtered.length === 0 ? (
          <div className="history-empty animate-fade-up">
            <History size={48} style={{ color:'var(--text-muted)', margin:'0 auto 16px' }}/>
            <h2>No history found</h2>
            <p>{history.length === 0
              ? 'Your interaction checks will appear here after you use the Dashboard.'
              : 'No matches for your current filter. Try adjusting the search or filter.'}
            </p>
          </div>
        ) : (
          <div className="history-list">
            {filtered.map((item, i) => (
              <div key={item.id} className="animate-fade-up" style={{ animationDelay:`${i * 0.05}s` }}>
                {expanded === item.id ? (
                  <div>
                    <button className="history-collapse-btn" onClick={() => setExpanded(null)}>
                      ↑ Collapse
                    </button>
                    <InteractionCard result={item}/>
                  </div>
                ) : (
                  <div className="history-row" onClick={() => setExpanded(item.id)}>
                    <div className="hr-left">
                      {RISK_ICONS[item.risk]}
                      <span className="hr-drug">{item.drug}</span>
                      <span className="hr-sep">+</span>
                      <span className="hr-food">{item.food}</span>
                    </div>
                    <div className="hr-right">
                      <span className={`badge ${RISK_BADGE[item.risk] || 'badge-unknown'}`}>{item.severity || item.risk}</span>
                      <span className="hr-time">{new Date(item.timestamp).toLocaleDateString('en-US', { month:'short', day:'numeric' })}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
