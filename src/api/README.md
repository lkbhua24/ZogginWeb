# 学习数据统计API文档

## 概述

本API模块提供了学习数据统计接口，支持统计用户今日学习时长、已背单词数等功能。接口返回格式简洁规范，适配前端数据展示需求。

## API响应格式

所有API接口均返回统一的响应格式：

```javascript
{
  success: boolean,      // 请求是否成功
  data: any,            // 返回的数据
  message: string,      // 响应消息
  code: number,         // HTTP状态码
  timestamp: string     // 时间戳
}
```

## 接口列表

### 1. 获取今日学习时长

**接口方法：** `api.stats.getTodayStudyDuration()`

**功能说明：** 统计用户今日学习总时长

**返回数据格式：**

```javascript
{
  success: true,
  data: {
    date: "2026-04-17",              // 日期
    duration: 3600000,               // 时长（毫秒）
    durationMinutes: 60,             // 时长（分钟）
    durationFormatted: "1小时",      // 格式化时长
    sessionCount: 3                  // 学习次数
  },
  message: "获取今日学习时长成功",
  code: 200,
  timestamp: "2026-04-17T10:30:00.000Z"
}
```

### 2. 获取今日已背单词数

**接口方法：** `api.stats.getTodayWordsStudied()`

**功能说明：** 统计用户今日已背单词数量

**返回数据格式：**

```javascript
{
  success: true,
  data: {
    date: "2026-04-17",              // 日期
    totalStudied: 45,                // 总学习单词数
    newWords: 15,                    // 新学单词数
    reviewWords: 30                  // 复习单词数
  },
  message: "获取今日已背单词数成功",
  code: 200,
  timestamp: "2026-04-17T10:30:00.000Z"
}
```

### 3. 获取今日学习统计（综合接口）

**接口方法：** `api.stats.getTodayStats()`

**功能说明：** 获取今日学习的综合统计数据（包含学习时长和单词数）

**返回数据格式：**

```javascript
{
  success: true,
  data: {
    date: "2026-04-17",
    studyDuration: {
      milliseconds: 3600000,         // 毫秒
      minutes: 60,                   // 分钟
      formatted: "1小时"             // 格式化显示
    },
    wordsStudied: {
      total: 45,                     // 总单词数
      newWords: 15,                  // 新学单词
      reviewWords: 30                // 复习单词
    },
    sessions: 3                      // 学习次数
  },
  message: "获取今日学习统计成功",
  code: 200,
  timestamp: "2026-04-17T10:30:00.000Z"
}
```

## 使用示例

### 在Vue组件中使用

```vue
<template>
  <div class="stats-display">
    <div class="stat-card">
      <h3>今日学习时长</h3>
      <p>{{ todayStats.studyDuration.formatted }}</p>
    </div>
    <div class="stat-card">
      <h3>今日已背单词</h3>
      <p>{{ todayStats.wordsStudied.total }} 个</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { api } from '@/api';

const todayStats = ref({
  studyDuration: { formatted: '0分钟' },
  wordsStudied: { total: 0 }
});

onMounted(async () => {
  const response = await api.stats.getTodayStats();
  
  if (response.success) {
    todayStats.value = response.data;
  } else {
    console.error('获取统计数据失败:', response.message);
  }
});
</script>
```

### 单独调用各个接口

```javascript
import { api } from '@/api';

// 获取今日学习时长
const durationResponse = await api.stats.getTodayStudyDuration();
if (durationResponse.success) {
  console.log('今日学习时长:', durationResponse.data.durationFormatted);
}

// 获取今日已背单词数
const wordsResponse = await api.stats.getTodayWordsStudied();
if (wordsResponse.success) {
  console.log('今日已背单词:', wordsResponse.data.totalStudied);
}

// 获取综合统计
const statsResponse = await api.stats.getTodayStats();
if (statsResponse.success) {
  console.log('综合统计:', statsResponse.data);
}
```

## 错误处理

所有接口都内置了错误处理机制，当发生错误时会返回错误信息：

```javascript
const response = await api.stats.getTodayStats();

if (!response.success) {
  // 处理错误
  console.error('错误码:', response.code);
  console.error('错误信息:', response.message);
}
```

## 数据准确性保证

1. **数据源：** 所有统计数据均来自LocalForage本地存储
2. **日期过滤：** 使用ISO日期格式进行精确的日期匹配
3. **去重处理：** 单词统计使用Set进行去重，确保数据准确
4. **异步处理：** 所有接口均为异步方法，确保数据读取完成后再返回

## 技术架构

```
src/api/
├── index.js                    # API统一导出入口
├── response.js                 # 统一响应格式和错误处理
├── controllers/
│   └── statsController.js      # 统计控制器
└── services/
    └── statsService.js         # 统计服务（核心业务逻辑）
```

## 扩展建议

如需添加更多统计功能，可以：

1. 在 `statsService.js` 中添加新的统计方法
2. 在 `statsController.js` 中添加对应的控制器方法
3. 在 `index.js` 中导出新的接口

例如，添加周统计功能：

```javascript
// statsService.js
async getWeeklyStats() {
  // 实现周统计逻辑
}

// statsController.js
async getWeeklyStats() {
  try {
    const data = await statsService.getWeeklyStats();
    return ApiResponse.success(data, '获取周统计成功');
  } catch (error) {
    return handleApiError(error);
  }
}

// index.js
stats: {
  // ... 现有接口
  getWeeklyStats: () => statsController.getWeeklyStats()
}
```
