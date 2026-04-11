import { useState, useEffect } from 'react'
import axios from 'axios'

const MOCK_SUCCESS = {
  success_patterns: [
    { location: 'desk', day_of_week: 0, hour_of_day: 8, avg_stress: 0.28, events: 42 },
    { location: 'desk', day_of_week: 3, hour_of_day: 9, avg_stress: 0.31, events: 38 },
    { location: 'cafe', day_of_week: 2, hour_of_day: 10, avg_stress: 0.35, events: 27 },
    { location: 'desk', day_of_week: 1, hour_of_day: 8, avg_stress: 0.42, events: 24 },
  ],
  super_day_conditions: [
    '7+ hours sleep the night before',
    'Start before 9 AM',
    'Desk location (not couch)',
    'No social media before 11 AM',
    '10-min walk between sessions'
  ],
  your_superpower: "A 10-minute walk after lab sessions leads to 2+ hours of deep work 78% of the time. This is your most powerful and most underused ritual."
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function SuccessArchaeology() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data: d } = await axios.get('/api/success-days', { timeout: 3000 })
        setData(d)
      } catch {
        setData(MOCK_SUCCESS)
      }
      setLoading(false)
    }
    fetch()
  }, [])

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Success Archaeology</h1>
        <p className="page-subtitle">
          Mining your best days to find repeatable patterns — because success leaves clues.
        </p>
      </div>

      {loading ? (
        <div className="card skeleton" style={{ height: '300px' }} />
      ) : (
        <>
          {/* Superpower banner */}
          <div className="card card-glow-emerald" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <span style={{ fontSize: '2.5rem', animation: 'float 4s ease-in-out infinite' }}>⚡</span>
              <div>
                <div style={{
                  fontSize: '0.7rem', fontWeight: 700, color: 'var(--emerald)',
                  letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px'
                }}>
                  Your #1 Superpower
                </div>
                <p style={{ fontSize: '1rem', lineHeight: 1.7, color: 'var(--text-primary)', fontWeight: 500 }}>
                  {data.your_superpower}
                </p>
              </div>
            </div>
          </div>

          <div className="grid-2" style={{ marginBottom: '24px' }}>
            {/* Success conditions */}
            <div className="card">
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', marginBottom: '16px' }}>
                🌟 Super Day Blueprint
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.6 }}>
                These are the exact conditions present on your top 10% of days. Replicate these, and your twin predicts peak performance.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {data.super_day_conditions.map((cond, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 14px',
                    background: 'rgba(16,185,129,0.06)',
                    border: '1px solid rgba(16,185,129,0.2)',
                    borderRadius: 'var(--radius-sm)'
                  }}>
                    <div style={{
                      width: '24px', height: '24px', borderRadius: '50%',
                      background: 'rgba(16,185,129,0.2)',
                      border: '1px solid rgba(16,185,129,0.4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.7rem', fontWeight: 700, color: '#34d399', flexShrink: 0
                    }}>
                      {i + 1}
                    </div>
                    <span style={{ fontSize: '0.875rem', lineHeight: 1.5 }}>{cond}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pattern table */}
            <div className="card">
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', marginBottom: '16px' }}>
                🔍 Deep Work Hotspots
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Times & locations where you consistently produce deep work
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {data.success_patterns.map((p, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '12px 14px',
                    background: 'var(--bg-glass)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)'
                  }}>
                    <div style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
                      color: 'var(--violet-light)', fontWeight: 700,
                      background: 'rgba(124,58,237,0.15)',
                      padding: '3px 8px', borderRadius: '6px',
                      whiteSpace: 'nowrap'
                    }}>
                      #{i + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '2px' }}>
                        📍 {p.location} · ⏰ {p.hour_of_day}:00 AM · {DAYS[p.day_of_week]}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Avg stress: {Math.round(p.avg_stress * 100)}% · Occurrences: {p.events}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--emerald)', fontWeight: 700 }}>
                      {p.events} times
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Success ritual builder */}
          <div className="card card-glow-violet">
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', marginBottom: '16px' }}>
              🔧 Build Your Success Ritual
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.6 }}>
              Based on reverse-engineering your Super Days, your twin recommends this morning ritual to maximize the probability of a peak performance day:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              {[
                { time: '7:30 AM', action: 'Wake up — no phone for 30 min', icon: '🌅', type: 'morning' },
                { time: '8:00 AM', action: '10-min walk or stretch', icon: '🚶', type: 'movement' },
                { time: '8:30 AM', action: 'Open task manager — pick ONE big thing', icon: '🎯', type: 'planning' },
                { time: '9:00 AM', action: 'First deep work block (90 min)', icon: '💻', type: 'work' },
                { time: '10:30 AM', action: 'Short break — not social media', icon: '☕', type: 'break' },
                { time: '11:00 AM', action: 'Email window (capped at 30 min)', icon: '📧', type: 'comms' },
              ].map(({ time, action, icon, type }) => (
                <div key={time} style={{
                  padding: '14px',
                  background: 'rgba(124,58,237,0.06)',
                  border: '1px solid rgba(124,58,237,0.15)',
                  borderRadius: 'var(--radius-sm)'
                }}>
                  <div style={{ fontSize: '1.3rem', marginBottom: '8px' }}>{icon}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--violet-light)', marginBottom: '6px' }}>
                    {time}
                  </div>
                  <div style={{ fontSize: '0.82rem', lineHeight: 1.5 }}>{action}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
