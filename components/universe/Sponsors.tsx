'use client';

export default function Sponsors() {
  return (
    <section id="sponsors" className="universe-section">
      <div className="universe-container">
        <div className="universe-section-header">
          <div className="universe-eyebrow">Allies & Ecosystem</div>
          <h2 className="universe-section-title">Partners & Sponsors</h2>
          <p className="universe-section-desc">
            INCURSION 2027 is made possible through collaborations with visionary industry leaders.
          </p>
        </div>

        {/* Organizing Chapter Badge */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--mute)', marginBottom: '10px' }}>
            Presented & Organized By
          </div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '14px',
              padding: '12px 28px',
              borderRadius: '999px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
            }}
          >
            <img src="/gdg-logo.svg" alt="GDG on Campus Logo" style={{ height: '24px', width: 'auto' }} />
            <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', letterSpacing: '0.02em' }}>
              GDG on Campus // Dr. D. Y. Patil Institute of Technology, Pimpri, Pune
            </span>
          </div>
        </div>

        {/* Sponsor Tier Containers (Preserved structure ready for confirmed partner logos) */}
        <div className="universe-sponsors-container" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <div
            className="universe-card"
            style={{
              padding: '40px 24px',
              borderStyle: 'dashed',
              borderColor: 'rgba(233, 231, 224, 0.2)',
              background: 'rgba(8, 12, 10, 0.4)',
            }}
          >
            <div style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--mute)', marginBottom: '10px' }}>
              Partnership Announcements
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text)', marginBottom: '8px' }}>
              To Be Announced
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--mute)', margin: 0, maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto' }}>
              Official sponsors, platform partners, and track challenges will be revealed leading up to the event.
              Connect with us at <span style={{ color: 'var(--accent)', fontWeight: 600 }}>@gdg.dit</span> or{' '}
              <a href="mailto:gdg.dit@dypvp.edu.in" style={{ color: 'var(--accent)', fontWeight: 600 }}>
                gdg.dit@dypvp.edu.in
              </a>{' '}
              for partnership queries.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
