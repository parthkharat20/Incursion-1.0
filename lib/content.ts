// @ts-nocheck

// Edit the schedule and registration destination here.
// Source of truth: incursion-2027-content.md & EVENT TIMELINE & MILESTONES ROADMAP
export const REGISTER_URL =
  process.env.NEXT_PUBLIC_REGISTER_URL ||
  'https://unstop.com/o/ZpWmr7H?lb=AmqFZlYX&utm_medium=Share&utm_source=online_coding_challenge&utm_campaign=Tejasnal6847';

export const TIMELINE = [
  {
    t: 'Registrations Window',
    phase: 'Phase 1 // Registration',
    tag: 'Updated Start Date',
    d: '11 November – 5 December 2026',
    x: 'National student team registrations (2 to 4 members).',
    img: { f: 0 },
    ic: { f: 0, z: '420%', p: '4% 45%' },
  },
  {
    t: 'PPT Submission Round',
    phase: 'Phase 2 // Ideation',
    tag: 'Proposal Round',
    d: '6 – 12 December 2026',
    x: 'Submission of solution deck & proposed architecture.',
    img: { f: 1 },
    ic: { f: 1, z: '420%', p: '56% 46%' },
  },
  {
    t: 'PPT Evaluation',
    phase: 'Phase 2 // Screening',
    tag: 'Expert Review',
    d: '13 – 19 December 2026',
    x: 'Rigorous scoring by panel of industry & faculty judges.',
    img: { f: 2 },
    ic: { f: 2, z: '420%', p: '50% 50%' },
  },
  {
    t: 'Video Prototype Submission',
    phase: 'Phase 3 // Prototyping',
    tag: 'Working Demo',
    d: '20 – 25 December 2026',
    x: 'Working prototype video demo (3–5 mins) & GitHub repo.',
    img: { f: 3 },
    ic: { f: 3, z: '420%', p: '50% 52%' },
  },
  {
    t: 'Prototype Evaluation',
    phase: 'Phase 3 // Audit',
    tag: 'Code Review',
    d: '25 December 2026 – 5 January 2027',
    x: 'In-depth codebase audit & technical assessment.',
    img: { f: 1 },
    ic: { f: 1, z: '420%', p: '50% 50%' },
  },
  {
    t: 'Result Announcement',
    phase: 'Phase 4 // Finalists',
    tag: 'Offline Invite',
    d: '6 January 2027',
    x: 'Declaration of Grand Finalists across India.',
    img: { f: 2 },
    ic: { f: 2, z: '420%', p: '50% 52%' },
  },
  {
    t: 'Grand Finale - On Campus',
    phase: 'Phase 4 // Grand Finale',
    tag: '24H National Finale',
    d: '30–31 January 2027 // DYPIT Campus, Pune',
    x: '24 Hours non-stop hackathon on campus at DIT Pimpri.',
    img: { url: '/media/doom-throne.webp', z: '190%', p: '50% 58%' },
    ic: { url: '/media/doom-closeup.webp', z: '390%', p: '52% 38%' },
  },
];

export const STILLS = ["/media/timeline-1.webp", "/media/timeline-2.webp", "/media/timeline-3.webp", "/media/timeline-4.webp"];

export function imageStyle(image) {
  const sources = { w: '/media/doom-throne.webp', c: '/media/doom-closeup.webp' };
  return {
    backgroundImage: `url(${image.url || (image.f != null ? STILLS[image.f] : sources[image.s])})`,
    backgroundSize: image.z || (image.f != null ? '125%' : 'cover'),
    backgroundPosition: image.p || (image.f != null ? '0% 35%' : '50% 50%'),
  };
}

export function jag(seed) {
  let r = seed * 9301 + 49297; const R = () => (r = (r * 9301 + 49297) % 233280) / 233280, P = [];
  for (let i = 0; i <= 14; i++)P.push(`${(R() * 3).toFixed(1)}% ${(i * 100 / 14).toFixed(1)}%`);
  for (let i = 1; i <= 9; i++)P.push(`${(i * 100 / 9).toFixed(1)}% ${(100 - R() * 3).toFixed(1)}%`);
  for (let i = 13; i >= 0; i--)P.push(`${(100 - R() * 3).toFixed(1)}% ${(i * 100 / 14).toFixed(1)}%`);
  for (let i = 8; i >= 1; i--)P.push(`${(i * 100 / 9).toFixed(1)}% ${(R() * 3).toFixed(1)}%`);
  return `polygon(${P.join(',')})`
}
