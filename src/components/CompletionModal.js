import React from 'react';

export default function CompletionModal({ onClose }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000
    }}>
      <div style={{ background: 'white', padding: 40, borderRadius: 16, textAlign: 'center', minWidth: 320 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🏆</div>
        <h2>Congratulations!</h2>
        <p>You placed all events in the correct order.</p>
        <button onClick={onClose} style={{ marginTop: 24, padding: '10px 24px', borderRadius: 8, fontSize: 18, background: '#4caf50', color: 'white', border: 'none', cursor: 'pointer' }}>Go to Main Menu</button>
      </div>
    </div>
  );
}
