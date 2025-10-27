import React, { useState } from 'react';
import { Mail, Database, LogOut, AlertTriangle } from 'lucide-react';


const Header = ({ currentPage, setCurrentPage, onLogout }) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);


  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  const handleLogoClick = () => {
    setCurrentPage('compose');
    scrollToTop();
  };


  const handleNavClick = (page) => {
    setCurrentPage(page);
    scrollToTop();
  };


  const handleLogout = () => {
    setShowLogoutModal(true);
  };


  const confirmLogout = () => {
    setShowLogoutModal(false);
    onLogout();
  };


  const cancelLogout = () => {
    setShowLogoutModal(false);
  };


  return (
    <>
      <header className="header header-glass">
        <div className="header-content">
          <div className="header-logo" onClick={handleLogoClick} style={{ gap: '3.5rem' }}>
            <div className="logo-icon" style={{ background: 'transparent', padding: 0 }}>
              <img 
                src="/assets/KKW.png" 
                alt="KKWIEER Logo" 
                style={{
                  width: '150px',
                  height: '150px',
                  objectFit: 'contain'
                }}
              />
            </div>
            <div className="logo-text">
              <h1 style={{ color: '#000000', fontSize: '2rem' }}>UniMail</h1>
              <p style={{ color: '#000000', opacity: 0.8 }}>KKWIEER - University Email System</p>
            </div>
          </div>
          
          <nav className="header-nav">
            <button
              className={`nav-button-custom ${currentPage === 'compose' ? 'active' : ''}`}
              onClick={() => handleNavClick('compose')}
            >
              <Mail size={18} />
              <span>Compose</span>
            </button>
            
            <button
              className={`nav-button-custom ${currentPage === 'records' ? 'active' : ''}`}
              onClick={() => handleNavClick('records')}
            >
              <Database size={18} />
              <span>Records</span>
            </button>

            <button
              className="nav-button-custom"
              onClick={handleLogout}
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
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
            maxWidth: '420px',
            width: '100%',
            padding: 'var(--space-2xl)',
            animation: 'slideIn 0.2s ease-out'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-md)',
              marginBottom: 'var(--space-lg)'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <AlertTriangle size={24} color="#ef4444" />
              </div>
              <div>
                <h3 style={{
                  margin: 0,
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: '#000000'
                }}>
                  Confirm Logout
                </h3>
              </div>
            </div>

            <p style={{
              margin: 0,
              marginBottom: 'var(--space-xl)',
              color: '#000000',
              fontSize: '0.95rem',
              lineHeight: '1.6',
              fontWeight: '500'
            }}>
              Are you sure you want to logout? You will need to login again to access the system.
            </p>

            <div style={{
              display: 'flex',
              gap: '12px',
              width: '100%'
            }}>
              <button
                onClick={cancelLogout}
                style={{
                  flex: 1,
                  padding: '15px 22px',
                  fontSize: '0.95rem',
                  background: '#000000',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: '600',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                style={{
                  flex: 1,
                  padding: '15px 22px',
                  fontSize: '0.95rem',
                  background: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: '600',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        /* Glassmorphism Header */
        .header-glass {
          background: rgba(255, 255, 255, 0.11) !important;
          backdrop-filter: blur(20px) !important;
          -webkit-backdrop-filter: blur(20px) !important;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1) !important;
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.1) !important;
        }

        /* Custom Nav Buttons - Black with White Text */
        .nav-button-custom {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-sm) var(--space-lg);
          background: #000000;
          border: 2px solid #000000;
          color: #ffffff;
          border-radius: var(--radius-md);
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .nav-button-custom:hover {
          background: #1f1f1f;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        /* Active State - White with Black Text */
        .nav-button-custom.active {
          background: #ffffff !important;
          color: #000000 !important;
          border-color: #000000 !important;
          font-weight: 700;
        }

        .nav-button-custom svg {
          width: 18px;
          height: 18px;
        }

        @media (max-width: 1024px) {
          .logo-icon img {
            width: 100px !important;
            height: 100px !important;
          }
          .header-logo {
            gap: 2rem !important;
          }
        }

        @media (max-width: 768px) {
          .logo-icon img {
            width: 70px !important;
            height: 70px !important;
          }
          .header-logo {
            gap: 1rem !important;
          }
          .logo-text h1 {
            font-size: 1.25rem !important;
          }
          .logo-text p {
            font-size: 0.75rem !important;
          }
        }

        @media (max-width: 480px) {
          .logo-icon img {
            width: 100px !important;
            height: 100px !important;
          }
          .header-logo {
            gap: 2.0rem !important;
          }
          .logo-text h1 {
            font-size: 2rem !important;
          }
          .logo-text p {
            display: none;
          }
        }
      `}</style>
    </>
  );
};

export default Header;
