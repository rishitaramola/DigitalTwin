import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, GitBranch, Dna, Ghost, Trophy, Activity, Shield, MessageSquare, LogOut, User, AlertTriangle, X, Lock, UserMinus, UserX
} from 'lucide-react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Live Twin', description: 'Real-time state' },
  { to: '/simulation', icon: GitBranch, label: 'Run Simulation', description: 'What if?' },
  { to: '/shadow-self', icon: Ghost, label: 'Shadow Self', description: 'Focused vs Distracted' },
  { to: '/habit-dna', icon: Dna, label: 'Habit DNA', description: 'Weekly narrative report' },
  { to: '/success-archaeology', icon: Trophy, label: 'Success Archaeology', description: 'Mine your best days' },
  { to: '/chat', icon: MessageSquare, label: 'AI Clone Chat', description: 'Talk to your twin' },
]

export default function Sidebar() {
  const { user, logout, token } = useAuth()
  const navigate = useNavigate()

  // Account Settings Modals
  const [modalState, setModalState] = useState(null) // null | 'deactivate' | 'delete_confirm' | 'delete_password'
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleDeactivate = async () => {
    if (!password) { setError('Password is required'); return }
    setProcessing(true)
    try {
      await axios.post('/api/auth/deactivate', { password }, { headers: { Authorization: `Bearer ${token}` } })
      handleLogout()
    } catch (err) {
      setError(err.response?.data?.detail || 'Incorrect password.')
      setProcessing(false)
    }
  }

  const handleDelete = async () => {
    if (!password) { setError('Password is required'); return }
    setProcessing(true)
    try {
      await axios.post('/api/auth/delete', { password }, { headers: { Authorization: `Bearer ${token}` } })
      handleLogout()
    } catch (err) {
      setError(err.response?.data?.detail || 'Incorrect password.')
      setProcessing(false)
    }
  }

  // Get initials for avatar
  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : '?'

  const ModalOverlay = ({ children, title, subtitle }) => (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999,
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: '#0e0e1c', border: '1px solid var(--border)', borderRadius: '16px', padding: '30px',
        width: '100%', maxWidth: '400px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', position: 'relative'
      }}>
        <button onClick={() => { setModalState(null); setPassword(''); setError('') }} style={{
          position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer'
        }}>
          <X size={20} />
        </button>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(244,63,94,0.1)', borderRadius: '50%', marginBottom: '16px' }}>
            <AlertTriangle size={28} color="#fb7185" />
          </div>
          <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'white' }}>{title}</h2>
          <p style={{ margin: '8px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{subtitle}</p>
        </div>
        
        {error && <div style={{ padding: '10px', background: 'rgba(244,63,94,0.1)', color: '#fb7185', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '15px', textAlign: 'center', border: '1px solid rgba(244,63,94,0.3)' }}>{error}</div>}
        
        {children}
      </div>
    </div>
  )

  return (
    <>
      <aside style={{ position: 'fixed', top: 0, left: 0, width: 'var(--sidebar-width)', height: '100vh', background: 'rgba(10, 10, 22, 0.92)', backdropFilter: 'blur(20px)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', padding: '24px 16px', zIndex: 100, boxShadow: '4px 0 40px rgba(0,0,0,0.4)' }}>
        {/* Logo */}
        <div style={{ marginBottom: '36px', paddingLeft: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{ width: '34px', height: '34px', background: 'linear-gradient(135deg, var(--violet), var(--cyan))', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px var(--violet-glow)', flexShrink: 0 }}>
              <Activity size={18} color="white" />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.2 }}>Digital Twin</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 500 }}>of You</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '3px 8px', borderRadius: '100px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', width: 'fit-content' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--emerald)', animation: 'glow-pulse 2s infinite' }} />
            <span style={{ fontSize: '0.65rem', color: '#34d399', fontWeight: 600 }}>TWIN ACTIVE</span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--text-muted)', padding: '0 8px', marginBottom: '8px', textTransform: 'uppercase' }}>Modules</div>
          {navItems.map(({ to, icon: Icon, label, description }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '10px', textDecoration: 'none', transition: 'all 0.2s', background: isActive ? 'rgba(124,58,237,0.15)' : 'transparent', border: `1px solid ${isActive ? 'rgba(124,58,237,0.35)' : 'transparent'}`, color: isActive ? 'var(--violet-light)' : 'var(--text-secondary)' })}>
              {({ isActive }) => (
                <>
                  <Icon size={17} style={{ flexShrink: 0, color: isActive ? 'var(--violet-light)' : 'var(--text-muted)' }} />
                  <div>
                    <div style={{ fontSize: '0.83rem', fontWeight: 600, lineHeight: 1.2 }}>{label}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: 1 }}>{description}</div>
                  </div>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer — user info + account actions */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', borderRadius: '10px', background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.18)', marginBottom: '4px' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0, background: 'linear-gradient(135deg, var(--violet), var(--cyan))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, color: 'white' }}>{initials}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.username}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
              </div>
            </div>
          )}

          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '8px', background: 'transparent', border: '1px solid var(--border)', color: 'white', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, width: '100%', transition: 'all 0.2s' }}>
            <LogOut size={14} color="var(--text-muted)" /> Sign Out
          </button>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={() => setModalState('deactivate')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', borderRadius: '8px', background: 'rgba(245,158,11,0.05)', border: '1px dashed rgba(245,158,11,0.3)', color: '#fcd34d', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600, transition: 'all 0.2s' }}>
              <UserMinus size={13} /> Deactivate
            </button>
            <button onClick={() => setModalState('delete_confirm')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', borderRadius: '8px', background: 'rgba(244,63,94,0.05)', border: '1px dashed rgba(244,63,94,0.3)', color: '#fb7185', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600, transition: 'all 0.2s' }}>
              <UserX size={13} /> Delete
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '6px 8px 0', marginTop: '4px' }}>
            <Shield size={12} color="var(--violet-light)" />
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>100% On-Device · Private</span>
          </div>
        </div>
      </aside>

      {/* MODALS */}
      {modalState === 'deactivate' && (
        <ModalOverlay title="Deactivate Account" subtitle="Your data will be preserved, but you will be signed out. You can reactivate by logging in again.">
          <input type="password" placeholder="Confirm your password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white', marginBottom: '15px' }} />
          <button onClick={handleDeactivate} disabled={processing} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#f59e0b', color: '#000', fontWeight: 700, border: 'none', cursor: processing ? 'not-allowed' : 'pointer' }}>
            {processing ? 'Processing...' : 'Confirm Deactivation'}
          </button>
        </ModalOverlay>
      )}

      {modalState === 'delete_confirm' && (
        <ModalOverlay title="Delete Account" subtitle="Are you absolutely sure you want to permanently delete your Digital Twin data? This cannot be undone.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button onClick={() => setModalState('deactivate')} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.4)', color: '#fcd34d', fontWeight: 700, cursor: 'pointer' }}>
              No, just Deactivate instead
            </button>
            <button onClick={() => { setModalState('delete_password'); setError('') }} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'transparent', border: '1px solid rgba(244,63,94,0.4)', color: '#fb7185', fontWeight: 600, cursor: 'pointer' }}>
              Yes, proceed to Delete
            </button>
          </div>
        </ModalOverlay>
      )}

      {modalState === 'delete_password' && (
        <ModalOverlay title="Final Confirmation" subtitle="Enter your password to permanently delete your account.">
          <input type="password" placeholder="Confirm your password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(244,63,94,0.3)', color: 'white', marginBottom: '15px' }} />
          <button onClick={handleDelete} disabled={processing} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#e11d48', color: 'white', fontWeight: 700, border: 'none', cursor: processing ? 'not-allowed' : 'pointer' }}>
            {processing ? 'Processing...' : 'Permanently Delete'}
          </button>
        </ModalOverlay>
      )}
    </>
  )
}
