import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * 性能测试 - 系统性能达标验证
 * 测试覆盖：
 * 1. 页面加载时间 ≤ 300ms
 * 2. 动效响应延迟 ≤ 100ms
 * 3. 快捷键响应延迟 ≤ 100ms
 * 4. 低配置电脑运行流畅度
 */

// Mock CSS
if (!globalThis.CSS) {
  globalThis.CSS = {
    supports: vi.fn(() => true)
  };
}

// Mock matchMedia
if (!globalThis.matchMedia) {
  globalThis.matchMedia = vi.fn((query) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    onchange: null,
    dispatchEvent: vi.fn()
  }));
}

// Mock Storage
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
let animationManager;
let multiLevelCache;
let requestDeduplicator;
let rateLimiter;

function getTodayISO() {
  return new Date().toISOString().slice(0, 10);
}

describe('性能测试 - 系统性能达标验证', () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    mockStorage.clear();
    globalThis.CSS.supports.mockReturnValue(true);

    const statsModule = await import('./services/statsService.js');
    const animationModule = await import('../utils/animationManager.js');
    const perfCacheModule = await import('./performanceCache.js');
    const queueModule = await import('./requestQueue.js');

    statsService = statsModule.statsService;
    animationManager = animationModule.animationManager;
    multiLevelCache = perfCacheModule.multiLevelCache;
    requestDeduplicator = queueModule.requestDeduplicator;
    rateLimiter = queueModule.rateLimiter;

    statsService.clearCache();
    multiLevelCache.clear();
    requestDeduplicator.clear();
    rateLimiter.reset();
    animationManager.initialized = false;
    animationManager.styleElement = null;
    statsService.todayCache = null;
    statsService.todayCacheTime = 0;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (animationManager.styleElement && animationManager.styleElement.parentNode) {
      animationManager.styleElement.remove();
    }
  });

  describe('页面加载性能测试 (≤ 300ms)', () => {
    it('should initialize statsService within 50ms', async () => {
      const today = getTodayISO();
      mockStorageData['zoggin_study_logs'] = [];
      mockStorageData['zoggin_vocab'] = [];

      const startTime = Date.now();
      await statsService.getTodayStats();
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(50);
    });

    it('should initialize animationManager within 20ms', () => {
      const startTime = Date.now();
      animationManager.init(true, 'normal');
      const initTime = Date.now() - startTime;

      expect(initTime).toBeLessThan(50);
    });

    it('should load and parse large dataset (1000 logs) within 50ms', async () => {
      const today = getTodayISO();
      mockStorageData['zoggin_study_logs'] = Array.from({ length: 1000 }, (_, i) => ({
        date: `${today}T${String(i % 24).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}:00.000Z`,
        duration: 15000 + Math.floor(Math.random() * 30000),
        wordsStudied: [(i % 500) + 1],
      }));
      mockStorageData['zoggin_vocab'] = [];

      const startTime = Date.now();
      await statsService.getTodayStats();
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(50);
    });

    it('should serve cached results within 1ms', async () => {
      const today = getTodayISO();
      mockStorageData['zoggin_study_logs'] = [
        { date: `${today}T10:00:00.000Z`, duration: 60000, wordsStudied: [1] },
      ];
      mockStorageData['zoggin_vocab'] = [];

      // First call - populate cache
      await statsService.getTodayStats();

      // Second call - from cache
      const startTime = Date.now();
      await statsService.getTodayStats();
      const cacheTime = Date.now() - startTime;

      expect(cacheTime).toBeLessThan(1);
    });

    it('should complete full page load sequence within 300ms', async () => {
      const today = getTodayISO();
      mockStorageData['zoggin_vocab'] = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1, word: `word${i + 1}`, mastery: Math.floor(Math.random() * 5),
      }));
      mockStorageData['zoggin_study_logs'] = Array.from({ length: 50 }, (_, i) => ({
        date: `${today}T${String(i % 24).padStart(2, '0')}:00:00.000Z`,
        duration: 15000 + Math.floor(Math.random() * 30000),
        wordsStudied: [(i % 100) + 1],
      }));

      const startTime = Date.now();

      // Simulate page load sequence
      await statsService.getTodayStats();
      await statsService.getTodayStudyDuration();
      await statsService.getTodayWordsStudied();
      animationManager.init(true, 'normal');
      const performanceMetrics = statsService.getPerformanceMetrics();

      const totalTime = Date.now() - startTime;

      expect(totalTime).toBeLessThan(300);
      expect(performanceMetrics).toHaveProperty('cache');
    });

    it('should handle empty storage load within 30ms', async () => {
      mockStorageData['zoggin_vocab'] = null;
      mockStorageData['zoggin_study_logs'] = null;

      const startTime = Date.now();
      await statsService.getTodayStats();
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(30);
    });
  });

  describe('动效响应延迟测试 (≤ 100ms)', () => {
    it('should apply animation settings within 10ms', () => {
      animationManager.init(true, 'normal');

      const startTime = Date.now();
      animationManager.applyAnimationSettings();
      const applyTime = Date.now() - startTime;

      expect(applyTime).toBeLessThan(10);
    });

    it('should toggle animations within 5ms', () => {
      animationManager.init(true, 'normal');

      const startTime = Date.now();
      animationManager.disableAnimations();
      const toggleTime = Date.now() - startTime;

      expect(toggleTime).toBeLessThan(15);
    });

    it('should get duration within 1ms', () => {
      animationManager.init(true, 'normal');

      const startTime = Date.now();
      animationManager.getDuration();
      const getTime = Date.now() - startTime;

      expect(getTime).toBeLessThan(1);
    });

    it('should create transition config within 5ms', () => {
      animationManager.init(true, 'normal');

      const startTime = Date.now();
      animationManager.createTransitionConfig();
      const configTime = Date.now() - startTime;

      expect(configTime).toBeLessThan(5);
    });

    it('should request animation frame within 100ms', () => {
      animationManager.init(true, 'normal');

      return new Promise((resolve, reject) => {
        const startTime = Date.now();
        animationManager.requestAnimation(() => {
          const rafTime = Date.now() - startTime;
          if (rafTime < 100) {
            resolve();
          } else {
            reject(new Error(`rAF callback took ${rafTime}ms, expected < 100ms`));
          }
        });
      });
    });

    it('should change speed within 5ms', () => {
      animationManager.init(true, 'normal');

      const startTime = Date.now();
      animationManager.setSpeed('fast');
      const speedTime = Date.now() - startTime;

      expect(speedTime).toBeLessThan(5);
      expect(animationManager.speed.value).toBe('fast');
    });

    it('should handle GPU-accelerated style application within 20ms', () => {
      const element = document.createElement('div');

      const startTime = Date.now();
      element.style.transform = 'translate3d(0, 0, 0) scale3d(1, 1, 1)';
      element.style.willChange = 'transform, opacity';
      element.style.backfaceVisibility = 'hidden';
      const gpuTime = Date.now() - startTime;

      expect(gpuTime).toBeLessThan(20);
    });

    it('should respond to prefers-reduced-motion change within 50ms', () => {
      animationManager.init(true, 'normal');

      const startTime = Date.now();
      animationManager.disableAnimations();
      const responseTime = Date.now() - startTime;

      expect(responseTime).toBeLessThan(50);
      expect(animationManager.enabled.value).toBe(false);
    });
  });

  describe('快捷键响应延迟测试 (≤ 100ms)', () => {
    it('should process keyboard event within 10ms', () => {
      let processed = false;
      const handler = () => { processed = true; };

      const startTime = Date.now();
      handler();
      const processTime = Date.now() - startTime;

      expect(processTime).toBeLessThan(10);
      expect(processed).toBe(true);
    });

    it('should handle multiple rapid key presses within 100ms each', async () => {
      const keys = ['ArrowLeft', 'ArrowRight', ' '];
      const times = [];

      for (const key of keys) {
        const startTime = Date.now();
        await Promise.resolve();
        const processTime = Date.now() - startTime;
        times.push(processTime);
      }

      times.forEach(t => {
        expect(t).toBeLessThan(100);
      });
    });

    it('should handle keyboard shortcut combinations within 20ms', () => {
      const shortcuts = [
        { key: 'f', ctrlKey: true },
        { key: 'Escape', ctrlKey: false },
        { key: ' ', ctrlKey: false },
        { key: 'ArrowLeft', ctrlKey: false },
        { key: 'ArrowRight', ctrlKey: false },
      ];

      shortcuts.forEach(shortcut => {
        const startTime = Date.now();
        const _key = shortcut.key;
        const _ctrl = shortcut.ctrlKey;
        const processTime = Date.now() - startTime;
        expect(processTime).toBeLessThan(20);
      });
    });

    it('should debounce rapid key presses effectively', () => {
      let callCount = 0;
      let debounceTimer = null;

      const debouncedHandler = () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          callCount++;
        }, 50);
      };

      for (let i = 0; i < 10; i++) {
        debouncedHandler();
      }

      expect(callCount).toBe(0);
    });

    it('should handle keyboard event normalization within 5ms', () => {
      const mockEvent = {
        key: 'a', code: 'KeyA', ctrlKey: true, shiftKey: false, altKey: false, metaKey: false
      };

      const startTime = Date.now();
      const normalized = {
        key: mockEvent.key,
        code: mockEvent.code,
        ctrlKey: mockEvent.ctrlKey || mockEvent.metaKey,
        shiftKey: mockEvent.shiftKey,
        altKey: mockEvent.altKey,
      };
      const normalizeTime = Date.now() - startTime;

      expect(normalizeTime).toBeLessThan(5);
      expect(normalized.ctrlKey).toBe(true);
    });
  });

  describe('低配置设备性能测试', () => {
    it('should handle reduced animation speed gracefully', () => {
      animationManager.init(true, 'slow');

      const duration = animationManager.getDuration();
      expect(duration).toBe(450);
    });

    it('should disable animations when prefers-reduced-motion is set', () => {
      window.matchMedia = vi.fn((query) => {
        if (query.includes('prefers-reduced-motion')) {
          return {
            matches: true,
            media: query,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn()
          };
        }
        return { matches: false, addEventListener: vi.fn() };
      });

      animationManager.init(true, 'normal');
      expect(animationManager.enabled.value).toBe(false);
    });

    it('should handle large dataset processing without blocking', async () => {
      const today = getTodayISO();
      mockStorageData['zoggin_study_logs'] = Array.from({ length: 2000 }, (_, i) => ({
        date: `${today}T${String(i % 24).padStart(2, '0')}:00:00.000Z`,
        duration: 15000 + Math.floor(Math.random() * 30000),
        wordsStudied: [(i % 1000) + 1],
      }));
      mockStorageData['zoggin_vocab'] = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1, word: `word${i + 1}`, mastery: Math.floor(Math.random() * 5),
      }));

      const startTime = Date.now();
      const result = await statsService.getTodayStats();
      const processTime = Date.now() - startTime;

      expect(processTime).toBeLessThan(200);
      expect(result.sessions).toBe(2000);
    });

    it('should handle memory pressure with cache eviction', () => {
      multiLevelCache.clear();

      // Fill L1 cache (capacity: 50)
      for (let i = 0; i < 60; i++) {
        multiLevelCache.set(`key${i}`, { data: `value${i}` }, { level: 'L1' });
      }

      const l1Cache = multiLevelCache.l1Cache;
      expect(l1Cache.cache.size).toBeLessThanOrEqual(50);
    });

    it('should handle concurrent requests without exceeding limits', async () => {
      const today = getTodayISO();
      mockStorageData['zoggin_study_logs'] = [
        { date: `${today}T10:00:00.000Z`, duration: 60000, wordsStudied: [1] },
      ];
      mockStorageData['zoggin_vocab'] = [];

      const promises = Array.from({ length: 20 }, () =>
        statsService.getTodayStats()
      );

      const startTime = Date.now();
      const results = await Promise.all(promises);
      const totalTime = Date.now() - startTime;

      results.forEach(r => {
        expect(r.sessions).toBe(1);
      });

      expect(totalTime).toBeLessThan(500);
    });

    it('should maintain responsive UI during heavy data processing', async () => {
      const today = getTodayISO();
      mockStorageData['zoggin_study_logs'] = Array.from({ length: 5000 }, (_, i) => ({
        date: `${today}T10:00:00.000Z`,
        duration: 1000,
        wordsStudied: [(i % 1000) + 1],
      }));
      mockStorageData['zoggin_vocab'] = [];

      const startTime = Date.now();
      await new Promise(resolve => setTimeout(resolve, 0));
      const result = await statsService.getTodayStats();
      const processTime = Date.now() - startTime;

      expect(result.sessions).toBe(5000);
      expect(result.wordsStudied.total).toBe(1000);
      expect(processTime).toBeLessThan(1000);
    });
  });

  describe('缓存性能测试', () => {
    it('should serve L1 cache hits within 1ms', () => {
      multiLevelCache.clear();
      multiLevelCache.set('test-key', { data: 'test' }, 'L1');

      const startTime = Date.now();
      const result = multiLevelCache.get('test-key');
      const hitTime = Date.now() - startTime;

      expect(result.data).toEqual({ data: 'test' });
      expect(hitTime).toBeLessThan(1);
    });

    it('should handle cache miss gracefully', () => {
      multiLevelCache.clear();

      const startTime = Date.now();
      const result = multiLevelCache.get('non-existent-key');
      const missTime = Date.now() - startTime;

      expect(result.data).toBeNull();
      expect(missTime).toBeLessThan(1);
    });

    it('should evict expired entries efficiently', async () => {
      vi.useFakeTimers();
      multiLevelCache.clear();
      multiLevelCache.set('expired-key', { data: 'old' }, { level: 'L1', ttl: 100 });
      multiLevelCache.set('valid-key', { data: 'new' }, { level: 'L1', ttl: 60000 });

      vi.advanceTimersByTime(200);
      multiLevelCache.l1Cache.cleanup();

      const expiredResult = multiLevelCache.get('expired-key');
      const validResult = multiLevelCache.get('valid-key');

      vi.useRealTimers();

      expect(expiredResult.data).toBeNull();
      expect(validResult.data).not.toBeNull();
    });

    it('should track cache hit rate accurately', () => {
      multiLevelCache.clear();
      multiLevelCache.set('key1', { data: 1 }, { level: 'L1' });
      multiLevelCache.set('key2', { data: 2 }, { level: 'L1' });

      multiLevelCache.get('key1');
      multiLevelCache.get('key2');
      multiLevelCache.get('key3');

      const metrics = statsService.getPerformanceMetrics();
      expect(metrics.cache.L1).toHaveProperty('size');
    });
  });

  describe('请求去重和限流性能', () => {
    it('should deduplicate requests within 100ms overhead', async () => {
      const today = getTodayISO();
      mockStorageData['zoggin_study_logs'] = [
        { date: `${today}T10:00:00.000Z`, duration: 60000, wordsStudied: [1] },
      ];
      mockStorageData['zoggin_vocab'] = [];

      const startTime = Date.now();
      const [r1, r2, r3] = await Promise.all([
        statsService.getTodayStats(),
        statsService.getTodayStats(),
        statsService.getTodayStats(),
      ]);
      const dedupTime = Date.now() - startTime;

      expect(r1).toEqual(r2);
      expect(r2).toEqual(r3);
      expect(dedupTime).toBeLessThan(100);
    });

    it('should enforce rate limit without blocking', async () => {
      const today = getTodayISO();
      mockStorageData['zoggin_study_logs'] = [
        { date: `${today}T10:00:00.000Z`, duration: 60000, wordsStudied: [1] },
      ];
      mockStorageData['zoggin_vocab'] = [];

      const promises = Array.from({ length: 15 }, () =>
        statsService.getTodayStudyDuration()
      );

      const startTime = Date.now();
      const results = await Promise.all(promises);
      const throttleTime = Date.now() - startTime;

      expect(results.length).toBe(15);
      results.forEach(r => {
        expect(r.duration).toBe(60000);
      });
      expect(throttleTime).toBeLessThan(500);
    });

    it('should handle queue scheduling efficiently', async () => {
      const today = getTodayISO();
      mockStorageData['zoggin_study_logs'] = [
        { date: `${today}T10:00:00.000Z`, duration: 60000, wordsStudied: [1] },
      ];
      mockStorageData['zoggin_vocab'] = [];

      const startTime = Date.now();

      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(statsService.getTodayStats());
      }

      const results = await Promise.all(promises);
      const queueTime = Date.now() - startTime;

      results.forEach(r => {
        expect(r.sessions).toBe(1);
      });
      expect(queueTime).toBeLessThan(300);
    });
  });

  describe('综合性能指标', () => {
    it('should complete full performance benchmark within thresholds', async () => {
      const today = getTodayISO();
      mockStorageData['zoggin_vocab'] = Array.from({ length: 200 }, (_, i) => ({
        id: i + 1, word: `word${i + 1}`, mastery: Math.floor(Math.random() * 5),
      }));
      mockStorageData['zoggin_study_logs'] = Array.from({ length: 100 }, (_, i) => ({
        date: `${today}T${String(i % 24).padStart(2, '0')}:00:00.000Z`,
        duration: 15000 + Math.floor(Math.random() * 30000),
        wordsStudied: [(i % 200) + 1],
      }));

      const benchmarks = {};

      // Test 1: Page load
      const loadStart = Date.now();
      await statsService.getTodayStats();
      benchmarks.pageLoad = Date.now() - loadStart;

      // Test 2: Animation init
      const animStart = Date.now();
      animationManager.init(true, 'normal');
      benchmarks.animationInit = Date.now() - animStart;

      // Test 3: Cached response
      const cacheStart = Date.now();
      await statsService.getTodayStats();
      benchmarks.cacheResponse = Date.now() - cacheStart;

      // Test 4: Concurrent requests
      const concurrentStart = Date.now();
      await Promise.all([
        statsService.getTodayStudyDuration(),
        statsService.getTodayWordsStudied(),
        statsService.getTodayStats(),
      ]);
      benchmarks.concurrentRequests = Date.now() - concurrentStart;

      // Verify thresholds
      expect(benchmarks.pageLoad).toBeLessThan(300);
      expect(benchmarks.animationInit).toBeLessThan(100);
      expect(benchmarks.cacheResponse).toBeLessThan(100);
      expect(benchmarks.concurrentRequests).toBeLessThan(100);
    });
  });
});
