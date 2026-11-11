'use client';

import { useState } from 'react';
import Link from 'next/link';
import { REGISTER_URL } from '../../lib/content';
import AudioPlayer from './AudioPlayer';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="universe-navbar">
      {/* Brand */}
      <Link href="/universe" className="universe-nav-brand">
        <img src="/gdg-logo.svg" alt="GDG on Campus Logo" className="universe-nav-logo" />
        <span className="universe-nav-collab" aria-hidden="true">
          <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M2.5 2.5l11 11M13.5 2.5l-11 11" />
          </svg>
        </span>
        <img src="/incursion-logo.webp" alt="Incursion" className="universe-nav-incursion-logo" />
      </Link>

      {/* Desktop Nav Links */}
      <nav className="universe-nav-links">
        <a href="#about">About</a>
        <a href="#tracks">Tracks</a>
        <a href="#schedule">Schedule</a>
        <a href="#prizes">Prizes</a>
        <a href="#sponsors">Sponsors</a>
        <Link href="/" className="universe-nav-replay">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" width="12" height="12">
            <path d="M6 3L1 8l5 5M1 8h14" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Replay Film
        </Link>
      </nav>

      {/* Action Buttons (Sound + Register) */}
      <div className="universe-nav-actions">
        <AudioPlayer />
        <a
          href={REGISTER_URL || '#schedule'}
          target={REGISTER_URL ? '_blank' : undefined}
          rel={REGISTER_URL ? 'noopener noreferrer' : undefined}
          className="universe-nav-btn"
          title={REGISTER_URL ? 'Register Now on Unstop' : 'Registrations opening soon'}
        >
          <span>Register Now</span>
          <svg viewBox="0 0 18 8" fill="none" stroke="currentColor" width="14" height="8">
            <path d="M0 4h17M13 1l4 3-4 3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>

      {/* Mobile Hamburger Button */}
      <button
        type="button"
        onClick={() => setMobileOpen(!mobileOpen)}
        className="universe-mobile-toggle"
        aria-label="Toggle Navigation Menu"
      >
        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {mobileOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile Drawer */}
      <div className={`universe-mobile-menu ${mobileOpen ? 'open' : ''}`}>
        <a href="#about" onClick={() => setMobileOpen(false)}>About</a>
        <a href="#tracks" onClick={() => setMobileOpen(false)}>Tracks</a>
        <a href="#schedule" onClick={() => setMobileOpen(false)}>Schedule</a>
        <a href="#prizes" onClick={() => setMobileOpen(false)}>Prizes</a>
        <a href="#sponsors" onClick={() => setMobileOpen(false)}>Sponsors</a>
        <Link href="/" onClick={() => setMobileOpen(false)} style={{ color: 'var(--em)' }}>
          ← Replay Film Experience
        </Link>
        <a
          href={REGISTER_URL || '#schedule'}
          target={REGISTER_URL ? '_blank' : undefined}
          rel={REGISTER_URL ? 'noopener noreferrer' : undefined}
          onClick={() => setMobileOpen(false)}
          className="universe-nav-btn"
          style={{ textAlign: 'center', justifyContent: 'center', marginTop: '10px' }}
        >
          Register Now
        </a>
      </div>
    </header>
  );
}
