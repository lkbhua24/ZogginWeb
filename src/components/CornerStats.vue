<template>
  <div class="corner-stats" :class="{ 'expanded': isExpanded }" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
    <!-- 指示点 -->
    <div class="corner-indicator" @click="toggleExpand">
      <div class="indicator-dot" :class="{ 'active': hasData }"></div>
      <div class="indicator-pulse" v-if="hasData"></div>
    </div>

    <!-- 展开面板 -->
    <Transition name="corner-panel">
      <div v-if="isExpanded" class="corner-panel" @click.stop>
        <div class="panel-header">
          <span class="panel-title">今日学习</span>
          <button class="refresh-btn" @click="refreshStats" :disabled="loading" title="刷新数据">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ 'spinning': loading }">
              <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
            </svg>
          </button>
        </div>

        <div v-if="loading && !stats.studyDuration" class="panel-loading">
          <div class="mini-spinner"></div>
        </div>

        <div v-else-if="error" class="panel-error">
          <span class="error-text">加载失败</span>
          <button @click="refreshStats" class="retry-btn">重试</button>
        </div>

        <div v-else class="panel-content">
          <!-- 学习时长 -->
          <div class="stat-row">
            <div class="stat-icon">⏱️</div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.studyDuration?.formatted || '0分钟' }}</div>
              <div class="stat-label">学习时长</div>
            </div>
          </div>

          <!-- 单词统计 -->
          <div class="stat-row">
            <div class="stat-icon">📚</div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.wordsStudied?.total || 0 }} 词</div>
              <div class="stat-label">
                <span class="new-tag">新学 {{ stats.wordsStudied?.newWords || 0 }}</span>
                <span class="review-tag">复习 {{ stats.wordsStudied?.reviewWords || 0 }}</span>
              </div>
            </div>
          </div>

          <!-- 学习次数 -->
          <div class="stat-row small">
            <div class="stat-icon small">📝</div>
            <div class="stat-info">
              <div class="stat-value small">{{ stats.sessions || 0 }} 次学习</div>
            </div>
          </div>

          <!-- 进度条 -->
          <div class="mini-progress">
            <div class="progress-track">
              <div class="progress-fill" :style="{ width: dailyProgress + '%' }"></div>
            </div>
            <div class="progress-text">{{ dailyProgress }}% 今日目标</div>
          </div>
        </div>

        <div class="panel-footer">
          <span class="update-time">{{ updateTimeText }}</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { statsService } from '@/api';
import { FeatureSupport } from '@/utils/browserCompatibility.js';

const props = defineProps({
  // 自动刷新间隔（毫秒），默认30秒
  refreshInterval: {
    type: Number,
    default: 30000
  },
  // 每日目标单词数
  dailyGoal: {
    type: Number,
    default: 50
  },
  // 是否默认展开
  defaultExpanded: {
    type: Boolean,
    default: false
  }
});

const isExpanded = ref(props.defaultExpanded);
const loading = ref(false);
const error = ref(null);
const lastUpdateTime = ref(null);

// 统计数据
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
  sessions: 0
});

// 计算属性
const hasData = computed(() => {
  return stats.value.wordsStudied?.total > 0 || 
         stats.value.studyDuration?.minutes > 0 ||
         stats.value.sessions > 0;
});

// 浏览器兼容性：检查 IntersectionObserver 支持
const supportsIntersectionObserver = FeatureSupport.intersectionObserver;

const dailyProgress = computed(() => {
  const total = stats.value.wordsStudied?.total || 0;
  return Math.min(Math.round((total / props.dailyGoal) * 100), 100);
});

const updateTimeText = computed(() => {
  if (!lastUpdateTime.value) return '未更新';
  const diff = Date.now() - lastUpdateTime.value;
  if (diff < 60000) return '刚刚更新';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
  return `${Math.floor(diff / 3600000)}小时前`;
});

// 自动刷新定时器
let refreshTimer = null;
let collapseTimer = null;

// 方法
function toggleExpand() {
  isExpanded.value = !isExpanded.value;
  if (isExpanded.value) {
    refreshStats();
  }
}

function handleMouseEnter() {
  if (collapseTimer) {
    clearTimeout(collapseTimer);
    collapseTimer = null;
  }
  isExpanded.value = true;
  refreshStats();
}

function handleMouseLeave() {
  collapseTimer = setTimeout(() => {
    isExpanded.value = false;
  }, 300);
}

async function refreshStats() {
  if (loading.value) return;

  loading.value = true;
  error.value = null;

  try {
    const todayStats = await statsService.getTodayStats();
    
    if (todayStats) {
      stats.value = {
        studyDuration: todayStats.studyDuration || {
          milliseconds: 0,
          minutes: 0,
          formatted: '0分钟'
        },
        wordsStudied: todayStats.wordsStudied || {
          total: 0,
          newWords: 0,
          reviewWords: 0
        },
        sessions: todayStats.sessions || 0
      };
      lastUpdateTime.value = Date.now();
    }
  } catch (err) {
    console.error('获取学习统计失败:', err);
    error.value = err.message || '获取数据失败';
  } finally {
    loading.value = false;
  }
}

function startAutoRefresh() {
  if (refreshTimer) clearInterval(refreshTimer);
  refreshTimer = setInterval(() => {
    if (!isExpanded.value) {
      // 后台静默刷新
      refreshStats();
    }
  }, props.refreshInterval);
}

function stopAutoRefresh() {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
  if (collapseTimer) {
    clearTimeout(collapseTimer);
    collapseTimer = null;
  }
}

// 生命周期
onMounted(() => {
  refreshStats();
  startAutoRefresh();
});

onUnmounted(() => {
  stopAutoRefresh();
});

// 暴露方法供父组件调用
defineExpose({
  refreshStats,
  getStats: () => stats.value,
  getProgress: () => dailyProgress.value
});
</script>

<style scoped>
.corner-stats {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

/* 指示器 */
.corner-indicator {
  position: relative;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: transform var(--anim-duration-fast, 150ms) ease,
              box-shadow var(--anim-duration-fast, 150ms) ease;
  will-change: transform;
  backface-visibility: hidden;
}

.corner-indicator:hover {
  transform: scale3d(1.1, 1.1, 1);
}

.indicator-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #cbd5e1;
  transition: background var(--anim-duration-normal, 300ms) ease;
}

.indicator-dot.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.indicator-pulse {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  opacity: 0.3;
  animation: pulse 2s ease-out infinite;
}

@keyframes pulse {
  0% {
    transform: scale3d(1, 1, 1);
    opacity: 0.3;
  }
  100% {
    transform: scale3d(2, 2, 1);
    opacity: 0;
  }
}

/* 展开面板 */
.corner-panel {
  position: absolute;
  bottom: 44px;
  right: 0;
  width: 220px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.6);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.refresh-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  transition: all 0.2s;
}

.refresh-btn:hover:not(:disabled) {
  background: #f3f4f6;
  color: #667eea;
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.refresh-btn svg.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 加载和错误状态 */
.panel-loading {
  display: flex;
  justify-content: center;
  padding: 20px;
}

.mini-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #e5e7eb;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.panel-error {
  text-align: center;
  padding: 16px;
}

.error-text {
  font-size: 12px;
  color: #ef4444;
  display: block;
  margin-bottom: 8px;
}

.retry-btn {
  font-size: 12px;
  padding: 4px 12px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

/* 内容区域 */
.panel-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stat-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.stat-row.small {
  opacity: 0.8;
}

.stat-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.stat-icon.small {
  font-size: 14px;
}

.stat-info {
  flex: 1;
  min-width: 0;
}

.stat-value {
  font-size: 15px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.3;
}

.stat-value.small {
  font-size: 13px;
  font-weight: 600;
  color: #4b5563;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
  display: flex;
  gap: 8px;
}

.new-tag {
  color: #667eea;
  font-weight: 500;
}

.review-tag {
  color: #f59e0b;
  font-weight: 500;
}

/* 进度条 */
.mini-progress {
  margin-top: 4px;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.progress-track {
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 3px;
  transition: width var(--anim-duration-normal, 300ms) var(--anim-easing-standard, cubic-bezier(0.4, 0, 0.2, 1));
  will-change: width;
}

.progress-text {
  font-size: 11px;
  color: #6b7280;
  text-align: center;
  margin-top: 6px;
}

/* 底部 */
.panel-footer {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  text-align: center;
}

.update-time {
  font-size: 10px;
  color: #9ca3af;
}

/* 动画 - GPU加速优化 */
.corner-panel-enter-active,
.corner-panel-leave-active {
  will-change: transform, opacity;
  transition: transform var(--anim-duration-normal, 300ms) var(--anim-easing-smooth, cubic-bezier(0.34, 1.56, 0.64, 1)),
              opacity var(--anim-duration-normal, 300ms) ease;
  backface-visibility: hidden;
}

.corner-panel-enter-from,
.corner-panel-leave-to {
  opacity: 0;
  transform: translate3d(0, 10px, 0) scale3d(0.95, 0.95, 1);
}

/* ===== 响应式适配 ===== */

/* 超大屏 (2560px+) */
@media (min-width: 2560px) {
  .corner-stats {
    bottom: 32px;
    right: 32px;
  }
  
  .corner-indicator {
    width: 40px;
    height: 40px;
  }
  
  .indicator-dot {
    width: 12px;
    height: 12px;
  }
  
  .corner-panel {
    width: 260px;
    padding: 20px;
    bottom: 52px;
  }
  
  .panel-title {
    font-size: 16px;
  }
  
  .stat-value {
    font-size: 17px;
  }
  
  .stat-label {
    font-size: 13px;
  }
}

/* 大屏台式机 (1920px - 2559px) */
@media (max-width: 2559px) and (min-width: 1920px) {
  .corner-stats {
    bottom: 28px;
    right: 28px;
  }
  
  .corner-indicator {
    width: 36px;
    height: 36px;
  }
  
  .corner-panel {
    width: 240px;
    padding: 18px;
    bottom: 48px;
  }
}

/* 小笔记本 (1366px - 1439px) */
@media (max-width: 1439px) and (min-width: 1366px) {
  .corner-stats {
    bottom: 18px;
    right: 18px;
  }
}

/* 平板横屏 (992px - 1365px) */
@media (max-width: 1365px) and (min-width: 992px) {
  .corner-stats {
    bottom: 16px;
    right: 16px;
  }
  
  .corner-panel {
    width: 210px;
    padding: 14px;
  }
}

/* 移动端 (< 768px) */
@media (max-width: 767px) {
  .corner-stats {
    bottom: 12px;
    right: 12px;
  }

  .corner-indicator {
    width: 28px;
    height: 28px;
  }

  .indicator-dot {
    width: 8px;
    height: 8px;
  }

  .corner-panel {
    width: 190px;
    padding: 12px;
    bottom: 36px;
  }

  .panel-title {
    font-size: 12px;
  }

  .stat-value {
    font-size: 13px;
  }

  .stat-label {
    font-size: 10px;
  }
  
  .stat-row {
    gap: 8px;
  }
  
  .stat-icon {
    font-size: 16px;
  }
}

/* 全屏模式隐藏 */
:global(.fullscreen-mode) .corner-stats {
  opacity: 0;
  pointer-events: none;
}

/* ===== 浏览器兼容性处理 ===== */

/* Firefox 对 will-change 的优化 */
@-moz-document url-prefix() {
  .corner-panel-enter-active,
  .corner-panel-leave-active {
    will-change: auto;
  }
}

/* Safari 对 backdrop-filter 的支持 */
@supports (-webkit-backdrop-filter: blur(20px)) {
  .corner-panel {
    -webkit-backdrop-filter: blur(20px);
  }
}

/* Firefox 早期版本回退 */
@supports not ((backdrop-filter: blur(20px)) or (-webkit-backdrop-filter: blur(20px))) {
  .corner-panel {
    background: rgba(255, 255, 255, 0.98);
  }
  
  .corner-indicator {
    background: rgba(255, 255, 255, 0.98);
  }
}

/* 减少动效偏好支持 */
@media (prefers-reduced-motion: reduce) {
  .corner-indicator,
  .corner-panel,
  .indicator-dot,
  .progress-fill {
    transition: none !important;
    animation: none !important;
  }
  
  .corner-panel-enter-active,
  .corner-panel-leave-active {
    transition: opacity 100ms ease !important;
  }
  
  .corner-panel-enter-from,
  .corner-panel-leave-to {
    transform: none !important;
  }
}

/* iOS Safari 触摸高亮修复 */
@supports (-webkit-touch-callout: none) {
  .corner-indicator {
    -webkit-tap-highlight-color: transparent;
  }
}
</style>
