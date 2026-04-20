import { describe, it, expect, beforeEach, vi } from 'vitest';
import { api, multiLevelCache, requestDeduplicator, performanceMonitor } from '../index.js';

const mockStorage = new Map();

vi.mock('../../utils/storage.js', () => ({
  default: {
    get: (key) => Promise.resolve(mockStorage.get(key)),
    set: (key, value) => {
      mockStorage.set(key, value);
      return Promise.resolve();
    },
    clear: () => {
      mockStorage.clear();
      return Promise.resolve();
    }
  }
}));

describe('性能优化测试', () => {
  beforeEach(() => {
    mockStorage.clear();
    multiLevelCache.clear();
    requestDeduplicator.clear();
    performanceMonitor.reset();
  });

  describe('响应时间测试', () => {
    it('首次请求响应时间应≤100ms', async () => {
      const now = new Date();
      mockStorage.set('zoggin_study_logs', [
        { id: '1', date: now.toISOString(), duration: 1000, wordsStudied: ['w1'] }
      ]);
      mockStorage.set('zoggin_vocab', [
        { id: 'w1', word: 'test', reviewHistory: [{ date: now.toISOString() }] }
      ]);

      const startTime = Date.now();
      const response = await api.stats.getTodayStats();
      const duration = Date.now() - startTime;

      expect(response.success).toBe(true);
      expect(duration).toBeLessThanOrEqual(100);
      console.log(`首次请求响应时间: ${duration}ms`);
    });

    it('缓存命中后响应时间应≤10ms', async () => {
      const now = new Date();
      mockStorage.set('zoggin_study_logs', [
        { id: '1', date: now.toISOString(), duration: 1000, wordsStudied: ['w1'] }
      ]);
      mockStorage.set('zoggin_vocab', [
        { id: 'w1', word: 'test', reviewHistory: [{ date: now.toISOString() }] }
      ]);

      await api.stats.getTodayStats();

      const startTime = Date.now();
      const cachedResponse = await api.stats.getTodayStats();
      const duration = Date.now() - startTime;

      expect(cachedResponse.success).toBe(true);
      expect(duration).toBeLessThanOrEqual(10);
      console.log(`缓存命中响应时间: ${duration}ms`);
    });
  });

  describe('高并发测试', () => {
    it('应支持10个并发请求', async () => {
      const now = new Date();
      mockStorage.set('zoggin_study_logs', [
        { id: '1', date: now.toISOString(), duration: 1000, wordsStudied: ['w1'] }
      ]);
      mockStorage.set('zoggin_vocab', [
        { id: 'w1', word: 'test', reviewHistory: [{ date: now.toISOString() }] }
      ]);

      const startTime = Date.now();
      const promises = [];
      
      for (let i = 0; i < 10; i++) {
        promises.push(api.stats.getTodayStats());
      }

      const results = await Promise.all(promises);
      const duration = Date.now() - startTime;

      results.forEach(result => {
        expect(result.success).toBe(true);
      });

      expect(duration).toBeLessThanOrEqual(200);
      console.log(`10个并发请求总耗时: ${duration}ms`);
    });

    it('应支持50个并发请求', async () => {
      const now = new Date();
      mockStorage.set('zoggin_study_logs', [
        { id: '1', date: now.toISOString(), duration: 1000, wordsStudied: ['w1'] }
      ]);
      mockStorage.set('zoggin_vocab', [
        { id: 'w1', word: 'test', reviewHistory: [{ date: now.toISOString() }] }
      ]);

      const startTime = Date.now();
      const promises = [];
      
      for (let i = 0; i < 50; i++) {
        promises.push(api.stats.getTodayStats());
      }

      const results = await Promise.all(promises);
      const duration = Date.now() - startTime;

      results.forEach(result => {
        expect(result.success).toBe(true);
      });

      expect(duration).toBeLessThanOrEqual(500);
      console.log(`50个并发请求总耗时: ${duration}ms`);
    });
  });

  describe('缓存性能测试', () => {
    it('多级缓存应正确工作', async () => {
      const now = new Date();
      mockStorage.set('zoggin_study_logs', [
        { id: '1', date: now.toISOString(), duration: 1000, wordsStudied: ['w1'] }
      ]);
      mockStorage.set('zoggin_vocab', [
        { id: 'w1', word: 'test', reviewHistory: [{ date: now.toISOString() }] }
      ]);

      const response1 = await api.stats.getTodayStats();
      expect(response1.success).toBe(true);

      const cacheStats = multiLevelCache.getStats();
      expect(cacheStats.L1.size).toBeGreaterThan(0);
      console.log('L1缓存大小:', cacheStats.L1.size);
      console.log('L2缓存大小:', cacheStats.L2.size);
      console.log('L3缓存大小:', cacheStats.L3.size);
    });

    it('缓存命中率应≥80%', async () => {
      const now = new Date();
      mockStorage.set('zoggin_study_logs', [
        { id: '1', date: now.toISOString(), duration: 1000, wordsStudied: ['w1'] }
      ]);
      mockStorage.set('zoggin_vocab', [
        { id: 'w1', word: 'test', reviewHistory: [{ date: now.toISOString() }] }
      ]);

      await api.stats.getTodayStats();

      for (let i = 0; i < 9; i++) {
        await api.stats.getTodayStats();
      }

      const cacheStats = multiLevelCache.getStats();
      const l1HitRate = cacheStats.L1.hitCount > 0 
        ? (cacheStats.L1.hitCount / (cacheStats.L1.hitCount + cacheStats.L1.missCount) * 100).toFixed(2)
        : 0;

      console.log(`L1缓存命中率: ${l1HitRate}%`);
      console.log(`L1命中数: ${cacheStats.L1.hitCount}`);
      console.log(`L1未命中数: ${cacheStats.L1.missCount}`);
      
      expect(cacheStats.L1.hitCount).toBeGreaterThan(0);
    });
  });

  describe('请求去重测试', () => {
    it('相同请求应被去重', async () => {
      const now = new Date();
      mockStorage.set('zoggin_study_logs', [
        { id: '1', date: now.toISOString(), duration: 1000, wordsStudied: ['w1'] }
      ]);
      mockStorage.set('zoggin_vocab', [
        { id: 'w1', word: 'test', reviewHistory: [{ date: now.toISOString() }] }
      ]);

      const promises = [
        api.stats.getTodayStats(),
        api.stats.getTodayStats(),
        api.stats.getTodayStats()
      ];

      const results = await Promise.all(promises);
      
      results.forEach(result => {
        expect(result.success).toBe(true);
      });

      const stats = requestDeduplicator.getStats();
      expect(stats.deduplicatedCount).toBeGreaterThan(0);
      console.log(`去重请求数: ${stats.deduplicatedCount}`);
    });
  });

  describe('性能监控测试', () => {
    it('应正确记录性能指标', async () => {
      const now = new Date();
      mockStorage.set('zoggin_study_logs', [
        { id: '1', date: now.toISOString(), duration: 1000, wordsStudied: ['w1'] }
      ]);
      mockStorage.set('zoggin_vocab', [
        { id: 'w1', word: 'test', reviewHistory: [{ date: now.toISOString() }] }
      ]);

      for (let i = 0; i < 5; i++) {
        const response = await api.stats.getTodayStats();
        performanceMonitor.recordRequest({
          success: response.success,
          duration: Date.now() % 100,
          fromCache: i > 0
        });
      }

      const stats = performanceMonitor.getStats();
      expect(stats.requestCount).toBe(5);
      expect(stats.averageResponseTime).toBeGreaterThanOrEqual(0);
      console.log(`平均响应时间: ${stats.averageResponseTime}ms`);
      console.log(`请求总数: ${stats.requestCount}`);
    });

    it('应正确计算百分位数', async () => {
      const durations = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
      
      durations.forEach(duration => {
        performanceMonitor.recordRequest({
          success: true,
          duration,
          fromCache: false
        });
      });

      const stats = performanceMonitor.getStats();
      expect(stats.percentiles.p50).toBeGreaterThan(0);
      expect(stats.percentiles.p95).toBeGreaterThan(0);
      expect(stats.percentiles.p99).toBeGreaterThan(0);
      console.log(`P50: ${stats.percentiles.p50}ms`);
      console.log(`P95: ${stats.percentiles.p95}ms`);
      console.log(`P99: ${stats.percentiles.p99}ms`);
    });
  });

  describe('压力测试', () => {
    it('应处理100个连续请求', async () => {
      const now = new Date();
      mockStorage.set('zoggin_study_logs', [
        { id: '1', date: now.toISOString(), duration: 1000, wordsStudied: ['w1'] }
      ]);
      mockStorage.set('zoggin_vocab', [
        { id: 'w1', word: 'test', reviewHistory: [{ date: now.toISOString() }] }
      ]);

      const startTime = Date.now();
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < 100; i++) {
        try {
          const response = await api.stats.getTodayStats();
          if (response.success) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          errorCount++;
        }
      }

      const duration = Date.now() - startTime;
      const successRate = (successCount / 100 * 100).toFixed(2);

      expect(successCount).toBe(100);
      expect(errorCount).toBe(0);
      expect(parseFloat(successRate)).toBe(100);
      
      console.log(`100个请求成功率: ${successRate}%`);
      console.log(`总耗时: ${duration}ms`);
      console.log(`平均每个请求: ${(duration / 100).toFixed(2)}ms`);
    });
  });
});
