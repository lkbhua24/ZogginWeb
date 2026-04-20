import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  BREAKPOINTS,
  SCREEN_SIZE,
  getScreenSize,
  isSmallScreen,
  isLaptop,
  isDesktop,
  getResponsiveFontSize,
  getResponsiveSpacing,
  CARD_SIZE_CONFIG
} from './responsive.js';

describe('响应式设计 - 多屏幕适配', () => {
  describe('断点定义', () => {
    it('should define correct breakpoint values', () => {
      expect(BREAKPOINTS.mobile).toBe(768);
      expect(BREAKPOINTS.tablet).toBe(992);
      expect(BREAKPOINTS.laptop).toBe(1366);
      expect(BREAKPOINTS.laptopL).toBe(1440);
      expect(BREAKPOINTS.desktop).toBe(1920);
      expect(BREAKPOINTS.desktopL).toBe(2560);
    });

    it('should have ascending breakpoint values', () => {
      const values = Object.values(BREAKPOINTS);
      for (let i = 1; i < values.length; i++) {
        expect(values[i]).toBeGreaterThan(values[i - 1]);
      }
    });
  });

  describe('屏幕尺寸分类', () => {
    it('should have all screen size constants', () => {
      expect(SCREEN_SIZE.MOBILE).toBe('mobile');
      expect(SCREEN_SIZE.TABLET).toBe('tablet');
      expect(SCREEN_SIZE.LAPTOP).toBe('laptop');
      expect(SCREEN_SIZE.LAPTOP_L).toBe('laptopL');
      expect(SCREEN_SIZE.DESKTOP).toBe('desktop');
      expect(SCREEN_SIZE.DESKTOP_L).toBe('desktopL');
    });
  });

  describe('屏幕尺寸检测', () => {
    it('should classify mobile screen (< 768px)', () => {
      expect(getScreenSize(375)).toBe(SCREEN_SIZE.MOBILE);
      expect(getScreenSize(767)).toBe(SCREEN_SIZE.MOBILE);
    });

    it('should classify tablet screen (768px - 991px)', () => {
      expect(getScreenSize(768)).toBe(SCREEN_SIZE.TABLET);
      expect(getScreenSize(991)).toBe(SCREEN_SIZE.TABLET);
    });

    it('should classify laptop screen (992px - 1365px)', () => {
      expect(getScreenSize(992)).toBe(SCREEN_SIZE.LAPTOP);
      expect(getScreenSize(1365)).toBe(SCREEN_SIZE.LAPTOP);
    });

    it('should classify large laptop screen (1366px - 1439px)', () => {
      expect(getScreenSize(1366)).toBe(SCREEN_SIZE.LAPTOP_L);
      expect(getScreenSize(1439)).toBe(SCREEN_SIZE.LAPTOP_L);
    });

    it('should classify desktop screen (1440px - 1919px)', () => {
      expect(getScreenSize(1440)).toBe(SCREEN_SIZE.DESKTOP);
      expect(getScreenSize(1919)).toBe(SCREEN_SIZE.DESKTOP);
    });

    it('should classify large desktop screen (1920px+)', () => {
      expect(getScreenSize(1920)).toBe(SCREEN_SIZE.DESKTOP_L);
      expect(getScreenSize(2560)).toBe(SCREEN_SIZE.DESKTOP_L);
      expect(getScreenSize(3840)).toBe(SCREEN_SIZE.DESKTOP_L);
    });
  });

  describe('设备类型检测', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920
      });
    });

    it('should identify small screen correctly', () => {
      window.innerWidth = 800;
      expect(isSmallScreen()).toBe(true);
    });

    it('should identify laptop correctly', () => {
      window.innerWidth = 1400;
      expect(isLaptop()).toBe(true);
    });

    it('should identify desktop correctly', () => {
      window.innerWidth = 2000;
      expect(isDesktop()).toBe(true);
    });
  });

  describe('响应式字体计算', () => {
    it('should scale down font for mobile', () => {
      const fontSize = getResponsiveFontSize(16, 400);
      expect(fontSize).toBe(16 * 0.85);
    });

    it('should scale down font for tablet', () => {
      const fontSize = getResponsiveFontSize(16, 1000);
      expect(fontSize).toBe(16 * 0.9);
    });

    it('should slightly scale down font for laptop', () => {
      const fontSize = getResponsiveFontSize(16, 1400);
      expect(fontSize).toBe(16 * 0.95);
    });

    it('should keep base font for large laptop', () => {
      const fontSize = getResponsiveFontSize(16, 1500);
      expect(fontSize).toBe(16 * 1);
    });

    it('should scale up font for desktop', () => {
      const fontSize = getResponsiveFontSize(16, 2000);
      expect(fontSize).toBe(16 * 1.1);
    });

    it('should scale up more for large desktop', () => {
      const fontSize = getResponsiveFontSize(16, 3000);
      expect(fontSize).toBe(16 * 1.2);
    });
  });

  describe('响应式间距计算', () => {
    it('should scale down spacing for mobile', () => {
      const spacing = getResponsiveSpacing(16, 400);
      expect(spacing).toBe(16 * 0.7);
    });

    it('should scale down spacing for tablet', () => {
      const spacing = getResponsiveSpacing(16, 1000);
      expect(spacing).toBe(16 * 0.8);
    });

    it('should slightly scale down spacing for laptop', () => {
      const spacing = getResponsiveSpacing(16, 1400);
      expect(spacing).toBe(16 * 0.9);
    });

    it('should keep base spacing for large laptop', () => {
      const spacing = getResponsiveSpacing(16, 1500);
      expect(spacing).toBe(16 * 1);
    });

    it('should scale up spacing for desktop', () => {
      const spacing = getResponsiveSpacing(16, 2000);
      expect(spacing).toBe(16 * 1.15);
    });

    it('should scale up more for large desktop', () => {
      const spacing = getResponsiveSpacing(16, 3000);
      expect(spacing).toBe(16 * 1.3);
    });
  });

  describe('卡片尺寸配置', () => {
    it('should have small card size config', () => {
      expect(CARD_SIZE_CONFIG.small).toBeDefined();
      expect(CARD_SIZE_CONFIG.small.width).toBeDefined();
      expect(CARD_SIZE_CONFIG.small.fontSize).toBeDefined();
    });

    it('should have medium card size config', () => {
      expect(CARD_SIZE_CONFIG.medium).toBeDefined();
      expect(CARD_SIZE_CONFIG.medium.width).toBeDefined();
      expect(CARD_SIZE_CONFIG.medium.fontSize).toBeDefined();
    });

    it('should have large card size config', () => {
      expect(CARD_SIZE_CONFIG.large).toBeDefined();
      expect(CARD_SIZE_CONFIG.large.width).toBeDefined();
      expect(CARD_SIZE_CONFIG.large.fontSize).toBeDefined();
    });

    it('should have width config for each screen size in small', () => {
      const smallConfig = CARD_SIZE_CONFIG.small;
      expect(smallConfig.width.mobile).toBeDefined();
      expect(smallConfig.width.tablet).toBeDefined();
      expect(smallConfig.width.laptop).toBeDefined();
      expect(smallConfig.width.desktop).toBeDefined();
    });

    it('should have width config for each screen size in medium', () => {
      const mediumConfig = CARD_SIZE_CONFIG.medium;
      expect(mediumConfig.width.mobile).toBeDefined();
      expect(mediumConfig.width.tablet).toBeDefined();
      expect(mediumConfig.width.laptop).toBeDefined();
      expect(mediumConfig.width.desktop).toBeDefined();
    });

    it('should have width config for each screen size in large', () => {
      const largeConfig = CARD_SIZE_CONFIG.large;
      expect(largeConfig.width.mobile).toBeDefined();
      expect(largeConfig.width.tablet).toBeDefined();
      expect(largeConfig.width.laptop).toBeDefined();
      expect(largeConfig.width.desktop).toBeDefined();
    });
  });

  describe('边缘情况处理', () => {
    it('should handle exact breakpoint values', () => {
      expect(getScreenSize(768)).toBe(SCREEN_SIZE.TABLET);
      expect(getScreenSize(992)).toBe(SCREEN_SIZE.LAPTOP);
      expect(getScreenSize(1366)).toBe(SCREEN_SIZE.LAPTOP_L);
      expect(getScreenSize(1440)).toBe(SCREEN_SIZE.DESKTOP);
      expect(getScreenSize(1920)).toBe(SCREEN_SIZE.DESKTOP_L);
    });

    it('should handle very small screens', () => {
      expect(getScreenSize(320)).toBe(SCREEN_SIZE.MOBILE);
    });

    it('should handle very large screens', () => {
      expect(getScreenSize(5120)).toBe(SCREEN_SIZE.DESKTOP_L);
    });
  });
});
