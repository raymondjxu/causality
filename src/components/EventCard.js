import React from 'react';
import { Link } from 'react-router-dom';

export default function EventCard({ to, emoji, name, bg = 'white', textColor = 'inherit', circleBg = '#eee', style = {} }) {
  return (
    <Link
      to={to}
      style={{
        background: bg,
        borderRadius: '8px',
        padding: '16px',
        textDecoration: 'none',
        color: textColor,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        height: '8rem',
        boxSizing: 'border-box',
        ...style
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: circleBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          marginRight: '12px',
          flexShrink: 0
        }}
      >
        {emoji}
      </div>
      <h3
        style={{
          margin: 0,
          fontSize: '16px',
          flex: 1,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}
      >
        {name}
      </h3>
    </Link>
  );
}
