import storage from '../../utils/storage.js';
import { multiLevelCache } from '../performanceCache.js';
import { requestDeduplicator, rateLimiter, requestQueue } from '../requestQueue.js';

const STUDY_LOG_KEY = 'zoggin_study_logs';
const VOCAB_KEY = 'zoggin_vocab';

class OptimizedStatsService {
  constructor() {
    this.todayCache = null;
    this.todayCacheTime = 0;
    this.cacheExpiry = 5000;
  }

  getToday() {
    const now = Date.now();
    if (this.todayCache && (now - this.todayCacheTime) < this.cacheExpiry) {
      return this.todayCache;
    }
    this.todayCache = new Date().toISOString().slice(0, 10);
    this.todayCacheTime = now;
    return this.todayCache;
  }

  async getTodayStudyDuration() {
    const cacheKey = `stats:duration:${this.getToday()}`;
    
    const cached = multiLevelCache.get(cacheKey);
    if (cached.data !== null) {
      return cached.data;
    }
    
    return requestDeduplicator.execute(cacheKey, async () => {
      await rateLimiter.acquire();
      
      const response = await storage.get(STUDY_LOG_KEY);
      const logs = response || [];
      const today = this.getToday();
      
      const todayLogs = this.filterTodayLogsOptimized(logs, today);
      const totalDuration = this.sumDurationOptimized(todayLogs);
      
      const result = {
        date: today,
        duration: totalDuration,
        durationMinutes: Math.round(totalDuration / 60000),
        durationFormatted: this.formatDuration(totalDuration),
        sessionCount: todayLogs.length
      };
      
      multiLevelCache.set(cacheKey, result, { ttl: 30000 });
      
      return result;
    });
  }

  async getTodayWordsStudied() {
    const cacheKey = `stats:words:${this.getToday()}`;
    
    const cached = multiLevelCache.get(cacheKey);
    if (cached.data !== null) {
      return cached.data;
    }
    
    return requestDeduplicator.execute(cacheKey, async () => {
      await rateLimiter.acquire();
      
      const [logsResponse, wordsResponse] = await Promise.all([
        storage.get(STUDY_LOG_KEY),
        storage.get(VOCAB_KEY)
      ]);
      
      const logs = logsResponse || [];
      const words = wordsResponse || [];
      const today = this.getToday();
      
      const todayLogs = this.filterTodayLogsOptimized(logs, today);
      const studiedWordIds = this.extractWordIdsOptimized(todayLogs);
      const newWordsToday = this.filterNewWordsOptimized(words, today);
      
      const result = {
        date: today,
        totalStudied: studiedWordIds.size,
        newWords: newWordsToday.length,
        reviewWords: studiedWordIds.size - newWordsToday.length
      };
      
      multiLevelCache.set(cacheKey, result, { ttl: 30000 });
      
      return result;
    });
  }

  async getTodayStats() {
    const cacheKey = `stats:today:${this.getToday()}`;
    
    const cached = multiLevelCache.get(cacheKey);
    if (cached.data !== null) {
      return cached.data;
    }
    
    return requestDeduplicator.execute(cacheKey, async () => {
      const [durationData, wordsData] = await Promise.all([
        this.getTodayStudyDuration(),
        this.getTodayWordsStudied()
      ]);

      const result = {
        date: durationData.date,
        studyDuration: {
          milliseconds: durationData.duration,
          minutes: durationData.durationMinutes,
          formatted: durationData.durationFormatted
        },
        wordsStudied: {
          total: wordsData.totalStudied,
          newWords: wordsData.newWords,
          reviewWords: wordsData.reviewWords
        },
        sessions: durationData.sessionCount
      };
      
      multiLevelCache.set(cacheKey, result, { ttl: 30000, level: 'L1' });
      
      return result;
    });
  }

  filterTodayLogsOptimized(logs, today) {
    if (!Array.isArray(logs) || !today) {
      return [];
    }
    
    const todayPrefix = today;
    const result = [];
    
    for (let i = 0; i < logs.length; i++) {
      const log = logs[i];
      if (log && typeof log === 'object' && log.date && typeof log.date === 'string' && log.date.startsWith(todayPrefix)) {
        result.push(log);
      }
    }
    
    return result;
  }

  sumDurationOptimized(logs) {
    if (!Array.isArray(logs)) {
      return 0;
    }
    
    let sum = 0;
    for (let i = 0; i < logs.length; i++) {
      const log = logs[i];
      if (log && typeof log === 'object') {
        const duration = parseInt(log.duration, 10);
        sum += isNaN(duration) ? 0 : duration;
      }
    }
    return sum;
  }

  extractWordIdsOptimized(logs) {
    const ids = new Set();
    
    if (!Array.isArray(logs)) {
      return ids;
    }
    
    for (let i = 0; i < logs.length; i++) {
      const log = logs[i];
      if (!log || typeof log !== 'object') continue;
      
      const wordsStudied = log.wordsStudied;
      if (wordsStudied && Array.isArray(wordsStudied)) {
        for (let j = 0; j < wordsStudied.length; j++) {
          const id = wordsStudied[j];
          if (id !== null && id !== undefined) {
            ids.add(id);
          }
        }
      }
    }
    
    return ids;
  }

  filterNewWordsOptimized(words, today) {
    if (!Array.isArray(words) || !today) {
      return [];
    }
    
    const result = [];
    const todayPrefix = today;
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      if (word && typeof word === 'object' && 
          Array.isArray(word.reviewHistory) && 
          word.reviewHistory.length > 0 && 
          word.reviewHistory[0] && 
          typeof word.reviewHistory[0].date === 'string' &&
          word.reviewHistory[0].date.startsWith(todayPrefix)) {
        result.push(word);
      }
    }
    
    return result;
  }

  formatDuration(ms) {
    if (!ms || ms <= 0) return '0分钟';
    
    const totalMinutes = Math.floor(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours > 0) {
      return minutes > 0 ? `${hours}小时${minutes}分钟` : `${hours}小时`;
    }
    return `${minutes}分钟`;
  }

  getPerformanceMetrics() {
    return {
      cache: multiLevelCache.getStats(),
      queue: requestQueue.getStats(),
      rateLimiter: rateLimiter.getStats(),
      deduplicator: requestDeduplicator.getStats()
    };
  }

  clearCache() {
    multiLevelCache.clear();
    this.todayCache = null;
    this.todayCacheTime = 0;
  }
}

export const statsService = new OptimizedStatsService();
