import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { Activity, Eye, EyeOff, UserPlus, AlertCircle, CheckCircle, Mail } from 'lucide-react'

export default function Signup() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '', otp: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  // OTP States
  const [otpSent, setOtpSent] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [sendingOtp, setSendingOtp] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const sendOtp = async () => {
    if (!form.email.includes('@')) {
      setError("Please enter a valid email first.")
      return;
    }
    setSendingOtp(true)
    setError('')
    try {
      await axios.post('/api/auth/send-otp', { email: form.email.trim() })
      setOtpSent(true)
      setError('')
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to send OTP.")
    } finally {
      setSendingOtp(false)
    }
  }

  const verifyOtp = async () => {
    if (form.otp.length < 6) return
    setError('')
    try {
      await axios.post('/api/auth/verify-otp', { email: form.email.trim(), otp: form.otp })
      setOtpVerified(true)
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid OTP.")
    }
  }

  const validate = () => {
    if (!form.username.trim() || form.username.trim().length < 2)
      return 'Username must be at least 2 characters.'
    if (!form.email.includes('@'))
      return 'Please enter a valid email.'
    if (form.password.length < 6)
      return 'Password must be at least 6 characters.'
    if (form.password !== form.confirm)
      return 'Passwords do not match.'
    if (!otpVerified)
      return 'Please verify your email address first.'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const validationError = validate()
    if (validationError) { setError(validationError); return }
    setLoading(true)
    try {
      const { data } = await axios.post('/api/auth/signup', {
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password
      })
      login(data.token, data.user)
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.detail || 'Sign up failed. Please try again.'
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

  const requirements = [
    { label: 'At least 2 characters for username', met: form.username.trim().length >= 2 },
    { label: 'At least 6 characters for password', met: form.password.length >= 6 },
    { label: 'Passwords match', met: form.password.length > 0 && form.password === form.confirm },
    { label: 'Email Verified', met: otpVerified }
  ]

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-base)',
      backgroundImage: 'radial-gradient(ellipse at 80% 30%, rgba(124,58,237,0.12) 0%, transparent 60%), radial-gradient(ellipse at 20% 70%, rgba(6,182,212,0.08) 0%, transparent 50%)',
      padding: '24px'
    }}>
      <div style={{ position: 'fixed', top: '20%', right: '5%', width: '280px', height: '280px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '440px', zIndex: 1, position: 'relative' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '48px', height: '48px',
            background: 'linear-gradient(135deg, var(--violet), var(--cyan))',
            borderRadius: '14px', marginBottom: '12px',
            boxShadow: '0 8px 30px var(--violet-glow)'
          }}>
            <Activity size={24} color="white" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, margin: '0 0 6px' }}>
            Create your <span style={{ color: 'var(--violet-light)' }}>Twin</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Your personal behavioural mirror awaits</p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(14, 14, 28, 0.85)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '30px', backdropFilter: 'blur(20px)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.4)'
        }}>
          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(244,63,94,0.1)',
              border: '1px solid rgba(244,63,94,0.3)', borderRadius: '8px', padding: '10px 14px',
              marginBottom: '20px', color: '#fb7185', fontSize: '0.85rem'
            }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Username */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', letterSpacing: '0.06em' }}>
                USERNAME
              </label>
              <input
                name="username" type="text" placeholder="e.g. Rishita"
                value={form.username} onChange={handleChange} autoComplete="username"
                style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'white', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box' }}
              />
            </div>

            {/* Email + OTP Flow */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', letterSpacing: '0.06em' }}>
                EMAIL ADDRESS
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  name="email" type="email" placeholder="you@example.com"
                  value={form.email} onChange={handleChange} disabled={otpVerified}
                  style={{ flex: 1, padding: '12px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'white', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box', opacity: otpVerified ? 0.6 : 1 }}
                />
                {!otpVerified && (
                  <button type="button" onClick={sendOtp} disabled={sendingOtp || otpSent} style={{
                    padding: '0 16px', borderRadius: '10px', border: '1px solid var(--border)', cursor: (sendingOtp || otpSent) ? 'not-allowed' : 'pointer',
                    background: otpSent ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)', color: otpSent ? '#10b981' : 'white', fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap'
                  }}>
                    {sendingOtp ? 'Sending...' : otpSent ? 'Sent' : 'Send OTP'}
                  </button>
                )}
              </div>
            </div>

            {/* OTP Input (Shows conditionally) */}
            {otpSent && !otpVerified && (
              <div style={{ padding: '12px', background: 'rgba(124,58,237,0.08)', borderRadius: '10px', border: '1px dashed rgba(124,58,237,0.3)', animation: 'fadeIn 0.3s ease' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--violet-light)', display: 'block', marginBottom: '8px', letterSpacing: '0.06em' }}>
                  ENTER 6-DIGIT VERIFICATION CODE
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    name="otp" type="text" maxLength="6" placeholder="000000"
                    value={form.otp} onChange={handleChange}
                    style={{ flex: 1, padding: '10px 16px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(124,58,237,0.4)', color: '#10b981', outline: 'none', fontSize: '1rem', letterSpacing: '4px', textAlign: 'center', fontWeight: 'bold' }}
                  />
                  <button type="button" onClick={verifyOtp} style={{
                    padding: '0 16px', borderRadius: '8px', border: 'none', background: 'var(--violet)', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem'
                  }}>
                    Verify
                  </button>
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', letterSpacing: '0.06em' }}>
                PASSWORD
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  name="password" type={showPass ? 'text' : 'password'} placeholder="Min. 6 characters"
                  value={form.password} onChange={handleChange} autoComplete="new-password"
                  style={{ width: '100%', padding: '12px 44px 12px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'white', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)'
                }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', letterSpacing: '0.06em' }}>
                CONFIRM PASSWORD
              </label>
              <input
                name="confirm" type={showPass ? 'text' : 'password'} placeholder="Repeat your password"
                value={form.confirm} onChange={handleChange} autoComplete="new-password"
                style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'white', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box' }}
              />
            </div>

            {/* Requirements checklist */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: '4px 0' }}>
              {requirements.map(req => (
                <div key={req.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: req.met ? '#34d399' : 'var(--text-muted)' }}>
                  <CheckCircle size={13} color={req.met ? '#34d399' : 'rgba(255,255,255,0.2)'} />
                  {req.label}
                </div>
              ))}
            </div>

            <button
              type="submit" disabled={loading || !otpVerified}
              style={{
                width: '100%', padding: '12px', borderRadius: '10px',
                background: (loading || !otpVerified) ? 'rgba(16,185,129,0.2)' : 'linear-gradient(135deg, #10b981, #059669)',
                border: 'none', color: (loading || !otpVerified) ? 'rgba(255,255,255,0.5)' : 'white', fontSize: '0.9rem', fontWeight: 700,
                cursor: (loading || !otpVerified) ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: (loading || !otpVerified) ? 'none' : '0 6px 24px rgba(16,185,129,0.3)', transition: 'all 0.2s'
              }}
            >
              <UserPlus size={16} />
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>

          {/* Social Auth (Simulated) */}
          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
              <span style={{ padding: '0 10px', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Or configure with</span>
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

          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--violet-light)', fontWeight: 600, textDecoration: 'none' }}>
              Sign in
            </Link>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '1px' }}>
          BIT REBELS · HACK-O-HOLIC 4.0 · 100% PRIVATE
        </div>
      </div>
    </div>
  )
}
