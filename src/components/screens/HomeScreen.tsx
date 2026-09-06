import React from 'react';
import { Settings, ChevronRight, Sparkles, Flame, Footprints, Moon, Scale, Target, ArrowUpRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { XpRing } from '../XpRing';
import { LevelCard } from '../LevelCard';
import { QuestCard } from '../QuestCard';
import { DAILY_QUESTS, SIDE_QUESTS } from '../../constants';
import { getGreetingMessage, parseDate } from '../../lib/calculations';
import { TabType } from '../BottomNavigation';

interface HomeScreenProps {
  onNavigateTab: (tab: TabType) => void;
  onOpenSettings: () => void;
  onOpenWeightModal: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateTab,
  onOpenSettings,
  onOpenWeightModal,
}) => {
  const {
    profile,
    dayNumber,
    activeTodayDate,
    todayXp,
    currentLog,
    streakStats,
    weightStats,
    toggleBooleanQuest,
    achievements,
  } = useApp();

  const formattedDate = parseDate(activeTodayDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  });

  const greeting = getGreetingMessage(dayNumber, todayXp, streakStats.currentStreak);

  // Incomplete quests preview (first 3 incomplete boolean quests)
  const incompleteQuests = DAILY_QUESTS.filter(
    (q) => q.type === 'boolean' && !currentLog.completedQuestIds.includes(q.id)
  ).slice(0, 3);

  // Most recent unlocked achievement if any
  const recentUnlocked = [...achievements]
    .filter((a) => a.unlockedAt)
    .sort((a, b) => (b.unlockedAt || '').localeCompare(a.unlockedAt || ''))[0];

  return (
    <div className="space-y-5 pb-24 animate-in fade-in duration-300">
      {/* Top Header */}
      <header className="flex items-start justify-between pt-2">
        <div>
          <span className="text-[11px] font-black tracking-widest uppercase text-sky-600 block">
            {greeting}
          </span>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            WINTER ARC
          </h1>
          <div className="flex items-center gap-2 mt-0.5 text-xs font-semibold text-slate-400">
            <span>Day {dayNumber}</span>
            <span>•</span>
            <span>{formattedDate}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenSettings}
          className="w-10 h-10 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:border-slate-300 shadow-xs transition-all cursor-pointer"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </header>

      {/* Character Progression Card */}
      <LevelCard />

      {/* Main Hero Card: TODAY'S XP */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col items-center justify-center text-center relative overflow-hidden">
        <div className="absolute top-4 left-5 flex items-center gap-1 text-[11px] font-bold tracking-wider uppercase text-slate-400">
          <span>DAILY OBJECTIVE</span>
        </div>

        <div className="my-2">
          <XpRing currentXp={todayXp} goalXp={profile.dailyXpGoal} size={190} strokeWidth={14} />
        </div>

        {/* Quick action button to dive into quests */}
        <button
          type="button"
          onClick={() => onNavigateTab('quests')}
          className="w-full mt-3 py-3 px-4 rounded-2xl bg-slate-50 hover:bg-sky-50/60 text-slate-700 hover:text-sky-800 text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-200/80 transition-all cursor-pointer"
        >
          <span>Open Today's Quest Log</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Concise Snapshot Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {/* Streak */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 mb-1">
            <Flame className="w-3.5 h-3.5" />
            <span>Streak</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-slate-900">{streakStats.currentStreak}</span>
            <span className="text-xs font-semibold text-slate-400">days</span>
          </div>
        </div>

        {/* Current Weight */}
        <div
          onClick={onOpenWeightModal}
          className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs cursor-pointer hover:border-sky-300 transition-all"
        >
          <div className="flex items-center justify-between text-xs font-bold text-sky-600 mb-1">
            <div className="flex items-center gap-1">
              <Scale className="w-3.5 h-3.5" />
              <span>Weight</span>
            </div>
            <ArrowUpRight className="w-3 h-3 text-slate-300" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-slate-900">{weightStats.currentWeight}</span>
            <span className="text-xs font-semibold text-slate-400">lb</span>
          </div>
          <div className="text-[10px] font-bold text-slate-400 mt-0.5">
            {weightStats.weightLost > 0 ? `-${weightStats.weightLost} lb lost` : 'Baseline set'}
          </div>
        </div>

        {/* Steps */}
        <div
          onClick={() => onNavigateTab('quests')}
          className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs cursor-pointer hover:border-sky-300 transition-all"
        >
          <div className="flex items-center gap-1.5 text-xs font-bold text-teal-600 mb-1">
            <Footprints className="w-3.5 h-3.5" />
            <span>Today's Steps</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-slate-900">
              {currentLog.steps.toLocaleString()}
            </span>
            <span className="text-[10px] font-semibold text-slate-400">/ 10k</span>
          </div>
        </div>

        {/* Sleep */}
        <div
          onClick={() => onNavigateTab('quests')}
          className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs cursor-pointer hover:border-sky-300 transition-all"
        >
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 mb-1">
            <Moon className="w-3.5 h-3.5" />
            <span>Sleep</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-slate-900">
              {currentLog.sleepHours > 0 ? currentLog.sleepHours : '—'}
            </span>
            <span className="text-xs font-semibold text-slate-400">hrs</span>
          </div>
        </div>

        {/* Daily Focus */}
        <div
          onClick={() => onNavigateTab('quests')}
          className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs cursor-pointer hover:border-sky-300 transition-all"
        >
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 mb-1">
            <Target className="w-3.5 h-3.5" />
            <span>Daily Focus</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-slate-900">
              {currentLog.focusRating > 0 ? `${currentLog.focusRating} / 5` : '—'}
            </span>
          </div>
        </div>

        {/* Days Left */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mb-1">
            <span>Arc Countdown</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-slate-900">
              {useApp().daysRemaining}
            </span>
            <span className="text-xs font-semibold text-slate-400">days left</span>
          </div>
        </div>
      </div>

      {/* Today's Quests Preview */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold tracking-tight text-slate-900 uppercase">
            Today's Quests Preview
          </h2>
          <button
            type="button"
            onClick={() => onNavigateTab('quests')}
            className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-0.5"
          >
            <span>View All ({DAILY_QUESTS.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2">
          {incompleteQuests.length > 0 ? (
            incompleteQuests.map((quest) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                isCompleted={currentLog.completedQuestIds.includes(quest.id)}
                onToggle={() => toggleBooleanQuest(quest.id)}
              />
            ))
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-center text-xs font-bold text-emerald-700">
              ✓ All main routine quests completed for today!
            </div>
          )}
        </div>
      </section>

      {/* Side Quests Bonus Opportunity */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <h2 className="text-sm font-extrabold tracking-tight text-slate-900 uppercase">
              Side Quests (Bonus XP)
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('quests')}
            className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-0.5"
          >
            <span>Explore 7 Quests</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-xs text-slate-400">
          Optional daily challenges to gain bonus overdrive XP.
        </p>
      </section>

      {/* Recent Achievement if any unlocked */}
      {recentUnlocked && (
        <div
          onClick={() => onNavigateTab('achievements')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5 cursor-pointer hover:border-sky-300 transition-all"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">
              Recent Achievement
            </span>
            <h4 className="text-sm font-extrabold text-slate-900 truncate">
              {recentUnlocked.title}
            </h4>
            <p className="text-xs text-slate-400 truncate">
              {recentUnlocked.description}
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300" />
        </div>
      )}
    </div>
  );
};
