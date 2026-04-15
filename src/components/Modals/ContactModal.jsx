import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import axios from 'axios';

export default function ContactModal({ isOpen, onClose }) {
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState(''); // 'loading', 'success', 'error'

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await axios.post('/api/messages', { type: 'Contact', ...formState });
      setStatus('success');
      setTimeout(() => {
        setStatus('');
        setFormState({ name: '', email: '', message: '' });
        onClose();
      }, 2000);
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-backdrop" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <motion.div 
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
            className="modal-content"
            style={{
              background: 'var(--bg)', padding: '2rem', borderRadius: '12px',
              width: '90%', maxWidth: '400px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              position: 'relative', border: '1px solid var(--border)'
            }}
          >
            <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}>
              <X size={20} />
            </button>
            <h2 style={{ marginBottom: '1rem', marginTop: 0, color: 'var(--text-primary)' }}>Contact Us</h2>
            
            {status === 'success' ? (
              <div style={{ color: 'var(--success)', textAlign: 'center', padding: '2rem 0' }}>Message sent successfully!</div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px', color: 'var(--text-primary)' }}>Name</label>
                  <input required value={formState.name} onChange={e => setFormState({...formState, name: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid var(--border)', borderRadius: '6px', background: 'var(--bg)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px', color: 'var(--text-primary)' }}>Email</label>
                  <input type="email" required value={formState.email} onChange={e => setFormState({...formState, email: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid var(--border)', borderRadius: '6px', background: 'var(--bg)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px', color: 'var(--text-primary)' }}>Message</label>
                  <textarea required value={formState.message} onChange={e => setFormState({...formState, message: e.target.value})} rows={4} style={{ width: '100%', padding: '10px', border: '1px solid var(--border)', borderRadius: '6px', background: 'var(--bg)', color: 'var(--text-primary)', resize: 'vertical' }} />
                </div>
                {status === 'error' && <div style={{ color: 'var(--high-risk)', fontSize: '0.85rem' }}>Failed to send message.</div>}
                <button type="submit" disabled={status === 'loading'} className="btn-primary" style={{ marginTop: '0.5rem', width: '100%' }}>
                  {status === 'loading' ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
