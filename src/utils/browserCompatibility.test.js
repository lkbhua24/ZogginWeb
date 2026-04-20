import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  detectBrowser,
  isBrowserSupported,
  FeatureSupport,
  getCompatibilityReport,
  applyCompatibilityFixes,
  FullscreenAPI,
  SpeechAPI,
  normalizeKeyboardEvent,
  isMac,
  getShortcutText
} from './browserCompatibility.js';

describe('browserCompatibility', () => {
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

  describe('detectBrowser', () => {
    it('should return browser info object', () => {
      const browser = detectBrowser();
      expect(browser).toHaveProperty('browser');
      expect(browser).toHaveProperty('version');
      expect(browser).toHaveProperty('engine');
    });
  });

  describe('isBrowserSupported', () => {
    it('should return boolean', () => {
      const supported = isBrowserSupported();
      expect(typeof supported).toBe('boolean');
    });
  });

  describe('FeatureSupport', () => {
    it('should have backdropFilter property', () => {
      expect(FeatureSupport).toHaveProperty('backdropFilter');
    });

    it('should have fullscreen property', () => {
      expect(FeatureSupport).toHaveProperty('fullscreen');
    });

    it('should have notifications property', () => {
      expect(FeatureSupport).toHaveProperty('notifications');
    });

    it('should have localStorage property', () => {
      expect(FeatureSupport).toHaveProperty('localStorage');
    });

    it('should have touch property', () => {
      expect(FeatureSupport).toHaveProperty('touch');
    });

    it('should have prefersReducedMotion property', () => {
      expect(FeatureSupport).toHaveProperty('prefersReducedMotion');
    });

    it('should have prefersDarkMode property', () => {
      expect(FeatureSupport).toHaveProperty('prefersDarkMode');
    });
  });

  describe('getCompatibilityReport', () => {
    it('should return comprehensive report object', () => {
      const report = getCompatibilityReport();
      expect(report).toHaveProperty('browser');
      expect(report).toHaveProperty('supported');
      expect(report).toHaveProperty('features');
      expect(report).toHaveProperty('issues');
      expect(report).toHaveProperty('warnings');
      expect(report).toHaveProperty('timestamp');
    });

    it('should include css, js, media, ui features', () => {
      const report = getCompatibilityReport();
      expect(report.features).toHaveProperty('css');
      expect(report.features).toHaveProperty('js');
      expect(report.features).toHaveProperty('media');
      expect(report.features).toHaveProperty('ui');
    });
  });

  describe('applyCompatibilityFixes', () => {
    it('should add browser class to document', () => {
      applyCompatibilityFixes();
      const browser = detectBrowser();
      expect(document.documentElement.classList.contains(`browser-${browser.browser}`)).toBe(true);
    });

    it('should add engine class to document', () => {
      applyCompatibilityFixes();
      const browser = detectBrowser();
      expect(document.documentElement.classList.contains(`engine-${browser.engine}`)).toBe(true);
    });
  });

  describe('FullscreenAPI', () => {
    it('should have isEnabled property', () => {
      expect(FullscreenAPI).toHaveProperty('isEnabled');
    });

    it('should have isFullscreen property', () => {
      expect(FullscreenAPI).toHaveProperty('isFullscreen');
    });

    it('should have enter method', () => {
      expect(FullscreenAPI).toHaveProperty('enter');
      expect(typeof FullscreenAPI.enter).toBe('function');
    });

    it('should have exit method', () => {
      expect(FullscreenAPI).toHaveProperty('exit');
      expect(typeof FullscreenAPI.exit).toBe('function');
    });

    it('should have toggle method', () => {
      expect(FullscreenAPI).toHaveProperty('toggle');
      expect(typeof FullscreenAPI.toggle).toBe('function');
    });
  });

  describe('SpeechAPI', () => {
    it('should have isSupported property', () => {
      expect(SpeechAPI).toHaveProperty('isSupported');
    });

    it('should have speak method', () => {
      expect(SpeechAPI).toHaveProperty('speak');
      expect(typeof SpeechAPI.speak).toBe('function');
    });

    it('should have cancel method', () => {
      expect(SpeechAPI).toHaveProperty('cancel');
      expect(typeof SpeechAPI.cancel).toBe('function');
    });
  });

  describe('normalizeKeyboardEvent', () => {
    it('should normalize keyboard event with standard properties', () => {
      const mockEvent = {
        key: 'a',
        code: 'KeyA',
        ctrlKey: true,
        shiftKey: false,
        altKey: false,
        metaKey: false
      };
      const normalized = normalizeKeyboardEvent(mockEvent);
      expect(normalized).toHaveProperty('key', 'a');
      expect(normalized).toHaveProperty('code', 'KeyA');
      expect(normalized).toHaveProperty('ctrlKey', true);
    });

    it('should handle Mac metaKey as ctrlKey', () => {
      const mockEvent = {
        key: 'c',
        code: 'KeyC',
        ctrlKey: false,
        shiftKey: false,
        altKey: false,
        metaKey: true
      };
      const normalized = normalizeKeyboardEvent(mockEvent);
      expect(normalized.ctrlKey).toBe(true);
    });
  });

  describe('isMac', () => {
    it('should return boolean', () => {
      const result = isMac();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('getShortcutText', () => {
    it('should return original text on Windows', () => {
      vi.spyOn(navigator, 'platform', 'get').mockReturnValue('WIN32');
      expect(getShortcutText('Ctrl+C')).toBe('Ctrl+C');
    });

    it('should convert Ctrl to ⌘ on Mac', () => {
      vi.spyOn(navigator, 'platform', 'get').mockReturnValue('MAC');
      expect(getShortcutText('Ctrl+C')).toBe('⌘+C');
    });

    it('should convert Alt to ⌥ on Mac', () => {
      vi.spyOn(navigator, 'platform', 'get').mockReturnValue('MAC');
      expect(getShortcutText('Alt+F4')).toBe('⌥+F4');
    });

    it('should convert Shift to ⇧ on Mac', () => {
      vi.spyOn(navigator, 'platform', 'get').mockReturnValue('MAC');
      expect(getShortcutText('Shift+A')).toBe('⇧+A');
    });
  });
});
