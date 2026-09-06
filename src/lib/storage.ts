import { DEFAULT_PROFILE, INITIAL_ACHIEVEMENTS, INITIAL_WEIGHT_ENTRY } from '../constants';
import { Achievement, DailyLog, UserProfile, WeightEntry } from '../types';

export interface StorageRepository {
  getProfile(): Promise<UserProfile>;
  saveProfile(profile: UserProfile): Promise<void>;
  
  getDailyLog(date: string): Promise<DailyLog | null>;
  getAllDailyLogs(): Promise<DailyLog[]>;
  saveDailyLog(log: DailyLog): Promise<void>;
  
  getWeightEntries(): Promise<WeightEntry[]>;
  saveWeightEntry(entry: WeightEntry): Promise<void>;
  deleteWeightEntry(id: string): Promise<void>;
  
  getAchievements(): Promise<Achievement[]>;
  saveAchievements(achievements: Achievement[]): Promise<void>;

  clearAllData(): Promise<void>;
  exportData(): Promise<string>;
  importData(jsonData: string): Promise<boolean>;
}

const STORAGE_KEYS = {
  PROFILE: 'winter_arc_profile',
  DAILY_LOGS: 'winter_arc_daily_logs',
  WEIGHT_ENTRIES: 'winter_arc_weight_entries',
  ACHIEVEMENTS: 'winter_arc_achievements',
};

export class LocalStorageRepository implements StorageRepository {
  async getProfile(): Promise<UserProfile> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (!data) {
        return DEFAULT_PROFILE;
      }
      return { ...DEFAULT_PROFILE, ...JSON.parse(data) };
    } catch {
      return DEFAULT_PROFILE;
    }
  }

  async saveProfile(profile: UserProfile): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  }

  async getDailyLog(date: string): Promise<DailyLog | null> {
    const logs = await this.getAllDailyLogs();
    return logs.find(l => l.date === date) || null;
  }

  async getAllDailyLogs(): Promise<DailyLog[]> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DAILY_LOGS);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  async saveDailyLog(log: DailyLog): Promise<void> {
    const logs = await this.getAllDailyLogs();
    const index = logs.findIndex(l => l.date === log.date);
    if (index >= 0) {
      logs[index] = log;
    } else {
      logs.push(log);
    }
    localStorage.setItem(STORAGE_KEYS.DAILY_LOGS, JSON.stringify(logs));
  }

  async getWeightEntries(): Promise<WeightEntry[]> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WEIGHT_ENTRIES);
      if (!data) {
        return [INITIAL_WEIGHT_ENTRY];
      }
      const parsed = JSON.parse(data);
      if (parsed.length === 0) {
        return [INITIAL_WEIGHT_ENTRY];
      }
      return parsed;
    } catch {
      return [INITIAL_WEIGHT_ENTRY];
    }
  }

  async saveWeightEntry(entry: WeightEntry): Promise<void> {
    const entries = await this.getWeightEntries();
    const index = entries.findIndex(e => e.id === entry.id || e.date === entry.date);
    if (index >= 0) {
      entries[index] = entry;
    } else {
      entries.push(entry);
    }
    // Sort chronologically
    entries.sort((a, b) => a.date.localeCompare(b.date));
    localStorage.setItem(STORAGE_KEYS.WEIGHT_ENTRIES, JSON.stringify(entries));
  }

  async deleteWeightEntry(id: string): Promise<void> {
    const entries = await this.getWeightEntries();
    const filtered = entries.filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.WEIGHT_ENTRIES, JSON.stringify(filtered));
  }

  async getAchievements(): Promise<Achievement[]> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      if (!data) {
        return INITIAL_ACHIEVEMENTS;
      }
      const parsed: Achievement[] = JSON.parse(data);
      // Merge with INITIAL_ACHIEVEMENTS to pick up any newly defined ones
      return INITIAL_ACHIEVEMENTS.map(initial => {
        const found = parsed.find(p => p.id === initial.id);
        return found ? { ...initial, unlockedAt: found.unlockedAt } : initial;
      });
    } catch {
      return INITIAL_ACHIEVEMENTS;
    }
  }

  async saveAchievements(achievements: Achievement[]): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
  }

  async clearAllData(): Promise<void> {
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    localStorage.removeItem(STORAGE_KEYS.DAILY_LOGS);
    localStorage.removeItem(STORAGE_KEYS.WEIGHT_ENTRIES);
    localStorage.removeItem(STORAGE_KEYS.ACHIEVEMENTS);
  }

  async exportData(): Promise<string> {
    const profile = await this.getProfile();
    const dailyLogs = await this.getAllDailyLogs();
    const weightEntries = await this.getWeightEntries();
    const achievements = await this.getAchievements();

    return JSON.stringify({
      version: 1,
      exportedAt: new Date().toISOString(),
      profile,
      dailyLogs,
      weightEntries,
      achievements,
    }, null, 2);
  }

  async importData(jsonData: string): Promise<boolean> {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.profile) await this.saveProfile(parsed.profile);
      if (parsed.dailyLogs) localStorage.setItem(STORAGE_KEYS.DAILY_LOGS, JSON.stringify(parsed.dailyLogs));
      if (parsed.weightEntries) localStorage.setItem(STORAGE_KEYS.WEIGHT_ENTRIES, JSON.stringify(parsed.weightEntries));
      if (parsed.achievements) await this.saveAchievements(parsed.achievements);
      return true;
    } catch {
      return false;
    }
  }
}

export const repository: StorageRepository = new LocalStorageRepository();
