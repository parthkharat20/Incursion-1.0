'use client';

import { useEffect, useRef } from 'react';
import { createExperience } from '../lib/experience';
import { REGISTER_URL } from '../lib/content';

function Arrow() {
  return <svg viewBox="0 0 18 8" fill="none" stroke="currentColor" aria-hidden="true"><path d="M0 4h17M13 1l4 3-4 3" /></svg>;
}

function IntroGate() {
  return (
    <section id="term" aria-label="Welcome to Incursion">
      <video
        id="iv"
        autoPlay
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        disableRemotePlayback
        src="/media/intro.mp4"
        aria-label="Incursion introduction"
      >
        <source src="/media/intro-mobile.mp4" media="(max-width: 768px)" type="video/mp4" />
        <source src="/media/intro.mp4" type="video/mp4" />
      </video>
      <div id="sound-prompt" className="sound-prompt" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
        </svg>
        <span>Tap for sound</span>
      </div>
      <button id="skip" type="button">Skip intro</button>
    </section>
  );
}

function HeroStage() {
  const registerHref = REGISTER_URL || '#';

  return (
    <section className="hero" id="hero" aria-labelledby="hero-title">
      <picture>
        <source media="(max-width: 760px)" srcSet="/media/doom-closeup.webp" />
        <img className="hero-backdrop" src="/media/doom-closeup4.webp" alt="Doomsday" />
      </picture>
      <div className="hero-shade" aria-hidden="true" />
      <div className="hero-copy">
        <div className="hero-eyebrow">
          <div className="hero-eyebrow-badge">
            <img className="hero-eyebrow-logo" src="/gdg-logo.svg" alt="GDG on Campus Logo" />
            <span className="hero-eyebrow-sep" aria-hidden="true" />
            <span className="hero-eyebrow-text">GDG on Campus // DYPIT Pune presents</span>
          </div>
        </div>
        <h1 id="hero-title" aria-label="INCURSION 2027">
          INCURSION <em>2027</em>
        </h1>
        <p className="hero-deck">Two worlds. One final stand.<br />Doomsday Times Run Out.</p>
        <div className="hero-meta">
          <span>11 Nov 2026 – 31 Jan 2027</span>
          <i aria-hidden="true" />
          <span>DYPIT Campus, Pune</span>
        </div>
        <div className="hero-actions">
          <a
            className="btn hero-primary reg"
            href={registerHref}
            target={REGISTER_URL ? '_blank' : undefined}
            rel={REGISTER_URL ? 'noopener noreferrer' : undefined}
            title={REGISTER_URL ? 'Register Now on Unstop' : 'Registrations opening soon'}
          >
            Register now<Arrow />
          </a>
          <a className="btn hero-secondary" href="/universe#schedule" data-universe-link="true">
            View timeline
          </a>
        </div>
      </div>
    </section>
  );
}

export default function IncursionExperience() {
  const root = useRef(null);
  useEffect(() => createExperience(root.current), []);

  return (
    <main ref={root}>
      <div id="scroll"><div id="stage">
        <section id="throne" aria-label="Doctor Doom on his throne">
          <img id="tw2" className="pic" src="/media/doom-throne.webp" alt="Doctor Doom on his throne" decoding="async" />
          <img id="tc" className="pic" src="/media/doom-closeup6.webp" alt="Doctor Doom, hooded, eyes glowing green" decoding="async" />
          <div className="vg" id="vg" /><div className="scrim" id="scrim" />
        </section>
        <div className="stage-tease" id="stage-tease" aria-live="polite">
          <span className="stage-tease-alert">The multiverse is collapsing</span>
          <strong className="stage-tease-title">INCURSION <em>2027</em></strong>
          <strong className="stage-tease-subtitle">The final hour begins.</strong>
          <span className="stage-tease-meta">30 — 31 January 2027 // Pune, India</span>
        </div>
        <div className="t warn" data-w="7.0,7.6,9.4,9.9"><h2>Something's coming, Something we may not be able to&nbsp;deter.</h2></div>
        <HeroStage />
        <a className="hero-scroll" id="hero-scroll-cue" href="/universe" data-universe-link="true" aria-label="Scroll to enter the incursion">
          <span>Scroll to enter the universe ↓</span>
          <i aria-hidden="true" />
        </a>
        <header id="hdr">
          <a href="/universe" className="hdr-brand" data-universe-link="true" title="GDG on Campus × INCURSION 2027">
            <img className="hdr-logo" src="/gdg-logo.svg" alt="GDG on Campus Logo" />
            <span className="hdr-collab" aria-hidden="true">
              <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M2.5 2.5l11 11M13.5 2.5l-11 11" />
              </svg>
            </span>
            <img className="hdr-incursion-logo" src="/incursion-logo.webp" alt="Incursion" />
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button id="snd" aria-label="Turn sound off" aria-pressed="true" data-sound-state="on" type="button">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path className="snd-on-speaker" d="M4 10v4h4l5 4V6l-5 4H4Z" />
                <path className="snd-wave" d="M16 9.2a4 4 0 0 1 0 5.6M18.5 6.7a7.5 7.5 0 0 1 0 10.6" />
                <path className="snd-off-speaker" strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.531V19.94a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.506-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.395C2.806 8.757 3.63 8.25 4.51 8.25H6.75z" />
              </svg>
            </button>
          </div>
        </header>
        <div className="grain" aria-hidden="true" />
        <IntroGate />
        {/* Doomsday Universe Portal Transition */}
        <div id="universe-portal-transition" className="universe-portal-overlay" aria-hidden="true">
          <div className="portal-glow" />
          <div className="portal-vignette" />
          <div className="portal-content">
            <h2 className="portal-title">
              <span>WELCOME</span> <span>TO</span> <span>THE</span> <em>UNIVERSE</em>
            </h2>
            <div className="portal-meter">
              <div className="portal-meter-bar" />
            </div>
          </div>
        </div>
      </div></div>
      <button id="top" type="button" aria-label="Go to top">
        <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" aria-hidden="true"><path d="M9 16V2M3.5 7.5 9 2l5.5 5.5" /></svg>
      </button>
      <noscript><p>This experience uses JavaScript. INCURSION 2027 is a national-level student hackathon organized by GDG on Campus, Dr. D. Y. Patil Institute of Technology, Pimpri, Pune on 30–31 January 2027.</p></noscript>
    </main>
  );
}
