import React from 'react';


export const LoadingScreen = () => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: 'url(https://clinquant-sprinkles-e2d6e4.netlify.app/assets/kkw-home-DwveAqbx.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
    }}>
      {/* Glassmorphism Container */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.11)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(0, 0, 0, 0)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.54)',
        padding: '3rem 4rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div className="loading-spinner" style={{
          width: '64px',
          height: '64px',
          borderWidth: '6px',
          borderColor: 'rgba(0, 0, 0, 0.2)',
          borderTopColor: '#000000',
        }}></div>
        <p style={{
          marginTop: 'var(--space-lg)',
          fontSize: '1.125rem',
          fontWeight: '600',
          color: '#000000',
        }}>
          Loading UniMail...
        </p>
      </div>
    </div>
  );
};


export const InlineLoading = () => {
  return (
    <div className="loading-spinner" style={{
      width: '16px',
      height: '16px',
      borderWidth: '2px',
    }}></div>
  );
};


export default LoadingScreen;
