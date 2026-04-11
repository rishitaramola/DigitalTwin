import { useEffect, useRef } from 'react'

/**
 * Animated circular SVG gauge for the Twin Divergence Score.
 */
export default function TwinDivergenceGauge({ score = 0, grade = 'A', trend = 'improving', size = 180 }) {
  const circleRef = useRef(null)
  const radius = (size / 2) - 18
  const circumference = 2 * Math.PI * radius
  const strokeDash = circumference - (score / 100) * circumference

  const gradeColors = {
    'A': { stroke: 'var(--emerald)', glow: 'rgba(16,185,129,0.4)', text: '#34d399' },
    'B': { stroke: 'var(--cyan)', glow: 'var(--cyan-glow)', text: 'var(--cyan-light)' },
    'C': { stroke: 'var(--amber)', glow: 'var(--amber-glow)', text: '#fbbf24' },
    'D': { stroke: 'var(--rose)', glow: 'var(--rose-glow)', text: '#fb7185' },
  }

  const colors = gradeColors[grade] || gradeColors['B']

  const getRiskLabel = (s) => {
    if (s < 20) return 'Aligned'
    if (s < 40) return 'Slight Drift'
    if (s < 65) return 'Diverging'
    return 'High Risk'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Glow effect */}
        <div style={{
          position: 'absolute',
          width: size * 0.65,
          height: size * 0.65,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
          animation: 'glow-pulse 3s ease-in-out infinite'
        }} />

        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Background ring */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={10}
          />
          {/* Progress ring */}
          <circle
            ref={circleRef}
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke={colors.stroke}
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDash}
            style={{
              transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34,1.56,0.64,1)',
              filter: `drop-shadow(0 0 8px ${colors.glow})`
            }}
          />
        </svg>

        {/* Center text */}
        <div style={{
          position: 'absolute',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: size > 150 ? '2.2rem' : '1.6rem',
            fontWeight: 800,
            color: colors.text,
            lineHeight: 1,
            textShadow: `0 0 20px ${colors.glow}`
          }}>
            {score}%
          </div>
          <div style={{
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
            fontWeight: 600,
            letterSpacing: '0.05em',
            marginTop: '4px',
            textTransform: 'uppercase'
          }}>
            Divergence
          </div>
        </div>
      </div>

      {/* Grade + Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '8px',
          background: `rgba(${grade === 'A' ? '16,185,129' : grade === 'B' ? '6,182,212' : grade === 'C' ? '245,158,11' : '244,63,94'}, 0.15)`,
          border: `1px solid ${colors.stroke}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem',
          color: colors.text
        }}>
          {grade}
        </div>
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {getRiskLabel(score)}
          </div>
          <div style={{ fontSize: '0.72rem', color: trend === 'improving' ? 'var(--emerald)' : 'var(--rose)' }}>
            {trend === 'improving' ? '↑ Improving' : '↓ Declining'}
          </div>
        </div>
      </div>
    </div>
  )
}
