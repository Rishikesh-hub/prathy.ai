import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/api';
import './AuthPages.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      const { user, token } = await authService.login(form.email, form.password);
      login(user, token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="app-bg"><div className="orb orb-1"/><div className="orb orb-2"/></div>
      <div className="auth-card animate-fade-up">
        <div className="auth-logo">
          <div className="navbar-logo-icon"><Sparkles size={16}/></div>
          <span>Prathy<span className="logo-accent">.ai</span></span>
        </div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to check drug–food interactions</p>

        {error && (
          <div className="auth-error">
            <AlertCircle size={15}/> {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email address</label>
            <div className="input-icon-wrap">
              <Mail size={16} className="input-icon"/>
              <input id="login-email" name="email" type="email" className="form-input input-with-icon"
                placeholder="you@example.com" value={form.email} onChange={handleChange} autoComplete="email"/>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-icon-wrap">
              <Lock size={16} className="input-icon"/>
              <input id="login-password" name="password" type={showPwd ? 'text' : 'password'}
                className="form-input input-with-icon input-with-end-icon"
                placeholder="••••••••" value={form.password} onChange={handleChange} autoComplete="current-password"/>
              <button type="button" className="input-end-icon" onClick={() => setShowPwd(p=>!p)}>
                {showPwd ? <EyeOff size={15}/> : <Eye size={15}/>}
              </button>
            </div>
          </div>
          <button id="login-submit" type="submit" className="btn-primary auth-submit" disabled={loading}>
            {loading ? <><span className="spinner"/>&nbsp;Signing in…</> : 'Sign In'}
          </button>
        </form>

        <div className="auth-divider"><span>or try a demo</span></div>
        <button className="btn-secondary auth-demo" onClick={() => { setForm({ email: 'demo@prathy.ai', password: 'demo1234' }); }}>
          Fill Demo Credentials
        </button>

        <p className="auth-footer-text">
          Don't have an account? <Link to="/signup" className="auth-link">Sign up free</Link>
        </p>
      </div>
    </div>
  );
}
