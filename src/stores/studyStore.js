import { defineStore } from 'pinia';
import storage from '../utils/storage';

const STUDY_LOG_KEY = 'zoggin_study_logs';

export const useStudyStore = defineStore('study', {
  state: () => ({
    logs: []
  }),

  getters: {
    getLogsByDate: (state) => (date) => {
      return state.logs.filter(log => log.date.startsWith(date));
    },
    getLogsBySessionType: (state) => (sessionType) => {
      return state.logs.filter(log => log.sessionType === sessionType);
    },
    getRecentLogs: (state) => (days = 7) => {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      return state.logs.filter(log => new Date(log.date) >= cutoffDate);
    },
    getStats: (state) => {
      const totalSessions = state.logs.length;
      const totalWords = state.logs.reduce((sum, log) => sum + log.wordsStudied.length, 0);
      const totalDuration = state.logs.reduce((sum, log) => sum + log.duration, 0);
      const averageAccuracy = state.logs.length > 0
        ? state.logs.reduce((sum, log) => sum + log.accuracy, 0) / state.logs.length
        : 0;

      return {
        totalSessions,
        totalWords,
        totalDuration,
        averageAccuracy
      };
    }
  },

  actions: {
    async loadLogs() {
      const logs = await storage.get(STUDY_LOG_KEY);
      if (logs) {
        this.logs = logs;
      }
    },

    async addStudyLog(logData) {
      const newLog = {
        id: Date.now().toString(),
        date: logData.date || new Date().toISOString(),
        sessionType: logData.sessionType,
        wordsStudied: logData.wordsStudied || [],
        duration: logData.duration || 0,
        accuracy: logData.accuracy || 0
      };

      this.logs.push(newLog);
      await this.saveLogs();
      return newLog;
    },

    async saveLogs() {
      await storage.set(STUDY_LOG_KEY, this.logs);
    },

    async deleteLog(id) {
      const index = this.logs.findIndex(log => log.id === id);
      if (index !== -1) {
        this.logs.splice(index, 1);
        await this.saveLogs();
        return true;
      }
      return false;
    },

    async getLogsByDateRange(startDate, endDate) {
      return this.logs.filter(log => {
        const logDate = new Date(log.date);
        return logDate >= startDate && logDate <= endDate;
      });
    },

    async getAverageSessionDuration() {
      if (this.logs.length === 0) return 0;
      const totalDuration = this.logs.reduce((sum, log) => sum + log.duration, 0);
      return totalDuration / this.logs.length;
    }
  }
});