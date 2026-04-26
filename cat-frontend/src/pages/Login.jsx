import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import '../styles/Login.css'
import logo from '../assets/logo.svg'
import openEye from '../assets/open-eye.svg'
import closedEye from '../assets/closed-eye.svg'

export default function Login() {
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [verPassword, setVerPassword] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/login', form)
      login(res.data)
    } catch {
      setError('Email o contraseña incorrectos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">

      <img src={logo} alt="CAT Logo" className="login-logo" />
      <h1 className="login-title">CAT</h1>
      <p className="login-subtitle">Control de Activos Tecnológicos</p>

      <div className="login-card">
        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label className="login-label">Usuario</label>
            <input
              type="email"
              name="email"
              placeholder="Ingrese su Email"
              value={form.email}
              onChange={handleChange}
              required
              className="login-input"
            />
          </div>

          <div className="login-field">
            <label className="login-label">Contraseña</label>
            <div className="login-password-wrap">
              <input
                type={verPassword ? 'text' : 'password'}
                name="password"
                placeholder="Ingrese su contraseña"
                value={form.password}
                onChange={handleChange}
                required
                className="login-input"
              />
              <button
                type="button"
                onClick={() => setVerPassword(!verPassword)}
                className="login-eye-btn"
              >
                <img
                  src={verPassword ? closedEye : openEye}
                  alt="toggle password"
                  className="login-eye-icon"
                />
              </button>
            </div>
          </div>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" disabled={loading} className="login-btn">
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>

    </div>
  )
}