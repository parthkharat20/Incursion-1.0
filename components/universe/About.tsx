'use client';

export default function About() {
  return (
    <section id="about" className="universe-section">
      <div className="universe-container">
        <div className="universe-section-header">
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
            <img src="/gdg-logo.svg" alt="GDG Logo" style={{ height: '18px', width: 'auto' }} />
            <div className="universe-eyebrow" style={{ margin: 0 }}>Classified Mission Briefing</div>
          </div>
          <h2 className="universe-section-title">Doomsday Times Run Out</h2>
          <p className="universe-section-desc">
            INCURSION 2027 is a premier national-level 24-hour student hackathon organized by GDG on Campus,
            Dr. D. Y. Patil Institute of Technology, Pimpri, Pune. Engineered as a high-intensity two-round gauntlet—an
            online nationwide ideation and prototype screening followed by a 24-hour offline build sprint on campus—INCURSION
            summons India&apos;s most ambitious developers, engineers, and researchers to engineer critical solutions before the clock hits zero.
          </p>
        </div>

        {/* Dossier Key Metrics Bar */}
        <div className="universe-dossier-metrics">
          <div className="dossier-metric">
            <span className="dossier-val">₹2,00,000</span>
            <span className="dossier-lbl">Total Cash Pool</span>
          </div>
          <div className="dossier-divider" aria-hidden="true" />
          <div className="dossier-metric">
            <span className="dossier-val">50 SQUADS</span>
            <span className="dossier-lbl">Campus Finalists</span>
          </div>
          <div className="dossier-divider" aria-hidden="true" />
          <div className="dossier-metric">
            <span className="dossier-val">24 HOURS</span>
            <span className="dossier-lbl">Non-Stop Sprint</span>
          </div>
          <div className="dossier-divider" aria-hidden="true" />
          <div className="dossier-metric">
            <span className="dossier-val">5 + 1</span>
            <span className="dossier-lbl">Bounty Categories</span>
          </div>
        </div>
      </div>
    </section>
  );
}
