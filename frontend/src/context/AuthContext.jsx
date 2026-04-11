import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // On mount, restore from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('dt_token')
    const savedUser = localStorage.getItem('dt_user')
    if (savedToken && savedUser) {
      try {
        setToken(savedToken)
        setUser(JSON.parse(savedUser))
      } catch {
        localStorage.removeItem('dt_token')
        localStorage.removeItem('dt_user')
      }
    }
    setLoading(false)
  }, [])

  const login = (newToken, newUser) => {
    setToken(newToken)
    setUser(newUser)
    localStorage.setItem('dt_token', newToken)
    localStorage.setItem('dt_user', JSON.stringify(newUser))
    // Set default axios auth header
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('dt_token')
    localStorage.removeItem('dt_user')
    delete axios.defaults.headers.common['Authorization']
  }

  // Always sync axios header when token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
  }, [token])

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
