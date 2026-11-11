// @ts-nocheck
'use client';

import { useEffect, useRef } from 'react';

const AUDIO_SRC = '/media/soundtrack.mp3';

export default function GlobalSoundtrack() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeTimerRef = useRef<any>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 1.0;
    audio.playsInline = true;

    // Check stored state
    const storedState = typeof window !== 'undefined' ? sessionStorage.getItem('incursion_audio_enabled') : null;
    const shouldPlay = storedState !== 'false'; // default to enabled

    const savedTime = typeof window !== 'undefined' ? sessionStorage.getItem('incursion_audio_time') : null;
    if (savedTime && !isNaN(parseFloat(savedTime))) {
      try {
        const time = parseFloat(savedTime);
        if (time > 0) audio.currentTime = time;
      } catch (e) {}
    }

    const cancelFade = () => {
      if (fadeTimerRef.current) {
        clearInterval(fadeTimerRef.current);
        fadeTimerRef.current = null;
      }
    };

    const fadeVolume = (to: number, ms: number = 300, onDone?: () => void) => {
      cancelFade();
      if (ms <= 0) {
        audio.volume = Math.max(0, Math.min(1, to));
        if (onDone) onDone();
        return;
      }
      const from = audio.volume;
      const startTime = performance.now();
      fadeTimerRef.current = setInterval(() => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(1, elapsed / ms);
        audio.volume = Math.max(0, Math.min(1, from + (to - from) * progress));
        if (progress >= 1) {
          cancelFade();
          if (onDone) onDone();
        }
      }, 30);
    };

    const globalAudio = {
      element: audio,
      get isPlaying() {
        return !audio.paused && !audio.muted && audio.volume > 0;
      },
      get currentTime() {
        return audio.currentTime || 0;
      },
      play(vol = 1.0, ms = 300) {
        audio.muted = false;
        if (audio.paused) {
          const p = audio.play();
          if (p && p.catch) p.catch(() => {});
        }
        fadeVolume(vol, ms);
        sessionStorage.setItem('incursion_audio_enabled', 'true');
        window.dispatchEvent(new CustomEvent('incursion:audio-state', { detail: { enabled: true } }));
      },
      pause(ms = 300) {
        fadeVolume(0, ms, () => {
          audio.pause();
          sessionStorage.setItem('incursion_audio_enabled', 'false');
          sessionStorage.setItem('incursion_audio_time', String(audio.currentTime || 0));
          window.dispatchEvent(new CustomEvent('incursion:audio-state', { detail: { enabled: false } }));
        });
      },
      toggle() {
        if (!audio.paused && audio.volume > 0) {
          this.pause(250);
        } else {
          this.play(1.0, 250);
        }
      },
      fade: fadeVolume,
      syncTime() {
        sessionStorage.setItem('incursion_audio_time', String(audio.currentTime || 0));
      },
    };

    (window as any).__INCURSION_AUDIO__ = globalAudio;

    // Guaranteed loop restart without break - only when whole track is completed (~1:52 / ~113s)
    const handleEnded = () => {
      try {
        if (!audio.duration || audio.currentTime >= audio.duration - 1.5) {
          audio.currentTime = 0;
        }
        const p = audio.play();
        if (p && p.catch) p.catch(() => {});
      } catch (e) {}
    };
    audio.addEventListener('ended', handleEnded);

    // Save timestamp periodically and before navigation
    const handleTimeUpdate = () => {
      if (Math.random() < 0.2) {
        sessionStorage.setItem('incursion_audio_time', String(audio.currentTime || 0));
      }
    };
    audio.addEventListener('timeupdate', handleTimeUpdate);

    const handleBeforeUnload = () => {
      sessionStorage.setItem('incursion_audio_time', String(audio.currentTime || 0));
      sessionStorage.setItem('incursion_audio_enabled', audio.paused ? 'false' : 'true');
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Initial attempt to start
    if (shouldPlay) {
      audio.muted = false;
      const promise = audio.play();
      if (promise && promise.catch) {
        promise.catch(() => {
          // Autoplay was blocked; wait for first gesture to unlock
        });
      }
    }

    // Unlock on any user gesture across the whole document
    const unlockGestures = ['pointerdown', 'touchstart', 'click', 'keydown', 'wheel', 'scroll'];
    const handleGesture = () => {
      const isEnabled = sessionStorage.getItem('incursion_audio_enabled') !== 'false';
      if (isEnabled && audio.paused) {
        audio.muted = false;
        audio.play().catch(() => {});
      }
    };
    unlockGestures.forEach((ev) => window.addEventListener(ev, handleGesture, { passive: true }));

    // Shared state listener
    const handleSharedAudioState = (event: any) => {
      const enabled = event.detail?.enabled;
      if (typeof enabled !== 'boolean') return;
      if (enabled && audio.paused) {
        audio.muted = false;
        audio.play().catch(() => {});
        fadeVolume(1.0, 250);
      } else if (!enabled && !audio.paused) {
        fadeVolume(0, 250, () => audio.pause());
      }
    };
    window.addEventListener('incursion:audio-state', handleSharedAudioState);

    return () => {
      cancelFade();
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('incursion:audio-state', handleSharedAudioState);
      unlockGestures.forEach((ev) => window.removeEventListener(ev, handleGesture));
      // NOTE: We deliberately do NOT pause or delete the audio on component unmount
      // so page-to-page navigation never cuts the sound!
    };
  }, []);

  return (
    <audio
      ref={audioRef}
      id="incursion-global-soundtrack"
      src={AUDIO_SRC}
      loop
      preload="auto"
      playsInline
      style={{ display: 'none', position: 'fixed', pointerEvents: 'none' }}
      aria-hidden="true"
    />
  );
}
