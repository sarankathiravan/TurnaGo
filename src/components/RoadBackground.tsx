import React, { useMemo } from 'react';

interface RoadBackgroundProps {
  speedKmh: string;
  roadType: 'highway' | 'standard';
}

const RoadBackground: React.FC<RoadBackgroundProps> = React.memo(({ speedKmh, roadType }) => {
  const speed = parseInt(speedKmh) || 0;

  // Animation duration inversely proportional to speed. Faster = shorter duration = faster scroll
  const animDuration = useMemo(() => {
    if (speed <= 0) return 0; // stopped
    if (speed < 10) return 4;
    if (speed < 30) return 2.5;
    if (speed < 60) return 1.5;
    if (speed < 80) return 1.0;
    return 0.6;
  }, [speed]);

  const isHighway = roadType === 'highway';
  const roadWidth = isHighway ? 260 : 200;
  const laneWidth = isHighway ? 50 : 55;

  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity: 0.35,
    }}>
      <svg
        width={roadWidth}
        height="100%"
        style={{ position: 'absolute', height: '100%' }}
        viewBox={`0 0 ${roadWidth} 600`}
        preserveAspectRatio="none"
      >
        {/* Road surface */}
        <rect x="0" y="0" width={roadWidth} height="600" fill="var(--road-asphalt)" />

        {/* Left edge line */}
        <line x1="4" y1="0" x2="4" y2="600" stroke="var(--road-edge)" strokeWidth="3" />

        {/* Right edge line */}
        <line x1={roadWidth - 4} y1="0" x2={roadWidth - 4} y2="600" stroke="var(--road-edge)" strokeWidth="3" />

        {isHighway ? (
          <>
            {/* 4-lane highway with center divider */}
            {/* Left lane divider (dashed) */}
            <line x1={laneWidth} y1="0" x2={laneWidth} y2="600"
              stroke="var(--road-line)" strokeWidth="2" strokeDasharray="30 20"
              style={animDuration > 0 ? { animation: `roadScroll ${animDuration}s linear infinite` } : undefined}
            />

            {/* Center divider — solid double line */}
            <rect x={roadWidth / 2 - 6} y="0" width="12" height="600" fill="var(--road-divider)" rx="2" />
            <line x1={roadWidth / 2 - 2} y1="0" x2={roadWidth / 2 - 2} y2="600" stroke="var(--road-line)" strokeWidth="2" />
            <line x1={roadWidth / 2 + 2} y1="0" x2={roadWidth / 2 + 2} y2="600" stroke="var(--road-line)" strokeWidth="2" />

            {/* Right lane divider (dashed) */}
            <line x1={roadWidth - laneWidth} y1="0" x2={roadWidth - laneWidth} y2="600"
              stroke="var(--road-line)" strokeWidth="2" strokeDasharray="30 20"
              style={animDuration > 0 ? { animation: `roadScroll ${animDuration}s linear infinite` } : undefined}
            />
          </>
        ) : (
          <>
            {/* 2-lane road — single dashed center line */}
            <line x1={roadWidth / 2} y1="0" x2={roadWidth / 2} y2="600"
              stroke="var(--road-line)" strokeWidth="3" strokeDasharray="30 20"
              style={animDuration > 0 ? { animation: `roadScroll ${animDuration}s linear infinite` } : undefined}
            />
          </>
        )}
      </svg>

      {/* Vehicle indicator at bottom */}
      <div style={{
        position: 'absolute', bottom: '18%', left: '50%', transform: 'translateX(-50%)',
        width: 20, height: 32, borderRadius: 6,
        background: 'var(--accent)',
        boxShadow: `0 0 20px var(--accent-glow), 0 -10px 30px var(--accent-glow)`,
        zIndex: 2,
      }}>
        {/* Headlights */}
        <div style={{
          position: 'absolute', top: -4, left: 2, right: 2, height: 3,
          background: 'var(--road-line)', borderRadius: 2, opacity: 0.8,
        }} />
      </div>

      <style>{`
        @keyframes roadScroll {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -50; }
        }
      `}</style>
    </div>
  );
});

export default RoadBackground;
