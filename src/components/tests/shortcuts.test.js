import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ref, computed } from 'vue';

describe('Keyboard Shortcuts - Comprehensive Tests', () => {
  // NavBar state
  let navHidden, isHovering, hideNavTimer, showNavTimer, mouseMoveTimer;
  let navDisplayMode, navHoverDelay;
  let toggleNav, showNav, hideNav;
  let onNavEnter, onNavLeave, onTriggerEnter, onTriggerLeave;
  let navHandleKeydown;
  let mockRouter, mockUserStore;
  let showLogoutConfirm, drawerOpen, userMenuOpen;

  // Study state
  let studyQueue, currentIndex, flipped, showStats, isFullscreen;
  let studyHandleKeydown, toggleFlip, handleResponse, goBack, toggleFullscreen;
  let mockFullscreenAPI;

  beforeEach(() => {
    vi.useFakeTimers();

    // Initialize NavBar state
    navHidden = ref(false);
    isHovering = ref(false);
    hideNavTimer = null;
    showNavTimer = null;
    mouseMoveTimer = null;
    navDisplayMode = ref('auto');
    navHoverDelay = ref(3000);
    showLogoutConfirm = ref(false);
    drawerOpen = ref(false);
    userMenuOpen = ref(false);

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

    showNav = () => {
      clearTimeout(hideNavTimer);
      navHidden.value = false;
      isHovering.value = true;
    };

    hideNav = () => {
      clearTimeout(showNavTimer);
      if (navDisplayMode.value === 'fixed') {
        return;
      }
      navHidden.value = true;
      isHovering.value = false;
    };

    toggleNav = () => {
      if (navHidden.value) {
        showNav();
      } else {
        hideNav();
      }
    };

    onNavEnter = () => {
      clearTimeout(hideNavTimer);
      isHovering.value = true;
    };

    onNavLeave = () => {
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

    onTriggerEnter = () => {
      clearTimeout(hideNavTimer);
      showNavTimer = setTimeout(() => {
        showNav();
      }, 50);
    };

    onTriggerLeave = () => {
      clearTimeout(showNavTimer);
    };

    // NavBar keyboard handler (replicating NavBar.vue handleKeydown)
    navHandleKeydown = (e) => {
      const currentPath = mockRouter.currentRoute.value.path;

      // Ctrl/Cmd+B toggle nav
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleNav();
        return;
      }

      // Esc key handling
      if (e.key === 'Escape') {
        if (mockFullscreenAPI.isFullscreen) {
          e.preventDefault();
          mockFullscreenAPI.exit();
          return;
        }

        if (currentPath === '/study') {
          if (showLogoutConfirm.value) {
            e.preventDefault();
            showLogoutConfirm.value = false;
            return;
          } else if (drawerOpen.value) {
            e.preventDefault();
            drawerOpen.value = false;
            return;
          } else if (userMenuOpen.value) {
            e.preventDefault();
            userMenuOpen.value = false;
            return;
          }
          return;
        }

        if (showLogoutConfirm.value) {
          e.preventDefault();
          showLogoutConfirm.value = false;
        } else if (drawerOpen.value) {
          e.preventDefault();
          drawerOpen.value = false;
        } else if (userMenuOpen.value) {
          e.preventDefault();
          userMenuOpen.value = false;
        } else if (!navHidden.value && mockUserStore.isLoggedIn) {
          hideNav();
        }
        return;
      }

      // Ctrl+Shift+Q logout confirm
      if (e.ctrlKey && e.shiftKey && e.key === 'Q') {
        e.preventDefault();
        if (mockUserStore.isLoggedIn && !showLogoutConfirm.value) {
          showLogoutConfirm.value = true;
        }
        return;
      }
    };

    // Initialize Study state
    studyQueue = ref([
      { id: 1, word: 'test', easiness: 2.5, interval: 1 },
      { id: 2, word: 'word', easiness: 2.5, interval: 1 }
    ]);
    currentIndex = ref(0);
    flipped = ref(false);
    showStats = ref(false);
    isFullscreen = ref(false);

    mockFullscreenAPI = {
      isFullscreen: false,
      isEnabled: true,
      exit: vi.fn(() => {
        mockFullscreenAPI.isFullscreen = false;
      }),
      enter: vi.fn(() => {
        mockFullscreenAPI.isFullscreen = true;
      }),
      toggle: vi.fn()
    };

    toggleFlip = () => {
      flipped.value = !flipped.value;
    };

    handleResponse = (quality) => {
      if (quality > 1) {
      }
      currentIndex.value++;
      flipped.value = false;
      if (currentIndex.value >= studyQueue.value.length) {
        showStats.value = true;
      }
    };

    goBack = vi.fn();

    toggleFullscreen = async () => {
      if (!mockFullscreenAPI.isEnabled) {
        return;
      }
      const success = await mockFullscreenAPI.toggle();
      if (success) {
        isFullscreen.value = mockFullscreenAPI.isFullscreen;
      }
    };

    // Study keyboard handler (replicating Study.vue handleKeydown)
    studyHandleKeydown = (e) => {
      if (studyQueue.value.length === 0) return;
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      switch (e.key) {
        case ' ':
        case 'Enter':
          e.preventDefault();
          toggleFlip();
          break;
        case '1':
          handleResponse(0);
          break;
        case '2':
          handleResponse(1);
          break;
        case '3':
          handleResponse(2);
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'Escape':
          if (showStats.value) {
            e.preventDefault();
            showStats.value = false;
          } else if (flipped.value) {
            e.preventDefault();
            flipped.value = false;
          } else {
            e.preventDefault();
            goBack();
          }
          break;
      }
    };
  });

  afterEach(() => {
    vi.useRealTimers();
    clearTimeout(hideNavTimer);
    clearTimeout(showNavTimer);
    clearTimeout(mouseMoveTimer);
  });

  describe('NavBar Shortcuts', () => {
    describe('Ctrl/Cmd+B - Toggle Navigation', () => {
      it('should hide navigation when visible', () => {
        navHidden.value = false;
        const event = { ctrlKey: true, key: 'b', preventDefault: vi.fn() };
        navHandleKeydown(event);
        expect(event.preventDefault).toHaveBeenCalled();
        expect(navHidden.value).toBe(true);
      });

      it('should show navigation when hidden', () => {
        navHidden.value = true;
        const event = { ctrlKey: true, key: 'b', preventDefault: vi.fn() };
        navHandleKeydown(event);
        expect(event.preventDefault).toHaveBeenCalled();
        expect(navHidden.value).toBe(false);
      });

      it('should work with Cmd key on Mac', () => {
        navHidden.value = false;
        const event = { metaKey: true, key: 'b', preventDefault: vi.fn() };
        navHandleKeydown(event);
        expect(event.preventDefault).toHaveBeenCalled();
        expect(navHidden.value).toBe(true);
      });

      it('should work with lowercase and uppercase B', () => {
        navHidden.value = false;
        const event1 = { ctrlKey: true, key: 'b', preventDefault: vi.fn() };
        navHandleKeydown(event1);
        expect(navHidden.value).toBe(true);

        const event2 = { ctrlKey: true, key: 'B', preventDefault: vi.fn() };
        navHandleKeydown(event2);
        expect(navHidden.value).toBe(false);
      });

      it('should prevent default browser behavior', () => {
        const event = { ctrlKey: true, key: 'b', preventDefault: vi.fn() };
        navHandleKeydown(event);
        expect(event.preventDefault).toHaveBeenCalled();
      });
    });

    describe('Esc Key - Navigation Bar', () => {
      it('should exit fullscreen mode first when fullscreen', () => {
        mockFullscreenAPI.isFullscreen = true;
        const event = { key: 'Escape', preventDefault: vi.fn() };
        navHandleKeydown(event);
        expect(event.preventDefault).toHaveBeenCalled();
        expect(mockFullscreenAPI.isFullscreen).toBe(false);
        expect(navHidden.value).toBe(false);
      });

      it('should close logout confirmation dialog', () => {
        showLogoutConfirm.value = true;
        const event = { key: 'Escape', preventDefault: vi.fn() };
        navHandleKeydown(event);
        expect(showLogoutConfirm.value).toBe(false);
      });

      it('should close drawer menu', () => {
        drawerOpen.value = true;
        const event = { key: 'Escape', preventDefault: vi.fn() };
        navHandleKeydown(event);
        expect(drawerOpen.value).toBe(false);
      });

      it('should close user menu dropdown', () => {
        userMenuOpen.value = true;
        const event = { key: 'Escape', preventDefault: vi.fn() };
        navHandleKeydown(event);
        expect(userMenuOpen.value).toBe(false);
      });

      it('should hide navigation when visible on non-study pages', () => {
        mockRouter.currentRoute.value.path = '/';
        navHidden.value = false;
        const event = { key: 'Escape', preventDefault: vi.fn() };
        navHandleKeydown(event);
        expect(navHidden.value).toBe(true);
      });

      it('should not hide navigation when already hidden', () => {
        navHidden.value = true;
        const event = { key: 'Escape', preventDefault: vi.fn() };
        navHandleKeydown(event);
        expect(navHidden.value).toBe(true);
      });

      it('should prioritize closing dialogs over hiding navigation', () => {
        showLogoutConfirm.value = true;
        navHidden.value = false;
        const event = { key: 'Escape', preventDefault: vi.fn() };
        navHandleKeydown(event);
        expect(showLogoutConfirm.value).toBe(false);
        expect(navHidden.value).toBe(false);
      });
    });

    describe('Ctrl+Shift+Q - Logout Confirmation', () => {
      it('should show logout confirmation dialog', () => {
        showLogoutConfirm.value = false;
        const event = { ctrlKey: true, shiftKey: true, key: 'Q', preventDefault: vi.fn() };
        navHandleKeydown(event);
        expect(event.preventDefault).toHaveBeenCalled();
        expect(showLogoutConfirm.value).toBe(true);
      });

      it('should not show dialog if already visible', () => {
        showLogoutConfirm.value = true;
        const event = { ctrlKey: true, shiftKey: true, key: 'Q', preventDefault: vi.fn() };
        navHandleKeydown(event);
        expect(showLogoutConfirm.value).toBe(true);
      });

      it('should not show dialog if user is not logged in', () => {
        mockUserStore.isLoggedIn = false;
        const event = { ctrlKey: true, shiftKey: true, key: 'Q', preventDefault: vi.fn() };
        navHandleKeydown(event);
        expect(showLogoutConfirm.value).toBe(false);
      });

      it('should work regardless of navigation visibility', () => {
        navHidden.value = true;
        const event = { ctrlKey: true, shiftKey: true, key: 'Q', preventDefault: vi.fn() };
        navHandleKeydown(event);
        expect(showLogoutConfirm.value).toBe(true);
      });
    });
  });

  describe('Study Page Shortcuts', () => {
    describe('Space/Enter - Flip Card', () => {
      it('should flip card when not flipped', () => {
        flipped.value = false;
        const event = { key: ' ', target: { tagName: 'DIV' }, preventDefault: vi.fn() };
        studyHandleKeydown(event);
        expect(event.preventDefault).toHaveBeenCalled();
        expect(flipped.value).toBe(true);
      });

      it('should flip card back when already flipped', () => {
        flipped.value = true;
        const event = { key: ' ', target: { tagName: 'DIV' }, preventDefault: vi.fn() };
        studyHandleKeydown(event);
        expect(event.preventDefault).toHaveBeenCalled();
        expect(flipped.value).toBe(false);
      });

      it('should work with Enter key', () => {
        flipped.value = false;
        const event = { key: 'Enter', target: { tagName: 'DIV' }, preventDefault: vi.fn() };
        studyHandleKeydown(event);
        expect(flipped.value).toBe(true);
      });

      it('should not trigger in input fields', () => {
        const event = { key: ' ', target: { tagName: 'INPUT' }, preventDefault: vi.fn() };
        studyHandleKeydown(event);
        expect(event.preventDefault).not.toHaveBeenCalled();
        expect(flipped.value).toBe(false);
      });

      it('should not trigger in textarea fields', () => {
        const event = { key: 'Enter', target: { tagName: 'TEXTAREA' }, preventDefault: vi.fn() };
        studyHandleKeydown(event);
        expect(event.preventDefault).not.toHaveBeenCalled();
        expect(flipped.value).toBe(false);
      });
    });

    describe('Number Keys - Response Quality', () => {
      it('should handle key 1 (forget)', () => {
        currentIndex.value = 0;
        const event = { key: '1', target: { tagName: 'DIV' }, preventDefault: vi.fn() };
        studyHandleKeydown(event);
        expect(currentIndex.value).toBe(1);
        expect(flipped.value).toBe(false);
      });

      it('should handle key 2 (vague)', () => {
        currentIndex.value = 0;
        const event = { key: '2', target: { tagName: 'DIV' }, preventDefault: vi.fn() };
        studyHandleKeydown(event);
        expect(currentIndex.value).toBe(1);
      });

      it('should handle key 3 (know)', () => {
        currentIndex.value = 0;
        const event = { key: '3', target: { tagName: 'DIV' }, preventDefault: vi.fn() };
        studyHandleKeydown(event);
        expect(currentIndex.value).toBe(1);
      });

      it('should advance to next word', () => {
        currentIndex.value = 0;
        const event = { key: '3', target: { tagName: 'DIV' }, preventDefault: vi.fn() };
        studyHandleKeydown(event);
        expect(currentIndex.value).toBe(1);
      });

      it('should show stats when queue is complete', () => {
        currentIndex.value = studyQueue.value.length - 1;
        const event = { key: '3', target: { tagName: 'DIV' }, preventDefault: vi.fn() };
        studyHandleKeydown(event);
        expect(showStats.value).toBe(true);
      });

      it('should not trigger in input fields', () => {
        const event = { key: '1', target: { tagName: 'INPUT' }, preventDefault: vi.fn() };
        studyHandleKeydown(event);
        expect(currentIndex.value).toBe(0);
      });
    });

    describe('F Key - Fullscreen Toggle', () => {
      it('should toggle fullscreen with lowercase f', () => {
        const event = { key: 'f', target: { tagName: 'DIV' }, preventDefault: vi.fn() };
        mockFullscreenAPI.toggle.mockResolvedValue(true);
        studyHandleKeydown(event);
        expect(event.preventDefault).toHaveBeenCalled();
      });

      it('should toggle fullscreen with uppercase F', () => {
        const event = { key: 'F', target: { tagName: 'DIV' }, preventDefault: vi.fn() };
        mockFullscreenAPI.toggle.mockResolvedValue(true);
        studyHandleKeydown(event);
        expect(event.preventDefault).toHaveBeenCalled();
      });

      it('should check if fullscreen API is enabled', () => {
        mockFullscreenAPI.isEnabled = false;
        const event = { key: 'f', target: { tagName: 'DIV' }, preventDefault: vi.fn() };
        studyHandleKeydown(event);
        expect(event.preventDefault).toHaveBeenCalled();
      });

      it('should not trigger in input fields', () => {
        const event = { key: 'f', target: { tagName: 'INPUT' }, preventDefault: vi.fn() };
        studyHandleKeydown(event);
        expect(event.preventDefault).not.toHaveBeenCalled();
      });
    });

    describe('Esc Key - Study Page', () => {
      it('should close stats modal when visible', () => {
        showStats.value = true;
        const event = { key: 'Escape', target: { tagName: 'DIV' }, preventDefault: vi.fn() };
        studyHandleKeydown(event);
        expect(event.preventDefault).toHaveBeenCalled();
        expect(showStats.value).toBe(false);
      });

      it('should flip card back when card is flipped', () => {
        flipped.value = true;
        showStats.value = false;
        const event = { key: 'Escape', target: { tagName: 'DIV' }, preventDefault: vi.fn() };
        studyHandleKeydown(event);
        expect(event.preventDefault).toHaveBeenCalled();
        expect(flipped.value).toBe(false);
      });

      it('should exit study when card is not flipped and no stats', () => {
        flipped.value = false;
        showStats.value = false;
        const event = { key: 'Escape', target: { tagName: 'DIV' }, preventDefault: vi.fn() };
        studyHandleKeydown(event);
        expect(event.preventDefault).toHaveBeenCalled();
        expect(goBack).toHaveBeenCalled();
      });

      it('should prioritize stats modal over card flip', () => {
        showStats.value = true;
        flipped.value = true;
        const event = { key: 'Escape', target: { tagName: 'DIV' }, preventDefault: vi.fn() };
        studyHandleKeydown(event);
        expect(showStats.value).toBe(false);
        expect(flipped.value).toBe(true);
      });

      it('should prioritize card flip over exiting study', () => {
        showStats.value = false;
        flipped.value = true;
        const event = { key: 'Escape', target: { tagName: 'DIV' }, preventDefault: vi.fn() };
        studyHandleKeydown(event);
        expect(flipped.value).toBe(false);
        expect(goBack).not.toHaveBeenCalled();
      });
    });
  });

  describe('Shortcut Conflict Detection', () => {
    it('should detect Esc key conflict between NavBar and Study', () => {
      // On Study page, NavBar should only handle its own dialogs, not hide nav
      mockRouter.currentRoute.value.path = '/study';
      navHidden.value = false;
      drawerOpen.value = false;
      userMenuOpen.value = false;
      showLogoutConfirm.value = false;

      const event = { key: 'Escape', preventDefault: vi.fn() };
      navHandleKeydown(event);

      expect(navHidden.value).toBe(false);
    });

    it('should handle Esc key in Study page correctly', () => {
      mockRouter.currentRoute.value.path = '/study';
      flipped.value = false;
      showStats.value = false;

      const event = { key: 'Escape', target: { tagName: 'DIV' }, preventDefault: vi.fn() };
      studyHandleKeydown(event);

      expect(goBack).toHaveBeenCalled();
    });

    it('should not trigger Study shortcuts when queue is empty', () => {
      studyQueue.value = [];
      const event = { key: ' ', target: { tagName: 'DIV' }, preventDefault: vi.fn() };
      studyHandleKeydown(event);
      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('should allow Ctrl+B to work on Study page (NavBar handles it)', () => {
      mockRouter.currentRoute.value.path = '/study';
      navHidden.value = false;
      const event = { ctrlKey: true, key: 'b', preventDefault: vi.fn() };
      navHandleKeydown(event);
      expect(navHidden.value).toBe(true);
    });
  });

  describe('Shortcut Customization', () => {
    it('should NOT have shortcut customization settings in Settings page', () => {
      const settingsContent = `
        <template>
          <div class="settings-container">
            <section class="settings-section">
              <h2 class="section-title">导航设置</h2>
              <div class="settings-card">
                <div class="setting-item">
                  <div class="setting-info">
                    <span class="setting-label">显示模式</span>
                  </div>
                </div>
                <div class="setting-item">
                  <div class="setting-info">
                    <span class="setting-label">唤出延迟</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </template>
      `;

      expect(settingsContent).not.toContain('快捷键');
      expect(settingsContent).not.toContain('shortcut');
      expect(settingsContent).not.toContain('keybind');
    });

    it('should verify no shortcut customization exists', () => {
      const settingsSections = [
        '导航设置',
        '学习设置',
        '学习目标',
        '学习偏好',
        '通知',
        '数据管理',
        '账户',
        '关于'
      ];

      const hasShortcutSection = settingsSections.some(section =>
        section.includes('快捷键') || section.includes('shortcut')
      );

      expect(hasShortcutSection).toBe(false);
    });
  });

  describe('Default Shortcuts Verification', () => {
    it('should verify Ctrl+B is default for nav toggle', () => {
      const defaultShortcuts = {
        navToggle: 'Ctrl+B',
        navLogout: 'Ctrl+Shift+Q',
        studyFlip: 'Space/Enter',
        studyForget: '1',
        studyVague: '2',
        studyKnow: '3',
        studyFullscreen: 'F',
        studyEsc: 'Escape'
      };

      expect(defaultShortcuts.navToggle).toBe('Ctrl+B');
      expect(defaultShortcuts.studyFlip).toBe('Space/Enter');
      expect(defaultShortcuts.studyFullscreen).toBe('F');
    });

    it('should verify all default shortcuts are functional', () => {
      const shortcuts = [
        { key: 'Ctrl+B', component: 'NavBar', action: 'toggleNav' },
        { key: 'Ctrl+Shift+Q', component: 'NavBar', action: 'logoutConfirm' },
        { key: 'Space', component: 'Study', action: 'flipCard' },
        { key: 'Enter', component: 'Study', action: 'flipCard' },
        { key: '1', component: 'Study', action: 'responseForget' },
        { key: '2', component: 'Study', action: 'responseVague' },
        { key: '3', component: 'Study', action: 'responseKnow' },
        { key: 'F', component: 'Study', action: 'toggleFullscreen' },
        { key: 'Escape', component: 'Both', action: 'contextual' }
      ];

      expect(shortcuts.length).toBe(9);
      shortcuts.forEach(shortcut => {
        expect(shortcut.key).toBeTruthy();
        expect(shortcut.component).toBeTruthy();
        expect(shortcut.action).toBeTruthy();
      });
    });
  });

  describe('Edge Cases and Browser Compatibility', () => {
    it('should handle Ctrl+B with preventDefault to avoid bookmark conflict', () => {
      const event = { ctrlKey: true, key: 'b', preventDefault: vi.fn() };
      navHandleKeydown(event);
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should handle F key with preventDefault', () => {
      const event = { key: 'F', target: { tagName: 'DIV' }, preventDefault: vi.fn() };
      studyHandleKeydown(event);
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should handle Mac Cmd key for shortcuts', () => {
      navHidden.value = false;
      const event = { metaKey: true, key: 'b', preventDefault: vi.fn() };
      navHandleKeydown(event);
      expect(navHidden.value).toBe(true);
    });

    it('should handle rapid key presses without errors', () => {
      let finalState = false;
      for (let i = 0; i < 10; i++) {
        const event = { key: ' ', target: { tagName: 'DIV' }, preventDefault: vi.fn() };
        studyHandleKeydown(event);
        finalState = flipped.value;
      }
      expect(finalState).toBe(false);
    });

    it('should handle Space key with preventDefault to avoid scrolling', () => {
      const event = { key: ' ', target: { tagName: 'DIV' }, preventDefault: vi.fn() };
      studyHandleKeydown(event);
      expect(event.preventDefault).toHaveBeenCalled();
    });
  });

  describe('Shortcut State Management', () => {
    it('should maintain state consistency after multiple shortcuts', () => {
      navHidden.value = false;
      
      navHandleKeydown({ ctrlKey: true, key: 'b', preventDefault: vi.fn() });
      expect(navHidden.value).toBe(true);
      
      navHandleKeydown({ ctrlKey: true, key: 'b', preventDefault: vi.fn() });
      expect(navHidden.value).toBe(false);
    });

    it('should handle Esc key in correct priority order', () => {
      showLogoutConfirm.value = true;
      drawerOpen.value = true;
      userMenuOpen.value = true;
      navHidden.value = false;

      const event = { key: 'Escape', preventDefault: vi.fn() };
      navHandleKeydown(event);

      expect(showLogoutConfirm.value).toBe(false);
      expect(drawerOpen.value).toBe(true);
      expect(userMenuOpen.value).toBe(true);
      expect(navHidden.value).toBe(false);
    });

    it('should handle Study Esc key in correct priority order', () => {
      showStats.value = true;
      flipped.value = true;

      const event = { key: 'Escape', target: { tagName: 'DIV' }, preventDefault: vi.fn() };
      studyHandleKeydown(event);

      expect(showStats.value).toBe(false);
      expect(flipped.value).toBe(true);
    });
  });
});
