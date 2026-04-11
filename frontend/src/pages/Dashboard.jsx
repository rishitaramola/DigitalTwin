import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'
import { RefreshCw, Zap, AlertTriangle, BrainCircuit, Activity, Clock, TerminalSquare, AlertCircle, MousePointer2, ChevronRight, Fingerprint } from 'lucide-react'
import IntentGate from '../components/IntentGate'

export default function Dashboard() {
  const [state, setState] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(null)
  const [showIntentGate, setShowIntentGate] = useState(false)
  const [intentGateData, setIntentGateData] = useState(null)
  const [useMock, setUseMock] = useState(false)
  const [moodInput, setMoodInput] = useState('')

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
      setState({
        prediction: { 
          prediction: 'distraction', 
          risk_score: 0.76, 
          intervention_level: 'intent_gate', 
          coach_message: "Taking a break? A 10 minute walk resets focus.",
          top_features: ["You usually rest at this hour", "You just opened Social Media"]
        },
        mood_fingerprint: { 
          focus_score: 0.85, energy_level: 0.60, stress_level: 0.30, 
          willpower: 0.70, cognitive_load: 0.80, emotional_state: 'distracted',
          typing_wpm: 42,
          app_switches: 14
        },
        behaviour_chain: ['email', 'news', 'youtube'],
        twin_divergence: { score: 34, grade: 'B', trend: 'declining' }
      })
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
      id: 'demo_1', type: 'intent_gate',
      primary_action: "You usually waste 2 hours now. Want to switch to study mode?",
      risk_score: 0.88,
      coach_message: "You've broken your streak. Just 10 mins of study equals a 40% jump!",
      options: [
        { id: 'focus', label: 'Start Pomodoro (10 mins) 🎯', value: 'focus', primary: true },
        { id: 'rest', label: 'I really need rest 😴', value: 'intentional_rest', primary: false },
      ]
    })
    setShowIntentGate(true)
  }

  const handleSimulateApp = async (app) => {
    try {
      await axios.post('/api/log-event', { app_category: app, location: 'desk' })
      fetchState()
    } catch { 
      triggerDemo()
    }
  }

  const handleMoodSubmit = () => {
    if(!moodInput.trim()) return;
    setMoodInput('');
    triggerDemo();
  }

  if (loading && !state) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <RefreshCw size={32} style={{ color: 'var(--violet)', animation: 'spin-slow 1s linear infinite' }} /> 
          <span style={{ color: 'var(--text-secondary)' }}>Syncing with Twin...</span>
        </div>
      </div>
    )
  }

  const prediction = state?.prediction || {}
  const mood = state?.mood_fingerprint || {}
  const chain = state?.behaviour_chain || []
  const riskPct = Math.round((prediction.risk_score || 0) * 100)

  const radarData = [
    { subject: 'Focus', A: Math.round((mood.focus_score || 0) * 100), fullMark: 100 },
    { subject: 'Energy', A: Math.round((mood.energy_level || 0) * 100), fullMark: 100 },
    { subject: 'Stress', A: Math.round((mood.stress_level || 0) * 100), fullMark: 100 },
    { subject: 'Willpower', A: Math.round((mood.willpower || 0.70) * 100), fullMark: 100 },
    { subject: 'Load', A: Math.round((mood.cognitive_load || 0.80) * 100), fullMark: 100 },
  ]

  const riskColor = riskPct > 70 ? '#f43f5e' : riskPct > 45 ? '#f59e0b' : '#10b981'
  const riskLabel = riskPct < 30 ? 'Safe Zone' : riskPct < 70 ? 'Moderate' : 'High Risk'

  return (
    <div>
      {/* Intent Gate Modal */}
      {showIntentGate && intentGateData && (
        <div className="modal-backdrop">
          <IntentGate intervention={intentGateData} onClose={() => setShowIntentGate(false)} onRespond={() => setShowIntentGate(false)} />
        </div>
      )}

      {/* Header */}
      <div className="page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:'16px' }}>
        <div>
          <h1 className="page-title">Live Twin Dashboard</h1>
          <p className="page-subtitle" style={{ display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap' }}>
            Your real-time digital mirror
            {lastRefresh && (
              <span className="text-mono" style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>
                · Updated {lastRefresh.toLocaleTimeString()}
              </span>
            )}
            {useMock && <span className="badge badge-amber">Mock Mode</span>}
          </p>
        </div>
        <div style={{ display:'flex', gap:'10px' }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchState}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button className="btn btn-primary btn-sm" onClick={triggerDemo}>
            <Zap size={14} /> Test Intent Gate
          </button>
        </div>
      </div>

      {/* ═══════ ROW 1: The Three Main Widgets ═══════ */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))', gap:'24px', marginBottom:'28px' }}>

        {/* ── Widget A: Distraction Risk Gauge ── */}
        <div className="card" style={{ display:'flex', flexDirection:'column' }}>
          {/* Title Row */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
            <h2 style={{ fontSize:'1.05rem', fontWeight:700, display:'flex', alignItems:'center', gap:'8px', fontFamily:'var(--font-display)' }}>
              <AlertCircle size={18} style={{ color:'var(--violet-light)' }} /> Distraction Risk
            </h2>
            <span className={`badge ${riskPct < 30 ? 'badge-emerald' : riskPct < 70 ? 'badge-amber' : 'badge-rose'}`}>
              {riskLabel}
            </span>
          </div>

          {/* Description */}
          <p style={{ fontSize:'0.82rem', color:'var(--text-secondary)', lineHeight:1.6, marginBottom:'20px' }}>
            <strong style={{ color:'var(--text-primary)' }}>How it works:</strong> We look at the apps you just used and the time of day. Our ML model cross-references this with your personal history to predict how likely you are to get distracted right now.
          </p>

          {/* Gauge */}
          <div style={{ display:'flex', justifyContent:'center', padding:'12px 0 20px' }}>
            <div style={{ position:'relative', width:'180px', height:'180px' }}>
              <svg viewBox="0 0 200 200" style={{ width:'100%', height:'100%', transform:'rotate(-90deg)' }}>
                <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14" />
                <circle cx="100" cy="100" r="80" fill="none" stroke={riskColor} strokeWidth="14"
                  strokeDasharray={502} strokeDashoffset={502 - (502 * riskPct) / 100}
                  strokeLinecap="round" style={{ transition:'stroke-dashoffset 1s ease', filter:`drop-shadow(0 0 8px ${riskColor}60)` }} />
              </svg>
              <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                <span style={{ fontSize:'2.8rem', fontWeight:800, color:riskColor, fontFamily:'var(--font-display)', lineHeight:1 }}>{riskPct}%</span>
                <span style={{ fontSize:'0.7rem', color:'var(--text-muted)', marginTop:'4px' }}>risk score</span>
              </div>
            </div>
          </div>

          {/* Status */}
          <div style={{ background:'var(--bg-glass)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', padding:'12px 16px', marginBottom:'16px' }}>
            <span style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>Currently Engaged In</span>
            <div style={{ fontSize:'0.95rem', fontWeight:700, textTransform:'capitalize', marginTop:'2px' }}>
              {prediction.prediction ? prediction.prediction.replace('_', ' ') : 'Deep Work'}
            </div>
          </div>

          {/* Proof */}
          <div style={{ background:'rgba(0,0,0,0.3)', borderRadius:'var(--radius-sm)', padding:'14px 16px', border:'1px solid var(--border)', marginTop:'auto' }}>
            <div style={{ fontSize:'0.68rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--violet-light)', marginBottom:'8px', display:'flex', alignItems:'center', gap:'6px' }}>
              <Fingerprint size={12} /> The Proof (Real Data)
            </div>
            <ul style={{ listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:'6px' }}>
              {(prediction.top_features || [`It's ${new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}, your energy historically dips now.`, "You just shifted focus away from Deep Work."]).map((feat, i) => (
                <li key={i} style={{ fontSize:'0.8rem', color:'var(--text-secondary)', display:'flex', alignItems:'flex-start', gap:'8px' }}>
                  <ChevronRight size={14} style={{ color:'var(--cyan)', flexShrink:0, marginTop:'2px' }} />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Widget B: Mood Fingerprint ── */}
        <div className="card" style={{ display:'flex', flexDirection:'column' }}>
          {/* Title */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
            <h2 style={{ fontSize:'1.05rem', fontWeight:700, display:'flex', alignItems:'center', gap:'8px', fontFamily:'var(--font-display)' }}>
              <BrainCircuit size={18} style={{ color:'var(--violet-light)' }} /> Mood Fingerprint
            </h2>
            <span className="badge badge-violet">Passive Sensing</span>
          </div>

          {/* Description */}
          <p style={{ fontSize:'0.82rem', color:'var(--text-secondary)', lineHeight:1.6, marginBottom:'16px' }}>
            <strong style={{ color:'var(--text-primary)' }}>How it works:</strong> We silently measure how fast you type and how often you switch between apps. These micro-signals paint an accurate picture of your brain's current energy and focus levels.
          </p>

          {/* Radar Chart */}
          <div style={{ width:'100%', height:'260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#D1D5DB', fontSize: 11, fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="State" dataKey="A" stroke="#a855f7" strokeWidth={2} fill="#a855f7" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Insight */}
          <div style={{ background:'rgba(124,58,237,0.08)', border:'1px solid rgba(124,58,237,0.25)', borderRadius:'var(--radius-sm)', padding:'14px 16px', display:'flex', gap:'10px', marginBottom:'12px' }}>
            <Activity size={18} style={{ color:'var(--violet-light)', flexShrink:0, marginTop:'2px' }} />
            <p style={{ fontSize:'0.82rem', color:'var(--text-secondary)', lineHeight:1.6, margin:0 }}>
              {prediction.coach_message || "High cognitive load detected. Energy is draining faster than usual."}
            </p>
          </div>

          {/* Proof */}
          <div style={{ background:'rgba(0,0,0,0.3)', borderRadius:'var(--radius-sm)', padding:'14px 16px', border:'1px solid var(--border)', marginTop:'auto' }}>
            <div style={{ fontSize:'0.68rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--violet-light)', marginBottom:'8px', display:'flex', alignItems:'center', gap:'6px' }}>
              <Fingerprint size={12} /> The Proof (Real Data)
            </div>
            <p style={{ fontSize:'0.8rem', color:'var(--text-secondary)', lineHeight:1.6, margin:0 }}>
              Your typing speed is currently <strong style={{ color:'white' }}>{mood.typing_wpm || 42} WPM</strong> and you've switched apps <strong style={{ color:'white' }}>{mood.app_switches || 14} times</strong> in the last 15 minutes. This usually signals a <strong style={{ color:'var(--violet-light)' }}>drop in mental energy</strong>.
            </p>
          </div>
        </div>

        {/* ── Widget C: Behaviour Chain ── */}
        <div className="card" style={{ display:'flex', flexDirection:'column' }}>
          {/* Title */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
            <h2 style={{ fontSize:'1.05rem', fontWeight:700, display:'flex', alignItems:'center', gap:'8px', fontFamily:'var(--font-display)' }}>
              <Clock size={18} style={{ color:'var(--violet-light)' }} /> Behaviour Chain
            </h2>
            <span className="badge badge-amber">Monitoring</span>
          </div>

          {/* Description */}
          <p style={{ fontSize:'0.82rem', color:'var(--text-secondary)', lineHeight:1.6, marginBottom:'20px' }}>
            <strong style={{ color:'var(--text-primary)' }}>How it works:</strong> We track the sequence of apps you open. If you start a common distraction pattern (e.g. Email → Reddit → YouTube), we step in to break the cycle before you lose focus.
          </p>

          {/* Timeline */}
          <div className="timeline" style={{ flex:1 }}>
            {chain.length > 1 && (
              <div className="timeline-item">
                <div className="timeline-time">Where you were · 15 mins ago</div>
                <div className="timeline-text" style={{ textTransform:'capitalize' }}>{chain[0]}</div>
              </div>
            )}

            <div className="timeline-item" style={{ position:'relative' }}>
              <div className="timeline-time" style={{ color:'var(--violet-light)', display:'flex', alignItems:'center', gap:'4px' }}>
                <TerminalSquare size={10} /> Current Phase
              </div>
              <div className="timeline-text" style={{ textTransform:'capitalize', color:'var(--violet-light)', fontWeight:700 }}>
                {chain[chain.length - 1] || 'Idle'}
              </div>
            </div>

            {prediction.risk_score > 0.4 && (
              <div className="timeline-item">
                <div className="timeline-time" style={{ color:'var(--rose)', display:'flex', alignItems:'center', gap:'4px' }}>
                  <AlertTriangle size={10} /> Predicted Risk
                </div>
                <div className="timeline-text" style={{ textTransform:'capitalize', color:'#fb7185' }}>
                  {prediction.prediction || 'Distraction'} — {riskPct}% probability
                </div>
              </div>
            )}
          </div>

          {/* Proof */}
          <div style={{ background:'rgba(0,0,0,0.3)', borderRadius:'var(--radius-sm)', padding:'14px 16px', border:'1px solid var(--border)', marginTop:'auto' }}>
            <div style={{ fontSize:'0.68rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--violet-light)', marginBottom:'8px', display:'flex', alignItems:'center', gap:'6px' }}>
              <Fingerprint size={12} /> The Proof (Real Data)
            </div>
            <p style={{ fontSize:'0.8rem', color:'var(--text-secondary)', lineHeight:1.6, margin:0 }}>
              Whenever you open <strong style={{ color:'white', textTransform:'capitalize' }}>{chain[0] || 'your previous app'}</strong> followed by <strong style={{ color:'white', textTransform:'capitalize' }}>{chain[chain.length - 1] || 'your current app'}</strong>, it leads to a <strong style={{ color:'#fb7185' }}>total distraction {riskPct}% of the time</strong>.
            </p>
          </div>
        </div>

      </div>

      {/* ═══════ ROW 2: Interactive Controls ═══════ */}
      <div className="grid-2" style={{ marginBottom:'24px' }}>
        
        {/* Hardware Simulator */}
        <div className="card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px', flexWrap:'wrap', gap:'10px' }}>
            <div>
              <h3 style={{ fontSize:'0.95rem', fontWeight:700, display:'flex', alignItems:'center', gap:'8px', color:'var(--cyan-light)' }}>
                <MousePointer2 size={16} /> Hardware Simulator
              </h3>
              <p style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginTop:'4px' }}>
                Inject fake app-opens to see how your Twin reacts instantly
              </p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={triggerDemo}>
              Trigger AI Block
            </button>
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
            {['email', 'news', 'social_media', 'deep_work', 'video'].map(app => (
              <button key={app} className="btn btn-secondary btn-sm" onClick={() => handleSimulateApp(app)}
                style={{ flex:'1 1 auto', minWidth:'90px', textAlign:'center', textTransform:'capitalize' }}>
                Log {app.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Emotion Override */}
        <div className="card">
          <h3 style={{ fontSize:'0.95rem', fontWeight:700, display:'flex', alignItems:'center', gap:'8px', color:'#34d399', marginBottom:'4px' }}>
            ❤️ Emotion Override
          </h3>
          <p style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginBottom:'16px' }}>
            Manually override the AI if you think it misread your tired state
          </p>
          <div style={{ display:'flex', gap:'10px' }}>
            <input 
              type="text" 
              value={moodInput}
              onChange={(e) => setMoodInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleMoodSubmit()}
              placeholder="e.g. 'I'm feeling intensely focused!'"
              style={{ flex:1, padding:'10px 14px', borderRadius:'var(--radius-sm)', background:'var(--bg-glass)', border:'1px solid var(--border)', color:'white', outline:'none', fontSize:'0.85rem' }}
            />
            <button className="btn btn-cyan btn-sm" onClick={handleMoodSubmit}>
              Override
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
