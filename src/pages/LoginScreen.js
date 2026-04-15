import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { showNotification } from '../utils/notifications';
import Footer from '../components/Footer';
import {
  Lock, User, Eye, EyeOff, LogIn, AlertCircle, X,
  Mail, Users, Globe, FileText, Link2, Database, Search,
  Download, BarChart2, RefreshCw, Layers, Moon, Smartphone,
  Bell, Shield, ArrowRight
} from 'lucide-react';

/* ─── data ──────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: <Mail size={22} />,
    label: 'Email Composer',
    desc: 'Create and save professional institutional emails with rich formatting.',
    cat: 'core',
  },
  {
    icon: <Users size={22} />,
    label: 'Contact Management',
    desc: 'Pre-loaded Principal, Deans, and HOD contacts ready to use.',
    cat: 'core',
  },
  {
    icon: <Globe size={22} />,
    label: 'Multi-Language',
    desc: 'Automatic translation to Hindi and Marathi at the click of a button.',
    cat: 'core',
  },
  {
    icon: <FileText size={22} />,
    label: 'PDF Attachments',
    desc: 'Upload and manage PDF files up to 40 MB per email record.',
    cat: 'core',
  },
  {
    icon: <Link2 size={22} />,
    label: 'Gmail Integration',
    desc: 'Open composed emails directly in Gmail with translations intact.',
    cat: 'core',
  },
  {
    icon: <Database size={22} />,
    label: 'PostgreSQL Storage',
    desc: 'All records stored securely and reliably via Supabase.',
    cat: 'db',
  },
  {
    icon: <Search size={22} />,
    label: 'Advanced Search',
    desc: 'Find emails by date, sender, recipient, or content instantly.',
    cat: 'db',
  },
  {
    icon: <Download size={22} />,
    label: 'Excel Export',
    desc: 'Download records with clickable PDF links for offline access.',
    cat: 'db',
  },
  {
    icon: <BarChart2 size={22} />,
    label: 'Sortable Columns',
    desc: 'Sort records by date, sender, recipient, or subject effortlessly.',
    cat: 'db',
  },
  {
    icon: <RefreshCw size={22} />,
    label: 'Real-time Sync',
    desc: 'Instant data updates across all sessions without a page refresh.',
    cat: 'db',
  },
  {
    icon: <Layers size={22} />,
    label: 'Glassmorphism UI',
    desc: 'Modern frosted-glass design with a beautiful campus background.',
    cat: 'ux',
  },
  {
    icon: <Moon size={22} />,
    label: 'Pitch Black Theme',
    desc: 'Professional dark accents with pristine, clean aesthetics.',
    cat: 'ux',
  },
  {
    icon: <Smartphone size={22} />,
    label: 'Fully Responsive',
    desc: 'Seamless, pixel-perfect experience on desktop, tablet, and mobile.',
    cat: 'ux',
  },
  {
    icon: <Bell size={22} />,
    label: 'Toast Notifications',
    desc: 'Real-time feedback for every operation — nothing goes unnoticed.',
    cat: 'ux',
  },
  {
    icon: <Shield size={22} />,
    label: 'Secure Login',
    desc: 'Session-based authentication keeps your account protected.',
    cat: 'ux',
  },
];

const CAT_LABELS = {
  core: 'Core Functionality',
  db: 'Database Features',
  ux: 'User Experience',
};

/* ─── Hero carousel images ───────────────────────────────────── */
const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1629197680187-d75229c25190',
  'https://clinquant-sprinkles-e2d6e4.netlify.app/assets/kkw-home-DwveAqbx.jpg',
  'https://images.unsplash.com/photo-1653069150536-d1256e2028f1',
];

/* ─── Typed words ────────────────────────────────────────────── */
const TYPED_WORDS = ['Reimagined.', 'Refined.', 'Reborn.', 'Redesigned.'];

/* ─── InfiniteSlider ─────────────────────────────────────────── */
/* Pure CSS approach — no extra dependencies */
const InfiniteSlider = ({ items, duration = 28, reverse = false }) => {
  // Duplicate items so the loop is seamless
  const tiles = [...items, ...items];

  return (
    <div className="lp-feat-slider-wrap">
      <div
        className="lp-feat-slider-track"
        style={{
          animationDuration: `${duration}s`,
          animationDirection: reverse ? 'reverse' : 'normal',
        }}
      >
        {tiles.map((f, i) => (
          <div className="lp-feat-tile" key={`${f.label}-${i}`}>
            <div className="lp-feat-tile-icon">{f.icon}</div>
            <div className="lp-feat-tile-label">{f.label}</div>
            <div className="lp-feat-tile-desc">{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── component ─────────────────────────────────────────────── */
const LoginScreen = ({ onLoginSuccess }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scrolled, setScrolled] = useState(false);

  /* ── carousel state ── */
  const [slideIndex, setSlideIndex] = useState(0);

  /* ── typing state ── */
  const [typedText, setTypedText] = useState('');
  const [wordIdx, setWordIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = modalOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [modalOpen]);

  /* ── carousel auto-advance ── */
  useEffect(() => {
    const t = setInterval(
      () => setSlideIndex(i => (i + 1) % HERO_IMAGES.length),
      5000
    );
    return () => clearInterval(t);
  }, []);

  /* ── typing effect ── */
  useEffect(() => {
    const word = TYPED_WORDS[wordIdx];

    if (!isDeleting && typedText === word) {
      // Pause at full word, then start deleting
      const t = setTimeout(() => setIsDeleting(true), 1800);
      return () => clearTimeout(t);
    }

    if (isDeleting && typedText === '') {
      // Pause between words, then move to next
      const t = setTimeout(() => {
        setIsDeleting(false);
        setWordIdx(i => (i + 1) % TYPED_WORDS.length);
      }, 320);
      return () => clearTimeout(t);
    }

    const speed = isDeleting ? 75 : 110;
    const t = setTimeout(() => {
      setTypedText(
        isDeleting
          ? word.slice(0, typedText.length - 1)
          : word.slice(0, typedText.length + 1)
      );
    }, speed);
    return () => clearTimeout(t);
  }, [typedText, isDeleting, wordIdx]);

  const openModal = () => { setModalOpen(true); setError(''); };
  const closeModal = () => { setModalOpen(false); setFormData({ username: '', password: '' }); setError(''); };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
        email: data.email,
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

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --ink: #000000;
          --ink-60: rgb(0, 0, 0);
          --white: #ffffff;
          --white-15: rgb(0, 0, 0);
          --glass-border: rgb(0, 0, 0);
          --radius: 14px;
          --font-display: 'Playfair Display', Georgia, serif;
          --font-body: 'DM Sans', system-ui, sans-serif;
        }

        body { font-family: var(--font-body); }

        /* ── NAV ── */
        .lp-nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 900;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2.5rem;
          height: 100px;
          transition: background 0.35s ease, backdrop-filter 0.35s ease, box-shadow 0.35s ease;
        }
        .lp-nav.scrolled {
          background: rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow: 0 1px 0 rgba(255,255,255,0.3);
        }
        .lp-nav.top { background: transparent; }

        /* Logo */
        .lp-nav-logo {
          display: flex;
          align-items: center;
          gap: 2rem;
          text-decoration: none;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .lp-nav-logo:hover { transform: translateY(-2px); }
        .lp-nav-logo-img {
          width: 150px;
          height: 150px;
          object-fit: contain;
          filter: brightness(0) invert(1); 
        }
        .lp-nav.scrolled .lp-nav-logo-img {
          filter: none; /* Original colors when scrolled */
        }
        .lp-nav-logo-words { display: flex; flex-direction: column; }
        .lp-nav-logo-title {
          font-family: var(--font-display);
          font-size: 2rem;
          font-weight: 700;
          color: var(--white);
          letter-spacing: -0.3px;
          line-height: 1.1;
          transition: color 0.3s;
        }
        .lp-nav.scrolled .lp-nav-logo-title { color: var(--ink); }
        .lp-nav-logo-sub {
          font-size: 1rem;
          font-weight: 500;
          color: rgb(255, 255, 255);
          margin-top: 3px;
          letter-spacing: 0.2px;
          transition: color 0.3s;
        }
        .lp-nav.scrolled .lp-nav-logo-sub { color: rgb(0, 0, 0); }

        /* Nav links */
        .lp-nav-links {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          list-style: none;
        }
        .lp-nav-links li button {
          background: none;
          border: none;
          cursor: pointer;
          font-family: var(--font-body);
          font-size: 1rem;
          font-weight: 600;
          color: rgb(255, 255, 255);
          padding: 0.5rem 0.9rem;
          border-radius: 8px;
          transition: all 0.2s;
        }
        .lp-nav.scrolled .lp-nav-links li button { color: rgb(0, 0, 0); }
        .lp-nav-links li button:hover {
          background: var(--white-15);
          color: var(--white);
        }
        .lp-nav.scrolled .lp-nav-links li button:hover {
          background: rgba(0,0,0,0.06);
          color: var(--ink);
        }

        /* Sign In button — always black */
        .lp-nav-signin {
          background: #ffffff !important;
          color: #000000 !important;
          font-family: var(--font-body);
          font-size: 0.875rem;
          font-weight: 700;
          padding: 0.55rem 1.35rem;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 2px 10px rgba(0,0,0,0.3);
          display: inline-block; 
          will-change: transform;
        }

        .lp-nav.scrolled .lp-nav-signin {
          background: #000000 !important;
          color: #ffffff !important;
          box-shadow: 0 2px 10px rgba(0,0,0,0.15);
        }

        .lp-nav-signin:hover, 
        .lp-nav-signin:hover:focus{
          background: #ffffff !important;
          color: #000000 !important;
          opacity: 1;
          filter: none !important;
          backdrop-filter: none !important;
          transform: translateY(-2px) !important;
        }

        /* ── HERO ── */
        .lp-hero {
          position: relative;
          height: 100vh;
          min-height: 600px;
          display: flex;
          align-items: center;
          overflow: hidden;
        }

        /* ── CAROUSEL SLIDES ── */
        .lp-hero-slide {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          transition: opacity 1.4s ease;
          will-change: opacity;
        }

        /* Gradient overlay (was ::before pseudo-element) */
        .lp-hero-overlay {
          position: absolute;
          inset: 0;
          z-index: 1;
          background: linear-gradient(
            105deg,
            rgba(0,0,0,0.40) 0%,
            rgba(0,0,0,0.16) 55%,
            rgba(0,0,0,0.04) 100%
          );
        }

        .lp-hero-content {
          position: relative;
          z-index: 2;
          max-width: 620px;
          padding: 0 3rem 0 4rem;
          animation: heroIn 0.9s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes heroIn {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .lp-hero-title {
          font-family: var(--font-display);
          font-size: clamp(2.8rem, 6vw, 4.5rem);
          font-weight: 800;
          line-height: 1.07;
          color: var(--white);
          margin-bottom: 1.25rem;
          letter-spacing: -1.5px;
        }
        .lp-hero-title em {
          font-style: italic;
          background: linear-gradient(90deg, #ffffff, rgba(255,255,255,0.65));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Typing cursor */
        .lp-cursor {
          font-style: normal;
          -webkit-text-fill-color: rgba(255,255,255,0.80);
          animation: lp-blink 0.75s step-end infinite;
          margin-left: 2px;
          font-weight: 300;
        }
        @keyframes lp-blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }

        .lp-hero-sub {
          font-size: 1.0625rem;
          font-weight: 400;
          color: rgba(255,255,255,0.88);
          line-height: 1.65;
          margin-bottom: 2.5rem;
          max-width: 480px;
        }
        /* CTA — black with white text */
        .lp-hero-cta {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: #ffffff;
          color: #000000;
          font-family: var(--font-body);
          font-size: 1rem;
          font-weight: 700;
          padding: 1rem 2rem;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          transition: all 0.28s cubic-bezier(0.34,1.56,0.64,1);
          box-shadow: 0 4px 24px rgba(0,0,0,0.45);
        }
        .lp-hero-cta:hover {
          opacity: 0.88;
          transform: translateY(-3px) scale(1.03);
          box-shadow: 0 10px 36px rgba(0,0,0,0.50);
        }
        .lp-hero-cta svg { transition: transform 0.2s; }
        .lp-hero-cta:hover svg { transform: translateX(4px); }

        /* ── CAROUSEL DOTS ── */
        .lp-hero-dots {
          position: absolute;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 0.55rem;
          z-index: 3;
        }
        .lp-hero-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          border: 2px solid rgb(255, 255, 255);
          background: #000000;
          cursor: pointer;
          padding: 0;
          transition: background 0.3s, border-color 0.3s, transform 0.3s;
        }
        .lp-hero-dot.active {
          background: #ffffff;
          border-color: #ffffff;
          transform: scale(1.3);
        }
        .lp-hero-dot:hover:not(.active) {
          border-color: rgba(255,255,255,0.9);
        }

        /* ── ABOUT SECTION — pitch black ── */
        .lp-section {
          background: #000000;
          padding: 6rem 2rem;
        }
        .lp-section-inner {
          max-width: 1100px;
          margin: 0 auto;
        }
        .lp-section-tag {
          display: inline-block;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: rgb(255, 255, 255);
          border-top: 2px solid rgb(255, 255, 255);
          padding-top: 6px;
          margin-bottom: 1.25rem;
        }
        .lp-section-title {
          font-family: var(--font-display);
          font-size: clamp(1.9rem, 4vw, 2.9rem);
          font-weight: 700;
          color: #ffffff;
          letter-spacing: -0.75px;
          line-height: 1.15;
          margin-bottom: 1.25rem;
        }
        .lp-section-body {
          font-size: 1.0rem;
          color: rgb(255, 255, 255);
          line-height: 1.75;
          max-width: 2000px;
        }

        /* About tiles — dark cards */
        .lp-about-tiles {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.25rem;
          margin-top: 3rem;
        }
        .lp-about-tile {
          background: #000000;
          border: 2px solid rgb(255, 255, 255);
          border-radius: var(--radius);
          padding: 1.75rem 1.5rem;
          transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
        }
        .lp-about-tile:hover {
          transform: translateY(-4px);
        }
        .lp-about-tile-icon {
          width: 44px; height: 44px;
          border-radius: 10px;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
          color: #000000;
        }
        .lp-about-tile-label {
          font-size: 0.9375rem;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 0.5rem;
        }
        .lp-about-tile-desc {
          font-size: 0.8375rem;
          color: rgb(255, 255, 255);
          line-height: 1.6;
        }

        /* ── FEATURES SECTION — slightly off-black ── */
        .lp-section-features {
          background: #000000;
          padding: 1rem 2rem;
        }
        .lp-cat-group { margin-bottom: 3.5rem; }
        .lp-cat-title {
          font-family: var(--font-display);
          font-size: 1.35rem;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 1.25rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid rgb(255, 255, 255);
        }

        /* ── INFINITY SLIDER ── */
        .lp-feat-slider-wrap {
          overflow: hidden;
          width: 100%;
          /* Fade edges for a polished look */
          mask-image: linear-gradient(
            to right,
            transparent 0%,
            black 8%,
            black 92%,
            transparent 100%
          );
          -webkit-mask-image: linear-gradient(
            to right,
            transparent 0%,
            black 8%,
            black 92%,
            transparent 100%
          );
        }

        @keyframes lp-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        .lp-feat-slider-track {
          display: flex;
          width: max-content;
          animation: lp-scroll linear infinite;
          /* duration set inline per row */
        }

        .lp-feat-slider-wrap:hover .lp-feat-slider-track {
          animation-play-state: paused;
        }

        .lp-feat-tile {
          background: #000000;
          border: 2px solid rgb(255, 255, 255);
          border-radius: var(--radius);
          padding: 1.5rem 1.25rem;
          box-shadow: 0 2px 16px rgba(0,0,0,0.45);
          transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          /* Fixed width so slider is predictable */
          min-width: 220px;
          max-width: 220px;
          flex-shrink: 0;
          margin-right: 1rem;
        }

        .lp-feat-tile-icon { color: rgb(255, 255, 255); }
        .lp-feat-tile-label {
          font-size: 0.9rem;
          font-weight: 600;
          color: #ffffff;
        }
        .lp-feat-tile-desc {
          font-size: 0.8rem;
          color: rgb(255, 255, 255);
          line-height: 1.55;
        }

        /* ── MODAL ── */
        .lp-modal-overlay {
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
          animation: overlayIn 0.22s ease both;
        }
        @keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }

        .lp-modal {
          width: 100%;
          max-width: 400px;
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 16px;
          box-shadow: 0 32px 80px rgba(0,0,0,0.40);
          padding: 0.5rem 2rem 1.5rem;
          position: relative;
          animation: modalIn 0.35s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.92) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }

        .lp-modal-close {
          position: absolute;
          top: 0.75rem; right: 0.75rem;
          width: 28px; height: 28px;
          border-radius: 6px;
          border: none;
          background: rgba(0,0,0,0.07);
          color: var(--ink);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.15s;
          z-index: 10;
        }
        .lp-modal-close:hover { background: rgba(0,0,0,0.14); }

        .lp-modal-logo {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          margin: -15px 0 -15px 0;
        }

        .lp-modal-logo img {
          width: 200px;
          height: 200px;
          object-fit: contain;
          transform: scale(1.2);
        }

        .lp-field {
          margin-bottom: 0.75rem;
        }

        .lp-label {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--ink);
          margin-bottom: 0.25rem;
        }

        .lp-label svg {
          width: 15px;
          height: 15px;
        }

        .lp-input {
          width: 100%;
          padding: 0.6rem 0.9rem;
          font-family: var(--font-body);
          font-size: 0.9rem;
          color: var(--ink);
          background: rgb(255, 255, 255);
          border: 2px solid rgb(0, 0, 0);
          border-radius: 8px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .lp-input:focus {
          border-color: var(--ink);
          box-shadow: 0 0 0 2px rgba(0,0,0,0.08);
        }
        .lp-input::placeholder {
          color: rgba(0, 0, 0, 0.5);
          font-size: 0.8rem;
        }

        .lp-input-wrap { position: relative; }

        .lp-eye {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: var(--ink-60);
          display: flex;
          align-items: center;
          padding: 4px;
        }

        .lp-eye svg {
          width: 20px;
          height: 20px;
        }

        .lp-error {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0.6rem 0.9rem;
          background: rgb(0, 0, 0);
          border: 1px solid rgb(0, 0, 0);
          border-radius: 10px;
          color: #ff0000;
          font-size: 0.78rem;
          font-weight: 500;
          margin-bottom: 0.75rem;
          animation: slideIn 0.25s ease both;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .lp-error svg {
          width: 20px;
          height: 20px;
        }

        .lp-submit {
          width: 100%;
          padding: 0.7rem 0.9rem;
          background: #000000;
          color: #ffffff;
          font-family: var(--font-body);
          font-size: 0.9rem;
          font-weight: 600;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: opacity 0.2s, transform 0.2s;
          margin-top: 0.25rem;
        }

        .lp-submit:hover:not(:disabled) {
          opacity: 0.85;
          transform: translateY(-1px);
        }

        .lp-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .lp-submit svg {
          width: 16px;
          height: 16px;
        }

        .lp-spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── GMAIL BUTTON ── */
        .lp-hero-gmail-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: rgba(255, 255, 255, 0.1) !important;
          backdrop-filter: blur(10px) !important;
          -webkit-backdrop-filter: blur(10px) !important;
          color: #ffffff;
          font-family: var(--font-body);
          font-size: 1rem;
          font-weight: 600;
          padding: 1rem 2rem;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.28s cubic-bezier(0.34,1.56,0.64,1);
          text-decoration: none;
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.54) !important;
        }

        .lp-hero-gmail-btn:hover {
          background: rgba(255, 255, 255, 0.1) !important;
          transform: translateY(-3px) scale(1.03);
          box-shadow: 0 12px 40px 0 rgba(0, 0, 0, 0.6) !important;
        }

        .lp-hero-gmail-btn svg {
          transition: transform 0.2s;
        }

        .lp-hero-gmail-btn:hover svg {
          transform: translateX(4px);
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 1024px) {
          .lp-nav-logo-img { width: 68px !important; height: 68px !important; }
        }
        @media (max-width: 768px) {
          .lp-nav { padding: 0 1.25rem; height: 68px; }
          .lp-nav-links { display: none; }
          .lp-nav-mobile-signin { display: flex !important; }
          .lp-nav-logo-img { width: 52px !important; height: 52px !important; }
          .lp-nav-logo { gap: 0.85rem; }
          .lp-hero-content { padding: 0 1.5rem; }
          .lp-section { padding: 4rem 1.25rem; }
          .lp-section-features { padding: 4rem 1.25rem; }
          .lp-modal { padding: 2rem 1.5rem 1.75rem; }
        }
        @media (max-width: 480px) {
          .lp-nav-logo-sub { display: none; }
          .lp-nav-logo-title { font-size: 1.35rem; }
        }
      `}</style>

      {/* ── NAV ── */}
      <nav className={`lp-nav ${scrolled ? 'scrolled' : 'top'}`}>

        {/* Logo */}
        <a className="lp-nav-logo" href="#hero">
          <img className="lp-nav-logo-img" src="/assets/KKW.png" alt="KKWIEER Logo" />
          <div className="lp-nav-logo-words">
            <span className="lp-nav-logo-title">UniMail</span>
            <span className="lp-nav-logo-sub">KKWIEER — University Email System</span>
          </div>
        </a>

        {/* Desktop links */}
        <ul className="lp-nav-links">
          <li><button onClick={() => scrollTo('about')}>About</button></li>
          <li><button onClick={() => scrollTo('features')}>Features</button></li>
          <li>
            <button className="lp-nav-signin" onClick={openModal}>Sign In</button>
          </li>
        </ul>

        {/* Mobile sign in */}
        <button
          className="lp-nav-signin lp-nav-mobile-signin"
          onClick={openModal}
          style={{ display: 'none' }}
        >
          Sign In
        </button>
      </nav>

      {/* ── HERO ── */}
      <section className="lp-hero" id="hero">

        {/* Carousel slide backgrounds */}
        {HERO_IMAGES.map((img, i) => (
          <div
            key={i}
            className="lp-hero-slide"
            style={{
              backgroundImage: `url('${img}')`,
              opacity: i === slideIndex ? 1 : 0,
              filter: i === 1 ? 'grayscale(100%)' : 'none',
            }}
          />
        ))}

        {/* Gradient overlay */}
        <div className="lp-hero-overlay" />

        <div className="lp-hero-content">
          <h1 className="lp-hero-title">
            Institutional<br />
            Email,<br />
            <em>{typedText}<span className="lp-cursor">|</span></em>
          </h1>
          <p className="lp-hero-sub">
            UniMail brings a modern, elegant layer to official university correspondence — compose, manage, translate, and dispatch emails from one beautiful interface.
          </p>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button className="lp-hero-cta" onClick={openModal}>
              Ready To Dive In?
              <ArrowRight size={20} />
            </button>
            <a 
             href="https://gmail.com" 
             target="_blank" 
             rel="noopener noreferrer"
             className="lp-hero-gmail-btn"
            >
              Gmail
            <Mail size={20} />
           </a>
          </div>
        </div>

        {/* Carousel dots */}
        <div className="lp-hero-dots">
          {HERO_IMAGES.map((_, i) => (
            <button
              key={i}
              className={`lp-hero-dot ${i === slideIndex ? 'active' : ''}`}
              onClick={() => setSlideIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section className="lp-section" id="about">
        <div className="lp-section-inner">
          <span className="lp-section-tag">About</span>
          <h2 className="lp-section-title">What is UniMail?</h2>
          <p className="lp-section-body">
            UniMail is a web-based institutional email management application built as a real-world client project for the Database Management Systems (DBMS) &amp; Full Stack Development course. It demonstrates practical implementation of database operations with a modern glassmorphism user interface, specifically designed for managing official correspondence at KKWIEER.
          </p>

          <div className="lp-about-tiles">
            {[
              { icon: <Mail size={20} />, label: 'Compose & Send', desc: 'Draft polished institutional emails with structured fields and multi-language support.' },
              { icon: <Database size={20} />, label: 'Powered by Supabase', desc: 'PostgreSQL backend ensures every record is stored securely and synced in real time.' },
              { icon: <Globe size={20} />, label: 'DBMS + Full Stack Project', desc: 'Showcases real-world database operations: CRUD, advanced search, sorting, and exports.' },
              { icon: <Shield size={20} />, label: 'Secure by Design', desc: 'Session-based authentication ensures only authorised users can access the system.' },
            ].map((t) => (
              <div className="lp-about-tile" key={t.label}>
                <div className="lp-about-tile-icon">{t.icon}</div>
                <div className="lp-about-tile-label">{t.label}</div>
                <div className="lp-about-tile-desc">{t.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="lp-section-features" id="features">
        <div className="lp-section-inner">
          <span className="lp-section-tag">Features</span>
          <h2 className="lp-section-title">Everything You Need.</h2>

          {/* Each category gets its own infinite slider row.
              Alternate reverse direction for visual variety. */}
          {[
            { cat: 'core', duration: 28, reverse: false },
            { cat: 'db',   duration: 32, reverse: true  },
            { cat: 'ux',   duration: 26, reverse: false },
          ].map(({ cat, duration, reverse }) => (
            <div className="lp-cat-group" key={cat}>
              <h3 className="lp-cat-title">✦ {CAT_LABELS[cat]}</h3>
              <InfiniteSlider
                items={FEATURES.filter(f => f.cat === cat)}
                duration={duration}
                reverse={reverse}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <Footer />

      {/* ── LOGIN MODAL ── */}
      {modalOpen && (
        <div className="lp-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="lp-modal" role="dialog" aria-modal="true" aria-label="Sign In">
            <button className="lp-modal-close" onClick={closeModal} aria-label="Close">
              <X size={16} />
            </button>

            <div className="lp-modal-logo">
              <img src="/assets/KKW.png" alt="KKWIEER" />
            </div>

            <div className="lp-divider" />

            <form onSubmit={handleSubmit}>
              <div className="lp-field">
                <label className="lp-label">
                  <User size={14} /> Username
                </label>
                <input
                  className="lp-input"
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Enter your username"
                  disabled={loading}
                  autoComplete="username"
                  autoFocus
                />
              </div>

              <div className="lp-field">
                <label className="lp-label">
                  <Lock size={14} /> Password
                </label>
                <div className="lp-input-wrap">
                  <input
                    className="lp-input"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    disabled={loading}
                    autoComplete="current-password"
                    style={{ paddingRight: '2.75rem' }}
                  />
                  <button
                    type="button"
                    className="lp-eye"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="lp-error" role="alert">
                  <AlertCircle size={15} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              <button type="submit" className="lp-submit" disabled={loading}>
                {loading ? (
                  <><div className="lp-spinner" /> Signing In...</>
                ) : (
                  <><LogIn size={17} /> Sign In</>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default LoginScreen;
