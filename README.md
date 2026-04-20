# ZogginWeb

像母语者一样学英语 —— 考研应试 + 终身能力，在真实语境中自然习得

## 功能特性

### 核心功能

#### 艾浩斯记忆法
基于 SM-2 间隔重复算法，在即将遗忘的黄金时刻精准推送复习
- 智能间隔安排，拒绝无效重复
- 三级评分（忘记/模糊/认识），精准追踪记忆状态
- 记忆留存率可视化，进步看得见

#### 视频语境学习
加载本地视频和 SRT 字幕，在真实语境中自然习得
- 字幕单词可点击，一键加入生词本
- AB 循环 + 变速播放，精听每一句
- 侧边生词本，边看边积累

#### 口语训练
跟读模式 + 自由说模式，Web Speech API 实时识别
- 语音识别 + 发音相似度评分
- 字符级 diff 对比，精准纠音
- 实时波形可视化，练习有反馈

#### 考研专区
为考研党量身定制，科学规划 5500 词汇通关路径
- 考研倒计时，每日学习计划
- 词汇进度里程碑追踪

### 最新优化功能

#### 全屏专注模式
沉浸式学习体验，屏蔽一切干扰
- 一键进入/退出全屏（快捷键 F）
- 专注模式下自动屏蔽非学习相关通知
- 安全区域保护，防止误触退出
- 支持 Chrome、Edge、Firefox、Safari 全屏 API

#### 角落统计面板
右下角悬浮统计，实时掌握学习进度
- 学习时长、单词数量、学习次数一目了然
- 每日目标进度条
- 自动刷新，鼠标悬停展开详情
- 全屏模式自动隐藏

#### 快捷键系统
高效操作，键盘党福音
- `Space` - 翻转卡片
- `1/2/3` - 标记忘记/模糊/认识
- `F` - 全屏切换
- `Esc` - 退出/返回
- `Ctrl+B` - 切换导航栏
- 支持自定义快捷键配置

#### 浏览器兼容性
全面支持主流浏览器
- Chrome 90+、Edge 90+、Firefox 88+、Safari 14+
- 自动检测浏览器特性并应用兼容性修复
- CSS backdrop-filter 降级处理
- 全屏 API 跨浏览器封装
- 语音合成 API 安全封装

#### 动效管理器
统一管理应用动效性能
- 支持开启/关闭动效
- 三档速度调节（慢速/正常/快速）
- 自动响应系统「减少动效」偏好
- GPU 加速优化，will-change 管理

#### 响应式设计
多尺寸屏幕完美适配
- 移动端 (<768px)
- 平板 (768px-991px)
- 笔记本 (992px-1919px)
- 台式机 (1920px-2559px)
- 大屏台式机 (2560px+)
- 响应式字体和间距自动计算

#### 动态渐变背景主题
基于日期自动切换主题色彩，每日不同视觉体验
- 三大主题：晨曦、深海、森林
- 六种动画效果：雾气、呼吸、极光、粒子、涟漪、纹理
- 移动端自动禁用动画，节省性能

#### 液态玻璃卡片设计
现代化 UI 设计，沉浸式学习体验
- 正面简洁展示：单词、音标、发音按钮
- 背面详细内容：释义、例句、词组、考研考点
- 可折叠区域，按需展开
- 掌握度指示器，学习进度一目了然
- 全屏按钮，一键进入专注模式

#### 智能导航栏
- 登录前：透明渐变，滚动时背景变化
- 登录后：动态渐变背景，与当日主题同步
- 响应式设计，移动端抽屉菜单

## 技术栈

- **前端框架**: Vue 3 + Composition API
- **构建工具**: Vite 5
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **样式**: Tailwind CSS 4 + Scoped CSS
- **数据存储**: IndexedDB (localforage)
- **测试框架**: Vitest

## 项目结构

```
ZogginWeb/
├── src/
│   ├── api/                    # API 服务层
│   │   ├── controllers/        # 控制器
│   │   ├── services/           # 服务层
│   │   ├── httpClient.js       # HTTP 客户端
│   │   └── performanceMonitor.js # 性能监控
│   ├── components/             # 公共组件
│   │   ├── NavBar.vue          # 导航栏（动态渐变背景）
│   │   ├── StudyBackground.vue # 学习页面动态背景
│   │   ├── WordCard.vue        # 单词卡片（液态玻璃设计）
│   │   ├── CornerStats.vue     # 角落统计面板
│   │   ├── TodayStats.vue      # 今日统计组件
│   │   ├── VideoPlayer.vue     # 视频播放器
│   │   └── LogoutConfirm.vue   # 退出确认弹窗
│   ├── views/                  # 页面视图
│   │   ├── LandingPage.vue     # 落地页
│   │   ├── Home.vue            # 首页/我的计划
│   │   ├── Study.vue           # 学习页面（全屏模式）
│   │   ├── VocabBook.vue       # 单词本
│   │   ├── Speaking.vue        # 口语练习
│   │   ├── Stats.vue           # 学习统计
│   │   ├── Settings.vue        # 设置
│   │   └── MyPlan.vue          # 我的计划
│   ├── stores/                 # Pinia 状态管理
│   │   ├── vocabStore.js       # 词汇数据
│   │   ├── studyStore.js       # 学习记录
│   │   └── userStore.js        # 用户状态
│   ├── utils/                  # 工具函数
│   │   ├── colorEngine.js      # 主题色彩引擎
│   │   ├── srs.js              # SM-2 间隔重复算法
│   │   ├── pronunciation.js    # 发音工具
│   │   ├── storage.js          # IndexedDB 存储
│   │   ├── focusMode.js        # 专注模式管理
│   │   ├── shortcutManager.js  # 快捷键管理器
│   │   ├── browserCompatibility.js # 浏览器兼容性
│   │   ├── animationManager.js # 动效管理器
│   │   └── responsive.js       # 响应式设计工具
│   ├── router/                 # 路由配置
│   └── main.js                 # 入口文件
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 运行测试

```bash
npm run test
```

## 快捷键一览

| 快捷键 | 功能 |
|--------|------|
| `Space` | 翻转卡片 |
| `1` | 标记忘记 |
| `2` | 标记模糊 |
| `3` | 标记认识 |
| `F` | 全屏切换 |
| `Esc` | 退出/返回 |
| `Ctrl+B` | 切换导航栏 |
| `Ctrl+Shift+Q` | 退出确认 |

## 浏览器支持

| 浏览器 | 最低版本 |
|--------|----------|
| Chrome | 90+ |
| Edge | 90+ |
| Firefox | 88+ |
| Safari | 14+ |

## 设计理念

### 本地优先，隐私至上
所有数据存储在浏览器本地（IndexedDB），无需注册账号，无需上传服务器。你的学习数据，只有你自己能访问。

### 开源免费
代码完全开源，无隐藏收费，无广告干扰。社区驱动迭代，功能持续进化。

### 数据可导出
支持 JSON/CSV 格式导出全部学习数据，随时备份、迁移。你的数据永远属于你。

## 单词数据格式

```javascript
{
  id: '1',
  word: 'ephemeral',
  phonetic: '/ɪˈfemərəl/',
  pos: 'adj.',
  meanings: ['短暂的', '转瞬即逝的'],
  examples: [
    { en: 'The ephemeral beauty of cherry blossoms.', cn: '樱花转瞬即逝的美。' }
  ],
  phrases: [
    { en: 'ephemeral beauty', cn: '短暂的美' }
  ],
  examTips: '考研常考形容词辨析...',
  mastery: 0,        // 掌握度 0-5
  nextReview: '2026-04-12T00:00:00.000Z',
  reviewHistory: []  // 复习记录
}
```

## 许可证

MIT License

---

**Zoggin** · 本地优先 · 数据私有 · 开源免费
