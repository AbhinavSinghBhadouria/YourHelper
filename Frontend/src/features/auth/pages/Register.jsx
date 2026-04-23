
import React, { useState } from 'react'
import "../authStyles/register.css"
import { useNavigate, Link } from 'react-router-dom'
import { toast } from "react-toastify"
import { useAuth } from '../hooks/useAuth'

const Register = () => {
  const { handleRegister } = useAuth()
  const [formData, setFormData] = useState({ username: "", email: "", password: "" })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await handleRegister({ 
        username: formData.username, 
        email: formData.email, 
        password: formData.password 
      })
      toast.success("Account created successfully ✅")
      setTimeout(() => navigate("/dashboard"), 1500)
    } catch (err) {
      console.error(err)
      const errorMessage = err.response?.data?.message || "Registration failed ❌"
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-page">

      {/* Loading overlay */}
      {loading && (
        <div className="register-overlay">
          <div className="register-spinner" />
          <p>Creating your account...</p>
        </div>
      )}

      {/* Top Nav */}
      <header className="register-nav">
        <Link to="/" className="register-nav__logo">YourHelper</Link>
        <nav className="register-nav__links">
          <Link to="/features" className="register-nav__link">Features</Link>
          <Link to="/pricing" className="register-nav__link">Pricing</Link>
          <Link to="/blog" className="register-nav__link">Help</Link>
        </nav>
        <Link to="/login" className="register-nav__login">Login</Link>
      </header>

      {/* Page body */}
      <main className="register-body">

        {/* Card */}
        <div className="register-card">
          <div className="register-card__header">
            <h1>Create Account</h1>
            <p>Start your interview prep journey today.</p>
          </div>

          <form className="register-form" onSubmit={handleSubmit}>

            <div className="register-field">
              <label htmlFor="username">USERNAME</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="e.g. john_doe"
                required
                disabled={loading}
              />
            </div>

            <div className="register-field">
              <label htmlFor="email">EMAIL</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@company.com"
                required
                disabled={loading}
              />
            </div>

            <div className="register-field">
              <label htmlFor="password">PASSWORD</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>

            <button type="submit" className="register-btn" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="register-signin-text">
            Already have an account?{" "}
            <Link to="/login" className="register-signin-link">Sign In</Link>
          </p>
        </div>

        {/* Trust badges */}
        <div className="register-badges">
          <div className="register-badge">
            <span className="register-badge__icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </span>
            <div>
              <p className="register-badge__title">SECURE</p>
              <p className="register-badge__sub">Encrypted Signup</p>
            </div>
          </div>
          <div className="register-badge">
            <span className="register-badge__icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </span>
            <div>
              <p className="register-badge__title">FREE TO START</p>
              <p className="register-badge__sub">No card required</p>
            </div>
          </div>
          <div className="register-badge">
            <span className="register-badge__icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </span>
            <div>
              <p className="register-badge__title">SUPPORT</p>
              <p className="register-badge__sub">24/7 Assistance</p>
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}

export default Register
