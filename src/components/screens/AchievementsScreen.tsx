import React, { useState } from 'react';
import {
  Award,
  Check,
  Lock,
  Sparkles,
  Flame,
  ShieldAlert,
  Trees,
  Footprints,
  Compass,
  Dumbbell,
  Sun,
  BookOpen,
  TrendingDown,
  Crown,
  Droplets,
  Moon,
  Shield,
  Target,
  Crosshair,
  Pill
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Achievement } from '../../types';

export const AchievementsScreen: React.FC = () => {
  const { achievements } = useApp();
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  const unlockedCount = achievements.filter((a) => !!a.unlockedAt).length;
  const totalCount = achievements.length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  const filteredAchievements = achievements.filter((ach) => {
    if (filter === 'unlocked') return !!ach.unlockedAt;
    if (filter === 'locked') return !ach.unlockedAt;
    return true;
  });

  // Icon lookup map
  const getIcon = (iconName: string, isUnlocked: boolean) => {
    const props = { className: `w-5 h-5 ${isUnlocked ? 'stroke-[2.5]' : 'stroke-[1.5]'}` };
    switch (iconName) {
      case 'Sparkles': return <Sparkles {...props} />;
      case 'Flame': return <Flame {...props} />;
      case 'ShieldAlert': return <ShieldAlert {...props} />;
      case 'Trees': return <Trees {...props} />;
      case 'Footprints': return <Footprints {...props} />;
      case 'Compass': return <Compass {...props} />;
      case 'Dumbbell': return <Dumbbell {...props} />;
      case 'Sun': return <Sun {...props} />;
      case 'BookOpen': return <BookOpen {...props} />;
      case 'TrendingDown': return <TrendingDown {...props} />;
      case 'Crown': return <Crown {...props} />;
      case 'Droplets': return <Droplets {...props} />;
      case 'Moon': return <Moon {...props} />;
      case 'Shield': return <Shield {...props} />;
      case 'Target': return <Target {...props} />;
      case 'Crosshair': return <Crosshair {...props} />;
      case 'Pill': return <Pill {...props} />;
      default: return <Award {...props} />;
    }
  };

  return (
    <div className="space-y-5 pb-28 animate-in fade-in duration-300">
      {/* Header */}
      <header className="pt-2">
        <span className="text-[11px] font-black tracking-widest uppercase text-sky-600 block">
          MILESTONES & TROPHIES
        </span>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          ACHIEVEMENTS
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Real milestones unlocked by genuine physical and mental discipline.
        </p>
      </header>

      {/* Overview Progress Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase block mb-1">
            Unlocked Milestones
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-slate-900">
              {unlockedCount}
            </span>
            <span className="text-sm font-bold text-slate-400">
              / {totalCount}
            </span>
          </div>
          <span className="text-xs font-bold text-sky-600 mt-1 block">
            {progressPercent}% completed
          </span>
        </div>

        <div className="w-20 h-20 relative flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="40"
              cy="40"
              r="32"
              stroke="#F1F5F9"
              strokeWidth="8"
              fill="transparent"
            />
            <circle
              cx="40"
              cy="40"
              r="32"
              stroke="#0EA5E9"
              strokeWidth="8"
              strokeDasharray={2 * Math.PI * 32}
              strokeDashoffset={2 * Math.PI * 32 - (progressPercent / 100) * (2 * Math.PI * 32)}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          <Award className="w-7 h-7 text-sky-500 absolute" />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl">
        {(['all', 'unlocked', 'locked'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`flex-1 py-1.5 text-xs font-bold capitalize rounded-lg transition-all ${
              filter === f
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {f} {f === 'unlocked' ? `(${unlockedCount})` : f === 'locked' ? `(${totalCount - unlockedCount})` : `(${totalCount})`}
          </button>
        ))}
      </div>

      {/* Achievement Cards Grid */}
      <div className="grid grid-cols-1 gap-2.5">
        {filteredAchievements.map((ach) => {
          const isUnlocked = !!ach.unlockedAt;
          const unlockDateFormatted = ach.unlockedAt
            ? new Date(ach.unlockedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : null;

          return (
            <div
              key={ach.id}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3.5 ${
                isUnlocked
                  ? 'bg-white border-slate-200/80 shadow-xs'
                  : 'bg-slate-50/50 border-slate-200/60 opacity-65'
              }`}
            >
              <div className="flex items-start gap-3.5">
                {/* Icon Container */}
                <div
                  className={`flex items-center justify-center w-11 h-11 rounded-2xl shrink-0 mt-0.5 ${
                    isUnlocked
                      ? 'bg-amber-50 text-amber-600 border border-amber-200/60 shadow-xs'
                      : 'bg-slate-200/60 text-slate-400'
                  }`}
                >
                  {getIcon(ach.icon, isUnlocked)}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3
                      className={`text-sm font-black tracking-tight ${
                        isUnlocked ? 'text-slate-900' : 'text-slate-600'
                      }`}
                    >
                      {ach.title}
                    </h3>
                    {isUnlocked && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[10px] font-black">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>UNLOCKED</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    {ach.description}
                  </p>

                  {isUnlocked && unlockDateFormatted && (
                    <span className="text-[10px] font-semibold text-slate-400 mt-1.5 block">
                      Unlocked on {unlockDateFormatted}
                    </span>
                  )}
                </div>
              </div>

              {!isUnlocked && (
                <div className="shrink-0 pt-1 text-slate-400" title="Locked">
                  <Lock className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
