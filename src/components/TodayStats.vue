<template>
  <div class="today-stats">
    <div class="stats-header">
      <h2>今日学习数据</h2>
      <button class="refresh-btn" @click="loadStats" :disabled="loading">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
        </svg>
        刷新
      </button>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="loadStats">重试</button>
    </div>

    <div v-else class="stats-content">
      <div class="stat-item">
        <div class="stat-icon">⏱️</div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.studyDuration.formatted }}</div>
          <div class="stat-label">今日学习时长</div>
        </div>
        <div class="stat-detail">
          <span>{{ stats.studyDuration.minutes }} 分钟</span>
          <span class="divider">|</span>
          <span>{{ stats.sessions }} 次学习</span>
        </div>
      </div>

      <div class="stat-item">
        <div class="stat-icon">📚</div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.wordsStudied.total }}</div>
          <div class="stat-label">今日已背单词</div>
        </div>
        <div class="stat-detail">
          <span class="new-words">新学 {{ stats.wordsStudied.newWords }}</span>
          <span class="divider">|</span>
          <span class="review-words">复习 {{ stats.wordsStudied.reviewWords }}</span>
        </div>
      </div>

      <div class="progress-section">
        <div class="progress-item">
          <div class="progress-header">
            <span>新词学习进度</span>
            <span>{{ stats.wordsStudied.newWords }}/30</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill new" :style="{ width: newWordsProgress + '%' }"></div>
          </div>
        </div>

        <div class="progress-item">
          <div class="progress-header">
            <span>复习巩固进度</span>
            <span>{{ stats.wordsStudied.reviewWords }}/50</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill review" :style="{ width: reviewWordsProgress + '%' }"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="api-info">
      <p class="api-note">数据来源：学习数据统计API</p>
      <p class="update-time">更新时间：{{ stats.timestamp || '未更新' }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { api } from '@/api';

const loading = ref(false);
const error = ref(null);
const stats = ref({
  studyDuration: {
    milliseconds: 0,
    minutes: 0,
    formatted: '0分钟'
  },
  wordsStudied: {
    total: 0,
    newWords: 0,
    reviewWords: 0
  },
  sessions: 0,
  timestamp: null
});

const newWordsProgress = computed(() => {
  return Math.min((stats.value.wordsStudied.newWords / 30) * 100, 100);
});

const reviewWordsProgress = computed(() => {
  return Math.min((stats.value.wordsStudied.reviewWords / 50) * 100, 100);
});

async function loadStats() {
  loading.value = true;
  error.value = null;

  try {
    const response = await api.stats.getTodayStats();
    
    if (response.success) {
      stats.value = {
        ...response.data,
        timestamp: response.timestamp
      };
    } else {
      error.value = response.message || '获取统计数据失败';
    }
  } catch (err) {
    error.value = err.message || '网络请求失败';
    console.error('加载统计数据失败:', err);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadStats();
});
</script>

<style scoped>
.today-stats {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.stats-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f0f2f5;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  color: #555;
  transition: all 0.2s;
}

.refresh-btn:hover:not(:disabled) {
  background: #e4e6e9;
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f0f2f5;
  border-top-color: #667eea;
  border-radius: 50%;
  margin: 0 auto 1rem;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state button {
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.stats-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-icon {
  font-size: 2rem;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
}

.stat-label {
  font-size: 0.875rem;
  color: #666;
  margin-top: 0.25rem;
}

.stat-detail {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: #888;
}

.divider {
  color: #ddd;
}

.new-words {
  color: #667eea;
  font-weight: 500;
}

.review-words {
  color: #f59e0b;
  font-weight: 500;
}

.progress-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.progress-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: #666;
}

.progress-bar {
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-fill.new {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.progress-fill.review {
  background: linear-gradient(90deg, #f59e0b 0%, #f97316 100%);
}

.api-info {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
  font-size: 0.75rem;
  color: #999;
}

.api-note {
  margin: 0 0 0.25rem;
}

.update-time {
  margin: 0;
}
</style>
