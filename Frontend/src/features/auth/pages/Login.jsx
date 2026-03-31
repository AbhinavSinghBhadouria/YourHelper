import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import "../authStyles/login.css"

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const navigate = useNavigate()

  useEffect(() => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleLogin,
      })

      window.google.accounts.id.renderButton(
        document.getElementById("google_sign_in"),
        { theme: 'outline', size: 'large' }
      )
    }
  }, [])

  const handleGoogleLogin = async (response) => {
    setLoading(true)
    setError("")

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token: response.credential })
      })

      const data = await res.json()

      if (res.ok) {
        navigate("/dashboard")
      } else {
        setError(data.message || "Google login failed")
      }
    } catch (err) {
      console.error(err)
      setError("An error occurred during Google login")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    // Basic validation
    if (!formData.email || !formData.password) {
      setError("All fields are required")
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (res.ok) {
        navigate("/dashboard")
      } else {
        setError(data.message || "Login failed")
      }
    } catch (err) {
      console.error(err)
      setError("An error occurred during login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className='main-container'>
      <div className='form-container'>

        <div className="header">
          <h1>Welcome Back</h1>
          <p>Let’s build something great together</p>
        </div>

        <form onSubmit={handleSubmit}>

          <div className='input-group'>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder='Enter your email'
              disabled={loading}
            />
          </div>

          <div className='input-group'>
            <div className="password-row">
              <label htmlFor="password">Password</label>
              <span className="forgot">Forgot?</span>
            </div>

            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>

          {error && <p className="error-text">{error}</p>}

          <button 
            type="submit" 
            className="button primary-button"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <p className="signup-text">
          Don’t have an account? <Link to="/register"><span>Sign Up</span></Link>
        </p>

        <div id="google_sign_in" />

      </div>
    </main>
  )
}

export default Login
