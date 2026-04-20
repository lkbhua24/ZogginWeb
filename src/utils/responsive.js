/**
 * 响应式设计工具 - 支持多尺寸屏幕适配
 * 覆盖笔记本、台式机等主流设备
 */

import { ref, computed, onMounted, onUnmounted } from 'vue';

// 断点定义 (px)
export const BREAKPOINTS = {
  mobile: 768,        // 移动端
  tablet: 992,        // 平板
  laptop: 1366,       // 笔记本 (小)
  laptopL: 1440,      // 笔记本 (大)
  desktop: 1920,      // 台式机
  desktopL: 2560      // 大屏台式机
};

// 屏幕尺寸分类
export const SCREEN_SIZE = {
  MOBILE: 'mobile',
  TABLET: 'tablet',
  LAPTOP: 'laptop',
  LAPTOP_L: 'laptopL',
  DESKTOP: 'desktop',
  DESKTOP_L: 'desktopL'
};

// 获取当前屏幕尺寸分类
export function getScreenSize(width = window.innerWidth) {
  if (width < BREAKPOINTS.mobile) return SCREEN_SIZE.MOBILE;
  if (width < BREAKPOINTS.tablet) return SCREEN_SIZE.TABLET;
  if (width < BREAKPOINTS.laptop) return SCREEN_SIZE.LAPTOP;
  if (width < BREAKPOINTS.laptopL) return SCREEN_SIZE.LAPTOP_L;
  if (width < BREAKPOINTS.desktop) return SCREEN_SIZE.DESKTOP;
  return SCREEN_SIZE.DESKTOP_L;
}

// 检查是否是小屏幕设备
export function isSmallScreen() {
  return window.innerWidth < BREAKPOINTS.laptop;
}

// 检查是否是笔记本
export function isLaptop() {
  const width = window.innerWidth;
  return width >= BREAKPOINTS.laptop && width < BREAKPOINTS.desktop;
}

// 检查是否是台式机
export function isDesktop() {
  return window.innerWidth >= BREAKPOINTS.desktop;
}

// 创建响应式 ref
export function useResponsive() {
  const width = ref(window.innerWidth);
  const height = ref(window.innerHeight);
  
  const screenSize = computed(() => getScreenSize(width.value));
  const isMobile = computed(() => width.value < BREAKPOINTS.mobile);
  const isTablet = computed(() => width.value >= BREAKPOINTS.mobile && width.value < BREAKPOINTS.tablet);
  const isLaptopSize = computed(() => width.value >= BREAKPOINTS.tablet && width.value < BREAKPOINTS.desktop);
  const isDesktopSize = computed(() => width.value >= BREAKPOINTS.desktop);
  
  // 视口比例 (用于字体缩放)
  const viewportScale = computed(() => {
    const baseWidth = 1920;
    return Math.min(Math.max(width.value / baseWidth, 0.75), 1.25);
  });

  let resizeTimer = null;
  
  function handleResize() {
    // 防抖处理
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      width.value = window.innerWidth;
      height.value = window.innerHeight;
    }, 100);
  }
  
  onMounted(() => {
    window.addEventListener('resize', handleResize, { passive: true });
  });
  
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
    clearTimeout(resizeTimer);
  });
  
  return {
    width,
    height,
    screenSize,
    isMobile,
    isTablet,
    isLaptopSize,
    isDesktopSize,
    viewportScale
  };
}

// 响应式字体大小计算
export function getResponsiveFontSize(baseSize, screenWidth = window.innerWidth) {
  if (screenWidth >= BREAKPOINTS.desktopL) return baseSize * 1.2;
  if (screenWidth >= BREAKPOINTS.desktop) return baseSize * 1.1;
  if (screenWidth >= BREAKPOINTS.laptopL) return baseSize * 1;
  if (screenWidth >= BREAKPOINTS.laptop) return baseSize * 0.95;
  if (screenWidth >= BREAKPOINTS.tablet) return baseSize * 0.9;
  return baseSize * 0.85;
}

// 响应式间距计算
export function getResponsiveSpacing(baseSpacing, screenWidth = window.innerWidth) {
  if (screenWidth >= BREAKPOINTS.desktopL) return baseSpacing * 1.3;
  if (screenWidth >= BREAKPOINTS.desktop) return baseSpacing * 1.15;
  if (screenWidth >= BREAKPOINTS.laptopL) return baseSpacing * 1;
  if (screenWidth >= BREAKPOINTS.laptop) return baseSpacing * 0.9;
  if (screenWidth >= BREAKPOINTS.tablet) return baseSpacing * 0.8;
  return baseSpacing * 0.7;
}

// 卡片尺寸配置
export const CARD_SIZE_CONFIG = {
  small: {
    width: { mobile: '94%', tablet: '560px', laptop: '600px', desktop: '640px' },
    fontSize: { word: '2.5rem', phonetic: '1.125rem' }
  },
  medium: {
    width: { mobile: '94%', tablet: '640px', laptop: '680px', desktop: '720px' },
    fontSize: { word: '4rem', phonetic: '1.375rem' }
  },
  large: {
    width: { mobile: '94%', tablet: '680px', laptop: '720px', desktop: '780px' },
    fontSize: { word: '5rem', phonetic: '1.625rem' }
  }
};

// 导出工具函数
export default {
  BREAKPOINTS,
  SCREEN_SIZE,
  getScreenSize,
  isSmallScreen,
  isLaptop,
  isDesktop,
  useResponsive,
  getResponsiveFontSize,
  getResponsiveSpacing,
  CARD_SIZE_CONFIG
};
