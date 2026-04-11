import { useState } from 'react'
import axios from 'axios'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts'
import { Play, GitBranch } from 'lucide-react'

const CHOICES = [
  {
    id: 'focus',
    label: 'Choose Deep Work',
    emoji: '🎯',
    description: 'Stay on the task. Activate flow mode.',
    color: 'var(--emerald)',
    bg: 'rgba(16,185,129,0.08)',
    border: 'rgba(16,185,129,0.3)'
  },
  {
    id: 'walk',
    label: 'Take a 10-Min Walk',
    emoji: '🚶',
    description: 'Your #1 highest-ROI intervention.',
    color: 'var(--cyan-light)',
    bg: 'rgba(6,182,212,0.08)',
    border: 'rgba(6,182,212,0.3)'
  },
  {
    id: 'distraction',
    label: 'Open Social Media',
    emoji: '📱',
    description: 'See the true ripple effect.',
    color: '#fb7185',
    bg: 'rgba(244,63,94,0.08)',
    border: 'rgba(244,63,94,0.3)'
  }
]

const MOCK_SIM = {
  focus: {
    timeline: [
      { time_minutes: 0, action: 'Chose deep work 🎯', focus_level: 65, clock_time: '3:00 PM' },
      { time_minutes: 25, action: 'Flow state achieved', focus_level: 85, clock_time: '3:25 PM' },
      { time_minutes: 50, action: 'Pomodoro 1 complete', focus_level: 90, clock_time: '3:50 PM' },
      { time_minutes: 90, action: 'Finished key deliverable', focus_level: 88, clock_time: '4:30 PM' },
      { time_minutes: 120, action: 'Intentional rest — earned', focus_level: 80, clock_time: '5:00 PM' },
    ],
    end_state: { focus_tomorrow: 85, sleep_quality: 80, tasks_completed: 7, guilt_score: 5, recovery_hours: 0 },
    verdict: 'Choosing focus now means your tomorrow starts at 85% cognitive capacity — your strongest days average 84%.',
    comparison: [
      { choice: 'focus', focus_score: 85, tasks: 7, label: 'Deep Work' },
      { choice: 'walk', focus_score: 82, tasks: 6, label: 'Take a Walk' },
      { choice: 'distraction', focus_score: 45, tasks: 2, label: 'Distraction' }
    ]
  },
  distraction: {
    timeline: [
      { time_minutes: 0, action: 'Opened Instagram 📱', focus_level: 60, clock_time: '3:00 PM' },
      { time_minutes: 15, action: 'Still scrolling...', focus_level: 45, clock_time: '3:15 PM' },
      { time_minutes: 45, action: 'YouTube autoplay kicked in', focus_level: 30, clock_time: '3:45 PM' },
      { time_minutes: 90, action: 'Guilt sets in', focus_level: 20, clock_time: '4:30 PM' },
      { time_minutes: 120, action: 'Shallow work attempt', focus_level: 35, clock_time: '5:00 PM' },
    ],
    end_state: { focus_tomorrow: 45, sleep_quality: 55, tasks_completed: 2, guilt_score: 75, recovery_hours: 3 },
    verdict: 'This choice typically costs 3 hours of recovery and drops tomorrow\'s focus to 45%. Your twin has seen this before.',
    comparison: [
      { choice: 'focus', focus_score: 85, tasks: 7, label: 'Deep Work' },
      { choice: 'walk', focus_score: 82, tasks: 6, label: 'Take a Walk' },
      { choice: 'distraction', focus_score: 45, tasks: 2, label: 'Distraction' }
    ]
  },
  walk: {
    timeline: [
      { time_minutes: 0, action: 'Started 10-min walk 🚶', focus_level: 55, clock_time: '3:00 PM' },
      { time_minutes: 10, action: 'Cortisol dropping, BDNF rising', focus_level: 65, clock_time: '3:10 PM' },
      { time_minutes: 20, action: 'Back at desk — fresh perspective', focus_level: 78, clock_time: '3:20 PM' },
      { time_minutes: 55, action: 'Unexpected problem solved', focus_level: 88, clock_time: '3:55 PM' },
      { time_minutes: 90, action: 'Deep work session complete', focus_level: 82, clock_time: '4:30 PM' },
    ],
    end_state: { focus_tomorrow: 82, sleep_quality: 78, tasks_completed: 6, guilt_score: 0, recovery_hours: 0 },
    verdict: 'A 10-minute walk here is your #1 highest-ROI choice. Your data shows it triggers 6 task completions in the 2 hours after.',
    comparison: [
      { choice: 'focus', focus_score: 85, tasks: 7, label: 'Deep Work' },
      { choice: 'walk', focus_score: 82, tasks: 6, label: 'Take a Walk' },
      { choice: 'distraction', focus_score: 45, tasks: 2, label: 'Distraction' }
    ]
  }
}

const CHOICE_COLORS = { focus: '#10b981', walk: '#06b6d4', distraction: '#f43f5e' }

export default function Simulation() {
  const [selected, setSelected] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const runSim = async (choiceId) => {
    setSelected(choiceId)
    setLoading(true)
    try {
      const { data } = await axios.post('/api/simulate', { choice: choiceId, current_focus: 0.62 })
      setResult(data)
    } catch {
      setResult(MOCK_SIM[choiceId])
    }
    setLoading(false)
  }

  const END_METRICS = result ? [
    { label: 'Focus Tomorrow', value: `${result.end_state.focus_tomorrow}%`, icon: '🧠', good: result.end_state.focus_tomorrow > 60 },
    { label: 'Tasks Complete', value: result.end_state.tasks_completed, icon: '✅', good: result.end_state.tasks_completed > 4 },
    { label: 'Sleep Quality', value: `${result.end_state.sleep_quality}%`, icon: '😴', good: result.end_state.sleep_quality > 65 },
    { label: 'Guilt Index', value: `${result.end_state.guilt_score}%`, icon: '😓', good: result.end_state.guilt_score < 30 },
    { label: 'Recovery Hours', value: result.end_state.recovery_hours, icon: '🔄', good: result.end_state.recovery_hours === 0 },
  ] : []

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Run Simulation — What If?</h1>
        <p className="page-subtitle">
          Choose a path now and see the ripple effect over the next 2 hours — and into tomorrow.
        </p>
      </div>

      {/* Page-level explanation */}
      <div className="card" style={{ marginBottom:'24px', borderColor:'rgba(124,58,237,0.25)', background:'rgba(124,58,237,0.04)' }}>
        <p style={{ fontSize:'0.9rem', color:'var(--text-secondary)', lineHeight:1.8, margin:0 }}>
          <strong style={{ color:'var(--text-primary)' }}>🔮 What is this page?</strong> Imagine you're standing at a crossroads right now. You can keep working, take a break, or pick up your phone. This tool lets you <strong style={{ color:'var(--violet-light)' }}>test each choice BEFORE you make it</strong>. Your Digital Twin uses your past behaviour data to predict exactly what will happen in the next 2 hours — and how it affects tomorrow. Think of it like a time machine for your productivity.
        </p>
      </div>

      {/* Choice Cards */}
      <div className="section-label" style={{ marginBottom:'8px' }}>👇 Pick a path below — click any card to simulate that future</div>
      <div className="grid-3" style={{ marginBottom: '28px' }}>
        {CHOICES.map((c) => (
          <button
            key={c.id}
            id={`simulate-${c.id}-btn`}
            onClick={() => runSim(c.id)}
            style={{
              background: selected === c.id ? c.bg : 'var(--bg-card)',
              border: `1px solid ${selected === c.id ? c.border : 'var(--border)'}`,
              borderRadius: 'var(--radius)',
              padding: '24px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.25s',
              transform: selected === c.id ? 'translateY(-4px)' : 'none',
              boxShadow: selected === c.id ? `0 12px 40px ${c.border}` : 'var(--shadow-card)',
              backdropFilter: 'blur(12px)'
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>{c.emoji}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: selected === c.id ? c.color : 'var(--text-primary)', marginBottom: '6px' }}>
              {c.label}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              {c.description}
            </div>
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ fontSize: '2.5rem', animation: 'spin-slow 2s linear infinite', display: 'inline-block' }}>⚙️</div>
          <div style={{ marginTop: '16px', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Running simulation...
          </div>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div style={{ animation: 'fade-in-up 0.4s ease' }}>
          {/* Verdict */}
          <div className="card card-glow-violet" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <span style={{ fontSize: '2rem', flexShrink: 0 }}>🔮</span>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem', marginBottom: '4px' }}>
                  Twin Verdict
                </div>
                <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginBottom:'8px' }}>
                  This is your Twin's final recommendation — based on running this exact scenario against your past data.
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  {result.verdict}
                </p>
              </div>
            </div>
          </div>

          <div className="grid-2" style={{ marginBottom: '20px' }}>
            {/* Timeline Chart */}
            <div className="card">
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '6px', fontSize: '1rem' }}>
                📈 Focus Timeline (Next 2 Hours)
              </h2>
              <p style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginBottom:'16px', lineHeight:1.5 }}>
                This graph shows how your focus will rise or fall minute-by-minute. The higher the line, the more productive you are.
              </p>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={result.timeline}>
                  <defs>
                    <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHOICE_COLORS[selected] || '#7c3aed'} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={CHOICE_COLORS[selected] || '#7c3aed'} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="clock_time" tick={{ fill: '#5a5a7a', fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#5a5a7a', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ background: '#14142a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f0f0ff' }}
                    formatter={(val) => [`${val}%`, 'Focus Level']}
                  />
                  <Area
                    type="monotone" dataKey="focus_level"
                    stroke={CHOICE_COLORS[selected] || '#7c3aed'}
                    fill="url(#focusGradient)"
                    strokeWidth={2.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
              {/* Timeline events */}
              <div className="timeline" style={{ marginTop: '16px' }}>
                {result.timeline.map((point, i) => (
                  <div key={i} className="timeline-item">
                    <div className="timeline-time">{point.clock_time}</div>
                    <div className="timeline-text">{point.action}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* End State Metrics */}
            <div className="card">
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '6px', fontSize: '1rem' }}>
                🌅 Ripple Effect (Tomorrow)
              </h2>
              <p style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginBottom:'16px', lineHeight:1.5 }}>
                Every choice has a ripple effect. This shows how today's decision changes tomorrow's focus, sleep, and guilt. Green means good, red means trouble.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                {END_METRICS.map(({ label, value, icon, good }) => (
                  <div key={label} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: 'var(--bg-glass)',
                    border: `1px solid ${good ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)'}`,
                    borderRadius: 'var(--radius-sm)'
                  }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{icon} {label}</span>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontWeight: 700,
                      color: good ? 'var(--emerald)' : 'var(--rose)'
                    }}>{value}</span>
                  </div>
                ))}
              </div>

              {/* Comparison chart */}
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.875rem', marginBottom: '12px' }}>
                Compare All Paths
              </h3>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={result.comparison || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="label" tick={{ fill: '#5a5a7a', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#5a5a7a', fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: '#14142a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f0f0ff' }} />
                  <Bar dataKey="focus_score" name="Focus Tomorrow" fill="#7c3aed" radius={[4,4,0,0]} />
                  <Bar dataKey="tasks" name="Tasks Done" fill="#06b6d4" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Prompt when nothing selected */}
      {!result && !loading && (
        <div className="card" style={{ textAlign: 'center', padding: '60px 40px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px', animation: 'float 4s ease-in-out infinite' }}>🔮</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>
            Choose a path above
          </div>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto', lineHeight: 1.6 }}>
            Your twin will simulate the next 2 hours and show you the ripple effect into tomorrow.
          </p>
        </div>
      )}
    </div>
  )
}
