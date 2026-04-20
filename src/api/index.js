import { statsController } from './controllers/statsController.js';

export const api = {
  stats: {
    getTodayStudyDuration: () => statsController.getTodayStudyDuration(),
    getTodayWordsStudied: () => statsController.getTodayWordsStudied(),
    getTodayStats: () => statsController.getTodayStats(),
    getPerformanceMetrics: () => statsController.getPerformanceMetrics(),
    clearCache: () => statsController.clearCache()
  }
};

export { ApiResponse } from './response.js';
export { statsService } from './services/statsService.js';
export { statsController } from './controllers/statsController.js';
export { HttpClient, httpClient } from './httpClient.js';
export { LocalClient, localClient } from './localClient.js';
export { 
  BrowserCompatibility, 
  browserCompatibility,
  checkBrowserCompatibility,
  isBrowserCompatible
} from './browserCompatibility.js';
export {
  PerformanceCache,
  MultiLevelCache,
  performanceCache,
  multiLevelCache
} from './performanceCache.js';
export {
  RequestQueue,
  RateLimiter,
  RequestDeduplicator,
  RequestBatcher,
  requestQueue,
  rateLimiter,
  requestDeduplicator,
  requestBatcher
} from './requestQueue.js';
export {
  PerformanceMonitor,
  performanceMonitor
} from './performanceMonitor.js';
