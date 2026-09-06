import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Scale,
  Plus,
  TrendingDown,
  Flame,
  Award,
  Calendar,
  Footprints,
  Moon,
  Target,
  Sparkles,
  Dumbbell,
  ArrowDownRight,
  ArrowUpRight,
  ChevronRight,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { addDays, calculateWeeklyReport, formatDate, parseDate } from '../../lib/calculations';
import { DAILY_QUESTS, SIDE_QUESTS } from '../../constants';
import { DailyLog } from '../../types';

interface ProgressScreenProps {
  onOpenWeightModal: () => void;
  onSelectHistoricalDate: (date: string) => void;
}

type FilterRange = '7d' | '30d' | 'all';
type ChartTab = 'xp' | 'weight' | 'steps' | 'sleep';

export const ProgressScreen: React.FC<ProgressScreenProps> = ({
  onOpenWeightModal,
  onSelectHistoricalDate,
}) => {
  const {
    allLogs,
    weightEntries,
    streakStats,
    weightStats,
    activeTodayDate,
    deleteWeightEntry,
  } = useApp();

  const [rangeFilter, setRangeFilter] = useState<FilterRange>('7d');
  const [activeChartTab, setActiveChartTab] = useState<ChartTab>('xp');
  const [selectedHistoricalLog, setSelectedHistoricalLog] = useState<DailyLog | null>(null);

  // Compute weekly report for the current week ending today
  const weeklyReport = useMemo(() => {
    return calculateWeeklyReport(allLogs, weightEntries, activeTodayDate);
  }, [allLogs, weightEntries, activeTodayDate]);

  // Compute logs for chosen date range
  const filteredLogs = useMemo(() => {
    const daysCount = rangeFilter === '7d' ? 7 : rangeFilter === '30d' ? 30 : 90;
    const result: DailyLog[] = [];

    for (let i = daysCount - 1; i >= 0; i--) {
      const dStr = addDays(activeTodayDate, -i);
      const found = allLogs.find((l) => l.date === dStr);
      if (found) {
        result.push(found);
      } else {
        // synthesize placeholder log for continuity on charts
        result.push({
          date: dStr,
          completedQuestIds: [],
          completedSideQuestIds: [],
          steps: 0,
          sleepHours: 0,
          focusRating: 0,
          energyDrinkConsumed: false,
          baseXp: 0,
          bonusXp: 0,
          totalXp: 0,
          dailyRank: 'ROUGH DAY',
          createdAt: '',
          updatedAt: '',
        });
      }
    }
    return result;
  }, [allLogs, rangeFilter, activeTodayDate]);

  // Aggregated analytical statistics for the selected range
  const stats = useMemo(() => {
    const totalXp = filteredLogs.reduce((sum, l) => sum + l.totalXp, 0);
    const avgXp = Math.round(totalXp / Math.max(1, filteredLogs.length));
    const successfulDays = filteredLogs.filter((l) => l.totalXp >= 100).length;
    const totalSteps = filteredLogs.reduce((sum, l) => sum + (l.steps || 0), 0);
    const avgSteps = Math.round(totalSteps / Math.max(1, filteredLogs.length));
    const totalSleep = filteredLogs.reduce((sum, l) => sum + (l.sleepHours || 0), 0);
    const avgSleep = Number((totalSleep / Math.max(1, filteredLogs.length)).toFixed(1));
    const ratedFocusLogs = filteredLogs.filter((l) => l.focusRating > 0);
    const avgFocus = ratedFocusLogs.length > 0
      ? (ratedFocusLogs.reduce((sum, l) => sum + l.focusRating, 0) / ratedFocusLogs.length).toFixed(1)
      : '—';
    const gymSessions = filteredLogs.filter((l) => l.completedQuestIds.includes('hit_the_gym')).length;
    const sideQuestsCompleted = filteredLogs.reduce((sum, l) => sum + l.completedSideQuestIds.length, 0);

    return {
      totalXp,
      avgXp,
      successfulDays,
      totalSteps,
      avgSteps,
      avgSleep,
      avgFocus,
      gymSessions,
      sideQuestsCompleted,
    };
  }, [filteredLogs]);

  // Chart data formatting
  const chartData = useMemo(() => {
    return filteredLogs.map((log, index, arr) => {
      const d = parseDate(log.date);
      const label = `${d.getMonth() + 1}/${d.getDate()}`;

      // 7-day rolling average for XP
      const startIdx = Math.max(0, index - 6);
      const slice = arr.slice(startIdx, index + 1);
      const rollingAvg = Math.round(slice.reduce((acc, l) => acc + l.totalXp, 0) / slice.length);

      return {
        date: log.date,
        name: label,
        totalXp: log.totalXp,
        baseXp: log.baseXp,
        bonusXp: log.bonusXp,
        rollingAvg,
        steps: log.steps || 0,
        sleep: log.sleepHours || 0,
      };
    });
  }, [filteredLogs]);

  const weightChartData = useMemo(() => {
    return weightEntries.map((w) => {
      const d = parseDate(w.date);
      return {
        date: w.date,
        name: `${d.getMonth() + 1}/${d.getDate()}`,
        weight: w.weight,
        goal: 220,
      };
    });
  }, [weightEntries]);

  // Grade color mapping
  const gradeColors: Record<string, { bg: string; text: string }> = {
    S: { bg: 'bg-amber-100', text: 'text-amber-700' },
    A: { bg: 'bg-sky-100', text: 'text-sky-700' },
    B: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    C: { bg: 'bg-slate-100', text: 'text-slate-700' },
    D: { bg: 'bg-rose-100', text: 'text-rose-700' },
  };

  return (
    <div className="space-y-5 pb-28 animate-in fade-in duration-300">
      {/* Top Header */}
      <header className="flex items-center justify-between pt-2">
        <div>
          <span className="text-[11px] font-black tracking-widest uppercase text-sky-600 block">
            ANALYTICS & METRICS
          </span>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            YOUR PROGRESS
          </h1>
        </div>

        {/* Range Selector Pills */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          {(['7d', '30d', 'all'] as FilterRange[]).map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => setRangeFilter(range)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                rangeFilter === range
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : 'All Time'}
            </button>
          ))}
        </div>
      </header>

      {/* SECTION: WEEKLY REPORT CARD */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wider uppercase text-slate-400">
                Week {weeklyReport.weekNumber} Report
              </span>
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
              THIS WEEK
            </h3>
            <p className="text-xs text-slate-400">
              {weeklyReport.startDate} to {weeklyReport.endDate}
            </p>
          </div>

          <div className="flex flex-col items-end">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-2xl shadow-xs border border-slate-200/60 ${
                gradeColors[weeklyReport.grade]?.bg || 'bg-slate-100'
              } ${gradeColors[weeklyReport.grade]?.text || 'text-slate-800'}`}
            >
              {weeklyReport.grade}
            </div>
            <span className="text-[10px] font-black tracking-wider uppercase text-slate-500 mt-1">
              {weeklyReport.gradeTitle}
            </span>
          </div>
        </div>

        {/* Weekly Stats Grid */}
        <div className="grid grid-cols-3 gap-2 text-center my-3">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Avg XP</span>
            <span className="text-base font-black text-slate-900">{weeklyReport.avgXp}</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">100+ Days</span>
            <span className="text-base font-black text-slate-900">{weeklyReport.successfulDays}/7</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Gym</span>
            <span className="text-base font-black text-slate-900">{weeklyReport.gymSessions}</span>
          </div>
        </div>

        {/* Comparison vs Last Week */}
        {weeklyReport.comparisonVsLastWeek ? (
          <div className="mt-3 pt-3 border-t border-slate-100 text-xs font-semibold text-slate-600 flex flex-wrap items-center justify-between gap-2">
            <span className="text-slate-400 text-[11px] font-bold uppercase">VS LAST WEEK:</span>
            <span className={weeklyReport.comparisonVsLastWeek.xpDiffPercent >= 0 ? 'text-emerald-600 font-bold' : 'text-slate-500'}>
              {weeklyReport.comparisonVsLastWeek.xpDiffPercent >= 0 ? '+' : ''}{weeklyReport.comparisonVsLastWeek.xpDiffPercent}% XP
            </span>
            <span className="text-slate-600">
              {weeklyReport.comparisonVsLastWeek.successfulDaysDiff >= 0 ? '+' : ''}{weeklyReport.comparisonVsLastWeek.successfulDaysDiff} successful days
            </span>
            <span className="text-slate-600">
              {weeklyReport.comparisonVsLastWeek.avgStepsDiff >= 0 ? '+' : ''}{weeklyReport.comparisonVsLastWeek.avgStepsDiff} steps
            </span>
          </div>
        ) : (
          <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-400 text-center">
            Complete your first full week to see week-over-week comparisons!
          </div>
        )}
      </div>

      {/* SECTION: WEIGHT TRACKING SNAPSHOT */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                WEIGHT JOURNEY
              </h3>
              <span className="text-xs text-slate-400">Baseline Sep 3, 2026</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenWeightModal}
            className="h-9 px-3 rounded-xl bg-sky-500 hover:bg-sky-600 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Add Weigh-In</span>
          </button>
        </div>

        {/* 5-part exact requested display: 242.2 START | ↓ 6.8 LB | 235.4 CURRENT | 15.4 LB TO GO | 220 GOAL */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 flex items-center justify-between text-center gap-1">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Start</span>
            <span className="text-sm font-black text-slate-900">{weightStats.startingWeight}</span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-sky-600 uppercase">Lost</span>
            <span className="text-xs font-black text-sky-600 flex items-center">
              ↓ {weightStats.weightLost} lb
            </span>
          </div>

          <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-xs">
            <span className="text-[10px] font-black text-sky-600 uppercase block">Current</span>
            <span className="text-lg font-black text-slate-900">{weightStats.currentWeight}</span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase">To Go</span>
            <span className="text-xs font-black text-slate-700">
              {weightStats.weightRemaining} lb
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Goal</span>
            <span className="text-sm font-black text-slate-900">220.0</span>
          </div>
        </div>

        {/* Progress toward 220 lb */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-semibold text-slate-500">
            <span>Progress to Goal</span>
            <span>{weightStats.percentToGoal}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-sky-500 rounded-full transition-all duration-500"
              style={{ width: `${weightStats.percentToGoal}%` }}
            />
          </div>
        </div>
      </div>

      {/* SECTION: SUMMARY STAT CARDS (Grid of metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Total XP</span>
          <span className="text-xl font-black text-slate-900">{stats.totalXp.toLocaleString()}</span>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Daily Avg XP</span>
          <span className="text-xl font-black text-slate-900">{stats.avgXp}</span>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">100+ XP Days</span>
          <span className="text-xl font-black text-slate-900">{stats.successfulDays}</span>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Gym Sessions</span>
          <span className="text-xl font-black text-slate-900">{stats.gymSessions}</span>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Avg Steps</span>
          <span className="text-xl font-black text-slate-900">{stats.avgSteps.toLocaleString()}</span>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Avg Sleep</span>
          <span className="text-xl font-black text-slate-900">{stats.avgSleep}h</span>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Avg Focus</span>
          <span className="text-xl font-black text-slate-900">{stats.avgFocus}</span>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Side Quests</span>
          <span className="text-xl font-black text-slate-900">{stats.sideQuestsCompleted}</span>
        </div>
      </div>

      {/* SECTION: INTERACTIVE CHARTS */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900 tracking-tight">
            VISUAL CHARTS
          </h3>

          {/* Chart Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {(['xp', 'weight', 'steps', 'sleep'] as ChartTab[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveChartTab(tab)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase transition-all ${
                  activeChartTab === tab
                    ? 'bg-white text-sky-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Chart Rendering */}
        <div className="h-64 w-full pt-2">
          {activeChartTab === 'xp' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} domain={[0, 'auto']} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                  formatter={(val: number) => [`${val} XP`, 'Daily XP']}
                />
                <ReferenceLine y={100} stroke="#38BDF8" strokeDasharray="3 3" label={{ value: '100 Goal', fill: '#0284C7', fontSize: 10, position: 'top' }} />
                <Bar dataKey="totalXp" fill="#38BDF8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}

          {activeChartTab === 'weight' && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                  formatter={(val: number) => [`${val} lb`, 'Weight']}
                />
                <ReferenceLine y={220} stroke="#10B981" strokeDasharray="3 3" label={{ value: '220 Goal', fill: '#10B981', fontSize: 10, position: 'bottom' }} />
                <Line type="monotone" dataKey="weight" stroke="#0284C7" strokeWidth={3} dot={{ r: 4, fill: '#0284C7' }} />
              </LineChart>
            </ResponsiveContainer>
          )}

          {activeChartTab === 'steps' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                  formatter={(val: number) => [`${val.toLocaleString()}`, 'Steps']}
                />
                <ReferenceLine y={10000} stroke="#14B8A6" strokeDasharray="3 3" label={{ value: '10k Goal', fill: '#0D9488', fontSize: 10, position: 'top' }} />
                <Bar dataKey="steps" fill="#2DD4BF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}

          {activeChartTab === 'sleep' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} domain={[0, 12]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                  formatter={(val: number) => [`${val} hrs`, 'Sleep']}
                />
                <ReferenceLine y={8.0} stroke="#6366F1" strokeDasharray="3 3" label={{ value: '8h Target', fill: '#4F46E5', fontSize: 10, position: 'top' }} />
                <Bar dataKey="sleep" fill="#818CF8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* SECTION 17: HISTORICAL INSPECTION */}
      <section className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900 tracking-tight">
              HISTORICAL DAYS
            </h3>
            <p className="text-xs text-slate-400">
              Tap any date to inspect details or edit past logs
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto no-scrollbar">
          {allLogs.length === 0 ? (
            <div className="py-6 text-center text-xs font-semibold text-slate-400">
              No historical days logged yet. As you complete days, they will appear here permanently.
            </div>
          ) : (
            [...allLogs]
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((log) => {
                const dateObj = parseDate(log.date);
                const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                const isConquered = log.totalXp >= 100;
                const isLockedIn = log.totalXp >= 120;

                return (
                  <div
                    key={log.date}
                    onClick={() => onSelectHistoricalDate(log.date)}
                    className="py-3 px-1 flex items-center justify-between hover:bg-slate-50 rounded-xl cursor-pointer transition-all"
                  >
                    <div>
                      <span className="text-sm font-bold text-slate-900 block">
                        {dayName}
                      </span>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span>{log.completedQuestIds.length} routine</span>
                        <span>•</span>
                        <span>{log.steps ? `${log.steps.toLocaleString()} steps` : '0 steps'}</span>
                        <span>•</span>
                        <span>{log.sleepHours ? `${log.sleepHours}h sleep` : '0h sleep'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="text-right">
                        <span className="text-sm font-black text-slate-900 block">
                          {log.totalXp} XP
                        </span>
                        <span className={`text-[10px] font-bold uppercase ${
                          isLockedIn ? 'text-sky-600' : isConquered ? 'text-emerald-600' : 'text-slate-400'
                        }`}>
                          {log.dailyRank}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </section>

      {/* SECTION: RECORDED WEIGHT HISTORY LOG */}
      <section className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900 tracking-tight">
            WEIGH-IN LOG
          </h3>
          <button
            type="button"
            onClick={onOpenWeightModal}
            className="text-xs font-bold text-sky-600 hover:text-sky-700"
          >
            + New Weigh-in
          </button>
        </div>

        <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto no-scrollbar">
          {[...weightEntries]
            .sort((a, b) => b.date.localeCompare(a.date))
            .map((entry) => (
              <div key={entry.id} className="py-2.5 px-1 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800 block">{entry.date}</span>
                  {entry.note && <span className="text-[11px] text-slate-400">{entry.note}</span>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-black text-slate-900 text-sm">{entry.weight} lb</span>
                  {entry.id !== 'baseline-weight' && (
                    <button
                      type="button"
                      onClick={() => deleteWeightEntry(entry.id)}
                      className="text-slate-300 hover:text-red-500 text-[11px]"
                      title="Delete entry"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>
      </section>
    </div>
  );
};
