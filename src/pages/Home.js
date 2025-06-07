import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import HeroBanner from '../components/HeroBanner';
import EventGrid from '../components/EventGrid';
import Footer from '../components/Footer';
// ...existing imports...

export default function Home({ eventListManifest }) {
  // show simple loading indicator until manifest arrives
  if (!eventListManifest) return <div>Loading...</div>;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
      <HeroBanner />
      <EventGrid items={eventListManifest} />
    </div>
  );
}
