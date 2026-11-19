'use client';

import { REGISTER_URL } from '../../lib/content';

export default function Hero() {
  return (
    <section className="universe-hero">
      <div className="universe-container">
        {/* Eyebrow badge */}
        <div className="universe-hero-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <img src="/gdg-logo.svg" alt="GDG on Campus Logo" style={{ height: '16px', width: 'auto', display: 'block' }} />
          <span>GDG on Campus</span>
        </div>

        {/* Main Title */}
        <h1 className="universe-hero-title">
          INCURSION 2027 <br />
          <span className="universe-hero-title-accent">Doomsday Times Run Out</span>
        </h1>

        {/* Cinematic Description */}
        <p className="universe-hero-subtitle">
          Two universes collide. The timeline fractures. A national-level 24-hour hackathon summoning India&apos;s
          most cracked student squads for an online challenge leading to the high-stakes build finale at DYPIT campus, Pune.
        </p>

        {/* Call to Actions */}
        <div className="universe-hero-cta">
          <a
            href={REGISTER_URL || '#schedule'}
            target={REGISTER_URL ? '_blank' : undefined}
            rel={REGISTER_URL ? 'noopener noreferrer' : undefined}
            className="universe-btn-primary"
            title={REGISTER_URL ? 'Register Now on Unstop' : 'Registrations opening soon'}
          >
            <span>Claim Your Spot</span>
            <svg viewBox="0 0 18 8" fill="none" stroke="currentColor" width="16" height="8">
              <path d="M0 4h17M13 1l4 3-4 3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <a href="#tracks" className="universe-btn-secondary">
            Explore Battlegrounds
          </a>
          <a href="#schedule" className="universe-btn-secondary">
            Milestones Roadmap
          </a>
        </div>

        {/* Stats Strip */}
        <div className="universe-stats-row">
          <div>
            <div className="universe-stat-num">24 Hours</div>
            <div className="universe-stat-lbl">Non-Stop Offline Sprint</div>
          </div>
          <div>
            <div className="universe-stat-num accent">₹2,00,000</div>
            <div className="universe-stat-lbl">Total Cash Prize Pool</div>
          </div>
          <div>
            <div className="universe-stat-num">Top 50 Teams</div>
            <div className="universe-stat-lbl">Round 2 Finale (DYPIT Pune)</div>
          </div>
          <div>
            <div className="universe-stat-num accent">5 Domains</div>
            <div className="universe-stat-lbl">Dedicated ₹5K Track Bounties</div>
          </div>
        </div>
      </div>
    </section>
  );
}
