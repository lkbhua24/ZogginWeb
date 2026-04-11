<template>
  <div class="vp-container">
    <div class="vp-main">
      <div class="vp-video-area">
        <div v-if="!videoSrc" class="vp-upload-zone">
          <div class="vp-upload-inner">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            <p class="vp-upload-title">选择视频文件</p>
            <p class="vp-upload-hint">支持 MP4 / WebM / OGG 格式</p>
            <button class="vp-upload-btn" @click="$refs.videoInput.click()">选择文件</button>
            <input
              ref="videoInput"
              type="file"
              accept="video/*"
              style="display:none"
              @change="onVideoFileChange"
            />
          </div>
          <div class="vp-upload-inner" style="margin-top:1rem">
            <p class="vp-upload-title">选择字幕文件</p>
            <p class="vp-upload-hint">支持 SRT 格式</p>
            <button class="vp-upload-btn" @click="$refs.srtInput.click()">选择字幕</button>
            <input
              ref="srtInput"
              type="file"
              accept=".srt"
              style="display:none"
              @change="onSrtFileChange"
            />
          </div>
        </div>

        <div v-else class="vp-player-wrapper">
          <video
            ref="videoEl"
            class="vp-video"
            :src="videoSrc"
            @timeupdate="onTimeUpdate"
            @loadedmetadata="onLoadedMetadata"
            @ended="onVideoEnded"
          ></video>

          <div class="vp-subtitle-overlay" v-if="currentSubtitle">
            <span
              v-for="(token, i) in currentSubtitleTokens"
              :key="i"
              class="vp-subtitle-word"
              :class="{ 'vp-word-highlight': isWordInVocab(token.clean) }"
              @click.stop="onWordClick($event, token.clean)"
            >{{ token.text }} </span>
          </div>

          <div
            v-if="wordMenu.visible"
            class="vp-word-menu"
            :style="{ top: wordMenu.y + 'px', left: wordMenu.x + 'px' }"
          >
            <div class="vp-word-menu-header">{{ wordMenu.word }}</div>
            <button class="vp-word-menu-item" @click="addToVocab(wordMenu.word)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
              加入生词本
            </button>
            <button class="vp-word-menu-item" @click="lookupWord(wordMenu.word)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              查看释义
            </button>
            <button class="vp-word-menu-item" @click="playPronunciation(wordMenu.word)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              播放发音
            </button>
          </div>

          <div class="vp-controls">
            <div class="vp-controls-row">
              <button class="vp-ctrl-btn" @click="togglePlay" :title="isPlaying ? '暂停' : '播放'">
                <svg v-if="!isPlaying" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
              </button>

              <span class="vp-time">{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>

              <div class="vp-speed-group">
                <button
                  v-for="s in speeds"
                  :key="s"
                  class="vp-speed-btn"
                  :class="{ active: playbackRate === s }"
                  @click="setSpeed(s)"
                >{{ s }}x</button>
              </div>

              <button
                class="vp-ctrl-btn"
                :class="{ active: abLoop.on }"
                @click="toggleABLoop"
                title="AB循环"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
              </button>

              <div v-if="abLoop.on" class="vp-ab-info">
                <span v-if="abLoop.a !== null">A: {{ formatTime(abLoop.a) }}</span>
                <span v-if="abLoop.b !== null">B: {{ formatTime(abLoop.b) }}</span>
                <button v-if="abLoop.a === null" class="vp-ab-mark" @click="markA">标记A</button>
                <button v-if="abLoop.a !== null && abLoop.b === null" class="vp-ab-mark" @click="markB">标记B</button>
                <button v-if="abLoop.b !== null" class="vp-ab-mark" @click="resetAB">重置</button>
              </div>

              <button class="vp-ctrl-btn" @click="changeVideo" title="更换视频">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              </button>

              <button class="vp-ctrl-btn" @click="loadSrt" title="加载字幕">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              </button>
            </div>

            <div class="vp-progress-bar" @click="seekTo" ref="progressBar">
              <div class="vp-progress-fill" :style="{ width: progressPercent + '%' }"></div>
              <div v-if="abLoop.a !== null" class="vp-ab-marker a-marker" :style="{ left: (abLoop.a / duration * 100) + '%' }"></div>
              <div v-if="abLoop.b !== null" class="vp-ab-marker b-marker" :style="{ left: (abLoop.b / duration * 100) + '%' }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="vp-sidebar">
      <div class="vp-sidebar-header">
        <h3>生词本</h3>
        <span class="vp-sidebar-count">{{ sessionWords.length }}</span>
      </div>
      <div class="vp-sidebar-list" v-if="sessionWords.length > 0">
        <div
          v-for="w in sessionWords"
          :key="w.word"
          class="vp-vocab-item"
        >
          <div class="vp-vocab-word" @click="playPronunciation(w.word)">{{ w.word }}</div>
          <div class="vp-vocab-meaning" v-if="w.meanings && w.meanings.length">{{ w.meanings[0] }}</div>
          <button class="vp-vocab-remove" @click="removeSessionWord(w.word)" title="移除">×</button>
        </div>
      </div>
      <div v-else class="vp-sidebar-empty">
        <p>点击字幕单词添加</p>
      </div>
    </div>

    <div v-if="definitionModal.visible" class="vp-def-modal" @click.self="definitionModal.visible = false">
      <div class="vp-def-content">
        <div class="vp-def-header">
          <h3>{{ definitionModal.word }}</h3>
          <button class="vp-def-close" @click="definitionModal.visible = false">×</button>
        </div>
        <div class="vp-def-body">
          <div v-if="definitionModal.loading" class="vp-def-loading">查询中...</div>
          <div v-else-if="definitionModal.result" class="vp-def-result">
            <p v-if="definitionModal.result.phonetic" class="vp-def-phonetic">{{ definitionModal.result.phonetic }}</p>
            <div v-if="definitionModal.result.meanings && definitionModal.result.meanings.length">
              <h4>释义</h4>
              <ul>
                <li v-for="(m, i) in definitionModal.result.meanings" :key="i">{{ m }}</li>
              </ul>
            </div>
          </div>
          <div v-else class="vp-def-empty">暂无释义数据</div>
        </div>
      </div>
    </div>

    <input
      ref="srtInputLazy"
      type="file"
      accept=".srt"
      style="display:none"
      @change="onSrtFileChangeLazy"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useVocabStore } from '../stores/vocabStore'
import { speak } from '../utils/pronunciation'

const vocabStore = useVocabStore()

const videoEl = ref(null)
const videoInput = ref(null)
const srtInput = ref(null)
const srtInputLazy = ref(null)
const progressBar = ref(null)

const videoSrc = ref('')
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const playbackRate = ref(1)
const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2]

const subtitles = ref([])
const sessionWords = ref([])

const abLoop = ref({ on: false, a: null, b: null })

const wordMenu = ref({ visible: false, word: '', x: 0, y: 0 })
const definitionModal = ref({ visible: false, word: '', loading: false, result: null })

const currentSubtitle = computed(() => {
  const t = currentTime.value
  return subtitles.value.find(s => t >= s.start && t <= s.end) || null
})

const currentSubtitleTokens = computed(() => {
  if (!currentSubtitle.value) return []
  return tokenizeSubtitle(currentSubtitle.value.text)
})

const progressPercent = computed(() => {
  if (duration.value === 0) return 0
  return (currentTime.value / duration.value) * 100
})

function tokenizeSubtitle(text) {
  const parts = text.split(/(\s+)/)
  return parts.map(part => {
    const clean = part.replace(/[^a-zA-Z'-]/g, '').toLowerCase()
    return { text: part, clean }
  }).filter(t => t.text.trim().length > 0)
}

function parseSRT(content) {
  const blocks = content.trim().replace(/\r\n/g, '\n').split(/\n\n+/)
  const result = []
  for (const block of blocks) {
    const lines = block.split('\n')
    if (lines.length < 3) continue
    const timeLine = lines[1]
    const match = timeLine.match(
      /(\d{2}):(\d{2}):(\d{2})[,.](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[,.](\d{3})/
    )
    if (!match) continue
    const start =
      parseInt(match[1]) * 3600 +
      parseInt(match[2]) * 60 +
      parseInt(match[3]) +
      parseInt(match[4]) / 1000
    const end =
      parseInt(match[5]) * 3600 +
      parseInt(match[6]) * 60 +
      parseInt(match[7]) +
      parseInt(match[8]) / 1000
    const text = lines.slice(2).join(' ').replace(/<[^>]+>/g, '')
    result.push({ start, end, text })
  }
  return result
}

function onVideoFileChange(e) {
  const file = e.target.files[0]
  if (!file) return
  if (videoSrc.value) {
    URL.revokeObjectURL(videoSrc.value)
  }
  videoSrc.value = URL.createObjectURL(file)
}

function onSrtFileChange(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    subtitles.value = parseSRT(ev.target.result)
  }
  reader.readAsText(file)
}

function onSrtFileChangeLazy(e) {
  onSrtFileChange(e)
}

function changeVideo() {
  videoInput.value.click()
}

function loadSrt() {
  srtInputLazy.value.click()
}

function togglePlay() {
  if (!videoEl.value) return
  if (videoEl.value.paused) {
    videoEl.value.play()
    isPlaying.value = true
  } else {
    videoEl.value.pause()
    isPlaying.value = false
  }
}

function setSpeed(s) {
  playbackRate.value = s
  if (videoEl.value) {
    videoEl.value.playbackRate = s
  }
}

function onTimeUpdate() {
  if (!videoEl.value) return
  currentTime.value = videoEl.value.currentTime

  if (abLoop.value.on && abLoop.value.a !== null && abLoop.value.b !== null) {
    if (currentTime.value >= abLoop.value.b) {
      videoEl.value.currentTime = abLoop.value.a
    }
  }
}

function onLoadedMetadata() {
  if (videoEl.value) {
    duration.value = videoEl.value.duration
  }
}

function onVideoEnded() {
  isPlaying.value = false
}

function seekTo(e) {
  if (!videoEl.value || !progressBar.value) return
  const rect = progressBar.value.getBoundingClientRect()
  const ratio = (e.clientX - rect.left) / rect.width
  videoEl.value.currentTime = ratio * duration.value
}

function toggleABLoop() {
  if (abLoop.value.on) {
    abLoop.value = { on: false, a: null, b: null }
  } else {
    abLoop.value = { on: true, a: null, b: null }
  }
}

function markA() {
  abLoop.value.a = currentTime.value
}

function markB() {
  abLoop.value.b = currentTime.value
  if (abLoop.value.a !== null && abLoop.value.b <= abLoop.value.a) {
    abLoop.value.b = null
  }
}

function resetAB() {
  abLoop.value.a = null
  abLoop.value.b = null
}

function onWordClick(e, word) {
  if (!word) return
  wordMenu.value = {
    visible: true,
    word,
    x: Math.min(e.clientX, window.innerWidth - 180),
    y: Math.max(e.clientY - 120, 10)
  }
}

function closeWordMenu() {
  wordMenu.value.visible = false
}

function addToVocab(word) {
  if (!word) return
  const exists = sessionWords.value.find(w => w.word === word)
  if (exists) {
    closeWordMenu()
    return
  }
  const existingInStore = vocabStore.words.find(w => w.word === word)
  if (existingInStore) {
    sessionWords.value.push(existingInStore)
  } else {
    const newEntry = {
      word,
      phonetic: '',
      meanings: [],
      addedAt: new Date().toISOString()
    }
    sessionWords.value.push(newEntry)
    vocabStore.addWord(newEntry)
  }
  closeWordMenu()
}

function lookupWord(word) {
  definitionModal.value = { visible: true, word, loading: true, result: null }
  closeWordMenu()

  const existing = vocabStore.words.find(w => w.word === word)
  if (existing && existing.meanings && existing.meanings.length > 0) {
    definitionModal.value.result = existing
    definitionModal.value.loading = false
    return
  }

  fetchDictionaryWord(word)
}

async function fetchDictionaryWord(word) {
  try {
    const resp = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`)
    if (!resp.ok) throw new Error('Not found')
    const data = await resp.json()
    const entry = data[0]
    const phonetic = entry.phonetic || (entry.phonetics && entry.phonetics.find(p => p.text)?.text) || ''
    const meanings = []
    if (entry.meanings) {
      for (const m of entry.meanings) {
        for (const d of m.definitions.slice(0, 2)) {
          meanings.push(`${m.partOfSpeech}: ${d.definition}`)
        }
      }
    }
    definitionModal.value.result = { word, phonetic, meanings }
    definitionModal.value.loading = false

    const idx = sessionWords.value.findIndex(w => w.word === word)
    if (idx !== -1) {
      sessionWords.value[idx] = { ...sessionWords.value[idx], phonetic, meanings }
    }
  } catch {
    definitionModal.value.result = null
    definitionModal.value.loading = false
  }
}

function playPronunciation(word) {
  speak(word, 'us')
  closeWordMenu()
}

function isWordInVocab(word) {
  if (!word) return false
  return sessionWords.value.some(w => w.word === word)
}

function removeSessionWord(word) {
  sessionWords.value = sessionWords.value.filter(w => w.word !== word)
}

function formatTime(sec) {
  if (!sec || isNaN(sec)) return '0:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function handleClickOutside(e) {
  if (wordMenu.value.visible) {
    const menu = document.querySelector('.vp-word-menu')
    if (menu && !menu.contains(e.target)) {
      closeWordMenu()
    }
  }
}

onMounted(async () => {
  await vocabStore.loadWords()
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  if (videoSrc.value) {
    URL.revokeObjectURL(videoSrc.value)
  }
})
</script>

<style scoped>
.vp-container {
  display: flex;
  height: calc(100vh - 70px);
  background: #1a1a2e;
  color: #e0e0e0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.vp-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.vp-video-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.vp-upload-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.vp-upload-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 3rem;
  border: 2px dashed #444;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  transition: border-color 0.3s;
}

.vp-upload-inner:hover {
  border-color: #667eea;
}

.vp-upload-title {
  margin-top: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #ccc;
}

.vp-upload-hint {
  font-size: 0.85rem;
  color: #888;
  margin: 0.3rem 0 1rem;
}

.vp-upload-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.6rem 1.8rem;
  border-radius: 6px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.3s;
}

.vp-upload-btn:hover {
  background: #764ba2;
}

.vp-player-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.vp-video {
  flex: 1;
  width: 100%;
  object-fit: contain;
  background: #000;
}

.vp-subtitle-overlay {
  position: absolute;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  max-width: 80%;
  text-align: center;
  padding: 0.6rem 1.2rem;
  background: rgba(0, 0, 0, 0.75);
  border-radius: 8px;
  font-size: 1.25rem;
  line-height: 1.8;
  z-index: 10;
  pointer-events: auto;
}

.vp-subtitle-word {
  cursor: pointer;
  transition: color 0.2s, background 0.2s;
  border-radius: 3px;
  padding: 0 2px;
}

.vp-subtitle-word:hover {
  color: #667eea;
  background: rgba(102, 126, 234, 0.15);
}

.vp-word-highlight {
  color: #ffd93d;
  border-bottom: 2px solid #ffd93d;
}

.vp-word-menu {
  position: fixed;
  background: #2a2a3e;
  border: 1px solid #444;
  border-radius: 8px;
  padding: 0.5rem 0;
  min-width: 160px;
  z-index: 100;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
}

.vp-word-menu-header {
  padding: 0.5rem 1rem;
  font-weight: 600;
  font-size: 1rem;
  color: #667eea;
  border-bottom: 1px solid #444;
}

.vp-word-menu-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.55rem 1rem;
  background: none;
  border: none;
  color: #ddd;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s;
}

.vp-word-menu-item:hover {
  background: rgba(102, 126, 234, 0.15);
  color: #fff;
}

.vp-controls {
  background: #16213e;
  padding: 0.5rem 1rem 0.8rem;
}

.vp-controls-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.vp-ctrl-btn {
  background: none;
  border: none;
  color: #ccc;
  cursor: pointer;
  padding: 0.4rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s, background 0.2s;
}

.vp-ctrl-btn:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}

.vp-ctrl-btn.active {
  color: #667eea;
}

.vp-time {
  font-size: 0.85rem;
  color: #aaa;
  min-width: 90px;
}

.vp-speed-group {
  display: flex;
  gap: 2px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  padding: 2px;
}

.vp-speed-btn {
  background: none;
  border: none;
  color: #aaa;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.2s;
}

.vp-speed-btn:hover {
  color: #fff;
}

.vp-speed-btn.active {
  background: #667eea;
  color: #fff;
}

.vp-ab-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #aaa;
}

.vp-ab-mark {
  background: #667eea;
  color: #fff;
  border: none;
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
}

.vp-ab-mark:hover {
  background: #764ba2;
}

.vp-progress-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  margin-top: 0.5rem;
  cursor: pointer;
  position: relative;
}

.vp-progress-fill {
  height: 100%;
  background: #667eea;
  border-radius: 3px;
  transition: width 0.1s linear;
}

.vp-ab-marker {
  position: absolute;
  top: -3px;
  width: 3px;
  height: 12px;
  border-radius: 1px;
  z-index: 2;
}

.vp-ab-marker.a-marker {
  background: #6bcb77;
}

.vp-ab-marker.b-marker {
  background: #ff6b6b;
}

.vp-sidebar {
  width: 280px;
  background: #16213e;
  border-left: 1px solid #2a2a3e;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.vp-sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.2rem;
  border-bottom: 1px solid #2a2a3e;
}

.vp-sidebar-header h3 {
  margin: 0;
  font-size: 1rem;
  color: #e0e0e0;
}

.vp-sidebar-count {
  background: #667eea;
  color: #fff;
  font-size: 0.75rem;
  padding: 0.15rem 0.5rem;
  border-radius: 10px;
}

.vp-sidebar-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem 0;
}

.vp-vocab-item {
  display: flex;
  align-items: center;
  padding: 0.6rem 1.2rem;
  gap: 0.5rem;
  transition: background 0.2s;
}

.vp-vocab-item:hover {
  background: rgba(255, 255, 255, 0.04);
}

.vp-vocab-word {
  font-weight: 600;
  color: #667eea;
  cursor: pointer;
  font-size: 0.95rem;
}

.vp-vocab-word:hover {
  text-decoration: underline;
}

.vp-vocab-meaning {
  flex: 1;
  font-size: 0.8rem;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.vp-vocab-remove {
  background: none;
  border: none;
  color: #666;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 0 0.3rem;
  line-height: 1;
  transition: color 0.2s;
}

.vp-vocab-remove:hover {
  color: #ff6b6b;
}

.vp-sidebar-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 0.9rem;
}

.vp-def-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.vp-def-content {
  background: #2a2a3e;
  border-radius: 12px;
  width: 90%;
  max-width: 420px;
  max-height: 70vh;
  overflow-y: auto;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);
}

.vp-def-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #444;
}

.vp-def-header h3 {
  margin: 0;
  color: #667eea;
  font-size: 1.3rem;
}

.vp-def-close {
  background: none;
  border: none;
  color: #999;
  font-size: 1.5rem;
  cursor: pointer;
  line-height: 1;
}

.vp-def-close:hover {
  color: #fff;
}

.vp-def-body {
  padding: 1rem 1.5rem;
}

.vp-def-loading {
  text-align: center;
  color: #888;
  padding: 2rem 0;
}

.vp-def-phonetic {
  color: #aaa;
  font-style: italic;
  margin-bottom: 0.8rem;
}

.vp-def-result h4 {
  color: #ccc;
  font-size: 0.9rem;
  margin: 0.8rem 0 0.4rem;
}

.vp-def-result ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.vp-def-result li {
  padding: 0.3rem 0;
  color: #ddd;
  font-size: 0.9rem;
  line-height: 1.5;
}

.vp-def-empty {
  text-align: center;
  color: #888;
  padding: 2rem 0;
}

@media (max-width: 768px) {
  .vp-container {
    flex-direction: column;
  }

  .vp-sidebar {
    width: 100%;
    max-height: 200px;
    border-left: none;
    border-top: 1px solid #2a2a3e;
  }

  .vp-subtitle-overlay {
    font-size: 1rem;
    max-width: 90%;
    bottom: 70px;
  }

  .vp-speed-group {
    display: none;
  }
}
</style>
