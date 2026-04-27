import React from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff } from 'lucide-react';

interface VoiceToggleProps {
  isMuted: boolean;
  isSpeaking: boolean;
  onToggle: () => void;
}

const VoiceToggle: React.FC<VoiceToggleProps> = ({ isMuted, isSpeaking, onToggle }) => {
  return (
    <div style={{ position: 'fixed', right: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 50 }}>
      <button
        onClick={onToggle}
        className="glass"
        style={{
          position: 'relative', width: 52, height: 52, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          borderColor: isMuted ? 'var(--border)' : 'var(--accent)',
          borderWidth: isMuted ? 1 : 2,
          transition: 'all 0.3s ease',
        }}
        aria-label={isMuted ? 'Unmute voice navigation' : 'Mute voice navigation'}
      >
        {isSpeaking && !isMuted && (
          <motion.div
            style={{
              position: 'absolute', inset: -4, borderRadius: '50%',
              border: '2px solid var(--accent)',
            }}
            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
        )}
        {isMuted ? (
          <MicOff size={20} style={{ color: 'var(--text-muted)' }} />
        ) : (
          <Mic size={20} style={{ color: 'var(--accent)' }} />
        )}
      </button>
    </div>
  );
};

export default VoiceToggle;
