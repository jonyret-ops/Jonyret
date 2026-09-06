import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, Target, Calendar, Scale } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const OnboardingModal: React.FC = () => {
  const { profile, startArc } = useApp();

  if (profile.hasStartedArc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="bg-white rounded-3xl w-full max-w-sm p-7 text-center border border-slate-100 shadow-2xl relative overflow-hidden"
      >
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 mb-4 shadow-xs">
          <Sparkles className="w-7 h-7 stroke-[2.5]" />
        </div>

        <span className="text-[11px] font-black tracking-widest uppercase text-sky-600 block mb-1">
          PERSONAL PROGRESSION SYSTEM
        </span>

        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
          WINTER ARC
        </h1>

        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          Level up the character by leveling up yourself. Transform routine into quests and consistency into XP.
        </p>

        {/* Highlight Card */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100/80 mb-6 text-left space-y-3">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/60">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
              <Calendar className="w-4 h-4 text-sky-600" />
              <span>DURATION</span>
            </div>
            <span className="text-xs font-black text-slate-900">
              SEP 6 — DEC 1 (87 DAYS)
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
              <Scale className="w-4 h-4 text-sky-600" />
              <span>WEIGHT TARGET</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-extrabold text-slate-400">242.2 LB</span>
              <span className="mx-1 text-slate-300">→</span>
              <span className="text-xs font-black text-slate-900">220 LB</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={startArc}
          className="w-full h-13 rounded-2xl bg-sky-500 hover:bg-sky-600 active:scale-98 text-white text-sm font-bold shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <span>BEGIN WINTER ARC</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <span className="text-[11px] text-slate-400 mt-3 block">
          Day 1 begins September 6, 2026
        </span>
      </motion.div>
    </div>
  );
};
