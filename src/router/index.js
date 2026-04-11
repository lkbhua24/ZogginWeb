import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/userStore'

const routes = [
  {
    path: '/',
    name: 'index',
    component: () => import('../views/IndexPage.vue')
  },
  {
    path: '/study',
    name: 'study',
    component: () => import('../views/Study.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/media',
    name: 'media',
    component: () => import('../components/VideoPlayer.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/vocab',
    name: 'vocab',
    component: () => import('../views/VocabBook.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/speaking',
    name: 'speaking',
    component: () => import('../views/Speaking.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/stats',
    name: 'stats',
    component: () => import('../views/Stats.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('../views/Settings.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next({ name: 'index' })
  } else {
    next()
  }
})

export default router
