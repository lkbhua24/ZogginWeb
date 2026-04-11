<template>
  <div class="stats-container">
    <div class="stats-header">
      <button class="back-btn" @click="$router.push('/')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
        返回
      </button>
      <h1 class="stats-title">学习统计</h1>
    </div>

    <div class="stats-content">
      <section class="detail-section">
        <div class="detail-grid">
          <div class="detail-card">
            <div class="detail-icon">⏱️</div>
            <div class="detail-info">
              <span class="detail-value">{{ formatDuration(detailedStats.totalDuration) }}</span>
              <span class="detail-label">总学习时长</span>
            </div>
          </div>
          <div class="detail-card">
            <div class="detail-icon">📝</div>
            <div class="detail-info">
              <span class="detail-value">{{ detailedStats.totalReviews }}</span>
              <span class="detail-label">总背诵次数</span>
            </div>
          </div>
          <div class="detail-card">
            <div class="detail-icon">📊</div>
            <div class="detail-info">
              <span class="detail-value">{{ detailedStats.avgDaily }}</span>
              <span class="detail-label">平均每日学习量</span>
            </div>
          </div>
        </div>
      </section>

      <section class="chart-section">
        <h2 class="section-title">词汇量趋势</h2>
        <div class="chart-card">
          <canvas ref="trendChartRef"></canvas>
        </div>
      </section>

      <section class="chart-section">
        <h2 class="section-title">记忆留存率</h2>
        <div class="chart-card">
          <canvas ref="retentionChartRef"></canvas>
        </div>
      </section>

      <section class="chart-section">
        <h2 class="section-title">学习热力图</h2>
        <div class="chart-card heatmap-card">
          <div class="heatmap-legend">
            <span class="legend-label">少</span>
            <div class="legend-cells">
              <span class="legend-cell level-0"></span>
              <span class="legend-cell level-1"></span>
              <span class="legend-cell level-2"></span>
              <span class="legend-cell level-3"></span>
              <span class="legend-cell level-4"></span>
            </div>
            <span class="legend-label">多</span>
          </div>
          <div class="heatmap-year">
            <div class="heatmap-months">
              <span
                v-for="month in heatmapMonths"
                :key="month.label"
                class="month-label"
                :style="{ paddingLeft: month.offset + 'px' }"
              >{{ month.label }}</span>
            </div>
            <div class="heatmap-body">
              <div class="heatmap-day-labels">
                <span class="day-label">一</span>
                <span class="day-label">三</span>
                <span class="day-label">五</span>
              </div>
              <div class="heatmap-grid">
                <div
                  v-for="(week, wi) in heatmapData"
                  :key="wi"
                  class="heatmap-week"
                >
                  <div
                    v-for="(day, di) in week"
                    :key="di"
                    class="heatmap-cell"
                    :class="'level-' + day.level"
                    :title="day.title"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="chart-section">
        <h2 class="section-title">能力评估</h2>
        <div class="chart-card radar-card">
          <canvas ref="radarChartRef"></canvas>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useVocabStore } from '../stores/vocabStore'
import { useStudyStore } from '../stores/studyStore'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const vocabStore = useVocabStore()
const studyStore = useStudyStore()

const trendChartRef = ref(null)
const retentionChartRef = ref(null)
const radarChartRef = ref(null)

let trendChart = null
let retentionChart = null
let radarChart = null

const detailedStats = computed(() => {
  const logs = studyStore.logs
  const totalDuration = logs.reduce((sum, log) => sum + log.duration, 0)
  const totalReviews = logs.reduce((sum, log) => sum + log.wordsStudied.length, 0)

  const daySet = new Set()
  logs.forEach(log => {
    daySet.add(log.date.slice(0, 10))
  })
  const totalDays = daySet.size || 1
  const avgDaily = Math.round(totalReviews / totalDays)

  return { totalDuration, totalReviews, avgDaily }
})

function formatDuration(ms) {
  if (!ms || ms <= 0) return '0分钟'
  const totalMinutes = Math.floor(ms / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours > 0) {
    return minutes > 0 ? `${hours}小时${minutes}分钟` : `${hours}小时`
  }
  return `${minutes}分钟`
}

function getTrendData() {
  const labels = []
  const data = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().slice(0, 10)
    labels.push(`${date.getMonth() + 1}/${date.getDate()}`)

    let count = 0
    vocabStore.words.forEach(word => {
      if (word.reviewHistory) {
        const hadMastery = word.reviewHistory.some(r => {
          return r.date.slice(0, 10) === dateStr && r.mastery >= 3
        })
        if (hadMastery) count++
      }
    })
    data.push(count)
  }

  return { labels, data }
}

function getRetentionData() {
  const masteryLabels = ['未学习', '初识', '模糊', '熟悉', '掌握', '精通']
  const masteryColors = ['#e9ecef', '#f87171', '#fb923c', '#facc15', '#4ade80', '#22c55e']
  const data = [0, 0, 0, 0, 0, 0]

  vocabStore.words.forEach(word => {
    const m = Math.min(Math.max(word.mastery, 0), 5)
    data[m]++
  })

  return { labels: masteryLabels, data, colors: masteryColors }
}

function getHeatmapData() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const startDate = new Date(today)
  startDate.setDate(startDate.getDate() - 364)
  const dayOfWeek = startDate.getDay()
  const adjustedStart = new Date(startDate)
  adjustedStart.setDate(adjustedStart.getDate() - dayOfWeek)

  const durationMap = {}
  studyStore.logs.forEach(log => {
    const dateStr = log.date.slice(0, 10)
    if (!durationMap[dateStr]) durationMap[dateStr] = 0
    durationMap[dateStr] += log.duration
  })

  const maxDuration = Math.max(...Object.values(durationMap), 60000)

  const weeks = []
  let currentWeek = []
  const cursor = new Date(adjustedStart)

  while (cursor <= today || currentWeek.length < 7) {
    const dateStr = cursor.toISOString().slice(0, 10)
    const duration = durationMap[dateStr] || 0
    const ratio = duration / maxDuration

    let level = 0
    if (duration > 0) level = 1
    if (ratio > 0.25) level = 2
    if (ratio > 0.5) level = 3
    if (ratio > 0.75) level = 4

    const minutes = Math.round(duration / 60000)
    currentWeek.push({
      date: dateStr,
      level: cursor > today ? -1 : level,
      title: cursor > today ? '' : `${dateStr}: ${minutes}分钟`
    })

    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }

    cursor.setDate(cursor.getDate() + 1)
    if (cursor > today && currentWeek.length === 0) break
  }
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push({ date: '', level: -1, title: '' })
    }
    weeks.push(currentWeek)
  }

  return weeks
}

const heatmapData = computed(() => getHeatmapData())

const heatmapMonths = computed(() => {
  const months = []
  const data = heatmapData.value
  if (data.length === 0) return months

  const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  let lastMonth = -1

  data.forEach((week, wi) => {
    const firstValidDay = week.find(d => d.level >= 0 && d.date)
    if (firstValidDay && firstValidDay.date) {
      const month = new Date(firstValidDay.date).getMonth()
      if (month !== lastMonth) {
        months.push({ label: monthNames[month], offset: wi * 14 })
        lastMonth = month
      }
    }
  })

  return months
})

function getRadarData() {
  const logs = studyStore.logs
  const words = vocabStore.words

  const vocabScore = words.length > 0
    ? Math.round(words.reduce((sum, w) => sum + w.mastery, 0) / words.length / 5 * 100)
    : 0

  const speakingLogs = logs.filter(l => l.sessionType === 'speaking')
  const speakingScore = speakingLogs.length > 0
    ? Math.min(100, Math.round(speakingLogs.reduce((s, l) => s + l.accuracy, 0) / speakingLogs.length * 100))
    : 0

  const videoLogs = logs.filter(l => l.sessionType === 'video')
  const listeningScore = videoLogs.length > 0
    ? Math.min(100, Math.round(videoLogs.length * 10 + videoLogs.reduce((s, l) => s + l.duration, 0) / 60000 / 2))
    : 0

  const reviewLogs = logs.filter(l => l.sessionType === 'review')
  const readingScore = reviewLogs.length > 0
    ? Math.min(100, Math.round(reviewLogs.reduce((s, l) => s + l.wordsStudied.length, 0) / Math.max(1, reviewLogs.length) * 5))
    : 0

  const writingScore = logs.length > 0
    ? Math.min(100, Math.round(logs.reduce((s, l) => s + l.accuracy, 0) / logs.length * 80))
    : 0

  return {
    labels: ['听力', '口语', '阅读', '写作', '词汇'],
    data: [listeningScore, speakingScore, readingScore, writingScore, vocabScore]
  }
}

function createTrendChart() {
  if (!trendChartRef.value) return
  const { labels, data } = getTrendData()

  trendChart = new Chart(trendChartRef.value, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: '掌握单词数',
        data,
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#667eea',
        pointHoverRadius: 5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            maxTicksLimit: 10,
            font: { size: 11 }
          }
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(0,0,0,0.06)' },
          ticks: {
            stepSize: 1,
            font: { size: 11 }
          }
        }
      }
    }
  })
}

function createRetentionChart() {
  if (!retentionChartRef.value) return
  const { labels, data, colors } = getRetentionData()

  retentionChart = new Chart(retentionChartRef.value, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: '单词数',
        data,
        backgroundColor: colors,
        borderRadius: 6,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 12 } }
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(0,0,0,0.06)' },
          ticks: {
            stepSize: 1,
            font: { size: 11 }
          }
        }
      }
    }
  })
}

function createRadarChart() {
  if (!radarChartRef.value) return
  const { labels, data } = getRadarData()

  radarChart = new Chart(radarChartRef.value, {
    type: 'radar',
    data: {
      labels,
      datasets: [{
        label: '能力值',
        data,
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.2)',
        borderWidth: 2,
        pointBackgroundColor: '#667eea',
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          ticks: {
            stepSize: 20,
            font: { size: 10 },
            backdropColor: 'transparent'
          },
          pointLabels: {
            font: { size: 13, weight: '600' },
            color: '#555'
          },
          grid: { color: 'rgba(0,0,0,0.08)' },
          angleLines: { color: 'rgba(0,0,0,0.08)' }
        }
      }
    }
  })
}

onMounted(async () => {
  await Promise.all([
    vocabStore.loadWords(),
    studyStore.loadLogs()
  ])

  await nextTick()

  createTrendChart()
  createRetentionChart()
  createRadarChart()
})

onBeforeUnmount(() => {
  if (trendChart) trendChart.destroy()
  if (retentionChart) retentionChart.destroy()
  if (radarChart) radarChart.destroy()
})
</script>

<style scoped>
.stats-container {
  min-height: 100vh;
  background: #f0f2f5;
}

.stats-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.back-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  transition: background 0.2s;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.stats-title {
  font-size: 1.3rem;
  font-weight: 700;
}

.stats-content {
  max-width: 960px;
  margin: 0 auto;
  padding: 1.5rem;
}

.detail-section {
  margin-bottom: 1.5rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.detail-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.detail-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.detail-info {
  display: flex;
  flex-direction: column;
}

.detail-value {
  font-size: 1.3rem;
  font-weight: 700;
  color: #333;
}

.detail-label {
  font-size: 0.8rem;
  color: #999;
  margin-top: 0.15rem;
}

.chart-section {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.75rem;
}

.chart-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.heatmap-card {
  overflow-x: auto;
}

.heatmap-legend {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.75rem;
  justify-content: flex-end;
}

.legend-label {
  font-size: 0.75rem;
  color: #999;
}

.legend-cells {
  display: flex;
  gap: 2px;
}

.legend-cell {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.legend-cell.level-0 { background: #ebedf0; }
.legend-cell.level-1 { background: #9be9a8; }
.legend-cell.level-2 { background: #40c463; }
.legend-cell.level-3 { background: #30a14e; }
.legend-cell.level-4 { background: #216e39; }

.heatmap-year {
  min-width: 720px;
}

.heatmap-months {
  position: relative;
  height: 20px;
  margin-left: 30px;
}

.month-label {
  position: absolute;
  font-size: 0.7rem;
  color: #999;
}

.heatmap-body {
  display: flex;
  gap: 0;
}

.heatmap-day-labels {
  display: flex;
  flex-direction: column;
  gap: 0;
  width: 26px;
  flex-shrink: 0;
}

.day-label {
  height: 13px;
  font-size: 0.65rem;
  color: #999;
  display: flex;
  align-items: center;
  line-height: 1;
}

.heatmap-day-labels .day-label:nth-child(1) { margin-top: 0; }
.heatmap-day-labels .day-label:nth-child(2) { margin-top: 13px; }
.heatmap-day-labels .day-label:nth-child(3) { margin-top: 13px; }

.heatmap-grid {
  display: flex;
  gap: 3px;
}

.heatmap-week {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.heatmap-cell {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  background: #ebedf0;
}

.heatmap-cell.level-1 { background: #9be9a8; }
.heatmap-cell.level-2 { background: #40c463; }
.heatmap-cell.level-3 { background: #30a14e; }
.heatmap-cell.level-4 { background: #216e39; }
.heatmap-cell[level="-1"] { background: transparent; }

.radar-card {
  max-width: 400px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .stats-header {
    padding: 0.8rem 1rem;
  }

  .stats-content {
    padding: 1rem;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .detail-card {
    padding: 1rem;
  }

  .detail-value {
    font-size: 1.1rem;
  }
}
</style>
