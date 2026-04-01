import React, { useState, useEffect } from 'react';
import { Github, Linkedin, Circle } from 'lucide-react';

const WORDS = ['UniMail.', 'N.E.R.V'];

const Footer = () => {
  const [typedText, setTypedText] = useState('');
  const [wordIdx, setWordIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const word = WORDS[wordIdx];

    if (!isDeleting && typedText === word) {
      const t = setTimeout(() => setIsDeleting(true), 1800);
      return () => clearTimeout(t);
    }

    if (isDeleting && typedText === '') {
      const t = setTimeout(() => {
        setIsDeleting(false);
        setWordIdx(i => (i + 1) % WORDS.length);
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

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;1,400&display=swap');

        .uf {
          background: #000000;
          border-top: 1px solid #000000;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 64px 24px 72px;
          gap: 24px;
        }

        .uf-wordmark {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(80px, 20vw, 300px);
          font-weight: 400;
          color: #ffffff;
          margin: 0;
          line-height: 1;
          letter-spacing: -1px;
          text-align: center;
          width: 100%;
          overflow-wrap: break-word;
          word-break: break-word;
        }

        .uf-wordmark em {
          font-style: italic;
        }

        /* Typing cursor — matches hero cursor style */
        .uf-cursor {
          font-style: normal;
          font-weight: 300;
          color: rgba(255, 255, 255, 0.80);
          margin-left: 2px;
          animation: uf-blink 0.75s step-end infinite;
        }
        @keyframes uf-blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }

        .uf-name {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(20px, 6vw, 40px);
          font-weight: 400;
          color: #ffffff;
          margin: 4px 0 0 0;
          letter-spacing: 0.04em;
          opacity: 0.9;
          text-align: center;
          padding: 0 10px;
        }

        .uf-icons {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: clamp(12px, 5vw, 32px);
          margin-top: 20px;
          flex-wrap: wrap;
          padding: 0 10px;
        }

        .uf-icon-btn {
          width: clamp(50px, 12vw, 75px);
          height: clamp(50px, 12vw, 75px);
          border-radius: 50%;
          border: 3px solid #ffffff;
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          cursor: pointer;
        }

        .uf-icon-btn:hover {
          background: #ffffff;
          border-color: #ffffff;
          color: #000000;
          transform: translateY(-4px);
          box-shadow: 0 10px 25px rgba(255, 255, 255, 0.2);
        }

        .uf-icon-btn svg {
          width: clamp(24px, 6vw, 40px);
          height: clamp(24px, 6vw, 40px);
          transition: transform 0.3s ease;
        }

        .uf-icon-btn:hover svg {
          transform: scale(1.1);
        }

        /* Tablet specific adjustments */
        @media (min-width: 481px) and (max-width: 768px) {
          .uf {
            padding: 56px 24px 64px;
            gap: 22px;
          }

          .uf-wordmark {
            font-size: clamp(100px, 18vw, 220px);
            letter-spacing: -1px;
          }

          .uf-name {
            font-size: clamp(22px, 5vw, 32px);
            margin-top: 6px;
          }

          .uf-icons {
            gap: 20px;
            margin-top: 18px;
          }

          .uf-icon-btn {
            width: clamp(55px, 10vw, 65px);
            height: clamp(55px, 10vw, 65px);
          }
        }

        /* Mobile specific adjustments */
        @media (max-width: 480px) {
          .uf {
            padding: 40px 16px 48px;
            gap: 16px;
          }

          .uf-wordmark {
            font-size: clamp(60px, 15vw, 100px);
            letter-spacing: -0.5px;
          }

          .uf-name {
            font-size: clamp(18px, 5vw, 24px);
            margin-top: 2px;
            opacity: 0.95;
          }

          .uf-icons {
            gap: 15px;
            margin-top: 12px;
          }

          .uf-icon-btn {
            width: clamp(45px, 12vw, 55px);
            height: clamp(45px, 12vw, 55px);
            border-width: 1.5px;
          }

          .uf-icon-btn svg {
            width: clamp(20px, 6vw, 28px);
            height: clamp(20px, 6vw, 28px);
          }

          .uf-icon-btn:hover {
            transform: translateY(-3px);
          }
        }

        /* Small mobile devices */
        @media (max-width: 360px) {
          .uf {
            padding: 32px 12px 40px;
          }

          .uf-wordmark {
            font-size: clamp(50px, 13vw, 70px);
          }

          .uf-icons {
            gap: 12px;
          }

          .uf-icon-btn {
            width: 40px;
            height: 40px;
          }

          .uf-icon-btn svg {
            width: 22px;
            height: 22px;
          }
        }
      `}</style>

      <footer className="uf">
        <h2 className="uf-wordmark">
          <em>{typedText}<span className="uf-cursor">|</span></em>
        </h2>

        <p className="uf-name">Hrishikesh Gavai</p>

        <div className="uf-icons">
          <a
            href="https://github.com/Hrishikesh-Gavai"
            target="_blank"
            rel="noopener noreferrer"
            className="uf-icon-btn"
            aria-label="GitHub"
          >
            <Github />
          </a>
          <a
            href="https://in.linkedin.com/in/hrishikesh-gavai"
            target="_blank"
            rel="noopener noreferrer"
            className="uf-icon-btn"
            aria-label="LinkedIn"
          >
            <Linkedin />
          </a>
          <a
            href="https://hrishikesh-gavai-portfolio.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="uf-icon-btn"
            aria-label="Portfolio"
          >
            <Circle />
          </a>
        </div>
      </footer>
    </>
  );
};

export default Footer;