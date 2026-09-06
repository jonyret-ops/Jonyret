import React from 'react';
import { Flame, Trophy, Zap, Award } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const StreakCard: React.FC = () => {
  const { streakStats } = useApp();

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
      <div className="grid grid-cols-4 gap-2 text-center">
        {/* Current Streak */}
        <div className="flex flex-col items-center p-2 rounded-xl bg-slate-50 border border-slate-200/70">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 mb-1">
            <Flame className="w-4 h-4" />
          </div>
          <span className="text-lg font-black text-slate-900 leading-tight">
            {streakStats.currentStreak}
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
            Streak
          </span>
        </div>

        {/* Best Streak */}
        <div className="flex flex-col items-center p-2 rounded-xl bg-slate-50 border border-slate-200/70">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-sky-50 text-sky-600 border border-sky-100 mb-1">
            <Trophy className="w-4 h-4" />
          </div>
          <span className="text-lg font-black text-slate-900 leading-tight">
            {streakStats.longestStreak}
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
            Best
          </span>
        </div>

        {/* 100+ Days */}
        <div className="flex flex-col items-center p-2 rounded-xl bg-slate-50 border border-slate-200/70">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 mb-1">
            <Zap className="w-4 h-4" />
          </div>
          <span className="text-lg font-black text-slate-900 leading-tight">
            {streakStats.totalSuccessfulDays}
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
            100+ XP
          </span>
        </div>

        {/* 120+ Days */}
        <div className="flex flex-col items-center p-2 rounded-xl bg-slate-50 border border-slate-200/70">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 mb-1">
            <Award className="w-4 h-4" />
          </div>
          <span className="text-lg font-black text-slate-900 leading-tight">
            {streakStats.totalLockedInDays}
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
            120+ XP
          </span>
        </div>
      </div>
    </div>
  );
};
