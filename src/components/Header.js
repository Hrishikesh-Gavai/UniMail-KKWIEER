import React, { useState, useEffect } from 'react';
import { Mail, Database, LogOut, AlertTriangle } from 'lucide-react';

const Header = ({ currentPage, setCurrentPage, onLogout }) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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

  const handleLogout = () => setShowLogoutModal(true);
  const confirmLogout  = () => { setShowLogoutModal(false); onLogout(); };
  const cancelLogout   = () => setShowLogoutModal(false);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

        /* ── NAV BASE ── */
        .hdr-nav {
          position: sticky;
          top: 0;
          left: 0;
          right: 0;
          z-index: 900;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2.5rem;
          height: 100px;
          transition: background 0.35s ease, backdrop-filter 0.35s ease, box-shadow 0.35s ease;
        }

        /* Transparent at page top */
        .hdr-nav.hdr-top {
          background: transparent;
          box-shadow: none;
        }

        /* Frosted glass once scrolled */
        .hdr-nav.hdr-scrolled {
          background: rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow: 0 1px 0 rgba(255, 255, 255, 0.3);
        }

        /* ── LOGO ── */
        .hdr-logo {
          display: flex;
          align-items: center;
          gap: 2rem;
          cursor: pointer;
          text-decoration: none;
          transition: transform 0.2s;
        }
        .hdr-logo:hover { transform: translateY(-2px); }

        .hdr-logo-img {
          width: 150px;
          height: 150px;
          object-fit: contain;
          transition: filter 0.35s;
        }
        /* Restore real colours once nav turns glass */
        .hdr-nav.hdr-scrolled .hdr-logo-img {
          filter: none;
        }

        .hdr-logo-words {
          display: flex;
          flex-direction: column;
        }
        .hdr-logo-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 2rem;
          font-weight: 700;
          color: #000000;
          letter-spacing: -0.3px;
          line-height: 1.1;
          margin: 0;
          transition: color 0.3s;
        }
        .hdr-nav.hdr-scrolled .hdr-logo-title { color: #000000; }

        .hdr-logo-sub {
          font-family: 'DM Sans', system-ui, sans-serif;
          font-size: 1rem;
          font-weight: 500;
          color: rgb(0, 0, 0);
          margin-top: 3px;
          letter-spacing: 0.2px;
          transition: color 0.3s;
        }
        .hdr-nav.hdr-scrolled .hdr-logo-sub { color: #000000; }

        /* ── NAV LINKS ── */
        .hdr-nav-links {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        /* Regular nav link (Compose / Records) */
        .hdr-nav-links li button.hdr-link-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'DM Sans', system-ui, sans-serif;
          font-size: 1rem;
          font-weight: 600;
          color: #ffffff;
          padding: 0.5rem 0.9rem;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }
        .hdr-nav.hdr-scrolled .hdr-nav-links li button.hdr-link-btn {
          color: #000000;
        }
        .hdr-nav-links li button.hdr-link-btn:hover {
          background: rgb(0, 0, 0);
        }
        .hdr-nav.hdr-scrolled .hdr-nav-links li button.hdr-link-btn:hover {
          background: rgba(0, 0, 0, 0.06);
        }

        /* Active state — pill with solid fill */
        .hdr-nav-links li button.hdr-link-btn.hdr-active {
          background: #ffffff;
          color: #000000;
        }
        .hdr-nav.hdr-scrolled .hdr-nav-links li button.hdr-link-btn.hdr-active {
          background: #000000;
          color: #ffffff;
        }

        /* Logout — always solid black / white */
        .hdr-logout-btn {
          font-family: 'DM Sans', system-ui, sans-serif;
          font-size: 0.875rem;
          font-weight: 700;
          padding: 0.55rem 1.35rem;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: transform 0.2s, box-shadow 0.2s, background 0.3s, color 0.3s;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);

          /* White bg / black text at page top */
          background: #ffffff;
          color:      #000000;
        }
        .hdr-nav.hdr-scrolled .hdr-logout-btn {
          background: #000000;
          color:      #ffffff;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
        }
        .hdr-logout-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
        }

        /* ── LOGOUT MODAL ── */
        .hdr-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          animation: hdrOverlayIn 0.22s ease both;
        }
        @keyframes hdrOverlayIn { from { opacity: 0; } to { opacity: 1; } }

        .hdr-modal {
          width: 100%;
          max-width: 420px;
          background: rgba(255, 255, 255, 0.5);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 16px;
          box-shadow: 0 32px 80px rgba(0, 0, 0, 0.40);
          padding: 2rem;
          animation: hdrModalIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes hdrModalIn {
          from { opacity: 0; transform: scale(0.92) translateY(20px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }

        .hdr-modal-icon-wrap {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(239, 68, 68, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .hdr-modal-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 1.35rem;
          font-weight: 700;
          color: #000000;
          margin: 0;
        }

        .hdr-modal-body {
          font-family: 'DM Sans', system-ui, sans-serif;
          font-size: 0.95rem;
          font-weight: 500;
          color: #000000;
          line-height: 1.65;
          margin: 1rem 0 1.5rem;
        }

        .hdr-modal-actions {
          display: flex;
          gap: 12px;
        }

        .hdr-modal-cancel,
        .hdr-modal-confirm {
          flex: 1;
          padding: 0.75rem 1.25rem;
          font-family: 'DM Sans', system-ui, sans-serif;
          font-size: 0.95rem;
          font-weight: 600;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: opacity 0.2s, transform 0.2s;
        }
        .hdr-modal-cancel  { background: #000000; color: #ffffff; }
        .hdr-modal-confirm { background: #ef4444; color: #ffffff; }
        .hdr-modal-cancel:hover,
        .hdr-modal-confirm:hover { opacity: 0.85; transform: translateY(-1px); }

        /* ── RESPONSIVE ── */
        @media (max-width: 1024px) {
          .hdr-logo-img { width: 90px !important; height: 90px !important; }
          .hdr-logo     { gap: 1.25rem !important; }
        }
        @media (max-width: 768px) {
          .hdr-nav         { padding: 0 1.25rem; height: 72px; }
          .hdr-logo-img    { width: 60px !important; height: 60px !important; }
          .hdr-logo        { gap: 0.85rem !important; }
          .hdr-logo-title  { font-size: 1.35rem; }
          .hdr-link-btn span { display: none; }
        }
        @media (max-width: 480px) {
          .hdr-logo-sub   { display: none; }
          .hdr-logo-title { font-size: 1.2rem; }
          .hdr-logout-btn span { display: none; }
        }
      `}</style>

      {/* ── HEADER ── */}
      <header className={`hdr-nav ${scrolled ? 'hdr-scrolled' : 'hdr-top'}`}>

        {/* Logo */}
        <div className="hdr-logo" onClick={handleLogoClick}>
          <img
            className="hdr-logo-img"
            src="/assets/KKW.png"
            alt="KKWIEER Logo"
          />
          <div className="hdr-logo-words">
            <span className="hdr-logo-title">UniMail</span>
            <span className="hdr-logo-sub">KKWIEER — University Email System</span>
          </div>
        </div>

        {/* Nav links */}
        <ul className="hdr-nav-links">
          <li>
            <button
              className={`hdr-link-btn ${currentPage === 'compose' ? 'hdr-active' : ''}`}
              onClick={() => handleNavClick('compose')}
            >
              <Mail size={17} />
              <span>Compose</span>
            </button>
          </li>

          <li>
            <button
              className={`hdr-link-btn ${currentPage === 'records' ? 'hdr-active' : ''}`}
              onClick={() => handleNavClick('records')}
            >
              <Database size={17} />
              <span>Records</span>
            </button>
          </li>

          <li>
            <button className="hdr-logout-btn" onClick={handleLogout}>
              <LogOut size={17} />
              <span>Logout</span>
            </button>
          </li>
        </ul>
      </header>

      {/* ── LOGOUT MODAL ── */}
      {showLogoutModal && (
        <div
          className="hdr-modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) cancelLogout(); }}
        >
          <div className="hdr-modal" role="dialog" aria-modal="true" aria-label="Confirm Logout">

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.25rem' }}>
              <div className="hdr-modal-icon-wrap">
                <AlertTriangle size={24} color="#ef4444" />
              </div>
              <h3 className="hdr-modal-title">Confirm Logout</h3>
            </div>

            <p className="hdr-modal-body">
              Are you sure you want to logout? You will need to sign in again to access the system.
            </p>

            <div className="hdr-modal-actions">
              <button className="hdr-modal-cancel" onClick={cancelLogout}>
                Cancel
              </button>
              <button className="hdr-modal-confirm" onClick={confirmLogout}>
                <LogOut size={17} />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;