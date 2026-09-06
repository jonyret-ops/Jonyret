import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LevelUpModal: React.FC = () => {
  const { levelUpModalData, dismissLevelUpModal } = useApp();

  if (!levelUpModalData) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="bg-white rounded-3xl w-full max-w-xs p-7 text-center border border-slate-200/80 shadow-xl relative overflow-hidden"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-sky-50 text-sky-600 mb-4 border border-sky-100 shadow-xs">
            <Sparkles className="w-8 h-8 stroke-[2.5]" />
          </div>

          <span className="text-xs font-black tracking-widest uppercase text-sky-600 block mb-1">
            LEVEL UP
          </span>

          <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-1">
            LEVEL {levelUpModalData.newLevel}
          </h2>

          <div className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-extrabold uppercase tracking-wider mb-6">
            {levelUpModalData.title}
          </div>

          <p className="text-xs text-slate-500 mb-6 px-2 leading-relaxed">
            Your real-life discipline continues to sharpen. Level up the character by leveling up yourself.
          </p>

          <button
            type="button"
            onClick={dismissLevelUpModal}
            className="w-full h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 active:scale-98 text-white text-sm font-bold shadow-xs transition-all cursor-pointer"
          >
            Continue
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
