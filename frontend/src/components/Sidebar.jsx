import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, GitBranch, Dna, Ghost, Trophy, Activity, Shield
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Live Twin', description: 'Real-time state' },
  { to: '/simulation', icon: GitBranch, label: 'Run Simulation', description: 'What if?' },
  { to: '/shadow-self', icon: Ghost, label: 'Shadow Self', description: 'Two futures' },
  { to: '/habit-dna', icon: Dna, label: 'Habit DNA', description: 'Weekly report' },
  { to: '/success', icon: Trophy, label: 'Success Mining', description: 'Your best days' },
]

export default function Sidebar() {
  return (
    <aside style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: 'var(--sidebar-width)',
      height: '100vh',
      background: 'rgba(10, 10, 22, 0.92)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 16px',
      zIndex: 100,
      boxShadow: '4px 0 40px rgba(0,0,0,0.4)'
    }}>
      {/* Logo */}
      <div style={{ marginBottom: '36px', paddingLeft: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <div style={{
            width: '34px', height: '34px',
            background: 'linear-gradient(135deg, var(--violet), var(--cyan))',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 15px var(--violet-glow)',
            flexShrink: 0
          }}>
            <Activity size={18} color="white" />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.2 }}>
              Digital Twin
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              of You
            </div>
          </div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '3px 8px', borderRadius: '100px',
          background: 'rgba(16,185,129,0.08)',
          border: '1px solid rgba(16,185,129,0.2)',
          width: 'fit-content'
        }}>
          <div style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: 'var(--emerald)',
            animation: 'glow-pulse 2s infinite'
          }} />
          <span style={{ fontSize: '0.65rem', color: '#34d399', fontWeight: 600 }}>TWIN ACTIVE</span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--text-muted)', padding: '0 8px', marginBottom: '8px', textTransform: 'uppercase' }}>
          Modules
        </div>
        {navItems.map(({ to, icon: Icon, label, description }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 12px',
              borderRadius: '10px',
              textDecoration: 'none',
              transition: 'all 0.2s',
              background: isActive ? 'rgba(124,58,237,0.15)' : 'transparent',
              border: `1px solid ${isActive ? 'rgba(124,58,237,0.35)' : 'transparent'}`,
              color: isActive ? 'var(--violet-light)' : 'var(--text-secondary)',
            })}
          >
            {({ isActive }) => (
              <>
                <Icon size={17} style={{ flexShrink: 0, color: isActive ? 'var(--violet-light)' : 'var(--text-muted)' }} />
                <div>
                  <div style={{ fontSize: '0.83rem', fontWeight: 600, lineHeight: 1.2 }}>{label}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: 1 }}>{description}</div>
                </div>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div style={{
        borderTop: '1px solid var(--border)',
        paddingTop: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px' }}>
          <Shield size={13} color="var(--violet-light)" />
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>100% On-Device · Private</span>
        </div>
        <div style={{ padding: '0 8px' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Bit Rebels · Hack-o-Holic 4.0</div>
          <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', opacity: 0.6, marginTop: '2px' }}>Rishita Ramola · Graphic Era</div>
        </div>
      </div>
    </aside>
  )
}
