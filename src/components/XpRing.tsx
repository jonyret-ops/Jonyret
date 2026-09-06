import React from 'react';
import { motion } from 'motion/react';

interface XpRingProps {
  currentXp: number;
  goalXp?: number;
  size?: number;
  strokeWidth?: number;
}

export const XpRing: React.FC<XpRingProps> = ({
  currentXp,
  goalXp = 100,
  size = 200,
  strokeWidth = 14,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Base progress capped at 100%
  const baseProgress = Math.min(1, currentXp / goalXp);
  const baseStrokeDashoffset = circumference - baseProgress * circumference;

  // Bonus overdrive progress (amount beyond 100 XP, up to 50 bonus XP for visual secondary lap)
  const isConquered = currentXp >= goalXp;
  const isLockedIn = currentXp >= 120;
  const bonusXp = Math.max(0, currentXp - goalXp);

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#F1F5F9"
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        {/* Primary XP Progress Ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={isLockedIn ? '#0284C7' : isConquered ? '#0EA5E9' : '#38BDF8'}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={baseStrokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: baseStrokeDashoffset }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </svg>

      {/* Center Information */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
        <span className="text-xs font-bold tracking-wider uppercase text-slate-400">
          Today's XP
        </span>
        
        <div className="flex items-baseline justify-center gap-1 my-0.5">
          <motion.span
            key={currentXp}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-4xl font-extrabold tracking-tight text-slate-900"
          >
            {currentXp}
          </motion.span>
          <span className="text-sm font-semibold text-slate-400">
            /{goalXp}
          </span>
        </div>

        {/* Status text */}
        {isLockedIn ? (
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 mt-1 rounded-full bg-sky-100 text-sky-700 text-xs font-bold tracking-wide">
            <span>LOCKED IN</span>
            <span>🔥</span>
          </div>
        ) : isConquered ? (
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 mt-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold tracking-wide">
            <span>DAY CONQUERED</span>
            <span>✓</span>
          </div>
        ) : (
          <span className="text-xs font-semibold text-sky-600 mt-1">
            {goalXp - currentXp} XP TO CONQUER
          </span>
        )}

        {/* Bonus XP badge if exceeded */}
        {bonusXp > 0 && (
          <span className="text-[11px] font-bold text-sky-600/80 mt-1">
            +{bonusXp} BONUS XP
          </span>
        )}
      </div>
    </div>
  );
};
