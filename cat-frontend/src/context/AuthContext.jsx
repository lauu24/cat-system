import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null)
  const [token, setToken] = useState(null)

  // Al cargar la app, revisar si hay sesión guardada
  useEffect(() => {
    const tokenGuardado = localStorage.getItem('token')
    const usuarioGuardado = localStorage.getItem('usuario')
    if (tokenGuardado && usuarioGuardado) {
      setToken(tokenGuardado)
      setUsuario(JSON.parse(usuarioGuardado))
    }
  }, [])

  const login = (data) => {
    setToken(data.token)
    setUsuario(data.usuario)
    localStorage.setItem('token', data.token)
    localStorage.setItem('usuario', JSON.stringify(data.usuario))
  }

  const logout = () => {
    setToken(null)
    setUsuario(null)
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
  }

  const esAdmin = usuario?.rol === 'ADMINISTRADOR'

  return (
    <AuthContext.Provider value={{ usuario, token, login, logout, esAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)