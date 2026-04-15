<template>
  <div
    class="card-container"
    :class="{ flipped: showBack, tilted: isHovering }"
    :style="cardStyle"
    @click="$emit('flip')"
    @mouseenter="handleMouseEnter"
    @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave"
  >
    <div class="card-inner">
      <div class="card-face card-front">
        <div class="word-text">{{ word.word }}</div>
        <div class="phonetic-text" v-if="word.phonetic">{{ word.phonetic }}</div>
        <div class="pos-badge" v-if="word.pos">{{ word.pos }}</div>
        <button class="play-btn" @click.stop="$emit('play-audio', word.word)">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        </button>
      </div>

      <div class="card-face card-back">
        <div class="back-header">
          <div class="back-word">{{ word.word }}</div>
          <div class="back-phonetic" v-if="word.phonetic">{{ word.phonetic }}</div>
          <div class="back-pos" v-if="word.pos">{{ word.pos }}</div>
        </div>

        <div class="back-content">
          <div class="section" v-if="word.meanings && word.meanings.length">
            <div class="section-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
              释义
            </div>
            <ul class="meaning-list">
              <li v-for="(m, i) in word.meanings" :key="i">{{ m }}</li>
            </ul>
          </div>

          <div class="section" v-if="word.examples && word.examples.length">
            <div class="section-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="17" y1="10" x2="3" y2="10"></line>
                <line x1="21" y1="6" x2="3" y2="6"></line>
                <line x1="21" y1="14" x2="3" y2="14"></line>
                <line x1="17" y1="18" x2="3" y2="18"></line>
              </svg>
              例句
            </div>
            <ul class="example-list">
              <li v-for="(e, i) in word.examples" :key="i">{{ e }}</li>
            </ul>
          </div>

          <div class="section" v-if="word.phrases && word.phrases.length">
            <div class="section-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              常见短语
            </div>
            <ul class="phrase-list">
              <li v-for="(p, i) in word.phrases" :key="i">
                <span class="phrase-en">{{ p.en }}</span>
                <span class="phrase-cn">{{ p.cn }}</span>
              </li>
            </ul>
          </div>

          <div class="section" v-if="word.examTips">
            <div class="section-label exam-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              考研考点
            </div>
            <div class="exam-tips">{{ word.examTips }}</div>
          </div>
        </div>

        <div class="mastery-indicator">
          <span class="mastery-label">掌握度</span>
          <div class="mastery-dots">
            <span
              v-for="i in 5"
              :key="i"
              class="mastery-dot"
              :class="{ active: i <= (word.mastery || 0) }"
            ></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WordCard',
  props: {
    word: {
      type: Object,
      required: true
    },
    showBack: {
      type: Boolean,
      default: false
    }
  },
  emits: ['flip', 'play-audio', 'mark-forget', 'mark-vague', 'mark-know'],
  data() {
    return {
      isHovering: false,
      tiltX: 0,
      tiltY: 0,
      lastMoveTime: 0
    };
  },
  computed: {
    cardStyle() {
      return {
        '--tilt-x': this.tiltX + 'deg',
        '--tilt-y': this.tiltY + 'deg'
      };
    }
  },
  methods: {
    handleMouseEnter() {
      if (!this.showBack) {
        this.isHovering = true;
      }
    },
    handleMouseMove(e) {
      if (this.showBack) return;

      const now = Date.now();
      if (now - this.lastMoveTime < 50) return;
      this.lastMoveTime = now;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const normalizedX = (x - centerX) / centerX;
      const normalizedY = (y - centerY) / centerY;

      this.tiltX = Math.round(-normalizedY * 5);
      this.tiltY = Math.round(normalizedX * 5);
    },
    handleMouseLeave() {
      this.isHovering = false;
      this.tiltX = 0;
      this.tiltY = 0;
    }
  }
};
</script>

<style scoped>
.card-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  width: min(600px, 90vw);
  aspect-ratio: 4 / 3;

  perspective: 1000px;
  cursor: pointer;
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;

  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-container.flipped .card-inner {
  transform: rotateY(180deg);
}

.card-container.tilted .card-inner {
  transition: transform 0.1s ease-out;
}

.card-container.tilted:not(.flipped) .card-inner {
  transform: rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg));
}

.card-face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;

  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);

  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.05),
    0 0 0 1px rgba(255, 255, 255, 0.3) inset;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  overflow: hidden;
}

.card-front {
  z-index: 2;
}

.word-text {
  font-size: 3rem;
  font-weight: 700;
  color: #1f2937;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  margin-bottom: 8px;
}

.phonetic-text {
  font-size: 1.25rem;
  color: #6b7280;
  font-style: italic;
  margin-bottom: 12px;
}

.pos-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 20px;
}

.play-btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(102, 126, 234, 0.9);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.play-btn:hover {
  transform: scale(1.1);
  background: rgba(102, 126, 234, 1);
}

.card-back {
  transform: rotateY(180deg);
  background: rgba(255, 255, 255, 0.95);
  padding: 24px 32px;
  justify-content: flex-start;
}

.back-header {
  text-align: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  width: 100%;
  flex-shrink: 0;
}

.back-word {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
}

.back-phonetic {
  font-size: 0.95rem;
  color: #6b7280;
  font-style: italic;
  margin-top: 4px;
}

.back-pos {
  display: inline-block;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 500;
  margin-top: 6px;
}

.back-content {
  flex: 1;
  overflow-y: auto;
  width: 100%;
  min-height: 0;
}

.section {
  margin-bottom: 14px;
}

.section-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #667eea;
  margin-bottom: 6px;
}

.exam-label {
  color: #f59e0b;
}

.meaning-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.meaning-list li {
  font-size: 1rem;
  color: #374151;
  padding: 3px 0 3px 16px;
  position: relative;
  line-height: 1.5;
}

.meaning-list li::before {
  content: "•";
  position: absolute;
  left: 0;
  color: #667eea;
}

.example-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.example-list li {
  font-size: 0.9rem;
  color: #4b5563;
  font-style: italic;
  padding: 4px 0 4px 16px;
  position: relative;
  line-height: 1.5;
}

.example-list li::before {
  content: '"';
  position: absolute;
  left: 0;
  color: #9ca3af;
  font-weight: bold;
}

.phrase-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.phrase-list li {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 0.9rem;
  padding: 4px 0;
  border-bottom: 1px dashed rgba(0, 0, 0, 0.06);
}

.phrase-list li:last-child {
  border-bottom: none;
}

.phrase-en {
  color: #374151;
  font-weight: 500;
}

.phrase-cn {
  color: #6b7280;
  font-size: 0.85rem;
}

.exam-tips {
  font-size: 0.9rem;
  color: #92400e;
  background: #fffbeb;
  padding: 10px 12px;
  border-radius: 8px;
  border-left: 3px solid #f59e0b;
  line-height: 1.5;
}

.mastery-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  width: 100%;
  flex-shrink: 0;
}

.mastery-label {
  font-size: 0.8rem;
  color: #9ca3af;
}

.mastery-dots {
  display: flex;
  gap: 4px;
}

.mastery-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #e5e7eb;
  transition: all 0.2s;
}

.mastery-dot.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

@media (max-width: 768px) {
  .card-container {
    width: 90vw;
    aspect-ratio: 3 / 4;
  }

  .word-text {
    font-size: 2.5rem;
  }

  .card-back {
    padding: 16px 20px;
  }

  .back-word {
    font-size: 1.4rem;
  }

  .meaning-list li,
  .example-list li {
    font-size: 0.9rem;
  }

  .card-face {
    padding: 24px;
  }
}

@supports not (backdrop-filter: blur(20px)) {
  .card-face {
    background: rgba(250, 250, 250, 0.95);
  }
}
</style>
