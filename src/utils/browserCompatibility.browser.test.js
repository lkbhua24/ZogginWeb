import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  detectBrowser,
  isBrowserSupported,
  FeatureSupport,
  getCompatibilityReport,
  applyCompatibilityFixes,
  FullscreenAPI,
  normalizeKeyboardEvent,
  isMac,
  getShortcutText
} from './browserCompatibility.js';

describe('浏览器兼容性 - 主流浏览器检测', () => {
  beforeEach(() => {
    if (!window.matchMedia) {
      window.matchMedia = vi.fn((query) => ({
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
    if (!window.CSS || !window.CSS.supports) {
      window.CSS = window.CSS || {};
      window.CSS.supports = vi.fn(() => true);
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Chrome 浏览器检测', () => {
    it('should detect Chrome browser', () => {
      const originalUserAgent = navigator.userAgent;
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        configurable: true
      });

      const browser = detectBrowser();
      expect(browser.browser).toBe('chrome');
      expect(browser.engine).toBe('blink');

      Object.defineProperty(navigator, 'userAgent', {
        value: originalUserAgent,
        configurable: true
      });
    });
  });

  describe('Edge 浏览器检测', () => {
    it('should detect Edge browser', () => {
      const originalUserAgent = navigator.userAgent;
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
        configurable: true
      });

      const browser = detectBrowser();
      expect(browser.browser).toBe('edge');
      expect(browser.engine).toBe('blink');

      Object.defineProperty(navigator, 'userAgent', {
        value: originalUserAgent,
        configurable: true
      });
    });
  });

  describe('Firefox 浏览器检测', () => {
    it('should detect Firefox browser', () => {
      const originalUserAgent = navigator.userAgent;
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
        configurable: true
      });

      const browser = detectBrowser();
      expect(browser.browser).toBe('firefox');
      expect(browser.engine).toBe('gecko');

      Object.defineProperty(navigator, 'userAgent', {
        value: originalUserAgent,
        configurable: true
      });
    });
  });

  describe('Safari 浏览器检测', () => {
    it('should detect Safari browser', () => {
      const originalUserAgent = navigator.userAgent;
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
        configurable: true
      });

      const browser = detectBrowser();
      expect(browser.browser).toBe('safari');
      expect(browser.engine).toBe('webkit');

      Object.defineProperty(navigator, 'userAgent', {
        value: originalUserAgent,
        configurable: true
      });
    });
  });

  describe('浏览器支持检测', () => {
    it('should return supported status for modern browsers', () => {
      const supported = isBrowserSupported();
      expect(typeof supported).toBe('boolean');
    });

    it('should include version in compatibility report', () => {
      const report = getCompatibilityReport();
      expect(report.browser).toHaveProperty('version');
    });
  });
});
