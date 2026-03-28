import React, { useState } from 'react'
import "../authStyles/register.css"
import { useNavigate, Link } from 'react-router'
// import "../authStyles/login.css"
const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: ""
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (res.ok) {
        navigate("/login")
      } else {
        alert(data.message || "Registration failed")
      }
    } catch (err) {
      console.error(err)
      alert("An error occurred during registration")
    }
  }

  const navigate = useNavigate();

  return (
    <main className='main-container'>
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
              placeholder="Enter username" />
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
            />
          </div>

          <div className='input-group'>
            <div className="password-row">
              <label htmlFor="password">Password</label>
            </div>

            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className="button primary-button">
            Sign Up
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