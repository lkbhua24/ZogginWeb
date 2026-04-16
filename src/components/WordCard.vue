<template>
  <div
    class="word-display"
    :class="{ 'show-detail': showBack }"
    @click="$emit('flip')"
  >
    <!-- 正面：简洁展示 - 仅单词、音标、发音按钮 -->
    <template v-if="!showBack">
      <div class="word-main">
        <div class="word-title">{{ word.word }}</div>
        <div class="word-phonetic-row" v-if="word.phonetic">
          <span class="word-phonetic">{{ word.phonetic }}</span>
          <button class="word-play-btn" @click.stop="$emit('play-audio', word.word)">
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
          <button class="l1-play-btn" @click.stop="$emit('play-audio', word.word)">
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
  emits: ['flip', 'play-audio'],
  data() {
    return {
      expandedSections: {
        phrases: true,
        exam: false
      }
    };
  },
  computed: {
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
/* ===== 主容器 - 无卡片样式 ===== */
.word-display {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: min(680px, 92%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.4s ease;
}

.word-display.show-detail {
  top: 45%;
  width: min(680px, 92%);
  align-items: stretch;
  gap: 16px;
}

/* ===== 正面样式 - 仅单词、音标、发音按钮 ===== */
.word-main {
  text-align: center;
  color: #1a1a1a;
}

.word-title {
  font-size: 3.5rem;
  font-weight: 700;
  color: #1a1a1a;
  text-shadow: 0 2px 20px rgba(255, 255, 255, 0.3);
  margin-bottom: 16px;
  letter-spacing: -0.02em;
}

.word-phonetic-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.word-phonetic {
  font-size: 1.125rem;
  color: #666666;
  font-style: normal;
}

.word-play-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #667eea;
  border: none;
  color: white;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.word-play-btn:hover {
  transform: scale(1.1);
  background: #5a67d8;
}

/* ===== 背面样式 - 无容器，直接置于背景 ===== */
.l1-header {
  text-align: center;
  padding: 8px 0;
  color: #1a1a1a;
}

.l1-word {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  text-shadow: 0 2px 10px rgba(255, 255, 255, 0.2);
  margin-bottom: 6px;
}

.l1-phonetic-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 8px;
}

.l1-phonetic {
  font-size: 1rem;
  color: #666666;
  font-style: normal;
}

.l1-play-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #667eea;
  border: none;
  color: white;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.l1-play-btn:hover {
  transform: scale(1.1);
  background: #5a67d8;
}

/* 多词性垂直排列 */
.l1-pos-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
}

.l1-pos-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.l1-pos-item .pos-tag {
  background: rgba(102, 126, 234, 0.15);
  color: #667eea;
  padding: 3px 12px;
  border-radius: 16px;
  font-size: 0.875rem;
  font-weight: 500;
}

.l1-pos-item .meanings-line {
  font-size: 1rem;
  color: #333333;
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

/* ===== 响应式 ===== */
@media (max-width: 768px) {
  .word-display {
    width: 92%;
  }

  .word-display.show-detail {
    width: 92%;
    top: 42%;
  }

  .word-title {
    font-size: 2.5rem;
  }

  .word-phonetic {
    font-size: 1rem;
  }

  .word-play-btn {
    width: 24px;
    height: 24px;
  }

  .l1-word {
    font-size: 1.75rem;
  }

  .l2-core,
  .glass-card {
    padding: 16px 20px;
    border-radius: 16px;
  }

  .example-en {
    font-size: 0.9375rem;
  }

  .example-cn {
    font-size: 0.8125rem;
  }
}

@supports not (backdrop-filter: blur(20px)) {
  .glass-card {
    background: rgba(250, 250, 250, 0.95);
  }
}
</style>
