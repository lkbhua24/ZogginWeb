import { describe, it, expect, beforeEach, vi } from 'vitest';
import { api, ApiResponse, localClient } from '../index.js';

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

describe('接口兼容性测试', () => {
  beforeEach(() => {
    mockStorage.clear();
    localClient.clearCache();
  });

  describe('请求缓存机制', () => {
    it('应该缓存GET请求结果', async () => {
      mockStorage.set('test_key', { data: 'test_value' });
      
      const result1 = await localClient.get('test_key');
      expect(result1.success).toBe(true);
      expect(result1.fromCache).toBeFalsy();
      
      const result2 = await localClient.get('test_key');
      expect(result2.success).toBe(true);
      expect(result2.fromCache).toBe(true);
    });

    it('应该正确清除缓存', async () => {
      mockStorage.set('test_key', { data: 'test_value' });
      
      await localClient.get('test_key');
      localClient.clearCache();
      
      const result = await localClient.get('test_key');
      expect(result.success).toBe(true);
      expect(result.fromCache).toBeFalsy();
    });
  });

  describe('性能监控', () => {
    it('应该记录性能指标', async () => {
      mockStorage.set('test_key', { data: 'test_value' });
      
      await localClient.get('test_key');
      
      const metrics = localClient.getMetrics();
      
      expect(metrics.totalRequests).toBeGreaterThan(0);
      expect(metrics.successfulRequests).toBeGreaterThan(0);
      expect(metrics.averageDuration).toBeGreaterThanOrEqual(0);
    });

    it('应该统计缓存命中次数', async () => {
      mockStorage.set('test_key', { data: 'test_value' });
      
      await localClient.get('test_key');
      await localClient.get('test_key');
      
      const metrics = localClient.getMetrics();
      
      expect(metrics.cacheHits).toBeGreaterThan(0);
    });
  });

  describe('API接口稳定性', () => {
    it('应该正确处理并发请求', async () => {
      const now = new Date();
      
      mockStorage.set('zoggin_study_logs', [
        { id: '1', date: now.toISOString(), duration: 1000, wordsStudied: ['w1'] }
      ]);
      
      mockStorage.set('zoggin_vocab', [
        { id: 'w1', word: 'test', reviewHistory: [{ date: now.toISOString() }] }
      ]);
      
      const [stats1, stats2, stats3] = await Promise.all([
        api.stats.getTodayStats(),
        api.stats.getTodayStats(),
        api.stats.getTodayStats()
      ]);
      
      expect(stats1.success).toBe(true);
      expect(stats2.success).toBe(true);
      expect(stats3.success).toBe(true);
    });

    it('应该正确处理空数据', async () => {
      const response = await api.stats.getTodayStats();
      
      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
    });

    it('应该正确处理异常数据', async () => {
      mockStorage.set('zoggin_study_logs', null);
      mockStorage.set('zoggin_vocab', undefined);
      
      const response = await api.stats.getTodayStats();
      
      expect(response.success).toBe(true);
    });
  });

  describe('响应格式一致性', () => {
    it('所有接口应该返回统一的响应格式', async () => {
      const responses = await Promise.all([
        api.stats.getTodayStudyDuration(),
        api.stats.getTodayWordsStudied(),
        api.stats.getTodayStats()
      ]);
      
      responses.forEach(response => {
        expect(response).toHaveProperty('success');
        expect(response).toHaveProperty('code');
        expect(response).toHaveProperty('timestamp');
      });
    });
  });

  describe('缓存管理', () => {
    it('应该能够清除缓存', () => {
      const response = api.stats.clearCache();
      expect(response.success).toBe(true);
      expect(response.message).toBe('缓存已清除');
    });

    it('应该能够获取性能指标', () => {
      const metrics = api.stats.getPerformanceMetrics();
      expect(metrics).toHaveProperty('cache');
      expect(metrics).toHaveProperty('queue');
      expect(metrics).toHaveProperty('rateLimiter');
      expect(metrics).toHaveProperty('deduplicator');
    });
  });
});
