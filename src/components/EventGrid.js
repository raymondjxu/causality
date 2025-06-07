import React from 'react';
import EventCard from './EventCard';

export default function EventGrid({ items }) {
  return (
    <div style={{ background: 'var(--background-light)', padding: '4rem 16rem', flex: 1 }}>
      <h2>Start exploring history with a prebuilt timeline…</h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(16rem, 1fr))',
          gap: '20px'
        }}
      >
        {items.map(item => (
          <EventCard
            key={item.filename}
            to={`/play/${encodeURIComponent(item.filename)}`}
            emoji={item.emoji || '🎯'}
            name={item.name}
          />
        ))}
        <EventCard
          to="/create"
          emoji="+"
          name="…or create your own"
          bg="var(--background-medium)"
          textColor="white"
          circleBg="#bbb"
        />
      </div>
    </div>
  );
}
