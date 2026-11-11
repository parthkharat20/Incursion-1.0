'use client';

import Link from 'next/link';
import AudioPlayer from '../../components/universe/AudioPlayer';
import DoomsdayCountdown from '../../components/DoomsdayCountdown';

export default function CountdownPage() {
  return (
    <div className="countdown-page">
      {/* Minimal Top Bar: Logos on Left, Sound Toggle on Right */}
      <header className="countdown-header">
        <Link href="/universe" className="countdown-header-brand" title="Back to Incursion Universe">
          <img src="/gdg-logo.svg" alt="GDG on Campus Logo" className="countdown-header-logo" />
          <span className="countdown-header-collab" aria-hidden="true">
            <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M2.5 2.5l11 11M13.5 2.5l-11 11" />
            </svg>
          </span>
          <img src="/incursion-logo.webp" alt="Incursion 2027" className="countdown-header-incursion-logo" />
        </Link>
        <AudioPlayer />
      </header>

      {/* Atmospheric Cinematic Avengers Doomsday Backdrop */}
      <div className="end-tease-bg" aria-hidden="true">
        <img
          className="end-tease-img"
          src="/media/avengers-countdown-bg.webp"
          alt="Avengers Doomsday Backdrop"
          decoding="async"
        />
        <div className="end-tease-beams" />
        <div className="end-tease-vignette" />
      </div>

      {/* Epic Centerpiece HUD */}
      <main className="end-tease-hud">
        <span className="end-tease-eyebrow">STAY TUNED</span>
        <h1 className="end-tease-title">SOMETHING BIG IS HERE</h1>

        <DoomsdayCountdown />

        <div style={{ marginTop: '24px' }}>
          <a
            href="https://discord.gg/QYQZBEmgQ"
            target="_blank"
            rel="noopener noreferrer"
            className="countdown-discord-btn"
            title="Join the Official Incursion 2027 Discord Community"
          >
            <span>JOIN THE DISCORD</span>
            <span className="countdown-discord-arrow" aria-hidden="true">→</span>
          </a>
        </div>
      </main>

      {/* Floating Return Button */}
      <Link
        href="/universe"
        className="universe-floating-top"
        aria-label="Return to Universe"
        title="Return to Universe"
      >
        <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" aria-hidden="true">
          <path d="M9 16V2M3.5 7.5 9 2l5.5 5.5" />
        </svg>
      </Link>
    </div>
  );
}
