import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Simulation from './pages/Simulation'
import HabitDNA from './pages/HabitDNA'
import ShadowSelf from './pages/ShadowSelf'
import SuccessArchaeology from './pages/SuccessArchaeology'
import Chat from './pages/Chat'
import Login from './pages/Login'
import Signup from './pages/Signup'

// Wrapper: redirect to /login if not authenticated
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null // wait for localStorage hydration
  if (!user) return <Navigate to="/login" replace />
  return children
}

// Main app shell (sidebar + content)
function AppShell() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/simulation" element={<Simulation />} />
          <Route path="/habit-dna" element={<HabitDNA />} />
          <Route path="/shadow-self" element={<ShadowSelf />} />
          <Route path="/success-archaeology" element={<SuccessArchaeology />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
          {/* Protected routes */}
          <Route path="/*" element={<ProtectedRoute><AppShell /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

// Redirect logged-in users away from login/signup
function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

export default App
