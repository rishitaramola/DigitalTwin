import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { RefreshCw, Zap, AlertTriangle, CheckCircle, Brain, MapPin, Clock } from 'lucide-react'
import TwinDivergenceGauge from '../components/TwinDivergenceGauge'
import BehaviourChain from '../components/BehaviourChain'
import MoodFingerprint from '../components/MoodFingerprint'
import IntentGate from '../components/IntentGate'

// ── Mock data for demo (uses when API is offline) ───────────────────────────
const MOCK_STATE = {
  prediction: {
    prediction: 'distraction',
    risk_score: 0.76,
    confidence: 0.83,
    intervention_level: 'intent_gate',
    coach_message: "Sequence detected: Email → News → Social Media. This is your #1 distraction chain. You're at the second link right now. Closing the chain here means the next 90 minutes are yours.",
    probabilities: { deep_work: 0.12, distraction: 0.76, rest_needed: 0.08, burnout_risk: 0.04 }
  },
  mood_fingerprint: {
    stress_level: 0.62, focus_score: 0.38, energy_level: 0.55,
    anxiety_index: 0.44, emotional_state: 'distracted',
    typing_speed_wpm: 42.5, notification_lag_seconds: 18.3, app_switch_rate: 0.8
  },
  twin_divergence: { score: 34, grade: 'B', trend: 'declining', distraction_events: 8, deep_work_events: 14 },
  flow_state_active: false,
  behaviour_chain: ['email', 'news'],
  active_intervention: null
}

const PREDICTION_COLORS = {
  deep_work: { color: 'var(--emerald)', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', label: 'Deep Work', icon: '🎯' },
  distraction: { color: '#fbbf24', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', label: 'Distraction Risk', icon: '⚠️' },
  rest_needed: { color: 'var(--cyan-light)', bg: 'rgba(6,182,212,0.1)', border: 'rgba(6,182,212,0.3)', label: 'Rest Needed', icon: '😴' },
  burnout_risk: { color: '#fb7185', bg: 'rgba(244,63,94,0.1)', border: 'rgba(244,63,94,0.3)', label: 'Burnout Risk', icon: '🔥' },
}

export default function Dashboard() {
  const [state, setState] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(null)
  const [showIntentGate, setShowIntentGate] = useState(false)
  const [intentGateData, setIntentGateData] = useState(null)
  const [useMock, setUseMock] = useState(false)

  const fetchState = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await axios.get('/api/current-state', { timeout: 3000 })
      setState(data)
      setUseMock(false)
      if (data.active_intervention) {
        setIntentGateData(data.active_intervention)
        setShowIntentGate(true)
      }
    } catch {
      setState(MOCK_STATE)
      setUseMock(true)
    }
    setLastRefresh(new Date())
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchState()
    const interval = setInterval(fetchState, 30000)
    return () => clearInterval(interval)
  }, [fetchState])

  const triggerDemo = () => {
    setIntentGateData({
      id: 'demo_1',
      type: 'intent_gate',
      primary_action: "What's your goal for the next 20 minutes?",
      risk_score: 0.78,
      coach_message: "Sequence detected: Email → News → Social Media. This is your #1 distraction chain. You're at the second link right now. Closing the chain here means the next 90 minutes are yours.",
      options: [
        { id: 'focus', label: 'Stay focused 🎯', value: 'focus', primary: true },
        { id: 'rest', label: 'I need rest 😴', value: 'intentional_rest', primary: false },
        { id: 'allow', label: 'Allow this time 🔓', value: 'intentional_break', primary: false }
      ]
    })
    setShowIntentGate(true)
  }

  if (loading && !state) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Live Digital Twin</h1>
          <p className="page-subtitle">Loading your behavioural state...</p>
        </div>
        <div className="grid-3" style={{ marginBottom: '20px' }}>
          {[1,2,3].map(i => <div key={i} className="card skeleton" style={{ height: '120px' }} />)}
        </div>
        <div className="grid-2">
          {[1,2].map(i => <div key={i} className="card skeleton" style={{ height: '280px' }} />)}
        </div>
      </div>
    )
  }

  const prediction = state?.prediction || {}
  const mood = state?.mood_fingerprint || {}
  const divergence = state?.twin_divergence || {}
  const chain = state?.behaviour_chain || []
  const predConfig = PREDICTION_COLORS[prediction.prediction] || PREDICTION_COLORS.distraction
  const riskPct = Math.round((prediction.risk_score || 0) * 100)

  return (
    <div>
      {/* Intent Gate Modal */}
      {showIntentGate && intentGateData && (
        <IntentGate
          intervention={intentGateData}
          onClose={() => setShowIntentGate(false)}
          onRespond={(choice) => console.log('User chose:', choice)}
        />
      )}

      {/* Header */}
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Live Digital Twin</h1>
          <p className="page-subtitle">
            Real-time predictive mirror &nbsp;·&nbsp;
            {lastRefresh && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                Updated {lastRefresh.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {useMock && (
            <span className="badge badge-amber">Demo Mode</span>
          )}
          <div className="live-indicator">
            <div className="live-dot" />
            LIVE
          </div>
          <button id="refresh-btn" className="btn btn-secondary btn-sm" onClick={fetchState}>
            <RefreshCw size={14} style={{ animation: loading ? 'spin-slow 1s linear infinite' : 'none' }} />
            Refresh
          </button>
          <button id="demo-intent-gate-btn" className="btn btn-primary btn-sm" onClick={triggerDemo}>
            <Zap size={14} />
            Demo Intent Gate
          </button>
        </div>
      </div>

      {/* Top metric cards */}
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        {/* Prediction state */}
        <div className="card" style={{
          background: predConfig.bg,
          borderColor: predConfig.border
        }}>
          <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>{predConfig.icon}</div>
          <div className="metric-label">Current Prediction</div>
          <div className="metric-value" style={{ fontSize: '1.3rem', color: predConfig.color }}>
            {predConfig.label}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
            {Math.round((prediction.confidence || 0) * 100)}% confidence
          </div>
        </div>

        {/* Risk score */}
        <div className={`card ${riskPct > 70 ? 'card-glow-rose' : riskPct > 45 ? 'card-glow-cyan' : 'card-glow-emerald'}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div className="metric-label">Distraction Risk</div>
            <AlertTriangle size={16} color={riskPct > 70 ? 'var(--rose)' : 'var(--amber)'} />
          </div>
          <div className="metric-value" style={{ color: riskPct > 70 ? '#fb7185' : riskPct > 45 ? '#fbbf24' : '#34d399' }}>
            {riskPct}%
          </div>
          <div className={`risk-bar ${riskPct > 70 ? 'risk-high' : riskPct > 45 ? 'risk-medium' : 'risk-low'}`} style={{ marginTop: '10px' }}>
            <div className="risk-fill" style={{ width: `${riskPct}%` }} />
          </div>
        </div>

        {/* Focus score */}
        <div className="card card-glow-violet">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div className="metric-label">Focus Score</div>
            <Brain size={16} color="var(--violet-light)" />
          </div>
          <div className="metric-value" style={{ color: 'var(--violet-light)' }}>
            {Math.round((mood.focus_score || 0) * 100)}%
          </div>
          <div className={`risk-bar ${mood.focus_score > 0.6 ? 'risk-low' : 'risk-high'}`} style={{ marginTop: '10px' }}>
            <div className="risk-fill" style={{ width: `${Math.round((mood.focus_score || 0) * 100)}%` }} />
          </div>
        </div>

        {/* Flow state */}
        <div className={`card ${state?.flow_state_active ? 'card-glow-emerald' : ''}`}
             style={{ background: state?.flow_state_active ? 'rgba(16,185,129,0.08)' : undefined }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div className="metric-label">Flow State</div>
            <Zap size={16} color={state?.flow_state_active ? 'var(--emerald)' : 'var(--text-muted)'} />
          </div>
          <div className="metric-value" style={{
            fontSize: '1.3rem',
            color: state?.flow_state_active ? 'var(--emerald)' : 'var(--text-secondary)'
          }}>
            {state?.flow_state_active ? '⚡ Active' : 'Monitoring'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
            {state?.flow_state_active ? 'Notifications paused' : 'Waiting for sustained focus'}
          </div>
        </div>
      </div>

      {/* Main content row */}
      <div className="grid-2" style={{ marginBottom: '24px' }}>
        {/* Twin Divergence + Chain */}
        <div className="card">
          <div className="flex items-center justify-between mb-16">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700 }}>
              Twin Divergence Score
            </h2>
            <span className={`badge ${divergence.grade === 'A' ? 'badge-emerald' : divergence.grade === 'B' ? 'badge-cyan' : divergence.grade === 'C' ? 'badge-amber' : 'badge-rose'}`}>
              Grade {divergence.grade}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <TwinDivergenceGauge
              score={divergence.score || 0}
              grade={divergence.grade || 'A'}
              trend={divergence.trend || 'improving'}
            />
          </div>
          {/* Mini stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {[
              { label: 'Deep Work', value: divergence.deep_work_events || 0, color: 'var(--emerald)', icon: '🎯' },
              { label: 'Distractions', value: divergence.distraction_events || 0, color: 'var(--rose)', icon: '📱' }
            ].map(({ label, value, color, icon }) => (
              <div key={label} style={{
                padding: '10px', background: 'var(--bg-glass)',
                border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1rem', marginBottom: '4px' }}>{icon}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color }}>{value}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Mood Fingerprint */}
        <div className="card">
          <div className="flex items-center justify-between mb-16">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700 }}>
              Mood Fingerprint
            </h2>
            <span className="badge badge-violet">Passive Sensing</span>
          </div>
          <MoodFingerprint mood={mood} />
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid-2">
        {/* Behaviour Chain */}
        <div className="card">
          <div className="flex items-center justify-between mb-16">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700 }}>
              Behaviour Chain
            </h2>
            <span className="badge badge-amber">Monitoring</span>
          </div>
          <BehaviourChain
            chain={chain}
            pattern={state?.behaviour_chain_pattern}
          />

          {/* Log event buttons */}
          <div style={{ marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '10px', fontWeight: 600 }}>
              Simulate App Opens
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {['email', 'news', 'social_media', 'deep_work', 'video'].map(app => (
                <button
                  key={app}
                  id={`log-${app}-btn`}
                  className="btn btn-secondary btn-sm"
                  onClick={async () => {
                    try {
                      await axios.post('/api/log-event', { app_category: app, location: 'desk' })
                      fetchState()
                    } catch { /* demo */ }
                  }}
                >
                  {app.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Coach Message */}
        <div className="card card-glow-violet">
          <div className="flex items-center justify-between mb-16">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700 }}>
              🤖 Twin Coach
            </h2>
            <span className="badge badge-violet">AI-Powered</span>
          </div>

          <div style={{
            background: 'rgba(124,58,237,0.08)',
            border: '1px solid rgba(124,58,237,0.2)',
            borderRadius: 'var(--radius-sm)',
            padding: '20px',
            marginBottom: '16px'
          }}>
            <p style={{
              fontSize: '0.9rem', lineHeight: 1.7,
              color: 'var(--text-primary)', fontStyle: 'italic'
            }}>
              "{prediction.coach_message || 'Analyzing your patterns...'}"
            </p>
          </div>

          <div style={{
            padding: '12px 14px',
            background: 'var(--bg-glass)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '16px'
          }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>
              Intervention Level
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {['soft_nudge', 'intent_gate', 'hard_friction'].map((level, i) => {
                const isActive = prediction.intervention_level === level
                const colors = ['var(--cyan)', 'var(--violet)', 'var(--rose)']
                return (
                  <div key={level} style={{
                    flex: 1, padding: '6px 8px', borderRadius: '6px',
                    background: isActive ? `${colors[i]}22` : 'transparent',
                    border: `1px solid ${isActive ? colors[i] + '55' : 'transparent'}`,
                    fontSize: '0.68rem', fontWeight: 700, textAlign: 'center',
                    color: isActive ? colors[i] : 'var(--text-muted)',
                    textTransform: 'capitalize'
                  }}>
                    {level.replace('_', ' ')}
                  </div>
                )
              })}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button id="trigger-intervention-btn" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={triggerDemo}>
              Trigger Intervention
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
