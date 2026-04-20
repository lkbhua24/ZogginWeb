<template>
  <div
    class="word-display"
    :class="[
      { 'show-detail': showBack, 'fullscreen-mode': isFullscreen },
      `card-size-${cardSize}`
    ]"
    @click="$emit('flip')"
  >
    <!-- 全屏切换按钮 -->
    <button
      class="fullscreen-toggle-btn"
      @click.stop="$emit('toggle-fullscreen')"
      :title="isFullscreen ? '退出全屏' : '进入全屏'"
    >
      <svg v-if="!isFullscreen" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
      </svg>
      <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
      </svg>
    </button>
    <!-- 正面：简洁展示 - 仅单词、音标、发音按钮 -->
    <template v-if="!showBack">
      <div class="word-main">
        <div class="word-title">{{ word.word }}</div>
        <div class="word-phonetic-row" v-if="word.phonetic">
          <span class="word-phonetic">{{ word.phonetic }}</span>
          <button class="word-play-btn" @click.stop="handlePlayAudio(word.word)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </button>
        </div>
      </div>
    </template>

    <!-- 背面：详细内容（无卡片容器，直接置于背景上） -->
    <template v-else>
      <!-- L1: 单词头 - 无容器，透明背景 -->
      <div class="l1-header">
        <div class="l1-word">{{ word.word }}</div>
        <div class="l1-phonetic-row" v-if="word.phonetic">
          <span class="l1-phonetic">{{ word.phonetic }}</span>
          <button class="l1-play-btn" @click.stop="handlePlayAudio(word.word)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </button>
        </div>
        <!-- 多词性垂直排列 -->
        <div class="l1-pos-list" v-if="hasPosMeanings">
          <div 
            v-for="(item, index) in posMeaningsList" 
            :key="index"
            class="l1-pos-item"
          >
            <span class="pos-tag">{{ item.pos }}</span>
            <span class="meanings-line">{{ item.meanings }}</span>
          </div>
        </div>
      </div>

      <!-- L2: 核心用法 - 液态玻璃卡片，只显示一个例句 -->
      <div class="l2-core glass-card" v-if="word.examples && word.examples.length">
        <div class="example-single">
          <p class="example-en" v-html="formatExampleEn(firstExample.en, word.word)"></p>
          <p class="example-cn">{{ firstExample.cn }}</p>
        </div>
      </div>

      <!-- L3: 场景扩展 - 液态玻璃卡片，可折叠 -->
      <div class="l3-extension" v-if="hasExtensionContent">
        <!-- 常用词组 -->
        <div class="l3-section glass-card" v-if="word.phrases && word.phrases.length">
          <div class="section-header" @click.stop="toggleSection('phrases')">
            <span class="section-name">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              常用词组
            </span>
            <svg 
              class="chevron" 
              :class="{ open: expandedSections.phrases }"
              width="14" 
              height="14" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              stroke-width="2"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
          <div class="section-content-wrapper" :class="{ expanded: expandedSections.phrases }">
            <div class="section-content-inner">
              <div 
                v-for="(phrase, i) in word.phrases" 
                :key="i" 
                class="phrase-row"
              >
                <span class="phrase-en">{{ phrase.en || phrase }}</span>
                <span class="phrase-cn" v-if="phrase.cn">{{ phrase.cn }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 考研真题 -->
        <div class="l3-section glass-card" v-if="word.examTips">
          <div class="section-header" @click.stop="toggleSection('exam')">
            <span class="section-name exam">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              考研真题
            </span>
            <svg 
              class="chevron" 
              :class="{ open: expandedSections.exam }"
              width="14" 
              height="14" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              stroke-width="2"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
          <div class="section-content-wrapper" :class="{ expanded: expandedSections.exam }">
            <div class="section-content-inner">
              <div class="exam-tips">{{ word.examTips }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 掌握度指示器 -->
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
    </template>
  </div>
</template>

<script>
import { useUserStore } from '../stores/userStore'

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
    },
    isFullscreen: {
      type: Boolean,
      default: false
    }
  },
  emits: ['flip', 'play-audio', 'toggle-fullscreen'],
  setup() {
    const userStore = useUserStore()
    return { userStore }
  },
  data() {
    return {
      expandedSections: {
        phrases: true,
        exam: false
      }
    };
  },
  computed: {
    cardSize() {
      return this.userStore.config?.cardSize || 'medium'
    },
    hasExtensionContent() {
      return (this.word.phrases && this.word.phrases.length) || this.word.examTips;
    },
    hasPosMeanings() {
      return this.word.pos && this.word.meanings;
    },
    posMeaningsList() {
      // 支持多词性格式：
      // 1. word.pos = ['n.', 'vt.'], word.meanings = [['意思1', '意思2'], ['意思3']]
      // 2. word.pos = 'n.', word.meanings = ['意思1', '意思2']
      const pos = this.word.pos;
      const meanings = this.word.meanings;
      
      if (!pos || !meanings) return [];
      
      // 如果 pos 是数组，表示多词性
      if (Array.isArray(pos)) {
        return pos.map((p, i) => ({
          pos: p,
          meanings: Array.isArray(meanings[i]) 
            ? meanings[i].join(' / ')
            : (meanings[i] || '').toString()
        }));
      }
      
      // 单词性，但 meanings 可能是二维数组（兼容旧数据）
      if (Array.isArray(meanings[0])) {
        return meanings.map((m, i) => ({
          pos: Array.isArray(pos) ? pos[i] : pos,
          meanings: Array.isArray(m) ? m.join(' / ') : m
        }));
      }
      
      // 单词性，一维数组
      return [{
        pos: pos,
        meanings: meanings.join(' / ')
      }];
    },
    firstExample() {
      if (!this.word.examples || !this.word.examples.length) return { en: '', cn: '' };
      const ex = this.word.examples[0];
      
      // 如果已经是对象格式 {en, cn}
      if (typeof ex === 'object' && ex !== null) {
        return {
          en: ex.en || ex.text || '',
          cn: ex.cn || ex.translation || ex.zh || ''
        };
      }
      
      // 如果是字符串，尝试解析中英文
      if (typeof ex === 'string') {
        // 尝试匹配 "英文句子 | 中文翻译" 格式
        const pipeMatch = ex.match(/^(.+?)\s*[|｜]\s*(.+)$/);
        if (pipeMatch) {
          return { en: pipeMatch[1].trim(), cn: pipeMatch[2].trim() };
        }
        
        // 尝试匹配中英文混合（中文在英文后面）
        const cnMatch = ex.match(/([\s\S]*?)([\u4e00-\u9fa5][\s\S]*)/);
        if (cnMatch && cnMatch[2].trim().length > 0) {
          return { en: cnMatch[1].trim(), cn: cnMatch[2].trim() };
        }
        
        // 纯英文，尝试使用 word.cnExample 或生成简单翻译提示
        return { 
          en: ex.trim(), 
          cn: this.word.cnExample || this.word.exampleTranslation || ''
        };
      }
      
      return { en: '', cn: '' };
    }
  },
  methods: {
    toggleSection(section) {
      this.expandedSections[section] = !this.expandedSections[section];
    },
    handlePlayAudio(word) {
      // 触发震动反馈
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      this.$emit('play-audio', word);
    },
    formatMeanings(meanings) {
      if (!meanings || !meanings.length) return '';
      return meanings.join(' / ');
    },
    highlightWord(text, word) {
      if (!text || !word) return text;
      const regex = new RegExp(`(${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      return text.replace(regex, '<strong class="highlight-word">$1</strong>');
    },
    formatExampleEn(text, word) {
      if (!text) return text;
      // 句首加双引号
      let formatted = text.trim();
      if (!formatted.startsWith('"')) {
        formatted = '"' + formatted;
      }
      if (!formatted.endsWith('"')) {
        formatted = formatted + '"';
      }
      // 目标单词加粗高亮
      if (word) {
        const regex = new RegExp(`(${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        formatted = formatted.replace(regex, '<strong class="highlight-word">$1</strong>');
      }
      return formatted;
    }
  }
};
</script>

<style scoped>
/* ===== 主容器 - 卡片居中放大效果 ===== */
.word-display {
  flex: 1;
  width: var(--card-width);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  /* GPU 加速 */
  transform: translateZ(0);
  backface-visibility: hidden;
}

/* ===== 卡片大小变体 ===== */
.card-size-small .word-title {
  font-size: clamp(1.75rem, 5vw, 2.5rem);
}

.card-size-small .l1-word {
  font-size: clamp(1.25rem, 3.5vw, 1.75rem);
}

.card-size-small .word-display.show-detail {
  transform: scale(0.95);
}

.card-size-large .word-title {
  font-size: clamp(3rem, 6vw, 5rem);
}

.card-size-large .word-phonetic {
  font-size: clamp(1.25rem, 2vw, 1.625rem);
  padding: 8px 20px;
}

.card-size-large .l1-word {
  font-size: clamp(2rem, 4vw, 3.25rem);
}

.card-size-large .l1-phonetic {
  font-size: clamp(1.125rem, 1.8vw, 1.375rem);
  padding: 6px 16px;
}

.card-size-large .l1-pos-item .meanings-line {
  font-size: clamp(1rem, 1.8vw, 1.375rem);
}

.card-size-large .example-en {
  font-size: clamp(0.9375rem, 1.6vw, 1.25rem);
}

.card-size-large .example-cn {
  font-size: clamp(0.8125rem, 1.4vw, 1rem);
}

.card-size-large .word-display.show-detail {
  transform: scale(1.05);
}

/* ===== 全屏切换按钮 - 半透明悬浮 ===== */
.fullscreen-toggle-btn {
  position: fixed;
  top: 80px;
  right: 20px;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: none;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: rgba(102, 126, 234, 0.7);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 100;
  opacity: 0.6;
}

.fullscreen-toggle-btn:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.35);
  transform: scale(1.1);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.fullscreen-toggle-btn:active {
  transform: scale(1.05);
}

/* 全屏模式下的按钮样式 */
.word-display.fullscreen-mode .fullscreen-toggle-btn {
  background: rgba(255, 255, 255, 0.2);
  opacity: 0.4;
}

.word-display.fullscreen-mode .fullscreen-toggle-btn:hover {
  opacity: 0.9;
  background: rgba(255, 255, 255, 0.4);
}

.word-display.show-detail {
  width: min(720px, 94%);
  align-items: stretch;
  gap: 16px;
  transform: scale(1.02);
}

/* ===== 正面样式 - 单词居中显示，无卡片背景 ===== */
.word-main {
  text-align: center;
  color: #1a1a1a;
}

.word-title {
  font-size: var(--font-size-word);
  font-weight: 800;
  color: #1a1a1a;
  text-shadow: 0 2px 20px rgba(255, 255, 255, 0.4);
  margin-bottom: clamp(12px, 2vh, 20px);
  letter-spacing: -0.03em;
  line-height: 1.1;
  /* 响应式字体 */
  font-size: clamp(2rem, 5vw, 4rem);
}

.word-phonetic-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
}

.word-phonetic {
  font-size: clamp(1rem, 1.8vw, 1.375rem);
  color: #4a5568;
  font-style: normal;
  font-weight: 500;
  letter-spacing: 0.02em;
  background: rgba(102, 126, 234, 0.1);
  padding: clamp(4px, 1vh, 6px) clamp(10px, 1.5vw, 16px);
  border-radius: 20px;
}

/* ===== 发音按钮 - 圆形悬浮放大动效 ===== */
.word-play-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  flex-shrink: 0;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  position: relative;
  overflow: hidden;
}

.word-play-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.word-play-btn:hover {
  transform: scale(1.2);
  box-shadow: 0 6px 25px rgba(102, 126, 234, 0.6);
}

.word-play-btn:hover::before {
  opacity: 1;
}

.word-play-btn:active {
  transform: scale(1.1);
}

.word-play-btn svg {
  width: 20px;
  height: 20px;
  transition: transform 0.2s ease;
}

.word-play-btn:hover svg {
  transform: scale(1.1);
}

/* ===== 背面样式 - 无卡片背景 ===== */
.l1-header {
  text-align: center;
  padding: 16px 0;
  color: #1a1a1a;
  animation: headerFadeIn 0.5s ease forwards;
}

@keyframes headerFadeIn {
  0% {
    opacity: 0;
    transform: translateY(-10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.l1-word {
  font-size: 2.5rem;
  font-weight: 800;
  color: #1a1a1a;
  text-shadow: 0 2px 12px rgba(255, 255, 255, 0.3);
  margin-bottom: 10px;
  letter-spacing: -0.02em;
}

.l1-phonetic-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 4px;
}

.l1-phonetic {
  font-size: 1.125rem;
  color: #4a5568;
  font-style: normal;
  font-weight: 500;
  background: rgba(102, 126, 234, 0.1);
  padding: 4px 12px;
  border-radius: 16px;
}

.l1-play-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  flex-shrink: 0;
  box-shadow: 0 3px 12px rgba(102, 126, 234, 0.35);
}

.l1-play-btn:hover {
  transform: scale(1.15);
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.5);
}

.l1-play-btn svg {
  width: 14px;
  height: 14px;
}

/* ===== 释义显示 - 平滑淡入及下滑动画 ===== */
.l1-pos-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-top: 16px;
  animation: meaningSlideDown 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes meaningSlideDown {
  0% {
    opacity: 0;
    transform: translateY(-15px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.l1-pos-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
  opacity: 0;
  animation: meaningItemFadeIn 0.4s ease forwards;
}

.l1-pos-item:nth-child(1) { animation-delay: 0.1s; }
.l1-pos-item:nth-child(2) { animation-delay: 0.2s; }
.l1-pos-item:nth-child(3) { animation-delay: 0.3s; }
.l1-pos-item:nth-child(4) { animation-delay: 0.4s; }

@keyframes meaningItemFadeIn {
  0% {
    opacity: 0;
    transform: translateX(-10px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

.l1-pos-item .pos-tag {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
  color: #5a67d8;
  padding: 5px 14px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  border: 1px solid rgba(102, 126, 234, 0.2);
  transition: all 0.3s ease;
}

.l1-pos-item:hover .pos-tag {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%);
  transform: scale(1.05);
}

.l1-pos-item .meanings-line {
  font-size: 1.125rem;
  color: #2d3748;
  font-weight: 500;
  line-height: 1.5;
}

/* ===== 液态玻璃卡片通用样式 ===== */
.glass-card {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* ===== L2: 核心用法 ===== */
.l2-core {
  padding: 20px 24px;
}

.example-single {
  display: flex;
  flex-direction: column;
  gap: -3px;
}

.example-en {
  font-size: 1rem;
  color: #2c2c2c;
  line-height: 1.6;
  font-weight: 400;
}

.example-en :deep(.highlight-word) {
  color: #667eea;
  font-weight: 600;
}

.example-cn {
  font-size: 0.875rem;
  color: #666666;
  line-height: 1.5;
}

/* ===== L3: 场景扩展 ===== */
.l3-extension {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.l3-section {
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  cursor: pointer;
  transition: background 0.2s ease;
  user-select: none;
}

.section-header:hover {
  background: rgba(255, 255, 255, 0.5);
}

.section-name {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #555555;
}

.section-name.exam {
  color: #f59e0b;
}

.chevron {
  color: #9ca3af;
  transition: transform 0.3s ease;
}

.chevron.open {
  transform: rotate(180deg);
}

/* 收起/展开高度过渡动画 */
.section-content-wrapper {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 300ms ease-out;
}

.section-content-wrapper.expanded {
  grid-template-rows: 1fr;
}

.section-content-inner {
  overflow: hidden;
  padding: 0 24px;
}

.section-content-wrapper.expanded .section-content-inner {
  padding: 0 24px 20px;
}

.phrase-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 6px 0;
  border-bottom: 1px dashed rgba(0, 0, 0, 0.06);
  font-size: 0.85rem;
}

.phrase-row:last-child {
  border-bottom: none;
}

.phrase-en {
  color: #2c2c2c;
  font-weight: 400;
}

.phrase-cn {
  color: #666666;
  font-size: 0.875rem;
}

.exam-tips {
  font-size: 0.85rem;
  color: #92400e;
  background: #fffbeb;
  padding: 10px 12px;
  border-radius: 8px;
  border-left: 3px solid #f59e0b;
  line-height: 1.5;
}

/* ===== 掌握度指示器 ===== */
.mastery-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding-top: 8px;
}

.mastery-label {
  font-size: 0.875rem;
  color: #666666;
}

.mastery-dots {
  display: flex;
  gap: 4px;
}

.mastery-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(102, 126, 234, 0.3);
  transition: all 0.2s;
}

.mastery-dot.active {
  background: #667eea;
  box-shadow: 0 0 8px rgba(102, 126, 234, 0.4);
}

/* ===== 响应式适配 ===== */

/* 超大屏 (2560px+) */
@media (min-width: 2560px) {
  .word-display {
    width: min(840px, 80%);
  }
  
  .word-title {
    font-size: 5rem;
  }
  
  .l1-word {
    font-size: 3.5rem;
  }
  
  .word-phonetic {
    font-size: 1.625rem;
  }
  
  .example-en {
    font-size: 1.25rem;
  }
  
  .example-cn {
    font-size: 1.125rem;
  }
}

/* 大屏台式机 (1920px - 2559px) */
@media (max-width: 2559px) and (min-width: 1920px) {
  .word-display {
    width: min(780px, 85%);
  }
  
  .word-title {
    font-size: 4.5rem;
  }
  
  .l1-word {
    font-size: 2.75rem;
  }
}

/* 大笔记本 (1440px - 1919px) */
@media (max-width: 1919px) and (min-width: 1440px) {
  .word-display {
    width: min(720px, 90%);
  }
  
  .word-title {
    font-size: 4rem;
  }
  
  .l1-word {
    font-size: 2.5rem;
  }
}

/* 小笔记本 (1366px - 1439px) */
@media (max-width: 1439px) and (min-width: 1366px) {
  .word-display {
    width: min(680px, 94%);
  }
  
  .word-title {
    font-size: 3.5rem;
  }
  
  .l1-word {
    font-size: 2.25rem;
  }
  
  .word-phonetic {
    font-size: 1.25rem;
  }
}

/* 平板横屏/小笔记本 (992px - 1365px) */
@media (max-width: 1365px) and (min-width: 992px) {
  .word-display {
    width: min(640px, 94%);
  }
  
  .word-title {
    font-size: 3rem;
  }
  
  .l1-word {
    font-size: 2rem;
  }
  
  .word-phonetic {
    font-size: 1.125rem;
  }
  
  .l2-core,
  .glass-card {
    padding: 18px 22px;
  }
}

/* 平板竖屏 (768px - 991px) */
@media (max-width: 991px) and (min-width: 768px) {
  .word-display {
    width: 92%;
  }
  
  .word-title {
    font-size: 2.75rem;
  }
  
  .l1-word {
    font-size: 1.875rem;
  }
}

/* 移动端 (< 768px) */
@media (max-width: 767px) {
  .word-display {
    width: 94%;
  }

  .word-display.show-detail {
    width: 94%;
  }

  .word-main {
    padding: 24px 20px;
  }

  .word-title {
    font-size: clamp(1.75rem, 8vw, 2.75rem);
    margin-bottom: 12px;
  }

  .word-phonetic {
    font-size: clamp(0.9375rem, 4vw, 1.125rem);
    padding: 4px 10px;
  }

  .word-play-btn {
    width: 40px;
    height: 40px;
  }

  .word-play-btn svg {
    width: 18px;
    height: 18px;
  }

  .l1-header {
    padding: 16px 20px;
  }

  .l1-word {
    font-size: clamp(1.5rem, 6vw, 2rem);
  }

  .l1-phonetic {
    font-size: 0.9375rem;
  }

  .l1-play-btn {
    width: 28px;
    height: 28px;
  }

  .l1-pos-item .meanings-line {
    font-size: 0.9375rem;
  }

  .l2-core,
  .glass-card {
    padding: 14px 18px;
    border-radius: 14px;
  }

  .example-en {
    font-size: 0.875rem;
  }

  .example-cn {
    font-size: 0.8125rem;
  }
  
  .fullscreen-toggle-btn {
    top: 70px;
    right: 12px;
    width: 32px;
    height: 32px;
  }
}

@supports not (backdrop-filter: blur(20px)) {
  .glass-card {
    background: rgba(250, 250, 250, 0.95);
  }
}
</style>
