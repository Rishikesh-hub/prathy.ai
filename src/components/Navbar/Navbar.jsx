import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Activity, LogOut, User, History, LayoutDashboard, Menu, X, Pill } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => setMobileOpen(false), [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-inner">
        {/* Logo */}
        <Link to={user ? '/dashboard' : '/'} className="navbar-logo">
          <div className="navbar-logo-icon">
            <Pill size={18} />
          </div>
          <span>MedSafe<span className="logo-accent"> AI</span></span>
        </Link>

        {/* Desktop Nav */}
        <div className="navbar-links">
          {user ? (
            <>
              <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'nav-link-active' : ''}`}>
                <LayoutDashboard size={15} /> Dashboard
              </Link>
              <Link to="/history" className={`nav-link ${isActive('/history') ? 'nav-link-active' : ''}`}>
                <History size={15} /> History
              </Link>
              <Link to="/profile" className={`nav-link ${isActive('/profile') ? 'nav-link-active' : ''}`}>
                <User size={15} /> Profile
              </Link>
            </>
          ) : (
            <>
              <a href="#features" className="nav-link">Features</a>
              <a href="#how-it-works" className="nav-link">How It Works</a>
            </>
          )}
        </div>

        {/* Desktop Auth */}
        <div className="navbar-actions">
          {user ? (
            <div className="navbar-user">
              <div className="navbar-avatar">{user.name?.charAt(0)?.toUpperCase()}</div>
              <span className="navbar-username">{user.name}</span>
              <button className="btn-secondary btn-sm" onClick={handleLogout}>
                <LogOut size={14} /> Logout
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn-secondary btn-sm">Sign In</Link>
              <Link to="/signup" className="btn-primary btn-sm">Get Started</Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="navbar-mobile-toggle" onClick={() => setMobileOpen(p => !p)}>
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="navbar-mobile">
          {user ? (
            <>
              <div className="mobile-user">
                <div className="navbar-avatar">{user.name?.charAt(0)?.toUpperCase()}</div>
                <span>{user.name}</span>
              </div>
              <Link to="/dashboard" className="mobile-link">Dashboard</Link>
              <Link to="/history" className="mobile-link">History</Link>
              <Link to="/profile" className="mobile-link">Profile</Link>
              <button className="mobile-link mobile-logout" onClick={handleLogout}>
                <LogOut size={15} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="mobile-link">Sign In</Link>
              <Link to="/signup" className="btn-primary" style={{ margin: '8px 0' }}>Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
