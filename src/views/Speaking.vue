<template>
  <div class="speaking-container">
    <div v-if="phase === 'select'" class="phase-select">
      <h2 class="phase-title">口语练习</h2>
      <p class="phase-desc">选择练习模式，开始提升你的口语能力</p>
      <div class="mode-cards">
        <div class="mode-card" @click="startMode('shadow')">
          <div class="mode-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" y1="19" x2="12" y2="23"></line>
              <line x1="8" y1="23" x2="16" y2="23"></line>
            </svg>
          </div>
          <h3>跟读模式</h3>
          <p>看着原文跟读，对比发音差异</p>
        </div>
        <div class="mode-card" @click="startMode('free')">
          <div class="mode-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <h3>自由说模式</h3>
          <p>自由表达，练习口语流利度</p>
        </div>
      </div>
      <div v-if="vocabStore.words.length === 0" class="empty-hint">
        <p>词汇库为空，请先添加单词</p>
        <button class="btn-primary" @click="$router.push('/')">返回首页</button>
      </div>
    </div>

    <div v-else-if="phase === 'countdown'" class="phase-countdown">
      <div class="countdown-number">{{ countdownValue }}</div>
      <p class="countdown-hint">准备开始录音...</p>
    </div>

    <div v-else-if="phase === 'recording'" class="phase-recording">
      <div class="word-display">
        <h2 class="target-word" v-if="mode === 'shadow'">{{ currentWord.word }}</h2>
        <p class="target-phonetic" v-if="mode === 'shadow' && currentWord.phonetic">{{ currentWord.phonetic }}</p>
        <p class="target-example" v-if="mode === 'shadow' && currentWord.examples && currentWord.examples.length > 0">{{ currentWord.examples[0] }}</p>
        <p class="free-prompt" v-if="mode === 'free'">自由表达，说出你想说的话</p>
      </div>
      <div class="waveform-wrapper">
        <canvas ref="waveformCanvas" class="waveform-canvas"></canvas>
      </div>
      <div class="recording-indicator">
        <span class="rec-dot"></span>
        <span>录音中 {{ recordingTime }}s</span>
      </div>
      <button class="btn-stop" @click="stopRecording">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="6" width="12" height="12" rx="2"></rect>
        </svg>
        停止录音
      </button>
    </div>

    <div v-else-if="phase === 'result'" class="phase-result">
      <div class="result-header">
        <h2>练习结果</h2>
        <div class="word-badge" v-if="currentWord">{{ currentWord.word }}</div>
      </div>

      <div class="result-sections">
        <div class="result-section">
          <h4>原文</h4>
          <p class="original-text">{{ originalText }}</p>
        </div>
        <div class="result-section">
          <h4>识别文本</h4>
          <p class="recognized-text">{{ recognizedText || '（未识别到内容）' }}</p>
        </div>
        <div class="result-section" v-if="mode === 'shadow'">
          <h4>发音对比</h4>
          <div class="diff-display">
            <span
              v-for="(char, idx) in diffChars"
              :key="idx"
              :class="char.type"
            >{{ char.value }}</span>
          </div>
        </div>
        <div class="result-section score-section" v-if="mode === 'shadow'">
          <h4>相似度评分</h4>
          <div class="score-ring">
            <svg viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="#e9ecef" stroke-width="10"></circle>
              <circle
                cx="60" cy="60" r="50" fill="none"
                :stroke="scoreColor"
                stroke-width="10"
                stroke-linecap="round"
                :stroke-dasharray="scoreCircumference"
                :stroke-dashoffset="scoreOffset"
                transform="rotate(-90 60 60)"
              ></circle>
            </svg>
            <div class="score-text">{{ similarityScore }}%</div>
          </div>
        </div>
      </div>

      <div class="playback-section">
        <h4>回放对比</h4>
        <div class="playback-controls">
          <div class="playback-item">
            <button class="play-btn" @click="playOriginal" :disabled="!canPlayOriginal">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            </button>
            <span>原音</span>
          </div>
          <div class="playback-item">
            <button class="play-btn recording" @click="playRecording" :disabled="!recordingBlob">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            </button>
            <span>录音</span>
          </div>
        </div>
      </div>

      <div class="result-actions">
        <button class="btn-secondary" @click="retryPractice">重新练习</button>
        <button class="btn-primary" @click="saveAndNext">保存并继续</button>
      </div>
    </div>

    <div v-else-if="phase === 'complete'" class="phase-complete">
      <h2>练习完成</h2>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-label">练习单词</span>
          <span class="stat-value">{{ practiceStats.total }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">平均评分</span>
          <span class="stat-value">{{ practiceStats.avgScore }}%</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">练习时间</span>
          <span class="stat-value">{{ Math.round(practiceStats.duration / 60) }}分钟</span>
        </div>
      </div>
      <div class="complete-actions">
        <button class="btn-secondary" @click="resetAll">返回选择</button>
        <button class="btn-primary" @click="$router.push('/')">返回首页</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useVocabStore } from '../stores/vocabStore';
import { useStudyStore } from '../stores/studyStore';
import { speak } from '../utils/pronunciation';
import storage from '../utils/storage';

const SPEAKING_RECORDS_KEY = 'zoggin_speaking_records';

function levenshteinDistance(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

function computeSimilarity(original, recognized) {
  const a = original.toLowerCase().trim();
  const b = recognized.toLowerCase().trim();
  if (a.length === 0 && b.length === 0) return 100;
  if (a.length === 0 || b.length === 0) return 0;
  const dist = levenshteinDistance(a, b);
  const maxLen = Math.max(a.length, b.length);
  return Math.round((1 - dist / maxLen) * 100);
}

function computeDiff(original, recognized) {
  const a = original.toLowerCase().trim();
  const b = recognized.toLowerCase().trim();
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  const result = [];
  let i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      result.unshift({ value: a[i - 1], type: 'match' });
      i--; j--;
    } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
      result.unshift({ value: a[i - 1], type: 'wrong' });
      i--; j--;
    } else if (j > 0 && dp[i][j] === dp[i][j - 1] + 1) {
      result.unshift({ value: b[j - 1], type: 'extra' });
      j--;
    } else {
      result.unshift({ value: a[i - 1], type: 'missing' });
      i--;
    }
  }
  return result;
}

export default {
  name: 'Speaking',
  setup() {
    const vocabStore = useVocabStore();
    const studyStore = useStudyStore();

    const phase = ref('select');
    const mode = ref('shadow');
    const currentWord = ref(null);
    const practiceQueue = ref([]);
    const queueIndex = ref(0);

    const countdownValue = ref(3);
    const recordingTime = ref(0);
    const recognizedText = ref('');
    const recordingBlob = ref(null);
    const similarityScore = ref(0);
    const diffChars = ref([]);

    const waveformCanvas = ref(null);
    let mediaRecorder = null;
    let audioContext = null;
    let analyser = null;
    let animationFrameId = null;
    let recordingTimer = null;
    let recognition = null;
    let audioChunks = [];
    let recordingUrl = null;
    let recordingAudioEl = null;

    const practiceStartTime = ref(Date.now());
    const scores = ref([]);
    const practiceStats = ref({
      total: 0,
      avgScore: 0,
      duration: 0
    });

    const originalText = computed(() => {
      if (mode.value === 'free') return recognizedText.value;
      if (!currentWord.value) return '';
      return currentWord.value.examples && currentWord.value.examples.length > 0
        ? currentWord.value.examples[0]
        : currentWord.value.word;
    });

    const canPlayOriginal = computed(() => {
      return mode.value === 'shadow' && !!currentWord.value;
    });

    const scoreCircumference = computed(() => 2 * Math.PI * 50);
    const scoreOffset = computed(() => {
      return scoreCircumference.value * (1 - similarityScore.value / 100);
    });
    const scoreColor = computed(() => {
      if (similarityScore.value >= 80) return '#6bcb77';
      if (similarityScore.value >= 60) return '#ffd93d';
      return '#ff6b6b';
    });

    function startMode(selectedMode) {
      mode.value = selectedMode;
      if (mode.value === 'shadow') {
        practiceQueue.value = [...vocabStore.words].sort(() => Math.random() - 0.5);
      } else {
        practiceQueue.value = [null];
      }
      queueIndex.value = 0;
      scores.value = [];
      practiceStartTime.value = Date.now();
      loadNextWord();
    }

    function loadNextWord() {
      if (queueIndex.value >= practiceQueue.value.length) {
        completePractice();
        return;
      }
      currentWord.value = practiceQueue.value[queueIndex.value];
      recognizedText.value = '';
      recordingBlob.value = null;
      similarityScore.value = 0;
      diffChars.value = [];
      startCountdown();
    }

    function startCountdown() {
      phase.value = 'countdown';
      countdownValue.value = 3;
      const interval = setInterval(() => {
        countdownValue.value--;
        if (countdownValue.value <= 0) {
          clearInterval(interval);
          startRecording();
        }
      }, 1000);
    }

    async function startRecording() {
      phase.value = 'recording';
      recordingTime.value = 0;
      audioChunks = [];

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(stream);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);

        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunks.push(e.data);
        };
        mediaRecorder.onstop = () => {
          recordingBlob.value = new Blob(audioChunks, { type: 'audio/webm' });
          if (recordingUrl) URL.revokeObjectURL(recordingUrl);
          recordingUrl = URL.createObjectURL(recordingBlob.value);
          stream.getTracks().forEach(t => t.stop());
          onRecordingComplete();
        };
        mediaRecorder.start();

        recordingTimer = setInterval(() => {
          recordingTime.value++;
        }, 1000);

        await nextTick();
        drawWaveform();

        startSpeechRecognition();
      } catch (err) {
        console.error('录音启动失败:', err);
        phase.value = 'select';
      }
    }

    function drawWaveform() {
      const canvas = waveformCanvas.value;
      if (!canvas || !analyser) return;
      const ctx = canvas.getContext('2d');
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      function draw() {
        animationFrameId = requestAnimationFrame(draw);
        analyser.getByteTimeDomainData(dataArray);

        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        ctx.lineWidth = 2;
        ctx.strokeStyle = '#667eea';
        ctx.beginPath();

        const sliceWidth = w / bufferLength;
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * h) / 2;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
          x += sliceWidth;
        }
        ctx.lineTo(w, h / 2);
        ctx.stroke();
      }
      draw();
    }

    function startSpeechRecognition() {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        console.warn('浏览器不支持语音识别');
        return;
      }
      recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = true;
      recognition.continuous = true;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        recognizedText.value = transcript;
      };
      recognition.onerror = (event) => {
        console.warn('语音识别错误:', event.error);
      };
      recognition.start();
    }

    function stopRecording() {
      if (recognition) {
        recognition.stop();
        recognition = null;
      }
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }
      if (recordingTimer) {
        clearInterval(recordingTimer);
        recordingTimer = null;
      }
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      if (audioContext) {
        audioContext.close();
        audioContext = null;
        analyser = null;
      }
    }

    function onRecordingComplete() {
      if (mode.value === 'shadow') {
        similarityScore.value = computeSimilarity(originalText.value, recognizedText.value);
        diffChars.value = computeDiff(originalText.value, recognizedText.value);
      }
      phase.value = 'result';
    }

    function playOriginal() {
      if (!currentWord.value) return;
      speak(currentWord.value.word, 'us');
    }

    function playRecording() {
      if (!recordingBlob.value) return;
      if (recordingAudioEl) {
        recordingAudioEl.pause();
        recordingAudioEl = null;
      }
      recordingAudioEl = new Audio(recordingUrl);
      recordingAudioEl.play();
    }

    function retryPractice() {
      recognizedText.value = '';
      recordingBlob.value = null;
      similarityScore.value = 0;
      diffChars.value = [];
      if (recordingUrl) {
        URL.revokeObjectURL(recordingUrl);
        recordingUrl = null;
      }
      startCountdown();
    }

    async function saveAndNext() {
      const record = {
        id: Date.now().toString(),
        wordId: currentWord.value ? currentWord.value.id : null,
        word: currentWord.value ? currentWord.value.word : null,
        mode: mode.value,
        originalText: originalText.value,
        recognizedText: recognizedText.value,
        score: similarityScore.value,
        duration: recordingTime.value,
        date: new Date().toISOString()
      };

      if (recordingBlob.value) {
        const arrayBuffer = await recordingBlob.value.arrayBuffer();
        record.audioData = Array.from(new Uint8Array(arrayBuffer));
        record.audioType = recordingBlob.value.type;
      }

      const records = (await storage.get(SPEAKING_RECORDS_KEY)) || [];
      records.push(record);
      await storage.set(SPEAKING_RECORDS_KEY, records);

      if (mode.value === 'shadow') {
        scores.value.push(similarityScore.value);
      }

      queueIndex.value++;
      loadNextWord();
    }

    async function completePractice() {
      const duration = Date.now() - practiceStartTime.value;
      const total = mode.value === 'shadow' ? scores.value.length : 1;
      const avgScore = scores.value.length > 0
        ? Math.round(scores.value.reduce((a, b) => a + b, 0) / scores.value.length)
        : 0;

      practiceStats.value = { total, avgScore, duration };

      await studyStore.addStudyLog({
        sessionType: 'speaking',
        wordsStudied: practiceQueue.value
          .filter(w => w)
          .map(w => w.id)
          .slice(0, queueIndex.value),
        duration,
        accuracy: avgScore / 100
      });

      phase.value = 'complete';
    }

    function resetAll() {
      phase.value = 'select';
      mode.value = 'shadow';
      currentWord.value = null;
      practiceQueue.value = [];
      queueIndex.value = 0;
      recognizedText.value = '';
      recordingBlob.value = null;
      similarityScore.value = 0;
      diffChars.value = [];
      scores.value = [];
      if (recordingUrl) {
        URL.revokeObjectURL(recordingUrl);
        recordingUrl = null;
      }
    }

    onMounted(async () => {
      await vocabStore.loadWords();
    });

    onBeforeUnmount(() => {
      stopRecording();
      if (recordingUrl) {
        URL.revokeObjectURL(recordingUrl);
      }
      if (recordingAudioEl) {
        recordingAudioEl.pause();
        recordingAudioEl = null;
      }
    });

    return {
      phase,
      mode,
      currentWord,
      countdownValue,
      recordingTime,
      recognizedText,
      recordingBlob,
      similarityScore,
      diffChars,
      waveformCanvas,
      originalText,
      canPlayOriginal,
      scoreCircumference,
      scoreOffset,
      scoreColor,
      practiceStats,
      vocabStore,
      startMode,
      stopRecording,
      playOriginal,
      playRecording,
      retryPractice,
      saveAndNext,
      resetAll
    };
  }
};
</script>

<style scoped>
.speaking-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  color: white;
}

.phase-select,
.phase-countdown,
.phase-recording,
.phase-result,
.phase-complete {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.phase-title {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.phase-desc {
  font-size: 1.1rem;
  opacity: 0.8;
  margin-bottom: 2rem;
}

.mode-cards {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
}

.mode-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.25);
  border-radius: 16px;
  padding: 2rem;
  width: 240px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.mode-card:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.mode-icon {
  margin-bottom: 1rem;
}

.mode-card h3 {
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
}

.mode-card p {
  font-size: 0.9rem;
  opacity: 0.8;
}

.empty-hint {
  text-align: center;
  margin-top: 1rem;
}

.empty-hint p {
  margin-bottom: 1rem;
  opacity: 0.8;
}

.countdown-number {
  font-size: 8rem;
  font-weight: bold;
  animation: countdown-pulse 1s ease-in-out infinite;
}

.countdown-hint {
  font-size: 1.2rem;
  opacity: 0.8;
  margin-top: 1rem;
}

@keyframes countdown-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.7; }
}

.word-display {
  text-align: center;
  margin-bottom: 2rem;
}

.target-word {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.target-phonetic {
  font-size: 1.2rem;
  opacity: 0.8;
  font-style: italic;
  margin-bottom: 0.5rem;
}

.target-example {
  font-size: 1.1rem;
  opacity: 0.9;
  max-width: 500px;
  line-height: 1.5;
}

.free-prompt {
  font-size: 1.5rem;
  opacity: 0.9;
}

.waveform-wrapper {
  width: 100%;
  max-width: 600px;
  height: 120px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 1.5rem;
}

.waveform-canvas {
  width: 100%;
  height: 100%;
}

.recording-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
}

.rec-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ff6b6b;
  animation: rec-blink 1s ease-in-out infinite;
}

@keyframes rec-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.btn-stop {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #ff6b6b;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-stop:hover {
  background: #ee5a5a;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
}

.result-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.result-header h2 {
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
}

.word-badge {
  display: inline-block;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.3rem 1rem;
  border-radius: 20px;
  font-size: 1.2rem;
}

.result-sections {
  width: 100%;
  max-width: 600px;
  margin-bottom: 1.5rem;
}

.result-section {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 1rem 1.5rem;
  margin-bottom: 0.8rem;
}

.result-section h4 {
  font-size: 0.9rem;
  opacity: 0.7;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.original-text,
.recognized-text {
  font-size: 1.1rem;
  line-height: 1.6;
}

.diff-display {
  font-size: 1.1rem;
  line-height: 1.8;
  letter-spacing: 0.5px;
}

.diff-display .match {
  color: #6bcb77;
}

.diff-display .wrong {
  color: #ff6b6b;
  text-decoration: underline wavy #ff6b6b;
}

.diff-display .extra {
  color: #ffd93d;
  background: rgba(255, 217, 61, 0.2);
  border-radius: 3px;
  padding: 0 2px;
}

.diff-display .missing {
  color: #ff6b6b;
  opacity: 0.5;
  text-decoration: line-through;
}

.score-section {
  text-align: center;
}

.score-ring {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 1rem auto 0;
}

.score-ring svg {
  width: 100%;
  height: 100%;
}

.score-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.8rem;
  font-weight: bold;
}

.playback-section {
  width: 100%;
  max-width: 600px;
  margin-bottom: 1.5rem;
}

.playback-section h4 {
  font-size: 0.9rem;
  opacity: 0.7;
  margin-bottom: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.playback-controls {
  display: flex;
  gap: 2rem;
  justify-content: center;
}

.playback-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.play-btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.15);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.play-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.play-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.play-btn.recording {
  border-color: #ff6b6b;
}

.result-actions,
.complete-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.btn-primary {
  background: white;
  color: #667eea;
  border: none;
  padding: 0.8rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  padding: 0.8rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.phase-complete h2 {
  font-size: 2rem;
  margin-bottom: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
  width: 100%;
  max-width: 500px;
}

.stat-item {
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 1rem;
}

.stat-label {
  display: block;
  font-size: 0.85rem;
  opacity: 0.7;
  margin-bottom: 0.5rem;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
}

@media (max-width: 768px) {
  .speaking-container {
    padding: 1rem;
  }

  .mode-cards {
    flex-direction: column;
    align-items: center;
  }

  .mode-card {
    width: 100%;
    max-width: 300px;
  }

  .target-word {
    font-size: 2rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .result-actions,
  .complete-actions {
    flex-direction: column;
    width: 100%;
    max-width: 300px;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    text-align: center;
  }
}
</style>
