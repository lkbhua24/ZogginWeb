<template>
  <div class="settings-container">
    <div class="settings-content">
      <header class="settings-header">
        <button class="back-btn" @click="$router.push('/')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <h1 class="settings-title">设置</h1>
      </header>

      <div v-if="isFirstSetup" class="setup-banner">
        <div class="setup-banner-icon">🎯</div>
        <div class="setup-banner-text">
          <h3>完成初始设置</h3>
          <p>设置考试日期和每日目标后即可开始学习</p>
        </div>
        <button
          class="setup-done-btn"
          :disabled="!canFinishSetup"
          @click="finishSetup"
        >
          {{ canFinishSetup ? '完成设置' : '请先设置考试日期' }}
        </button>
      </div>

      <section class="settings-section">
        <h2 class="section-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="4" y1="6" x2="20" y2="6"></line>
            <line x1="4" y1="12" x2="20" y2="12"></line>
            <line x1="4" y1="18" x2="20" y2="18"></line>
          </svg>
          导航设置
        </h2>
        <div class="settings-card">
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">显示模式</span>
              <span class="setting-desc">选择导航栏的显示方式</span>
            </div>
            <div class="setting-control">
              <div class="mode-selector">
                <button
                  class="mode-btn"
                  :class="{ active: config.navDisplayMode === 'fixed' }"
                  @click="updateConfig('navDisplayMode', 'fixed')"
                >固定</button>
                <button
                  class="mode-btn"
                  :class="{ active: config.navDisplayMode === 'auto' }"
                  @click="updateConfig('navDisplayMode', 'auto')"
                >自动隐藏</button>
              </div>
            </div>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">唤出延迟</span>
              <span class="setting-desc">鼠标离开后导航栏隐藏的延迟时间</span>
            </div>
            <div class="setting-control">
              <button class="num-btn" @click="updateConfig('navHoverDelay', Math.max(1000, config.navHoverDelay - 500))">-</button>
              <span class="num-value">{{ config.navHoverDelay / 1000 }}s</span>
              <button class="num-btn" @click="updateConfig('navHoverDelay', Math.min(10000, config.navHoverDelay + 500))">+</button>
            </div>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">透明度</span>
              <span class="setting-desc">调整导航栏背景透明度</span>
            </div>
            <div class="setting-control">
              <button class="num-btn" @click="updateConfig('navOpacity', Math.max(50, config.navOpacity - 5))">-</button>
              <span class="num-value">{{ config.navOpacity }}%</span>
              <button class="num-btn" @click="updateConfig('navOpacity', Math.min(100, config.navOpacity + 5))">+</button>
            </div>
          </div>
        </div>
      </section>

      <section class="settings-section">
        <h2 class="section-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
          学习设置
        </h2>
        <div class="settings-card">
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">卡片大小</span>
              <span class="setting-desc">调整学习卡片尺寸</span>
            </div>
            <div class="setting-control">
              <div class="mode-selector">
                <button
                  class="mode-btn"
                  :class="{ active: config.cardSize === 'small' }"
                  @click="updateConfig('cardSize', 'small')"
                >小</button>
                <button
                  class="mode-btn"
                  :class="{ active: config.cardSize === 'medium' }"
                  @click="updateConfig('cardSize', 'medium')"
                >中</button>
                <button
                  class="mode-btn"
                  :class="{ active: config.cardSize === 'large' }"
                  @click="updateConfig('cardSize', 'large')"
                >大</button>
              </div>
            </div>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">字体大小</span>
              <span class="setting-desc">调整学习界面字体大小</span>
            </div>
            <div class="setting-control">
              <div class="mode-selector">
                <button
                  class="mode-btn"
                  :class="{ active: config.fontSize === 'small' }"
                  @click="updateConfig('fontSize', 'small')"
                >小</button>
                <button
                  class="mode-btn"
                  :class="{ active: config.fontSize === 'medium' }"
                  @click="updateConfig('fontSize', 'medium')"
                >中</button>
                <button
                  class="mode-btn"
                  :class="{ active: config.fontSize === 'large' }"
                  @click="updateConfig('fontSize', 'large')"
                >大</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="settings-section">
        <h2 class="section-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          学习目标
        </h2>
        <div class="settings-card">
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">每日新词数</span>
              <span class="setting-desc">每天学习的新单词数量</span>
            </div>
            <div class="setting-control">
              <button class="num-btn" @click="updateConfig('dailyNewWords', Math.max(5, config.dailyNewWords - 5))">-</button>
              <span class="num-value">{{ config.dailyNewWords }}</span>
              <button class="num-btn" @click="updateConfig('dailyNewWords', Math.min(100, config.dailyNewWords + 5))">+</button>
            </div>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">每日复习上限</span>
              <span class="setting-desc">每天最多复习的单词数量</span>
            </div>
            <div class="setting-control">
              <button class="num-btn" @click="updateConfig('dailyReviewLimit', Math.max(10, config.dailyReviewLimit - 10))">-</button>
              <span class="num-value">{{ config.dailyReviewLimit }}</span>
              <button class="num-btn" @click="updateConfig('dailyReviewLimit', Math.min(200, config.dailyReviewLimit + 10))">+</button>
            </div>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">考试日期</span>
              <span class="setting-desc">设定目标考试日期</span>
            </div>
            <div class="setting-control">
              <input
                type="date"
                class="date-input"
                :value="config.examDate"
                @change="updateConfig('examDate', $event.target.value)"
              />
            </div>
          </div>
        </div>
      </section>

      <section class="settings-section">
        <h2 class="section-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
            <path d="M2 17l10 5 10-5"></path>
            <path d="M2 12l10 5 10-5"></path>
          </svg>
          学习偏好
        </h2>
        <div class="settings-card">
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">默认学习模式</span>
              <span class="setting-desc">进入学习时的默认模式</span>
            </div>
            <div class="setting-control">
              <div class="mode-selector">
                <button
                  class="mode-btn"
                  :class="{ active: config.defaultMode === 'card' }"
                  @click="updateConfig('defaultMode', 'card')"
                >卡片</button>
                <button
                  class="mode-btn"
                  :class="{ active: config.defaultMode === 'spelling' }"
                  @click="updateConfig('defaultMode', 'spelling')"
                >拼写</button>
                <button
                  class="mode-btn"
                  :class="{ active: config.defaultMode === 'listening' }"
                  @click="updateConfig('defaultMode', 'listening')"
                >听力</button>
              </div>
            </div>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">自动播放音频</span>
              <span class="setting-desc">翻开卡片时自动播放单词发音</span>
            </div>
            <div class="setting-control">
              <label class="toggle">
                <input
                  type="checkbox"
                  :checked="config.autoPlayAudio"
                  @change="updateConfig('autoPlayAudio', $event.target.checked)"
                />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">主题切换</span>
              <span class="setting-desc">选择界面主题风格</span>
            </div>
            <div class="setting-control">
              <div class="mode-selector">
                <button
                  class="mode-btn"
                  :class="{ active: config.theme === 'light' }"
                  @click="updateConfig('theme', 'light')"
                >浅色</button>
                <button
                  class="mode-btn"
                  :class="{ active: config.theme === 'dark' }"
                  @click="updateConfig('theme', 'dark')"
                >深色</button>
                <button
                  class="mode-btn"
                  :class="{ active: config.theme === 'auto' }"
                  @click="updateConfig('theme', 'auto')"
                >跟随系统</button>
              </div>
            </div>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">界面动效</span>
              <span class="setting-desc">开启/关闭非必要动画效果，关闭可提升性能</span>
            </div>
            <div class="setting-control">
              <label class="toggle" role="switch" :aria-checked="config.enableAnimations" aria-label="界面动效开关">
                <input
                  type="checkbox"
                  :checked="config.enableAnimations"
                  @change="updateConfig('enableAnimations', $event.target.checked)"
                  aria-describedby="animation-desc"
                />
                <span class="toggle-slider" aria-hidden="true"></span>
              </label>
              <span id="animation-desc" class="sr-only">开启或关闭界面动画效果，关闭后可提升低性能设备的响应速度</span>
            </div>
          </div>
          <div class="setting-item" v-if="config.enableAnimations">
            <div class="setting-info">
              <span class="setting-label">动效速度</span>
              <span class="setting-desc">调整动画过渡速度</span>
            </div>
            <div class="setting-control">
              <div class="mode-selector">
                <button
                  class="mode-btn"
                  :class="{ active: config.animationSpeed === 'slow' }"
                  @click="updateConfig('animationSpeed', 'slow')"
                >慢速</button>
                <button
                  class="mode-btn"
                  :class="{ active: config.animationSpeed === 'normal' }"
                  @click="updateConfig('animationSpeed', 'normal')"
                >标准</button>
                <button
                  class="mode-btn"
                  :class="{ active: config.animationSpeed === 'fast' }"
                  @click="updateConfig('animationSpeed', 'fast')"
                >快速</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="settings-section">
        <h2 class="section-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          通知
        </h2>
        <div class="settings-card">
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">每日提醒时间</span>
              <span class="setting-desc">设置每天的学习提醒时间</span>
            </div>
            <div class="setting-control">
              <input
                type="time"
                class="time-input"
                :value="config.reminderTime"
                @change="updateConfig('reminderTime', $event.target.value)"
              />
            </div>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">浏览器通知</span>
              <span class="setting-desc">{{ notificationStatus }}</span>
            </div>
            <div class="setting-control">
              <button
                class="action-btn"
                :class="{ granted: notificationPermission === 'granted' }"
                :disabled="notificationPermission === 'granted'"
                @click="requestNotification"
              >
                {{ notificationPermission === 'granted' ? '已开启' : '开启通知' }}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section class="settings-section">
        <h2 class="section-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          数据管理
        </h2>
        <div class="settings-card">
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">立即备份</span>
              <span class="setting-desc">将所有数据导出为 JSON 文件</span>
            </div>
            <div class="setting-control">
              <button class="action-btn" @click="handleExport">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                导出
              </button>
            </div>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">从文件恢复</span>
              <span class="setting-desc">从 JSON 备份文件恢复数据</span>
            </div>
            <div class="setting-control">
              <button class="action-btn" @click="triggerImport">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                导入
              </button>
              <input
                ref="fileInput"
                type="file"
                accept=".json"
                class="file-input"
                @change="handleImport"
              />
            </div>
          </div>
          <div class="setting-item danger">
            <div class="setting-info">
              <span class="setting-label">清除所有数据</span>
              <span class="setting-desc">删除所有学习记录和设置，不可恢复</span>
            </div>
            <div class="setting-control">
              <button class="action-btn danger-btn" @click="showClearConfirm = true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                清除
              </button>
            </div>
          </div>
        </div>
      </section>

      <section class="settings-section">
        <h2 class="section-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          账户
        </h2>
        <div class="settings-card">
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">用户名</span>
              <span class="setting-desc">你的本地学习档案</span>
            </div>
            <span class="setting-value">{{ userStore.userName }}</span>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">已学习天数</span>
              <span class="setting-desc">从创建档案至今</span>
            </div>
            <span class="setting-value">{{ userStore.studyDays }} 天</span>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">退出登录</span>
              <span class="setting-desc">清除内存数据，保留本地存储</span>
            </div>
            <div class="setting-control">
              <button class="action-btn" @click="handleLogout">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                退出
              </button>
            </div>
          </div>
        </div>
      </section>

      <section class="settings-section">
        <h2 class="section-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2"></rect>
            <line x1="6" y1="8" x2="6" y2="8"></line>
            <line x1="10" y1="8" x2="10" y2="8"></line>
            <line x1="14" y1="8" x2="14" y2="8"></line>
            <line x1="18" y1="8" x2="18" y2="8"></line>
            <line x1="6" y1="12" x2="6" y2="12"></line>
            <line x1="10" y1="12" x2="10" y2="12"></line>
            <line x1="14" y1="12" x2="14" y2="12"></line>
            <line x1="18" y1="12" x2="18" y2="12"></line>
            <line x1="8" y1="16" x2="16" y2="16"></line>
          </svg>
          快捷键
        </h2>
        <div class="settings-card">
          <div class="setting-item shortcut-item" v-for="(shortcut, action) in shortcuts" :key="action">
            <div class="setting-info">
              <span class="setting-label">{{ SHORTCUT_LABELS[action] }}</span>
            </div>
            <div class="setting-control shortcut-control">
              <div
                class="shortcut-key-display"
                :class="{ 'is-recording': recordingAction === action, 'has-conflict': shortcutConflicts[action] }"
                @click="startRecording(action)"
                @keydown.prevent="handleShortcutKeydown($event, action)"
                :tabindex="0"
              >
                <template v-if="recordingAction === action">
                  <span class="recording-text">按键中...</span>
                </template>
                <template v-else>
                  {{ formatShortcut(shortcut) }}
                </template>
              </div>
              <button
                v-if="shortcut !== DEFAULT_SHORTCUTS[action]"
                class="reset-shortcut-btn"
                @click="resetShortcut(action)"
                title="恢复默认"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="1 4 1 10 7 10"></polyline>
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                </svg>
              </button>
              <span v-if="shortcutConflicts[action]" class="shortcut-conflict-msg">{{ shortcutConflicts[action] }}</span>
            </div>
          </div>
          <div class="shortcut-actions">
            <button class="action-btn reset-all-btn" @click="resetAllShortcuts">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="1 4 1 10 7 10"></polyline>
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
              </svg>
              恢复所有默认快捷键
            </button>
          </div>
        </div>
      </section>

      <section class="settings-section">
        <h2 class="section-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          关于
        </h2>
        <div class="settings-card">
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">版本号</span>
            </div>
            <span class="setting-value">1.0.0</span>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">开源协议</span>
            </div>
            <span class="setting-value">MIT License</span>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">反馈入口</span>
              <span class="setting-desc">提交问题或建议</span>
            </div>
            <div class="setting-control">
              <button class="action-btn" @click="openFeedback">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
                反馈
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>

    <div v-if="showClearConfirm" class="modal-overlay" @click.self="showClearConfirm = false">
      <div class="modal-card">
        <div class="modal-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </div>
        <h3 class="modal-title">确认清除所有数据？</h3>
        <p class="modal-desc">此操作将删除所有学习记录、单词本和设置，且不可恢复。建议先备份数据。</p>
        <div class="modal-actions">
          <button class="modal-btn cancel" @click="showClearConfirm = false">取消</button>
          <button class="modal-btn confirm" @click="handleClearAll">确认清除</button>
        </div>
      </div>
    </div>

    <div v-if="toast.show" class="toast" :class="toast.type">
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'
import { SHORTCUT_LABELS, DEFAULT_SHORTCUTS, formatShortcut, eventToShortcut, validateShortcut, isShortcutConflict, getConflictReason, normalizeShortcut } from '../utils/shortcutManager.js'

const emit = defineEmits([])

const router = useRouter()
const userStore = useUserStore()
const fileInput = ref(null)
const showClearConfirm = ref(false)
const notificationPermission = ref('default')

const shortcuts = ref({ ...DEFAULT_SHORTCUTS })
const recordingAction = ref(null)
const shortcutConflicts = ref({})

const isFirstSetup = computed(() => {
  return !userStore.studyPlan?.examDate
})

const canFinishSetup = computed(() => {
  return !!userStore.config.examDate
})

const toast = ref({
  show: false,
  message: '',
  type: 'success'
})

const config = computed(() => userStore.config)

const notificationStatus = computed(() => {
  if (!('Notification' in window)) return '当前浏览器不支持通知'
  const status = notificationPermission.value
  if (status === 'granted') return '已获得通知权限'
  if (status === 'denied') return '通知权限已被拒绝'
  return '点击开启浏览器通知提醒'
})

function showToast(message, type = 'success') {
  toast.value = { show: true, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, 2500)
}

async function updateConfig(key, value) {
  await userStore.updateConfig({ [key]: value })
  if (['examDate', 'dailyNewWords', 'dailyReviewLimit', 'defaultMode', 'reviewMode'].includes(key)) {
    await userStore.updatePlan({ [key]: value })
  }
}

async function finishSetup() {
  if (!userStore.config.examDate) return
  await userStore.updatePlan({
    examDate: userStore.config.examDate,
    dailyNewWords: userStore.config.dailyNewWords,
    dailyReviewLimit: userStore.config.dailyReviewLimit
  })
  showToast('设置完成，开始学习吧！')
  router.push('/')
}

async function requestNotification() {
  if (!('Notification' in window)) {
    showToast('当前浏览器不支持通知功能', 'error')
    return
  }
  try {
    const permission = await Notification.requestPermission()
    notificationPermission.value = permission
    if (permission === 'granted') {
      await updateConfig('browserNotification', true)
      showToast('通知权限已开启')
    } else {
      await updateConfig('browserNotification', false)
      showToast('通知权限被拒绝', 'error')
    }
  } catch {
    showToast('请求通知权限失败', 'error')
  }
}

async function handleExport() {
  try {
    const data = await userStore.exportData()
    if (!data) {
      showToast('导出失败', 'error')
      return
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `zoggin-backup-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showToast('数据导出成功')
  } catch {
    showToast('导出失败', 'error')
  }
}

function triggerImport() {
  fileInput.value.click()
}

async function handleImport(event) {
  const file = event.target.files[0]
  if (!file) return
  try {
    const text = await file.text()
    const data = JSON.parse(text)
    const success = await userStore.importData(data)
    if (success) {
      showToast('数据恢复成功')
    } else {
      showToast('数据恢复失败', 'error')
    }
  } catch {
    showToast('文件格式无效', 'error')
  }
  event.target.value = ''
}

async function handleClearAll() {
  showClearConfirm.value = false
  const success = await userStore.clearAllData()
  if (success) {
    showToast('所有数据已清除')
  } else {
    showToast('清除数据失败', 'error')
  }
}

async function handleLogout() {
  await userStore.logout()
  showToast('已退出登录，数据已保留')
}

function openFeedback() {
  window.open('https://github.com/zoggin/zoggin-web/issues', '_blank')
}

function startRecording(action) {
  recordingAction.value = action
  shortcutConflicts.value = { ...shortcutConflicts.value, [action]: null }
  
  const el = document.activeElement
  if (el && el.classList.contains('shortcut-key-display')) {
    el.focus()
  }
}

function handleShortcutKeydown(event, action) {
  const shortcut = eventToShortcut(event)
  if (!shortcut) return
  
  const validation = validateShortcut(shortcut)
  if (!validation.valid) {
    shortcutConflicts.value = { ...shortcutConflicts.value, [action]: validation.error }
    return
  }
  
  const normalized = normalizeShortcut(shortcut)
  
  if (isShortcutConflict(normalized)) {
    const reason = getConflictReason(normalized)
    shortcutConflicts.value = { ...shortcutConflicts.value, [action]: `与系统快捷键「${reason}」冲突` }
    return
  }
  
  for (const [actionKey, actionShortcut] of Object.entries(shortcuts.value)) {
    if (actionKey !== action && normalizeShortcut(actionShortcut).toLowerCase() === normalized.toLowerCase()) {
      shortcutConflicts.value = { ...shortcutConflicts.value, [action]: `该快捷键已被「${SHORTCUT_LABELS[actionKey]}」使用` }
      return
    }
  }
  
  shortcuts.value = { ...shortcuts.value, [action]: normalized }
  shortcutConflicts.value = { ...shortcutConflicts.value, [action]: null }
  recordingAction.value = null
  
  userStore.updateConfig({ shortcuts: shortcuts.value })
}

function resetShortcut(action) {
  shortcuts.value = { ...shortcuts.value, [action]: DEFAULT_SHORTCUTS[action] }
  shortcutConflicts.value = { ...shortcutConflicts.value, [action]: null }
  userStore.updateConfig({ shortcuts: shortcuts.value })
}

function resetAllShortcuts() {
  shortcuts.value = { ...DEFAULT_SHORTCUTS }
  shortcutConflicts.value = {}
  userStore.updateConfig({ shortcuts: shortcuts.value })
}

onMounted(async () => {
  await Promise.all([
    userStore.loadConfig(),
    userStore.loadPlan()
  ])
  if ('Notification' in window) {
    notificationPermission.value = Notification.permission
  }
})
</script>

<style scoped>
.settings-container {
  min-height: 100vh;
  background: #f0f2f5;
}

.settings-content {
  max-width: 640px;
  margin: 0 auto;
  padding: 1.5rem;
}

.settings-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.back-btn {
  background: white;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #555;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  transition: transform var(--anim-duration-fast, 150ms) ease,
              color var(--anim-duration-fast, 150ms) ease;
  will-change: transform;
}

.back-btn:hover {
  color: #667eea;
  transform: translate3d(-1px, 0, 0);
}

.settings-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #333;
}

.setup-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 1rem 1.25rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  color: white;
}

.setup-banner-icon {
  font-size: 1.8rem;
  flex-shrink: 0;
}

.setup-banner-text {
  flex: 1;
  min-width: 0;
}

.setup-banner-text h3 {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 0.2rem;
}

.setup-banner-text p {
  font-size: 0.8rem;
  opacity: 0.85;
  margin: 0;
}

.setup-done-btn {
  flex-shrink: 0;
  padding: 0.55rem 1.25rem;
  border-radius: 10px;
  border: none;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: rgba(255, 255, 255, 0.95);
  color: #667eea;
}

.setup-done-btn:hover:not(:disabled) {
  background: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.setup-done-btn:disabled {
  background: rgba(255, 255, 255, 0.4);
  color: rgba(255, 255, 255, 0.7);
  cursor: not-allowed;
}

.settings-section {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-title svg {
  color: #667eea;
}

.settings-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f0f2f5;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-item.danger .setting-label {
  color: #ff6b6b;
}

.setting-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  flex: 1;
  min-width: 0;
}

.setting-label {
  font-size: 0.95rem;
  font-weight: 500;
  color: #333;
}

.setting-desc {
  font-size: 0.78rem;
  color: #999;
}

.setting-value {
  font-size: 0.9rem;
  color: #777;
  flex-shrink: 0;
}

.setting-control {
  flex-shrink: 0;
  margin-left: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.num-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  background: white;
  font-size: 1.1rem;
  font-weight: 600;
  color: #555;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform var(--anim-duration-fast, 150ms) ease,
              border-color var(--anim-duration-fast, 150ms) ease,
              background-color var(--anim-duration-fast, 150ms) ease;
  will-change: transform;
}

.num-btn:hover {
  border-color: #667eea;
  color: #667eea;
  background: #eef2ff;
}

.num-btn:active {
  transform: scale3d(0.95, 0.95, 1);
}

.num-value {
  min-width: 40px;
  text-align: center;
  font-size: 1.1rem;
  font-weight: 700;
  color: #333;
}

.date-input,
.time-input {
  padding: 0.4rem 0.6rem;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.85rem;
  color: #333;
  background: white;
  outline: none;
  transition: border-color 0.2s;
}

.date-input:focus,
.time-input:focus {
  border-color: #667eea;
}

.mode-selector {
  display: flex;
  background: #f0f2f5;
  border-radius: 8px;
  padding: 3px;
}

.mode-btn {
  padding: 0.35rem 0.75rem;
  border: none;
  border-radius: 6px;
  background: transparent;
  font-size: 0.82rem;
  color: #777;
  cursor: pointer;
  transition: background-color var(--anim-duration-fast, 150ms) ease,
              color var(--anim-duration-fast, 150ms) ease,
              font-weight 0ms;
  white-space: nowrap;
}

.mode-btn.active {
  background: white;
  color: #667eea;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.mode-btn:hover:not(.active) {
  color: #555;
}

.toggle {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 26px;
  cursor: pointer;
}

.toggle input {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  cursor: pointer;
  z-index: 1;
}

.toggle-slider {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #d1d5db;
  border-radius: 26px;
  transition: background-color var(--anim-duration-fast, 150ms) ease;
  pointer-events: none;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  left: 3px;
  bottom: 3px;
  background: white;
  border-radius: 50%;
  transition: transform var(--anim-duration-normal, 200ms) var(--anim-easing-smooth, cubic-bezier(0.34, 1.56, 0.64, 1));
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
  pointer-events: none;
}

.toggle input:checked + .toggle-slider {
  background: #667eea;
}

.toggle input:checked + .toggle-slider::before {
  transform: translate3d(22px, 0, 0);
}

.toggle input:focus + .toggle-slider {
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.3);
}

.toggle input:focus-visible + .toggle-slider {
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.4);
}

/* 屏幕阅读器专用样式 */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.85rem;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background: white;
  font-size: 0.85rem;
  color: #555;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.action-btn:hover {
  border-color: #667eea;
  color: #667eea;
  background: #eef2ff;
}

.action-btn.granted {
  background: #f0fdf4;
  border-color: #bbf7d0;
  color: #10b981;
  cursor: default;
}

.action-btn:disabled {
  opacity: 0.7;
  cursor: default;
}

.danger-btn {
  border-color: #fecaca;
  color: #ff6b6b;
}

.danger-btn:hover {
  background: #fef2f2;
  border-color: #ff6b6b;
  color: #ff6b6b;
}

.file-input {
  display: none;
}

.shortcut-item {
  gap: 0.75rem;
}

.shortcut-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.shortcut-key-display {
  min-width: 120px;
  padding: 0.5rem 0.75rem;
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #333;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}

.shortcut-key-display:hover {
  border-color: #667eea;
  background: #f0f4ff;
}

.shortcut-key-display.is-recording {
  border-color: #667eea;
  background: #eef2ff;
  color: #667eea;
  animation: pulse 1.5s infinite;
}

.shortcut-key-display.has-conflict {
  border-color: #ff6b6b;
  background: #fef2f2;
  color: #ff6b6b;
}

.recording-text {
  font-style: italic;
}

.reset-shortcut-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  transition: all 0.2s;
  flex-shrink: 0;
}

.reset-shortcut-btn:hover {
  border-color: #667eea;
  color: #667eea;
  background: #f0f4ff;
}

.shortcut-conflict-msg {
  font-size: 0.75rem;
  color: #ff6b6b;
  margin-left: 0.25rem;
}

.shortcut-actions {
  padding: 1rem 1.25rem;
  border-top: 1px solid #f0f2f5;
  display: flex;
  justify-content: center;
}

.reset-all-btn {
  font-size: 0.85rem;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  max-width: 400px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.modal-icon {
  margin-bottom: 1rem;
}

.modal-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 0.75rem;
}

.modal-desc {
  font-size: 0.88rem;
  color: #777;
  line-height: 1.5;
  margin-bottom: 1.5rem;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
}

.modal-btn {
  flex: 1;
  padding: 0.65rem 1rem;
  border-radius: 10px;
  border: none;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform var(--anim-duration-fast, 150ms) ease,
              background-color var(--anim-duration-fast, 150ms) ease;
  will-change: transform;
}

.modal-btn.cancel {
  background: #f0f2f5;
  color: #555;
}

.modal-btn.cancel:hover {
  background: #e9ecef;
}

.modal-btn.confirm {
  background: #ff6b6b;
  color: white;
}

.modal-btn.confirm:hover {
  background: #ee5a5a;
}

.toast {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.7rem 1.5rem;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 500;
  z-index: 2000;
  animation: toastIn 0.3s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.toast.success {
  background: #10b981;
  color: white;
}

.toast.error {
  background: #ff6b6b;
  color: white;
}

@keyframes toastIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

@media (max-width: 768px) {
  .settings-content {
    padding: 1rem;
  }

  .setup-banner {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }

  .setup-done-btn {
    width: 100%;
  }

  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .setting-control {
    margin-left: 0;
    width: 100%;
  }

  .mode-selector {
    width: 100%;
  }

  .mode-btn {
    flex: 1;
    text-align: center;
  }

  .date-input,
  .time-input {
    width: 100%;
  }

  .action-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
