import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import ComposeEmail from './components/ComposeEmail';
import EmailRecords from './components/EmailRecords';
import LoadingScreen from './components/LoadingScreen';
import LoginScreen from './components/LoginScreen';
import { Toaster } from 'react-hot-toast';


function App() {
  const [currentPage, setCurrentPage] = useState('compose');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);


  // Check if user is already logged in on mount
  useEffect(() => {
    const user = sessionStorage.getItem('user');
    if (user) {
      setIsAuthenticated(true);
    }
  }, []);


  const handleLoginSuccess = () => {
    setLoading(true);
    
    // Show loading screen for 1.5 seconds after successful login
    setTimeout(() => {
      setLoading(false);
      setIsAuthenticated(true);
    }, 1500);
  };


  const handleLogout = () => {
    sessionStorage.removeItem('user');
    setIsAuthenticated(false);
    setCurrentPage('compose');
  };


  const handlePageChange = (page) => {
    setCurrentPage(page);
  };


  // Show login screen if not authenticated
  if (!isAuthenticated && !loading) {
    return (
      <>
        <Toaster position="top-right" />
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      </>
    );
  }


  // Show loading screen after login
  if (loading) {
    return <LoadingScreen />;
  }


  // Show main app after authentication and loading
  return (
    <div className="App" style={{
      backgroundImage: 'url(https://clinquant-sprinkles-e2d6e4.netlify.app/assets/kkw-home-DwveAqbx.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
      minHeight: '100vh'
    }}>
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
  );
}


export default App;
