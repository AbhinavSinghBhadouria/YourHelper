import React, { useState } from 'react'
import "../authStyles/login.css"
import { useNavigate,Link } from 'react-router'
const Login = () => {
  const [formData, setFormData] = useState({
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

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log(formData)
  }

  const navigate= useNavigate()

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
            />
          </div>

          <button type="submit" className="button primary-button">
            Login
          </button>

        </form>

        <p className="signup-text">
          Don’t have an account? <Link to={"/register"}><span>Sign Up</span></Link>
        </p>

      </div>
    </main>
  )
}

export default Login