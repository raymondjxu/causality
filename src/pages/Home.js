import React from 'react';
import { Link } from 'react-router-dom';

export default function Home({ eventListManifest }) {
  if (!eventListManifest) return <div>Loading...</div>;

  return (
    <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '2rem 16rem', background: '#333', color: 'white', fontSize: '24px' }}>
        Causality
      </header>
      <div
        style={{
          backgroundImage: 'url(https://via.placeholder.com/1200x300)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: '300px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16rem'
        }}
      >
        <div style={{ width: '33%', color: 'white' }}>
          <h1 style={{ fontSize: '48px', margin: 0 }}>Time for Timelines</h1>
          <p style={{ fontSize: '18px', marginTop: '8px' }}>
            Something creative and inspirational that I can't think of right now
          </p>
        </div>
      </div>
      <div style={{ background: '#f0f0f0', padding: '4rem 16rem', flex: 1 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px'
          }}
        >
          {eventListManifest.map(item => (
            <Link
              to={`/play/${encodeURIComponent(item.filename)}`}
              key={item.filename}
              style={{
                background: 'white',
                borderRadius: '8px',
                padding: '20px',
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>
                {item.emoji || '🎯'}
              </div>
              <h3 style={{ margin: 0 }}>{item.name}</h3>
            </Link>
          ))}
          <Link
            to="/create"
            style={{
              background: '#ddd',
              borderRadius: '8px',
              padding: '20px',
              textDecoration: 'none',
              color: '#555',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: '#bbb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                color: 'white',
                marginBottom: '12px'
              }}
            >
              +
            </div>
            <h3 style={{ margin: 0 }}>Create your Own</h3>
          </Link>
        </div>
      </div>
    </div>
  );
}
