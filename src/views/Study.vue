<template>
  <StudyBackground :animated="true">
    <div class="study-page">
      <div v-if="studyQueue.length === 0 && !showStats" class="empty-state">
        <div class="empty-content">
          <h2>暂无学习内容</h2>
          <p>词汇库为空，请先添加单词</p>
          <button class="btn-primary" @click="goBack">返回首页</button>
        </div>
      </div>

      <template v-else>
        <header class="study-header">
          <button class="back-btn" @click="goBack">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <span class="progress">{{ currentIndex + 1 }}/{{ studyQueue.length }}</span>
          <button class="settings-btn" @click="openSettings">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
        </header>

        <WordCard
          v-if="currentWord"
          :word="currentWord"
          :show-back="flipped"
          @flip="toggleFlip"
          @play-audio="playAudio"
        />

        <div class="controls">
          <div class="progress-indicator">
            <div class="progress-indicator-bar" :style="{ width: (currentIndex / studyQueue.length) * 100 + '%' }"></div>
          </div>
          <button
            class="control-btn btn-forget"
            @click="handleResponse(0)"
            data-key="1"
          >
            忘记
          </button>
          <button
            class="control-btn btn-vague"
            @click="handleResponse(1)"
            data-key="2"
          >
            模糊
          </button>
          <button
            class="control-btn btn-know"
            @click="handleResponse(2)"
            data-key="3"
          >
            认识
          </button>
        </div>

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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useVocabStore } from '../stores/vocabStore';
import { useStudyStore } from '../stores/studyStore';
import { generateReviewPlan, calculateSRS } from '../utils/srs';
import { speak } from '../utils/pronunciation';
import StudyBackground from '../components/StudyBackground.vue';
import WordCard from '../components/WordCard.vue';

export default {
  name: 'Study',
  components: {
    StudyBackground,
    WordCard
  },
  setup() {
    const router = useRouter();
    const vocabStore = useVocabStore();
    const studyStore = useStudyStore();

    const studyQueue = ref([]);
    const currentIndex = ref(0);
    const flipped = ref(false);
    const showStats = ref(false);
    const studyStats = ref({
      totalWords: 0,
      correct: 0,
      duration: 0,
      accuracy: 0
    });
    const startTime = ref(Date.now());
    const touchStartX = ref(0);
    const touchStartY = ref(0);

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
      switch (e.key) {
        case ' ':
          e.preventDefault();
          toggleFlip();
          break;
        case '1':
          handleResponse(0);
          break;
        case '2':
          handleResponse(1);
          break;
        case '3':
          handleResponse(2);
          break;
      }
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

      document.addEventListener('keydown', handleKeydown);
      document.addEventListener('touchstart', handleTouchStart);
      document.addEventListener('touchend', handleTouchEnd);
    });

    onBeforeUnmount(() => {
      document.removeEventListener('keydown', handleKeydown);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    });

    return {
      studyQueue,
      currentIndex,
      currentWord,
      flipped,
      showStats,
      studyStats,
      toggleFlip,
      playAudio,
      handleResponse,
      goBack,
      openSettings
    };
  }
};
</script>

<style scoped>
.study-page {
  min-height: 100vh;
  position: relative;
  display: flex;
  flex-direction: column;
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

  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
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
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  filter: brightness(1.05);
}

.control-btn:active {
  transform: translateY(0) scale(0.98);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
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
}
</style>
