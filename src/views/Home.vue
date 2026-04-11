<template>
  <div class="home-container">
    <div class="home-content">
      <section class="countdown-section">
        <div class="countdown-card">
          <div class="countdown-header">
            <span class="countdown-label">考试倒计时</span>
            <button class="settings-btn" @click="$emit('open-settings')">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </button>
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
          <div class="exam-date">目标日期：2026-12-25</div>
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
                  <span class="progress-target">30</span>
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
                  <span class="progress-target">50</span>
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

      <section class="streak-section">
        <div class="streak-card">
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
      </section>

      <section class="quick-actions">
        <h2 class="section-title">快捷入口</h2>
        <div class="actions-grid">
          <button class="action-card primary" @click="$emit('start-study')">
            <div class="action-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            </div>
            <span class="action-name">继续学习</span>
            <span class="action-desc">{{ dueWordsCount }} 词待复习</span>
          </button>

          <button class="action-card" @click="$emit('open-vocab')">
            <div class="action-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
            </div>
            <span class="action-name">单词本</span>
            <span class="action-desc">{{ totalWords }} 个单词</span>
          </button>

          <button class="action-card" @click="$emit('open-video')">
            <div class="action-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
                <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
              </svg>
            </div>
            <span class="action-name">视频学习</span>
            <span class="action-desc">{{ todayVideoMinutes }}/30 分钟</span>
          </button>

          <button class="action-card" @click="$emit('open-stats')">
            <div class="action-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
            </div>
            <span class="action-name">统计数据</span>
            <span class="action-desc">查看详情</span>
          </button>
        </div>
      </section>

      <section class="pronunciation-section">
        <h2 class="section-title">发音设置</h2>
        <div class="pronunciation-card">
          <div class="pronunciation-toggle">
            <button
              class="accent-btn"
              :class="{ active: accent === 'us' }"
              @click="accent = 'us'"
            >
              🇺🇸 美式发音
            </button>
            <button
              class="accent-btn"
              :class="{ active: accent === 'uk' }"
              @click="accent = 'uk'"
            >
              🇬🇧 英式发音
            </button>
          </div>
          <div class="pronunciation-demo">
            <button class="demo-word" @click="speakDemo('ephemeral')">ephemeral</button>
            <button class="demo-word" @click="speakDemo('serendipity')">serendipity</button>
            <button class="demo-word" @click="speakDemo('resilient')">resilient</button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useVocabStore } from '../stores/vocabStore';
import { useStudyStore } from '../stores/studyStore';
import { useUserStore } from '../stores/userStore';
import { getDueWords, getNewWords } from '../utils/srs';
import { speak } from '../utils/pronunciation';

export default {
  name: 'Home',
  emits: ['start-study', 'open-vocab', 'open-video', 'open-stats', 'open-settings'],
  setup() {
    const vocabStore = useVocabStore();
    const studyStore = useStudyStore();
    const userStore = useUserStore();

    const accent = ref('us');
    const countdown = ref({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    let countdownTimer = null;

    const circumference = 2 * Math.PI * 42;

    const todayNewWords = computed(() => {
      const today = new Date().toISOString().slice(0, 10);
      const todayLogs = studyStore.logs.filter(log => log.date.startsWith(today));
      const studiedIds = new Set();
      todayLogs.forEach(log => {
        log.wordsStudied.forEach(id => studiedIds.add(id));
      });
      const newWordIds = vocabStore.words.filter(w =>
        w.reviewHistory && w.reviewHistory.length > 0 &&
        w.reviewHistory[0].date.startsWith(today)
      );
      return Math.min(newWordIds.length, 30);
    });

    const todayReviewWords = computed(() => {
      const today = new Date().toISOString().slice(0, 10);
      const todayLogs = studyStore.logs.filter(log => log.date.startsWith(today));
      let total = 0;
      todayLogs.forEach(log => {
        total += log.wordsStudied.length;
      });
      return Math.min(total, 50);
    });

    const todayVideoMinutes = computed(() => {
      const today = new Date().toISOString().slice(0, 10);
      const todayLogs = studyStore.logs.filter(log =>
        log.date.startsWith(today) && log.sessionType === 'video'
      );
      return todayLogs.reduce((sum, log) => sum + Math.round(log.duration / 60000), 0);
    });

    const newWordsOffset = computed(() => {
      const progress = Math.min(todayNewWords.value / 30, 1);
      return circumference * (1 - progress);
    });

    const reviewWordsOffset = computed(() => {
      const progress = Math.min(todayReviewWords.value / 50, 1);
      return circumference * (1 - progress);
    });

    const videoOffset = computed(() => {
      const progress = Math.min(todayVideoMinutes.value / 30, 1);
      return circumference * (1 - progress);
    });

    const dueWordsCount = computed(() => {
      return getDueWords(vocabStore.words).length;
    });

    const totalWords = computed(() => vocabStore.words.length);

    const streakDays = computed(() => {
      if (studyStore.logs.length === 0) return 0;
      const sortedLogs = [...studyStore.logs]
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      let streak = 0;
      let checkDate = new Date();
      checkDate.setHours(0, 0, 0, 0);

      for (let i = 0; i < 365; i++) {
        const dateStr = checkDate.toISOString().slice(0, 10);
        const hasLog = sortedLogs.some(log => log.date.startsWith(dateStr));
        if (hasLog) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else if (i === 0) {
          checkDate.setDate(checkDate.getDate() - 1);
          continue;
        } else {
          break;
        }
      }
      return streak;
    });

    const weekHeatmap = computed(() => {
      const dayNames = ['日', '一', '二', '三', '四', '五', '六'];
      const result = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().slice(0, 10);
        const dayLogs = studyStore.logs.filter(log => log.date.startsWith(dateStr));
        const wordCount = dayLogs.reduce((sum, log) => sum + log.wordsStudied.length, 0);

        let level = 0;
        if (wordCount > 0) level = 1;
        if (wordCount >= 10) level = 2;
        if (wordCount >= 30) level = 3;
        if (wordCount >= 50) level = 4;

        result.push({
          dayName: dayNames[date.getDay()],
          level,
          label: `${dateStr}: ${wordCount} 词`
        });
      }
      return result;
    });

    function updateCountdown() {
      const target = new Date('2026-12-25T00:00:00');
      const now = new Date();
      const diff = target - now;

      if (diff <= 0) {
        countdown.value = { days: 0, hours: 0, minutes: 0, seconds: 0 };
        return;
      }

      countdown.value = {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60)
      };
    }

    function speakDemo(word) {
      speak(word, accent.value);
    }

    onMounted(async () => {
      await Promise.all([
        vocabStore.loadWords(),
        studyStore.loadLogs(),
        userStore.loadConfig()
      ]);
      updateCountdown();
      countdownTimer = setInterval(updateCountdown, 1000);
    });

    onBeforeUnmount(() => {
      if (countdownTimer) {
        clearInterval(countdownTimer);
      }
    });

    return {
      accent,
      countdown,
      circumference,
      todayNewWords,
      todayReviewWords,
      todayVideoMinutes,
      newWordsOffset,
      reviewWordsOffset,
      videoOffset,
      dueWordsCount,
      totalWords,
      streakDays,
      weekHeatmap,
      speakDemo
    };
  }
};
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background: #f0f2f5;
}

.home-content {
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

.streak-section {
  margin-bottom: 1.5rem;
}

.streak-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
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

.quick-actions {
  margin-bottom: 1.5rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.action-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  border: none;
  cursor: pointer;
  text-align: center;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.action-card.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.action-card.primary .action-desc {
  color: rgba(255, 255, 255, 0.8);
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
}

.action-card.primary .action-icon {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.action-name {
  font-size: 0.95rem;
  font-weight: 600;
}

.action-desc {
  font-size: 0.75rem;
  color: #999;
}

.pronunciation-section {
  margin-bottom: 1.5rem;
}

.pronunciation-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.pronunciation-toggle {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.accent-btn {
  flex: 1;
  padding: 0.6rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
  color: #555;
}

.accent-btn.active {
  border-color: #667eea;
  background: #eef2ff;
  color: #667eea;
  font-weight: 600;
}

.accent-btn:hover:not(.active) {
  border-color: #c7d2fe;
}

.pronunciation-demo {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.demo-word {
  padding: 0.4rem 0.8rem;
  background: #f0f2f5;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  color: #555;
  transition: all 0.2s;
}

.demo-word:hover {
  background: #eef2ff;
  color: #667eea;
}

@media (max-width: 768px) {
  .home-content {
    padding: 1rem;
  }

  .tasks-grid {
    grid-template-columns: 1fr;
  }

  .actions-grid {
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
}

@media (min-width: 769px) and (max-width: 1024px) {
  .tasks-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>