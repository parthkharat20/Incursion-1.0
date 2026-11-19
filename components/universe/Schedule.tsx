'use client';

import { useState } from 'react';
import { TIMELINE } from '../../lib/content';
import {
  Sparkles,
  Trophy,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
} from 'lucide-react';

const MILESTONE_IMAGES = [
  '/media/doom-closeup.webp',
  '/media/timeline-1.webp',
  '/media/timeline-2.webp',
  '/media/timeline-3.webp',
  '/media/timeline-4.webp',
  '/media/doom-closeup4.webp',
  '/media/doom-throne.webp',
];

const DAY_1_SCHEDULE = [
  { time: '08:00', title: 'Registration & Check-In', desc: 'Badge pickup, kit distribution, and finalist security clearance.' },
  { time: '09:00', title: 'Location Distribution', desc: 'Teams settle into designated hacking bays and workstation zones.' },
  { time: '10:00', title: 'Opening Ceremony', desc: 'Welcome address by GDG on Campus, leadership, and keynote speakers.' },
  { time: '10:30', title: 'Challenge Reveal', desc: 'Detailed problem statements and track rubrics officially unveiled.' },
  { time: '11:00', title: 'Hackathon Begins', desc: '24-hour sprint clock starts. Hacking is officially live.' },
  { time: '13:00', title: 'Lunch', desc: 'High-protein networking lunch served on-site for all participating teams.' },
  { time: '16:00', title: 'Mentor Checkpoint', desc: 'First round of technical reviews with domain experts and architecture advisors.' },
  { time: '19:30', title: 'Dinner', desc: 'Dinner served on campus to fuel up for the overnight build.' },
  { time: '22:00', title: 'Progress Checkpoint', desc: 'Mid-hack architecture validation and milestone progress check-ins.' },
  { time: '00:00', title: 'Midnight Community Activity', desc: 'Recharge with interactive activities, multiplayer games, and midnight snacks.' },
];

const DAY_2_SCHEDULE = [
  { time: '01:00', title: 'Late-Night Mentor Round', desc: 'One-on-one debugging, cloud deployments, and pitch guidance.' },
  { time: '04:00', title: 'Wellness & Rest Checkpoint', desc: 'Designated quiet rest areas and recovery zone check-ins.' },
  { time: '07:00', title: 'Breakfast', desc: 'Morning coffee and breakfast served to power the final stretch.' },
  { time: '09:00', title: 'Final Development Sprint', desc: 'Code freeze preparations, demo recording, and pitch deck polish.' },
  { time: '10:30', title: 'Submission Closes (Hard Stop)', desc: '24-hour timer reaches zero. Code commits and portal submissions lock.' },
  { time: '10:30–11:30', title: 'Demos & Preliminary Judging', desc: 'All 50 teams present live working prototypes to domain evaluation panels.' },
  { time: '12:00', title: 'Top Finalists Announced', desc: 'Standout teams selected for mainstage grand presentations.' },
  { time: '12:30', title: 'Mainstage Presentations', desc: 'Finalist pitches and live demos before the grand industry jury.' },
  { time: '14:00', title: 'Jury Deliberation', desc: 'Closed-door evaluation, rubric tallying, and scoring calculation.' },
  { time: '15:00', title: 'Awards & Closing Ceremony', desc: 'Prize distribution, felicitation of champions, and closing remarks.' },
  { time: '16:00', title: 'Event Close', desc: 'Official conclusion of INCURSION 2027.' },
];

export default function Schedule() {
  const [activeTab, setActiveTab] = useState<'roadmap' | 'finale'>('roadmap');
  const [finaleDay, setFinaleDay] = useState<1 | 2>(1);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section id="schedule" className="universe-section relative">
      <div className="universe-container">
        {/* Section Header */}
        <div className="universe-section-header">
          <div className="universe-eyebrow">
            <Sparkles className="inline-block w-3.5 h-3.5 mr-1 text-emerald-400" />
            Timeline & Operational Schedule
          </div>
          <h2 className="universe-section-title">The Convergence Roadmap</h2>
          <p className="universe-section-desc">
            Seven mission milestones leading from national online registration to the 24-hour offline showdown at DYPIT Pune.
          </p>

          {/* Schedule Mode Switcher */}
          <div className="universe-tab-switch">
            <button
              type="button"
              onClick={() => setActiveTab('roadmap')}
              className={`universe-tab-btn ${activeTab === 'roadmap' ? 'active' : ''}`}
            >
              Curved Mission Map
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('finale')}
              className={`universe-tab-btn ${activeTab === 'finale' ? 'active' : ''}`}
            >
              24-Hour Finale Agenda
            </button>
          </div>
        </div>

        {activeTab === 'roadmap' ? (
          <div className="serpentine-timeline-wrapper">
            {/* The Winding Cosmic Serpentine S-Curve Path */}
            <div className="serpentine-svg-container" aria-hidden="true">
              <svg
                viewBox="0 0 1000 1750"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
                className="serpentine-svg"
              >
                <defs>
                  <linearGradient id="laserGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3fe08e" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#10b981" stopOpacity="1" />
                    <stop offset="100%" stopColor="#ffd700" stopOpacity="0.9" />
                  </linearGradient>
                </defs>

                {/* Ambient Aura Path */}
                <path
                  d="M 220 80 
                     C 220 200, 780 200, 780 320 
                     C 780 440, 220 440, 220 560 
                     C 220 680, 780 680, 780 800 
                     C 780 920, 220 920, 220 1040 
                     C 220 1160, 780 1160, 780 1280 
                     C 780 1420, 500 1420, 500 1560"
                  stroke="rgba(63, 224, 142, 0.12)"
                  strokeWidth="22"
                  strokeLinecap="round"
                />

                {/* Dashed Conduit Road */}
                <path
                  d="M 220 80 
                     C 220 200, 780 200, 780 320 
                     C 780 440, 220 440, 220 560 
                     C 220 680, 780 680, 780 800 
                     C 780 920, 220 920, 220 1040 
                     C 220 1160, 780 1160, 780 1280 
                     C 780 1420, 500 1420, 500 1560"
                  stroke="rgba(63, 224, 142, 0.32)"
                  strokeWidth="3.5"
                  strokeDasharray="8 12"
                  strokeLinecap="round"
                />

                {/* Animated Glowing Laser Pulse Traveling Down the Winding Curve */}
                <path
                  d="M 220 80 
                     C 220 200, 780 200, 780 320 
                     C 780 440, 220 440, 220 560 
                     C 220 680, 780 680, 780 800 
                     C 780 920, 220 920, 220 1040 
                     C 220 1160, 780 1160, 780 1280 
                     C 780 1420, 500 1420, 500 1560"
                  stroke="url(#laserGrad)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  className="serpentine-laser-pulse"
                />
              </svg>
            </div>

            {/* Checkpoint Milestones Along the Serpentine Curve */}
            <div className="serpentine-milestones">
              {TIMELINE.map((item, index) => {
                const img = MILESTONE_IMAGES[index] || MILESTONE_IMAGES[0];
                const isHovered = hoveredIndex === index;
                const isDimmed = hoveredIndex !== null && !isHovered;
                const isLive = index === 0;
                const isGrandFinale = index === 6;
                const isEven = index % 2 === 0; // 0, 2, 4 are left; 1, 3, 5 are right; 6 is center

                return (
                  <div
                    key={item.t}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className={`serpentine-milestone-row ${
                      isGrandFinale
                        ? 'row-grand-finale'
                        : isEven
                        ? 'row-node-left'
                        : 'row-node-right'
                    } ${isHovered ? 'milestone-focused' : ''} ${isDimmed ? 'milestone-dimmed' : ''}`}
                  >
                    {/* Winding Waypoint Node */}
                    <div
                      className={`serpentine-waypoint ${isLive ? 'waypoint-live' : ''} ${
                        isGrandFinale ? 'waypoint-finale' : ''
                      } ${isHovered ? 'waypoint-hovered' : ''}`}
                    >
                      {/* Concentric Radar Beacon Rings */}
                      <span className="waypoint-ring ring-1" />
                      <span className="waypoint-ring ring-2" />

                      {/* Inner Glowing Waypoint Orb */}
                      <div className="waypoint-core">
                        {isGrandFinale ? (
                          <Trophy className="waypoint-icon text-amber-300" />
                        ) : isLive ? (
                          <Sparkles className="waypoint-icon text-emerald-300" />
                        ) : (
                          <span className="waypoint-num">0{index + 1}</span>
                        )}
                      </div>

                      {/* Level Status Tag */}
                      <div className="waypoint-level-badge">
                        {isGrandFinale ? (
                          <span className="badge-finale">GRAND FINALE</span>
                        ) : isLive ? (
                          <span className="badge-live">STAGE 01 // ACTIVE</span>
                        ) : (
                          <span>STAGE 0{index + 1}</span>
                        )}
                      </div>
                    </div>

                    {/* Milestone Dossier Card */}
                    <div
                      className={`universe-card serpentine-card ${isGrandFinale ? 'card-grand-finale' : ''} ${
                        isHovered ? 'card-focused' : ''
                      }`}
                    >
                      <div className="tactical-corner tl" />
                      <div className="tactical-corner tr" />
                      <div className="tactical-corner bl" />
                      <div className="tactical-corner br" />

                      <div className="serpentine-card-layout">
                        {/* Thumbnail Viewport */}
                        <div
                          className="serpentine-thumb"
                          style={{ backgroundImage: `url(${img})` }}
                          aria-hidden="true"
                        >
                          <div className="serpentine-thumb-overlay" />
                          <div className="serpentine-thumb-scanlines" />
                        </div>

                        {/* Content Body */}
                        <div className="serpentine-card-info">
                          <div className="serpentine-card-meta">
                            <span className="universe-timeline-phase">{item.phase || `Stage 0${index + 1}`}</span>
                            {item.tag && <span className="universe-meta-pill conduit-tag">{item.tag}</span>}
                            {isLive && (
                              <span className="conduit-live-beacon">
                                <span className="beacon-dot" />
                                LIVE NOW
                              </span>
                            )}
                          </div>

                          <h3 className="universe-timeline-title conduit-title">{item.t}</h3>
                          <div className="universe-timeline-highlight conduit-highlight">
                            <Calendar className="w-3.5 h-3.5 inline mr-1 text-amber-300" />
                            {item.d}
                          </div>
                          <p className="universe-timeline-desc conduit-desc">{item.x}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{ maxWidth: '850px', margin: '0 auto' }}>
            {/* Day 1 / Day 2 Selector */}
            <div className="universe-day-selector">
              <button
                type="button"
                onClick={() => setFinaleDay(1)}
                className={`universe-day-btn ${finaleDay === 1 ? 'active' : ''}`}
              >
                <span>Day 1 // 30 January 2027</span>
                <span className="day-sub">Opening Ceremony &amp; 24H Build Kickoff</span>
              </button>
              <button
                type="button"
                onClick={() => setFinaleDay(2)}
                className={`universe-day-btn ${finaleDay === 2 ? 'active' : ''}`}
              >
                <span>Day 2 // 31 January 2027</span>
                <span className="day-sub">Code Freeze, Pitch Demos &amp; Awards</span>
              </button>
            </div>

            {/* Schedule Items List */}
            <div className="universe-schedule-agenda">
              {(finaleDay === 1 ? DAY_1_SCHEDULE : DAY_2_SCHEDULE).map((slot) => (
                <div key={slot.time + slot.title} className="universe-agenda-row">
                  <div className="agenda-time-col">
                    <span className="agenda-time">{slot.time}</span>
                    <span className="agenda-time-dot" />
                  </div>
                  <div className="universe-card agenda-card">
                    <h4 className="agenda-title">{slot.title}</h4>
                    <p className="agenda-desc">{slot.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
