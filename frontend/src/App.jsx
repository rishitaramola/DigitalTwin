import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Simulation from './pages/Simulation'
import HabitDNA from './pages/HabitDNA'
import ShadowSelf from './pages/ShadowSelf'
import SuccessArchaeology from './pages/SuccessArchaeology'
import Chat from './pages/Chat'

function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  )
}

export default App
