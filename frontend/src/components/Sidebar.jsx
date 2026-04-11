import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Calendar, GitBranch, Dna, Ghost, Trophy, Activity, MessageSquare, LogOut, AlertTriangle, X, UserMinus, UserX, Shield, Radar
} from 'lucide-react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Live Twin', description: 'Real-time state' },
  { to: '/planner', icon: Calendar, label: 'Twin Planner', description: 'Tasks & Daily Routines' },
  { to: '/pre-emptive-radar', icon: Radar, label: 'Pre-emptive Radar', description: 'Immediate warnings' },
  { to: '/simulation', icon: GitBranch, label: 'Run Simulation', description: 'What if?' },
  { to: '/shadow-self', icon: Ghost, label: 'Shadow Self', description: 'Focused vs Distracted' },
  { to: '/chat', icon: MessageSquare, label: 'AI Clone Chat', description: 'Talk to your twin' },
  { to: '/habit-dna', icon: Dna, label: 'Habit DNA', description: 'Weekly narrative report' },
  { to: '/success-archaeology', icon: Trophy, label: 'Success Archaeology', description: 'Mine your best days' },
]

export default function Sidebar() {
  const { user, logout, token } = useAuth()
  const navigate = useNavigate()

  // Account Settings Modals
  const [modalState, setModalState] = useState(null)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleDeactivate = async () => {
    if (!password) { setError('Password is required'); return }
    setProcessing(true)
    try {
      await axios.post('/api/auth/deactivate', { password }, { headers: { Authorization: `Bearer ${token}` } })
      handleLogout()
    } catch (err) {
      setError(err.response?.data?.detail || 'Incorrect password.')
      setProcessing(false)
    }
  }

  const handleDelete = async () => {
    if (!password) { setError('Password is required'); return }
    setProcessing(true)
    try {
      await axios.post('/api/auth/delete', { password }, { headers: { Authorization: `Bearer ${token}` } })
      handleLogout()
    } catch (err) {
      setError(err.response?.data?.detail || 'Incorrect password.')
      setProcessing(false)
    }
  }

  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : '?'

  const ModalOverlay = ({ children, title, subtitle }) => (
    <div className="fixed inset-0 w-screen h-screen z-50 bg-black/80 backdrop-blur-md flex items-center justify-center">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 w-full max-w-sm shadow-[0_20px_60px_rgba(0,0,0,0.5)] relative">
        <button onClick={() => { setModalState(null); setPassword(''); setError('') }} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
          <X size={20} />
        </button>
        <div className="text-center mb-5">
          <div className="inline-flex p-3 bg-red-500/10 rounded-full mb-4">
            <AlertTriangle size={28} className="text-red-400" />
          </div>
          <h2 className="text-xl text-white font-bold m-0">{title}</h2>
          <p className="mt-2 text-sm text-gray-400">{subtitle}</p>
        </div>
        
        {error && <div className="p-2 mb-4 bg-red-500/10 text-red-400 rounded-lg text-sm text-center border border-red-500/30">{error}</div>}
        {children}
      </div>
    </div>
  )

  return (
    <>
      <aside className="w-60 h-screen bg-gray-950 border-r border-gray-800 flex flex-col py-6 shadow-2xl fixed top-0 left-0 z-20 overflow-y-auto">
        
        {/* Brand Header */}
        <div className="w-full px-6 mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500 p-[2px] shadow-[0_0_15px_rgba(168,85,247,0.4)]">
            <div className="w-full h-full bg-gray-900 rounded-[10px] flex items-center justify-center">
              <Activity className="text-purple-400" size={20} />
            </div>
          </div>
          <div>
            <h1 className="text-gray-100 font-extrabold tracking-tight text-lg leading-tight">Digital Twin</h1>
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-widest">Of You</p>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 w-full flex flex-col gap-2 px-4 overflow-y-auto hidden-scrollbar">
          {navItems.map(({ to, icon: Icon, label, description }) => (
            <NavLink 
              key={to} 
              to={to} 
              className={({ isActive }) => `
                w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 text-left relative overflow-hidden group
                ${isActive ? 'bg-purple-900/40 border border-purple-500/30' : 'hover:bg-gray-800/60 border border-transparent hover:border-gray-700/50'}
              `}
            >
              {({ isActive }) => (
                <>
                  {isActive && <div className="absolute left-0 top-0 w-1 h-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]" />}
                  <Icon size={20} className={isActive ? "text-purple-400 shrink-0" : "text-gray-500 group-hover:text-gray-300 shrink-0"} />
                  <div className="flex flex-col">
                    <span className={`text-sm font-semibold tracking-wide ${isActive ? "text-purple-100" : "text-gray-300"}`}>
                      {label}
                    </span>
                    <span className="text-[10px] text-gray-500 font-medium">
                      {description}
                    </span>
                  </div>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="w-full px-4 pt-4 border-t border-gray-800 flex flex-col gap-2">
          {user && (
            <div className="flex items-center gap-3 p-2 rounded-xl bg-purple-900/10 border border-purple-500/20 mb-1">
              <div className="w-8 h-8 rounded-lg shrink-0 bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-gray-200 truncate">{user.username}</div>
                <div className="text-[10px] text-gray-500 truncate">{user.email}</div>
              </div>
            </div>
          )}

          <button onClick={handleLogout} className="flex items-center gap-2 p-2 rounded-lg border border-gray-700 hover:bg-gray-800 text-gray-300 transition-colors text-xs font-semibold w-full">
            <LogOut size={14} className="text-gray-500" /> Sign Out
          </button>
          
          <div className="flex gap-2">
            <button onClick={() => setModalState('deactivate')} className="flex-1 flex items-center justify-center gap-1.5 p-2 rounded-lg bg-orange-500/5 border border-dashed border-orange-500/30 hover:bg-orange-500/10 text-orange-400 text-[10px] font-semibold transition-colors">
              <UserMinus size={12} /> Deactivate
            </button>
            <button onClick={() => setModalState('delete_confirm')} className="flex-1 flex items-center justify-center gap-1.5 p-2 rounded-lg bg-red-500/5 border border-dashed border-red-500/30 hover:bg-red-500/10 text-red-400 text-[10px] font-semibold transition-colors">
              <UserX size={12} /> Delete
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 pt-2 mt-1">
            <Shield size={12} className="text-purple-400" />
            <span className="text-[10px] text-gray-500">100% On-Device · Private</span>
          </div>
        </div>
      </aside>

      {/* MODALS */}
      {modalState === 'deactivate' && (
        <ModalOverlay title="Deactivate Account" subtitle="Your data will be preserved, but you will be signed out. You can reactivate by logging in again.">
          <input type="password" placeholder="Confirm your password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 rounded-lg bg-white/5 border border-gray-700 text-white mb-4 outline-none focus:border-orange-500" />
          <button onClick={handleDeactivate} disabled={processing} className="w-full p-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-black font-bold border-none transition-colors disabled:opacity-50">
            {processing ? 'Processing...' : 'Confirm Deactivation'}
          </button>
        </ModalOverlay>
      )}

      {modalState === 'delete_confirm' && (
        <ModalOverlay title="Delete Account" subtitle="Are you absolutely sure you want to permanently delete your Digital Twin data? This cannot be undone.">
          <div className="flex flex-col gap-2">
            <button onClick={() => setModalState('deactivate')} className="w-full p-3 rounded-lg bg-orange-500/10 border border-orange-500/40 hover:bg-orange-500/20 text-orange-400 font-bold transition-colors">
              No, just Deactivate instead
            </button>
            <button onClick={() => { setModalState('delete_password'); setError('') }} className="w-full p-3 rounded-lg border border-red-500/40 hover:bg-red-500/10 text-red-400 font-semibold transition-colors">
              Yes, proceed to Delete
            </button>
          </div>
        </ModalOverlay>
      )}

      {modalState === 'delete_password' && (
        <ModalOverlay title="Final Confirmation" subtitle="Enter your password to permanently delete your account.">
          <input type="password" placeholder="Confirm your password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 rounded-lg bg-white/5 border border-red-500/30 focus:border-red-500 text-white mb-4 outline-none" />
          <button onClick={handleDelete} disabled={processing} className="w-full p-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold border-none transition-colors disabled:opacity-50">
            {processing ? 'Processing...' : 'Permanently Delete'}
          </button>
        </ModalOverlay>
      )}
    </>
  )
}
