'use client';

const PODIUM_PRIZES = [
  {
    rank: '01',
    title: 'Overall Champion',
    award: '₹1,00,000',
    subtitle: 'Vibranium Grand Champion',
    perks: [
      'Winner Grand Trophy & Certificates of Excellence',
      'Official Project Showcase across GDG on Campus Channels',
      'Direct Introductions to Sponsors, Founders & Alumni',
      'Dedicated Technical Mentorship & Incubation Sessions',
      'Potential Internship & Hiring Discussions',
    ],
    highlight: true,
  },
  {
    rank: '02',
    title: '1st Runner-Up',
    award: '₹50,000',
    subtitle: 'Multiverse Contender',
    perks: [
      '1st Runner-Up Trophy & Certificates of Excellence',
      'Official Project Showcase across GDG Channels',
      'Dedicated Mentor Follow-ups & Code Reviews',
      'Sponsor Merchandise & Tech Swag Kit',
    ],
    highlight: false,
  },
  {
    rank: '03',
    title: '2nd Runner-Up',
    award: '₹25,000',
    subtitle: 'Multiverse Contender',
    perks: [
      '2nd Runner-Up Trophy & Certificates of Excellence',
      'Official Project Showcase across GDG Channels',
      'Mentorship & Product Feedback Sessions',
      'Sponsor Merchandise & Tech Swag Kit',
    ],
    highlight: false,
  },
];

const TRACK_PRIZES = [
  { name: 'Rogue Protocol', tag: 'AI & Agents', award: '₹5,000' },
  { name: 'Firewall Zero', tag: 'Cyber & FinTech', award: '₹5,000' },
  { name: 'Final Hour', tag: 'Open Innovation', award: '₹5,000' },
  { name: 'Glass Wall', tag: 'GovTech', award: '₹5,000' },
  { name: 'Survival City', tag: 'Smart Cities', award: '₹5,000' },
];

export default function Prizes() {
  return (
    <section id="prizes" className="universe-section">
      <div className="universe-container">
        <div className="universe-section-header">
          <div className="universe-eyebrow">The Vibranium Vault</div>
          <h2 className="universe-section-title">Prize Pool: ₹2,00,000</h2>
          <p className="universe-section-desc">
            A combined ₹2,00,000 direct cash prize pool distributed across top podium finishes, specialized track bounties,
            and dedicated recognition for first-time contenders.
          </p>
        </div>

        {/* Podium Grid */}
        <div className="universe-podium-grid">
          {PODIUM_PRIZES.map((prize) => (
            <div
              key={prize.rank}
              className={`universe-prize-card ${prize.highlight ? 'highlight' : ''}`}
            >
              <div className="tactical-corner tl" />
              <div className="tactical-corner tr" />
              <div className="tactical-corner bl" />
              <div className="tactical-corner br" />

              <div>
                <div className="universe-prize-header">
                  <span className="universe-prize-rank">Rank {prize.rank}</span>
                  {prize.highlight && (
                    <span className="universe-prize-badge" style={{ background: '#ffd700', color: '#040605' }}>
                      GRAND CHAMPION
                    </span>
                  )}
                </div>
                <h3 className="universe-prize-title">
                  {prize.title}
                </h3>
                <div className="universe-prize-val">{prize.award}</div>
                <div className="universe-prize-sub">{prize.subtitle}</div>
              </div>

              <div>
                <div className="universe-prize-perks-title">
                  Included Recognition &amp; Perks:
                </div>
                <ul className="universe-prize-list">
                  {prize.perks.map((p) => (
                    <li key={p} className="universe-prize-item">
                      <span className="universe-prize-dot" aria-hidden="true" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Track Winners */}
        <div className="universe-bounties-wrapper">
          <div className="universe-bounties-header">
            <div className="universe-eyebrow">Dedicated Track Bounties</div>
            <h3 className="universe-bounties-title">
              5 Incursion Track Winners
            </h3>
          </div>

          <div className="universe-bounties-grid">
            {TRACK_PRIZES.map((t) => (
              <div key={t.name} className="universe-card universe-bounty-card">
                <div className="bounty-badge-tag">{t.tag}</div>
                <h4 className="bounty-name">{t.name}</h4>
                <div className="bounty-amount">{t.award}</div>
                <small className="bounty-perk">Trophy + Certificate</small>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
