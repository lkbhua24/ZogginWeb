<template>
  <!-- 顶部触发条 -->
  <div
    v-if="userStore.isLoggedIn && navHidden"
    class="nav-trigger-bar"
    @mouseenter="onTriggerEnter"
    @mouseleave="onTriggerLeave"
  ></div>

  <nav
    v-if="!userStore.isLoggedIn"
    class="navbar landing"
    :class="{ scrolled: isScrolled }"
  >
    <div class="navbar-inner">
      <div class="navbar-logo" @click="scrollToTop">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
        </svg>
        <span>Zoggin</span>
      </div>

      <div class="navbar-links landing-links">
        <a @click.prevent="smoothScroll('features')">功能</a>
        <a @click.prevent="smoothScroll('exam')">考研</a>
        <a @click.prevent="smoothScroll('trust')">关于</a>
      </div>

      <button class="navbar-cta" @click="handleStart" :disabled="isLoading">
        <span v-if="isLoading" class="spinner"></span>
        {{ isLoading ? '准备中...' : '开始学习' }}
      </button>

      <button class="hamburger-btn" @click="openDrawer">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
    </div>
  </nav>

  <header
    v-else
    class="navbar app"
    :class="{
      'nav-hidden': navHidden,
      'nav-visible': !navHidden,
      'nav-hover': isHovering
    }"
    :style="[gradientStyle, navOpacityStyle]"
    @mouseenter="onNavEnter"
    @mouseleave="onNavLeave"
  >
    <div class="navbar-inner">
      <a class="navbar-logo text-logo" @click.prevent="handleLogoClick">ZogginWeb</a>

      <nav class="navbar-links app-links">
        <router-link to="/" class="nav-link" :class="{ active: $route.path === '/' }">我的计划</router-link>
        <router-link to="/study" class="nav-link" :class="{ active: $route.path === '/study' }">学习</router-link>
        <router-link to="/media" class="nav-link" :class="{ active: $route.path === '/media' }">视频</router-link>
        <router-link to="/vocab" class="nav-link" :class="{ active: $route.path === '/vocab' }">单词本</router-link>
        <router-link to="/speaking" class="nav-link" :class="{ active: $route.path === '/speaking' }">口语</router-link>
        <router-link to="/stats" class="nav-link" :class="{ active: $route.path === '/stats' }">统计</router-link>
      </nav>

      <div class="navbar-user" ref="userMenuRef">
        <div class="user-trigger" @click="userMenuOpen = !userMenuOpen">
          <div class="user-avatar">{{ userInitial }}</div>
          <div class="user-meta">
            <span class="user-name">{{ userStore.userName }}</span>
            <span class="user-days">已学{{ userStore.studyDays }}天</span>
          </div>
          <svg class="chevron" :class="{ open: userMenuOpen }" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
        <Transition name="dropdown">
          <div v-if="userMenuOpen" class="user-dropdown">
            <router-link to="/" class="dropdown-item" @click="userMenuOpen = false">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              我的计划
            </router-link>
            <router-link to="/settings" class="dropdown-item" @click="userMenuOpen = false">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06-.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l-.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l-.06-.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
              设置
            </router-link>

            <!-- 主题模式切换 -->
            <div class="dropdown-divider"></div>
            <div class="dropdown-section-title">显示模式</div>
            <div class="theme-switcher">
              <button
                class="theme-option"
                :class="{ active: currentTheme === 'light' }"
                @click="setTheme('light')"
                title="浅色模式"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
                <span>浅色</span>
              </button>
              <button
                class="theme-option"
                :class="{ active: currentTheme === 'dark' }"
                @click="setTheme('dark')"
                title="深色模式"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
                <span>深色</span>
              </button>
              <button
                class="theme-option"
                :class="{ active: currentTheme === 'eye-care' }"
                @click="setTheme('eye-care')"
                title="护眼模式"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <span>护眼</span>
              </button>
            </div>

            <div class="dropdown-divider"></div>
            <button class="dropdown-item danger" @click="userMenuOpen = false; showLogoutConfirm = true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              退出
            </button>
          </div>
        </Transition>
      </div>

      <button class="hamburger-btn app-hamburger" @click="openDrawer">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
    </div>
  </header>

  <Teleport to="body">
    <Transition name="fade">
      <div v-if="drawerOpen" class="drawer-overlay" @click="closeDrawer"></div>
    </Transition>
    <div class="drawer" :class="{ open: drawerOpen }">
      <div class="drawer-header">
        <span class="drawer-title">{{ userStore.isLoggedIn ? userStore.userName : 'Zoggin' }}</span>
        <button class="drawer-close" @click="closeDrawer">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div v-if="!userStore.isLoggedIn" class="drawer-body">
        <a class="drawer-link" @click.prevent="closeDrawer(); smoothScroll('features')">功能</a>
        <a class="drawer-link" @click.prevent="closeDrawer(); smoothScroll('exam')">考研</a>
        <a class="drawer-link" @click.prevent="closeDrawer(); smoothScroll('trust')">关于</a>
        <button class="drawer-cta" @click="closeDrawer(); handleStart()" :disabled="isLoading">
          {{ isLoading ? '准备中...' : '开始学习' }}
        </button>
      </div>

      <div v-else class="drawer-body">
        <div class="drawer-user-info">
          <div class="drawer-avatar">{{ userInitial }}</div>
          <div>
            <div class="drawer-user-name">{{ userStore.userName }}</div>
            <div class="drawer-user-days">已学{{ userStore.studyDays }}天</div>
          </div>
        </div>
        <div class="drawer-divider"></div>
        <router-link to="/" class="drawer-link" :class="{ active: $route.path === '/' }" @click="closeDrawer">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          我的计划
        </router-link>
        <router-link to="/study" class="drawer-link" :class="{ active: $route.path === '/study' }" @click="closeDrawer">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
          </svg>
          学习
        </router-link>
        <router-link to="/media" class="drawer-link" :class="{ active: $route.path === '/media' }" @click="closeDrawer">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
          视频
        </router-link>
        <router-link to="/vocab" class="drawer-link" :class="{ active: $route.path === '/vocab' }" @click="closeDrawer">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
          单词本
        </router-link>
        <router-link to="/speaking" class="drawer-link" :class="{ active: $route.path === '/speaking' }" @click="closeDrawer">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
            <line x1="12" y1="19" x2="12" y2="23"></line>
            <line x1="8" y1="23" x2="16" y2="23"></line>
          </svg>
          口语
        </router-link>
        <router-link to="/stats" class="drawer-link" :class="{ active: $route.path === '/stats' }" @click="closeDrawer">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
          </svg>
          统计
        </router-link>
        <div class="drawer-divider"></div>
        <router-link to="/settings" class="drawer-link" @click="closeDrawer">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
          设置
        </router-link>
        <button class="drawer-link danger" @click="closeDrawer(); showLogoutConfirm = true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          退出
        </button>
      </div>
    </div>
  </Teleport>

  <LogoutConfirm v-model:visible="showLogoutConfirm" @confirm="confirmLogout" />
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'
import { generateTodayPalette, generateGradient, generateMorandiPalette } from '../utils/colorEngine.js'
import LogoutConfirm from './LogoutConfirm.vue'
import { FullscreenAPI, normalizeKeyboardEvent, isMac } from '../utils/browserCompatibility.js'
import { createShortcutManager, DEFAULT_SHORTCUTS } from '../utils/shortcutManager.js'

const router = useRouter()
const userStore = useUserStore()

const isScrolled = ref(false)
const isLoading = ref(false)
const drawerOpen = ref(false)
const userMenuOpen = ref(false)
const showLogoutConfirm = ref(false)
const userMenuRef = ref(null)

// 导航栏自动隐藏/显示状态
const navHidden = ref(false)
const isHovering = ref(false)
let hideNavTimer = null
let showNavTimer = null
let mouseY = 0
let lastMouseY = 0
let mouseMoveTimer = null

// 导航栏个性化设置
const navDisplayMode = computed(() => userStore.config?.navDisplayMode || 'auto')
const navHoverDelay = computed(() => userStore.config?.navHoverDelay || 3000)
const navOpacity = computed(() => userStore.config?.navOpacity || 85)
const shortcuts = computed(() => userStore.config?.shortcuts || DEFAULT_SHORTCUTS)

let shortcutManager = createShortcutManager(shortcuts.value)

watch(() => shortcuts.value, (newShortcuts) => {
  shortcutManager = createShortcutManager(newShortcuts)
}, { deep: true })

// 导航栏透明度样式
const navOpacityStyle = computed(() => {
  const opacity = navOpacity.value / 100
  return {
    '--nav-opacity': opacity,
    '--nav-opacity-hover': Math.min(opacity + 0.1, 1)
  }
})

// 当前主题
const currentTheme = computed(() => userStore.config?.theme || 'light')

// 动态渐变背景 - 根据主题调整
const palette = ref(generateTodayPalette())
const gradientStyle = computed(() => {
  // 护眼模式使用莫兰迪色系
  if (currentTheme.value === 'eye-care') {
    return {
      background: generateGradient(generateMorandiPalette())
    }
  }
  return {
    background: generateGradient(palette.value)
  }
})

// 切换主题
async function setTheme(theme) {
  await userStore.updateConfig({ theme })
  applyTheme(theme)
}

// 应用主题到文档
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme)

  // 更新 body 类名
  document.body.classList.remove('theme-light', 'theme-dark', 'theme-eye-care')
  document.body.classList.add(`theme-${theme}`)

  // 护眼模式特殊处理
  if (theme === 'eye-care') {
    document.documentElement.style.filter = 'sepia(15%) contrast(95%)'
  } else {
    document.documentElement.style.filter = ''
  }
}

const userInitial = computed(() => {
  return (userStore.userName || '学').charAt(0).toUpperCase()
})

function handleNavScroll() {
  isScrolled.value = window.scrollY > 20
}

function smoothScroll(id) {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function handleStart() {
  isLoading.value = true
  try {
    await userStore.login()
    router.push('/')
  } finally {
    isLoading.value = false
  }
}

function handleLogoClick() {
  if (router.currentRoute.value.path === '/') {
    scrollToTop()
  } else {
    router.push('/')
  }
}

function openDrawer() {
  drawerOpen.value = true
  document.body.style.overflow = 'hidden'
}

function closeDrawer() {
  drawerOpen.value = false
  document.body.style.overflow = ''
}

async function confirmLogout() {
  showLogoutConfirm.value = false
  await userStore.logout()
  router.push('/')
}

function handleClickOutside(e) {
  if (userMenuRef.value && !userMenuRef.value.contains(e.target)) {
    userMenuOpen.value = false
  }
}

function handleKeydown(e) {
  const keyEvent = normalizeKeyboardEvent(e)
  const currentPath = router.currentRoute.value.path

  if (shortcutManager.matches('navToggle', e)) {
    e.preventDefault()
    toggleNav()
    return
  }

  if (e.key === 'Escape') {
    if (FullscreenAPI.isFullscreen) {
      e.preventDefault()
      FullscreenAPI.exit()
      return
    }

    if (currentPath === '/study') {
      if (showLogoutConfirm.value) {
        e.preventDefault()
        showLogoutConfirm.value = false
        return
      } else if (drawerOpen.value) {
        e.preventDefault()
        closeDrawer()
        return
      } else if (userMenuOpen.value) {
        e.preventDefault()
        userMenuOpen.value = false
        return
      }
      return
    }

    if (showLogoutConfirm.value) {
      showLogoutConfirm.value = false
    } else if (drawerOpen.value) {
      closeDrawer()
    } else if (userMenuOpen.value) {
      userMenuOpen.value = false
    } else if (!navHidden.value && userStore.isLoggedIn) {
      hideNav()
    }
    return
  }

  if (shortcutManager.matches('navLogoutConfirm', e)) {
    e.preventDefault()
    if (userStore.isLoggedIn && !showLogoutConfirm.value) {
      showLogoutConfirm.value = true
    }
    return
  }
}

// 切换导航栏显示/隐藏
function toggleNav() {
  if (navHidden.value) {
    showNav()
  } else {
    hideNav()
  }
}

// 显示导航栏
function showNav() {
  clearTimeout(hideNavTimer)
  navHidden.value = false
  isHovering.value = true
}

// 隐藏导航栏
function hideNav() {
  clearTimeout(showNavTimer)
  // 固定模式下不自动隐藏
  if (navDisplayMode.value === 'fixed') {
    return
  }
  navHidden.value = true
  isHovering.value = false
}

// 鼠标进入触发条
function onTriggerEnter() {
  clearTimeout(hideNavTimer)
  showNavTimer = setTimeout(() => {
    showNav()
  }, 50)
}

// 鼠标离开触发条
function onTriggerLeave() {
  clearTimeout(showNavTimer)
}

// 鼠标进入导航栏
function onNavEnter() {
  clearTimeout(hideNavTimer)
  isHovering.value = true
}

// 鼠标离开导航栏
function onNavLeave() {
  isHovering.value = false
  // 固定模式下不自动隐藏
  if (navDisplayMode.value === 'fixed') {
    return
  }
  // 使用用户设置的延迟时间
  hideNavTimer = setTimeout(() => {
    if (!isHovering.value) {
      hideNav()
    }
  }, navHoverDelay.value)
}

// 监听鼠标移动，检测Y轴坐标
function handleMouseMove(e) {
  mouseY = e.clientY

  // 清除之前的定时器
  clearTimeout(mouseMoveTimer)

  // 使用防抖，避免频繁触发
  mouseMoveTimer = setTimeout(() => {
    // 如果鼠标向上移动（靠近顶部），且导航栏已隐藏，显示它
    if (mouseY < lastMouseY && mouseY < 100 && navHidden.value && userStore.isLoggedIn) {
      showNav()
    }
    lastMouseY = mouseY
  }, 100)
}

watch(() => router.currentRoute.value.path, () => {
  userMenuOpen.value = false
})

onMounted(() => {
  window.addEventListener('scroll', handleNavScroll, { passive: true })
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeydown)
  document.addEventListener('mousemove', handleMouseMove, { passive: true })

  // 初始化主题
  applyTheme(currentTheme.value)

  // 初始延迟后自动隐藏导航栏（登录状态下，且非固定模式）
  if (userStore.isLoggedIn && navDisplayMode.value !== 'fixed') {
    hideNavTimer = setTimeout(() => {
      hideNav()
    }, 1000)
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleNavScroll)
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('mousemove', handleMouseMove)
  document.body.style.overflow = ''

  // 清理定时器
  clearTimeout(hideNavTimer)
  clearTimeout(showNavTimer)
  clearTimeout(mouseMoveTimer)
})
</script>

<style scoped>
.navbar {
  width: 100%;
  z-index: 100;
}

/* 顶部触发条 */
.nav-trigger-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: rgba(255, 255, 255, 0.3);
  z-index: 99;
  cursor: pointer;
  transition: background 0.3s ease;
}

.nav-trigger-bar:hover {
  background: rgba(255, 255, 255, 0.6);
}

/* 导航栏隐藏/显示动画 - 线性渐变 + 上下浮动 */
.navbar.app {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  transition: opacity var(--anim-duration-fast, 150ms) linear, 
              transform var(--anim-duration-fast, 150ms) linear;
  will-change: opacity, transform;
}

.navbar.app.nav-hidden {
  opacity: 0;
  transform: translate3d(0, -20px, 0);
  pointer-events: none;
}

.navbar.app.nav-visible {
  opacity: var(--nav-opacity, 0.85);
  transform: translate3d(0, 0, 0);
  pointer-events: auto;
}

.navbar.app.nav-hover {
  opacity: var(--nav-opacity-hover, 0.95);
  /* backdrop-filter 添加多浏览器前缀支持 */
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/* Safari 对 backdrop-filter 的额外支持 */
@supports (-webkit-backdrop-filter: blur(12px)) {
  .navbar.app.nav-hover {
    -webkit-backdrop-filter: blur(12px);
  }
}

/* Firefox 早期版本回退 */
@supports not ((backdrop-filter: blur(12px)) or (-webkit-backdrop-filter: blur(12px))) {
  .navbar.app.nav-hover {
    background: rgba(255, 255, 255, 0.98) !important;
  }
}

/* 减少动效偏好支持 */
@media (prefers-reduced-motion: reduce) {
  .navbar.app {
    transition: none;
  }
  .navbar.app.nav-visible {
    transform: none;
  }
  .navbar.app.nav-hidden {
    transform: none;
  }
}

/* 浅色模式导航栏悬停 */
[data-theme="light"] .navbar.app.nav-hover,
.navbar.app.nav-hover {
  background: rgba(240, 240, 240, 0.85) !important;
}

.navbar.landing {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: transparent;
  transition: all 0.3s ease;
}

.navbar.landing.scrolled {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.06);
}

.navbar.app {
  color: #181D27;
}

.navbar-inner {
  max-width: var(--container-max-width);
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem var(--container-padding);
  gap: 1rem;
}

.navbar-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 800;
  color: #181D27;
  cursor: pointer;
  user-select: none;
  flex-shrink: 0;
  transition: color 0.3s;
}

.navbar-logo.text-logo {
  font-size: 1.5rem;
}

.navbar.landing.scrolled .navbar-logo {
  color: #181D27;
}

.navbar-links {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.landing-links {
  gap: 2rem;
}

.landing-links a {
  color: #181D27;
  opacity: 0.85;
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s;
}

.landing-links a:hover {
  color: #181D27;
  opacity: 1;
}

.navbar.landing.scrolled .landing-links a {
  color: #181D27;
  opacity: 0.85;
}

.navbar.landing.scrolled .landing-links a:hover {
  color: #181D27;
  opacity: 1;
}

.app-links {
  flex-wrap: wrap;
  justify-content: center;
}

.nav-link {
  background: rgba(24, 29, 39, 0.1);
  color: #181D27;
  border: none;
  padding: 0.5rem 1.25rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: clamp(0.8rem, 1.2vw, 0.9rem);
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
  white-space: nowrap;
}

.nav-link:hover {
  background: rgba(24, 29, 39, 0.15);
}

.nav-link.active {
  background: rgba(24, 29, 39, 0.2);
  font-weight: bold;
}

.navbar-cta {
  padding: 0.55rem 1.5rem;
  background: white;
  color: #667eea;
  border: none;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  flex-shrink: 0;
}

.navbar-cta:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.navbar.landing.scrolled .navbar-cta {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.navbar-cta:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(102, 126, 234, 0.3);
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  display: inline-block;
}

.navbar.landing.scrolled .spinner {
  border-color: rgba(255, 255, 255, 0.3);
  border-top-color: white;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.navbar-user {
  position: relative;
  flex-shrink: 0;
}

.user-trigger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.35rem 0.6rem;
  border-radius: 8px;
  transition: background 0.2s;
}

.user-trigger:hover {
  background: rgba(24, 29, 39, 0.08);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(24, 29, 39, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 700;
  color: #181D27;
  flex-shrink: 0;
}

.user-meta {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.user-name {
  font-size: 0.9rem;
  color: #181D27;
  font-weight: 600;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-days {
  font-size: 0.75rem;
  color: #181D27;
  opacity: 0.65;
}

.chevron {
  color: #181D27;
  opacity: 0.6;
  transition: transform 0.2s;
  flex-shrink: 0;
}

.chevron.open {
  transform: rotate(180deg);
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  min-width: 160px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  padding: 0.5rem;
  z-index: 200;
  transform-origin: top right;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem 0.85rem;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #333;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.15s;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  font-family: inherit;
}

.dropdown-item:hover {
  background: #f5f5f5;
}

.dropdown-item.danger {
  color: #e74c3c;
}

.dropdown-item.danger:hover {
  background: #fef2f2;
}

.dropdown-item svg {
  flex-shrink: 0;
  color: #999;
}

.dropdown-item.danger svg {
  color: #e74c3c;
}

.dropdown-divider {
  height: 1px;
  background: #f0f0f0;
  margin: 0.35rem 0.5rem;
}

.hamburger-btn {
  display: none;
  background: none;
  border: none;
  color: #181D27;
  cursor: pointer;
  padding: 0.25rem;
  flex-shrink: 0;
}

.navbar.landing.scrolled .hamburger-btn {
  color: #181D27;
}

.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 500;
}

.drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 280px;
  max-width: 80vw;
  background: white;
  z-index: 501;
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.drawer.open {
  transform: translateX(0);
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f0f0f0;
}

.drawer-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #333;
}

.drawer-close {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;
}

.drawer-close:hover {
  color: #333;
  background: #f5f5f5;
}

.drawer-body {
  padding: 0.75rem;
  flex: 1;
}

.drawer-user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
}

.drawer-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
}

.drawer-user-name {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}

.drawer-user-days {
  font-size: 0.8rem;
  color: #999;
  margin-top: 2px;
}

.drawer-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  font-size: 0.95rem;
  color: #555;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.15s;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  font-family: inherit;
}

.drawer-link:hover {
  background: #f5f5f5;
  color: #333;
}

.drawer-link.active {
  background: #eef2ff;
  color: #667eea;
  font-weight: 600;
}

.drawer-link.active svg {
  color: #667eea;
}

.drawer-link svg {
  color: #999;
  flex-shrink: 0;
}

.drawer-link.danger {
  color: #e74c3c;
}

.drawer-link.danger svg {
  color: #e74c3c;
}

.drawer-link.danger:hover {
  background: #fef2f2;
}

.drawer-divider {
  height: 1px;
  background: #f0f0f0;
  margin: 0.5rem 0.75rem;
}

.drawer-cta {
  display: block;
  width: calc(100% - 1.5rem);
  margin: 1rem 0.75rem 0;
  padding: 0.75rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  text-align: center;
}

.drawer-cta:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.dropdown-enter-active {
  transition: all 0.2s ease-out;
}

.dropdown-leave-active {
  transition: all 0.15s ease-in;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: scaleY(0.9) translateY(-4px);
}

/* ===== 主题切换器样式 ===== */
.dropdown-section-title {
  padding: 0.5rem 0.85rem;
  font-size: 0.75rem;
  color: #999;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.theme-switcher {
  display: flex;
  gap: 0.5rem;
  padding: 0.25rem 0.85rem 0.75rem;
}

.theme-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #666;
  font-size: 0.75rem;
}

.theme-option:hover {
  background: #f5f5f5;
  color: #333;
}

.theme-option.active {
  background: #eef2ff;
  border-color: #667eea;
  color: #667eea;
}

.theme-option svg {
  width: 18px;
  height: 18px;
}

/* 深色主题适配 */
[data-theme="dark"] .theme-option:hover {
  background: rgba(255, 255, 255, 0.1);
}

[data-theme="dark"] .theme-option.active {
  background: rgba(102, 126, 234, 0.2);
  border-color: #667eea;
}

/* ===== 响应式适配 ===== */

/* 超大屏 (2560px+) */
@media (min-width: 2560px) {
  .navbar-inner {
    max-width: 1600px;
    padding: 1.25rem 3rem;
  }
  
  .navbar-logo {
    font-size: 1.5rem;
  }
  
  .navbar-logo.text-logo {
    font-size: 1.75rem;
  }
  
  .nav-link {
    padding: 0.6rem 1.75rem;
    font-size: 1rem;
  }
  
  .user-name {
    max-width: 120px;
    font-size: 1rem;
  }
}

/* 大屏台式机 (1920px - 2559px) */
@media (max-width: 2559px) and (min-width: 1920px) {
  .navbar-inner {
    max-width: 1400px;
    padding: 1.1rem 2.5rem;
  }
  
  .navbar-logo {
    font-size: 1.35rem;
  }
  
  .navbar-logo.text-logo {
    font-size: 1.6rem;
  }
  
  .nav-link {
    padding: 0.55rem 1.5rem;
  }
}

/* 大笔记本 (1440px - 1919px) */
@media (max-width: 1919px) and (min-width: 1440px) {
  .navbar-inner {
    padding: 1rem 2rem;
  }
}

/* 小笔记本 (1366px - 1439px) */
@media (max-width: 1439px) and (min-width: 1366px) {
  .navbar-inner {
    padding: 0.9rem 1.5rem;
  }
  
  .nav-link {
    padding: 0.45rem 1.1rem;
    font-size: 0.85rem;
  }
  
  .user-meta {
    display: none;
  }
}

/* 平板横屏/小笔记本 (992px - 1365px) */
@media (max-width: 1365px) and (min-width: 992px) {
  .navbar-inner {
    padding: 0.85rem 1.25rem;
    gap: 0.75rem;
  }
  
  .navbar-logo {
    font-size: 1.1rem;
  }
  
  .navbar-logo.text-logo {
    font-size: 1.3rem;
  }
  
  .nav-link {
    padding: 0.4rem 0.9rem;
    font-size: 0.8rem;
  }
  
  .app-links {
    gap: 0.35rem;
  }
  
  .user-meta {
    display: none;
  }
}

/* 平板竖屏 (768px - 991px) */
@media (max-width: 991px) and (min-width: 768px) {
  .navbar-inner {
    padding: 0.8rem 1rem;
  }
  
  .app-links {
    display: none;
  }
  
  .hamburger-btn {
    display: block;
  }
}

/* 移动端 (< 768px) */
@media (max-width: 767px) {
  .navbar-inner {
    padding: 0.75rem 1rem;
  }

  .landing-links,
  .navbar-cta,
  .app-links,
  .navbar-user {
    display: none;
  }

  .hamburger-btn {
    display: block;
  }

  .navbar-logo {
    font-size: 1.1rem;
  }

  .navbar-logo.text-logo {
    font-size: 1.2rem;
  }
}
</style>
