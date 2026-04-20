import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  enableFocusMode,
  disableFocusMode,
  getFocusModeState,
  shouldShowToast,
  useFocusMode,
  checkAsyncAwait
} from './focusMode.js';

describe('focusMode', () => {
  beforeEach(() => {
    disableFocusMode();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  describe('enableFocusMode', () => {
    it('should set isFocusMode to true', () => {
      enableFocusMode();
      expect(getFocusModeState()).toBe(true);
    });

    it('should accept custom allowedTypes', () => {
      enableFocusMode({ allowedTypes: ['study', 'error'] });
      expect(shouldShowToast('study', 'test')).toBe(true);
      expect(shouldShowToast('notification', 'test')).toBe(false);
    });
  });

  describe('disableFocusMode', () => {
    it('should set isFocusMode to false', () => {
      enableFocusMode();
      disableFocusMode();
      expect(getFocusModeState()).toBe(false);
    });

    it('should remove focus overlay elements', () => {
      enableFocusMode();
      disableFocusMode();
      expect(document.querySelector('.focus-mode-overlay')).toBeNull();
      expect(document.querySelector('.focus-safe-area-highlight')).toBeNull();
    });
  });

  describe('shouldShowToast', () => {
    it('should always show toast when not in focus mode', () => {
      disableFocusMode();
      expect(shouldShowToast('any', 'any message')).toBe(true);
    });

    it('should allow study-related toast types in focus mode', () => {
      enableFocusMode({ allowedTypes: ['study', 'learning', 'review', 'error'] });
      expect(shouldShowToast('study', 'test')).toBe(true);
      expect(shouldShowToast('learning', 'test')).toBe(true);
      expect(shouldShowToast('review', 'test')).toBe(true);
      expect(shouldShowToast('error', 'test')).toBe(true);
    });

    it('should allow toast with study keywords in focus mode', () => {
      enableFocusMode();
      expect(shouldShowToast('info', '单词学习完成')).toBe(true);
      expect(shouldShowToast('info', '复习进度更新')).toBe(true);
      expect(shouldShowToast('info', '保存成功')).toBe(true);
    });

    it('should block non-study toast in focus mode', () => {
      enableFocusMode();
      expect(shouldShowToast('system', '系统通知')).toBe(false);
      expect(shouldShowToast('update', '更新可用')).toBe(false);
    });
  });

  describe('checkAsyncAwait', () => {
    it('should return boolean', () => {
      const result = checkAsyncAwait();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('useFocusMode composable', () => {
    it('should return focus mode utilities', () => {
      const focus = useFocusMode();
      expect(focus).toHaveProperty('isFocusMode');
      expect(focus).toHaveProperty('enableFocusMode');
      expect(focus).toHaveProperty('disableFocusMode');
      expect(focus).toHaveProperty('shouldShowToast');
    });
  });

  describe('focus mode visual overlay', () => {
    it('should add overlay elements when focus mode is enabled', () => {
      enableFocusMode();
      setTimeout(() => {
        expect(document.querySelector('.focus-mode-overlay')).not.toBeNull();
        expect(document.querySelector('.focus-safe-area-highlight')).not.toBeNull();
      }, 100);
    });
  });
});
