
import React, { useState } from 'react'
import "../authStyles/register.css"
import { useNavigate, Link } from 'react-router'
import { toast } from "react-toastify"

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: ""
  })

  const [loading, setLoading] = useState(false)

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData)
      })

      let data = {}
      try {
        data = await res.json()
      } catch { }

      if (res.ok) {
        toast.success("Account created successfully ✅")
        setTimeout(() => navigate("/dashboard"), 1500) // like agr user pheli barr register krr rha h then why do we have the need to send the user to the login page
      } else {
        toast.error(data.message || "Registration failed ❌")
      }
    } catch (err) {
      console.error(err)
      toast.error("Something went wrong 🚨")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className='main-container'>

      {loading && (
        <div className="loading-overlay">
          <div className="loader"></div>
          <p>Creating your account...</p>
        </div>
      )}

      <div className='form-container'>

        <div className="header">
          <h1>Create Account</h1>
          <p>Let’s start build something great together</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className='input-group'>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter username"
              required
            />
          </div>

          <div className='input-group'>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder='Enter your email'
              required
            />
          </div>

          <div className='input-group'>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="button primary-button"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>

        </form>

        <p className="signup-text">
          Already have an Account? <Link to={"/login"}><span>Sign in</span></Link>
        </p>

      </div>
    </main>
  )
}

export default Register

