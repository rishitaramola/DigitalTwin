import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { Activity, Eye, EyeOff, LogIn, UserPlus, AlertCircle } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ identifier: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.identifier || !form.password) {
      setError('Please fill in all fields.')
      return
    }
    setLoading(true)
    try {
      const { data } = await axios.post('/api/auth/login', {
        identifier: form.identifier.trim(),
        password: form.password
      })
      login(data.token, data.user)
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.detail || 'Login failed. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleSocialLogin = (provider) => {
    setLoading(true)
    setTimeout(() => {
      login("mock-token", { id: 999, username: `${provider}User`, email: `demo@${provider.toLowerCase()}.com` })
      navigate('/dashboard')
    }, 800)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-base)',
      backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(124,58,237,0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(6,182,212,0.08) 0%, transparent 50%)',
      padding: '24px'
    }}>
      {/* Floating orbs */}
      <div style={{ position: 'fixed', top: '10%', left: '5%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '15%', right: '8%', width: '250px', height: '250px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '56px', height: '56px',
            background: 'linear-gradient(135deg, var(--violet), var(--cyan))',
            borderRadius: '16px', marginBottom: '16px',
            boxShadow: '0 8px 30px var(--violet-glow)'
          }}>
            <Activity size={28} color="white" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, margin: '0 0 6px' }}>
            Digital Twin <span style={{ color: 'var(--violet-light)' }}>of You</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Sign in to access your behavioural mirror</p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(14, 14, 28, 0.85)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '36px 32px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.4)'
        }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, marginBottom: '6px' }}>Welcome back</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '28px' }}>Enter your credentials to continue</p>

          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)',
              borderRadius: '8px', padding: '10px 14px', marginBottom: '20px', color: '#fb7185', fontSize: '0.85rem'
            }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', letterSpacing: '0.06em' }}>
                USERNAME OR EMAIL
              </label>
              <input
                id="login-identifier"
                name="identifier"
                type="text"
                placeholder="e.g. Rishita or you@example.com"
                value={form.identifier || ''}
                onChange={handleChange}
                autoComplete="username"
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: '10px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
                  color: 'white', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box',
                  transition: 'border-color 0.2s'
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(124,58,237,0.6)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', letterSpacing: '0.06em' }}>
                PASSWORD
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  style={{
                    width: '100%', padding: '12px 44px 12px 16px', borderRadius: '10px',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
                    color: 'white', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(124,58,237,0.6)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px'
                }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '13px', borderRadius: '10px',
                background: loading ? 'rgba(16,185,129,0.4)' : 'linear-gradient(135deg, #10b981, #059669)',
                border: 'none', color: 'white', fontSize: '0.95rem', fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: loading ? 'none' : '0 6px 24px rgba(16,185,129,0.35)',
                transition: 'all 0.2s', marginTop: '4px'
              }}
            >
              <LogIn size={17} />
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Social Auth (Simulated) */}
          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
              <span style={{ padding: '0 10px', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Or continue with</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" onClick={() => handleSocialLogin('Google')} disabled={loading} style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                padding: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
                borderRadius: '8px', color: 'white', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.8rem', fontWeight: 600
              }}>
                <svg viewBox="0 0 24 24" width="14" height="14" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg> Google
              </button>
              <button type="button" onClick={() => handleSocialLogin('Facebook')} disabled={loading} style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                padding: '10px', background: '#1877F2', border: 'none',
                borderRadius: '8px', color: 'white', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.8rem', fontWeight: 600
              }}>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="white"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 22.954 24 17.99 24 12c0-6.627-5.373-12-12-12z"/></svg> Facebook
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: 'var(--violet-light)', fontWeight: 600, textDecoration: 'none' }}>
              Create one
            </Link>
          </div>
        </div>

        {/* Bottom badge */}
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          Bit Rebels · Hack-o-Holic 4.0 · 100% On-Device & Private
        </div>
      </div>
    </div>
  )
}
