'use client';

import { useEffect, useRef, useState } from 'react';

export default function FooterScrollTransition() {
  const [transitioning, setTransitioning] = useState(false);
  const triggeredRef = useRef(false);

  useEffect(() => {
    let touchStartY = 0;

    const triggerTransition = () => {
      if (triggeredRef.current) return;
      triggeredRef.current = true;
      setTransitioning(true);

      const globalAudio = (window as any).__INCURSION_AUDIO__;
      if (globalAudio) {
        sessionStorage.setItem('incursion_audio_time', String(globalAudio.currentTime || 0));
        sessionStorage.setItem('incursion_audio_enabled', globalAudio.isPlaying ? 'true' : 'false');
      }

      setTimeout(() => {
        window.location.href = '/countdown';
      }, 650);
    };

    const isAtBottom = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollPos = window.scrollY + window.innerHeight;
      return scrollPos >= scrollHeight - 35;
    };

    const handleWheel = (e: WheelEvent) => {
      if (triggeredRef.current) return;
      if (e.deltaY > 20 && isAtBottom()) {
        triggerTransition();
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (triggeredRef.current) return;
      const touchY = e.touches[0].clientY;
      const deltaY = touchStartY - touchY;
      if (deltaY > 30 && isAtBottom()) {
        triggerTransition();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  return (
    <div
      id="countdown-portal-overlay"
      className={`universe-portal-overlay ${transitioning ? 'is-active' : ''}`}
      aria-hidden="true"
    >
      <div className="portal-glow" />
      <div className="portal-vignette" />
      <div className="portal-content">
        <h2 className="portal-title">
          <span>ENTERING</span> <em>DOOMSDAY</em> <span>VAULT</span>
        </h2>
        <div className="portal-meter">
          <div className="portal-meter-bar" />
        </div>
      </div>
    </div>
  );
}
