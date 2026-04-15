import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getDailySeed,
  selectBySeed,
  generateTodayPalette,
  generateGradient,
  getThemeDisplayName,
  isLightColor,
  palettes
} from './colorEngine.js';

describe('colorEngine', () => {
  describe('getDailySeed', () => {
    it('should return a number based on current date', () => {
      const seed = getDailySeed();
      expect(typeof seed).toBe('number');
      expect(seed).toBeGreaterThan(0);
    });

    it('should return same seed for same date', () => {
      const seed1 = getDailySeed();
      const seed2 = getDailySeed();
      expect(seed1).toBe(seed2);
    });

    it('should follow the formula year*10000 + month*100 + day', () => {
      const mockDate = new Date(2026, 3, 9);
      vi.useFakeTimers();
      vi.setSystemTime(mockDate);

      const seed = getDailySeed();
      expect(seed).toBe(2026 * 10000 + 4 * 100 + 9);

      vi.useRealTimers();
    });
  });

  describe('selectBySeed', () => {
    it('should select specified count of elements', () => {
      const array = [1, 2, 3, 4, 5];
      const result = selectBySeed(array, 12345, 3);
      expect(result.length).toBe(3);
    });

    it('should return unique elements', () => {
      const array = [1, 2, 3, 4, 5];
      const result = selectBySeed(array, 12345, 3);
      const unique = [...new Set(result)];
      expect(unique.length).toBe(result.length);
    });

    it('should be deterministic - same seed produces same result', () => {
      const array = ['a', 'b', 'c', 'd', 'e'];
      const result1 = selectBySeed(array, 999, 2);
      const result2 = selectBySeed(array, 999, 2);
      expect(result1).toEqual(result2);
    });

    it('should produce different results for different seeds', () => {
      const array = ['a', 'b', 'c', 'd', 'e'];
      const result1 = selectBySeed(array, 100, 2);
      const result2 = selectBySeed(array, 200, 2);
      expect(result1).not.toEqual(result2);
    });

    it('should handle count larger than array length', () => {
      const array = [1, 2, 3];
      const result = selectBySeed(array, 123, 10);
      expect(result.length).toBe(3);
    });
  });

  describe('generateTodayPalette', () => {
    it('should return palette object with all required properties', () => {
      const palette = generateTodayPalette();
      expect(palette).toHaveProperty('base');
      expect(palette).toHaveProperty('mid');
      expect(palette).toHaveProperty('highlight');
      expect(palette).toHaveProperty('accent1');
      expect(palette).toHaveProperty('accent2');
      expect(palette).toHaveProperty('themeName');
      expect(palette).toHaveProperty('seed');
    });

    it('should return valid theme name', () => {
      const palette = generateTodayPalette();
      expect(['warm', 'cool', 'nature']).toContain(palette.themeName);
    });

    it('should return hex color strings', () => {
      const palette = generateTodayPalette();
      expect(palette.base).toMatch(/^#[A-Fa-f0-9]{6}$/);
      expect(palette.mid).toMatch(/^#[A-Fa-f0-9]{6}$/);
      expect(palette.highlight).toMatch(/^#[A-Fa-f0-9]{6}$/);
    });

    it('should be deterministic for same date', () => {
      const palette1 = generateTodayPalette();
      const palette2 = generateTodayPalette();
      expect(palette1).toEqual(palette2);
    });

    it('should select primary colors from the correct theme', () => {
      vi.useFakeTimers();
      
      vi.setSystemTime(new Date(2026, 0, 1));
      let palette = generateTodayPalette();
      let expectedTheme = ['warm', 'cool', 'nature'][20260101 % 3];
      expect(palette.themeName).toBe(expectedTheme);

      vi.setSystemTime(new Date(2026, 0, 2));
      palette = generateTodayPalette();
      expectedTheme = ['warm', 'cool', 'nature'][20260102 % 3];
      expect(palette.themeName).toBe(expectedTheme);

      vi.useRealTimers();
    });
  });

  describe('generateGradient', () => {
    it('should return a CSS string', () => {
      const palette = {
        base: '#F0EEDA',
        mid: '#F0EADF',
        highlight: '#EAE3B2',
        accent1: '#87DFE4',
        accent2: '#DAE6DB'
      };
      const gradient = generateGradient(palette);
      expect(typeof gradient).toBe('string');
      expect(gradient).toContain('linear-gradient');
      expect(gradient).toContain('radial-gradient');
    });

    it('should contain base, mid, highlight colors', () => {
      const palette = {
        base: '#F0EEDA',
        mid: '#F0EADF',
        highlight: '#EAE3B2'
      };
      const gradient = generateGradient(palette);
      expect(gradient).toContain('#F0EEDA');
      expect(gradient).toContain('#F0EADF');
      expect(gradient).toContain('#EAE3B2');
    });

    it('should include accent colors when provided', () => {
      const palette = {
        base: '#F0EEDA',
        mid: '#F0EADF',
        highlight: '#EAE3B2',
        accent1: '#87DFE4',
        accent2: '#DAE6DB'
      };
      const gradient = generateGradient(palette);
      expect(gradient).toContain('rgba(135, 223, 228, 0.15)');
      expect(gradient).toContain('rgba(218, 230, 219, 0.15)');
    });
  });

  describe('getThemeDisplayName', () => {
    it('should return correct Chinese names', () => {
      expect(getThemeDisplayName('warm')).toBe('今日晨曦');
      expect(getThemeDisplayName('cool')).toBe('今日深海');
      expect(getThemeDisplayName('nature')).toBe('今日森林');
    });

    it('should return default for unknown theme', () => {
      expect(getThemeDisplayName('unknown')).toBe('未知主题');
    });
  });

  describe('isLightColor', () => {
    it('should return true for light colors', () => {
      expect(isLightColor('#FFFFFF')).toBe(true);
      expect(isLightColor('#F0EEDA')).toBe(true);
      expect(isLightColor('#FFFF00')).toBe(true);
    });

    it('should return false for dark colors', () => {
      expect(isLightColor('#000000')).toBe(false);
      expect(isLightColor('#333333')).toBe(false);
      expect(isLightColor('#000080')).toBe(false);
    });

    it('should use YIQ formula correctly', () => {
      expect(isLightColor('#808080')).toBe(false);
      expect(isLightColor('#818181')).toBe(true);
      expect(isLightColor('#909090')).toBe(true);
    });
  });

  describe('color palettes', () => {
    it('should have correct number of colors in each palette', () => {
      expect(palettes.warm.length).toBe(9);
      expect(palettes.cool.length).toBe(9);
      expect(palettes.nature.length).toBe(9);
    });

    it('should have valid hex colors', () => {
      const allColors = [...palettes.warm, ...palettes.cool, ...palettes.nature];
      allColors.forEach(color => {
        expect(color).toMatch(/^#[A-Fa-f0-9]{6}$/);
      });
    });
  });

  describe('integration test - daily consistency', () => {
    it('should produce identical palettes for the same date across multiple calls', () => {
      const palettes_results = [];
      for (let i = 0; i < 5; i++) {
        palettes_results.push(generateTodayPalette());
      }
      
      palettes_results.forEach(p => {
        expect(p).toEqual(palettes_results[0]);
      });
    });

    it('should produce different palettes for different dates', () => {
      vi.useFakeTimers();

      vi.setSystemTime(new Date(2026, 0, 1));
      const palette1 = generateTodayPalette();

      vi.setSystemTime(new Date(2026, 0, 2));
      const palette2 = generateTodayPalette();

      expect(palette1.seed).not.toBe(palette2.seed);

      vi.useRealTimers();
    });
  });
});
