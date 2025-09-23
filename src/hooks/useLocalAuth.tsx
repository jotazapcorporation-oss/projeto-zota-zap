import { useState, useEffect, createContext, useContext } from 'react'

interface User {
  id: string
  email: string
  name?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock users for demo purposes
const DEMO_USERS = [
  { id: '1', email: 'demo@financas.com', password: 'demo123', name: 'Usuário Demo' },
  { id: '2', email: 'teste@financas.com', password: 'teste123456', name: 'Usuário Teste' }
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('jsap-user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        localStorage.removeItem('jsap-user')
      }
    }
    setLoading(false)
  }, [])

  const signIn = async (email: string, password: string) => {
    const demoUser = DEMO_USERS.find(u => u.email === email && u.password === password)
    
    if (demoUser) {
      const user = { id: demoUser.id, email: demoUser.email, name: demoUser.name }
      setUser(user)
      localStorage.setItem('jsap-user', JSON.stringify(user))
      return { error: null }
    }
    
    return { error: { message: 'Email ou senha incorretos' } }
  }

  const signOut = async () => {
    setUser(null)
    localStorage.removeItem('jsap-user')
  }

  const resetPassword = async (email: string) => {
    // Simulate password reset
    const demoUser = DEMO_USERS.find(u => u.email === email)
    if (demoUser) {
      return { error: null }
    }
    return { error: { message: 'Email não encontrado' } }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}