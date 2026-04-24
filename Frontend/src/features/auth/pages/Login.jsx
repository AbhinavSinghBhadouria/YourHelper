import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import "../authStyles/login.css"
import { useAuth } from '../hooks/useAuth'

let googleInitialized = false;

const Login = () => {
  const { handleLogin, handleGoogleLogin } = useAuth()
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    googleInitialized = false; // Reset on mount
    const initGoogle = () => {
      if (window.google && !googleInitialized) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: (resp) => onGoogleLogin(resp),
        })
        window.google.accounts.id.renderButton(
          document.getElementById("googleSignInDiv"),
          { theme: "outline", size: "large", text: "continue_with", width: 300 }
        )
        googleInitialized = true;
      }
    };

    if (window.google) {
      initGoogle();
    } else {
      const interval = setInterval(() => {
        if (window.google) {
          clearInterval(interval);
          initGoogle();
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [])

  const onGoogleLogin = async (response) => {
    setLoading(true)
    try {
      await handleGoogleLogin(response.credential)
      toast.success("Welcome back! 👋")
      navigate("/dashboard")
    } catch (err) {
      console.error(err)
      toast.error(err.message || "Google login failed")
    } finally {
      setLoading(false)
    }
  }



  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.email || !formData.password) {
      toast.warning("Please enter both email and password")
      return
    }
    setLoading(true)
    try {
      await handleLogin({ email: formData.email, password: formData.password })
      toast.success("Login successful!")
      navigate("/dashboard")
    } catch (err) {
      console.error(err)
      const errorMessage = err.response?.data?.message || "Login failed ❌"
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">

      {/* Top Nav */}
      <header className="login-nav">
        <Link to="/" className="login-nav__logo">YourHelper</Link>
        <nav className="login-nav__links">
          <Link to="/features" className="login-nav__link">Features</Link>
          <Link to="/pricing" className="login-nav__link">Pricing</Link>
          <Link to="/blog" className="login-nav__link">Help</Link>
        </nav>
        <Link to="/register" className="login-nav__signup">Sign Up</Link>
      </header>

      {/* Page body */}
      <main className="login-body">

        {/* Card */}
        <div className="login-card">
          <div className="login-card__header">
            <h1>Welcome Back</h1>
            <p>Let's build something great together.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-field">
              <label htmlFor="email">EMAIL</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@company.com"
                disabled={loading}
              />
            </div>

            <div className="login-field">
              <div className="login-field__row">
                <label htmlFor="password">PASSWORD</label>
                <span className="login-forgot">Forgot password?</span>
              </div>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            {/* Errors are now handled by global toast notifications */}

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* OR divider */}
          <div className="login-divider"><span>OR</span></div>

          {/* Official Google sign-in button container */}
          <div className="login-google-wrapper" style={{ display: 'flex', justifyContent: 'center' }}>
            <div id="googleSignInDiv"></div>
          </div>

          <p className="login-signup-text">
            Don't have an account?{" "}
            <Link to="/register" className="login-signup-link">Sign Up</Link>
          </p>
        </div>

        {/* Trust badges */}
        <div className="login-badges">
          <div className="login-badge">
            <span className="login-badge__icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </span>
            <div>
              <p className="login-badge__title">SECURE</p>
              <p className="login-badge__sub">Encrypted Login</p>
            </div>
          </div>
          <div className="login-badge">
            <span className="login-badge__icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </span>
            <div>
              <p className="login-badge__title">SUPPORT</p>
              <p className="login-badge__sub">24/7 Assistance</p>
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}

export default Login
