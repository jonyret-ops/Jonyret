import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AchievementUnlockToast: React.FC = () => {
  const { recentAchievement, dismissAchievement } = useApp();

  useEffect(() => {
    if (recentAchievement) {
      const timer = setTimeout(() => {
        dismissAchievement();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [recentAchievement, dismissAchievement]);

  if (!recentAchievement) return null;

  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <AnimatePresence>
        <motion.div
          initial={{ y: -50, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -30, opacity: 0, scale: 0.95 }}
          className="pointer-events-auto bg-white rounded-2xl p-4 border border-slate-200/80 shadow-lg flex items-center gap-3.5 max-w-sm w-full"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60 shrink-0">
            <Award className="w-5 h-5 stroke-[2.5]" />
          </div>

          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-black tracking-wider uppercase text-amber-600 block">
              Achievement Unlocked!
            </span>
            <h4 className="text-sm font-extrabold text-slate-900 tracking-tight truncate">
              {recentAchievement.title}
            </h4>
            <p className="text-xs text-slate-500 truncate">
              {recentAchievement.description}
            </p>
          </div>

          <button
            type="button"
            onClick={dismissAchievement}
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
