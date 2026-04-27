import React, { useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Navigation2, Sun, Moon } from 'lucide-react';
import { useGeolocation } from '../hooks/useGeolocation';
import { useDirections } from '../hooks/useDirections';
import { useVoice } from '../hooks/useVoice';
import { useWakeLock } from '../hooks/useWakeLock';
import TurnArrow from './TurnArrow';
import VoiceToggle from './VoiceToggle';
import RoadBackground from './RoadBackground';
import type { SelectedDestination } from './SearchInput';

interface RideScreenProps {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

const RideScreen: React.FC<RideScreenProps> = ({ theme, toggleTheme }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dest = location.state?.destination as SelectedDestination | undefined;

  const { coords, speedKmh } = useGeolocation();
  const { announce, isMuted, toggleMute, isSpeaking } = useVoice();
  useWakeLock(true);

  const destinationLatLng = useMemo(() => {
    if (dest) return new google.maps.LatLng(dest.lat, dest.lng);
    return null;
  }, [dest]);

  const { currentStep, nextStep, distanceToNext, eta, totalDistance, routeLoaded, error, roadType } = useDirections(
    destinationLatLng, coords, announce
  );

  const handleBack = useCallback(() => navigate('/'), [navigate]);

  const formatDistance = useCallback((meters: number | null) => {
    if (meters === null) return '-- m';
    if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
    return `${meters} m`;
  }, []);

  // Error / No destination states
  if (!dest) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--bg)' }}>
        <div className="glass" style={{ padding: 32, textAlign: 'center', maxWidth: 320 }}>
          <Navigation2 size={40} style={{ color: 'var(--danger)', margin: '0 auto 16px' }} />
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--text-primary)', marginBottom: 20 }}>No destination selected</p>
          <button onClick={handleBack} style={{
            background: 'var(--accent)', color: 'var(--text-on-accent)', padding: '12px 32px',
            borderRadius: 12, fontWeight: 700, fontFamily: 'var(--font-display)', border: 'none', cursor: 'pointer', fontSize: 16,
          }}>Go Back</button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--bg)' }}>
        <div className="glass" style={{ padding: 32, textAlign: 'center', maxWidth: 320 }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--danger)', marginBottom: 20 }}>{error}</p>
          <button onClick={handleBack} style={{
            background: 'var(--accent)', color: 'var(--text-on-accent)', padding: '12px 32px',
            borderRadius: 12, fontWeight: 700, fontFamily: 'var(--font-display)', border: 'none', cursor: 'pointer', fontSize: 16,
          }}>Go Back</button>
        </div>
      </div>
    );
  }

  if (!routeLoaded) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', gap: 20 }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}>
          <Navigation2 size={40} style={{ color: 'var(--accent)' }} />
        </motion.div>
        <p style={{ fontFamily: 'var(--font-display)', color: 'var(--accent)', fontSize: 22, letterSpacing: '0.1em' }}>
          CALCULATING ROUTE...
        </p>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-muted)', fontSize: 14 }}>
          Finding the best path for you
        </p>
      </div>
    );
  }

  return (
    <motion.div
      style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        overflow: 'hidden', position: 'fixed', inset: 0, background: 'var(--bg)',
      }}
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
    >
      {/* Animated road background */}
      <RoadBackground speedKmh={speedKmh} roadType={roadType} />

      <VoiceToggle isMuted={isMuted} isSpeaking={isSpeaking} onToggle={toggleMute} />

      {/* Top Strip — compact */}
      <div className="glass-strong" style={{
        margin: '8px 16px', padding: '10px 14px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        zIndex: 10, flexShrink: 0, borderRadius: 14,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
          <button onClick={handleBack} style={{
            padding: 6, marginLeft: -4, marginRight: 6, background: 'none', border: 'none', cursor: 'pointer',
          }}>
            <ArrowLeft size={18} style={{ color: 'var(--text-primary)' }} />
          </button>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{
              fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 15, color: 'var(--text-primary)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {dest.name}
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 2 }}>
              <span style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 12, color: 'var(--text-muted)' }}>{eta}</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>·</span>
              <span style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 12, color: 'var(--text-muted)' }}>{totalDistance}</span>
            </div>
          </div>
        </div>
        <button onClick={toggleTheme} style={{
          width: 30, height: 30, borderRadius: '50%', background: 'var(--bg-glass)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, marginLeft: 8,
        }}>
          {theme === 'dark' ? <Sun size={13} style={{ color: 'var(--text-muted)' }} /> : <Moon size={13} style={{ color: 'var(--text-muted)' }} />}
        </button>
      </div>

      {/* Main Navigation Area */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'flex-end', padding: '0 24px 40px', position: 'relative', zIndex: 5,
      }}>
        <AnimatePresence>
          <motion.div
            key={currentStep?.maneuver || 'start'}
            initial={{ opacity: 0.15 }}
            animate={{ opacity: 0 }}
            style={{ position: 'absolute', inset: 0, background: 'var(--accent-glow)', pointerEvents: 'none' }}
            transition={{ duration: 0.8 }}
          />
        </AnimatePresence>

        {currentStep ? (
          <>
            <div style={{ width: 160, height: 160, marginBottom: 20, flexShrink: 0 }}>
              <TurnArrow maneuver={currentStep.maneuver} />
            </div>

            <div className="glass-strong" style={{
              textAlign: 'center', width: '100%', maxWidth: 320,
              padding: '18px 20px', borderRadius: 18,
            }}>
              <div style={{
                fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 72, lineHeight: 1,
                color: 'var(--accent)', marginBottom: 10, letterSpacing: '-0.02em',
              }}>
                {formatDistance(distanceToNext)}
              </div>
              <div
                aria-live="polite"
                style={{
                  fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 18, lineHeight: 1.4,
                  color: 'var(--text-primary)', maxWidth: 280, margin: '0 auto',
                }}
                dangerouslySetInnerHTML={{ __html: currentStep.rawInstruction.replace(/<b>/g, '<span>').replace(/<\/b>/g, '</span>') }}
              />
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 56, lineHeight: 1,
              color: 'var(--success)', marginBottom: 12,
            }}>
              ARRIVED
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 22, color: 'var(--text-primary)' }}>
              You have reached your destination.
            </div>
          </div>
        )}
      </div>

      {/* Bottom Bar — compact */}
      <div className="glass-strong" style={{
        margin: '0 16px 12px', height: 64, display: 'flex', alignItems: 'center',
        flexShrink: 0, borderRadius: 14, zIndex: 10,
      }}>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0 6px', borderRight: '1px solid var(--border)' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, lineHeight: 1, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>{speedKmh}</div>
            <div style={{ fontSize: 9, fontFamily: 'var(--font-body)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 500, marginTop: 2 }}>km/h</div>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '0 6px', borderRight: '1px solid var(--border)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--text-primary)', lineHeight: 1 }}>
            {distanceToNext !== null ? (distanceToNext / 1000).toFixed(1) : '--'}
          </div>
          <div style={{ fontSize: 9, fontFamily: 'var(--font-body)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 500, marginTop: 2 }}>
            km left
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '0 6px' }}>
          {nextStep ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <TurnArrow maneuver={nextStep.maneuver} size={16} />
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
                  {nextStep.distanceText}
                </span>
              </div>
              <div style={{ fontSize: 9, fontFamily: 'var(--font-body)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 500, marginTop: 2 }}>
                then
              </div>
            </>
          ) : (
            <div style={{ fontSize: 9, fontFamily: 'var(--font-body)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 500 }}>
              no more turns
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default RideScreen;
