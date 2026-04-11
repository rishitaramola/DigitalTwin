import { useState } from 'react'
import axios from 'axios'

const LEVEL_CONFIG = {
  soft_nudge: {
    bg: 'rgba(6,182,212,0.08)',
    border: 'rgba(6,182,212,0.3)',
    accent: 'var(--cyan-light)',
    emoji: '🧘',
    title: 'Focus Check'
  },
  intent_gate: {
    bg: 'rgba(124,58,237,0.08)',
    border: 'rgba(124,58,237,0.4)',
    accent: 'var(--violet-light)',
    emoji: '🎯',
    title: 'Intent Gate'
  },
  hard_friction: {
    bg: 'rgba(244,63,94,0.08)',
    border: 'rgba(244,63,94,0.4)',
    accent: '#fb7185',
    emoji: '⚠️',
    title: 'Pattern Detected — Pre-Failure Alert'
  }
}

export default function IntentGate({ intervention, onClose, onRespond }) {
  const [loading, setLoading] = useState(false)
  const [responded, setResponded] = useState(false)

  if (!intervention) return null
  const config = LEVEL_CONFIG[intervention.type] || LEVEL_CONFIG.intent_gate

  const handleChoice = async (choice) => {
    setLoading(true)
    try {
      await axios.post('/api/intent-response', {
        intervention_id: intervention.id,
        user_choice: choice
      })
    } catch (e) { /* demo fallback */ }
    setLoading(false)
    setResponded(true)
    setTimeout(() => {
      onRespond?.(choice)
      onClose?.()
    }, 1000)
  }

  return (
    <div className="modal-backdrop" onClick={onClose} id="intent-gate-modal">
      <div className="modal" onClick={e => e.stopPropagation()} style={{
        background: `rgba(14,14,26,0.97)`,
        borderColor: config.border,
        boxShadow: `0 24px 80px rgba(0,0,0,0.7), 0 0 60px ${config.border}`
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px', animation: 'float 3s ease-in-out infinite' }}>
            {config.emoji}
          </div>
          <div style={{
            display: 'inline-block',
            padding: '3px 12px', borderRadius: '100px',
            background: `${config.border}22`,
            border: `1px solid ${config.border}`,
            color: config.accent,
            fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase', marginBottom: '12px'
          }}>
            {config.title}
          </div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.3rem', fontWeight: 700,
            color: 'var(--text-primary)', lineHeight: 1.3
          }}>
            {intervention.primary_action || "What's your goal for the next 20 minutes?"}
          </div>
        </div>

        {/* Risk Score */}
        <div style={{
          background: 'var(--bg-glass)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          padding: '12px 16px',
          marginBottom: '20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Distraction Risk</span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '1rem', fontWeight: 700,
            color: intervention.risk_score > 0.7 ? '#fb7185' : '#fbbf24'
          }}>
            {Math.round(intervention.risk_score * 100)}%
          </span>
        </div>

        {/* Coach message */}
        <div style={{
          background: `${config.bg}`,
          border: `1px solid ${config.border}`,
          borderRadius: 'var(--radius-sm)',
          padding: '16px',
          marginBottom: '24px',
          position: 'relative'
        }}>
          <div style={{
            fontSize: '0.68rem', fontWeight: 700, color: config.accent,
            letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px'
          }}>
            🤖 Twin Coach
          </div>
          <p style={{
            fontSize: '0.875rem', color: 'var(--text-primary)',
            lineHeight: 1.6, fontStyle: 'italic'
          }}>
            "{intervention.coach_message}"
          </p>
        </div>

        {/* Options */}
        {!responded ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(intervention.options || []).map((opt) => (
              <button
                key={opt.id}
                id={`intent-gate-${opt.id}`}
                className={opt.primary ? 'btn btn-primary w-full' : 'btn btn-secondary w-full'}
                style={{ justifyContent: 'center', padding: '12px 20px' }}
                onClick={() => handleChoice(opt.value)}
                disabled={loading}
              >
                {opt.label}
              </button>
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center', padding: '20px',
            color: 'var(--emerald)', fontSize: '0.9rem', fontWeight: 600
          }}>
            ✓ Logged. Your twin respects your choice.
          </div>
        )}

        {/* Dismiss */}
        {!responded && (
          <button
            className="btn btn-secondary w-full"
            style={{ marginTop: '10px', justifyContent: 'center' }}
            onClick={onClose}
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  )
}
