import { useState, useEffect } from 'react'
import axios from 'axios'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const MOCK_SHADOW = {
  focused_twin: {
    choice: 'focus',
    timeline: [
      { time_minutes: 0, action: 'Chose deep work 🎯', focus_level: 65, clock_time: '3:00 PM' },
      { time_minutes: 25, action: 'Flow state activated', focus_level: 87, clock_time: '3:25 PM' },
      { time_minutes: 55, action: 'Problem solved — key breakthrough', focus_level: 92, clock_time: '3:55 PM' },
      { time_minutes: 90, action: 'Deliverable completed', focus_level: 88, clock_time: '4:30 PM' },
      { time_minutes: 120, action: 'Earned rest — logged off', focus_level: 80, clock_time: '5:00 PM' },
    ],
    end_state: { focus_tomorrow: 85, sleep_quality: 80, tasks_completed: 7, guilt_score: 5, recovery_hours: 0 }
  },
  distracted_twin: {
    choice: 'distraction',
    timeline: [
      { time_minutes: 0, action: 'Opened Instagram 📱', focus_level: 60, clock_time: '3:00 PM' },
      { time_minutes: 15, action: 'Scroll spiral begins...', focus_level: 42, clock_time: '3:15 PM' },
      { time_minutes: 45, action: 'YouTube autoplay', focus_level: 28, clock_time: '3:45 PM' },
      { time_minutes: 90, action: 'Guilt hits — self-criticism', focus_level: 18, clock_time: '4:30 PM' },
      { time_minutes: 120, action: 'Unproductive late-night push', focus_level: 32, clock_time: '5:00 PM' },
    ],
    end_state: { focus_tomorrow: 45, sleep_quality: 55, tasks_completed: 2, guilt_score: 75, recovery_hours: 3 }
  },
  divergence_in_2_hours: {
    focus_gap: 40,
    task_gap: 5,
    sleep_quality_gap: 25
  }
}

export default function ShadowSelf() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data: d } = await axios.get('/api/shadow-self', { timeout: 3000 })
        setData(d)
      } catch {
        setData(MOCK_SHADOW)
      }
      setLoading(false)
    }
    fetch()
  }, [])

  // Merge timelines for side-by-side chart
  const mergedTimeline = data ? data.focused_twin.timeline.map((pt, i) => ({
    time: pt.clock_time,
    focused: pt.focus_level,
    distracted: data.distracted_twin.timeline[i]?.focus_level || 0
  })) : []

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Shadow Self Mode</h1>
        <p className="page-subtitle">
          Two versions of you. One decision. See both futures simultaneously.
        </p>
      </div>

      {loading ? (
        <div className="card skeleton" style={{ height: '400px' }} />
      ) : (
        <>
          {/* Divernet score banner */}
          <div className="card card-glow-violet" style={{ marginBottom: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>
              The Cost of This Moment
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
              {[
                { label: 'Focus Gap (Tomorrow)', value: `+${data.divergence_in_2_hours.focus_gap}%`, color: 'var(--emerald)' },
                { label: 'Tasks Not Done', value: `-${data.divergence_in_2_hours.task_gap} tasks`, color: '#fb7185' },
                { label: 'Sleep Quality Lost', value: `-${data.divergence_in_2_hours.sleep_quality_gap}%`, color: '#fbbf24' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color }}>{value}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{label}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
              These are not warnings. They're your own historical data speaking.
            </div>
          </div>

          {/* Dual timeline chart */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', marginBottom: '20px' }}>
              ⚔️ Two Timelines — One Choice
            </h2>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={mergedTimeline}>
                <defs>
                  <linearGradient id="focusedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="distractedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="time" tick={{ fill: '#5a5a7a', fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#5a5a7a', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#14142a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f0f0ff' }} />
                <Area type="monotone" dataKey="focused" name="Focused Twin" stroke="#10b981" fill="url(#focusedGrad)" strokeWidth={2.5} />
                <Area type="monotone" dataKey="distracted" name="Distracted Twin" stroke="#f43f5e" fill="url(#distractedGrad)" strokeWidth={2.5} strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: '20px', marginTop: '12px', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
                <div style={{ width: '20px', height: '3px', background: '#10b981', borderRadius: '2px' }} />
                <span style={{ color: '#34d399' }}>Focused Twin</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
                <div style={{ width: '20px', height: '3px', background: '#f43f5e', borderRadius: '2px', borderTop: '1px dashed #f43f5e' }} />
                <span style={{ color: '#fb7185' }}>Shadow Self (Distracted)</span>
              </div>
            </div>
          </div>

          {/* Side-by-side twin view */}
          <div className="grid-2">
            {/* Focused */}
            <div className="card" style={{ background: 'rgba(16,185,129,0.05)', borderColor: 'rgba(16,185,129,0.25)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <span style={{ fontSize: '1.5rem' }}>✨</span>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#34d399' }}>Focused Twin</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>The version who chose deep work</div>
                </div>
              </div>
              <div className="timeline">
                {data.focused_twin.timeline.map((pt, i) => (
                  <div key={i} className="timeline-item">
                    <div className="timeline-time">{pt.clock_time}</div>
                    <div className="timeline-text">{pt.action}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#34d399', marginTop: '2px' }}>
                      Focus: {pt.focus_level}%
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(16,185,129,0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#34d399' }}>
                  Tomorrow: {data.focused_twin.end_state.focus_tomorrow}% focus · {data.focused_twin.end_state.tasks_completed} tasks · {data.focused_twin.end_state.guilt_score}% guilt
                </div>
              </div>
            </div>

            {/* Shadow */}
            <div className="card" style={{ background: 'rgba(244,63,94,0.05)', borderColor: 'rgba(244,63,94,0.25)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <span style={{ fontSize: '1.5rem' }}>👤</span>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#fb7185' }}>Shadow Self</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>The version who followed the chain</div>
                </div>
              </div>
              <div className="timeline" style={{ '--violet': 'var(--rose)' } }>
                {data.distracted_twin.timeline.map((pt, i) => (
                  <div key={i} className="timeline-item">
                    <div className="timeline-time">{pt.clock_time}</div>
                    <div className="timeline-text">{pt.action}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#fb7185', marginTop: '2px' }}>
                      Focus: {pt.focus_level}%
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(244,63,94,0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(244,63,94,0.2)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#fb7185' }}>
                  Tomorrow: {data.distracted_twin.end_state.focus_tomorrow}% focus · {data.distracted_twin.end_state.tasks_completed} tasks · {data.distracted_twin.end_state.guilt_score}% guilt
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
