import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/api';
import './AuthPages.css';

export default function SignupPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.password) { setError('All fields are required.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      const { user, token } = await authService.signup(form.name, form.email, form.password);
      login(user, token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const strength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3;
  const strengthLabel = ['', 'Weak', 'Good', 'Strong'];
  const strengthColor = ['', 'var(--danger)', 'var(--warning)', 'var(--success)'];

  return (
    <div className="auth-page">
      <div className="app-bg"><div className="orb orb-1"/><div className="orb orb-2"/></div>
      <div className="auth-card animate-fade-up">
        <div className="auth-logo">
          <div className="navbar-logo-icon"><Sparkles size={16}/></div>
          <span>Prathy<span className="logo-accent">.ai</span></span>
        </div>
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Start checking drug–food interactions for free</p>

        {error && <div className="auth-error"><AlertCircle size={15}/> {error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full name</label>
            <div className="input-icon-wrap">
              <User size={16} className="input-icon"/>
              <input id="signup-name" name="name" type="text" className="form-input input-with-icon"
                placeholder="John Smith" value={form.name} onChange={handleChange} autoComplete="name"/>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email address</label>
            <div className="input-icon-wrap">
              <Mail size={16} className="input-icon"/>
              <input id="signup-email" name="email" type="email" className="form-input input-with-icon"
                placeholder="you@example.com" value={form.email} onChange={handleChange} autoComplete="email"/>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-icon-wrap">
              <Lock size={16} className="input-icon"/>
              <input id="signup-password" name="password" type={showPwd ? 'text' : 'password'}
                className="form-input input-with-icon input-with-end-icon"
                placeholder="Min. 6 characters" value={form.password} onChange={handleChange} autoComplete="new-password"/>
              <button type="button" className="input-end-icon" onClick={() => setShowPwd(p=>!p)}>
                {showPwd ? <EyeOff size={15}/> : <Eye size={15}/>}
              </button>
            </div>
            {form.password && (
              <div className="pwd-strength">
                <div className="pwd-strength-bar">
                  {[1,2,3].map(i => (
                    <div key={i} className="pwd-bar-segment" style={{ background: i <= strength ? strengthColor[strength] : '#E8E8E8' }}/>
                  ))}
                </div>
                <span style={{ color: strengthColor[strength], fontSize:'0.78rem', fontWeight: 500 }}>{strengthLabel[strength]}</span>
              </div>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Confirm password</label>
            <div className="input-icon-wrap">
              <Lock size={16} className="input-icon"/>
              <input id="signup-confirm" name="confirm" type="password"
                className="form-input input-with-icon"
                placeholder="••••••••" value={form.confirm} onChange={handleChange} autoComplete="new-password"/>
              {form.confirm && (
                <div className="input-end-icon" style={{ pointerEvents:'none' }}>
                  {form.confirm === form.password
                    ? <CheckCircle size={15} style={{ color: 'var(--success)' }}/>
                    : <AlertCircle size={15} style={{ color: 'var(--danger)' }}/>}
                </div>
              )}
            </div>
          </div>
          <button id="signup-submit" type="submit" className="btn-primary auth-submit" disabled={loading}>
            {loading ? <><span className="spinner"/>&nbsp;Creating account…</> : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer-text">
          Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
