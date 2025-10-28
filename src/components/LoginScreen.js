import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { showNotification } from '../utils/notifications';
import { Lock, User, Eye, EyeOff, LogIn, AlertCircle, ChevronRight } from 'lucide-react';


const LoginScreen = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      setError('Please fill in all fields');
      showNotification('Please fill in all fields', 'error');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error: dbError } = await supabase
        .from('users')
        .select('*')
        .eq('username', formData.username)
        .eq('password', formData.password)
        .single();

      if (dbError || !data) {
        setError('Invalid username or password. Please try again.');
        showNotification('Invalid username or password', 'error');
        setLoading(false);
        return;
      }

      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.id);

      sessionStorage.setItem('user', JSON.stringify({
        id: data.id,
        username: data.username,
        full_name: data.full_name,
        email: data.email
      }));

      showNotification(`Welcome back, ${data.full_name || data.username}!`, 'success');
      onLoginSuccess();

    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
      showNotification('An error occurred during login', 'error');
      setLoading(false);
    }
  };


  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: 'url(https://lh3.googleusercontent.com/gps-cs-s/AG0ilSx6KzoCJZv5Ije3v7vti8u7Jfe1FYyR-tH08Cr_tUpoaeJRbkgHsKxaIPNHLfgl_aGogdQ4iuEJGXbHnUXkHu-GuMmCPE1LBMZTUitczBGQGjtekZxPFA18RPJH5ws8EcmWtzDI6g=s1360-w1360-h1020-rw)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: 'var(--space-lg)'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.11)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(0, 0, 0, 0)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.54)',
        maxWidth: '440px',
        width: '100%',
        padding: 'var(--space-2xl)',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Logo Section */}
        <div style={{
          textAlign: 'center',
          marginBottom: 'var(--space-2xl)'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'transparent',
            borderRadius: 'var(--radius-xl)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto var(--space-lg)',
            padding: 0
          }}>
            <img 
              src="/assets/KKW.png" 
              alt="KKWIEER Logo" 
              style={{
                width: '200px',
                height: '200px',
                objectFit: 'contain'
              }}
            />
          </div>
          <h1 style={{
            fontSize: '1.875rem',
            fontWeight: '700',
            color: '#000000',
            marginBottom: 'var(--space-xs)',
            letterSpacing: '-0.5px'
          }}>
            UniMail
          </h1>
          <p style={{
            fontSize: '1.0rem',
            color: '#000000',
            margin: 0,
            fontWeight: '500'
          }}>
            KKWIEER - University Email Management System
          </p>
        </div>

        {/* Ready to Dive In Button or Login Form */}
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            style={{
              width: '100%',
              padding: '1.25rem',
              fontSize: '1.125rem',
              fontWeight: '700',
              background: '#000000',
              color: '#ffffff',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              transition: 'all 0.3s ease',
              animation: 'pulse 2s infinite'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Ready To Dive In?
            <ChevronRight size={24} color="#ffffff" />
          </button>
        ) : (
          <form onSubmit={handleSubmit} style={{
            animation: 'fadeIn 0.5s ease-out'
          }}>
            {/* Username Field */}
            <div className="form-group" style={{ marginBottom: 'var(--space-lg)' }}>
              <label className="form-label" style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-sm)',
                marginBottom: 'var(--space-sm)',
                fontSize: '0.95rem',
                fontWeight: '600',
                color: '#000000'
              }}>
                <User size={18} color="#000000" />
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Enter your username"
                className="form-input-custom"
                disabled={loading}
                autoComplete="username"
                autoFocus
                style={{
                  width: '100%',
                  padding: 'var(--space-md) var(--space-lg)',
                  fontSize: '0.95rem',
                  border: error ? '2px solid #ef4444' : '2px solid rgba(0, 0, 0, 1)',
                  borderRadius: 'var(--radius-md)',
                  transition: 'all var(--transition-base)',
                  outline: 'none',
                  background: 'rgba(255, 255, 255, 0)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  color: '#000000'
                }}
              />
            </div>

            {/* Password Field */}
            <div className="form-group" style={{ marginBottom: error ? 'var(--space-md)' : 'var(--space-xl)' }}>
              <label className="form-label" style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-sm)',
                marginBottom: 'var(--space-sm)',
                fontSize: '0.95rem',
                fontWeight: '600',
                color: '#000000'
              }}>
                <Lock size={18} color="#000000" />
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className="form-input-custom"
                  disabled={loading}
                  autoComplete="current-password"
                  style={{
                    width: '100%',
                    padding: 'var(--space-md) var(--space-lg)',
                    paddingRight: '3rem',
                    fontSize: '0.95rem',
                    border: error ? '2px solid #ef4444' : '2px solid rgba(0, 0, 0, 1)',
                    borderRadius: 'var(--radius-md)',
                    transition: 'all var(--transition-base)',
                    outline: 'none',
                    background: 'rgba(255, 255, 255, 0)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    color: '#000000'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  style={{
                    position: 'absolute',
                    right: 'var(--space-md)',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#000000',
                    padding: 'var(--space-xs)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'color var(--transition-fast)'
                  }}
                >
                  {showPassword ? <EyeOff size={20} color="#000000" /> : <Eye size={20} color="#000000" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div 
                role="alert" 
                aria-live="assertive"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-sm)',
                  padding: 'var(--space-md) var(--space-lg)',
                  marginBottom: 'var(--space-lg)',
                  backgroundColor: 'rgba(254, 226, 226, 0.9)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1px solid #ef4444',
                  borderRadius: 'var(--radius-md)',
                  color: '#991b1b',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  animation: 'slideIn 0.3s ease-out'
                }}
              >
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: 'var(--space-lg)',
                fontSize: '1rem',
                fontWeight: '600',
                background: '#000000',
                color: '#ffffff',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-sm)',
                transition: 'all var(--transition-base)',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? (
                <>
                  <div className="loading-spinner" style={{
                    width: '20px',
                    height: '20px',
                    borderWidth: '2px',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    borderTopColor: 'white'
                  }}></div>
                  Signing In...
                </>
              ) : (
                <>
                  <LogIn size={20} color="#ffffff" />
                  Sign In
                </>
              )}
            </button>
          </form>
        )}
      </div>

      <style>
        {`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes pulse {
            0%, 100% {
              box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.7);
            }
            50% {
              box-shadow: 0 0 20px 5px rgba(0, 0, 0, 0.3);
            }
          }
          
          .form-input-custom::placeholder {
            color: rgba(0, 0, 0, 0.73);
          }
          
          .form-input-custom:focus {
            border: 2px solid rgba(0, 0, 0, 1) !important;
            outline: none !important;
          }
        `}
      </style>
    </div>
  );
};

export default LoginScreen;

