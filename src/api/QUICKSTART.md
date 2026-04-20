# API快速入门指南

## 快速开始

### 1. 导入API

在你的Vue组件中导入API：

```javascript
import { api } from '@/api';
```

### 2. 调用接口

使用async/await调用接口：

```javascript
// 获取今日学习统计
const response = await api.stats.getTodayStats();

// 检查是否成功
if (response.success) {
  console.log('数据:', response.data);
} else {
  console.error('错误:', response.message);
}
```

## 完整示例

### 示例1：在组件中显示今日学习数据

```vue
<template>
  <div>
    <p>今日学习时长：{{ stats.studyDuration.formatted }}</p>
    <p>今日已背单词：{{ stats.wordsStudied.total }} 个</p>
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

### 示例2：单独获取学习时长

```javascript
import { api } from '@/api';

async function showStudyDuration() {
  const response = await api.stats.getTodayStudyDuration();
  
  if (response.success) {
    const { durationMinutes, durationFormatted } = response.data;
    console.log(`今日已学习 ${durationMinutes} 分钟 (${durationFormatted})`);
  }
}
```

### 示例3：单独获取单词统计

```javascript
import { api } from '@/api';

async function showWordsStats() {
  const response = await api.stats.getTodayWordsStudied();
  
  if (response.success) {
    const { totalStudied, newWords, reviewWords } = response.data;
    console.log(`总计: ${totalStudied} 词`);
    console.log(`新学: ${newWords} 词`);
    console.log(`复习: ${reviewWords} 词`);
  }
}
```

## 响应格式说明

所有接口返回统一的格式：

```javascript
{
  success: true,              // 是否成功
  data: { ... },             // 返回的数据
  message: "操作成功",        // 消息
  code: 200,                 // 状态码
  timestamp: "2026-04-17..."  // 时间戳
}
```

## 错误处理

```javascript
const response = await api.stats.getTodayStats();

if (!response.success) {
  // 处理错误
  switch (response.code) {
    case 400:
      console.error('请求参数错误');
      break;
    case 404:
      console.error('资源不存在');
      break;
    case 500:
      console.error('服务器错误');
      break;
    default:
      console.error('未知错误:', response.message);
  }
}
```

## 可用接口

| 接口 | 说明 |
|------|------|
| `api.stats.getTodayStudyDuration()` | 获取今日学习时长 |
| `api.stats.getTodayWordsStudied()` | 获取今日已背单词数 |
| `api.stats.getTodayStats()` | 获取今日综合统计（推荐） |

## 下一步

- 查看 [完整API文档](./README.md)
- 查看 [测试用例](./tests/statsApi.test.js)
- 查看 [示例组件](../components/TodayStats.vue)
