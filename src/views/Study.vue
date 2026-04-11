<template>
  <div class="study-container">
    <div v-if="studyQueue.length === 0 && !showStats" class="empty-state">
      <h2>暂无学习内容</h2>
      <p>词汇库为空，请先添加单词</p>
      <button class="btn-primary" @click="$router.push('/')">返回首页</button>
    </div>

    <template v-else>
      <div class="progress-header">
        <div class="progress-info">
          <span class="current">{{ currentIndex + 1 }}</span>
          <span class="separator">/</span>
          <span class="total">{{ studyQueue.length }}</span>
        </div>
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: (currentIndex / studyQueue.length) * 100 + '%' }"
          ></div>
        </div>
      </div>

      <div class="card-container">
        <WordCard
          v-if="currentWord"
          :word="currentWord"
          :flipped="flipped"
          @flip="toggleFlip"
          @play-audio="playAudio"
        />
      </div>

      <div class="controls">
        <button
          class="control-btn hard"
          @click="handleResponse(0)"
          title="忘记 (1)"
        >
          忘记
        </button>
        <button
          class="control-btn medium"
          @click="handleResponse(1)"
          title="模糊 (2)"
        >
          模糊
        </button>
        <button
          class="control-btn easy"
          @click="handleResponse(2)"
          title="认识 (3)"
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
          <button class="btn-primary" @click="$router.push('/')">返回首页</button>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useVocabStore } from '../stores/vocabStore';
import { useStudyStore } from '../stores/studyStore';
import { generateReviewPlan, calculateSRS } from '../utils/srs';
import { speak } from '../utils/pronunciation';
import WordCard from './components/WordCard.vue';

export default {
  name: 'Study',
  components: {
    WordCard
  },
  setup() {
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
      handleResponse
    };
  }
};
</script>

<style scoped>
.study-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
}

.empty-state h2 {
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
}

.empty-state p {
  font-size: 1.1rem;
  opacity: 0.8;
  margin-bottom: 2rem;
}

.progress-header {
  margin-bottom: 2rem;
}

.progress-info {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
}

.separator {
  margin: 0 0.5rem;
  opacity: 0.7;
}

.progress-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: white;
  transition: width 0.3s ease;
}

.card-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 2rem 0;
}

.controls {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

.control-btn {
  flex: 1;
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 100px;
}

.control-btn.hard {
  background: #ff6b6b;
  color: white;
}

.control-btn.medium {
  background: #ffd93d;
  color: #333;
}

.control-btn.easy {
  background: #6bcb77;
  color: white;
}

.control-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.stats-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.stats-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  max-width: 400px;
  width: 90%;
  text-align: center;
}

.stats-content h2 {
  margin-bottom: 2rem;
  color: #333;
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
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
}

.btn-primary {
  background: #667eea;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background: #764ba2;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

@media (max-width: 768px) {
  .study-container {
    padding: 1rem;
  }

  .controls {
    flex-direction: column;
  }

  .control-btn {
    width: 100%;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
