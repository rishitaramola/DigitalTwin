const MOOD_BARS = [
  { key: 'focus_score', label: 'Focus', color: 'linear-gradient(90deg, var(--violet), var(--violet-light))' },
  { key: 'energy_level', label: 'Energy', color: 'linear-gradient(90deg, var(--cyan), var(--cyan-light))' },
  { key: 'stress_level', label: 'Stress', color: 'linear-gradient(90deg, var(--rose), #f87171)', invert: true },
  { key: 'anxiety_index', label: 'Anxiety', color: 'linear-gradient(90deg, var(--amber), #fcd34d)', invert: true },
]

const STATE_CONFIG = {
  focused: { color: '#34d399', bg: 'rgba(16,185,129,0.1)', emoji: '🎯' },
  neutral: { color: 'var(--text-secondary)', bg: 'var(--bg-glass)', emoji: '😐' },
  distracted: { color: '#fbbf24', bg: 'rgba(245,158,11,0.1)', emoji: '📱' },
  stressed: { color: '#fb7185', bg: 'rgba(244,63,94,0.1)', emoji: '😤' },
  fatigued: { color: '#818cf8', bg: 'rgba(129,140,248,0.1)', emoji: '😴' },
}

export default function MoodFingerprint({ mood = {} }) {
  const state = STATE_CONFIG[mood.emotional_state] || STATE_CONFIG.neutral

  return (
    <div>
      {/* Emotional state badge */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '10px 14px',
        background: state.bg,
        border: `1px solid ${state.color}30`,
        borderRadius: 'var(--radius-sm)',
        marginBottom: '20px'
      }}>
        <span style={{ fontSize: '1.3rem' }}>{state.emoji}</span>
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: state.color, textTransform: 'capitalize' }}>
            {mood.emotional_state || 'Monitoring...'}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Current Emotional State</div>
        </div>
      </div>

      {/* Bars */}
      {MOOD_BARS.map(({ key, label, color, invert }) => {
        const raw = mood[key] ?? 0
        const pct = Math.round(raw * 100)
        return (
          <div key={key} className="mood-bar-row">
            <span className="mood-bar-label">{label}</span>
            <div className="mood-bar-track">
              <div
                className="mood-bar-fill"
                style={{ width: `${pct}%`, background: color }}
              />
            </div>
            <span className="mood-bar-value">{pct}%</span>
          </div>
        )
      })}

      {/* Passive signal details */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: '8px', marginTop: '16px'
      }}>
        {[
          { label: 'Typing Speed', value: `${mood.typing_speed_wpm || '--'} WPM`, icon: '⌨️' },
          { label: 'Notif. Lag', value: `${mood.notification_lag_seconds || '--'}s`, icon: '🔔' },
          { label: 'App Switch Rate', value: `${mood.app_switch_rate || '--'}/min`, icon: '🔄' },
        ].map(({ label, value, icon }) => (
          <div key={label} style={{
            padding: '10px',
            background: 'var(--bg-glass)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)'
          }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              {icon} {label}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>
              {value}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
