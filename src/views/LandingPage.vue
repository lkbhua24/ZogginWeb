<template>
  <div class="landing-page">
    <section class="hero">
      <div class="hero-inner">
        <div class="hero-text">
          <h1 class="hero-title">像母语者一样学英语</h1>
          <p class="hero-subtitle">考研应试+终身能力，在真实语境中自然习得</p>
          <div class="hero-buttons">
            <button class="btn-primary" @click="handleStart" :disabled="isLoading">
              <span v-if="isLoading" class="loading-spinner dark"></span>
              {{ isLoading ? '正在准备...' : '立即开始学习' }}
            </button>
            <button class="btn-secondary" @click="smoothScroll('features')">
              了解功能
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <polyline points="19 12 12 19 5 12"></polyline>
              </svg>
            </button>
          </div>
        </div>

        <div class="hero-card-demo">
          <div class="demo-card" :class="{ flipped: demoFlipped }">
            <div class="demo-card-front">
              <span class="demo-word">{{ demoWords[demoIndex].word }}</span>
              <span class="demo-phonetic">{{ demoWords[demoIndex].phonetic }}</span>
              <div class="demo-play-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              </div>
            </div>
            <div class="demo-card-back">
              <span class="demo-meaning">{{ demoWords[demoIndex].meaning }}</span>
              <span class="demo-example">{{ demoWords[demoIndex].example }}</span>
            </div>
          </div>
          <div class="demo-dots">
            <span v-for="(_, i) in demoWords" :key="i" class="demo-dot" :class="{ active: i === demoIndex }"></span>
          </div>
        </div>
      </div>
    </section>

    <section id="features" class="features-section">
      <div class="section-inner">
        <h2 class="section-title">核心功能</h2>
        <p class="section-desc">科学方法 × 真实语境，让英语学习不再枯燥</p>

        <div class="feature-block">
          <div class="feature-visual">
            <div class="feature-mockup ebbinghaus-mockup">
              <div class="mockup-header">
                <div class="mockup-dots">
                  <span></span><span></span><span></span>
                </div>
                <span class="mockup-title">间隔复习</span>
              </div>
              <div class="mockup-body">
                <div class="ebbinghaus-curve">
                  <svg viewBox="0 0 300 120" class="curve-svg">
                    <path d="M 10 20 Q 60 20, 80 50 T 150 90 T 220 100 T 290 105" fill="none" stroke="#ddd" stroke-width="2" stroke-dasharray="4"/>
                    <path d="M 10 20 Q 60 20, 80 35 T 150 50 T 220 55 T 290 58" fill="none" stroke="#667eea" stroke-width="2.5"/>
                    <circle cx="80" cy="35" r="4" fill="#667eea"/>
                    <circle cx="150" cy="50" r="4" fill="#667eea"/>
                    <circle cx="220" cy="55" r="4" fill="#667eea"/>
                    <text x="75" y="28" font-size="9" fill="#667eea">复习1</text>
                    <text x="145" y="43" font-size="9" fill="#667eea">复习2</text>
                    <text x="215" y="48" font-size="9" fill="#667eea">复习3</text>
                  </svg>
                </div>
                <div class="ebbinghaus-labels">
                  <span class="label-fade">无复习</span>
                  <span class="label-retain">科学复习</span>
                </div>
              </div>
            </div>
          </div>
          <div class="feature-info">
            <div class="feature-badge">🧠 艾浩斯记忆法</div>
            <h3 class="feature-title">科学对抗遗忘曲线</h3>
            <p class="feature-desc">基于 SM-2 间隔重复算法，在你即将遗忘的黄金时刻精准推送复习。每次复习都强化长期记忆，让每个单词真正刻进大脑。</p>
            <ul class="feature-list">
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#667eea" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                智能间隔安排，拒绝无效重复
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#667eea" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                三级评分（忘记/模糊/认识），精准追踪记忆状态
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#667eea" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                记忆留存率可视化，进步看得见
              </li>
            </ul>
          </div>
        </div>

        <div class="feature-block reverse">
          <div class="feature-visual">
            <div class="feature-mockup video-mockup">
              <div class="mockup-header">
                <div class="mockup-dots">
                  <span></span><span></span><span></span>
                </div>
                <span class="mockup-title">视频学习</span>
              </div>
              <div class="mockup-body">
                <div class="video-preview">
                  <div class="video-placeholder">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="white" opacity="0.8">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                  </div>
                  <div class="video-subtitles">
                    <span class="sub-line active">The <mark>ephemeral</mark> nature of fame</span>
                    <span class="sub-line">makes it all the more precious.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="feature-info">
            <div class="feature-badge">🎬 视频语境</div>
            <h3 class="feature-title">在真实语境中自然习得</h3>
            <p class="feature-desc">加载本地视频和 SRT 字幕，点击字幕中的生词即可查看释义、加入生词本。AB 循环反复听，语速调节随心切，沉浸式学习体验。</p>
            <ul class="feature-list">
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#667eea" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                字幕单词可点击，一键加入生词本
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#667eea" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                AB 循环 + 变速播放，精听每一句
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#667eea" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                侧边生词本，边看边积累
              </li>
            </ul>
          </div>
        </div>

        <div class="feature-block">
          <div class="feature-visual">
            <div class="feature-mockup speaking-mockup">
              <div class="mockup-header">
                <div class="mockup-dots">
                  <span></span><span></span><span></span>
                </div>
                <span class="mockup-title">口语练习</span>
              </div>
              <div class="mockup-body">
                <div class="speaking-preview">
                  <div class="speaking-wave">
                    <span v-for="i in 20" :key="i" class="wave-bar" :style="{ height: waveHeights[i-1] + 'px' }"></span>
                  </div>
                  <div class="speaking-result">
                    <span class="speaking-original">ephemeral</span>
                    <div class="speaking-compare">
                      <span class="compare-char match">e</span>
                      <span class="compare-char match">p</span>
                      <span class="compare-char match">h</span>
                      <span class="compare-char match">e</span>
                      <span class="compare-char mismatch">m</span>
                      <span class="compare-char match">e</span>
                      <span class="compare-char match">r</span>
                      <span class="compare-char match">a</span>
                      <span class="compare-char match">l</span>
                    </div>
                    <div class="speaking-score">相似度 89%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="feature-info">
            <div class="feature-badge">🎙️ 口语训练</div>
            <h3 class="feature-title">说出来，才是真掌握</h3>
            <p class="feature-desc">跟读模式 + 自由说模式，Web Speech API 实时识别你的发音，字符级 diff 对比让你精准定位发音问题，波形可视化让练习更直观。</p>
            <ul class="feature-list">
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#667eea" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                语音识别 + 发音相似度评分
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#667eea" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                字符级 diff 对比，精准纠音
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#667eea" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                实时波形可视化，练习有反馈
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <section id="exam" class="exam-section">
      <div class="section-inner">
        <h2 class="section-title">考研专区</h2>
        <p class="section-desc">为考研党量身定制，科学规划 5500 词汇通关路径</p>

        <div class="exam-grid">
          <div class="exam-card countdown-card">
            <div class="exam-card-header">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#667eea" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <h3>考研倒计时</h3>
            </div>
            <div class="countdown-input-row">
              <label>目标日期</label>
              <input type="date" v-model="examDate" :min="todayStr" />
            </div>
            <div class="countdown-display" v-if="countdown.days !== null">
              <div class="countdown-item">
                <span class="countdown-num">{{ countdown.days }}</span>
                <span class="countdown-label">天</span>
              </div>
              <div class="countdown-item">
                <span class="countdown-num">{{ countdown.hours }}</span>
                <span class="countdown-label">时</span>
              </div>
              <div class="countdown-item">
                <span class="countdown-num">{{ countdown.minutes }}</span>
                <span class="countdown-label">分</span>
              </div>
              <div class="countdown-item">
                <span class="countdown-num">{{ countdown.seconds }}</span>
                <span class="countdown-label">秒</span>
              </div>
            </div>
            <p class="countdown-hint" v-if="countdown.days !== null">
              每天学 <strong>{{ dailyPlan.newPerDay }}</strong> 个新词，考前可覆盖 <strong>{{ dailyPlan.coverage }}</strong> 词
            </p>
          </div>

          <div class="exam-card vocab-plan-card">
            <div class="exam-card-header">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#667eea" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
              <h3>5500 词汇规划</h3>
            </div>
            <div class="vocab-progress">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: vocabProgress + '%' }"></div>
              </div>
              <div class="progress-labels">
                <span>0</span>
                <span>5500</span>
              </div>
            </div>
            <div class="vocab-milestones">
              <div class="milestone" v-for="m in milestones" :key="m.label">
                <div class="milestone-dot" :class="{ reached: vocabProgress >= m.pct }"></div>
                <div class="milestone-info">
                  <span class="milestone-label">{{ m.label }}</span>
                  <span class="milestone-count">{{ m.count }} 词</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="trust" class="trust-section">
      <div class="section-inner">
        <h2 class="section-title">为什么选择 Zoggin</h2>
        <div class="trust-grid">
          <div class="trust-card">
            <div class="trust-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#667eea" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <h3>本地优先，隐私至上</h3>
            <p>所有数据存储在你的浏览器本地（IndexedDB），无需注册账号，无需上传服务器。你的学习数据，只有你自己能访问。</p>
          </div>
          <div class="trust-card">
            <div class="trust-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#667eea" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="16 18 22 12 16 6"></polyline>
                <polyline points="8 6 2 12 8 18"></polyline>
              </svg>
            </div>
            <h3>开源免费</h3>
            <p>代码完全开源，无隐藏收费，无广告干扰。社区驱动迭代，功能持续进化。学习工具不该成为负担。</p>
          </div>
          <div class="trust-card">
            <div class="trust-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#667eea" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </div>
            <h3>数据可导出</h3>
            <p>支持 JSON/CSV 格式导出全部学习数据，随时备份、迁移。你的数据永远属于你，不会被平台绑架。</p>
          </div>
        </div>
      </div>
    </section>

    <section class="bottom-cta">
      <div class="cta-inner">
        <h2>准备好开始了吗？</h2>
        <p>无需注册，点击即用，让英语学习回归本质</p>
        <button class="btn-primary btn-large" @click="handleStart" :disabled="isLoading">
          <span v-if="isLoading" class="loading-spinner dark"></span>
          {{ isLoading ? '正在准备...' : '立即开始学习' }}
        </button>
      </div>
    </section>

    <footer class="landing-footer">
      <p>Zoggin · 本地优先 · 数据私有 · 开源免费</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'

const router = useRouter()
const userStore = useUserStore()

const isLoading = ref(false)
const demoFlipped = ref(false)
const demoIndex = ref(0)

const demoWords = [
  { word: 'ephemeral', phonetic: '/ɪˈfemərəl/', meaning: 'adj. 短暂的；转瞬即逝的', example: 'Fame is ephemeral in the digital age.' },
  { word: 'ubiquitous', phonetic: '/juːˈbɪkwɪtəs/', meaning: 'adj. 无处不在的', example: 'Smartphones are ubiquitous today.' },
  { word: 'resilient', phonetic: '/rɪˈzɪliənt/', meaning: 'adj. 有弹性的；能复原的', example: 'She is remarkably resilient.' },
  { word: 'eloquent', phonetic: '/ˈeləkwənt/', meaning: 'adj. 雄辩的；有说服力的', example: 'An eloquent speech moved everyone.' }
]

const examDate = ref('2026-12-25')
const todayStr = new Date().toISOString().split('T')[0]

const countdown = ref({ days: null, hours: null, minutes: null, seconds: null })
let countdownTimer = null

const dailyPlan = computed(() => {
  const days = countdown.value.days || 0
  if (days <= 0) return { newPerDay: 0, coverage: 0 }
  const newPerDay = Math.ceil(5500 / days)
  const coverage = Math.min(newPerDay * days, 5500)
  return { newPerDay, coverage }
})

const vocabProgress = ref(0)
const milestones = [
  { label: '基础核心', count: 1000, pct: 18 },
  { label: '进阶词汇', count: 3000, pct: 55 },
  { label: '全部覆盖', count: 5500, pct: 100 }
]

const waveHeights = []
for (let i = 0; i < 20; i++) {
  waveHeights.push(Math.floor(Math.random() * 24 + 8))
}

function updateCountdown() {
  if (!examDate.value) {
    countdown.value = { days: null, hours: null, minutes: null, seconds: null }
    return
  }
  const target = new Date(examDate.value + 'T00:00:00')
  const now = new Date()
  const diff = target - now
  if (diff <= 0) {
    countdown.value = { days: 0, hours: 0, minutes: 0, seconds: 0 }
    return
  }
  countdown.value = {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60)
  }
}

let demoTimer = null

function startDemo() {
  demoTimer = setInterval(() => {
    demoFlipped.value = true
    setTimeout(() => {
      demoIndex.value = (demoIndex.value + 1) % demoWords.length
      demoFlipped.value = false
    }, 1500)
  }, 3000)
}

function smoothScroll(id) {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

async function handleStart() {
  isLoading.value = true
  try {
    await userStore.login()
    router.push('/')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  updateCountdown()
  countdownTimer = setInterval(updateCountdown, 1000)
  startDemo()

  let progress = 0
  const progressAnim = setInterval(() => {
    progress += 1.5
    if (progress >= 100) {
      progress = 100
      clearInterval(progressAnim)
    }
    vocabProgress.value = progress
  }, 30)
})

onUnmounted(() => {
  if (countdownTimer) clearInterval(countdownTimer)
  if (demoTimer) clearInterval(demoTimer)
})
</script>

<style scoped>
.landing-page {
  min-height: 100vh;
  background: #f8f9fb;
  overflow-x: hidden;
}

.hero {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  padding: 6rem 2rem 4rem;
}

.hero-inner {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 4rem;
  width: 100%;
}

.hero-text {
  flex: 1;
  color: white;
}

.hero-title {
  font-size: 3.2rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 1rem;
  letter-spacing: -0.5px;
}

.hero-subtitle {
  font-size: 1.2rem;
  opacity: 0.85;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 2.5rem;
  background: white;
  color: #667eea;
  border: none;
  border-radius: 14px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-primary.btn-large {
  padding: 1.15rem 3rem;
  font-size: 1.2rem;
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 14px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(4px);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.5);
}

.hero-card-demo {
  flex: 0 0 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.demo-card {
  width: 280px;
  height: 180px;
  perspective: 800px;
  cursor: default;
  position: relative;
}

.demo-card-front,
.demo-card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  transition: transform 0.6s ease;
  padding: 1.5rem;
}

.demo-card-front {
  background: white;
  color: #333;
  gap: 0.5rem;
}

.demo-card-back {
  background: white;
  color: #333;
  transform: rotateY(180deg);
  gap: 0.75rem;
  text-align: center;
}

.demo-card.flipped .demo-card-front {
  transform: rotateY(180deg);
}

.demo-card.flipped .demo-card-back {
  transform: rotateY(0deg);
}

.demo-word {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
}

.demo-phonetic {
  font-size: 0.95rem;
  color: #888;
  font-style: italic;
}

.demo-play-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #667eea;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 0.25rem;
}

.demo-meaning {
  font-size: 0.95rem;
  color: #333;
  font-weight: 600;
}

.demo-example {
  font-size: 0.85rem;
  color: #888;
  font-style: italic;
  line-height: 1.4;
}

.demo-dots {
  display: flex;
  gap: 0.5rem;
}

.demo-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.35);
  transition: all 0.3s;
}

.demo-dot.active {
  background: white;
  transform: scale(1.3);
}

.loading-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

.loading-spinner.dark {
  border-color: rgba(102, 126, 234, 0.3);
  border-top-color: #667eea;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.section-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 5rem 2rem;
}

.section-title {
  font-size: 2rem;
  font-weight: 800;
  color: #333;
  text-align: center;
  margin-bottom: 0.5rem;
}

.section-desc {
  text-align: center;
  color: #888;
  font-size: 1.05rem;
  margin-bottom: 3.5rem;
}

.features-section {
  background: white;
}

.feature-block {
  display: flex;
  align-items: center;
  gap: 4rem;
  margin-bottom: 5rem;
}

.feature-block:last-child {
  margin-bottom: 0;
}

.feature-block.reverse {
  flex-direction: row-reverse;
}

.feature-visual {
  flex: 1;
  min-width: 0;
}

.feature-info {
  flex: 1;
  min-width: 0;
}

.feature-badge {
  display: inline-block;
  padding: 0.35rem 0.9rem;
  background: #eef2ff;
  color: #667eea;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.feature-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 0.75rem;
}

.feature-desc {
  font-size: 0.95rem;
  color: #666;
  line-height: 1.7;
  margin-bottom: 1.25rem;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.feature-list li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #555;
}

.feature-mockup {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.08);
  border: 1px solid #eee;
  background: #fafbfc;
}

.mockup-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: #f0f1f3;
  border-bottom: 1px solid #e8e8e8;
}

.mockup-dots {
  display: flex;
  gap: 0.35rem;
}

.mockup-dots span {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ddd;
}

.mockup-dots span:nth-child(1) { background: #ff5f57; }
.mockup-dots span:nth-child(2) { background: #ffbd2e; }
.mockup-dots span:nth-child(3) { background: #28ca42; }

.mockup-title {
  font-size: 0.8rem;
  color: #999;
  font-weight: 500;
}

.mockup-body {
  padding: 1.5rem;
}

.ebbinghaus-curve {
  margin-bottom: 0.5rem;
}

.curve-svg {
  width: 100%;
  height: auto;
}

.ebbinghaus-labels {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  font-size: 0.75rem;
}

.label-fade {
  color: #ccc;
}

.label-retain {
  color: #667eea;
  font-weight: 600;
}

.video-preview {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.video-placeholder {
  width: 100%;
  height: 120px;
  background: linear-gradient(135deg, #2d3748, #4a5568);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-subtitles {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.5rem;
}

.sub-line {
  font-size: 0.85rem;
  color: #aaa;
}

.sub-line.active {
  color: #333;
  font-weight: 500;
}

.sub-line mark {
  background: #eef2ff;
  color: #667eea;
  padding: 0.1rem 0.25rem;
  border-radius: 3px;
  font-weight: 600;
}

.speaking-preview {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.speaking-wave {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  height: 40px;
}

.wave-bar {
  width: 4px;
  border-radius: 2px;
  background: linear-gradient(180deg, #667eea, #764ba2);
  min-height: 4px;
}

.speaking-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.speaking-original {
  font-size: 1.2rem;
  font-weight: 700;
  color: #333;
}

.speaking-compare {
  display: flex;
  gap: 2px;
}

.compare-char {
  font-size: 0.95rem;
  padding: 0.15rem 0.25rem;
  border-radius: 3px;
}

.compare-char.match {
  color: #28ca42;
  background: #f0fdf4;
}

.compare-char.mismatch {
  color: #ff5f57;
  background: #fef2f2;
}

.speaking-score {
  font-size: 0.85rem;
  color: #667eea;
  font-weight: 600;
}

.exam-section {
  background: linear-gradient(180deg, #f8f9fb, #eef2ff);
}

.exam-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.exam-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.exam-card-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.exam-card-header h3 {
  font-size: 1.15rem;
  font-weight: 700;
  color: #333;
}

.countdown-input-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.countdown-input-row label {
  font-size: 0.9rem;
  color: #666;
  white-space: nowrap;
}

.countdown-input-row input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #333;
  outline: none;
  transition: border-color 0.2s;
}

.countdown-input-row input:focus {
  border-color: #667eea;
}

.countdown-display {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.countdown-item {
  flex: 1;
  text-align: center;
  background: linear-gradient(135deg, #eef2ff, #e0e7ff);
  border-radius: 12px;
  padding: 0.75rem 0.5rem;
}

.countdown-num {
  display: block;
  font-size: 1.8rem;
  font-weight: 800;
  color: #667eea;
  line-height: 1;
}

.countdown-label {
  display: block;
  font-size: 0.75rem;
  color: #888;
  margin-top: 0.25rem;
}

.countdown-hint {
  font-size: 0.85rem;
  color: #666;
  text-align: center;
  padding-top: 0.75rem;
  border-top: 1px solid #f0f0f0;
}

.countdown-hint strong {
  color: #667eea;
}

.vocab-progress {
  margin-bottom: 1.5rem;
}

.progress-bar {
  height: 10px;
  background: #f0f0f0;
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 0.4rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 5px;
  transition: width 1.5s ease;
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #aaa;
}

.vocab-milestones {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.milestone {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.milestone-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid #ddd;
  background: white;
  flex-shrink: 0;
  transition: all 0.3s;
}

.milestone-dot.reached {
  background: #667eea;
  border-color: #667eea;
}

.milestone-info {
  display: flex;
  justify-content: space-between;
  flex: 1;
}

.milestone-label {
  font-size: 0.9rem;
  color: #555;
  font-weight: 500;
}

.milestone-count {
  font-size: 0.85rem;
  color: #aaa;
}

.trust-section {
  background: white;
}

.trust-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.trust-card {
  text-align: center;
  padding: 2rem 1.5rem;
  border-radius: 16px;
  background: #fafbfc;
  transition: all 0.3s ease;
}

.trust-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.trust-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: linear-gradient(135deg, #eef2ff, #e0e7ff);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
}

.trust-card h3 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 0.5rem;
}

.trust-card p {
  font-size: 0.88rem;
  color: #888;
  line-height: 1.6;
}

.bottom-cta {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 5rem 2rem;
  text-align: center;
  color: white;
}

.cta-inner h2 {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
}

.cta-inner p {
  font-size: 1.05rem;
  opacity: 0.8;
  margin-bottom: 2rem;
}

.landing-footer {
  text-align: center;
  padding: 2rem;
  color: #bbb;
  font-size: 0.85rem;
  background: #f8f9fb;
}

@media (max-width: 768px) {
  .hero {
    padding: 5rem 1.5rem 3rem;
    min-height: auto;
  }

  .hero-inner {
    flex-direction: column;
    gap: 2.5rem;
    text-align: center;
  }

  .hero-title {
    font-size: 2.2rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .hero-buttons {
    justify-content: center;
  }

  .hero-card-demo {
    flex: none;
    width: 100%;
    max-width: 320px;
  }

  .feature-block,
  .feature-block.reverse {
    flex-direction: column;
    gap: 2rem;
  }

  .section-inner {
    padding: 3.5rem 1.5rem;
  }

  .section-title {
    font-size: 1.6rem;
  }

  .feature-title {
    font-size: 1.3rem;
  }

  .exam-grid {
    grid-template-columns: 1fr;
  }

  .trust-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .bottom-cta {
    padding: 3.5rem 1.5rem;
  }

  .cta-inner h2 {
    font-size: 1.5rem;
  }

  .btn-primary.btn-large {
    padding: 1rem 2rem;
    font-size: 1.05rem;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 1.8rem;
  }

  .hero-buttons {
    flex-direction: column;
    width: 100%;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    justify-content: center;
  }

  .demo-card {
    width: 260px;
    height: 160px;
  }

  .countdown-display {
    gap: 0.4rem;
  }

  .countdown-num {
    font-size: 1.4rem;
  }
}
</style>
