import IncursionExperience from '../components/IncursionExperience';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

const eventJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Event',
  name: 'INCURSION 2027',
  description: 'National-level Event organized by GDG on Campus, DYPIT Pune.',
  startDate: '2027-01-30T08:00:00+05:30',
  endDate: '2027-01-31T16:00:00+05:30',
  eventStatus: 'https://schema.org/EventScheduled',
  eventAttendanceMode: 'https://schema.org/MixedEventAttendanceMode',
  location: {
    '@type': 'Place',
    name: 'Dr. D. Y. Patil Institute of Technology',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Pimpri, Pune',
      addressRegion: 'Maharashtra',
      addressCountry: 'IN',
    },
  },
  organizer: {
    '@type': 'Organization',
    name: 'GDG on Campus, DYPIT Pune',
    url: 'https://gdg.community.dev/',
  },
  image: ['/media/doom-closeup4.png'],
  url: `${siteUrl}/universe`,
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'INR',
    availability: 'https://schema.org/InStock',
    url: `${siteUrl}/universe`,
  },
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }} />
      <IncursionExperience />
    </>
  );
}
