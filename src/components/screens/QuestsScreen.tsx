import React from 'react';
import { DateNavigator } from '../DateNavigator';
import { QuestCard } from '../QuestCard';
import { StepsCard, SleepCard } from '../NumericQuestCard';
import { FocusSelectorCard } from '../FocusSelectorCard';
import { SideQuestCard } from '../SideQuestCard';
import { DAILY_QUESTS, SIDE_QUESTS } from '../../constants';
import { useApp } from '../../context/AppContext';
import { Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

export const QuestsScreen: React.FC = () => {
  const {
    currentLog,
    selectedDate,
    selectedDateXp,
    toggleBooleanQuest,
    setDailyFocus,
    setSteps,
    setSleep,
    toggleSideQuest,
    isDateFuture,
  } = useApp();

  const isFuture = isDateFuture(selectedDate);
  const isConquered = selectedDateXp >= 100;
  const isLockedIn = selectedDateXp >= 120;

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-300">
      {/* Date Navigator Header */}
      <DateNavigator />

      {/* Floating Daily XP Status Bar for current date */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400 block">
            Day's XP Earned
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900">
              {selectedDateXp}
            </span>
            <span className="text-xs font-bold text-slate-400">
              / 100 XP
            </span>
          </div>
        </div>

        <div>
          {isLockedIn ? (
            <div className="px-3 py-1.5 rounded-full bg-sky-100 text-sky-800 text-xs font-black tracking-wide flex items-center gap-1 border border-sky-200/60">
              <span>LOCKED IN</span>
              <span>🔥</span>
            </div>
          ) : isConquered ? (
            <div className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black tracking-wide flex items-center gap-1 border border-emerald-200/60">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>CONQUERED</span>
            </div>
          ) : (
            <div className="text-right">
              <span className="text-xs font-bold text-sky-600">
                {100 - selectedDateXp} XP to Conquer
              </span>
            </div>
          )}
        </div>
      </div>

      {isFuture && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center gap-2.5 text-xs text-amber-800 font-semibold">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>This is a future date. Quests cannot be completed ahead of time.</span>
        </div>
      )}

      {/* SECTION 1: DAILY ROUTINE QUESTS (Exact Order) */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
              Daily Quests
            </h2>
            <p className="text-xs text-slate-400">Chronological routine & checkpoints</p>
          </div>
          <span className="text-xs font-bold text-slate-400">
            {currentLog.completedQuestIds.length} / 15 routine done
          </span>
        </div>

        <div className="space-y-2">
          {DAILY_QUESTS.map((quest) => {
            // Quest #14: Focus Selector
            if (quest.id === 'daily_focus') {
              return (
                <FocusSelectorCard
                  key={quest.id}
                  currentRating={currentLog.focusRating}
                  disabled={isFuture}
                  onSelect={setDailyFocus}
                />
              );
            }

            // Quest #18: Steps
            if (quest.id === 'steps') {
              return (
                <StepsCard
                  key={quest.id}
                  currentSteps={currentLog.steps}
                  disabled={isFuture}
                  onSave={setSteps}
                />
              );
            }

            // Quest #19: Sleep
            if (quest.id === 'sleep') {
              return (
                <SleepCard
                  key={quest.id}
                  currentHours={currentLog.sleepHours}
                  disabled={isFuture}
                  onSave={setSleep}
                />
              );
            }

            // Boolean quests (#1 through #13, #15, #16, #17)
            const isDone = currentLog.completedQuestIds.includes(quest.id);
            return (
              <QuestCard
                key={quest.id}
                quest={quest}
                isCompleted={isDone}
                disabled={isFuture}
                onToggle={() => toggleBooleanQuest(quest.id)}
              />
            );
          })}
        </div>
      </section>

      {/* SECTION 2: SIDE QUESTS (Bonus Only) */}
      <section className="space-y-2.5 pt-4">
        <div className="flex items-center justify-between px-1 border-t border-slate-100 pt-4">
          <div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
                Side Quests
              </h2>
            </div>
            <p className="text-xs text-slate-400">Optional challenges • Bonus XP only</p>
          </div>
          <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg">
            +{currentLog.bonusXp} Bonus XP
          </span>
        </div>

        <div className="space-y-2">
          {SIDE_QUESTS.map((quest) => (
            <SideQuestCard
              key={quest.id}
              quest={quest}
              isCompleted={currentLog.completedSideQuestIds.includes(quest.id)}
              disabled={isFuture}
              onToggle={() => toggleSideQuest(quest.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
