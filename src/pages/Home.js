import React from 'react';
import { Link } from 'react-router-dom';

export default function Home({ eventListManifest }) {
  if (!eventListManifest) return <div>Loading...</div>;
  return (
    <div style={{ padding: 32 }}>
      <h1>Welcome to the Timeline App</h1>
      <nav>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {eventListManifest.map((item) => (
            <li key={item.filename} style={{ margin: '16px 0' }}>
              <Link to={`/play/${encodeURIComponent(item.filename)}`}>{item.name}</Link>
              <div style={{ fontSize: 14, color: '#555' }}>{item.description}</div>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
