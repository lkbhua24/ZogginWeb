import { isMac } from './browserCompatibility.js'

export const SHORTCUT_LABELS = {
  navToggle: '切换导航栏',
  navLogoutConfirm: '退出确认',
  studyFlip: '翻转卡片',
  studyResponseForget: '标记忘记',
  studyResponseVague: '标记模糊',
  studyResponseKnow: '标记认识',
  studyFullscreen: '全屏切换',
  studyExit: '退出/返回'
}

export const DEFAULT_SHORTCUTS = {
  navToggle: 'Ctrl+B',
  navLogoutConfirm: 'Ctrl+Shift+Q',
  studyFlip: 'Space',
  studyResponseForget: '1',
  studyResponseVague: '2',
  studyResponseKnow: '3',
  studyFullscreen: 'F',
  studyExit: 'Escape'
}

const RESERVED_SHORTCUTS = {
  'Ctrl+C': '复制',
  'Ctrl+V': '粘贴',
  'Ctrl+X': '剪切',
  'Ctrl+Z': '撤销',
  'Ctrl+A': '全选',
  'Ctrl+S': '保存',
  'Ctrl+F': '搜索',
  'Ctrl+T': '新标签',
  'Ctrl+W': '关闭标签',
  'Ctrl+R': '刷新',
  'Alt+F4': '关闭窗口',
  'Tab': 'Tab 键',
  'Shift+Tab': '反向 Tab',
  'Escape': 'Esc 键'
}

export function parseShortcut(shortcut) {
  if (!shortcut) return null

  const parts = shortcut.split('+').map(p => p.trim())
  const result = {
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    key: ''
  }

  for (const part of parts) {
    const lower = part.toLowerCase()
    if (lower === 'ctrl' || lower === 'control') {
      result.ctrlKey = true
    } else if (lower === 'shift') {
      result.shiftKey = true
    } else if (lower === 'alt') {
      result.altKey = true
    } else if (lower === 'cmd' || lower === 'meta' || lower === 'command') {
      result.metaKey = true
    } else {
      result.key = part
    }
  }

  if (result.key.toLowerCase() === 'space') {
    result.key = ' '
  }

  return result
}

export function eventToShortcut(event) {
  const parts = []

  const isMacOS = isMac()

  if (isMacOS) {
    if (event.metaKey) parts.push('Cmd')
  } else {
    if (event.ctrlKey) parts.push('Ctrl')
  }

  if (event.shiftKey) parts.push('Shift')
  if (event.altKey) parts.push('Alt')

  let key = event.key

  if (key === ' ') {
    key = 'Space'
  } else if (key.length === 1) {
    key = key.toUpperCase()
  }

  if (key.length > 1 && key !== 'Space') {
    if (['Control', 'Shift', 'Alt', 'Meta', 'CapsLock', 'Tab'].includes(key)) {
      return null
    }
  }

  parts.push(key)

  return parts.join('+')
}

export function formatShortcut(shortcut) {
  if (!shortcut) return ''

  const isMacOS = isMac()

  return shortcut
    .split('+')
    .map(part => {
      const lower = part.toLowerCase()
      if (isMacOS) {
        if (lower === 'ctrl') return '⌘'
        if (lower === 'alt') return '⌥'
        if (lower === 'shift') return '⇧'
      }
      return part
    })
    .join(' + ')
}

export function isShortcutConflict(shortcut) {
  if (!shortcut) return false
  return Object.keys(RESERVED_SHORTCUTS).some(reserved =>
    reserved.toLowerCase() === shortcut.toLowerCase()
  )
}

export function getConflictReason(shortcut) {
  if (!shortcut) return null
  const match = Object.entries(RESERVED_SHORTCUTS).find(([reserved]) =>
    reserved.toLowerCase() === shortcut.toLowerCase()
  )
  return match ? match[1] : null
}

export function normalizeShortcut(shortcut) {
  if (!shortcut) return ''

  const parts = shortcut.split('+').map(p => p.trim())
  const normalized = []
  let key = ''

  const modifierOrder = ['Ctrl', 'Alt', 'Shift', 'Meta']

  for (const part of parts) {
    const lower = part.toLowerCase()
    if (modifierOrder.some(m => m.toLowerCase() === lower)) {
      normalized.push(modifierOrder.find(m => m.toLowerCase() === lower))
    } else {
      key = part.length === 1 ? part.toUpperCase() : part
    }
  }

  if (key.toLowerCase() === 'space') {
    key = 'Space'
  }

  return [...normalized, key].join('+')
}

export function validateShortcut(shortcut) {
  if (!shortcut || shortcut.trim() === '') {
    return { valid: false, error: '快捷键不能为空' }
  }

  const parts = shortcut.split('+').map(p => p.trim())

  if (parts.length === 0) {
    return { valid: false, error: '快捷键格式无效' }
  }

  const hasModifier = parts.some(p => {
    const lower = p.toLowerCase()
    return ['ctrl', 'control', 'shift', 'alt', 'meta', 'cmd', 'command'].includes(lower)
  })

  const keyPart = parts.find(p => {
    const lower = p.toLowerCase()
    return !['ctrl', 'control', 'shift', 'alt', 'meta', 'cmd', 'command'].includes(lower)
  })

  if (!keyPart) {
    return { valid: false, error: '必须指定一个按键' }
  }

  if (keyPart.length > 1 && keyPart.toLowerCase() !== 'space') {
    return { valid: false, error: `不支持的按键: ${keyPart}` }
  }

  return { valid: true }
}

export function createShortcutManager(shortcuts, onUpdate) {
  let currentShortcuts = { ...shortcuts }
  let callback = onUpdate

  return {
    getShortcuts() {
      return { ...currentShortcuts }
    },

    updateShortcut(action, newShortcut) {
      const validation = validateShortcut(newShortcut)
      if (!validation.valid) {
        return { success: false, error: validation.error }
      }

      const normalized = normalizeShortcut(newShortcut)

      for (const [actionKey, actionShortcut] of Object.entries(currentShortcuts)) {
        if (actionKey !== action && normalizeShortcut(actionShortcut).toLowerCase() === normalized.toLowerCase()) {
          return { success: false, error: `该快捷键已被「${SHORTCUT_LABELS[actionKey]}」使用` }
        }
      }

      if (isShortcutConflict(normalized)) {
        const reason = getConflictReason(normalized)
        return { success: false, error: `与系统快捷键「${reason}」冲突` }
      }

      const oldShortcut = currentShortcuts[action]
      currentShortcuts[action] = normalized

      if (callback) {
        callback(currentShortcuts)
      }

      return { success: true, shortcut: normalized }
    },

    resetToDefault(action) {
      if (action) {
        currentShortcuts[action] = DEFAULT_SHORTCUTS[action]
      } else {
        currentShortcuts = { ...DEFAULT_SHORTCUTS }
      }

      if (callback) {
        callback(currentShortcuts)
      }

      return { success: true, shortcuts: { ...currentShortcuts } }
    },

    matches(action, event) {
      const shortcut = currentShortcuts[action]
      if (!shortcut) return false

      const parsed = parseShortcut(shortcut)
      if (!parsed) return false

      const isMacOS = isMac()

      if (isMacOS) {
        if (parsed.metaKey !== event.metaKey) return false
      } else {
        if (parsed.ctrlKey !== event.ctrlKey) return false
      }

      if (parsed.shiftKey !== event.shiftKey) return false
      if (parsed.altKey !== event.altKey) return false

      let eventKey = event.key
      if (eventKey === ' ') eventKey = 'Space'
      else if (eventKey.length === 1) eventKey = eventKey.toUpperCase()

      let shortcutKey = parsed.key
      if (shortcutKey === ' ') shortcutKey = 'Space'
      else if (shortcutKey.length === 1) shortcutKey = shortcutKey.toUpperCase()

      return eventKey === shortcutKey
    },

    setCallback(fn) {
      callback = fn
    }
  }
}

export default {
  SHORTCUT_LABELS,
  DEFAULT_SHORTCUTS,
  RESERVED_SHORTCUTS,
  parseShortcut,
  eventToShortcut,
  formatShortcut,
  isShortcutConflict,
  getConflictReason,
  normalizeShortcut,
  validateShortcut,
  createShortcutManager
}
