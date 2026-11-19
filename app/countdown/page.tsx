'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import AudioPlayer from '../../components/universe/AudioPlayer';
import DoomsdayCountdown from '../../components/DoomsdayCountdown';

export default function CountdownPage() {
  const [transitioning, setTransitioning] = useState(false);
  const triggeredRef = useRef(false);
  const touchStartYRef = useRef(0);

  const triggerReturnToUniverse = useCallback(() => {
    if (triggeredRef.current) return;
    triggeredRef.current = true;
    setTransitioning(true);

    const globalAudio = (window as any).__INCURSION_AUDIO__;
    if (globalAudio) {
      sessionStorage.setItem('incursion_audio_time', String(globalAudio.currentTime || 0));
      sessionStorage.setItem('incursion_audio_enabled', globalAudio.isPlaying ? 'true' : 'false');
    }
    sessionStorage.setItem('incursion_return_target', 'bottom');

    setTimeout(() => {
      window.location.href = '/universe';
    }, 650);
  }, []);

  useEffect(() => {
    // Unlock document scrolling
    document.documentElement.classList.remove('lock');

    let scrollAcc = 0;
    let accTimer: any = null;

    const handleWheel = (e: WheelEvent) => {
      if (triggeredRef.current) return;

      // Check if user is scrolled to the top of the window / container
      const isAtTop = window.scrollY <= 10;

      if (e.deltaY < 0 && isAtTop) {
        scrollAcc += Math.abs(e.deltaY);
        clearTimeout(accTimer);
        accTimer = setTimeout(() => {
          scrollAcc = 0;
        }, 220);

        // Natural trackpad or mouse wheel upward scroll trigger
        if (scrollAcc >= 25 || e.deltaY < -20) {
          triggerReturnToUniverse();
        }
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartYRef.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (triggeredRef.current) return;
      const isAtTop = window.scrollY <= 10;
      const touchY = e.touches[0].clientY;
      const deltaY = touchStartYRef.current - touchY;

      // Swiping down (deltaY < -30) while at top means scrolling upward
      if (deltaY < -30 && isAtTop) {
        triggerReturnToUniverse();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (triggeredRef.current) return;
      const isAtTop = window.scrollY <= 10;
      if ((e.key === 'ArrowUp' || e.key === 'PageUp' || e.key === 'Home') && isAtTop) {
        triggerReturnToUniverse();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(accTimer);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [triggerReturnToUniverse]);

  return (
    <div className={`countdown-page ${transitioning ? 'is-leaving' : ''}`}>
      {/* Minimal Top Bar: Logos on Left, Sound Toggle on Right */}
      <header className="countdown-header">
        <a
          href="/universe"
          onClick={(e) => {
            e.preventDefault();
            triggerReturnToUniverse();
          }}
          className="countdown-header-brand"
          title="Back to Incursion Universe"
        >
          <img src="/gdg-logo.svg" alt="GDG on Campus Logo" className="countdown-header-logo" />
          <span className="countdown-header-collab" aria-hidden="true">
            <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M2.5 2.5l11 11M13.5 2.5l-11 11" />
            </svg>
          </span>
          <img src="/incursion-logo.webp" alt="Incursion 2027" className="countdown-header-incursion-logo" />
        </a>
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
      <button
        type="button"
        onClick={triggerReturnToUniverse}
        className="universe-floating-top"
        aria-label="Return to Universe"
        title="Return to Universe"
      >
        <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" aria-hidden="true">
          <path d="M9 16V2M3.5 7.5 9 2l5.5 5.5" />
        </svg>
      </button>

      {/* Cinematic Return Portal Transition to Universe */}
      <div
        id="universe-return-portal-overlay"
        className={`universe-portal-overlay ${transitioning ? 'is-active' : ''}`}
        aria-hidden="true"
      >
        <div className="portal-glow" />
        <div className="portal-vignette" />
        <div className="portal-content">
          <h2 className="portal-title">
            <span>RETURNING</span> <span>TO</span> <em>UNIVERSE</em>
          </h2>
          <div className="portal-meter">
            <div className="portal-meter-bar" />
          </div>
        </div>
      </div>
    </div>
  );
}
