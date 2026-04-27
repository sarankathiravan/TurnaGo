import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navigation2, Crosshair, Sun, Moon, MapPin, ArrowRight } from 'lucide-react';
import SearchInput, { SelectedDestination } from './SearchInput';
import { useGeolocation } from '../hooks/useGeolocation';

interface HomeScreenProps {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ theme, toggleTheme }) => {
  const navigate = useNavigate();
  const { coords } = useGeolocation();
  const [fromPlace, setFromPlace] = useState<SelectedDestination | null>(null);
  const [toPlace, setToPlace] = useState<SelectedDestination | null>(null);
  const [useMyLocation, setUseMyLocation] = useState(true);

  const handleMyLocation = useCallback(() => {
    if (coords) {
      setFromPlace({
        name: 'My Location',
        address: 'Current GPS position',
        lat: coords.latitude,
        lng: coords.longitude,
      });
      setUseMyLocation(true);
    }
  }, [coords]);

  const handleBeginRide = () => {
    if (!toPlace) return;
    const origin = useMyLocation && coords
      ? { name: 'My Location', address: 'Current GPS', lat: coords.latitude, lng: coords.longitude }
      : fromPlace;

    navigate('/ride', {
      state: {
        destination: toPlace,
        origin: origin,
      }
    });
  };

  const canRide = !!toPlace && (useMyLocation || !!fromPlace);

  return (
    <motion.div
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
    >
      {/* Decorative gradient orbs */}
      <div style={{
        position: 'absolute', top: -120, right: -80, width: 300, height: 300,
        background: 'var(--accent-glow)', borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: -60, left: -60, width: 200, height: 200,
        background: 'var(--accent-glow)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none', opacity: 0.5,
      }} />

      {/* Header */}
      <div style={{ padding: '20px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12, background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Navigation2 size={20} color="white" style={{ transform: 'rotate(45deg)' }} />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 24, letterSpacing: '0.08em', color: 'var(--text-primary)' }}>
            TURNAGO
          </span>
        </div>
        <button
          onClick={toggleTheme}
          className="glass-pill"
          style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid var(--border)' }}
        >
          {theme === 'dark' ? <Sun size={18} style={{ color: 'var(--text-secondary)' }} /> : <Moon size={18} style={{ color: 'var(--text-secondary)' }} />}
        </button>
      </div>

      {/* Hero */}
      <div style={{ padding: '40px 24px 0', position: 'relative', zIndex: 10 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 44, color: 'var(--text-primary)', lineHeight: 1, margin: 0 }}>
          Navigate<br />
          <span style={{ color: 'var(--accent)' }}>Smarter.</span>
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: 16, color: 'var(--text-muted)', marginTop: 12 }}>
          Turn-by-turn guidance at a glance
        </p>
      </div>

      {/* Route Card */}
      <div className="glass" style={{ margin: '32px 20px 0', padding: 20, position: 'relative', zIndex: 10 }}>
        {/* From Field */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 8px var(--accent-glow)' }} />
              <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>FROM</span>
            </div>
            <button
              onClick={handleMyLocation}
              className="glass-pill"
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px',
                cursor: 'pointer', border: useMyLocation ? '1px solid var(--accent)' : '1px solid var(--border)',
                background: useMyLocation ? 'var(--accent-glow)' : 'var(--bg-glass)',
              }}
            >
              <Crosshair size={14} style={{ color: useMyLocation ? 'var(--accent)' : 'var(--text-muted)' }} />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500, color: useMyLocation ? 'var(--accent)' : 'var(--text-muted)' }}>My Location</span>
            </button>
          </div>
          {useMyLocation ? (
            <div className="glass" style={{ height: 56, display: 'flex', alignItems: 'center', padding: '0 16px', borderRadius: 16, opacity: 0.7 }}>
              <Crosshair size={18} style={{ color: 'var(--accent)', marginRight: 12 }} />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: 'var(--text-secondary)' }}>
                {coords ? 'Using current location' : 'Acquiring GPS...'}
              </span>
            </div>
          ) : (
            <SearchInput onPlaceSelect={(p) => { setFromPlace(p); }} currentLocation={coords} placeholder="Enter starting point..." />
          )}
          {!useMyLocation && (
            <button
              onClick={() => { setUseMyLocation(true); handleMyLocation(); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', marginTop: 6, fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--accent)' }}
            >
              ← Use my location instead
            </button>
          )}
        </div>

        {/* Dotted connector line */}
        <div style={{ display: 'flex', justifyContent: 'center', margin: '0 0 16px 4px' }}>
          <div style={{ width: 2, height: 24, background: `repeating-linear-gradient(to bottom, var(--accent) 0px, var(--accent) 4px, transparent 4px, transparent 8px)` }} />
        </div>

        {/* To Field */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--danger)' }} />
            <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>TO</span>
          </div>
          <SearchInput onPlaceSelect={setToPlace} currentLocation={coords} placeholder="Where are you headed?" />
        </div>

        {/* Selected destination preview */}
        {toPlace && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: 16, padding: '12px 16px', borderRadius: 12,
              background: 'var(--accent-glow)', border: '1px solid var(--border-accent)',
              display: 'flex', alignItems: 'center', gap: 12,
            }}
          >
            <MapPin size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 15, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {toPlace.name}
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {toPlace.address}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* CTA */}
      <div style={{ padding: '0 20px 32px', position: 'relative', zIndex: 10 }}>
        <motion.button
          onClick={handleBeginRide}
          whileTap={canRide ? { scale: 0.97 } : { x: [-4, 4, -4, 4, 0] }}
          style={{
            width: '100%', padding: '18px 24px', borderRadius: 16, border: 'none',
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, letterSpacing: '0.06em',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            cursor: canRide ? 'pointer' : 'default',
            background: canRide ? 'var(--accent)' : 'var(--bg-glass)',
            color: canRide ? 'var(--text-on-accent)' : 'var(--text-muted)',
            boxShadow: canRide ? 'var(--shadow-glow)' : 'none',
            transition: 'all 0.3s ease',
          }}
        >
          START NAVIGATION
          <ArrowRight size={20} />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default HomeScreen;
