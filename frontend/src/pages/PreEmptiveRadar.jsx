import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine } from 'recharts'
import { Radar, ShieldAlert, Route, BatteryWarning, AlertTriangle, CheckCircle2, XCircle, Zap, Clock, Brain, TrendingDown, ArrowRight, RefreshCw, ChevronRight } from 'lucide-react'

// ── Simulated live data ──────────────────────────────────────────
const generateEnergyForecast = () => {
  const hours = []
  const now = new Date().getHours()
  for(let i = 0; i < 12; i++) {
    const hour = (now + i) % 24
    // Simulate a realistic energy curve that dips
    let energy = 75 - Math.abs(i - 3) * 4 + Math.random() * 10
    if(i > 6) energy = Math.max(15, energy - (i - 6) * 8) // steep decline if pushing
    hours.push({
      time: `${hour}:00`,
      current: Math.round(Math.min(100, Math.max(5, energy))),
      withBreak: Math.round(Math.min(100, Math.max(30, energy + 20))),
    })
  }
  return hours
}

const SABOTAGE_ALERTS = [
  { id: 1, severity: 'critical', title: '12 Chrome Tabs Open', description: 'You have 12 tabs open across 4 different topics. This fragments your attention span by 60%.', fix: 'Close all tabs except the 2 related to your current task.', icon: '🌐', active: true },
  { id: 2, severity: 'warning', title: 'Phone Notifications On', description: 'Your phone has buzzed 8 times in the last 20 minutes. Each notification costs you 23 minutes of refocus time.', fix: 'Enable Do Not Disturb mode for the next 90 minutes.', icon: '📱', active: true },
  { id: 3, severity: 'info', title: 'Room Lighting Too Dim', description: 'Low ambient light increases melatonin production, making you sleepier and less focused.', fix: 'Increase screen brightness or turn on a desk lamp.', icon: '💡', active: false },
]

const DETOUR_PATHS = [
  { id: 'push', label: 'Push Through', emoji: '💪', outcome: 'You will lose focus in ~12 minutes. Productivity drops 45% and you waste 40 min total.', risk: 85, color: 'var(--rose)' },
  { id: 'micro', label: '5-Min Micro Break', emoji: '☕', outcome: 'A short walk or stretch restores 30% cognitive capacity. You regain 25 productive minutes.', risk: 25, color: 'var(--emerald)' },
  { id: 'switch', label: 'Switch Task Type', emoji: '🔄', outcome: 'Switching from analytical to creative work refreshes your prefrontal cortex for 45 more minutes.', risk: 35, color: 'var(--cyan)' },
]

export default function PreEmptiveRadar() {
  const [energyData, setEnergyData] = useState(() => generateEnergyForecast())
  const [alerts, setAlerts] = useState(SABOTAGE_ALERTS)
  const [selectedDetour, setSelectedDetour] = useState(null)
  const [detourApplied, setDetourApplied] = useState(false)
  const [debtHours, setDebtHours] = useState(2.5)

  // Simulate live refresh
  const refreshData = () => {
    setEnergyData(generateEnergyForecast())
    setDetourApplied(false)
    setSelectedDetour(null)
  }

  const dismissAlert = (id) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, active: false } : a))
  }

  const applyDetour = (detour) => {
    setSelectedDetour(detour)
    setDetourApplied(true)
    // Simulate haptic
    if(navigator.vibrate) navigator.vibrate([100, 50, 100])
  }

  const activeAlerts = alerts.filter(a => a.active)
  const resolvedAlerts = alerts.filter(a => !a.active)

  return (
    <div>
      {/* Header */}
      <div className="page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:'16px' }}>
        <div>
          <h1 className="page-title" style={{ display:'flex', alignItems:'center', gap:'12px' }}>
            <Radar size={28} style={{ color:'var(--violet-light)' }} /> Pre-emptive Radar
          </h1>
          <p className="page-subtitle">
            Immediate warnings and corrections — your Twin intervenes <strong>before</strong> you fail, not after.
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={refreshData}>
          <RefreshCw size={14} /> Refresh Scan
        </button>
      </div>


      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 1: SABOTAGE ALERTS
      ═══════════════════════════════════════════════════════════════════ */}
      <section style={{ marginBottom:'32px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'6px' }}>
          <ShieldAlert size={20} style={{ color:'#fb7185' }} />
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.2rem', fontWeight:700 }}>Sabotage Alerts</h2>
          {activeAlerts.length > 0 && (
            <span className="badge badge-rose">{activeAlerts.length} Active</span>
          )}
        </div>
        <p style={{ fontSize:'0.85rem', color:'var(--text-secondary)', marginBottom:'20px', maxWidth:'700px', lineHeight:1.7 }}>
          <strong style={{ color:'var(--text-primary)' }}>How it works:</strong> Your Twin continuously scans your digital environment — open tabs, notification frequency, ambient conditions — and instantly flags anything that's <strong style={{ color:'#fb7185' }}>sabotaging your focus</strong>. Each alert tells you exactly what to fix.
        </p>

        {/* Active Alerts */}
        <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'16px' }}>
          {activeAlerts.length === 0 && (
            <div className="card" style={{ textAlign:'center', padding:'32px', color:'var(--text-muted)' }}>
              <CheckCircle2 size={32} style={{ margin:'0 auto 12px', color:'var(--emerald)' }} />
              <div style={{ fontWeight:600 }}>All Clear! No active sabotage detected.</div>
            </div>
          )}
          {activeAlerts.map(alert => (
            <div key={alert.id} className="card" style={{
              borderColor: alert.severity === 'critical' ? 'rgba(244,63,94,0.4)' : 'rgba(245,158,11,0.3)',
              background: alert.severity === 'critical' ? 'rgba(244,63,94,0.04)' : 'var(--bg-card)',
            }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'16px' }}>
                <div style={{ display:'flex', gap:'14px', flex:1 }}>
                  <span style={{ fontSize:'1.6rem', lineHeight:1 }}>{alert.icon}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px', flexWrap:'wrap' }}>
                      <span style={{ fontWeight:700, fontSize:'0.95rem' }}>{alert.title}</span>
                      <span className={`badge ${alert.severity === 'critical' ? 'badge-rose' : 'badge-amber'}`} style={{ fontSize:'0.65rem' }}>
                        {alert.severity === 'critical' ? '🔴 CRITICAL' : '🟡 WARNING'}
                      </span>
                    </div>
                    <p style={{ fontSize:'0.82rem', color:'var(--text-secondary)', lineHeight:1.6, marginBottom:'12px' }}>
                      {alert.description}
                    </p>
                    {/* Fix suggestion */}
                    <div style={{ display:'flex', alignItems:'flex-start', gap:'8px', padding:'10px 14px', background:'rgba(16,185,129,0.06)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:'var(--radius-sm)' }}>
                      <Zap size={14} style={{ color:'var(--emerald)', flexShrink:0, marginTop:'2px' }} />
                      <span style={{ fontSize:'0.8rem', color:'#34d399', fontWeight:600 }}>Fix: {alert.fix}</span>
                    </div>
                  </div>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => dismissAlert(alert.id)} style={{ flexShrink:0 }}>
                  <CheckCircle2 size={14} /> Fixed
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Resolved Alerts */}
        {resolvedAlerts.length > 0 && (
          <div style={{ padding:'12px 16px', background:'rgba(16,185,129,0.05)', border:'1px solid rgba(16,185,129,0.15)', borderRadius:'var(--radius-sm)' }}>
            <span style={{ fontSize:'0.78rem', color:'#34d399', fontWeight:600 }}>
              ✅ {resolvedAlerts.length} alert{resolvedAlerts.length > 1 ? 's' : ''} resolved — environment is improving
            </span>
          </div>
        )}
      </section>


      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 2: OPTIMAL DETOURS
      ═══════════════════════════════════════════════════════════════════ */}
      <section style={{ marginBottom:'32px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'6px' }}>
          <Route size={20} style={{ color:'var(--cyan-light)' }} />
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.2rem', fontWeight:700 }}>Optimal Detours</h2>
        </div>
        <p style={{ fontSize:'0.85rem', color:'var(--text-secondary)', marginBottom:'20px', maxWidth:'700px', lineHeight:1.7 }}>
          <strong style={{ color:'var(--text-primary)' }}>How it works:</strong> Right before you lose focus, your Twin simulates <strong style={{ color:'var(--cyan-light)' }}>3 possible futures</strong> and shows you what happens in each one. Pick the smartest path to stay productive.
        </p>

        {/* Applied State */}
        {detourApplied && selectedDetour && (
          <div className="card" style={{ marginBottom:'16px', borderColor:'rgba(16,185,129,0.4)', background:'rgba(16,185,129,0.06)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
              <CheckCircle2 size={20} style={{ color:'var(--emerald)' }} />
              <div>
                <span style={{ fontWeight:700, color:'#34d399' }}>Detour Applied: {selectedDetour.emoji} {selectedDetour.label}</span>
                <p style={{ fontSize:'0.8rem', color:'var(--text-secondary)', marginTop:'4px' }}>{selectedDetour.outcome}</p>
              </div>
            </div>
          </div>
        )}

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:'16px' }}>
          {DETOUR_PATHS.map(detour => {
            const isSelected = selectedDetour?.id === detour.id
            return (
              <div key={detour.id} className="card" style={{
                cursor:'pointer',
                borderColor: isSelected ? detour.color : undefined,
                boxShadow: isSelected ? `0 0 25px ${detour.color}30` : undefined,
                transition:'all 0.3s',
              }} onClick={() => !detourApplied && applyDetour(detour)}>
                <div style={{ textAlign:'center', marginBottom:'16px' }}>
                  <span style={{ fontSize:'2.2rem' }}>{detour.emoji}</span>
                </div>
                <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1rem', fontWeight:700, textAlign:'center', marginBottom:'8px' }}>
                  {detour.label}
                </h3>

                {/* Risk Meter */}
                <div style={{ marginBottom:'14px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.72rem', color:'var(--text-muted)', marginBottom:'4px' }}>
                    <span>Distraction Risk</span>
                    <span style={{ color: detour.color, fontWeight:700 }}>{detour.risk}%</span>
                  </div>
                  <div className="risk-bar" style={{ height:'8px' }}>
                    <div className="risk-fill" style={{
                      width: `${detour.risk}%`,
                      background: detour.color,
                      borderRadius:'4px',
                      boxShadow: `0 0 8px ${detour.color}60`,
                    }} />
                  </div>
                </div>

                <p style={{ fontSize:'0.8rem', color:'var(--text-secondary)', lineHeight:1.6, textAlign:'center' }}>
                  {detour.outcome}
                </p>

                {!detourApplied && (
                  <button className={`btn ${detour.id === 'micro' ? 'btn-primary' : 'btn-secondary'} btn-sm`} style={{ width:'100%', justifyContent:'center', marginTop:'16px' }}>
                    {detour.id === 'micro' ? '✨ Recommended' : 'Choose This Path'}
                  </button>
                )}
                {isSelected && (
                  <div style={{ textAlign:'center', marginTop:'12px', fontSize:'0.78rem', color:'var(--emerald)', fontWeight:700 }}>
                    ✅ Applied
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 3: COGNITIVE DEBT
      ═══════════════════════════════════════════════════════════════════ */}
      <section style={{ marginBottom:'32px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'6px' }}>
          <BatteryWarning size={20} style={{ color:'var(--amber)' }} />
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.2rem', fontWeight:700 }}>Cognitive Debt</h2>
        </div>
        <p style={{ fontSize:'0.85rem', color:'var(--text-secondary)', marginBottom:'20px', maxWidth:'700px', lineHeight:1.7 }}>
          <strong style={{ color:'var(--text-primary)' }}>How it works:</strong> Like financial debt, pushing yourself when you're exhausted <strong style={{ color:'#fbbf24' }}>"borrows" energy from tomorrow</strong>. This live graph projects your energy for the next 12 hours. The red zone shows where you will crash if you don't rest.
        </p>

        <div className="grid-2">
          {/* Chart */}
          <div className="card">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
              <h3 style={{ fontFamily:'var(--font-display)', fontSize:'0.95rem', fontWeight:700 }}>
                Energy Forecast (Next 12 Hours)
              </h3>
              <div style={{ display:'flex', gap:'12px', fontSize:'0.72rem' }}>
                <span style={{ display:'flex', alignItems:'center', gap:'4px' }}>
                  <span style={{ width:'10px', height:'3px', background:'var(--rose)', borderRadius:'2px', display:'inline-block' }} /> If you push
                </span>
                <span style={{ display:'flex', alignItems:'center', gap:'4px' }}>
                  <span style={{ width:'10px', height:'3px', background:'var(--emerald)', borderRadius:'2px', display:'inline-block' }} /> With break
                </span>
              </div>
            </div>

            <div style={{ width:'100%', height:'280px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={energyData} margin={{ top:5, right:10, bottom:5, left:-10 }}>
                  <defs>
                    <linearGradient id="gradRed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradGreen" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="time" tick={{ fill:'#9090b8', fontSize:11 }} axisLine={{ stroke:'rgba(255,255,255,0.08)' }} />
                  <YAxis domain={[0, 100]} tick={{ fill:'#9090b8', fontSize:11 }} axisLine={{ stroke:'rgba(255,255,255,0.08)' }} />
                  <Tooltip
                    contentStyle={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'8px', fontSize:'0.8rem' }}
                    labelStyle={{ color:'var(--text-primary)', fontWeight:700 }}
                  />
                  <ReferenceLine y={30} stroke="#f43f5e" strokeDasharray="6 4" label={{ value:'CRASH ZONE', position:'insideTopLeft', fill:'#f43f5e', fontSize:10, fontWeight:700 }} />
                  <Area type="monotone" dataKey="current" name="If you push" stroke="#f43f5e" strokeWidth={2} fill="url(#gradRed)" />
                  <Area type="monotone" dataKey="withBreak" name="With break" stroke="#10b981" strokeWidth={2} fill="url(#gradGreen)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Debt Summary Card */}
          <div className="card" style={{ display:'flex', flexDirection:'column' }}>
            <h3 style={{ fontFamily:'var(--font-display)', fontSize:'0.95rem', fontWeight:700, marginBottom:'16px' }}>
              Your Debt Breakdown
            </h3>

            {/* Debt Hours */}
            <div style={{ textAlign:'center', padding:'24px 0', flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
              <div style={{ position:'relative', width:'120px', height:'120px', margin:'0 auto' }}>
                <svg viewBox="0 0 120 120" style={{ width:'100%', height:'100%', transform:'rotate(-90deg)' }}>
                  <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
                  <circle cx="60" cy="60" r="50" fill="none" stroke="var(--amber)" strokeWidth="10"
                    strokeDasharray={314} strokeDashoffset={314 - (314 * Math.min(debtHours / 5, 1))}
                    strokeLinecap="round" style={{ filter:'drop-shadow(0 0 6px rgba(245,158,11,0.5))' }} />
                </svg>
                <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                  <span style={{ fontSize:'1.8rem', fontWeight:800, color:'var(--amber)', fontFamily:'var(--font-display)' }}>{debtHours}h</span>
                  <span style={{ fontSize:'0.65rem', color:'var(--text-muted)' }}>owed</span>
                </div>
              </div>
              <p style={{ fontSize:'0.82rem', color:'var(--text-secondary)', marginTop:'16px', maxWidth:'240px', lineHeight:1.6 }}>
                You've overworked by <strong style={{ color:'white' }}>{debtHours} hours</strong> this week. Tomorrow's peak focus will be <strong style={{ color:'#fb7185' }}>mathematically reduced by {Math.round(debtHours * 12)}%</strong>.
              </p>
            </div>

            {/* Impact Breakdown */}
            <div style={{ borderTop:'1px solid var(--border)', paddingTop:'16px', display:'flex', flexDirection:'column', gap:'10px' }}>
              {[
                { label: 'Tomorrow\'s Morning Focus', value: `${Math.max(30, 85 - Math.round(debtHours * 12))}%`, color: debtHours > 3 ? 'var(--rose)' : 'var(--amber)', icon: <Brain size={14} /> },
                { label: 'Recovery Time Needed', value: `${Math.round(debtHours * 1.5)}h sleep`, color: 'var(--cyan)', icon: <Clock size={14} /> },
                { label: 'Productivity Trend', value: debtHours > 2 ? 'Declining ↓' : 'Stable →', color: debtHours > 2 ? 'var(--rose)' : 'var(--emerald)', icon: <TrendingDown size={14} /> },
              ].map(item => (
                <div key={item.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 12px', background:'var(--bg-glass)', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)' }}>
                  <span style={{ fontSize:'0.8rem', color:'var(--text-secondary)', display:'flex', alignItems:'center', gap:'8px' }}>
                    {item.icon} {item.label}
                  </span>
                  <span style={{ fontSize:'0.82rem', fontWeight:700, color: item.color, fontFamily:'var(--font-mono)' }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <button className="btn btn-primary" style={{ width:'100%', justifyContent:'center', marginTop:'16px' }}
              onClick={() => { setDebtHours(prev => Math.max(0, prev - 1)); if(navigator.vibrate) navigator.vibrate(100); }}>
              <Zap size={14} /> Log 1 Hour of Rest
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
