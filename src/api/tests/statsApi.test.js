import { describe, it, expect, beforeEach, vi } from 'vitest';
import { api, ApiResponse, localClient, multiLevelCache } from '../index.js';

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

describe('学习数据统计API', () => {
  beforeEach(() => {
    mockStorage.clear();
    localClient.clearCache();
    multiLevelCache.clear();
  });

  describe('getTodayStudyDuration', () => {
    it('应该返回今日学习时长统计', async () => {
      const now = new Date();
      const today = now.toISOString().slice(0, 10);
      
      mockStorage.set('zoggin_study_logs', [
        {
          id: '1',
          date: now.toISOString(),
          duration: 1800000,
          sessionType: 'review',
          wordsStudied: ['word1', 'word2']
        },
        {
          id: '2',
          date: now.toISOString(),
          duration: 1200000,
          sessionType: 'video',
          wordsStudied: []
        }
      ]);

      const response = await api.stats.getTodayStudyDuration();
      
      expect(response.success).toBe(true);
      expect(response.code).toBe(200);
      expect(response.data.date).toBe(today);
      expect(response.data.duration).toBe(3000000);
      expect(response.data.durationMinutes).toBe(50);
      expect(response.data.sessionCount).toBe(2);
      expect(response.data.durationFormatted).toBe('50分钟');
    });

    it('当没有学习记录时应该返回0', async () => {
      const response = await api.stats.getTodayStudyDuration();
      
      expect(response.success).toBe(true);
      expect(response.data.duration).toBe(0);
      expect(response.data.durationMinutes).toBe(0);
      expect(response.data.sessionCount).toBe(0);
    });
  });

  describe('getTodayWordsStudied', () => {
    it('应该返回今日已背单词统计', async () => {
      const now = new Date();
      const today = now.toISOString().slice(0, 10);
      
      mockStorage.set('zoggin_study_logs', [
        {
          id: '1',
          date: now.toISOString(),
          sessionType: 'review',
          wordsStudied: ['word1', 'word2', 'word3']
        },
        {
          id: '2',
          date: now.toISOString(),
          sessionType: 'new',
          wordsStudied: ['word2', 'word4']
        }
      ]);

      mockStorage.set('zoggin_vocab', [
        {
          id: 'word1',
          word: 'test1',
          mastery: 1,
          reviewHistory: [{ date: now.toISOString(), mastery: 1 }]
        },
        {
          id: 'word2',
          word: 'test2',
          mastery: 2,
          reviewHistory: [{ date: now.toISOString(), mastery: 2 }]
        }
      ]);

      const response = await api.stats.getTodayWordsStudied();
      
      expect(response.success).toBe(true);
      expect(response.data.date).toBe(today);
      expect(response.data.totalStudied).toBe(4);
      expect(response.data.newWords).toBe(2);
      expect(response.data.reviewWords).toBe(2);
    });

    it('当没有学习记录时应该返回0', async () => {
      const response = await api.stats.getTodayWordsStudied();
      
      expect(response.success).toBe(true);
      expect(response.data.totalStudied).toBe(0);
      expect(response.data.newWords).toBe(0);
      expect(response.data.reviewWords).toBe(0);
    });
  });

  describe('getTodayStats', () => {
    it('应该返回综合统计数据', async () => {
      const now = new Date();
      const today = now.toISOString().slice(0, 10);
      
      mockStorage.set('zoggin_study_logs', [
        {
          id: '1',
          date: now.toISOString(),
          duration: 3600000,
          sessionType: 'review',
          wordsStudied: ['word1', 'word2', 'word3']
        }
      ]);

      mockStorage.set('zoggin_vocab', [
        {
          id: 'word1',
          word: 'test1',
          mastery: 1,
          reviewHistory: [{ date: now.toISOString(), mastery: 1 }]
        }
      ]);

      const response = await api.stats.getTodayStats();
      
      expect(response.success).toBe(true);
      expect(response.data.date).toBe(today);
      expect(response.data.studyDuration.milliseconds).toBe(3600000);
      expect(response.data.studyDuration.minutes).toBe(60);
      expect(response.data.wordsStudied.total).toBe(3);
      expect(response.data.wordsStudied.newWords).toBe(1);
      expect(response.data.sessions).toBe(1);
    });

    it('响应格式应该符合规范', async () => {
      const response = await api.stats.getTodayStats();
      
      expect(response).toHaveProperty('success');
      expect(response).toHaveProperty('data');
      expect(response).toHaveProperty('message');
      expect(response).toHaveProperty('code');
      expect(response).toHaveProperty('timestamp');
      expect(typeof response.timestamp).toBe('string');
    });
  });

  describe('ApiResponse', () => {
    it('应该创建成功的响应', () => {
      const data = { test: 'data' };
      const response = ApiResponse.success(data, '操作成功');
      
      expect(response.success).toBe(true);
      expect(response.data).toEqual(data);
      expect(response.message).toBe('操作成功');
      expect(response.code).toBe(200);
    });

    it('应该创建错误的响应', () => {
      const response = ApiResponse.error('操作失败', 500);
      
      expect(response.success).toBe(false);
      expect(response.message).toBe('操作失败');
      expect(response.code).toBe(500);
    });
  });
});
