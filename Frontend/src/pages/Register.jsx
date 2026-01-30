import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import '../styles/theme.css';
import '../styles/auth.css';
import API_URL from '../config/api';

const Register = () => {
  const [form, setForm] = useState({ email: '', firstname: '', lastname: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await axios.post(`${API_URL}/api/auth/register`, {
        email: form.email,
        fullName: {
          firstName: form.firstname,
          lastName: form.lastname
        },
        password: form.password
      }, {
        withCredentials: true
      });
      console.log(res);
      navigate("/");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-container">
      <motion.div 
        className="auth-card"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <header className="auth-header">
          <motion.div 
            className="auth-logo-text"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.1 }}
          >
            Jarvis AI
          </motion.div>
          <h1 className="auth-title">Create account</h1>
          <p className="auth-subtitle">Join us and start exploring Jarvis AI</p>
        </header>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="field-group">
            <label htmlFor="email">Email address</label>
            <motion.input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
              whileFocus={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            />
          </div>

          <div className="field-row">
            <div className="field-group">
              <label htmlFor="firstname">First name</label>
              <motion.input
                id="firstname"
                name="firstname"
                placeholder="Jane"
                value={form.firstname}
                onChange={handleChange}
                required
                whileFocus={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              />
            </div>
            <div className="field-group">
              <label htmlFor="lastname">Last name</label>
              <motion.input
                id="lastname"
                name="lastname"
                placeholder="Doe"
                value={form.lastname}
                onChange={handleChange}
                required
                whileFocus={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              />
            </div>
          </div>

          <div className="field-group">
            <label htmlFor="password">Password</label>
            <motion.input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Create a password (min 6 characters)"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
              whileFocus={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            />
          </div>

          {error && (
            <motion.p 
              style={{ color: '#ef4444', fontSize: '14px', margin: 0 }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {error}
            </motion.p>
          )}

          <motion.button
            type="submit"
            className="auth-submit"
            disabled={submitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {submitting ? 'Creating account...' : 'Create Account'}
          </motion.button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;

