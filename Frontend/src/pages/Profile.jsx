import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config/api';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/auth/profile`, { withCredentials: true });
      setUser(res.data.user);
      setFirstName(res.data.user.firstName);
      setLastName(res.data.user.lastName || '');
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      navigate('/login');
    }
  };

  const handleSave = async () => {
    if (!firstName.trim()) {
      setMessage({ type: 'error', text: 'First name is required' });
      return;
    }

    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await axios.put(`${API_URL}/api/auth/profile`, {
        firstName: firstName.trim(),
        lastName: lastName.trim()
      }, { withCredentials: true });

      setUser(res.data.user);
      setEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFirstName(user.firstName);
    setLastName(user.lastName || '');
    setEditing(false);
    setMessage({ type: '', text: '' });
  };

  const getInitials = () => {
    if (!user) return '?';
    const first = user.firstName?.[0] || '';
    const last = user.lastName?.[0] || '';
    return (first + last).toUpperCase() || '?';
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <motion.div 
            className="loading-spinner"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <motion.div 
        className="profile-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.button 
          className="back-btn"
          onClick={() => navigate('/')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Chat
        </motion.button>

        <div className="profile-header">
          <motion.div 
            className="profile-avatar-large"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
          >
            {getInitials()}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Profile Settings
          </motion.h1>
          <motion.p 
            className="profile-email"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {user.email}
          </motion.p>
        </div>

        {message.text && (
          <motion.div 
            className={`profile-message ${message.type}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {message.text}
          </motion.div>
        )}

        <motion.div 
          className="profile-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="profile-section">
            <h3>Personal Information</h3>
            
            <div className="profile-field">
              <label>First Name</label>
              {editing ? (
                <motion.input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter first name"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  autoFocus
                />
              ) : (
                <p>{user.firstName}</p>
              )}
            </div>

            <div className="profile-field">
              <label>Last Name</label>
              {editing ? (
                <motion.input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter last name"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                />
              ) : (
                <p>{user.lastName || '—'}</p>
              )}
            </div>

            <div className="profile-field">
              <label>Email</label>
              <p className="email-readonly">{user.email}</p>
              <span className="field-note">Email cannot be changed</span>
            </div>
          </div>

          <div className="profile-actions">
            {editing ? (
              <>
                <motion.button
                  className="btn-cancel"
                  onClick={handleCancel}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={saving}
                >
                  Cancel
                </motion.button>
                <motion.button
                  className="btn-save"
                  onClick={handleSave}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={saving}
                >
                  {saving ? (
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      ⟳
                    </motion.span>
                  ) : 'Save Changes'}
                </motion.button>
              </>
            ) : (
              <motion.button
                className="btn-edit"
                onClick={() => setEditing(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit Profile
              </motion.button>
            )}
          </div>
        </motion.div>

        <motion.div 
          className="profile-info-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3>Account Info</h3>
          <div className="info-item">
            <span className="info-label">Account Type</span>
            <span className="info-value">
              {user.googleId ? '🔗 Google' : user.githubId ? '🔗 GitHub' : '📧 Email'}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Member Since</span>
            <span className="info-value">
              {new Date(user.createdAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Profile;
