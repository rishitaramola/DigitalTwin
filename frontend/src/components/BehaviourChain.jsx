const APP_ICONS = {
  deep_work: '💻',
  email: '📧',
  news: '📰',
  social_media: '📱',
  video: '▶️',
  messaging: '💬',
  utility: '⚙️',
  idle: '😴',
  unknown: '❓'
}

const RISK_CHAIN = ['email', 'news', 'social_media']

export default function BehaviourChain({ chain = [], pattern = null }) {
  const isChainRisky = chain.length >= 2 &&
    chain.slice(-2).every(item => RISK_CHAIN.includes(item))

  const getNodeClass = (item, index) => {
    const isLast = index === chain.length - 1
    const isDanger = isChainRisky && index >= chain.length - 2
    if (isDanger) return 'chain-node chain-node-danger'
    if (isLast) return 'chain-node chain-node-active'
    return 'chain-node'
  }

  return (
    <div>
      {/* Chain nodes */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
        {chain.length === 0 ? (
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Monitoring... no chain detected yet
          </span>
        ) : (
          chain.map((item, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className={getNodeClass(item, i)}>
                <span>{APP_ICONS[item] || '●'}</span>
                <span style={{ textTransform: 'capitalize', fontSize: '0.8rem' }}>
                  {item.replace('_', ' ')}
                </span>
              </span>
              {i < chain.length - 1 && (
                <span className="chain-arrow">→</span>
              )}
            </span>
          ))
        )}
      </div>

      {/* Pattern detected */}
      {pattern && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 14px',
          background: 'rgba(244,63,94,0.08)',
          border: '1px solid rgba(244,63,94,0.25)',
          borderRadius: 'var(--radius-sm)',
          animation: 'fade-in-up 0.3s ease'
        }}>
          <span style={{ fontSize: '1.1rem' }}>⚠️</span>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fb7185' }}>
              Pattern Detected: {pattern.replace('_', ' ').toUpperCase()}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Your twin recognizes this chain. You can break it at this step.
            </div>
          </div>
        </div>
      )}

      {/* Chain risk bar */}
      {chain.length > 0 && (
        <div style={{ marginTop: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Chain Risk
            </span>
            <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: isChainRisky ? '#fb7185' : 'var(--emerald)' }}>
              {isChainRisky ? 'HIGH' : chain.length >= 1 ? 'MEDIUM' : 'LOW'}
            </span>
          </div>
          <div className={`risk-bar ${isChainRisky ? 'risk-high' : 'risk-medium'}`}>
            <div
              className="risk-fill"
              style={{ width: `${Math.min(100, chain.length * 30)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
