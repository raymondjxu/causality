import React from 'react';

export default function HeroBanner() {
  return (
    <div
      style={{
        position: 'relative',
        background: 'linear-gradient(-135deg, var(--ucla-blue) 0%, var(--polynesian-blue) 100%)',
        height: '40rem',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16rem'
      }}
    >
      <div style={{ width: '33%', color: 'white' }}>
        <h1 style={{ fontSize: '48px', margin: 0 }}>Time for Timelines!</h1>
        <p style={{ fontSize: '18px', marginTop: '8px' }}>
          (Something witty and inspirational that I can't think of right now)
        </p>
      </div>
      <img
        src="/lists/alarmClock.svg"
        alt="Alarm Clock"
        style={{
          position: 'absolute',
          right: '20rem',
          height: '200px',
          transform: 'rotate(-15deg)'
        }}
      />
    </div>
  );
}
