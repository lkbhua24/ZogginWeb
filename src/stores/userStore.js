import { defineStore } from 'pinia';
import storage from '../utils/storage';

const USER_CONFIG_KEY = 'zoggin_user_config';
const USER_PROFILE_KEY = 'zoggin_user_profile';
const STUDY_PLAN_KEY = 'zoggin_study_plan';
const LOGIN_STATE_KEY = 'zoggin_is_logged_in';

const DEFAULT_CONFIG = {
  theme: 'light', // light, dark, eye-care
  language: 'zh-CN',
  dailyGoal: 10,
  dailyNewWords: 30,
  dailyReviewLimit: 50,
  examDate: '',
  defaultMode: 'card',
  autoPlayAudio: true,
  reviewMode: 'standard',
  notifications: true,
  reminderTime: '09:00',
  browserNotification: false,
  sound: true,
  // 导航设置
  navDisplayMode: 'auto', // fixed, auto
  navHoverDelay: 3000, // 唤出延迟（毫秒）
  navOpacity: 85, // 导航栏透明度（%）
  // 学习设置
  cardSize: 'medium', // small, medium, large
  fontSize: 'medium', // small, medium, large
  // 动效设置
  enableAnimations: true, // 是否启用动效
  animationSpeed: 'normal', // slow, normal, fast
  // 快捷键设置
  shortcuts: {
    navToggle: 'Ctrl+B',
    navLogoutConfirm: 'Ctrl+Shift+Q',
    studyFlip: 'Space',
    studyResponseForget: '1',
    studyResponseVague: '2',
    studyResponseKnow: '3',
    studyFullscreen: 'F',
    studyExit: 'Escape'
  }
};

const DEFAULT_STUDY_PLAN = {
  dailyNewWords: 30,
  dailyReviewLimit: 50,
  examDate: '',
  mode: 'card',
  reviewMode: 'standard',
  createdAt: null,
  updatedAt: null
};

export const useUserStore = defineStore('user', {
  state: () => ({
    isLoggedIn: localStorage.getItem(LOGIN_STATE_KEY) === 'true',
    userProfile: null,
    studyPlan: null,
    config: { ...DEFAULT_CONFIG }
  }),

  getters: {
    getConfig: (state) => (key) => {
      return key ? state.config[key] : state.config;
    },
    userName: (state) => state.userProfile?.name || '学习者',
    studyDays: (state) => {
      if (!state.userProfile?.createdAt) return 0;
      const start = new Date(state.userProfile.createdAt);
      const now = new Date();
      return Math.floor((now - start) / (1000 * 60 * 60 * 24));
    }
  },

  actions: {
    async login() {
      let profile = await storage.get(USER_PROFILE_KEY);
      if (!profile) {
        profile = {
          id: 'local_' + Date.now(),
          name: '学习者',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        };
        await storage.set(USER_PROFILE_KEY, profile);
      } else {
        profile.lastLoginAt = new Date().toISOString();
        await storage.set(USER_PROFILE_KEY, profile);
      }

      this.userProfile = profile;
      this.isLoggedIn = true;
      localStorage.setItem(LOGIN_STATE_KEY, 'true');

      await Promise.all([
        this.loadConfig(),
        this.loadPlan()
      ]);
    },

    async logout() {
      this.isLoggedIn = false;
      this.userProfile = null;
      this.studyPlan = null;
      this.config = { ...DEFAULT_CONFIG };
      localStorage.setItem(LOGIN_STATE_KEY, 'false');
    },

    async loadPlan() {
      const plan = await storage.get(STUDY_PLAN_KEY);
      if (plan) {
        this.studyPlan = plan;
      } else {
        this.studyPlan = {
          ...DEFAULT_STUDY_PLAN,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await storage.set(STUDY_PLAN_KEY, this.studyPlan);
      }
    },

    async updatePlan(updates) {
      if (!this.studyPlan) {
        this.studyPlan = {
          ...DEFAULT_STUDY_PLAN,
          createdAt: new Date().toISOString()
        };
      }
      this.studyPlan = {
        ...this.studyPlan,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      await storage.set(STUDY_PLAN_KEY, this.studyPlan);
      return this.studyPlan;
    },

    async updateProfile(updates) {
      if (!this.userProfile) return;
      this.userProfile = { ...this.userProfile, ...updates };
      await storage.set(USER_PROFILE_KEY, this.userProfile);
      return this.userProfile;
    },

    async loadConfig() {
      const config = await storage.get(USER_CONFIG_KEY);
      if (config) {
        this.config = { ...this.config, ...config };
      }
    },

    async updateConfig(updates) {
      this.config = { ...this.config, ...updates };
      await this.saveConfig();
      return this.config;
    },

    async saveConfig() {
      await storage.set(USER_CONFIG_KEY, this.config);
    },

    async resetConfig() {
      this.config = { ...DEFAULT_CONFIG };
      await this.saveConfig();
      return this.config;
    },

    async exportData() {
      try {
        const data = await storage.exportData();
        return data;
      } catch (error) {
        console.error('Error exporting data:', error);
        return null;
      }
    },

    async importData(data) {
      try {
        const success = await storage.importData(data);
        if (success) {
          await Promise.all([
            this.loadConfig(),
            this.loadPlan()
          ]);
          const profile = await storage.get(USER_PROFILE_KEY);
          if (profile) {
            this.userProfile = profile;
          }
        }
        return success;
      } catch (error) {
        console.error('Error importing data:', error);
        return false;
      }
    },

    async clearAllData() {
      try {
        await storage.clear();
        this.config = { ...DEFAULT_CONFIG };
        this.userProfile = null;
        this.studyPlan = null;
        this.isLoggedIn = false;
        localStorage.setItem(LOGIN_STATE_KEY, 'false');
        return true;
      } catch (error) {
        console.error('Error clearing all data:', error);
        return false;
      }
    }
  }
});
