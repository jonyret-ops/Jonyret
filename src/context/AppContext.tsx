import confetti from 'canvas-confetti';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_PROFILE,
  OFFICIAL_GOAL_DATE,
  OFFICIAL_START_DATE,
  TOTAL_ARC_DAYS
} from '../constants';
import {
  calculateDailyXp,
  calculateLevel,
  calculateStreaks,
  calculateWeightStats,
  evaluateAchievements,
  formatDate,
  getDaysDifference
} from '../lib/calculations';
import { soundEngine } from '../lib/sound';
import { repository } from '../lib/storage';
import {
  Achievement,
  DailyLog,
  StreakStats,
  UserProfile,
  WeightEntry,
  WeightStats,
} from '../types';

interface LevelUpInfo {
  oldLevel: number;
  newLevel: number;
  title: string;
}

interface AppContextType {
  profile: UserProfile;
  activeTodayDate: string;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  currentLog: DailyLog;
  allLogs: DailyLog[];
  weightEntries: WeightEntry[];
  achievements: Achievement[];
  
  // Progress calculations
  dayNumber: number;
  daysSinceStart: number;
  daysRemaining: number;
  todayXp: number;
  selectedDateXp: number;
  totalCumulativeXp: number;
  levelInfo: ReturnType<typeof calculateLevel>;
  streakStats: StreakStats;
  weightStats: WeightStats;

  // Actions
  toggleBooleanQuest: (questId: string) => Promise<void>;
  setDailyFocus: (rating: number) => Promise<void>;
  setSteps: (steps: number) => Promise<void>;
  setSleep: (hours: number) => Promise<void>;
  toggleEnergyDrink: () => Promise<void>;
  toggleSideQuest: (sideQuestId: string) => Promise<void>;
  addWeightEntry: (weight: number, date: string, note?: string) => Promise<void>;
  deleteWeightEntry: (id: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  startArc: () => Promise<void>;
  resetAllData: () => Promise<void>;
  exportData: () => Promise<string>;
  importData: (json: string) => Promise<boolean>;

  // Celebrations & Modals
  levelUpModalData: LevelUpInfo | null;
  dismissLevelUpModal: () => void;
  recentAchievement: Achievement | null;
  dismissAchievement: () => void;
  isDateFuture: (dateStr: string) => boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [allLogs, setAllLogs] = useState<DailyLog[]>([]);
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  // Calculate active today date. If current device date is before 2026-09-06, default to 2026-09-06 (Day 1)
  const realDeviceDate = formatDate(new Date());
  const activeTodayDate = realDeviceDate < OFFICIAL_START_DATE ? OFFICIAL_START_DATE : realDeviceDate;

  const [selectedDate, setSelectedDate] = useState<string>(activeTodayDate);
  const [levelUpModalData, setLevelUpModalData] = useState<LevelUpInfo | null>(null);
  const [recentAchievement, setRecentAchievement] = useState<Achievement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load persistent data from repository on mount
  useEffect(() => {
    async function loadData() {
      const storedProfile = await repository.getProfile();
      const storedLogs = await repository.getAllDailyLogs();
      const storedWeights = await repository.getWeightEntries();
      const storedAchievements = await repository.getAchievements();

      setProfile(storedProfile);
      setAllLogs(storedLogs);
      setWeightEntries(storedWeights);
      setAchievements(storedAchievements);
      setIsLoaded(true);
    }
    loadData();
  }, []);

  // Helper to get or create log for a specific date
  const getLogForDate = (date: string, logsList: DailyLog[]): DailyLog => {
    const existing = logsList.find(l => l.date === date);
    if (existing) {
      // Re-derive XP to maintain strict mathematical integrity
      const derived = calculateDailyXp(existing);
      return {
        ...existing,
        baseXp: derived.baseXp,
        bonusXp: derived.bonusXp,
        totalXp: derived.totalXp,
        dailyRank: derived.dailyRank,
      };
    }
    return {
      date,
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  };

  const currentLog = useMemo(() => {
    return getLogForDate(selectedDate, allLogs);
  }, [selectedDate, allLogs]);

  const todayLog = useMemo(() => {
    return getLogForDate(activeTodayDate, allLogs);
  }, [activeTodayDate, allLogs]);

  const todayXp = todayLog.totalXp;
  const selectedDateXp = currentLog.totalXp;

  // Calculate cumulative XP across all logged days
  const totalCumulativeXp = useMemo(() => {
    // Map dates to ensure each date is counted once
    const map = new Map<string, DailyLog>();
    for (const log of allLogs) {
      map.set(log.date, log);
    }
    // Make sure current selectedDate is included
    map.set(currentLog.date, currentLog);

    let sum = 0;
    map.forEach(log => {
      sum += log.totalXp;
    });
    return sum;
  }, [allLogs, currentLog]);

  const levelInfo = useMemo(() => {
    return calculateLevel(totalCumulativeXp);
  }, [totalCumulativeXp]);

  const streakStats = useMemo(() => {
    // Combine saved logs with active current day state
    const map = new Map<string, DailyLog>();
    allLogs.forEach(l => map.set(l.date, l));
    map.set(currentLog.date, currentLog);
    return calculateStreaks(Array.from(map.values()), activeTodayDate);
  }, [allLogs, currentLog, activeTodayDate]);

  const weightStats = useMemo(() => {
    return calculateWeightStats(weightEntries, profile.startingWeight, profile.goalWeight);
  }, [weightEntries, profile.startingWeight, profile.goalWeight]);

  // Day counts
  const daysSinceStart = Math.max(0, getDaysDifference(OFFICIAL_START_DATE, activeTodayDate));
  const dayNumber = Math.max(1, daysSinceStart + 1);
  const daysRemaining = Math.max(0, getDaysDifference(activeTodayDate, OFFICIAL_GOAL_DATE));

  const isDateFuture = (dateStr: string): boolean => {
    return dateStr > activeTodayDate;
  };

  // Internal log updater that enforces derived XP, triggers level-up and achievements
  const saveAndSyncLog = async (updatedLogPartial: Partial<DailyLog>) => {
    if (isDateFuture(selectedDate)) {
      return; // Future dates cannot be completed
    }

    const previousLog = currentLog;
    const previousTotalXp = previousLog.totalXp;
    const previousLevel = levelInfo.currentLevel;

    const mergedLog: DailyLog = {
      ...previousLog,
      ...updatedLogPartial,
      updatedAt: new Date().toISOString(),
    };

    // Strict derived XP recalculation
    const derived = calculateDailyXp(mergedLog);
    mergedLog.baseXp = derived.baseXp;
    mergedLog.bonusXp = derived.bonusXp;
    mergedLog.totalXp = derived.totalXp;
    mergedLog.dailyRank = derived.dailyRank;

    // Update allLogs in state & storage
    const newLogs = [...allLogs];
    const index = newLogs.findIndex(l => l.date === mergedLog.date);
    if (index >= 0) {
      newLogs[index] = mergedLog;
    } else {
      newLogs.push(mergedLog);
    }
    setAllLogs(newLogs);
    await repository.saveDailyLog(mergedLog);

    // Sound and Celebration effects
    if (mergedLog.totalXp > previousTotalXp) {
      if (profile.soundEffects) {
        soundEngine.playCheck();
      }
    } else if (mergedLog.totalXp < previousTotalXp) {
      if (profile.soundEffects) {
        soundEngine.playUncheck();
      }
    }

    // Check if user crossed 100 XP threshold just now
    if (previousTotalXp < 100 && mergedLog.totalXp >= 100) {
      if (profile.soundEffects) {
        soundEngine.playDayConquered();
      }
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#38BDF8', '#0284C7', '#BAE6FD', '#60A5FA'],
        });
      } catch {}
    }

    // Recalculate total XP & check Level Up
    const newTotalCumulative = newLogs.reduce((acc, l) => acc + l.totalXp, 0);
    const newLevelInfo = calculateLevel(newTotalCumulative);
    if (newLevelInfo.currentLevel > previousLevel) {
      if (profile.soundEffects) {
        soundEngine.playLevelUp();
      }
      try {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#38BDF8', '#F59E0B', '#10B981', '#6366F1'],
        });
      } catch {}
      setLevelUpModalData({
        oldLevel: previousLevel,
        newLevel: newLevelInfo.currentLevel,
        title: newLevelInfo.currentTitle,
      });
    }

    // Check for newly unlocked achievements
    const streaks = calculateStreaks(newLogs, activeTodayDate);
    const updatedAchievements = evaluateAchievements(
      achievements,
      newLogs,
      weightEntries,
      streaks,
      newLevelInfo.currentLevel
    );

    const justUnlocked = updatedAchievements.find(
      a => a.unlockedAt && !achievements.find(old => old.id === a.id)?.unlockedAt
    );

    if (justUnlocked) {
      setRecentAchievement(justUnlocked);
      setAchievements(updatedAchievements);
      await repository.saveAchievements(updatedAchievements);
    }
  };

  const toggleBooleanQuest = async (questId: string) => {
    const currentCompleted = currentLog.completedQuestIds;
    const isCompleted = currentCompleted.includes(questId);
    const updatedQuestIds = isCompleted
      ? currentCompleted.filter(id => id !== questId)
      : [...currentCompleted, questId];

    await saveAndSyncLog({ completedQuestIds: updatedQuestIds });
  };

  const toggleEnergyDrink = async () => {
    // Tracked, awards 0 XP
    await saveAndSyncLog({ energyDrinkConsumed: !currentLog.energyDrinkConsumed });
  };

  const setDailyFocus = async (rating: number) => {
    // If clicked again, deselect (0) or set to rating
    const newRating = currentLog.focusRating === rating ? 0 : rating;
    await saveAndSyncLog({ focusRating: newRating });
  };

  const setSteps = async (steps: number) => {
    const validSteps = Math.max(0, Math.floor(isNaN(steps) ? 0 : steps));
    await saveAndSyncLog({ steps: validSteps });
  };

  const setSleep = async (hours: number) => {
    const validSleep = Math.max(0, Math.min(24, Number((isNaN(hours) ? 0 : hours).toFixed(1))));
    await saveAndSyncLog({ sleepHours: validSleep });
  };

  const toggleSideQuest = async (sideQuestId: string) => {
    const currentCompleted = currentLog.completedSideQuestIds;
    const isCompleted = currentCompleted.includes(sideQuestId);
    const updatedSideQuestIds = isCompleted
      ? currentCompleted.filter(id => id !== sideQuestId)
      : [...currentCompleted, sideQuestId];

    await saveAndSyncLog({ completedSideQuestIds: updatedSideQuestIds });
  };

  const addWeightEntry = async (weight: number, date: string, note?: string) => {
    const newEntry: WeightEntry = {
      id: 'weight-' + Date.now(),
      date,
      weight: Number(weight.toFixed(1)),
      note,
      createdAt: new Date().toISOString(),
    };
    await repository.saveWeightEntry(newEntry);
    const entries = await repository.getWeightEntries();
    setWeightEntries(entries);

    // Re-evaluate achievements (Down 5, Down 10, Goal Crusher)
    const updatedAchievements = evaluateAchievements(
      achievements,
      allLogs,
      entries,
      streakStats,
      levelInfo.currentLevel
    );
    const justUnlocked = updatedAchievements.find(
      a => a.unlockedAt && !achievements.find(old => old.id === a.id)?.unlockedAt
    );
    if (justUnlocked) {
      setRecentAchievement(justUnlocked);
      setAchievements(updatedAchievements);
      await repository.saveAchievements(updatedAchievements);
    }
  };

  const deleteWeightEntry = async (id: string) => {
    await repository.deleteWeightEntry(id);
    const entries = await repository.getWeightEntries();
    setWeightEntries(entries);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    const updated = { ...profile, ...updates };
    setProfile(updated);
    await repository.saveProfile(updated);
  };

  const startArc = async () => {
    await updateProfile({ hasStartedArc: true });
  };

  const resetAllData = async () => {
    await repository.clearAllData();
    const defaultP = await repository.getProfile();
    const defaultW = await repository.getWeightEntries();
    const defaultA = await repository.getAchievements();
    setProfile(defaultP);
    setAllLogs([]);
    setWeightEntries(defaultW);
    setAchievements(defaultA);
    setSelectedDate(activeTodayDate);
  };

  const exportData = async () => {
    return repository.exportData();
  };

  const importData = async (json: string) => {
    const success = await repository.importData(json);
    if (success) {
      const p = await repository.getProfile();
      const logs = await repository.getAllDailyLogs();
      const weights = await repository.getWeightEntries();
      const ach = await repository.getAchievements();
      setProfile(p);
      setAllLogs(logs);
      setWeightEntries(weights);
      setAchievements(ach);
    }
    return success;
  };

  const dismissLevelUpModal = () => {
    setLevelUpModalData(null);
  };

  const dismissAchievement = () => {
    setRecentAchievement(null);
  };

  return (
    <AppContext.Provider
      value={{
        profile,
        activeTodayDate,
        selectedDate,
        setSelectedDate,
        currentLog,
        allLogs,
        weightEntries,
        achievements,
        dayNumber,
        daysSinceStart,
        daysRemaining,
        todayXp,
        selectedDateXp,
        totalCumulativeXp,
        levelInfo,
        streakStats,
        weightStats,
        toggleBooleanQuest,
        setDailyFocus,
        setSteps,
        setSleep,
        toggleEnergyDrink,
        toggleSideQuest,
        addWeightEntry,
        deleteWeightEntry,
        updateProfile,
        startArc,
        resetAllData,
        exportData,
        importData,
        levelUpModalData,
        dismissLevelUpModal,
        recentAchievement,
        dismissAchievement,
        isDateFuture,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
