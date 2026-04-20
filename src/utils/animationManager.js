/**
 * 动效管理器 - 统一管理应用动效性能
 * 支持动态开启/关闭动效，优化渲染性能，适配各浏览器
 */

import { ref, watch } from 'vue';
import { FeatureSupport } from './browserCompatibility.js';

// 动效速度配置 (毫秒)
const SPEED_CONFIG = {
  slow: { multiplier: 1.5, duration: 450 },
  normal: { multiplier: 1, duration: 300 },
  fast: { multiplier: 0.6, duration: 180 }
};

// 检测浏览器是否支持高级动效特性
function checkAnimationSupport() {
  return {
    // 基本的 transition 支持
    transitions: CSS.supports('transition', 'transform 0.3s'),
    // 3D transforms
    transforms3d: CSS.supports('transform', 'translate3d(0,0,0)'),
    // CSS 变量
    cssVariables: CSS.supports('color', 'var(--test)'),
    // will-change
    willChange: 'willChange' in document.documentElement.style,
    // 减少动效偏好
    prefersReducedMotion: FeatureSupport.prefersReducedMotion
  };
}

class AnimationManager {
  constructor() {
    this.enabled = ref(true);
    this.speed = ref('normal');
    this.styleElement = null;
    this.initialized = false;
  }

  /**
   * 初始化动效管理器
   * @param {boolean} enabled - 是否启用动效
   * @param {string} speed - 动效速度 (slow/normal/fast)
   */
  init(enabled = true, speed = 'normal') {
    if (this.initialized) return;

    this.enabled.value = enabled;
    this.speed.value = speed;

    this.createStyleElement();
    this.applyAnimationSettings();
    this.setupListeners();

    this.initialized = true;
  }

  /**
   * 创建样式元素用于动态控制动效
   */
  createStyleElement() {
    if (this.styleElement) return;

    this.styleElement = document.createElement('style');
    this.styleElement.id = 'animation-manager-styles';
    document.head.appendChild(this.styleElement);
  }

  /**
   * 设置监听器，响应式更新动效
   */
  setupListeners() {
    // 检查浏览器支持
    const support = checkAnimationSupport();
    
    // 如果不支持 CSS 变量或基础 transition，禁用动效
    if (!support.cssVariables || !support.transitions) {
      console.warn('[AnimationManager] 浏览器不支持必要动效特性，已禁用动效');
      this.enabled.value = false;
      return;
    }

    // 监听系统 prefers-reduced-motion 设置
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    // 兼容旧版浏览器的事件监听
    const handleChange = (e) => {
      if (e.matches) {
        this.disableAnimations();
        console.log('[AnimationManager] 系统偏好减少动效，已自动禁用');
      } else if (this.userEnabled !== false) {
        // 如果用户没有手动禁用，恢复动效
        this.enableAnimations();
      }
    };

    // 使用新版本 API 优先，回退到旧版本
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else if (mediaQuery.addListener) {
      // Safari < 14, Firefox < 65
      mediaQuery.addListener(handleChange);
    }

    // 如果系统偏好减少动效，自动关闭
    if (mediaQuery.matches) {
      this.enabled.value = false;
    }
  }

  /**
   * 应用动效设置到 CSS
   */
  applyAnimationSettings() {
    if (!this.styleElement) return;

    const support = checkAnimationSupport();
    const speedConfig = SPEED_CONFIG[this.speed.value] || SPEED_CONFIG.normal;
    const duration = speedConfig.duration;
    const multiplier = speedConfig.multiplier;

    if (!this.enabled.value) {
      // 禁用所有非必要动效
      this.styleElement.textContent = `
        /* 动效已禁用 - AnimationManager */
        *, *::before, *::after {
          animation-duration: 0.001ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.001ms !important;
          transition-property: none !important;
          scroll-behavior: auto !important;
        }
        
        /* 保留必要的过渡效果 */
        .preserve-transition {
          transition-duration: 100ms !important;
          transition-property: opacity, transform !important;
        }
        
        /* 禁用复杂动画 */
        .word-slide-enter-active,
        .word-slide-leave-active,
        .toast-fade-enter-active,
        .toast-fade-leave-active,
        .progress-panel-enter-active,
        .progress-panel-leave-active {
          animation: none !important;
          transition: none !important;
        }
        
        /* 禁用脉冲动画 */
        .indicator-pulse {
          animation: none !important;
        }
        
        /* 禁用加载动画 */
        .spinner,
        .mini-spinner,
        .loading-spinner {
          animation: none !important;
        }
      `;
    } else {
      // 启用动效，应用速度设置
      const willChangeProp = support.willChange ? 'will-change: transform, opacity;' : '';
      const backfaceProp = 'backface-visibility: hidden;';
      
      this.styleElement.textContent = `
        /* 动效已启用 - AnimationManager */
        :root {
          --anim-duration-fast: ${Math.round(150 * multiplier)}ms;
          --anim-duration-normal: ${duration}ms;
          --anim-duration-slow: ${Math.round(450 * multiplier)}ms;
          --anim-easing-smooth: cubic-bezier(0.34, 1.56, 0.64, 1);
          --anim-easing-standard: cubic-bezier(0.4, 0, 0.2, 1);
          --anim-easing-decelerate: cubic-bezier(0, 0, 0.2, 1);
        }
        
        /* 优化性能的动效类 */
        .gpu-accelerated {
          ${willChangeProp}
          transform: translateZ(0);
          ${backfaceProp}
        }
        
        /* 内容可见性优化 - 仅支持该特性的浏览器 */
        ${CSS.supports('content-visibility', 'auto') ? `
        .content-visibility-auto {
          content-visibility: auto;
          contain-intrinsic-size: auto 300px;
        }
        ` : ''}
        
        /* 浏览器特定修复 */
        /* Firefox 对某些动效的优化 */
        @supports (-moz-appearance: none) {
          .word-slide-enter-active,
          .word-slide-leave-active {
            will-change: auto;
          }
        }
        
        /* Safari 对 3D 变换的支持 */
        @supports (-webkit-touch-callout: none) {
          .gpu-accelerated {
            -webkit-transform: translateZ(0);
            -webkit-backface-visibility: hidden;
          }
        }
      `;
    }
  }

  /**
   * 启用动效
   */
  enableAnimations() {
    this.enabled.value = true;
    this.applyAnimationSettings();
    document.documentElement.classList.remove('animations-disabled');
    document.documentElement.classList.add('animations-enabled');
  }

  /**
   * 禁用动效
   */
  disableAnimations() {
    this.enabled.value = false;
    this.applyAnimationSettings();
    document.documentElement.classList.remove('animations-enabled');
    document.documentElement.classList.add('animations-disabled');
  }

  /**
   * 设置动效开关
   * @param {boolean} enabled
   */
  setEnabled(enabled) {
    this.enabled.value = enabled;
    this.applyAnimationSettings();
  }

  /**
   * 设置动效速度
   * @param {string} speed - slow/normal/fast
   */
  setSpeed(speed) {
    if (!SPEED_CONFIG[speed]) return;
    this.speed.value = speed;
    if (this.enabled.value) {
      this.applyAnimationSettings();
    }
  }

  /**
   * 获取当前动效持续时间
   * @returns {number} 毫秒
   */
  getDuration() {
    const config = SPEED_CONFIG[this.speed.value] || SPEED_CONFIG.normal;
    return this.enabled.value ? config.duration : 0;
  }

  /**
   * 获取 CSS 过渡时间字符串
   * @returns {string}
   */
  getTransitionDuration() {
    return `${this.getDuration()}ms`;
  }

  /**
   * 创建高性能过渡配置
   * @param {Object} options
   * @returns {Object} Vue Transition 配置
   */
  createTransitionConfig(options = {}) {
    const duration = this.getDuration();
    const enabled = this.enabled.value;

    return {
      enterActiveClass: enabled ? options.enterClass || 'anim-enter-active' : '',
      leaveActiveClass: enabled ? options.leaveClass || 'anim-leave-active' : '',
      enterFromClass: options.enterFromClass || 'anim-enter-from',
      leaveToClass: options.leaveToClass || 'anim-leave-to',
      duration: enabled ? duration : 0,
      ...options
    };
  }

  /**
   * 使用 requestAnimationFrame 执行高性能动画
   * @param {Function} callback
   * @param {number} delay
   */
  requestAnimation(callback, delay = 0) {
    if (!this.enabled.value) {
      callback();
      return;
    }

    if (delay > 0) {
      setTimeout(() => requestAnimationFrame(callback), delay);
    } else {
      requestAnimationFrame(callback);
    }
  }

  /**
   * 防抖动的尺寸观察器 - 避免布局抖动
   * @param {Element} element
   * @param {Function} callback
   */
  observeResize(element, callback) {
    if (!element || !callback) return null;
    
    // 检查 ResizeObserver 支持
    if (!window.ResizeObserver) {
      // 降级方案：使用 window resize 事件
      const handleResize = () => {
        callback([{ target: element }]);
      };
      window.addEventListener('resize', handleResize);
      
      // 立即执行一次
      handleResize();
      
      // 返回清理函数
      return {
        disconnect: () => {
          window.removeEventListener('resize', handleResize);
        },
        unobserve: () => {
          window.removeEventListener('resize', handleResize);
        }
      };
    }

    let rafId = null;
    const observer = new ResizeObserver((entries) => {
      // 使用 requestAnimationFrame 防抖
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        callback(entries);
      });
    });

    observer.observe(element);
    return observer;
  }

  /**
   * 清理资源
   */
  destroy() {
    if (this.styleElement) {
      this.styleElement.remove();
      this.styleElement = null;
    }
    this.initialized = false;
  }
}

// 创建单例实例
export const animationManager = new AnimationManager();

/**
 * Vue Composable - 在组件中使用动效管理
 * @param {Object} options
 */
export function useAnimation(options = {}) {
  const manager = animationManager;

  // 如果提供了 store，监听设置变化
  if (options.store) {
    watch(
      () => options.store.config?.enableAnimations,
      (enabled) => {
        manager.setEnabled(enabled);
      },
      { immediate: true }
    );

    watch(
      () => options.store.config?.animationSpeed,
      (speed) => {
        if (speed) manager.setSpeed(speed);
      },
      { immediate: true }
    );

    // 初始化
    manager.init(
      options.store.config?.enableAnimations ?? true,
      options.store.config?.animationSpeed || 'normal'
    );
  }

  return {
    manager,
    enabled: manager.enabled,
    speed: manager.speed,
    getDuration: () => manager.getDuration(),
    createTransition: (opts) => manager.createTransitionConfig(opts)
  };
}

export default animationManager;
