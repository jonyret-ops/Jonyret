import { DAILY_QUESTS, FOCUS_XP_MAP, LEVELS, SIDE_QUESTS } from '../constants';
import { Achievement, DailyLog, DailyRank, LevelDefinition, StreakStats, UserProfile, WeightEntry, WeightStats, WeeklyReport } from '../types';

/**
 * Calculates step XP based on exact requirements:
 * < 4,000 = 0 XP
 * 4,000–5,999 = 2 XP
 * 6,000–7,499 = 4 XP
 * 7,500–8,999 = 6 XP
 * 9,000–9,999 = 8 XP
 * 10,000+ = 10 XP
 */
export function calculateStepXp(steps: number): number {
  if (steps >= 10000) return 10;
  if (steps >= 9000) return 8;
  if (steps >= 7500) return 6;
  if (steps >= 6000) return 4;
  if (steps >= 4000) return 2;
  return 0;
}

/**
 * Calculates sleep XP based on exact requirements:
 * < 5.0 = 0 XP
 * 5.0–5.9 = 2 XP
 * 6.0–6.9 = 4 XP
 * 7.0–7.9 = 7 XP
 * 8.0+ = 10 XP
 */
export function calculateSleepXp(hours: number): number {
  if (hours >= 8.0) return 10;
  if (hours >= 7.0) return 7;
  if (hours >= 6.0) return 4;
  if (hours >= 5.0) return 2;
  return 0;
}

/**
 * Calculates focus XP from 1-5 rating:
 * 1 = 0 XP
 * 2 = 2 XP
 * 3 = 4 XP
 * 4 = 6 XP
 * 5 = 8 XP
 */
export function calculateFocusXp(rating: number): number {
  return FOCUS_XP_MAP[rating]?.xp ?? 0;
}

/**
 * Derives daily rank:
 * 0–49: ROUGH DAY
 * 50–74: KEPT MOVING
 * 75–99: STRONG DAY
 * 100–119: DAY CONQUERED
 * 120+: LOCKED IN
 */
export function calculateDailyRank(totalXp: number): DailyRank {
  if (totalXp >= 120) return 'LOCKED IN';
  if (totalXp >= 100) return 'DAY CONQUERED';
  if (totalXp >= 75) return 'STRONG DAY';
  if (totalXp >= 50) return 'KEPT MOVING';
  return 'ROUGH DAY';
}

/**
 * Derives exact Base XP, Bonus XP, and Total XP strictly from state.
 * Prevents any duplicate XP generation from multiple clicks.
 */
export function calculateDailyXp(log: Partial<DailyLog>): {
  baseXp: number;
  bonusXp: number;
  totalXp: number;
  dailyRank: DailyRank;
} {
  let baseXp = 0;

  // 1. Boolean Daily Quests
  const completedIds = new Set(log.completedQuestIds || []);
  for (const quest of DAILY_QUESTS) {
    if (quest.type === 'boolean' && completedIds.has(quest.id)) {
      baseXp += quest.baseXp; // Note: Energy Drink has baseXp = 0
    }
  }

  // 2. Daily Focus (1-5)
  if (log.focusRating) {
    baseXp += calculateFocusXp(log.focusRating);
  }

  // 3. Steps
  if (log.steps) {
    baseXp += calculateStepXp(log.steps);
  }

  // 4. Sleep
  if (log.sleepHours) {
    baseXp += calculateSleepXp(log.sleepHours);
  }

  // 5. Side Quests (Bonus XP only)
  let bonusXp = 0;
  const sideIds = new Set(log.completedSideQuestIds || []);
  for (const side of SIDE_QUESTS) {
    if (sideIds.has(side.id)) {
      bonusXp += side.xp;
    }
  }

  const totalXp = baseXp + bonusXp;
  const dailyRank = calculateDailyRank(totalXp);

  return { baseXp, bonusXp, totalXp, dailyRank };
}

/**
 * Calculates current level, title, progress toward next level.
 */
export function calculateLevel(totalCumulativeXp: number): {
  currentLevel: number;
  currentTitle: string;
  currentLevelXpRequired: number;
  nextLevelXpRequired: number;
  xpInCurrentLevel: number;
  xpNeededForNextLevel: number;
  progressPercent: number;
  isMaxLevel: boolean;
} {
  let currentLevelObj = LEVELS[0];
  let nextLevelObj: LevelDefinition | null = LEVELS[1] ?? null;

  for (let i = 0; i < LEVELS.length; i++) {
    if (totalCumulativeXp >= LEVELS[i].xpRequired) {
      currentLevelObj = LEVELS[i];
      nextLevelObj = LEVELS[i + 1] ?? null;
    } else {
      break;
    }
  }

  if (!nextLevelObj) {
    // Reached max level
    return {
      currentLevel: currentLevelObj.level,
      currentTitle: currentLevelObj.title,
      currentLevelXpRequired: currentLevelObj.xpRequired,
      nextLevelXpRequired: currentLevelObj.xpRequired,
      xpInCurrentLevel: totalCumulativeXp - currentLevelObj.xpRequired,
      xpNeededForNextLevel: 0,
      progressPercent: 100,
      isMaxLevel: true,
    };
  }

  const xpBracket = nextLevelObj.xpRequired - currentLevelObj.xpRequired;
  const xpGainedInBracket = Math.max(0, totalCumulativeXp - currentLevelObj.xpRequired);
  const xpNeeded = Math.max(0, nextLevelObj.xpRequired - totalCumulativeXp);
  const progressPercent = Math.min(100, Math.round((xpGainedInBracket / xpBracket) * 100));

  return {
    currentLevel: currentLevelObj.level,
    currentTitle: currentLevelObj.title,
    currentLevelXpRequired: currentLevelObj.xpRequired,
    nextLevelXpRequired: nextLevelObj.xpRequired,
    xpInCurrentLevel: xpGainedInBracket,
    xpNeededForNextLevel: xpNeeded,
    progressPercent,
    isMaxLevel: false,
  };
}

/**
 * Date helper utilities (YYYY-MM-DD)
 */
export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(dateStr: string, days: number): string {
  const d = parseDate(dateStr);
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

export function getDaysDifference(fromStr: string, toStr: string): number {
  const from = parseDate(fromStr).getTime();
  const to = parseDate(toStr).getTime();
  return Math.round((to - from) / (1000 * 60 * 60 * 24));
}

/**
 * Calculates streaks and successful day counts.
 * Rule: 
 * - Successful day is total daily XP >= 100
 * - Current day does NOT break streak while in progress
 * - Future dates never break streaks
 */
export function calculateStreaks(allLogs: DailyLog[], todayDateStr: string): StreakStats {
  const mapByDate = new Map<string, DailyLog>();
  for (const log of allLogs) {
    mapByDate.set(log.date, log);
  }

  let totalSuccessfulDays = 0;
  let totalLockedInDays = 0;

  for (const log of allLogs) {
    if (log.totalXp >= 100) {
      totalSuccessfulDays++;
    }
    if (log.totalXp >= 120) {
      totalLockedInDays++;
    }
  }

  // Calculate current streak
  let currentStreak = 0;
  const todayLog = mapByDate.get(todayDateStr);
  const todayIsSuccess = todayLog && todayLog.totalXp >= 100;

  if (todayIsSuccess) {
    currentStreak = 1;
    let checkDate = addDays(todayDateStr, -1);
    while (true) {
      const pastLog = mapByDate.get(checkDate);
      if (pastLog && pastLog.totalXp >= 100) {
        currentStreak++;
        checkDate = addDays(checkDate, -1);
      } else {
        break;
      }
    }
  } else {
    // Today is in progress and not yet 100 XP -> check backward from yesterday
    let checkDate = addDays(todayDateStr, -1);
    while (true) {
      const pastLog = mapByDate.get(checkDate);
      if (pastLog && pastLog.totalXp >= 100) {
        currentStreak++;
        checkDate = addDays(checkDate, -1);
      } else {
        break;
      }
    }
  }

  // Calculate longest streak across all recorded days in sorted chronological order
  const sortedLogs = [...allLogs].sort((a, b) => a.date.localeCompare(b.date));
  let longestStreak = 0;
  let runningStreak = 0;
  let prevSuccessDate: string | null = null;

  for (const log of sortedLogs) {
    if (log.totalXp >= 100) {
      if (prevSuccessDate && getDaysDifference(prevSuccessDate, log.date) === 1) {
        runningStreak++;
      } else {
        runningStreak = 1;
      }
      prevSuccessDate = log.date;
      if (runningStreak > longestStreak) {
        longestStreak = runningStreak;
      }
    } else {
      runningStreak = 0;
      prevSuccessDate = null;
    }
  }

  longestStreak = Math.max(longestStreak, currentStreak);

  return {
    currentStreak,
    longestStreak,
    totalSuccessfulDays,
    totalLockedInDays,
  };
}

/**
 * Calculates weight loss statistics.
 */
export function calculateWeightStats(
  weightEntries: WeightEntry[],
  startingWeight: number,
  goalWeight: number
): WeightStats {
  if (weightEntries.length === 0) {
    return {
      startingWeight,
      currentWeight: startingWeight,
      weightLost: 0,
      weightRemaining: Math.max(0, startingWeight - goalWeight),
      percentToGoal: 0,
      changeSinceLast: 0,
      latestWeighInDate: '',
    };
  }

  const sorted = [...weightEntries].sort((a, b) => a.date.localeCompare(b.date));
  const latest = sorted[sorted.length - 1];
  const currentWeight = latest.weight;
  const weightLost = Number((startingWeight - currentWeight).toFixed(1));
  const weightRemaining = Number((currentWeight - goalWeight).toFixed(1));
  const totalToLose = startingWeight - goalWeight;
  const percentToGoal = totalToLose > 0 
    ? Math.max(0, Math.min(100, Math.round((weightLost / totalToLose) * 100)))
    : 100;

  let changeSinceLast = 0;
  if (sorted.length > 1) {
    const prev = sorted[sorted.length - 2];
    changeSinceLast = Number((currentWeight - prev.weight).toFixed(1));
  }

  return {
    startingWeight,
    currentWeight,
    weightLost,
    weightRemaining,
    percentToGoal,
    changeSinceLast,
    latestWeighInDate: latest.date,
  };
}

/**
 * Evaluates achievements based on complete stored history.
 */
export function evaluateAchievements(
  allAchievements: Achievement[],
  allLogs: DailyLog[],
  weightEntries: WeightEntry[],
  streaks: StreakStats,
  currentLevel: number
): Achievement[] {
  const mapByDate = new Map<string, DailyLog>();
  allLogs.forEach(l => mapByDate.set(l.date, l));

  const totalSteps = allLogs.reduce((acc, l) => acc + (l.steps || 0), 0);
  const totalGymSessions = allLogs.filter(l => l.completedQuestIds.includes('hit_the_gym')).length;
  const minWeight = weightEntries.length > 0 
    ? Math.min(...weightEntries.map(w => w.weight))
    : 999;
  const screenTimeQuests = allLogs.filter(l => l.completedSideQuestIds.includes('screen_time_under_5h')).length;
  const studyQuests = allLogs.filter(l => l.completedSideQuestIds.includes('extra_study_reading')).length;
  const resetBaseQuests = allLogs.filter(l => l.completedSideQuestIds.includes('reset_the_base')).length;
  const creatineDays = allLogs.filter(l => l.completedQuestIds.includes('take_creatine')).length;
  const laserFocusCount = allLogs.filter(l => l.focusRating === 5).length;
  const deepSleepCount = allLogs.filter(l => (l.sleepHours || 0) >= 8.0).length;
  const hydrationDays = allLogs.filter(l => {
    return (
      l.completedQuestIds.includes('water_checkpoint_1') &&
      l.completedQuestIds.includes('water_checkpoint_2') &&
      l.completedQuestIds.includes('water_checkpoint_3') &&
      l.completedQuestIds.includes('water_checkpoint_4') &&
      l.completedQuestIds.includes('water_checkpoint_5')
    );
  }).length;

  // Check 7 consecutive days of both morning & evening prayer
  const sortedDates = Array.from(mapByDate.keys()).sort();
  let prayerConsecutive = 0;
  let maxPrayerConsecutive = 0;
  for (const d of sortedDates) {
    const l = mapByDate.get(d)!;
    if (l.completedQuestIds.includes('morning_prayer') && l.completedQuestIds.includes('evening_prayer')) {
      prayerConsecutive++;
      if (prayerConsecutive > maxPrayerConsecutive) {
        maxPrayerConsecutive = prayerConsecutive;
      }
    } else {
      prayerConsecutive = 0;
    }
  }

  return allAchievements.map(ach => {
    let unlocked = false;

    switch (ach.id) {
      case 'first_blood':
        unlocked = allLogs.some(l => l.totalXp > 0 || l.completedQuestIds.length > 0);
        break;
      case 'were_balling':
        unlocked = allLogs.some(l => l.totalXp >= 100);
        break;
      case 'locked_in_day':
        unlocked = allLogs.some(l => l.totalXp >= 120);
        break;
      case 'hat_trick':
        unlocked = streaks.longestStreak >= 3 || streaks.currentStreak >= 3;
        break;
      case 'seven_days_strong':
        unlocked = streaks.longestStreak >= 7 || streaks.currentStreak >= 7;
        break;
      case 'unstoppable':
        unlocked = streaks.longestStreak >= 14 || streaks.currentStreak >= 14;
        break;
      case 'touch_grass':
        unlocked = screenTimeQuests >= 1;
        break;
      case '10k_club':
        unlocked = allLogs.some(l => (l.steps || 0) >= 10000);
        break;
      case 'walker':
        unlocked = totalSteps >= 100000;
        break;
      case 'gym_rat':
        unlocked = totalGymSessions >= 20;
        break;
      case 'prayer_warrior':
        unlocked = maxPrayerConsecutive >= 7;
        break;
      case 'book_of_life':
        unlocked = studyQuests >= 10;
        break;
      case 'down_five':
        unlocked = minWeight <= 237.2;
        break;
      case 'down_ten':
        unlocked = minWeight <= 232.2;
        break;
      case 'goal_crusher':
        unlocked = minWeight <= 220.0;
        break;
      case 'hydration_master':
        unlocked = hydrationDays >= 1;
        break;
      case 'deep_sleep':
        unlocked = deepSleepCount >= 5;
        break;
      case 'centurion':
        unlocked = currentLevel >= 5;
        break;
      case 'overdrive_king':
        unlocked = streaks.totalLockedInDays >= 5;
        break;
      case 'clean_slate':
        unlocked = resetBaseQuests >= 5;
        break;
      case 'laser_focus':
        unlocked = laserFocusCount >= 7;
        break;
      case 'creatine_machine':
        unlocked = creatineDays >= 14;
        break;
      default:
        unlocked = !!ach.unlockedAt;
        break;
    }

    if (unlocked && !ach.unlockedAt) {
      return { ...ach, unlockedAt: new Date().toISOString() };
    }
    return ach;
  });
}

/**
 * Calculates a weekly performance report for a specific 7-day period.
 */
export function calculateWeeklyReport(
  allLogs: DailyLog[],
  weightEntries: WeightEntry[],
  currentDateStr: string
): WeeklyReport {
  // Determine 7-day window ending on currentDateStr
  const currentD = parseDate(currentDateStr);
  const weekLogs: DailyLog[] = [];
  
  for (let i = 6; i >= 0; i--) {
    const dStr = addDays(currentDateStr, -i);
    const found = allLogs.find(l => l.date === dStr);
    if (found) {
      weekLogs.push(found);
    } else {
      weekLogs.push({
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

  const totalXp = weekLogs.reduce((sum, l) => sum + l.totalXp, 0);
  const avgXp = Math.round(totalXp / 7);
  const successfulDays = weekLogs.filter(l => l.totalXp >= 100).length;
  const gymSessions = weekLogs.filter(l => l.completedQuestIds.includes('hit_the_gym')).length;
  const totalSteps = weekLogs.reduce((sum, l) => sum + (l.steps || 0), 0);
  const avgSteps = Math.round(totalSteps / 7);
  const totalSleep = weekLogs.reduce((sum, l) => sum + (l.sleepHours || 0), 0);
  const avgSleep = Number((totalSleep / 7).toFixed(1));
  const sideQuestsCount = weekLogs.reduce((sum, l) => sum + l.completedSideQuestIds.length, 0);

  // Grade determination based on average XP and successful days
  let grade: 'S' | 'A' | 'B' | 'C' | 'D' = 'C';
  let gradeTitle = 'SURVIVED';

  if (avgXp >= 110 && successfulDays >= 6) {
    grade = 'S';
    gradeTitle = 'LEGENDARY';
  } else if (avgXp >= 95 && successfulDays >= 5) {
    grade = 'A';
    gradeTitle = 'LOCKED IN';
  } else if (avgXp >= 75 && successfulDays >= 4) {
    grade = 'B';
    gradeTitle = 'STRONG WEEK';
  } else if (avgXp >= 50 && successfulDays >= 2) {
    grade = 'C';
    gradeTitle = 'SURVIVED';
  } else {
    grade = 'D';
    gradeTitle = 'FELL OFF';
  }

  // Previous week comparison (7 days before that)
  const prevWeekLogs: DailyLog[] = [];
  for (let i = 13; i >= 7; i--) {
    const dStr = addDays(currentDateStr, -i);
    const found = allLogs.find(l => l.date === dStr);
    if (found) prevWeekLogs.push(found);
  }

  let comparisonVsLastWeek = undefined;
  if (prevWeekLogs.length > 0) {
    const prevTotalXp = prevWeekLogs.reduce((sum, l) => sum + l.totalXp, 0);
    const prevSuccessfulDays = prevWeekLogs.filter(l => l.totalXp >= 100).length;
    const prevAvgSteps = Math.round(prevWeekLogs.reduce((sum, l) => sum + (l.steps || 0), 0) / 7);
    const prevAvgSleep = Number((prevWeekLogs.reduce((sum, l) => sum + (l.sleepHours || 0), 0) / 7).toFixed(1));

    const xpDiffPercent = prevTotalXp > 0 ? Math.round(((totalXp - prevTotalXp) / prevTotalXp) * 100) : 0;
    const successfulDaysDiff = successfulDays - prevSuccessfulDays;
    const avgStepsDiff = avgSteps - prevAvgSteps;
    const avgSleepDiff = Number((avgSleep - prevAvgSleep).toFixed(1));

    comparisonVsLastWeek = {
      xpDiffPercent,
      successfulDaysDiff,
      avgStepsDiff,
      avgSleepDiff,
    };
  }

  return {
    weekNumber: Math.max(1, Math.ceil(getDaysDifference('2026-09-06', currentDateStr) / 7)),
    startDate: addDays(currentDateStr, -6),
    endDate: currentDateStr,
    grade,
    gradeTitle,
    totalXp,
    avgXp,
    successfulDays,
    totalDays: 7,
    gymSessions,
    avgSteps,
    avgSleep,
    sideQuestsCount,
    comparisonVsLastWeek,
  };
}

/**
 * Dynamic greeting and personality copy
 */
export function getGreetingMessage(dayNumber: number, todayXp: number, currentStreak: number): string {
  if (todayXp >= 120) {
    return 'Locked in.';
  }
  if (todayXp >= 100) {
    return 'Day conquered.';
  }
  if (todayXp >= 75) {
    return "You're close.";
  }
  if (currentStreak >= 3 && todayXp === 0) {
    return `${currentStreak} days strong. Keep the fire burning.`;
  }
  if (todayXp < 50) {
    return `Day ${Math.max(1, dayNumber)}. Let's get after it.`;
  }
  return 'Still plenty of XP on the board.';
}
