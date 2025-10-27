import React from 'react';
import { Mail, Database, Github, ExternalLink, Heart, Code, Building2, Linkedin } from 'lucide-react';


const Footer = () => {
  const currentYear = new Date().getFullYear();


  return (
    <footer className="footer footer-black">
      <div className="footer-content">
        <div className="footer-grid">
          {/* About Section */}
          <div className="footer-section">
            <h3 style={{ color: '#ffffff' }}>UniMail</h3>
            <p style={{ color: '#ffffff', fontWeight: '500', opacity: 0.9 }}>
              A professional email management system for KKWIEER with 
              multi-language support (English, Hindi, Marathi), built to 
              streamline university communication.
            </p>
            <p style={{ 
              marginTop: 'var(--space-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.875rem',
              color: '#ffffff',
              fontWeight: '600'
            }}>
              Made With <Heart size={14} style={{ color: '#ef4444' }} fill="#ef4444" /> By TY-A CSE Students
            </p>
          </div>

          {/* Features */}
          <div className="footer-section">
            <h3 style={{ color: '#ffffff' }}>Features</h3>
            <ul className="footer-links footer-links-black">
              <li style={{ color: '#ffffff', fontWeight: '500' }}>✓ Multi-language Translation</li>
              <li style={{ color: '#ffffff', fontWeight: '500' }}>✓ PDF Attachment Support</li>
              <li style={{ color: '#ffffff', fontWeight: '500' }}>✓ Excel Export with Links</li>
              <li style={{ color: '#ffffff', fontWeight: '500' }}>✓ Search & Filter Records</li>
              <li style={{ color: '#ffffff', fontWeight: '500' }}>✓ Gmail Integration</li>
              <li style={{ color: '#ffffff', fontWeight: '500' }}>✓ Mobile Responsive Design</li>
            </ul>
          </div>

          {/* Developers */}
          <div className="footer-section">
            <h3 style={{ color: '#ffffff' }}>Development Team</h3>
            <ul className="footer-links footer-links-black">
              <li>
                <a href="https://github.com/Hrishikesh-Gavai" target="_blank" rel="noopener noreferrer" style={{ color: '#ffffff', fontWeight: '600' }}>
                  <Github size={16} color="#ffffff" />
                  Hrishikesh Gavai
                  <ExternalLink size={12} color="#ffffff" />
                </a>
              </li>
              <li>
                <a href="https://github.com/Dhruvesh05" target="_blank" rel="noopener noreferrer" style={{ color: '#ffffff', fontWeight: '600' }}>
                  <Github size={16} color="#ffffff" />
                  Dhruvesh Patil
                  <ExternalLink size={12} color="#ffffff" />
                </a>
              </li>
              <li>
                <a href="https://github.com/n-rao-48" target="_blank" rel="noopener noreferrer" style={{ color: '#ffffff', fontWeight: '600' }}>
                  <Github size={16} color="#ffffff" />
                  Nakshatra Rao
                  <ExternalLink size={12} color="#ffffff" />
                </a>
              </li>
              <li>
                <a href="https://github.com/Pml0205" target="_blank" rel="noopener noreferrer" style={{ color: '#ffffff', fontWeight: '600' }}>
                  <Github size={16} color="#ffffff" />
                  Palak Lokwani
                  <ExternalLink size={12} color="#ffffff" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p style={{ color: '#ffffff', fontWeight: '600' }}>
            © {currentYear} UniMail - KKWIEER. All rights reserved.
          </p>
          <p style={{ 
            marginTop: '8px', 
            fontSize: '0.8rem', 
            color: '#ffffff',
            fontWeight: '500',
            opacity: 0.8
          }}>
            TY-A Computer Engineering | DBMS Mini Project
          </p>
        </div>
      </div>
      
      <style>{`
        /* Pitch Black Footer */
        .footer-black {
          background: #000000 !important;
          border-top: 1px solid #1f1f1f !important;
        }
        
        .footer-links-black a:hover {
          color: #cccccc !important;
          text-decoration: underline;
        }
      `}</style>
    </footer>
  );
};

export default Footer;
