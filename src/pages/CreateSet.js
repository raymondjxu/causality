import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function CreateSet() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <h1>Under Construction! Check back later for more details.</h1>
      </main>
    </div>
  );
}
