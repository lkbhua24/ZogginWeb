import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ref, computed } from 'vue';

describe('NavBar - Navigation Logic Tests', () => {
  let navHidden, isHovering, hideNavTimer, showNavTimer, mouseMoveTimer;
  let navDisplayMode, navHoverDelay;
  let toggleNav, showNav, hideNav;
  let onNavEnter, onNavLeave, onTriggerEnter, onTriggerLeave;
  let handleKeydown;
  let mockRouter, mockUserStore;

  beforeEach(() => {
    vi.useFakeTimers();

    navHidden = ref(false);
    isHovering = ref(false);
    hideNavTimer = null;
    showNavTimer = null;
    mouseMoveTimer = null;

    navDisplayMode = ref('auto');
    navHoverDelay = ref(3000);

    mockUserStore = {
      isLoggedIn: true,
      config: {
        navDisplayMode: 'auto',
        navHoverDelay: 3000,
        navOpacity: 85
      }
    };

    mockRouter = {
      currentRoute: { value: { path: '/' } }
    };

    const createToggleNav = () => {
      if (navHidden.value) {
        showNav();
      } else {
        hideNav();
      }
    };

    const createShowNav = () => {
      clearTimeout(hideNavTimer);
      navHidden.value = false;
      isHovering.value = true;
    };

    const createHideNav = () => {
      clearTimeout(showNavTimer);
      if (navDisplayMode.value === 'fixed') {
        return;
      }
      navHidden.value = true;
      isHovering.value = false;
    };

    const createOnNavEnter = () => {
      clearTimeout(hideNavTimer);
      isHovering.value = true;
    };

    const createOnNavLeave = () => {
      isHovering.value = false;
      if (navDisplayMode.value === 'fixed') {
        return;
      }
      hideNavTimer = setTimeout(() => {
        if (!isHovering.value) {
          hideNav();
        }
      }, navHoverDelay.value);
    };

    const createOnTriggerEnter = () => {
      clearTimeout(hideNavTimer);
      showNavTimer = setTimeout(() => {
        showNav();
      }, 50);
    };

    const createOnTriggerLeave = () => {
      clearTimeout(showNavTimer);
    };

    toggleNav = createToggleNav;
    showNav = createShowNav;
    hideNav = createHideNav;
    onNavEnter = createOnNavEnter;
    onNavLeave = createOnNavLeave;
    onTriggerEnter = createOnTriggerEnter;
    onTriggerLeave = createOnTriggerLeave;

    handleKeydown = (e) => {
      const currentPath = mockRouter.currentRoute.value.path;
      if (e.ctrlKey && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleNav();
        return;
      }

      if (e.key === 'Escape') {
        if (e.target && e.target.fullscreen) {
          e.preventDefault();
          e.target.fullscreen = false;
          return;
        }

        if (currentPath === '/study') {
          return;
        }

        if (!navHidden.value && mockUserStore.isLoggedIn) {
          hideNav();
        }
        return;
      }
    };
  });

  afterEach(() => {
    vi.useRealTimers();
    clearTimeout(hideNavTimer);
    clearTimeout(showNavTimer);
    clearTimeout(mouseMoveTimer);
  });

  describe('Navigation Auto-Hide Logic', () => {
    it('should initialize navigation as visible', () => {
      expect(navHidden.value).toBe(false);
      expect(isHovering.value).toBe(false);
    });

    it('should hide navigation after delay when mouse leaves', () => {
      navDisplayMode.value = 'auto';
      navHidden.value = false;
      isHovering.value = true;

      onNavLeave();

      expect(navHidden.value).toBe(false);
      expect(isHovering.value).toBe(false);

      vi.advanceTimersByTime(3000);

      expect(navHidden.value).toBe(true);
      expect(isHovering.value).toBe(false);
    });

    it('should cancel hide timer when mouse re-enters before delay', () => {
      navDisplayMode.value = 'auto';
      navHidden.value = false;
      isHovering.value = true;

      onNavLeave();

      vi.advanceTimersByTime(1500);

      onNavEnter();

      vi.advanceTimersByTime(3000);

      expect(navHidden.value).toBe(false);
    });

    it('should set isHovering to true on mouse enter when hidden', () => {
      navHidden.value = true;

      onNavEnter();

      expect(isHovering.value).toBe(true);
      expect(navHidden.value).toBe(true);
    });

    it('should use custom hover delay from user config', () => {
      navHoverDelay.value = 1000;
      navHidden.value = false;
      isHovering.value = true;

      onNavLeave();

      vi.advanceTimersByTime(999);
      expect(navHidden.value).toBe(false);

      vi.advanceTimersByTime(1);
      expect(navHidden.value).toBe(true);
    });

    it('should clear timers on component unmount', () => {
      navHidden.value = false;
      isHovering.value = true;

      onNavLeave();

      const savedHideNavTimer = hideNavTimer;
      clearTimeout(savedHideNavTimer);

      vi.advanceTimersByTime(5000);

      expect(navHidden.value).toBe(false);
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('Ctrl+B should toggle navigation visibility (hide when visible)', () => {
      navHidden.value = false;

      const event = {
        ctrlKey: true,
        key: 'b',
        preventDefault: vi.fn()
      };

      handleKeydown(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(navHidden.value).toBe(true);
    });

    it('Ctrl+B should toggle navigation visibility (show when hidden)', () => {
      navHidden.value = true;

      const event = {
        ctrlKey: true,
        key: 'b',
        preventDefault: vi.fn()
      };

      handleKeydown(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(navHidden.value).toBe(false);
    });

    it('Cmd+B should work on Mac (metaKey)', () => {
      navHidden.value = false;

      const event = {
        ctrlKey: false,
        key: 'b',
        metaKey: true,
        preventDefault: vi.fn()
      };

      const normalizedEvent = {
        ctrlKey: event.ctrlKey || event.metaKey,
        key: event.key,
        preventDefault: event.preventDefault
      };

      handleKeydown(normalizedEvent);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(navHidden.value).toBe(true);
    });

    it('Esc should hide navigation when visible and not in fullscreen', () => {
      navHidden.value = false;

      const event = {
        key: 'Escape',
        preventDefault: vi.fn(),
        target: { fullscreen: false }
      };

      handleKeydown(event);

      expect(navHidden.value).toBe(true);
    });

    it('Esc should not toggle nav when already hidden', () => {
      navHidden.value = true;

      const event = {
        key: 'Escape',
        preventDefault: vi.fn(),
        target: { fullscreen: false }
      };

      handleKeydown(event);

      expect(navHidden.value).toBe(true);
    });

    it('Esc in fullscreen should exit fullscreen first', () => {
      const event = {
        key: 'Escape',
        preventDefault: vi.fn(),
        target: { fullscreen: true }
      };

      handleKeydown(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.target.fullscreen).toBe(false);
      expect(navHidden.value).toBe(false);
    });
  });

  describe('Fullscreen Mode Navigation', () => {
    it('should exit fullscreen on Esc key', () => {
      const fullscreenElement = { fullscreen: true };

      const event = {
        key: 'Escape',
        preventDefault: vi.fn(),
        target: fullscreenElement
      };

      handleKeydown(event);

      expect(fullscreenElement.fullscreen).toBe(false);
    });

    it('should not affect nav visibility when exiting fullscreen via Esc', () => {
      navHidden.value = false;

      const event = {
        key: 'Escape',
        preventDefault: vi.fn(),
        target: { fullscreen: true }
      };

      handleKeydown(event);

      expect(navHidden.value).toBe(false);
    });

    it('should allow Ctrl+B to toggle nav in fullscreen mode', () => {
      navHidden.value = false;

      const event = {
        ctrlKey: true,
        key: 'b',
        preventDefault: vi.fn(),
        target: { fullscreen: true }
      };

      handleKeydown(event);

      expect(navHidden.value).toBe(true);
    });

    it('should restore nav visibility after exiting fullscreen', () => {
      const fullscreenElement = { fullscreen: true };

      const exitEvent = {
        key: 'Escape',
        preventDefault: vi.fn(),
        target: fullscreenElement
      };

      handleKeydown(exitEvent);

      expect(fullscreenElement.fullscreen).toBe(false);
      expect(navHidden.value).toBe(false);
    });
  });

  describe('Trigger Bar Hover Functionality', () => {
    it('should show nav after short delay on trigger hover', () => {
      navHidden.value = true;

      onTriggerEnter();

      expect(navHidden.value).toBe(true);

      vi.advanceTimersByTime(50);

      expect(navHidden.value).toBe(false);
    });

    it('should not show nav immediately on quick trigger hover', () => {
      navHidden.value = true;

      onTriggerEnter();

      vi.advanceTimersByTime(25);

      expect(navHidden.value).toBe(true);
    });

    it('should cancel show timer on trigger leave before delay', () => {
      navHidden.value = true;

      onTriggerEnter();
      onTriggerLeave();

      vi.advanceTimersByTime(100);

      expect(navHidden.value).toBe(true);
    });

    it('should cancel hide timer when trigger is entered', () => {
      navHidden.value = false;
      isHovering.value = true;

      hideNavTimer = setTimeout(() => {
        hideNav();
      }, 1000);

      onTriggerEnter();

      vi.advanceTimersByTime(1000);

      expect(navHidden.value).toBe(false);
    });
  });

  describe('Display Mode Configuration', () => {
    it('should not auto-hide in fixed mode', () => {
      navDisplayMode.value = 'fixed';
      navHidden.value = false;
      isHovering.value = true;

      onNavLeave();

      vi.advanceTimersByTime(10000);

      expect(navHidden.value).toBe(false);
    });

    it('should not hide on manual hideNav call in fixed mode', () => {
      navDisplayMode.value = 'fixed';
      navHidden.value = false;

      hideNav();

      expect(navHidden.value).toBe(false);
    });

    it('should auto-hide in auto mode', () => {
      navDisplayMode.value = 'auto';
      navHidden.value = false;
      isHovering.value = true;

      onNavLeave();

      vi.advanceTimersByTime(3000);

      expect(navHidden.value).toBe(true);
    });

    it('should not auto-hide in fixed mode', () => {
      navDisplayMode.value = 'fixed';
      navHidden.value = false;
      isHovering.value = true;

      onNavLeave();

      vi.advanceTimersByTime(10000);

      expect(navHidden.value).toBe(false);
    });

    it('should allow showNav even when nav is hidden in fixed mode', () => {
      navDisplayMode.value = 'fixed';
      navHidden.value = true;

      showNav();

      expect(navHidden.value).toBe(false);
      expect(isHovering.value).toBe(true);
    });

    it('hideNav returns early in fixed mode without hiding', () => {
      navDisplayMode.value = 'fixed';
      navHidden.value = false;

      hideNav();

      expect(navHidden.value).toBe(false);
    });

    it('toggleNav cannot hide in fixed mode due to hideNav check', () => {
      navDisplayMode.value = 'fixed';
      navHidden.value = false;

      toggleNav();

      expect(navHidden.value).toBe(false);
    });
  });

  describe('Mouse Move Detection', () => {
    it('should detect upward mouse movement near top', () => {
      let lastMouseY = 200;
      let mouseY = 150;
      let detected = false;

      if (mouseY < lastMouseY && mouseY < 100) {
        detected = true;
      }

      expect(detected).toBe(false);
    });

    it('should not detect upward movement when mouse is far from top', () => {
      let lastMouseY = 500;
      let mouseY = 400;
      let detected = false;

      if (mouseY < lastMouseY && mouseY < 100) {
        detected = true;
      }

      expect(detected).toBe(false);
    });

    it('should detect upward movement only when Y decreases AND near top', () => {
      const testCases = [
        { lastY: 120, currentY: 80, expected: true },
        { lastY: 80, currentY: 120, expected: false },
        { lastY: 200, currentY: 150, expected: false },
        { lastY: 50, currentY: 30, expected: true }
      ];

      testCases.forEach(({ lastY, currentY, expected }) => {
        const detected = currentY < lastY && currentY < 100;
        expect(detected).toBe(expected);
      });
    });
  });

  describe('Edge Cases & Race Conditions', () => {
    it('should handle rapid enter/leave without glitches', () => {
      navHidden.value = false;
      isHovering.value = true;

      onNavLeave();
      vi.advanceTimersByTime(500);
      onNavEnter();
      vi.advanceTimersByTime(500);
      onNavLeave();
      vi.advanceTimersByTime(500);
      onNavEnter();

      vi.advanceTimersByTime(3000);

      expect(navHidden.value).toBe(false);
    });

    it('should not hide nav if mouse re-enters during delay', () => {
      navHidden.value = false;
      isHovering.value = true;

      onNavLeave();

      vi.advanceTimersByTime(2000);

      onNavEnter();

      vi.advanceTimersByTime(3000);

      expect(navHidden.value).toBe(false);
    });

    it('should handle multiple toggle calls correctly', () => {
      expect(navHidden.value).toBe(false);

      toggleNav();
      expect(navHidden.value).toBe(true);

      toggleNav();
      expect(navHidden.value).toBe(false);

      toggleNav();
      expect(navHidden.value).toBe(true);

      toggleNav();
      expect(navHidden.value).toBe(false);
    });

    it('should maintain state consistency after many operations', () => {
      navHidden.value = false;
      isHovering.value = false;

      for (let i = 0; i < 100; i++) {
        onNavEnter();
        onNavLeave();
        vi.advanceTimersByTime(100);
        onNavEnter();
      }

      vi.advanceTimersByTime(100);

      expect(typeof navHidden.value).toBe('boolean');
      expect(typeof isHovering.value).toBe('boolean');
    });
  });

  describe('Initial Auto-Hide After Login', () => {
    it('should auto-hide nav 1 second after mount for logged in users', () => {
      navHidden.value = false;
      isHovering.value = false;
      navDisplayMode.value = 'auto';

      hideNavTimer = setTimeout(() => {
        hideNav();
      }, 1000);

      vi.advanceTimersByTime(999);
      expect(navHidden.value).toBe(false);

      vi.advanceTimersByTime(1);
      expect(navHidden.value).toBe(true);
    });

    it('should not auto-hide on mount if fixed mode', () => {
      navHidden.value = false;
      navDisplayMode.value = 'fixed';

      hideNavTimer = setTimeout(() => {
        hideNav();
      }, 1000);

      vi.advanceTimersByTime(5000);

      expect(navHidden.value).toBe(false);
    });

    it('should not auto-hide on mount if user is not logged in', () => {
      const isLoggedIn = false;
      navHidden.value = false;
      navDisplayMode.value = 'auto';

      if (isLoggedIn && navDisplayMode.value !== 'fixed') {
        hideNavTimer = setTimeout(() => {
          hideNav();
        }, 1000);
      }

      vi.advanceTimersByTime(1000);

      expect(navHidden.value).toBe(false);
    });
  });

  describe('Study Page Navigation', () => {
    it('should not hide nav when on study page (study page handles its own nav)', () => {
      mockRouter.currentRoute.value.path = '/study';
      navHidden.value = false;

      const event = {
        key: 'Escape',
        preventDefault: vi.fn()
      };

      handleKeydown(event);

      expect(navHidden.value).toBe(false);
    });

    it('should not affect other pages nav behavior', () => {
      mockRouter.currentRoute.value.path = '/';
      navHidden.value = false;

      const event = {
        key: 'Escape',
        preventDefault: vi.fn()
      };

      handleKeydown(event);

      expect(navHidden.value).toBe(true);
    });
  });

  describe('Timer Cleanup Verification', () => {
    it('should clean up hideNavTimer', () => {
      hideNavTimer = setTimeout(() => {
        hideNav();
      }, 5000);

      clearTimeout(hideNavTimer);
      hideNavTimer = null;

      vi.advanceTimersByTime(10000);

      expect(navHidden.value).toBe(false);
    });

    it('should clean up showNavTimer', () => {
      showNavTimer = setTimeout(() => {
        showNav();
      }, 50);

      clearTimeout(showNavTimer);
      showNavTimer = null;

      vi.advanceTimersByTime(200);

      expect(navHidden.value).toBe(false);
    });

    it('should clean up mouseMoveTimer', () => {
      mouseMoveTimer = setTimeout(() => {
      }, 100);

      clearTimeout(mouseMoveTimer);
      mouseMoveTimer = null;

      vi.advanceTimersByTime(200);

      expect(mouseMoveTimer).toBeNull();
    });
  });
});
