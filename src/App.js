import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import ComposeEmail from './pages/ComposeEmail';
import EmailRecords from './pages/EmailRecords';
import LoginScreen from './pages/LoginScreen';
import { Toaster } from 'react-hot-toast';

function App() {
  const [currentPage, setCurrentPage] = useState('compose');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const user = sessionStorage.getItem('user');
    if (user) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    setIsAuthenticated(false);
    setCurrentPage('compose');
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (!isAuthenticated) {
    return (
      <>
        <Toaster position="top-right" />
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      </>
    );
  }

  return (
    <div className="App" style={{ position: 'relative', minHeight: '100vh' }}>

      {/* Isolated grayscale background layer — filter does not affect children */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        backgroundImage: 'url(https://clinquant-sprinkles-e2d6e4.netlify.app/assets/kkw-home-DwveAqbx.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        filter: 'grayscale(100%)',
      }} />

      {/* Single wrapper that lifts ALL content above the background */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Toaster position="top-right" />

        <Header
          currentPage={currentPage}
          setCurrentPage={handlePageChange}
          onLogout={handleLogout}
        />

        <main className="main-content">
          <div className="container">
            {currentPage === 'compose' && <ComposeEmail />}
            {currentPage === 'records' && <EmailRecords />}
          </div>
        </main>

        <Footer />
      </div>

    </div>
  );
}

export default App;