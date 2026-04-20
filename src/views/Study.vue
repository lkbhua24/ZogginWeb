<template>
  <StudyBackground :animated="true">
    <div class="study-page" :class="[fontSizeClass, { 'fullscreen-mode': isFullscreen }]">
      <div v-if="studyQueue.length === 0 && !showStats" class="empty-state">
        <div class="empty-content">
          <h2>暂无学习内容</h2>
          <p>词汇库为空，请先添加单词</p>
          <button class="btn-primary" @click="goBack">返回首页</button>
        </div>
      </div>

      <template v-else>
        <header class="study-header focus-safe-zone" data-focus-zone="header">
          <button class="back-btn focus-safe-zone" @click="goBack">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <span class="progress">{{ currentIndex + 1 }}/{{ studyQueue.length }}</span>
          <button class="settings-btn focus-safe-zone" @click="openSettings">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l-.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06-.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06-.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
        </header>

        <Transition name="word-slide" mode="out-in">
          <WordCard
            v-if="currentWord"
            :key="currentWord.id"
            :word="currentWord"
            :show-back="flipped"
            :is-fullscreen="isFullscreen"
            class="focus-safe-zone"
            data-focus-zone="card"
            @flip="toggleFlip"
            @play-audio="playAudio"
            @toggle-fullscreen="toggleFullscreen"
          />
        </Transition>

        <div class="controls focus-safe-zone" data-focus-zone="controls">
          <div class="progress-indicator">
            <div class="progress-indicator-bar" :style="{ width: (currentIndex / studyQueue.length) * 100 + '%' }"></div>
          </div>
          <button
            class="control-btn btn-forget"
            :class="{ 'btn-active': activeBtn === 'forget' }"
            @click="handleResponseWithFeedback(0, 'forget')"
            data-key="1"
          >
            忘记
          </button>
          <button
            class="control-btn btn-vague"
            :class="{ 'btn-active': activeBtn === 'vague' }"
            @click="handleResponseWithFeedback(1, 'vague')"
            data-key="2"
          >
            模糊
          </button>
          <button
            class="control-btn btn-know"
            :class="{ 'btn-active': activeBtn === 'know' }"
            @click="handleResponseWithFeedback(2, 'know')"
            data-key="3"
          >
            认识
          </button>
        </div>

        <!-- 极简提示 -->
        <Transition name="toast-fade">
          <div v-if="toastMessage" class="minimal-toast">
            {{ toastMessage }}
          </div>
        </Transition>

        <!-- 角落隐藏式学习统计展示 -->
        <CornerStats ref="cornerStats" :daily-goal="50" :refresh-interval="30000" />

        <div v-if="showStats" class="stats-modal">
          <div class="stats-content">
            <h2>学习完成</h2>
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-label">总单词数</span>
                <span class="stat-value">{{ studyStats.totalWords }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">正确率</span>
                <span class="stat-value">{{ Math.round(studyStats.accuracy * 100) }}%</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">学习时间</span>
                <span class="stat-value">{{ Math.round(studyStats.duration / 60) }} 分钟</span>
              </div>
            </div>
            <button class="btn-primary" @click="goBack">返回首页</button>
          </div>
        </div>
      </template>
    </div>
  </StudyBackground>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount, inject } from 'vue';
import { useRouter } from 'vue-router';
import { useVocabStore } from '../stores/vocabStore';
import { useStudyStore } from '../stores/studyStore';
import { useUserStore } from '../stores/userStore';
import { generateReviewPlan, calculateSRS } from '../utils/srs';
import { speak } from '../utils/pronunciation';
import { enableFocusMode, disableFocusMode } from '../utils/focusMode.js';
import { FullscreenAPI, FeatureSupport } from '../utils/browserCompatibility';
import { createShortcutManager, DEFAULT_SHORTCUTS } from '../utils/shortcutManager.js';
import StudyBackground from '../components/StudyBackground.vue';
import WordCard from '../components/WordCard.vue';
import CornerStats from '../components/CornerStats.vue';

export default {
  name: 'Study',
  components: {
    StudyBackground,
    WordCard,
    CornerStats
  },
  setup() {
    const router = useRouter();
    const vocabStore = useVocabStore();
    const studyStore = useStudyStore();
    const userStore = useUserStore();

    // 注入 App.vue 提供的专注模式控制
    const enterFocusMode = inject('enterFocusMode', null);
    const exitFocusMode = inject('exitFocusMode', null);

    // 字体大小设置
    const fontSizeClass = computed(() => {
      const size = userStore.config?.fontSize || 'medium'
      return `font-size-${size}`
    })

    const shortcuts = computed(() => userStore.config?.shortcuts || DEFAULT_SHORTCUTS)

    let shortcutManager = createShortcutManager(shortcuts.value)

    watch(() => shortcuts.value, (newShortcuts) => {
      shortcutManager = createShortcutManager(newShortcuts)
    }, { deep: true })

    const studyQueue = ref([]);
    const currentIndex = ref(0);
    const flipped = ref(false);
    const showStats = ref(false);
    const isFullscreen = ref(false);
    const studyStats = ref({
      totalWords: 0,
      correct: 0,
      duration: 0,
      accuracy: 0
    });
    const startTime = ref(Date.now());
    const touchStartX = ref(0);
    const touchStartY = ref(0);

    // 操作反馈状态
    const activeBtn = ref(null);
    const toastMessage = ref('');
    const cornerStats = ref(null);
    let toastTimer = null;

    const currentWord = computed(() => {
      return studyQueue.value[currentIndex.value] || null;
    });

    async function loadStudyQueue() {
      await vocabStore.loadWords();
      const plan = generateReviewPlan(vocabStore.words);
      studyQueue.value = [...plan.dueWords, ...plan.newWords];
      studyStats.value.totalWords = studyQueue.value.length;
    }

    function toggleFlip() {
      flipped.value = !flipped.value;
    }

    function playAudio(word) {
      speak(word, 'us');
    }

    async function handleResponseWithFeedback(quality, btnType) {
      // 触发震动反馈
      if (navigator.vibrate) {
        navigator.vibrate(30);
      }

      // 高亮按钮
      activeBtn.value = btnType;
      setTimeout(() => {
        activeBtn.value = null;
      }, 200);

      // 显示极简提示
      const messages = {
        'forget': '标记为忘记',
        'vague': '标记为模糊',
        'know': '标记为认识'
      };
      toastMessage.value = messages[btnType];
      if (toastTimer) clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        toastMessage.value = '';
      }, 800);

      // 调用原处理函数
      await handleResponse(quality);
    }

    async function handleResponse(quality) {
      if (!currentWord.value) return;

      const word = currentWord.value;
      const srsResult = calculateSRS(quality, word.easiness || 2.5, word.interval || 1);

      await vocabStore.updateWord(word.id, {
        mastery: Math.min(word.mastery + (quality > 1 ? 1 : 0), 5),
        nextReview: srsResult.nextReview,
        easiness: srsResult.easiness,
        interval: srsResult.interval,
        reviewHistory: [
          ...(word.reviewHistory || []),
          {
            date: new Date().toISOString(),
            quality
          }
        ]
      });

      if (quality > 1) {
        studyStats.value.correct++;
      }

      currentIndex.value++;
      flipped.value = false;

      if (currentIndex.value >= studyQueue.value.length) {
        completeStudy();
      }
    }

    async function completeStudy() {
      studyStats.value.duration = Date.now() - startTime.value;
      studyStats.value.accuracy = studyQueue.value.length > 0
        ? studyStats.value.correct / studyQueue.value.length
        : 0;

      await studyStore.addStudyLog({
        sessionType: 'review',
        wordsStudied: studyQueue.value.map(word => word.id),
        duration: studyStats.value.duration,
        accuracy: studyStats.value.accuracy
      });

      // 刷新角落统计数据
      if (cornerStats.value) {
        cornerStats.value.refreshStats();
      }

      showStats.value = true;
    }

    function goBack() {
      router.push('/');
    }

    function openSettings() {
      router.push('/settings');
    }

    function handleKeydown(e) {
      if (studyQueue.value.length === 0) return;

      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (shortcutManager.matches('studyFlip', e)) {
        e.preventDefault();
        toggleFlip();
        return;
      }

      if (shortcutManager.matches('studyResponseForget', e)) {
        handleResponse(0);
        return;
      }

      if (shortcutManager.matches('studyResponseVague', e)) {
        handleResponse(1);
        return;
      }

      if (shortcutManager.matches('studyResponseKnow', e)) {
        handleResponse(2);
        return;
      }

      if (shortcutManager.matches('studyFullscreen', e)) {
        e.preventDefault();
        toggleFullscreen();
        return;
      }

      if (shortcutManager.matches('studyExit', e)) {
        if (showStats.value) {
          e.preventDefault();
          showStats.value = false;
        } else if (flipped.value) {
          e.preventDefault();
          flipped.value = false;
        } else {
          e.preventDefault();
          goBack();
        }
        return;
      }
    }

    async function toggleFullscreen() {
      // 检查全屏 API 支持
      if (!FullscreenAPI.isEnabled) {
        console.warn('[Study] Fullscreen API not supported in this browser');
        return;
      }

      const studyArea = document.querySelector('.study-area');
      if (!studyArea) return;

      try {
        const success = await FullscreenAPI.toggle(studyArea);
        if (success) {
          isFullscreen.value = !!document.fullscreenElement;
        }
      } catch (e) {
        console.error('[Study] Fullscreen error:', e);
      }
    }

    function handleFullscreenChange() {
      isFullscreen.value = !!(document.fullscreenElement || 
                               document.webkitFullscreenElement || 
                               document.mozFullScreenElement ||
                               document.msFullscreenElement);
    }

    // ===== 点击保护机制 =====
    let clickInterceptor = null

    function setupClickProtection() {
      // 防止误触的全局点击拦截器
      clickInterceptor = (e) => {
        // 如果正在显示统计弹窗，允许所有点击
        if (showStats.value) return

        // 获取安全区域元素
        const wordCard = document.querySelector('.word-display')
        const controls = document.querySelector('.controls')
        const studyHeader = document.querySelector('.study-header')
        const fullscreenBtn = document.querySelector('.fullscreen-toggle-btn')

        // 检查点击是否在安全区域内
        let isInSafeZone = false

        // 1. 检查单词卡片区域（包括内部所有元素）
        if (wordCard && (wordCard === e.target || wordCard.contains(e.target))) {
          isInSafeZone = true
        }

        // 2. 检查控制按钮区域
        if (controls && (controls === e.target || controls.contains(e.target))) {
          isInSafeZone = true
        }

        // 3. 检查头部导航
        if (studyHeader && (studyHeader === e.target || studyHeader.contains(e.target))) {
          isInSafeZone = true
        }

        // 4. 检查全屏按钮
        if (fullscreenBtn && (fullscreenBtn === e.target || fullscreenBtn.contains(e.target))) {
          isInSafeZone = true
        }

        // 5. 检查是否是安全区域内的交互元素
        const safeParent = e.target.closest('.word-display, .controls, .study-header, .fullscreen-toggle-btn')
        if (safeParent) {
          isInSafeZone = true
        }

        // 6. 允许键盘相关操作
        const isKeyboardShortcut = e.target.closest('[data-key]')
        if (isKeyboardShortcut) {
          isInSafeZone = true
        }

        // 如果不在安全区域，阻止点击
        if (!isInSafeZone) {
          e.preventDefault()
          e.stopPropagation()
          console.log('[FocusMode] Blocked click outside safe zone')

          // 添加视觉反馈 - 显示安全区域提示
          showSafeZoneHint()
        }
      }

      // 使用捕获阶段拦截点击
      document.addEventListener('click', clickInterceptor, true)

      // 添加安全区域视觉提示
      addSafeZoneVisualCue()
    }

    function removeClickProtection() {
      if (clickInterceptor) {
        document.removeEventListener('click', clickInterceptor, true)
        clickInterceptor = null
      }
      removeSafeZoneVisualCue()
    }

    function showSafeZoneHint() {
      // 检查是否已有提示
      if (document.querySelector('.safe-zone-hint')) return

      const hint = document.createElement('div')
      hint.className = 'safe-zone-hint'
      hint.textContent = '点击学习区域以继续'
      hint.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.6);
        color: white;
        padding: 12px 24px;
        border-radius: 24px;
        font-size: 14px;
        z-index: 9998;
        pointer-events: none;
        animation: safeZoneHintFade 1.5s ease forwards;
      `

      // 添加动画样式
      if (!document.querySelector('#safe-zone-anim')) {
        const style = document.createElement('style')
        style.id = 'safe-zone-anim'
        style.textContent = `
          @keyframes safeZoneHintFade {
            0% { opacity: 0; transform: translate(-50%, -40%); }
            20% { opacity: 1; transform: translate(-50%, -50%); }
            80% { opacity: 1; transform: translate(-50%, -50%); }
            100% { opacity: 0; transform: translate(-50%, -60%); }
          }
        `
        document.head.appendChild(style)
      }

      document.body.appendChild(hint)
      setTimeout(() => hint.remove(), 1500)
    }

    function addSafeZoneVisualCue() {
      // 移除可能已存在的提示
      removeSafeZoneVisualCue()

      // 创建微妙的视觉边界提示
      const cue = document.createElement('div')
      cue.className = 'safe-zone-boundary-cue'
      cue.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: min(720px, 90vw);
        height: 70vh;
        border: 1px dashed rgba(102, 126, 234, 0.15);
        border-radius: 24px;
        pointer-events: none;
        z-index: 35;
        opacity: 0;
        transition: opacity 0.5s ease;
      `

      document.body.appendChild(cue)

      // 渐显提示
      requestAnimationFrame(() => {
        cue.style.opacity = '1'
        // 3秒后渐隐
        setTimeout(() => {
          cue.style.opacity = '0'
          setTimeout(() => cue.remove(), 500)
        }, 3000)
      })
    }

    function removeSafeZoneVisualCue() {
      const cue = document.querySelector('.safe-zone-boundary-cue')
      if (cue) cue.remove()
      const hint = document.querySelector('.safe-zone-hint')
      if (hint) hint.remove()
    }

    function handleTouchStart(e) {
      touchStartX.value = e.touches[0].clientX;
      touchStartY.value = e.touches[0].clientY;
    }

    function handleTouchEnd(e) {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const deltaX = touchEndX - touchStartX.value;
      const deltaY = touchEndY - touchStartY.value;

      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (deltaX > 0 && currentIndex.value > 0) {
          currentIndex.value--;
          flipped.value = false;
        } else if (deltaX < 0 && currentIndex.value < studyQueue.value.length - 1) {
          currentIndex.value++;
          flipped.value = false;
        }
      } else if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 50) {
        if (deltaY < 0) {
          handleResponse(2);
        } else {
          handleResponse(0);
        }
      }
    }

    onMounted(async () => {
      await loadStudyQueue();

      // 启用专注模式
      if (enterFocusMode) {
        enterFocusMode({ showNav: false });
      }
      enableFocusMode({
        allowedTypes: ['study', 'learning', 'review', 'error', 'success']
      });

      document.addEventListener('keydown', handleKeydown);
      document.addEventListener('touchstart', handleTouchStart, { passive: true });
      document.addEventListener('touchend', handleTouchEnd, { passive: true });
      const fullscreenEvents = [
        'fullscreenchange',
        'webkitfullscreenchange',
        'mozfullscreenchange',
        'MSFullscreenChange'
      ];
      fullscreenEvents.forEach(event => {
        document.addEventListener(event, handleFullscreenChange);
      });

      // 添加点击保护 - 延迟确保DOM已渲染
      setTimeout(() => {
        setupClickProtection();
      }, 100);
    });

    onBeforeUnmount(() => {
      // 退出专注模式
      if (exitFocusMode) {
        exitFocusMode();
      }
      disableFocusMode();

      document.removeEventListener('keydown', handleKeydown);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
      const fullscreenEvents = [
        'fullscreenchange',
        'webkitfullscreenchange',
        'mozfullscreenchange',
        'MSFullscreenChange'
      ];
      fullscreenEvents.forEach(event => {
        document.removeEventListener(event, handleFullscreenChange);
      });
      removeClickProtection();
    });

    return {
      studyQueue,
      currentIndex,
      currentWord,
      flipped,
      showStats,
      isFullscreen,
      studyStats,
      fontSizeClass,
      activeBtn,
      toastMessage,
      cornerStats,
      toggleFlip,
      playAudio,
      handleResponseWithFeedback,
      handleResponse,
      goBack,
      openSettings,
      toggleFullscreen,
      setupClickProtection,
      removeClickProtection
    };
  }
};
</script>

<style scoped>
.study-page {
  min-height: 100vh;
  height: 100vh;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-content {
  text-align: center;
  color: #4b5563;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 3rem;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.05);
}

.empty-content h2 {
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.empty-content p {
  font-size: 1.1rem;
  opacity: 0.8;
  margin-bottom: 2rem;
  color: #6b7280;
}

.study-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.8), transparent);
  z-index: 50;
}

.back-btn,
.settings-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4b5563;
  transition: all 0.2s ease;
}

.back-btn:hover,
.settings-btn:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: scale(1.05);
}

.progress {
  font-size: 14px;
  color: #4b5563;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 6px 12px;
  border-radius: 12px;
}

.controls {
  position: fixed;
  bottom: max(40px, env(safe-area-inset-bottom));
  left: 50%;
  transform: translateX(-50%);
  width: min(600px, calc(100vw - 40px));

  display: flex;
  gap: 12px;
  z-index: 100;

  padding: 0 20px;
}

.progress-indicator {
  position: absolute;
  top: -8px;
  left: 20px;
  right: 20px;
  height: 3px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

.progress-indicator-bar {
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.control-btn {
  flex: 1;
  height: 56px;
  border-radius: 16px;
  border: none;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform var(--anim-duration-fast, 150ms) ease,
              filter var(--anim-duration-fast, 150ms) ease,
              background-color 100ms ease;
  position: relative;
  overflow: hidden;
  will-change: transform;
  backface-visibility: hidden;
}

.btn-forget {
  background: rgba(248, 177, 177, 0.9);
  color: #7f1d1d;
}

.btn-vague {
  background: rgba(243, 220, 156, 0.9);
  color: #713f12;
}

.btn-know {
  background: rgba(184, 212, 183, 0.9);
  color: #14532d;
}

.control-btn:hover {
  transform: translate3d(0, -2px, 0);
  filter: brightness(1.05);
}

.control-btn:active {
  transform: translate3d(0, 0, 0) scale3d(0.98, 0.98, 1);
}

.control-btn::after {
  content: attr(data-key);
  position: absolute;
  bottom: 4px;
  right: 8px;
  font-size: 10px;
  opacity: 0.5;
  font-weight: 400;
}

.stats-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.stats-content {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 2rem;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 90%;
  text-align: center;
}

.stats-content h2 {
  margin-bottom: 2rem;
  color: #1f2937;
  font-size: 1.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 0.85rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: #1f2937;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.875rem 2rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

/* ===== 全屏专注模式样式 ===== */
.study-page.fullscreen-mode .study-header {
  opacity: 0;
  pointer-events: none;
  transform: translateY(-100%);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.study-page.fullscreen-mode .controls {
  opacity: 0;
  pointer-events: none;
  transform: translateY(100%);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 全屏模式下悬停显示导航（可选，方便用户退出） */
.study-page.fullscreen-mode:hover .study-header,
.study-page.fullscreen-mode:hover .controls {
  opacity: 0.15;
  transform: translateY(0);
  pointer-events: auto;
}

.study-page.fullscreen-mode .study-header:hover,
.study-page.fullscreen-mode .controls:hover {
  opacity: 1;
}

@media (max-width: 768px) {
  .study-header {
    height: 56px;
    padding: 0 16px;
  }

  .back-btn,
  .settings-btn {
    width: 36px;
    height: 36px;
  }

  .progress {
    font-size: 13px;
    padding: 5px 10px;
  }

  .controls {
    bottom: max(20px, env(safe-area-inset-bottom));
    width: calc(100vw - 24px);
    gap: 8px;
    padding: 0 12px;
  }

  .control-btn {
    height: 48px;
    font-size: 15px;
    border-radius: 12px;
  }

  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  /* 移动端全屏模式 */
  .study-page.fullscreen-mode .study-header,
  .study-page.fullscreen-mode .controls {
    transform: translateY(0);
  }
}

/* ===== 专注模式安全区域样式 ===== */
.focus-safe-zone {
  position: relative;
  z-index: 50;
}

/* 安全区域悬停效果 */
.study-page:hover .focus-safe-zone {
  /* 确保安全区域在交互时清晰可见 */
}

/* 统计弹窗显示时的特殊处理 */
.stats-modal {
  z-index: 1000 !important;
}

.stats-modal * {
  pointer-events: auto !important;
}

/* 确保空状态也受保护 */
.empty-state {
  position: relative;
  z-index: 50;
}

.empty-content {
  position: relative;
  z-index: 51;
}

/* 专注模式下禁用背景动画 */
body.focus-mode-enabled .study-background {
  animation-play-state: paused;
}

/* ===== 字体大小设置 ===== */
.font-size-small .control-btn {
  font-size: 14px;
}

.font-size-small .progress {
  font-size: 12px;
}

.font-size-small .empty-content h2 {
  font-size: 1.5rem;
}

.font-size-small .empty-content p {
  font-size: 0.95rem;
}

.font-size-small .stats-content h2 {
  font-size: 1.25rem;
}

.font-size-small .stat-value {
  font-size: 1.25rem;
}

.font-size-small .stat-label {
  font-size: 0.75rem;
}

.font-size-large .control-btn {
  font-size: 18px;
}

.font-size-large .progress {
  font-size: 16px;
}

.font-size-large .empty-content h2 {
  font-size: 2.1rem;
}

.font-size-large .empty-content p {
  font-size: 1.25rem;
}

.font-size-large .stats-content h2 {
  font-size: 1.75rem;
}

.font-size-large .stat-value {
  font-size: 1.75rem;
}

.font-size-large .stat-label {
  font-size: 0.95rem;
}

/* ===== 单词切换动效 - GPU加速优化 ===== */
.word-slide-enter-active,
.word-slide-leave-active {
  will-change: transform, opacity;
  transition: transform var(--anim-duration-normal, 300ms) var(--anim-easing-smooth, cubic-bezier(0.34, 1.56, 0.64, 1)),
              opacity var(--anim-duration-normal, 300ms) ease;
  backface-visibility: hidden;
  transform: translateZ(0);
}

.word-slide-enter-from {
  opacity: 0;
  transform: translate3d(60px, 0, 0) scale3d(0.92, 0.92, 1);
}

.word-slide-enter-to {
  opacity: 1;
  transform: translate3d(0, 0, 0) scale3d(1, 1, 1);
}

.word-slide-leave-from {
  opacity: 1;
  transform: translate3d(0, 0, 0) scale3d(1, 1, 1);
}

.word-slide-leave-to {
  opacity: 0;
  transform: translate3d(-60px, 0, 0) scale3d(0.92, 0.92, 1);
}

/* ===== 按钮高亮反馈 - 优化性能 ===== */
.control-btn.btn-active {
  transform: scale3d(0.95, 0.95, 1);
  filter: brightness(1.15);
  transition: transform 80ms ease, filter 80ms ease;
}

.btn-forget.btn-active {
  background: rgba(248, 113, 113, 1);
}

.btn-vague.btn-active {
  background: rgba(251, 191, 36, 1);
}

.btn-know.btn-active {
  background: rgba(74, 222, 128, 1);
}

/* ===== 极简提示 - 性能优化 ===== */
.minimal-toast {
  position: fixed;
  bottom: 140px;
  left: 50%;
  transform: translate3d(-50%, 0, 0);
  padding: 8px 20px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: white;
  font-size: 13px;
  border-radius: 20px;
  white-space: nowrap;
  z-index: 100;
  pointer-events: none;
  will-change: transform, opacity;
  backface-visibility: hidden;
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: transform var(--anim-duration-fast, 150ms) ease,
              opacity var(--anim-duration-fast, 150ms) ease;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translate3d(-50%, 10px, 0);
}

/* ===== 响应式适配 ===== */

/* 超大屏 (2560px+) */
@media (min-width: 2560px) {
  .study-header {
    height: 72px;
    padding: 0 40px;
  }
  
  .back-btn,
  .settings-btn {
    width: 48px;
    height: 48px;
  }
  
  .progress {
    font-size: 16px;
    padding: 8px 16px;
  }
  
  .controls {
    width: min(700px, 60vw);
    gap: 16px;
  }
  
  .control-btn {
    height: 64px;
    font-size: 18px;
  }
  
  .minimal-toast {
    bottom: 160px;
    font-size: 15px;
  }
}

/* 大屏台式机 (1920px - 2559px) */
@media (max-width: 2559px) and (min-width: 1920px) {
  .study-header {
    height: 68px;
    padding: 0 32px;
  }
  
  .controls {
    width: min(650px, 55vw);
  }
  
  .control-btn {
    height: 60px;
  }
}

/* 大笔记本 (1440px - 1919px) */
@media (max-width: 1919px) and (min-width: 1440px) {
  .controls {
    width: min(600px, 55vw);
  }
}

/* 小笔记本 (1366px - 1439px) */
@media (max-width: 1439px) and (min-width: 1366px) {
  .study-header {
    height: 56px;
    padding: 0 16px;
  }
  
  .controls {
    width: min(560px, 65vw);
    gap: 10px;
  }
  
  .control-btn {
    height: 52px;
    font-size: 15px;
    border-radius: 14px;
  }
}

/* 平板横屏/小笔记本 (992px - 1365px) */
@media (max-width: 1365px) and (min-width: 992px) {
  .study-header {
    height: 52px;
    padding: 0 16px;
  }
  
  .back-btn,
  .settings-btn {
    width: 36px;
    height: 36px;
  }
  
  .controls {
    width: min(520px, 70vw);
    gap: 10px;
    bottom: max(32px, env(safe-area-inset-bottom));
  }
  
  .control-btn {
    height: 48px;
    font-size: 14px;
    border-radius: 12px;
  }
  
  .stats-content {
    padding: 1.75rem;
  }
  
  .stats-grid {
    gap: 0.875rem;
  }
}

/* 平板竖屏 (768px - 991px) */
@media (max-width: 991px) and (min-width: 768px) {
  .study-header {
    height: 52px;
    padding: 0 16px;
  }
  
  .controls {
    width: calc(100vw - 48px);
    gap: 10px;
  }
  
  .control-btn {
    height: 52px;
  }
}

/* 移动端 (< 768px) */
@media (max-width: 767px) {
  .study-header {
    height: 52px;
    padding: 0 12px;
  }
  
  .back-btn,
  .settings-btn {
    width: 36px;
    height: 36px;
  }
  
  .progress {
    font-size: 12px;
    padding: 4px 10px;
  }
  
  .controls {
    width: calc(100vw - 24px);
    gap: 8px;
    bottom: max(20px, env(safe-area-inset-bottom));
    padding: 0 12px;
  }
  
  .control-btn {
    height: 48px;
    font-size: 14px;
    border-radius: 12px;
  }
  
  .control-btn::after {
    display: none;
  }
  
  .minimal-toast {
    bottom: 110px;
    font-size: 12px;
    padding: 6px 14px;
  }
  
  .stats-content {
    padding: 1.5rem;
    margin: 16px;
  }
  
  .stats-grid {
    gap: 0.75rem;
  }
  
  .stat-value {
    font-size: 1.25rem;
  }
}

/* 小屏移动端 (< 375px) */
@media (max-width: 374px) {
  .controls {
    gap: 6px;
  }
  
  .control-btn {
    height: 44px;
    font-size: 13px;
    border-radius: 10px;
  }
  
  .stats-content {
    padding: 1.25rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
}

/* ===== 浏览器兼容性处理 ===== */
.study-area.fullscreen {
  width: 100vw;
  height: 100vh;
  border-radius: 0;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  overflow: hidden;
}

/* Safari 全屏模式修复 */
@supports (-webkit-touch-callout: none) {
  .study-area.fullscreen {
    /* Safari 在全屏时的特殊处理 */
    min-height: -webkit-fill-available;
  }
}

/* Firefox 全屏模式修复 */
@-moz-document url-prefix() {
  .study-area.fullscreen {
    /* Firefox 在全屏时的特殊处理 */
    background: linear-gradient(135deg, #e0e7ff 0%, #d1e0ff 100%);
  }
}

/* 减少动效偏好支持 */
@media (prefers-reduced-motion: reduce) {
  .study-area,
  .word-container,
  .word-card,
  .control-btn {
    transition: none !important;
    animation: none !important;
  }
}
</style>
