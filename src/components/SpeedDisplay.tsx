import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SpeedDisplayProps {
  speed: string;
}

const SpeedDisplay: React.FC<SpeedDisplayProps> = ({ speed }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'relative', height: 48, overflow: 'hidden', width: '100%', display: 'flex', justifyContent: 'center' }}>
        <AnimatePresence mode="popLayout">
          <motion.div
            key={speed}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 48, lineHeight: 1,
              color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums',
            }}
          >
            {speed}
          </motion.div>
        </AnimatePresence>
      </div>
      <div style={{
        fontSize: 11, fontFamily: 'var(--font-body)', letterSpacing: '0.12em',
        textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: 4, fontWeight: 500,
      }}>
        km/h
      </div>
    </div>
  );
};

export default SpeedDisplay;
