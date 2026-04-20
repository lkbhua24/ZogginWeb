<template>
  <div class="app-container" :class="{ 'focus-mode-active': isFocusMode }">
    <NavBar v-if="!isFocusMode || showNavInFocusMode" />

    <main class="app-main" :class="{ 'focus-mode-main': isFocusMode }">
      <router-view />
    </main>

    <div v-if="toastMessage && shouldShowToast" class="toast" :class="toastType">{{ toastMessage }}</div>

    <!-- 专注模式指示器 -->
    <div v-if="isFocusMode" class="focus-mode-indicator" @click="exitFocusMode">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="16"></line>
        <line x1="8" y1="12" x2="16" y2="12"></line>
      </svg>
      <span>专注模式</span>
    </div>
  </div>
</template>

<script setup>
import { ref, provide, readonly, computed, onMounted, watch } from 'vue'
import NavBar from './components/NavBar.vue'
import { shouldShowToast as checkToastAllowed } from './utils/focusMode.js'
import { useAnimation } from './utils/animationManager.js'
import { useUserStore } from './stores/userStore'
import { applyCompatibilityFixes, getCompatibilityReport } from './utils/browserCompatibility.js'

const userStore = useUserStore()
const toastMessage = ref('')
const toastType = ref('info')
let toastTimer = null

// 专注模式状态
const isFocusMode = ref(false)
const showNavInFocusMode = ref(false)

// 初始化动效管理器
const { enabled: animationsEnabled } = useAnimation({ store: userStore })

// 初始化浏览器兼容性设置
onMounted(() => {
  applyCompatibilityFixes()
  
  // 开发模式下输出兼容性报告
  if (import.meta.env.DEV) {
    const report = getCompatibilityReport()
    console.log('[Browser Compatibility]', report)
    
    if (report.issues.length > 0) {
      console.warn('[Browser Compatibility Issues]', report.issues)
    }
  }
})

// 计算是否应该显示toast
const shouldShowToast = computed(() => {
  return checkToastAllowed(toastType.value, toastMessage.value)
})

function showToast(message, type = 'info') {
  toastMessage.value = message
  toastType.value = type
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastMessage.value = ''
  }, 2000)
}

// 进入专注模式
function enterFocusMode(options = {}) {
  isFocusMode.value = true
  showNavInFocusMode.value = options.showNav || false
  document.body.classList.add('focus-mode-enabled')
}

// 退出专注模式
function exitFocusMode() {
  isFocusMode.value = false
  showNavInFocusMode.value = false
  document.body.classList.remove('focus-mode-enabled')
}

// 提供给子组件使用
provide('showToast', showToast)
provide('enterFocusMode', enterFocusMode)
provide('exitFocusMode', exitFocusMode)
provide('isFocusMode', readonly(isFocusMode))
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-main {
  flex: 1;
}

.toast {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translate3d(-50%, 0, 0);
  background: rgba(0, 0, 0, 0.75);
  color: white;
  padding: 0.6rem 1.5rem;
  border-radius: 8px;
  font-size: 0.9rem;
  z-index: 9999;
  animation: toast-fade var(--anim-duration-slow, 450ms) ease forwards;
  pointer-events: none;
  will-change: transform, opacity;
  backface-visibility: hidden;
}

@keyframes toast-fade {
  0% { opacity: 0; transform: translate3d(-50%, -10px, 0); }
  15% { opacity: 1; transform: translate3d(-50%, 0, 0); }
  85% { opacity: 1; transform: translate3d(-50%, 0, 0); }
  100% { opacity: 0; transform: translate3d(-50%, -10px, 0); }
}

/* ===== 专注模式样式 ===== */
.app-container.focus-mode-active {
  position: relative;
}

.focus-mode-main {
  position: relative;
  z-index: 50;
}

/* 专注模式指示器 */
.focus-mode-indicator {
  position: fixed;
  bottom: 20px;
  left: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: rgba(102, 126, 234, 0.9);
  color: white;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  z-index: 9999;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  opacity: 0.6;
}

.focus-mode-indicator:hover {
  opacity: 1;
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.focus-mode-indicator svg {
  transition: transform 0.3s ease;
}

.focus-mode-indicator:hover svg {
  transform: rotate(90deg);
}

/* 专注模式下的 toast 样式 */
.toast.study,
.toast.learning {
  background: rgba(102, 126, 234, 0.9);
}

.toast.error {
  background: rgba(239, 68, 68, 0.9);
}

/* 全局专注模式遮罩 */
body.focus-mode-enabled::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(
    ellipse at center,
    transparent 0%,
    transparent 40%,
    rgba(0, 0, 0, 0.03) 100%
  );
  pointer-events: none;
  z-index: 30;
}

/* ===== 深色模式全局样式 ===== */
[data-theme="dark"] {
  color-scheme: dark;
}

[data-theme="dark"] body {
  background-color: #0f172a;
  color: #e2e8f0;
}

/* 深色模式下的导航栏适配 */
[data-theme="dark"] .navbar.app {
  background: rgba(15, 23, 42, 0.85) !important;
  color: #e2e8f0;
}

[data-theme="dark"] .navbar.app.nav-hover {
  background: rgba(30, 41, 59, 0.95) !important;
}

[data-theme="dark"] .navbar-logo,
[data-theme="dark"] .nav-link,
[data-theme="dark"] .user-name {
  color: #e2e8f0;
}

[data-theme="dark"] .nav-link {
  background: rgba(255, 255, 255, 0.1);
}

[data-theme="dark"] .nav-link:hover {
  background: rgba(255, 255, 255, 0.15);
}

[data-theme="dark"] .user-avatar {
  background: rgba(255, 255, 255, 0.15);
  color: #e2e8f0;
}

[data-theme="dark"] .user-trigger:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* 深色模式下拉菜单 */
[data-theme="dark"] .user-dropdown {
  background: #1e293b;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
}

[data-theme="dark"] .dropdown-item {
  color: #e2e8f0;
}

[data-theme="dark"] .dropdown-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

[data-theme="dark"] .dropdown-divider {
  background: rgba(255, 255, 255, 0.1);
}

[data-theme="dark"] .dropdown-section-title {
  color: #94a3b8;
}

/* ===== 护眼模式全局样式 ===== */
[data-theme="eye-care"] {
  color-scheme: light;
}

[data-theme="eye-care"] body {
  background-color: #f5f0e8;
}

/* 护眼模式下的柔和文字颜色 */
[data-theme="eye-care"] .navbar.app {
  background: rgba(245, 240, 232, 0.9) !important;
}

[data-theme="eye-care"] .navbar.app.nav-hover {
  background: rgba(235, 228, 218, 0.95) !important;
}

[data-theme="eye-care"] .navbar-logo,
[data-theme="eye-care"] .nav-link,
[data-theme="eye-care"] .user-name {
  color: #5c5550;
}

[data-theme="eye-care"] .user-days {
  color: #8b8078;
}

[data-theme="eye-care"] .nav-link {
  background: rgba(92, 85, 80, 0.08);
}

[data-theme="eye-care"] .nav-link:hover {
  background: rgba(92, 85, 80, 0.12);
}

[data-theme="eye-care"] .nav-link.active {
  background: rgba(102, 126, 234, 0.15);
}

/* 护眼模式下拉菜单 */
[data-theme="eye-care"] .user-dropdown {
  background: #faf7f2;
  box-shadow: 0 8px 30px rgba(92, 85, 80, 0.15);
}

[data-theme="eye-care"] .dropdown-item {
  color: #5c5550;
}

[data-theme="eye-care"] .dropdown-item:hover {
  background: rgba(92, 85, 80, 0.08);
}

[data-theme="eye-care"] .dropdown-divider {
  background: rgba(92, 85, 80, 0.12);
}

/* 护眼模式学习页面背景 */
[data-theme="eye-care"] .study-page {
  background: transparent;
}

/* 过渡动画 - 性能优化 */
body,
.navbar,
.user-dropdown,
.dropdown-item,
.nav-link {
  transition: background-color var(--anim-duration-normal, 300ms) var(--anim-easing-standard, cubic-bezier(0.4, 0, 0.2, 1)),
              color var(--anim-duration-normal, 300ms) var(--anim-easing-standard, cubic-bezier(0.4, 0, 0.2, 1));
}
</style>
