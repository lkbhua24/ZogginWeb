/**
 * 浏览器兼容性工具 - 全面支持 Chrome、Edge、Firefox、Safari
 * 处理导航、动效、快捷键等功能的跨浏览器一致性
 */

// 浏览器检测
export function detectBrowser() {
  const ua = navigator.userAgent;
  let browser = 'unknown';
  let version = 0;
  let engine = 'unknown';

  // 检测 Chrome（排除 Edge）
  if (ua.indexOf('Chrome') > -1 && ua.indexOf('Edg') === -1 && ua.indexOf('OPR') === -1) {
    browser = 'chrome';
    version = parseInt(ua.match(/Chrome\/(\d+)/)?.[1] || 0);
    engine = 'blink';
  }
  // 检测 Edge
  else if (ua.indexOf('Edg') > -1) {
    browser = 'edge';
    version = parseInt(ua.match(/Edg\/(\d+)/)?.[1] || 0);
    engine = 'blink';
  }
  // 检测 Firefox
  else if (ua.indexOf('Firefox') > -1) {
    browser = 'firefox';
    version = parseInt(ua.match(/Firefox\/(\d+)/)?.[1] || 0);
    engine = 'gecko';
  }
  // 检测 Safari（排除 Chrome）
  else if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) {
    browser = 'safari';
    version = parseInt(ua.match(/Version\/(\d+)/)?.[1] || 0);
    engine = 'webkit';
  }
  // 检测 Opera
  else if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) {
    browser = 'opera';
    version = parseInt(ua.match(/(?:Opera|OPR)\/(\d+)/)?.[1] || 0);
    engine = 'blink';
  }

  return { browser, version, engine };
}

// 支持的浏览器最低版本
const MIN_VERSIONS = {
  chrome: 90,
  edge: 90,
  firefox: 88,
  safari: 14,
  opera: 76
};

// 检查浏览器是否支持
export function isBrowserSupported() {
  const { browser, version } = detectBrowser();
  
  if (browser === 'unknown') return false;
  if (!MIN_VERSIONS[browser]) return false;
  
  return version >= MIN_VERSIONS[browser];
}

// 检查特定功能支持
export const FeatureSupport = {
  // CSS 特性
  get backdropFilter() {
    return CSS.supports('backdrop-filter', 'blur(10px)') || 
           CSS.supports('-webkit-backdrop-filter', 'blur(10px)');
  },
  
  get cssVariables() {
    return CSS.supports('color', 'var(--test)');
  },
  
  get cssGrid() {
    return CSS.supports('display', 'grid');
  },
  
  get cssFlexbox() {
    return CSS.supports('display', 'flex');
  },
  
  get cssTransforms() {
    return CSS.supports('transform', 'translate3d(0,0,0)');
  },
  
  // JavaScript API
  get localStorage() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  },
  
  get indexedDB() {
    return 'indexedDB' in window;
  },
  
  get fetch() {
    return 'fetch' in window;
  },
  
  get promises() {
    return 'Promise' in window;
  },
  
  get asyncAwait() {
    try {
      // 使用 Function 构造器而不是 eval，更安全
      new Function('return (async () => {})')();
      return true;
    } catch (e) {
      return false;
    }
  },
  
  // 媒体相关
  get speechSynthesis() {
    return 'speechSynthesis' in window;
  },
  
  get webkitSpeechRecognition() {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  },
  
  get webAudio() {
    return 'AudioContext' in window || 'webkitAudioContext' in window;
  },
  
  // 全屏 API
  get fullscreen() {
    return document.fullscreenEnabled || 
           document.webkitFullscreenEnabled || 
           document.mozFullScreenEnabled ||
           document.msFullscreenEnabled;
  },
  
  // 通知 API
  get notifications() {
    return 'Notification' in window;
  },
  
  // 振动 API
  get vibration() {
    return 'vibrate' in navigator;
  },
  
  // 触摸支持
  get touch() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },
  
  // 减少动效偏好
  get prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },
  
  // 暗黑模式偏好
  get prefersDarkMode() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  },
  
  // ResizeObserver
  get resizeObserver() {
    return 'ResizeObserver' in window;
  },
  
  // IntersectionObserver
  get intersectionObserver() {
    return 'IntersectionObserver' in window;
  },
  
  // Proxy（用于 focusMode）
  get proxy() {
    return 'Proxy' in window;
  }
};

// 获取完整的兼容性报告
export function getCompatibilityReport() {
  const browser = detectBrowser();
  const supported = isBrowserSupported();
  
  const issues = [];
  const warnings = [];
  
  // 检查浏览器版本
  if (!supported) {
    issues.push({
      type: 'browser',
      message: `您的浏览器 ${browser.browser} ${browser.version} 版本过低，建议使用最新版本`,
      critical: true
    });
  }
  
  // 检查 CSS 特性
  if (!FeatureSupport.backdropFilter) {
    warnings.push({
      type: 'css',
      message: 'backdrop-filter 不支持，毛玻璃效果将回退到纯色背景',
      feature: 'backdrop-filter'
    });
  }
  
  // 检查存储
  if (!FeatureSupport.localStorage) {
    issues.push({
      type: 'storage',
      message: 'localStorage 不可用，数据将无法保存',
      critical: true
    });
  }
  
  if (!FeatureSupport.indexedDB) {
    warnings.push({
      type: 'storage',
      message: 'IndexedDB 不可用，将使用降级存储方案',
      feature: 'indexedDB'
    });
  }
  
  // 检查语音
  if (!FeatureSupport.speechSynthesis) {
    warnings.push({
      type: 'media',
      message: '语音合成功能不可用',
      feature: 'speechSynthesis'
    });
  }
  
  // 检查全屏
  if (!FeatureSupport.fullscreen) {
    warnings.push({
      type: 'ui',
      message: '全屏模式不可用',
      feature: 'fullscreen'
    });
  }
  
  return {
    browser,
    supported,
    features: {
      css: {
        backdropFilter: FeatureSupport.backdropFilter,
        cssVariables: FeatureSupport.cssVariables,
        transforms: FeatureSupport.cssTransforms
      },
      js: {
        promises: FeatureSupport.promises,
        asyncAwait: FeatureSupport.asyncAwait,
        proxy: FeatureSupport.proxy
      },
      media: {
        speechSynthesis: FeatureSupport.speechSynthesis,
        webkitSpeechRecognition: FeatureSupport.webkitSpeechRecognition,
        webAudio: FeatureSupport.webAudio
      },
      ui: {
        fullscreen: FeatureSupport.fullscreen,
        notifications: FeatureSupport.notifications,
        touch: FeatureSupport.touch
      }
    },
    issues,
    warnings,
    timestamp: new Date().toISOString()
  };
}

// 应用兼容性修复
export function applyCompatibilityFixes() {
  const { browser, engine } = detectBrowser();
  
  // 为 HTML 元素添加浏览器标识类
  document.documentElement.classList.add(`browser-${browser}`);
  document.documentElement.classList.add(`engine-${engine}`);
  
  // Firefox 特定修复
  if (browser === 'firefox') {
    // Firefox 对 backdrop-filter 支持较晚
    if (!FeatureSupport.backdropFilter) {
      document.documentElement.classList.add('no-backdrop-filter');
    }
  }
  
  // Safari 特定修复
  if (browser === 'safari') {
    // Safari 需要 -webkit- 前缀的 backdrop-filter
    document.documentElement.classList.add('safari');
  }
  
  // 监听减少动效偏好
  if (FeatureSupport.prefersReducedMotion) {
    document.documentElement.classList.add('reduce-motion');
  }
  
  // 监听动效偏好变化
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (motionQuery.addEventListener) {
    motionQuery.addEventListener('change', (e) => {
      if (e.matches) {
        document.documentElement.classList.add('reduce-motion');
      } else {
        document.documentElement.classList.remove('reduce-motion');
      }
    });
  } else if (motionQuery.addListener) {
    // 旧版 Safari/Firefox
    motionQuery.addListener((e) => {
      if (e.matches) {
        document.documentElement.classList.add('reduce-motion');
      } else {
        document.documentElement.classList.remove('reduce-motion');
      }
    });
  }
}

// 安全的全屏 API 封装
export const FullscreenAPI = {
  get isEnabled() {
    return FeatureSupport.fullscreen;
  },
  
  get isFullscreen() {
    return !!(document.fullscreenElement || 
              document.webkitFullscreenElement || 
              document.mozFullScreenElement ||
              document.msFullscreenElement);
  },
  
  async enter(element) {
    if (!this.isEnabled) return false;
    
    const el = element || document.documentElement;
    
    try {
      if (el.requestFullscreen) {
        await el.requestFullscreen();
      } else if (el.webkitRequestFullscreen) {
        await el.webkitRequestFullscreen();
      } else if (el.mozRequestFullScreen) {
        await el.mozRequestFullScreen();
      } else if (el.msRequestFullscreen) {
        await el.msRequestFullscreen();
      } else {
        return false;
      }
      return true;
    } catch (e) {
      console.warn('进入全屏失败:', e);
      return false;
    }
  },
  
  async exit() {
    if (!this.isEnabled) return false;
    
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        await document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        await document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        await document.msExitFullscreen();
      } else {
        return false;
      }
      return true;
    } catch (e) {
      console.warn('退出全屏失败:', e);
      return false;
    }
  },
  
  async toggle(element) {
    if (this.isFullscreen) {
      return this.exit();
    } else {
      return this.enter(element);
    }
  }
};

// 安全的语音合成 API 封装
export const SpeechAPI = {
  get isSupported() {
    return FeatureSupport.speechSynthesis;
  },
  
  async speak(text, options = {}) {
    if (!this.isSupported) {
      console.warn('语音合成不支持');
      return false;
    }
    
    try {
      // 取消之前的语音
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = options.lang || 'en-US';
      utterance.rate = options.rate || 0.9;
      utterance.pitch = options.pitch || 1;
      utterance.volume = options.volume || 1;
      
      // 获取语音列表
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0 && options.voice) {
        const voice = voices.find(v => v.lang.includes(options.voice)) || voices[0];
        utterance.voice = voice;
      }
      
      window.speechSynthesis.speak(utterance);
      return true;
    } catch (e) {
      console.warn('语音合成失败:', e);
      return false;
    }
  },
  
  cancel() {
    if (this.isSupported) {
      window.speechSynthesis.cancel();
    }
  }
};

// 键盘事件兼容性处理
export function normalizeKeyboardEvent(event) {
  // 标准化键盘事件属性
  return {
    key: event.key || event.keyCode,
    code: event.code,
    ctrlKey: event.ctrlKey || event.metaKey, // Mac 上使用 metaKey
    shiftKey: event.shiftKey,
    altKey: event.altKey,
    metaKey: event.metaKey,
    // 检查是否是修饰键组合
    isModifier: event.ctrlKey || event.metaKey || event.shiftKey || event.altKey,
    // 原始事件
    originalEvent: event
  };
}

// 检查是否是 Mac
export function isMac() {
  return navigator.platform.toUpperCase().indexOf('MAC') >= 0;
}

// 获取快捷键显示文本（根据平台）
export function getShortcutText(shortcut) {
  if (isMac()) {
    return shortcut
      .replace('Ctrl', '⌘')
      .replace('Alt', '⌥')
      .replace('Shift', '⇧');
  }
  return shortcut;
}

// 导出所有内容
export default {
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
};
