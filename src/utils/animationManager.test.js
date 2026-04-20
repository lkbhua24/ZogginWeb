import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { animationManager, useAnimation } from './animationManager.js';

describe('animationManager', () => {
  beforeEach(() => {
    // Mock CSS.supports
    if (!window.CSS) {
      window.CSS = {};
    }
    window.CSS.supports = vi.fn(() => true);
    
    // Mock matchMedia
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
    
    // Mock ResizeObserver with proper function
    window.ResizeObserver = vi.fn(function() {
      return {
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn()
      };
    });

    // Reset animation manager
    animationManager.initialized = false;
    animationManager.styleElement = null;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (animationManager.styleElement && animationManager.styleElement.parentNode) {
      animationManager.styleElement.remove();
    }
  });

  describe('initialization', () => {
    it('should initialize with default settings', () => {
      animationManager.init(true, 'normal');
      expect(animationManager.initialized).toBe(true);
      expect(animationManager.enabled.value).toBe(true);
      expect(animationManager.speed.value).toBe('normal');
    });

    it('should create style element', () => {
      animationManager.init(true, 'normal');
      expect(animationManager.styleElement).not.toBeNull();
      expect(animationManager.styleElement.id).toBe('animation-manager-styles');
    });

    it('should not reinitialize if already initialized', () => {
      animationManager.init(true, 'normal');
      const firstStyle = animationManager.styleElement;
      animationManager.init(false, 'fast');
      expect(animationManager.styleElement).toBe(firstStyle);
    });
  });

  describe('animation settings', () => {
    beforeEach(() => {
      animationManager.init(true, 'normal');
    });

    it('should apply CSS variables when enabled', () => {
      animationManager.applyAnimationSettings();
      const css = animationManager.styleElement.textContent;
      expect(css).toContain('--anim-duration-fast');
      expect(css).toContain('--anim-duration-normal');
      expect(css).toContain('--anim-easing-smooth');
    });

    it('should disable animations when set to false', () => {
      animationManager.disableAnimations();
      const css = animationManager.styleElement.textContent;
      expect(css).toContain('animation-duration: 0.001ms');
      expect(css).toContain('transition-duration: 0.001ms');
    });

    it('should add/remove classes on document element', () => {
      animationManager.enableAnimations();
      expect(document.documentElement.classList.contains('animations-enabled')).toBe(true);
      animationManager.disableAnimations();
      expect(document.documentElement.classList.contains('animations-disabled')).toBe(true);
    });
  });

  describe('speed settings', () => {
    beforeEach(() => {
      animationManager.init(true, 'normal');
    });

    it('should get correct duration for normal speed', () => {
      animationManager.setSpeed('normal');
      expect(animationManager.getDuration()).toBe(300);
    });

    it('should get correct duration for fast speed', () => {
      animationManager.setSpeed('fast');
      expect(animationManager.getDuration()).toBe(180);
    });

    it('should get correct duration for slow speed', () => {
      animationManager.setSpeed('slow');
      expect(animationManager.getDuration()).toBe(450);
    });

    it('should update transition duration string', () => {
      animationManager.setSpeed('fast');
      expect(animationManager.getTransitionDuration()).toBe('180ms');
    });

    it('should return 0 when animations disabled', () => {
      animationManager.disableAnimations();
      expect(animationManager.getDuration()).toBe(0);
    });
  });

  describe('transition config', () => {
    beforeEach(() => {
      animationManager.init(true, 'normal');
    });

    it('should create transition config with correct classes', () => {
      const config = animationManager.createTransitionConfig();
      expect(config.enterActiveClass).toBe('anim-enter-active');
      expect(config.leaveActiveClass).toBe('anim-leave-active');
      expect(config.enterFromClass).toBe('anim-enter-from');
      expect(config.leaveToClass).toBe('anim-leave-to');
      expect(config.duration).toBe(300);
    });

    it('should create empty classes when disabled', () => {
      animationManager.disableAnimations();
      const config = animationManager.createTransitionConfig();
      expect(config.enterActiveClass).toBe('');
      expect(config.leaveActiveClass).toBe('');
      expect(config.duration).toBe(0);
    });

    it('should accept custom transition options', () => {
      const config = animationManager.createTransitionConfig({
        enterClass: 'custom-enter',
        enterFromClass: 'custom-from'
      });
      expect(config.enterActiveClass).toBe('custom-enter');
      expect(config.enterFromClass).toBe('custom-from');
    });
  });

  describe('requestAnimation', () => {
    beforeEach(() => {
      animationManager.init(true, 'normal');
    });

    it('should execute callback when animations enabled', () => {
      return new Promise((resolve) => {
        animationManager.requestAnimation(() => {
          expect(true).toBe(true);
          resolve();
        });
      });
    });

    it('should execute callback immediately when disabled', () => {
      animationManager.disableAnimations();
      let executed = false;
      animationManager.requestAnimation(() => {
        executed = true;
      });
      expect(executed).toBe(true);
    });
  });

  describe('observeResize', () => {
    beforeEach(() => {
      animationManager.init(true, 'normal');
    });

    it('should return null for invalid arguments', () => {
      expect(animationManager.observeResize(null, () => {})).toBeNull();
      expect(animationManager.observeResize({}, null)).toBeNull();
    });

    it('should create ResizeObserver', () => {
      const element = document.createElement('div');
      const observer = animationManager.observeResize(element, () => {});
      expect(observer).not.toBeNull();
      expect(observer.observe).toBeDefined();
    });
  });

  describe('destroy', () => {
    it('should cleanup style element', () => {
      animationManager.init(true, 'normal');
      animationManager.destroy();
      expect(animationManager.styleElement).toBeNull();
      expect(animationManager.initialized).toBe(false);
    });
  });

  describe('prefers-reduced-motion', () => {
    it('should respect system preference', () => {
      window.matchMedia = vi.fn((query) => {
        if (query.includes('prefers-reduced-motion')) {
          return {
            matches: true,
            media: query,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn()
          };
        }
        return {
          matches: false,
          addEventListener: vi.fn()
        };
      });
      
      animationManager.init(true, 'normal');
      expect(animationManager.enabled.value).toBe(false);
    });
  });
});
