import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import MainTimelineApp from './pages/MainTimelineApp';
import Header from './components/Header';
import Footer from './components/Footer';

export default function App() {
  const [eventListManifest, setEventListManifest] = React.useState(null);
  React.useEffect(() => {
    fetch(process.env.PUBLIC_URL + '/eventListManifest.json')
      .then(res => res.json())
      .then(data => setEventListManifest(data));
  }, []);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path="/" element={<Home eventListManifest={eventListManifest} />} />
          <Route path="/play/:eventListId" element={<MainTimelineApp />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}
