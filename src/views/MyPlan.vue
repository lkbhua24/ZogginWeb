<template>
  <div class="myplan-container">
    <div v-if="isEmptyState" class="empty-state">
      <div class="empty-content">
        <div class="empty-icon">📅</div>
        <h2 class="empty-title">设置你的考试日期和每日目标</h2>
        <p class="empty-desc">制定学习计划，开启高效备考之旅</p>
        <router-link to="/settings" class="empty-action">立即设置</router-link>
      </div>
    </div>

    <div v-else class="myplan-content">
      <section class="countdown-section">
        <div class="countdown-card">
          <div class="countdown-header">
            <span class="countdown-label">考试倒计时</span>
            <router-link to="/settings" class="settings-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </router-link>
          </div>
          <div class="countdown-timer">
            <div class="time-block">
              <span class="time-number">{{ countdown.days }}</span>
              <span class="time-unit">天</span>
            </div>
            <div class="time-block">
              <span class="time-number">{{ countdown.hours }}</span>
              <span class="time-unit">时</span>
            </div>
            <div class="time-block">
              <span class="time-number">{{ countdown.minutes }}</span>
              <span class="time-unit">分</span>
            </div>
            <div class="time-block">
              <span class="time-number">{{ countdown.seconds }}</span>
              <span class="time-unit">秒</span>
            </div>
          </div>
          <div class="exam-date">目标日期：{{ examDateFormatted }}</div>
        </div>
      </section>

      <section class="tasks-section">
        <h2 class="section-title">今日任务</h2>
        <div class="tasks-grid">
          <div class="task-card">
            <div class="task-header">
              <span class="task-icon">📖</span>
              <span class="task-name">新词学习</span>
            </div>
            <div class="task-progress">
              <div class="progress-ring">
                <svg viewBox="0 0 100 100">
                  <circle class="progress-bg" cx="50" cy="50" r="42"></circle>
                  <circle
                    class="progress-fg"
                    cx="50" cy="50" r="42"
                    :stroke-dasharray="circumference"
                    :stroke-dashoffset="newWordsOffset"
                  ></circle>
                </svg>
                <div class="progress-text">
                  <span class="progress-current">{{ todayNewWords }}</span>
                  <span class="progress-sep">/</span>
                  <span class="progress-target">{{ dailyNewTarget }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="task-card">
            <div class="task-header">
              <span class="task-icon">🔄</span>
              <span class="task-name">复习巩固</span>
            </div>
            <div class="task-progress">
              <div class="progress-ring">
                <svg viewBox="0 0 100 100">
                  <circle class="progress-bg" cx="50" cy="50" r="42"></circle>
                  <circle
                    class="progress-fg review-fg"
                    cx="50" cy="50" r="42"
                    :stroke-dasharray="circumference"
                    :stroke-dashoffset="reviewWordsOffset"
                  ></circle>
                </svg>
                <div class="progress-text">
                  <span class="progress-current">{{ todayReviewWords }}</span>
                  <span class="progress-sep">/</span>
                  <span class="progress-target">{{ dailyReviewTarget }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="task-card">
            <div class="task-header">
              <span class="task-icon">🎬</span>
              <span class="task-name">视频学习</span>
            </div>
            <div class="task-progress">
              <div class="progress-ring">
                <svg viewBox="0 0 100 100">
                  <circle class="progress-bg" cx="50" cy="50" r="42"></circle>
                  <circle
                    class="progress-fg video-fg"
                    cx="50" cy="50" r="42"
                    :stroke-dasharray="circumference"
                    :stroke-dashoffset="videoOffset"
                  ></circle>
                </svg>
                <div class="progress-text">
                  <span class="progress-current">{{ todayVideoMinutes }}</span>
                  <span class="progress-unit">分钟</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="quick-start-section">
        <router-link to="/study" class="quick-start-btn">
          <span class="quick-start-icon">🚀</span>
          <div class="quick-start-info">
            <span class="quick-start-text">开始今日学习</span>
            <span class="quick-start-sub">{{ dueWordsCount }} 词待复习</span>
          </div>
        </router-link>
      </section>

      <section class="plan-overview-section">
        <h2 class="section-title">计划概览</h2>
        <div class="overview-grid">
          <div class="overview-card heatmap-card">
            <h3 class="card-title">本周学习</h3>
            <div class="streak-info">
              <span class="streak-icon">🔥</span>
              <div class="streak-detail">
                <span class="streak-count">{{ streakDays }}</span>
                <span class="streak-label">天连续学习</span>
              </div>
            </div>
            <div class="heatmap">
              <div
                v-for="(day, index) in weekHeatmap"
                :key="index"
                class="heatmap-cell"
                :class="'level-' + day.level"
                :title="day.label"
              >
                <span class="heatmap-day">{{ day.dayName }}</span>
              </div>
            </div>
          </div>

          <div class="overview-card progress-card">
            <h3 class="card-title">总体进度</h3>
            <div class="mastery-bar-container">
              <div class="mastery-bar" :style="{ width: masteryPercent + '%' }"></div>
            </div>
            <div class="mastery-info">
              <span class="mastery-mastered">已掌握 <strong>{{ masteredCount }}</strong></span>
              <span class="mastery-total">/ 总词汇 <strong>{{ totalWords }}</strong></span>
            </div>
          </div>

          <div class="overview-card calc-card">
            <h3 class="card-title">学习节奏</h3>
            <div class="calc-items">
              <div class="calc-item">
                <span class="calc-label">距离考试</span>
                <span class="calc-value">{{ daysRemaining }} 天</span>
              </div>
              <div class="calc-divider"></div>
              <div class="calc-item">
                <span class="calc-label">每日需学</span>
                <span class="calc-value highlight">{{ dailyVocabNeeded }} 词</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="recent-activity-section">
        <h2 class="section-title">最近活动</h2>
        <div class="activity-grid">
          <div class="activity-card">
            <div class="activity-icon">📝</div>
            <div class="activity-info">
              <h3 class="activity-title">上次学习</h3>
              <p v-if="lastStudyLog" class="activity-detail">{{ lastStudyLogInfo }}</p>
              <p v-else class="activity-detail no-data">暂无学习记录</p>
            </div>
          </div>

          <div class="activity-card review-card" :class="{ 'has-due': dueWordsCount > 0 }">
            <div class="activity-icon">🔔</div>
            <div class="activity-info">
              <h3 class="activity-title">待复习提醒</h3>
              <p v-if="dueWordsCount > 0" class="activity-detail">
                <strong>{{ dueWordsCount }}</strong> 个单词待复习
              </p>
              <p v-else class="activity-detail no-data">暂无待复习单词</p>
            </div>
            <router-link v-if="dueWordsCount > 0" to="/study" class="review-link">
              去复习 →
            </router-link>
          </div>
        </div>
      </section>

      <section class="account-section">
        <button class="logout-trigger" @click="showLogoutConfirm = true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          退出登录
        </button>
      </section>
    </div>

    <LogoutConfirm v-model:visible="showLogoutConfirm" @confirm="confirmLogout" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useVocabStore } from '../stores/vocabStore'
import { useStudyStore } from '../stores/studyStore'
import { useUserStore } from '../stores/userStore'
import { getDueWords } from '../utils/srs'
import LogoutConfirm from '../components/LogoutConfirm.vue'

const router = useRouter()
const vocabStore = useVocabStore()
const studyStore = useStudyStore()
const userStore = useUserStore()

const showLogoutConfirm = ref(false)

const countdown = ref({ days: 0, hours: 0, minutes: 0, seconds: 0 })
let countdownTimer = null

const circumference = 2 * Math.PI * 42

const effectiveExamDate = computed(() => {
  return userStore.studyPlan?.examDate || userStore.config.examDate || ''
})

const isEmptyState = computed(() => {
  return !effectiveExamDate.value
})

const examDateFormatted = computed(() => {
  return effectiveExamDate.value
})

const dailyNewTarget = computed(() => {
  return userStore.studyPlan?.dailyNewWords || userStore.config.dailyNewWords || 30
})

const dailyReviewTarget = computed(() => {
  return userStore.studyPlan?.dailyReviewLimit || userStore.config.dailyReviewLimit || 50
})

const todayNewWords = computed(() => {
  const today = new Date().toISOString().slice(0, 10)
  const newWordIds = vocabStore.words.filter(w =>
    w.reviewHistory && w.reviewHistory.length > 0 &&
    w.reviewHistory[0].date.startsWith(today)
  )
  return Math.min(newWordIds.length, dailyNewTarget.value)
})

const todayReviewWords = computed(() => {
  const today = new Date().toISOString().slice(0, 10)
  const todayLogs = studyStore.logs.filter(log => log.date.startsWith(today))
  let total = 0
  todayLogs.forEach(log => {
    total += log.wordsStudied.length
  })
  return Math.min(total, dailyReviewTarget.value)
})

const todayVideoMinutes = computed(() => {
  const today = new Date().toISOString().slice(0, 10)
  const todayLogs = studyStore.logs.filter(log =>
    log.date.startsWith(today) && log.sessionType === 'video'
  )
  return todayLogs.reduce((sum, log) => sum + Math.round(log.duration / 60000), 0)
})

const newWordsOffset = computed(() => {
  const progress = Math.min(todayNewWords.value / dailyNewTarget.value, 1)
  return circumference * (1 - progress)
})

const reviewWordsOffset = computed(() => {
  const progress = Math.min(todayReviewWords.value / dailyReviewTarget.value, 1)
  return circumference * (1 - progress)
})

const videoOffset = computed(() => {
  const progress = Math.min(todayVideoMinutes.value / 30, 1)
  return circumference * (1 - progress)
})

const dueWordsCount = computed(() => {
  return getDueWords(vocabStore.words).length
})

const totalWords = computed(() => vocabStore.words.length)

const masteredCount = computed(() => {
  return vocabStore.words.filter(w => w.mastery >= 4).length
})

const masteryPercent = computed(() => {
  if (totalWords.value === 0) return 0
  return Math.round((masteredCount.value / totalWords.value) * 100)
})

const daysRemaining = computed(() => {
  const examDate = effectiveExamDate.value
  if (!examDate) return 0
  const target = new Date(examDate)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24))
  return Math.max(diff, 0)
})

const dailyVocabNeeded = computed(() => {
  const remaining = totalWords.value - masteredCount.value
  if (remaining <= 0) return 0
  if (daysRemaining.value <= 0) return '∞'
  return Math.ceil(remaining / daysRemaining.value)
})

const streakDays = computed(() => {
  if (studyStore.logs.length === 0) return 0
  const sortedLogs = [...studyStore.logs]
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  let streak = 0
  let checkDate = new Date()
  checkDate.setHours(0, 0, 0, 0)

  for (let i = 0; i < 365; i++) {
    const dateStr = checkDate.toISOString().slice(0, 10)
    const hasLog = sortedLogs.some(log => log.date.startsWith(dateStr))
    if (hasLog) {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else if (i === 0) {
      checkDate.setDate(checkDate.getDate() - 1)
      continue
    } else {
      break
    }
  }
  return streak
})

const weekHeatmap = computed(() => {
  const dayNames = ['日', '一', '二', '三', '四', '五', '六']
  const result = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().slice(0, 10)
    const dayLogs = studyStore.logs.filter(log => log.date.startsWith(dateStr))
    const wordCount = dayLogs.reduce((sum, log) => sum + log.wordsStudied.length, 0)

    let level = 0
    if (wordCount > 0) level = 1
    if (wordCount >= 10) level = 2
    if (wordCount >= 30) level = 3
    if (wordCount >= 50) level = 4

    result.push({
      dayName: dayNames[date.getDay()],
      level,
      label: `${dateStr}: ${wordCount} 词`
    })
  }
  return result
})

const lastStudyLog = computed(() => {
  if (studyStore.logs.length === 0) return null
  const sorted = [...studyStore.logs].sort((a, b) => new Date(b.date) - new Date(a.date))
  return sorted[0]
})

const lastStudyLogInfo = computed(() => {
  if (!lastStudyLog.value) return ''
  const log = lastStudyLog.value
  const date = new Date(log.date)
  const timeAgo = getTimeAgo(date)
  const duration = Math.round(log.duration / 60000)
  return `${timeAgo} · 学习了 ${log.wordsStudied.length} 词 · ${duration} 分钟`
})

function getTimeAgo(date) {
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} 小时前`
  const days = Math.floor(hours / 24)
  return `${days} 天前`
}

function updateCountdown() {
  const examDate = effectiveExamDate.value
  if (!examDate) return
  const target = new Date(examDate + 'T00:00:00')
  const now = new Date()
  const diff = target - now

  if (diff <= 0) {
    countdown.value = { days: 0, hours: 0, minutes: 0, seconds: 0 }
    return
  }

  countdown.value = {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60)
  }
}

onMounted(async () => {
  await Promise.all([
    vocabStore.loadWords(),
    studyStore.loadLogs(),
    userStore.loadConfig(),
    userStore.loadPlan()
  ])
  if (userStore.config.examDate && !userStore.studyPlan?.examDate) {
    await userStore.updatePlan({
      examDate: userStore.config.examDate,
      dailyNewWords: userStore.config.dailyNewWords,
      dailyReviewLimit: userStore.config.dailyReviewLimit
    })
  }
  updateCountdown()
  countdownTimer = setInterval(updateCountdown, 1000)
})

async function confirmLogout() {
  showLogoutConfirm.value = false
  await userStore.logout()
  router.push('/')
}

onBeforeUnmount(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
})
</script>

<style scoped>
.myplan-container {
  min-height: 100vh;
  background: #f0f2f5;
}

.empty-state {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.empty-content {
  text-align: center;
  max-width: 400px;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 0.75rem;
}

.empty-desc {
  font-size: 1rem;
  color: #888;
  margin-bottom: 2rem;
}

.empty-action {
  display: inline-block;
  padding: 0.8rem 2.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.empty-action:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}

.myplan-content {
  max-width: 960px;
  margin: 0 auto;
  padding: 1.5rem;
}

.countdown-section {
  margin-bottom: 1.5rem;
}

.countdown-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 1.5rem;
  color: white;
}

.countdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.countdown-label {
  font-size: 1.1rem;
  font-weight: 600;
  opacity: 0.9;
}

.settings-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  border-radius: 8px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
  text-decoration: none;
}

.settings-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.countdown-timer {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  margin-bottom: 0.75rem;
}

.time-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 0.75rem 1rem;
  min-width: 64px;
}

.time-number {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
}

.time-unit {
  font-size: 0.75rem;
  opacity: 0.8;
  margin-top: 0.25rem;
}

.exam-date {
  text-align: center;
  font-size: 0.85rem;
  opacity: 0.7;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.75rem;
}

.tasks-section {
  margin-bottom: 1.5rem;
}

.tasks-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.task-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.task-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.task-icon {
  font-size: 1.25rem;
}

.task-name {
  font-size: 0.9rem;
  font-weight: 500;
  color: #555;
}

.task-progress {
  display: flex;
  justify-content: center;
}

.progress-ring {
  position: relative;
  width: 100px;
  height: 100px;
}

.progress-ring svg {
  transform: rotate(-90deg);
  width: 100%;
  height: 100%;
}

.progress-bg {
  fill: none;
  stroke: #e9ecef;
  stroke-width: 8;
}

.progress-fg {
  fill: none;
  stroke: #667eea;
  stroke-width: 8;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.6s ease;
}

.progress-fg.review-fg {
  stroke: #f59e0b;
}

.progress-fg.video-fg {
  stroke: #10b981;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  display: flex;
  align-items: baseline;
  gap: 1px;
}

.progress-current {
  font-size: 1.4rem;
  font-weight: 700;
  color: #333;
}

.progress-sep {
  font-size: 0.9rem;
  color: #999;
}

.progress-target {
  font-size: 0.9rem;
  color: #999;
}

.progress-unit {
  font-size: 0.7rem;
  color: #999;
  margin-left: 2px;
}

.quick-start-section {
  margin-bottom: 1.5rem;
}

.quick-start-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  width: 100%;
  padding: 1.25rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 16px;
  text-decoration: none;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.quick-start-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.45);
}

.quick-start-icon {
  font-size: 2rem;
}

.quick-start-info {
  display: flex;
  flex-direction: column;
}

.quick-start-text {
  font-size: 1.25rem;
  font-weight: 700;
}

.quick-start-sub {
  font-size: 0.85rem;
  opacity: 0.8;
  margin-top: 0.2rem;
}

.plan-overview-section {
  margin-bottom: 1.5rem;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.overview-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.card-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #555;
  margin-bottom: 1rem;
}

.streak-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.streak-icon {
  font-size: 2rem;
}

.streak-detail {
  display: flex;
  align-items: baseline;
  gap: 0.3rem;
}

.streak-count {
  font-size: 1.8rem;
  font-weight: 700;
  color: #f59e0b;
}

.streak-label {
  font-size: 0.85rem;
  color: #888;
}

.heatmap {
  display: flex;
  gap: 0.5rem;
  justify-content: space-between;
}

.heatmap-cell {
  flex: 1;
  aspect-ratio: 1;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #e9ecef;
  transition: background 0.2s;
}

.heatmap-cell.level-1 {
  background: #c6e48b;
}

.heatmap-cell.level-2 {
  background: #7bc96f;
}

.heatmap-cell.level-3 {
  background: #449e48;
}

.heatmap-cell.level-4 {
  background: #196127;
}

.heatmap-day {
  font-size: 0.7rem;
  color: #666;
  font-weight: 500;
}

.heatmap-cell.level-3 .heatmap-day,
.heatmap-cell.level-4 .heatmap-day {
  color: white;
}

.mastery-bar-container {
  width: 100%;
  height: 12px;
  background: #e9ecef;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 0.75rem;
}

.mastery-bar {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 6px;
  transition: width 0.6s ease;
  min-width: 0;
}

.mastery-info {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  font-size: 0.9rem;
}

.mastery-mastered {
  color: #667eea;
  font-weight: 500;
}

.mastery-mastered strong {
  font-size: 1.3rem;
  font-weight: 700;
}

.mastery-total {
  color: #999;
}

.mastery-total strong {
  font-weight: 600;
  color: #555;
}

.calc-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.calc-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.calc-label {
  font-size: 0.9rem;
  color: #888;
}

.calc-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: #333;
}

.calc-value.highlight {
  color: #667eea;
}

.calc-divider {
  height: 1px;
  background: #e9ecef;
}

.recent-activity-section {
  margin-bottom: 1.5rem;
}

.activity-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.activity-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.activity-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.activity-info {
  flex: 1;
  min-width: 0;
}

.activity-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #555;
  margin-bottom: 0.4rem;
}

.activity-detail {
  font-size: 0.85rem;
  color: #888;
  margin: 0;
  line-height: 1.5;
}

.activity-detail.no-data {
  color: #bbb;
  font-style: italic;
}

.review-card.has-due {
  border-left: 3px solid #f59e0b;
}

.review-link {
  display: inline-flex;
  align-items: center;
  font-size: 0.85rem;
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  white-space: nowrap;
  margin-top: 0.5rem;
  transition: color 0.2s;
}

.review-link:hover {
  color: #764ba2;
}

.account-section {
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
}

.logout-trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.5rem;
  background: none;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  color: #999;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.logout-trigger:hover {
  color: #e74c3c;
  border-color: #e74c3c;
  background: #fef2f2;
}

.logout-trigger svg {
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .myplan-content {
    padding: 1rem;
  }

  .tasks-grid {
    grid-template-columns: 1fr;
  }

  .overview-grid {
    grid-template-columns: 1fr;
  }

  .activity-grid {
    grid-template-columns: 1fr;
  }

  .time-block {
    min-width: 52px;
    padding: 0.5rem 0.75rem;
  }

  .time-number {
    font-size: 1.5rem;
  }

  .countdown-timer {
    gap: 0.5rem;
  }

  .quick-start-btn {
    padding: 1rem 1.5rem;
  }

  .quick-start-text {
    font-size: 1.1rem;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .tasks-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .overview-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
