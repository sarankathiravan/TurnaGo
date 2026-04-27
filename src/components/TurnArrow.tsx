import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ManeuverType } from '../types/navigation';

interface TurnArrowProps {
  maneuver: ManeuverType;
  size?: number;
}

const getArrowPath = (maneuver: ManeuverType) => {
  switch (maneuver) {
    case 'straight':
      return "M100 180 L100 40 M60 80 L100 20 L140 80";
    case 'turn-left':
      return "M100 180 L100 120 Q100 60 40 60 M80 20 L20 60 L80 100";
    case 'turn-right':
      return "M100 180 L100 120 Q100 60 160 60 M120 20 L180 60 L120 100";
    case 'turn-sharp-left':
      return "M120 180 L120 100 Q120 40 40 100 M60 60 L20 100 L60 140";
    case 'turn-sharp-right':
      return "M80 180 L80 100 Q80 40 160 100 M140 60 L180 100 L140 140";
    case 'turn-slight-left':
      return "M120 180 L100 100 L60 40 M100 40 L40 20 L60 80";
    case 'turn-slight-right':
      return "M80 180 L100 100 L140 40 M100 40 L160 20 L140 80";
    case 'uturn-left':
      return "M140 180 L140 100 Q140 40 100 40 Q60 40 60 100 L60 180 M20 140 L60 190 L100 140";
    case 'uturn-right':
      return "M60 180 L60 100 Q60 40 100 40 Q140 40 140 100 L140 180 M100 140 L140 190 L180 140";
    case 'roundabout-left':
    case 'roundabout-right':
      return "M100 180 L100 140 A40 40 0 1 1 60 100 M60 100 L20 80 M40 140 L20 80 L80 60";
    case 'merge':
    case 'fork-left':
      return "M100 180 L100 100 L60 40 M100 40 L40 20 L60 80 M100 100 L140 40";
    case 'fork-right':
      return "M100 180 L100 100 L140 40 M100 40 L160 20 L140 80 M100 100 L60 40";
    case 'keep-left':
      return "M120 180 L120 100 L80 40 M120 40 L60 20 L80 80";
    case 'keep-right':
      return "M80 180 L80 100 L120 40 M80 40 L140 20 L120 80";
    case 'ramp-left':
      return "M120 180 L120 100 Q120 60 60 40 M100 40 L40 20 L60 80";
    case 'ramp-right':
      return "M80 180 L80 100 Q80 60 140 40 M100 40 L160 20 L140 80";
    default:
      return "M100 180 L100 40 M60 80 L100 20 L140 80";
  }
};

const TurnArrow: React.FC<TurnArrowProps> = React.memo(({ maneuver, size }) => {
  return (
    <div style={{
      position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
      width: size || '100%', height: size || '100%',
      filter: 'drop-shadow(0 0 20px var(--accent-glow))',
    }}>
      <AnimatePresence mode="wait">
        <motion.svg
          key={maneuver}
          viewBox="0 0 200 200"
          style={{ width: '100%', height: '100%', color: 'var(--accent)' }}
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: [0.85, 1.05, 1], opacity: 1 }}
          exit={{ scale: 0.85, opacity: 0 }}
          transition={{ duration: 0.4, type: 'spring', bounce: 0.4 }}
        >
          <path
            d={getArrowPath(maneuver)}
            fill="none"
            stroke="currentColor"
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.svg>
      </AnimatePresence>
    </div>
  );
});

export default TurnArrow;
