import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import HomeScreen from './components/HomeScreen';
import RideScreen from './components/RideScreen';
import { loadMaps } from './utils/mapLoader';
import { Navigation2 } from 'lucide-react';

function App() {
  const [isLandscape, setIsLandscape] = useState(false);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  useEffect(() => {
    const handleOrientationChange = () => {
      setIsLandscape(window.innerWidth > window.innerHeight && window.innerWidth > 600);
    };

    window.addEventListener('resize', handleOrientationChange);
    handleOrientationChange();

    loadMaps()
      .then(() => setMapsLoaded(true))
      .catch((e: any) => console.error("Error loading Google Maps API", e));

    return () => window.removeEventListener('resize', handleOrientationChange);
  }, []);

  if (!mapsLoaded) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
        gap: '24px',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'var(--accent-glow)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'pulse 2s ease-in-out infinite',
        }}>
          <Navigation2 size={32} style={{ color: 'var(--accent)' }} />
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, letterSpacing: '0.15em', color: 'var(--accent)' }}>
          TURNAGO
        </div>
        <div style={{ fontFamily: 'var(--font-body)', color: 'var(--text-muted)', fontSize: 14 }}>
          Loading maps...
        </div>
        <style>{`@keyframes pulse { 0%, 100% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.15); opacity: 1; } }`}</style>
      </div>
    );
  }

  return (
    <>
      <BrowserRouter>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<HomeScreen theme={theme} toggleTheme={toggleTheme} />} />
            <Route path="/ride" element={<RideScreen theme={theme} toggleTheme={toggleTheme} />} />
          </Routes>
        </AnimatePresence>
      </BrowserRouter>

      {isLandscape && (
        <div style={{
          position: 'fixed', inset: 0, background: 'var(--bg)', zIndex: 9999,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16,
        }}>
          <Navigation2 size={48} style={{ color: 'var(--accent)', transform: 'rotate(90deg)' }} />
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--text-primary)' }}>
            Rotate to portrait
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-muted)' }}>
            TurnaGo is designed for portrait mode
          </p>
        </div>
      )}
    </>
  );
}

export default App;
