import { ref, nextTick } from 'vue'

// 专注模式状态
const isFocusMode = ref(false)
const allowedToastTypes = ref(['study', 'learning', 'review', 'error'])
const blockedToastQueue = ref([])

/**
 * 启动专注模式
 * @param {Object} options - 配置选项
 * @param {Array} options.allowedTypes - 允许的toast类型
 */
export function enableFocusMode(options = {}) {
  isFocusMode.value = true
  if (options.allowedTypes) {
    allowedToastTypes.value = options.allowedTypes
  }

  // 阻止非学习相关通知
  blockNonStudyNotifications()

  // 添加点击保护
  nextTick(() => {
    setupClickProtection()
  })
}

/**
 * 退出专注模式
 */
export function disableFocusMode() {
  isFocusMode.value = false
  removeClickProtection()
  restoreBlockedNotifications()
}

/**
 * 检查是否处于专注模式
 */
export function getFocusModeState() {
  return isFocusMode.value
}

/**
 * 检查toast是否应该显示
 * @param {string} type - toast类型
 * @param {string} message - toast消息
 * @returns {boolean}
 */
export function shouldShowToast(type, message) {
  if (!isFocusMode.value) return true

  // 学习相关关键词
  const studyKeywords = [
    '单词', '学习', '复习', '掌握', '记忆', '词组',
    '例句', '发音', '完成', '进度', '掌握度',
    'word', 'study', 'review', 'master', 'learning',
    '保存', '成功', 'error', '失败'
  ]

  // 检查类型
  if (allowedToastTypes.value.includes(type)) return true

  // 检查内容
  const content = (message || '').toLowerCase()
  const hasStudyKeyword = studyKeywords.some(keyword =>
    content.includes(keyword.toLowerCase())
  )

  if (!hasStudyKeyword) {
    blockedToastQueue.value.push({ type, message, time: Date.now() })
    return false
  }

  return true
}

/**
 * 设置点击保护 - 阻止非安全区域点击
 */
function setupClickProtection() {
  // 防止误触的全局点击拦截器
  const clickInterceptor = (e) => {
    // 获取安全区域
    const safeZones = document.querySelectorAll('.focus-safe-zone')
    const wordCard = document.querySelector('.word-display')
    const controls = document.querySelector('.controls')
    const studyHeader = document.querySelector('.study-header')

    // 检查点击是否在安全区域内
    let isInSafeZone = false

    // 检查单词卡片区域
    if (wordCard && wordCard.contains(e.target)) {
      isInSafeZone = true
    }

    // 检查控制按钮区域
    if (controls && controls.contains(e.target)) {
      isInSafeZone = true
    }

    // 检查头部导航（保留返回和设置功能）
    if (studyHeader && studyHeader.contains(e.target)) {
      isInSafeZone = true
    }

    // 检查显式标记的安全区域
    safeZones.forEach(zone => {
      if (zone.contains(e.target)) {
        isInSafeZone = true
      }
    })

    // 检查是否是按钮或交互元素
    const isInteractive = e.target.closest('button, a, input, .control-btn, .back-btn, .settings-btn')
    if (isInteractive) {
      // 如果是交互元素，检查是否在允许的区域内
      const inControls = e.target.closest('.controls')
      const inHeader = e.target.closest('.study-header')
      const inCard = e.target.closest('.word-display')
      if (inControls || inHeader || inCard) {
        isInSafeZone = true
      }
    }

    // 如果不在安全区域，阻止点击
    if (!isInSafeZone) {
      e.preventDefault()
      e.stopPropagation()
      console.log('[FocusMode] Blocked click outside safe zone')
    }
  }

  // 使用捕获阶段拦截点击
  document.addEventListener('click', clickInterceptor, true)

  // 存储引用以便后续移除
  window.__focusModeClickInterceptor = clickInterceptor

  // 添加视觉提示 - 非安全区域变暗
  addFocusOverlay()
}

/**
 * 移除点击保护
 */
function removeClickProtection() {
  if (window.__focusModeClickInterceptor) {
    document.removeEventListener('click', window.__focusModeClickInterceptor, true)
    window.__focusModeClickInterceptor = null
  }
  removeFocusOverlay()
}

/**
 * 添加专注遮罩层
 */
function addFocusOverlay() {
  // 检查是否已存在
  if (document.querySelector('.focus-mode-overlay')) return

  const overlay = document.createElement('div')
  overlay.className = 'focus-mode-overlay'
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.03);
    pointer-events: none;
    z-index: 40;
    transition: opacity 0.3s ease;
  `

  // 创建安全区域高亮
  const safeAreaHighlight = document.createElement('div')
  safeAreaHighlight.className = 'focus-safe-area-highlight'
  safeAreaHighlight.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: min(720px, 94%);
    height: 60vh;
    border: 2px solid rgba(102, 126, 234, 0.2);
    border-radius: 20px;
    pointer-events: none;
    z-index: 41;
    box-shadow: 0 0 100px rgba(102, 126, 234, 0.1);
  `

  document.body.appendChild(overlay)
  document.body.appendChild(safeAreaHighlight)
}

/**
 * 移除专注遮罩层
 */
function removeFocusOverlay() {
  const overlay = document.querySelector('.focus-mode-overlay')
  const highlight = document.querySelector('.focus-safe-area-highlight')
  if (overlay) overlay.remove()
  if (highlight) highlight.remove()
}

/**
 * 阻止非学习通知
 */
function blockNonStudyNotifications() {
  // 拦截原生通知
  if ('Notification' in window) {
    const originalNotification = window.Notification
    window.Notification = new Proxy(originalNotification, {
      construct(target, args) {
        if (isFocusMode.value) {
          console.log('[FocusMode] Blocked notification:', args[0])
          blockedToastQueue.value.push({ type: 'notification', title: args[0], time: Date.now() })
          return { close: () => {} }
        }
        return new target(...args)
      }
    })
  }
}

/**
 * 恢复被阻止的通知
 */
function restoreBlockedNotifications() {
  // 可以在这里选择性地显示被阻止的重要通知
  if (blockedToastQueue.value.length > 0) {
    console.log('[FocusMode] Blocked during focus mode:', blockedToastQueue.value)
    blockedToastQueue.value = []
  }
}

/**
 * 检查 async/await 兼容性 (CSP安全方式)
 * @returns {boolean}
 */
export function checkAsyncAwait() {
  // 使用更安全的检测方式，避免 CSP 问题
  try {
    return typeof (async () => {}).then === 'function';
  } catch (e) {
    return false;
  }
}

/**
 * 创建专注模式组合式函数 (用于 Vue3 setup)
 */
export function useFocusMode() {
  return {
    isFocusMode,
    enableFocusMode,
    disableFocusMode,
    shouldShowToast
  }
}

export default {
  enableFocusMode,
  disableFocusMode,
  getFocusModeState,
  shouldShowToast,
  useFocusMode,
  checkAsyncAwait
}
