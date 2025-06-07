import React from 'react';

export default function EventListSelector({ manifest, onSelect }) {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{ background: 'white', padding: 32, borderRadius: 8, minWidth: 320 }}>
        <h2>Select an Event List</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {manifest.map((item, idx) => (
            <li key={item.filename} style={{ margin: '16px 0' }}>
              <button onClick={() => onSelect(item)} style={{ width: '100%', padding: 12, borderRadius: 4, border: '1px solid #ccc', background: '#f5f5f5', cursor: 'pointer', textAlign: 'left' }}>
                <strong>{item.name}</strong>
                <div style={{ fontSize: 14, color: '#555' }}>{item.description}</div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
