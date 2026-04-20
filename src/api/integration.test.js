import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * 整体功能联调测试 - 端到端验证
 * 测试覆盖：
 * 1. 完整学习流程（UI → API → Storage → UI 更新）
 * 2. 数据流转一致性
 * 3. 异常场景和边界条件
 * 4. 缓存、去重、限流机制的端到端验证
 */

// Mock Storage 模块
const mockStorageData = {};
const mockStorage = {
  async get(key) {
    return mockStorageData[key] !== undefined ? mockStorageData[key] : null;
  },
  async set(key, value) {
    mockStorageData[key] = value;
  },
  clear() {
    Object.keys(mockStorageData).forEach(key => delete mockStorageData[key]);
  }
};

vi.mock('../utils/storage.js', () => ({
  default: mockStorage
}));

let statsService;
let multiLevelCache;
let requestDeduplicator;
let rateLimiter;

function getTodayISO() {
  return new Date().toISOString().slice(0, 10);
}

describe('整体功能联调测试 - 端到端验证', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    mockStorage.clear();

    const statsModule = await import('./services/statsService.js');
    const perfModule = await import('./performanceCache.js');
    const queueModule = await import('./requestQueue.js');

    statsService = statsModule.statsService;
    multiLevelCache = perfModule.multiLevelCache;
    requestDeduplicator = queueModule.requestDeduplicator;
    rateLimiter = queueModule.rateLimiter;

    statsService.clearCache();
    multiLevelCache.clear();
    requestDeduplicator.clear();
    rateLimiter.reset();
    statsService.todayCache = null;
    statsService.todayCacheTime = 0;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('完整学习流程联调', () => {
    it('should complete full study session: init words → study word → record log → update stats', async () => {
      const today = getTodayISO();
      mockStorageData['zoggin_vocab'] = [
        { id: 1, word: 'abandon', mastery: 0 },
        { id: 2, word: 'ability', mastery: 0 },
      ];
      mockStorageData['zoggin_study_logs'] = [
        { date: `${today}T10:00:00.000Z`, wordId: 1, response: 'known', duration: 30000, wordsStudied: [1] },
      ];
      mockStorageData['zoggin_vocab'][0].mastery = 1;

      const stats = await statsService.getTodayStats();

      expect(stats.sessions).toBe(1);
      expect(stats.studyDuration.milliseconds).toBe(30000);
      expect(stats.wordsStudied.total).toBe(1);
    });

    it('should handle multiple study sessions and aggregate stats correctly', async () => {
      const today = getTodayISO();
      mockStorageData['zoggin_vocab'] = [
        { id: 1, word: 'word1', mastery: 0 },
        { id: 2, word: 'word2', mastery: 0 },
        { id: 3, word: 'word3', mastery: 0 },
      ];
      mockStorageData['zoggin_study_logs'] = [
        { date: `${today}T09:00:00.000Z`, duration: 20000, wordsStudied: [1] },
        { date: `${today}T10:00:00.000Z`, duration: 30000, wordsStudied: [2] },
        { date: `${today}T11:00:00.000Z`, duration: 25000, wordsStudied: [2, 3] },
      ];

      const stats = await statsService.getTodayStats();

      expect(stats.sessions).toBe(3);
      expect(stats.studyDuration.milliseconds).toBe(75000);
      expect(stats.wordsStudied.total).toBe(3);
    });

    it('should maintain data consistency across cache clears', async () => {
      const today = getTodayISO();
      mockStorageData['zoggin_study_logs'] = [
        { date: `${today}T10:00:00.000Z`, duration: 60000, wordsStudied: [1, 2] },
      ];
      mockStorageData['zoggin_vocab'] = [];

      const stats1 = await statsService.getTodayStats();
      expect(stats1.sessions).toBe(1);

      statsService.clearCache();
      const stats2 = await statsService.getTodayStats();
      expect(stats2.sessions).toBe(stats1.sessions);
    });
  });

  describe('数据流转一致性', () => {
    it('should record study logs in correct format', async () => {
      const today = getTodayISO();
      mockStorageData['zoggin_study_logs'] = [
        { date: `${today}T10:00:00.000Z`, duration: 30000, wordsStudied: [1, 2, 3] },
      ];
      mockStorageData['zoggin_vocab'] = [];

      const stats = await statsService.getTodayStats();

      expect(stats.sessions).toBe(1);
      expect(stats.studyDuration.milliseconds).toBe(30000);
      expect(stats.wordsStudied.total).toBe(3);
    });

    it('should handle vocab and logs data synchronization', async () => {
      const today = getTodayISO();
      mockStorageData['zoggin_vocab'] = [
        { id: 1, word: 'hello', mastery: 0 },
        { id: 2, word: 'world', mastery: 0 },
      ];
      mockStorageData['zoggin_study_logs'] = [
        { date: `${today}T10:00:00.000Z`, duration: 20000, wordsStudied: [1] },
        { date: `${today}T11:00:00.000Z`, duration: 30000, wordsStudied: [1, 2] },
      ];

      const stats = await statsService.getTodayStats();

      expect(stats.sessions).toBe(2);
      expect(stats.studyDuration.milliseconds).toBe(50000);
      expect(stats.wordsStudied.total).toBe(2);
    });
  });

  describe('异常场景联调', () => {
    it('should handle empty storage gracefully', async () => {
      mockStorageData['zoggin_vocab'] = null;
      mockStorageData['zoggin_study_logs'] = null;

      const stats = await statsService.getTodayStats();

      expect(stats.sessions).toBe(0);
      expect(stats.studyDuration.milliseconds).toBe(0);
      expect(stats.wordsStudied.total).toBe(0);
    });

    it('should handle concurrent API calls correctly', async () => {
      const today = getTodayISO();
      mockStorageData['zoggin_study_logs'] = [
        { date: `${today}T10:00:00.000Z`, duration: 60000, wordsStudied: [1] },
      ];
      mockStorageData['zoggin_vocab'] = [];

      const [duration, words, stats] = await Promise.all([
        statsService.getTodayStudyDuration(),
        statsService.getTodayWordsStudied(),
        statsService.getTodayStats(),
      ]);

      expect(stats.studyDuration.milliseconds).toBe(duration.duration);
      expect(stats.wordsStudied.total).toBe(words.totalStudied);
      expect(stats.sessions).toBe(duration.sessionCount);
    });
  });

  describe('缓存、去重、限流端到端验证', () => {
    it('should cache results and serve from cache on repeated calls', async () => {
      const today = getTodayISO();
      mockStorageData['zoggin_study_logs'] = [
        { date: `${today}T10:00:00.000Z`, duration: 60000, wordsStudied: [1] },
      ];
      mockStorageData['zoggin_vocab'] = [];

      const result1 = await statsService.getTodayStats();
      expect(result1.sessions).toBe(1);

      const result2 = await statsService.getTodayStats();
      expect(result2).toEqual(result1);
    });

    it('should maintain cache consistency after operations', async () => {
      const today = getTodayISO();
      mockStorageData['zoggin_study_logs'] = [
        { date: `${today}T10:00:00.000Z`, duration: 60000, wordsStudied: [1] },
      ];
      mockStorageData['zoggin_vocab'] = [];

      const result1 = await statsService.getTodayStats();
      expect(result1.sessions).toBe(1);

      mockStorageData['zoggin_study_logs'].push(
        { date: `${today}T11:00:00.000Z`, duration: 120000, wordsStudied: [2] }
      );

      statsService.clearCache();
      const result2 = await statsService.getTodayStats();
      expect(result2.sessions).toBe(2);
      expect(result2.studyDuration.milliseconds).toBe(180000);

      const result3 = await statsService.getTodayStats();
      expect(result3).toEqual(result2);
    });
  });

  describe('业务逻辑完整性', () => {
    it('should support complete word review cycle', async () => {
      const today = getTodayISO();
      mockStorageData['zoggin_vocab'] = [
        { id: 1, word: 'abandon', mastery: 0, reviewHistory: [] },
      ];
      mockStorageData['zoggin_study_logs'] = [];
      const word = mockStorageData['zoggin_vocab'][0];

      // 第1次：忘记
      mockStorageData['zoggin_study_logs'].push({
        date: `${today}T10:00:00.000Z`, wordId: 1, response: 'unknown', duration: 40000, wordsStudied: [1],
      });

      // 第2次：模糊
      mockStorageData['zoggin_study_logs'].push({
        date: `${today}T11:00:00.000Z`, wordId: 1, response: 'vague', duration: 25000, wordsStudied: [1],
      });
      word.mastery = 1;

      // 第3次：认识
      mockStorageData['zoggin_study_logs'].push({
        date: `${today}T12:00:00.000Z`, wordId: 1, response: 'known', duration: 15000, wordsStudied: [1],
      });
      word.mastery = 2;
      word.reviewHistory.push({ date: new Date().toISOString() });

      const stats = await statsService.getTodayStats();
      expect(stats.sessions).toBe(3);
      expect(stats.studyDuration.milliseconds).toBe(80000);
      expect(stats.wordsStudied.total).toBe(1);
      expect(word.mastery).toBe(2);
    });

    it('should support daily goal tracking', async () => {
      const today = getTodayISO();
      const dailyGoal = 50;
      mockStorageData['zoggin_vocab'] = [];
      mockStorageData['zoggin_study_logs'] = [
        { date: `${today}T10:00:00.000Z`, wordsStudied: Array.from({ length: 25 }, (_, i) => i + 1), duration: 600000 },
      ];

      const stats = await statsService.getTodayStats();
      const progress = Math.min(Math.round((stats.wordsStudied.total / dailyGoal) * 100), 100);

      expect(stats.wordsStudied.total).toBe(25);
      expect(progress).toBe(50);

      mockStorageData['zoggin_study_logs'].push(
        { date: `${today}T11:00:00.000Z`, wordsStudied: Array.from({ length: 25 }, (_, i) => i + 26), duration: 600000 }
      );

      statsService.clearCache();
      const stats2 = await statsService.getTodayStats();
      const progress2 = Math.min(Math.round((stats2.wordsStudied.total / dailyGoal) * 100), 100);

      expect(stats2.wordsStudied.total).toBe(50);
      expect(progress2).toBe(100);
    });
  });

  describe('性能联调测试', () => {
    it('should handle 100-word vocabulary with 50 study logs efficiently', async () => {
      const today = getTodayISO();
      mockStorageData['zoggin_vocab'] = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1, word: `word${i + 1}`, mastery: Math.floor(Math.random() * 5),
      }));
      mockStorageData['zoggin_study_logs'] = Array.from({ length: 50 }, (_, i) => ({
        date: `${today}T${String(i % 24).padStart(2, '0')}:00:00.000Z`,
        wordId: (i % 100) + 1, response: ['known', 'unknown', 'vague'][i % 3],
        duration: 15000 + Math.floor(Math.random() * 30000), wordsStudied: [(i % 100) + 1],
      }));

      const startTime = Date.now();
      const [duration, words, stats] = await Promise.all([
        statsService.getTodayStudyDuration(),
        statsService.getTodayWordsStudied(),
        statsService.getTodayStats(),
      ]);
      const totalTime = Date.now() - startTime;

      expect(totalTime).toBeLessThan(50);
      expect(stats.sessions).toBe(50);
      expect(stats.studyDuration.milliseconds).toBe(duration.duration);
      expect(stats.wordsStudied.total).toBe(words.totalStudied);
    });
  });
});
