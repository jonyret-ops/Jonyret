export type QuestType = 'boolean' | 'numeric' | 'focus';

export interface QuestDefinition {
  id: string;
  order: number;
  title: string;
  type: QuestType;
  baseXp: number;
  description?: string;
  iconName?: string;
  category: 'routine' | 'nutrition' | 'fitness' | 'mindset' | 'hygiene' | 'recovery';
}

export interface SideQuestDefinition {
  id: string;
  order: number;
  title: string;
  xp: number;
  description: string;
  iconName?: string;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  completedQuestIds: string[];
  completedSideQuestIds: string[];
  steps: number; // actual step count
  sleepHours: number; // actual hours
  focusRating: number; // 0 (unselected) or 1..5
  energyDrinkConsumed: boolean; // tracked, awards 0 XP
  baseXp: number;
  bonusXp: number;
  totalXp: number;
  dailyRank: DailyRank;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type DailyRank = 
  | 'ROUGH DAY'
  | 'KEPT MOVING'
  | 'STRONG DAY'
  | 'DAY CONQUERED'
  | 'LOCKED IN';

export interface WeightEntry {
  id: string;
  date: string; // YYYY-MM-DD
  weight: number; // in lbs
  note?: string;
  createdAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'streak' | 'xp' | 'fitness' | 'discipline' | 'weight' | 'habit';
  icon: string;
  unlockedAt?: string | null;
}

export interface LevelDefinition {
  level: number;
  title: string;
  xpRequired: number; // Cumulative total XP required to reach this level
}

export interface UserProfile {
  name: string;
  hasStartedArc: boolean;
  startDate: string; // 2026-09-06
  goalDate: string; // 2026-12-01
  startingWeight: number; // 242.2
  goalWeight: number; // 220.0
  baselineDate: string; // 2026-09-03
  dailyXpGoal: number; // 100
  dailyStepGoal: number; // 10000
  soundEffects: boolean;
  hapticFeedback: boolean;
}

export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  totalSuccessfulDays: number;
  totalLockedInDays: number;
}

export interface WeightStats {
  startingWeight: number;
  currentWeight: number;
  weightLost: number;
  weightRemaining: number;
  percentToGoal: number;
  changeSinceLast: number;
  latestWeighInDate: string;
}

export interface WeeklyReport {
  weekNumber: number;
  startDate: string;
  endDate: string;
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
  gradeTitle: string;
  totalXp: number;
  avgXp: number;
  successfulDays: number;
  totalDays: number;
  gymSessions: number;
  avgSteps: number;
  avgSleep: number;
  sideQuestsCount: number;
  weightChange?: number;
  comparisonVsLastWeek?: {
    xpDiffPercent: number;
    successfulDaysDiff: number;
    avgStepsDiff: number;
    avgSleepDiff: number;
  };
}
