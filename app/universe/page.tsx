'use client';

import { useEffect } from 'react';
import './universe.css';
import BackgroundVideo from '../../components/universe/BackgroundVideo';
import UniverseMaskCanvas from '../../components/universe/UniverseMaskCanvas';
import Navbar from '../../components/universe/Navbar';
import Hero from '../../components/universe/Hero';
import About from '../../components/universe/About';
import Tracks from '../../components/universe/Tracks';
import Schedule from '../../components/universe/Schedule';
import Prizes from '../../components/universe/Prizes';
import Sponsors from '../../components/universe/Sponsors';
import Footer from '../../components/universe/Footer';
import FooterScrollTransition from '../../components/universe/FooterScrollTransition';

export default function UniversePage() {
  useEffect(() => {
    // Ensure document scrolling is unlocked on the portal page
    document.documentElement.classList.remove('lock');

    // If returning from countdown, land at the footer so user smoothly continues scrolling upwards
    if (typeof window !== 'undefined' && sessionStorage.getItem('incursion_return_target') === 'bottom') {
      sessionStorage.removeItem('incursion_return_target');
      const setScrollPos = () => {
        const footerEl = document.getElementById('footer') || document.querySelector('.universe-footer');
        if (footerEl) {
          footerEl.scrollIntoView({ behavior: 'instant', block: 'end' });
        } else {
          const target = Math.max(0, document.documentElement.scrollHeight - window.innerHeight - 60);
          window.scrollTo({ top: target, behavior: 'instant' });
        }
      };
      requestAnimationFrame(setScrollPos);
      setTimeout(setScrollPos, 120);
    }
  }, []);

  return (
    <div className="universe-page">
      {/* Fixed Looping Cinematic Background */}
      <BackgroundVideo />

      {/* Persistent 3D Doctor Doom Mask Layer */}
      <UniverseMaskCanvas />

      {/* Top Navbar */}
      <Navbar />

      {/* Content Sections */}
      <main className="universe-content">
        <Hero />
        <About />
        <Tracks />
        <Schedule />
        <Prizes />
        <Sponsors />
        <Footer />
      </main>

      {/* Cinematic Transition to Countdown Page on Scroll Past Footer */}
      <FooterScrollTransition />
    </div>
  );
}
