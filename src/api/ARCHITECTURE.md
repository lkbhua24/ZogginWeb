# 学习数据统计API - 架构总结

## 项目结构

```
src/api/
├── index.js                        # API统一导出入口
├── response.js                     # 统一响应格式和错误处理
├── README.md                       # 完整API文档
├── QUICKSTART.md                   # 快速入门指南
├── ARCHITECTURE.md                 # 架构说明文档（本文件）
├── controllers/
│   └── statsController.js          # 统计控制器
├── services/
│   └── statsService.js             # 统计服务（核心业务逻辑）
└── tests/
    └── statsApi.test.js            # 单元测试
```

## 核心设计理念

### 1. 分层架构

```
┌─────────────────────────────────────┐
│          Vue Components             │  前端组件层
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│         API Entry (index.js)        │  API入口层
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│          Controllers                │  控制器层
│    (处理请求、返回响应)              │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│           Services                  │  服务层
│    (业务逻辑、数据处理)              │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│      Storage (LocalForage)          │  数据存储层
└─────────────────────────────────────┘
```

### 2. 统一响应格式

所有API接口返回统一的响应格式，确保前端处理的一致性：

```javascript
{
  success: boolean,      // 请求是否成功
  data: any,            // 返回的数据
  message: string,      // 响应消息
  code: number,         // HTTP状态码
  timestamp: string     // 时间戳
}
```

### 3. 错误处理机制

- **统一错误捕获**: 所有错误都通过 `handleApiError` 统一处理
- **错误分类**: 支持不同类型的错误（400, 401, 404, 500等）
- **错误信息**: 提供清晰的错误消息，便于调试

## 已实现的接口

### 1. 获取今日学习时长

```javascript
api.stats.getTodayStudyDuration()
```

**返回数据：**
- `date`: 日期
- `duration`: 时长（毫秒）
- `durationMinutes`: 时长（分钟）
- `durationFormatted`: 格式化时长
- `sessionCount`: 学习次数

### 2. 获取今日已背单词数

```javascript
api.stats.getTodayWordsStudied()
```

**返回数据：**
- `date`: 日期
- `totalStudied`: 总学习单词数
- `newWords`: 新学单词数
- `reviewWords`: 复习单词数

### 3. 获取今日学习统计（综合接口）

```javascript
api.stats.getTodayStats()
```

**返回数据：**
- `date`: 日期
- `studyDuration`: 学习时长信息
- `wordsStudied`: 单词学习信息
- `sessions`: 学习次数

## 数据准确性保证

### 1. 日期过滤
使用ISO日期格式进行精确匹配：
```javascript
const today = new Date().toISOString().slice(0, 10);
const todayLogs = logs.filter(log => log.date.startsWith(today));
```

### 2. 去重处理
使用Set数据结构确保单词统计准确：
```javascript
const studiedWordIds = new Set();
todayLogs.forEach(log => {
  log.wordsStudied.forEach(id => studiedWordIds.add(id));
});
```

### 3. 异步处理
所有接口均为异步方法，确保数据读取完成：
```javascript
const [durationData, wordsData] = await Promise.all([
  this.getTodayStudyDuration(),
  this.getTodayWordsStudied()
]);
```

## 测试覆盖

### 测试统计
- ✅ 8个测试用例全部通过
- ✅ 覆盖所有核心功能
- ✅ 包含错误处理测试

### 测试内容
1. **今日学习时长统计**
   - 正常数据统计
   - 空数据处理

2. **今日单词统计**
   - 正常数据统计
   - 去重逻辑验证
   - 空数据处理

3. **综合统计**
   - 数据整合验证
   - 响应格式验证

4. **响应格式**
   - 成功响应
   - 错误响应

## 使用示例

### 在Vue组件中使用

```vue
<template>
  <div>
    <p>今日学习：{{ stats.studyDuration.formatted }}</p>
    <p>已背单词：{{ stats.wordsStudied.total }} 个</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { api } from '@/api';

const stats = ref({
  studyDuration: { formatted: '0分钟' },
  wordsStudied: { total: 0 }
});

onMounted(async () => {
  const response = await api.stats.getTodayStats();
  if (response.success) {
    stats.value = response.data;
  }
});
</script>
```

## 扩展建议

### 1. 添加更多统计维度

```javascript
// 周统计
async getWeeklyStats() {
  // 实现周统计逻辑
}

// 月统计
async getMonthlyStats() {
  // 实现月统计逻辑
}

// 学习效率分析
async getEfficiencyAnalysis() {
  // 实现效率分析逻辑
}
```

### 2. 添加缓存机制

```javascript
class CacheManager {
  constructor() {
    this.cache = new Map();
    this.ttl = 60000; // 1分钟缓存
  }
  
  get(key) {
    const item = this.cache.get(key);
    if (item && Date.now() - item.timestamp < this.ttl) {
      return item.data;
    }
    return null;
  }
  
  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
}
```

### 3. 添加数据验证

```javascript
import { z } from 'zod';

const StudyLogSchema = z.object({
  id: z.string(),
  date: z.string(),
  duration: z.number(),
  sessionType: z.string(),
  wordsStudied: z.array(z.string())
});

function validateStudyLog(log) {
  return StudyLogSchema.parse(log);
}
```

## 性能优化

### 1. 并行数据获取
使用 `Promise.all` 并行获取多个数据：
```javascript
const [durationData, wordsData] = await Promise.all([
  this.getTodayStudyDuration(),
  this.getTodayWordsStudied()
]);
```

### 2. 数据缓存
对于频繁访问的数据，可以添加缓存机制

### 3. 懒加载
只在需要时才加载数据，避免不必要的存储访问

## 总结

本API模块采用了清晰的分层架构，提供了：
- ✅ 统一的响应格式
- ✅ 完善的错误处理
- ✅ 准确的数据统计
- ✅ 全面的测试覆盖
- ✅ 清晰的文档说明

可以直接在前端项目中使用，为学习数据统计功能提供可靠的后端接口支持。
