import { ApiResponse, handleApiError } from '../response.js';
import { statsService } from '../services/statsService.js';

class StatsController {
  async getTodayStudyDuration() {
    try {
      const data = await statsService.getTodayStudyDuration();
      return ApiResponse.success(data, '获取今日学习时长成功');
    } catch (error) {
      return handleApiError(error);
    }
  }

  async getTodayWordsStudied() {
    try {
      const data = await statsService.getTodayWordsStudied();
      return ApiResponse.success(data, '获取今日已背单词数成功');
    } catch (error) {
      return handleApiError(error);
    }
  }

  async getTodayStats() {
    try {
      const data = await statsService.getTodayStats();
      return ApiResponse.success(data, '获取今日学习统计成功');
    } catch (error) {
      return handleApiError(error);
    }
  }

  getPerformanceMetrics() {
    return statsService.getPerformanceMetrics();
  }

  clearCache() {
    statsService.clearCache();
    return ApiResponse.success(null, '缓存已清除');
  }
}

export const statsController = new StatsController();
