import React from 'react';
import { motion } from 'motion/react';

interface XpProgressBarProps {
  current: number;
  total: number;
  label?: string;
  subLabel?: string;
  colorClass?: string;
  heightClass?: string;
}

export const XpProgressBar: React.FC<XpProgressBarProps> = ({
  current,
  total,
  label,
  subLabel,
  colorClass = 'bg-sky-500',
  heightClass = 'h-2.5',
}) => {
  const percent = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;

  return (
    <div className="w-full">
      {(label || subLabel) && (
        <div className="flex justify-between items-baseline mb-1.5 text-xs font-semibold text-slate-500">
          <span>{label}</span>
          <span>{subLabel}</span>
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${heightClass}`}>
        <motion.div
          className={`${heightClass} rounded-full ${colorClass}`}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};
