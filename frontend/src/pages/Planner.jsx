import { useState, useEffect, useRef, useCallback } from 'react'
import axios from 'axios'
import { Check, Plus, Calendar, Clock, Vibrate, Lightbulb, Trash2, ShieldAlert, BellRing, Zap, Pause, Play, Volume2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

// ── Autopilot Breaker prompts ────────────────────────────────────
const WAKE_UP_PROMPTS = [
  { question: "Are you still on your most important task right now?", emoji: "🎯" },
  { question: "Quick — what are you doing RIGHT NOW? Is it what you planned?", emoji: "⚡" },
  { question: "STOP. Breathe. Are you scrolling or working?", emoji: "🛑" },
  { question: "Your Twin detected autopilot. What's in front of you right now?", emoji: "🧠" },
  { question: "Time check! Have you moved closer to your goal in the last 15 mins?", emoji: "⏰" },
  { question: "Are you in the app you're supposed to be in? Be honest.", emoji: "👁️" },
]

const VIBRATION_PATTERNS = {
  gentle: [200, 100, 200],
  alert: [500, 200, 500, 200, 500],
  sos: [100, 50, 100, 50, 100, 200, 300, 100, 300, 100, 300, 200, 100, 50, 100, 50, 100],
  earthquake: [1000, 100, 1000, 100, 1000],
}

export default function Planner() {
  const { token } = useAuth()
  const [tasks, setTasks] = useState([])
  const [twinInsight, setTwinInsight] = useState("Loading twin intelligence...")
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [activeTab, setActiveTab] = useState('day')
  const [isRoutineMode, setIsRoutineMode] = useState(false)
  const [loading, setLoading] = useState(true)

  // ── Autopilot Breaker State ──
  const [breakerActive, setBreakerActive] = useState(false)
  const [breakerInterval, setBreakerInterval] = useState(15) // minutes
  const [breakerTimeLeft, setBreakerTimeLeft] = useState(0)
  const [showBreakAlert, setShowBreakAlert] = useState(false)
  const [currentPrompt, setCurrentPrompt] = useState(WAKE_UP_PROMPTS[0])
  const [flashActive, setFlashActive] = useState(false)
  const [breakerStats, setBreakerStats] = useState({ triggered: 0, onTrack: 0, offTrack: 0 })
  const timerRef = useRef(null)
  const audioCtxRef = useRef(null)

  // ── Task Fetching ──
  const fetchTasks = async () => {
    try {
      const res = await axios.get('/api/tasks', { headers: { Authorization: `Bearer ${token}` } })
      setTasks(res.data.tasks)
      setTwinInsight(res.data.twin_insight)
      setLoading(false)
    } catch (error) {
      console.error("Failed to fetch tasks", error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  // ── Vibration ──
  const triggerVibration = (pattern = [200, 100, 200]) => {
    if (navigator.vibrate) {
      navigator.vibrate(pattern)
    }
  }

  // ── Aggressive Alarm Siren via Web Audio API ──
  const playAlertTone = useCallback(() => {
    try {
      const ctx = audioCtxRef.current || new (window.AudioContext || window.webkitAudioContext)()
      audioCtxRef.current = ctx
      if (ctx.state === 'suspended') ctx.resume()

      const now = ctx.currentTime

      // ── SIREN: 3 sweeping alarm bursts ──
      for (let burst = 0; burst < 3; burst++) {
        const startTime = now + burst * 0.9

        // Main siren oscillator (sweeps 400Hz → 900Hz → 400Hz)
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(400, startTime)
        osc.frequency.linearRampToValueAtTime(900, startTime + 0.35)
        osc.frequency.linearRampToValueAtTime(400, startTime + 0.7)
        gain.gain.setValueAtTime(0.35, startTime)
        gain.gain.setValueAtTime(0.35, startTime + 0.6)
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.8)
        osc.start(startTime)
        osc.stop(startTime + 0.85)

        // Sub-bass punch for physical "thump" feeling
        const sub = ctx.createOscillator()
        const subGain = ctx.createGain()
        sub.connect(subGain)
        subGain.connect(ctx.destination)
        sub.type = 'sine'
        sub.frequency.setValueAtTime(80, startTime)
        subGain.gain.setValueAtTime(0.5, startTime)
        subGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15)
        sub.start(startTime)
        sub.stop(startTime + 0.2)
      }

      // ── Final high-pitched attention ping ──
      const ping = ctx.createOscillator()
      const pingGain = ctx.createGain()
      ping.connect(pingGain)
      pingGain.connect(ctx.destination)
      ping.type = 'sine'
      ping.frequency.setValueAtTime(1200, now + 2.7)
      pingGain.gain.setValueAtTime(0.3, now + 2.7)
      pingGain.gain.exponentialRampToValueAtTime(0.001, now + 3.2)
      ping.start(now + 2.7)
      ping.stop(now + 3.3)

    } catch { /* Audio not available on this device */ }
  }, [])

  // ── Fire the Autopilot Breaker ──
  const fireBreaker = useCallback(() => {
    const randomPrompt = WAKE_UP_PROMPTS[Math.floor(Math.random() * WAKE_UP_PROMPTS.length)]
    setCurrentPrompt(randomPrompt)
    setShowBreakAlert(true)
    setBreakerStats(prev => ({ ...prev, triggered: prev.triggered + 1 }))

    // Aggressive vibration
    triggerVibration(VIBRATION_PATTERNS.sos)

    // Audio beep
    playAlertTone()

    // Red screen flash effect
    setFlashActive(true)
    setTimeout(() => setFlashActive(false), 600)
    setTimeout(() => { setFlashActive(true); setTimeout(() => setFlashActive(false), 400) }, 800)
  }, [playAlertTone])

  // ── Timer Logic ──
  useEffect(() => {
    if (breakerActive) {
      setBreakerTimeLeft(breakerInterval * 60)
      timerRef.current = setInterval(() => {
        setBreakerTimeLeft(prev => {
          if (prev <= 1) {
            fireBreaker()
            return breakerInterval * 60 // Loop again
          }
          return prev - 1
        })
      }, 1000)
    } else {
      clearInterval(timerRef.current)
      setBreakerTimeLeft(0)
    }
    return () => clearInterval(timerRef.current)
  }, [breakerActive, breakerInterval, fireBreaker])

  const handleBreakerResponse = (onTrack) => {
    setShowBreakAlert(false)
    if (onTrack) {
      setBreakerStats(prev => ({ ...prev, onTrack: prev.onTrack + 1 }))
      triggerVibration([100]) // Gentle confirmation
    } else {
      setBreakerStats(prev => ({ ...prev, offTrack: prev.offTrack + 1 }))
      triggerVibration(VIBRATION_PATTERNS.alert) // Warning vibration
    }
  }

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  // ── Task Handlers ──
  const handleCreateTask = async (e) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return
    try {
      await axios.post('/api/tasks', {
        title: newTaskTitle,
        horizon: isRoutineMode ? "day" : activeTab,
        is_routine: isRoutineMode
      }, { headers: { Authorization: `Bearer ${token}` } })
      setNewTaskTitle('')
      triggerVibration([100])
      fetchTasks()
    } catch (err) {
      console.error("Error creating task", err)
    }
  }

  const handleToggleTask = async (task) => {
    const newStatus = task.status === 'pending' ? 'completed' : 'pending'
    try {
      await axios.put(`/api/tasks/${task.id}`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } })
      if (newStatus === 'completed') {
        triggerVibration([200, 100, 200])
      }
      fetchTasks()
    } catch (err) {
      console.error("Failed to update status", err)
    }
  }

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`/api/tasks/${taskId}`, { headers: { Authorization: `Bearer ${token}` } })
      triggerVibration([50])
      fetchTasks()
    } catch (err) {
      console.error("Failed to delete task", err)
    }
  }

  const filteredTasks = tasks.filter(t => t.is_routine === (isRoutineMode ? 1 : 0) && (!isRoutineMode ? t.horizon === activeTab : true))

  return (
    <div>
      {/* ═══ RED FLASH OVERLAY ═══ */}
      {flashActive && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'radial-gradient(circle at center, rgba(244,63,94,0.4), rgba(244,63,94,0.15))',
          pointerEvents: 'none',
          animation: 'fade-in-up 0.1s ease',
        }} />
      )}

      {/* ═══ AUTOPILOT BREAKER MODAL ═══ */}
      {showBreakAlert && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
        }}>
          <div style={{
            background: 'var(--bg-elevated)', border: '2px solid rgba(244,63,94,0.6)',
            borderRadius: 'var(--radius-lg)', padding: '40px', maxWidth: '480px', width: '100%',
            boxShadow: '0 0 80px rgba(244,63,94,0.3), 0 24px 80px rgba(0,0,0,0.6)',
            textAlign: 'center', animation: 'fade-in-up 0.3s ease',
          }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '16px', animation: 'float 2s ease-in-out infinite' }}>
              {currentPrompt.emoji}
            </div>
            <div style={{
              fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase',
              color: '#fb7185', marginBottom: '12px',
            }}>
              ⚠️ AUTOPILOT BREAKER ACTIVATED
            </div>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700,
              color: 'var(--text-primary)', marginBottom: '24px', lineHeight: 1.5,
            }}>
              {currentPrompt.question}
            </h2>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => handleBreakerResponse(true)}
                style={{
                  flex: 1, padding: '14px 20px', borderRadius: 'var(--radius-sm)',
                  background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.1))',
                  border: '1px solid rgba(16,185,129,0.4)', color: '#34d399',
                  cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem',
                  transition: 'all 0.2s',
                }}
              >
                ✅ Yes, I'm on track!
              </button>
              <button
                onClick={() => handleBreakerResponse(false)}
                style={{
                  flex: 1, padding: '14px 20px', borderRadius: 'var(--radius-sm)',
                  background: 'linear-gradient(135deg, rgba(244,63,94,0.2), rgba(244,63,94,0.1))',
                  border: '1px solid rgba(244,63,94,0.4)', color: '#fb7185',
                  cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem',
                  transition: 'all 0.2s',
                }}
              >
                😬 No, I drifted
              </button>
            </div>

            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '16px' }}>
              This alert uses vibration + sound to pull you out of autopilot mode and back into conscious decision-making.
            </p>
          </div>
        </div>
      )}

      {/* ═══ PAGE HEADER ═══ */}
      <div className="page-header">
        <h1 className="page-title">Twin Planner</h1>
        <p className="page-subtitle">Tasks, routines & the Autopilot Breaker — keep your brain sharp.</p>
      </div>

      {/* ═══ AUTOPILOT BREAKER CONTROL PANEL ═══ */}
      <div className="card" style={{ marginBottom: '24px', borderColor: breakerActive ? 'rgba(244,63,94,0.4)' : 'var(--border)', background: breakerActive ? 'rgba(244,63,94,0.04)' : 'var(--bg-card)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <ShieldAlert size={18} style={{ color: '#fb7185' }} /> Autopilot Breaker (DND Override)
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '16px' }}>
              <strong style={{ color: 'var(--text-primary)' }}>What this does:</strong> When you're deep in work, your brain often switches to "autopilot" — you start scrolling, daydreaming, or losing focus without even noticing. This feature <strong style={{ color: '#fb7185' }}>fires a vibration + sound + visual flash</strong> at the interval you set, forcing you to answer one question: <em>"Am I doing what I planned?"</em>. It breaks through Do Not Disturb to wake up your conscious brain.
            </p>

            {/* Interval selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Check every:</span>
              {[5, 10, 15, 25, 45].map(mins => (
                <button
                  key={mins}
                  onClick={() => { setBreakerInterval(mins); if(breakerActive) setBreakerTimeLeft(mins * 60) }}
                  style={{
                    padding: '6px 14px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700,
                    border: `1px solid ${breakerInterval === mins ? '#fb7185' : 'var(--border)'}`,
                    background: breakerInterval === mins ? 'rgba(244,63,94,0.15)' : 'transparent',
                    color: breakerInterval === mins ? '#fb7185' : 'var(--text-muted)',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>

          {/* Right side: status + toggle */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', minWidth: '160px' }}>
            {breakerActive && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 800, color: '#fb7185' }}>
                  {formatTime(breakerTimeLeft)}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>until next check</div>
              </div>
            )}
            <button
              onClick={() => setBreakerActive(!breakerActive)}
              style={{
                padding: '12px 24px', borderRadius: 'var(--radius-sm)', fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                fontSize: '0.85rem', border: 'none', transition: 'all 0.2s',
                background: breakerActive ? 'linear-gradient(135deg, var(--rose), #e11d48)' : 'linear-gradient(135deg, var(--violet), #9d4edd)',
                color: 'white', boxShadow: breakerActive ? '0 4px 20px rgba(244,63,94,0.4)' : '0 4px 20px rgba(124,58,237,0.4)',
              }}
            >
              {breakerActive ? <><Pause size={16} /> Stop Breaker</> : <><Play size={16} /> Activate Breaker</>}
            </button>
            <button
              onClick={() => fireBreaker()}
              style={{
                padding: '8px 16px', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem',
                background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600,
              }}
            >
              <BellRing size={12} /> Test Now
            </button>
          </div>
        </div>

        {/* Stats row */}
        {breakerStats.triggered > 0 && (
          <div style={{ display: 'flex', gap: '16px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
            {[
              { label: 'Times Triggered', value: breakerStats.triggered, color: 'var(--text-primary)', icon: <Volume2 size={12} /> },
              { label: 'On Track', value: breakerStats.onTrack, color: 'var(--emerald)', icon: <Check size={12} /> },
              { label: 'Drifted', value: breakerStats.offTrack, color: '#fb7185', icon: <ShieldAlert size={12} /> },
              { label: 'Focus Rate', value: breakerStats.triggered > 0 ? `${Math.round((breakerStats.onTrack / breakerStats.triggered) * 100)}%` : '—', color: 'var(--cyan-light)', icon: <Zap size={12} /> },
            ].map(stat => (
              <div key={stat.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'var(--bg-glass)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ color: stat.color }}>{stat.icon}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stat.label}:</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: stat.color, fontFamily: 'var(--font-mono)' }}>{stat.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ═══ TWIN INSIGHT ═══ */}
      <div className="card" style={{ marginBottom: '24px', borderColor: 'rgba(124,58,237,0.2)', background: 'rgba(124,58,237,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ background: 'var(--violet-glow)', padding: '10px', borderRadius: '50%' }}>
            <Lightbulb size={24} color="#ddd" />
          </div>
          <div>
            <h4 style={{ margin: '0 0 5px 0', fontSize: '0.9rem', color: 'var(--text-primary)' }}>AI Clone Insight</h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{twinInsight}</p>
          </div>
        </div>
      </div>

      {/* ═══ MODES & TABS ═══ */}
      <div className="tab-group" style={{ marginBottom: '20px', width: 'fit-content' }}>
        <button className={`tab-btn ${!isRoutineMode ? 'active' : ''}`} onClick={() => setIsRoutineMode(false)}>
          To-Do List
        </button>
        <button className={`tab-btn ${isRoutineMode ? 'active' : ''}`} onClick={() => setIsRoutineMode(true)}>
          Daily Routine
        </button>
      </div>

      {!isRoutineMode && (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          {['day', 'week', 'month', 'year'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`badge ${activeTab === tab ? 'badge-cyan' : ''}`}
              style={{ cursor: 'pointer', padding: '8px 16px', fontSize: '0.8rem', textTransform: 'capitalize' }}
            >
              {tab}
            </button>
          ))}
        </div>
      )}

      {/* ═══ ADD TASK ═══ */}
      <form onSubmit={handleCreateTask} style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder={`Add a new ${isRoutineMode ? 'routine' : activeTab + ' task'}...`}
          style={{ flex: 1, background: 'var(--bg-glass)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '14px 18px', color: 'white', fontSize: '0.9rem', outline: 'none' }}
        />
        <button type="submit" className="btn btn-primary">
          <Plus size={16} /> Add
        </button>
      </form>

      {/* ═══ TASK LIST ═══ */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {loading ? (
          <div className="card skeleton" style={{ height: '100px' }} />
        ) : filteredTasks.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <Calendar size={36} style={{ color: 'var(--text-muted)', marginBottom: '12px', opacity: 0.5 }} />
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>No {isRoutineMode ? 'routines' : `${activeTab}ly tasks`} found. Add your first one above!</p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <div key={task.id} className="card card-sm" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              opacity: task.status === 'completed' ? 0.55 : 1,
              transition: 'all 0.25s',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                <button
                  onClick={() => handleToggleTask(task)}
                  style={{
                    width: '24px', height: '24px', borderRadius: '6px', flexShrink: 0,
                    border: `2px solid ${task.status === 'completed' ? 'var(--emerald)' : 'var(--text-muted)'}`,
                    background: task.status === 'completed' ? 'var(--emerald)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  }}
                >
                  {task.status === 'completed' && <Check size={14} color="#000" />}
                </button>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: task.status === 'completed' ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}>
                    {task.title}
                  </p>
                  {isRoutineMode && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                      <Clock size={11} /> Daily Habit
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDeleteTask(task.id)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '5px' }}
                title="Delete task"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
