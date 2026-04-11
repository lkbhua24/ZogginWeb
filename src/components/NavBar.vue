<template>
  <nav v-if="!userStore.isLoggedIn" class="navbar landing" :class="{ scrolled: isScrolled }">
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

  <header v-else class="navbar app">
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
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
              设置
            </router-link>
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
import LogoutConfirm from './LogoutConfirm.vue'

const router = useRouter()
const userStore = useUserStore()

const isScrolled = ref(false)
const isLoading = ref(false)
const drawerOpen = ref(false)
const userMenuOpen = ref(false)
const showLogoutConfirm = ref(false)
const userMenuRef = ref(null)

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
  if (e.ctrlKey && e.shiftKey && e.key === 'Q') {
    e.preventDefault()
    if (userStore.isLoggedIn && !showLogoutConfirm.value) {
      showLogoutConfirm.value = true
    }
    return
  }
  if (e.key === 'Escape') {
    if (showLogoutConfirm.value) {
      showLogoutConfirm.value = false
    } else if (drawerOpen.value) {
      closeDrawer()
    } else if (userMenuOpen.value) {
      userMenuOpen.value = false
    }
  }
}

watch(() => router.currentRoute.value.path, () => {
  userMenuOpen.value = false
})

onMounted(() => {
  window.addEventListener('scroll', handleNavScroll, { passive: true })
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleNavScroll)
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.navbar {
  width: 100%;
  z-index: 100;
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.navbar-inner {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  gap: 1rem;
}

.navbar-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 800;
  color: white;
  cursor: pointer;
  user-select: none;
  flex-shrink: 0;
  transition: color 0.3s;
}

.navbar-logo.text-logo {
  font-size: 1.5rem;
}

.navbar.landing.scrolled .navbar-logo {
  color: #333;
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
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s;
}

.landing-links a:hover {
  color: white;
}

.navbar.landing.scrolled .landing-links a {
  color: #666;
}

.navbar.landing.scrolled .landing-links a:hover {
  color: #667eea;
}

.app-links {
  flex-wrap: wrap;
  justify-content: center;
}

.nav-link {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.3);
}

.nav-link.active {
  background: rgba(255, 255, 255, 0.4);
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
  background: rgba(255, 255, 255, 0.15);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
}

.user-meta {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.user-name {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.95);
  font-weight: 600;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-days {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.65);
}

.chevron {
  color: rgba(255, 255, 255, 0.6);
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
  color: white;
  cursor: pointer;
  padding: 0.25rem;
  flex-shrink: 0;
}

.navbar.landing.scrolled .hamburger-btn {
  color: #333;
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

@media (max-width: 768px) {
  .navbar-inner {
    padding: 0.8rem 1rem;
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
