import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Home from './pages/Home';
import MainTimelineApp from './pages/MainTimelineApp';
import Footer from './components/Footer';
import CreateSet from './pages/CreateSet';

export default function App() {
  const [eventListManifest, setEventListManifest] = React.useState(null);
  const location = useLocation();
  React.useEffect(() => {
    fetch(process.env.PUBLIC_URL + '/eventListManifest.json')
      .then(res => res.json())
      .then(data => setEventListManifest(data));
  }, []);
  // pages manage their own loading states
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            <Route
              path="/"
              element={
                <motion.div
                  initial={{ scale: 0.9, blur: '2px', opacity: 0.8 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1, opacity: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 260,
                    damping: 20,
                    bounce: 0.3,
                    duration: 0.4
                  }}
                >
                  <Home eventListManifest={eventListManifest} />
                </motion.div>
              }
            />
            <Route
              path="/play/:eventListId"
              element={
                <motion.div
                  style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
                  initial={{ scale: 0.1, opacity: 0.8 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1, opacity: 0 }}
                >
                  <MainTimelineApp />
                </motion.div>
              }
            />
            <Route
              path="/create"
              element={
                <motion.div
                  style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
                  initial={{ scale: 0.1, opacity: 0.8 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1, opacity: 0 }}
                >
                  <CreateSet />
                </motion.div>
              }
            />
          </Routes>
        </AnimatePresence>
      </div>
      <Footer />
    </div>
  );
}
