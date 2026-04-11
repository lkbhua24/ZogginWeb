// SM-2 算法简化版实现
// 输入: quality (0-5), 上次的 easiness, 上次的 interval
// 输出: { nextReview, easiness, interval }
export function calculateSRS(quality, easiness = 2.5, interval = 1) {
  // 验证输入
  if (quality < 0 || quality > 5) {
    throw new Error('Quality must be between 0 and 5');
  }
  
  if (easiness < 1.3) {
    throw new Error('Easiness must be at least 1.3');
  }
  
  if (interval < 1) {
    throw new Error('Interval must be at least 1');
  }

  let newEasiness = easiness;
  let newInterval = interval;

  // 计算新的 easiness
  newEasiness = Math.max(1.3, easiness + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

  // 计算新的 interval
  if (quality < 3) {
    // 重置间隔为 1 天
    newInterval = 1;
  } else {
    // 第一次复习
    if (interval === 1) {
      newInterval = 6;
    } else {
      // 后续复习，间隔乘以 easiness
      newInterval = Math.round(interval * newEasiness);
    }
  }

  // 计算下次复习时间
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + newInterval);

  return {
    nextReview: nextReview.toISOString(),
    easiness: parseFloat(newEasiness.toFixed(2)),
    interval: newInterval
  };
}

// 筛选今日待复习的单词
export function getDueWords(words) {
  if (!Array.isArray(words)) {
    throw new Error('Words must be an array');
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return words.filter(word => {
    if (!word.nextReview) return false;
    
    const nextReview = new Date(word.nextReview);
    nextReview.setHours(0, 0, 0, 0);
    
    return nextReview <= today;
  });
}

// 按每日目标筛选新词
export function getNewWords(words, dailyGoal = 10) {
  if (!Array.isArray(words)) {
    throw new Error('Words must be an array');
  }

  if (dailyGoal < 1) {
    throw new Error('Daily goal must be at least 1');
  }

  // 筛选出还没有复习过的单词（mastery 为 0 且无复习历史）
  const newWords = words.filter(word => {
    return word.mastery === 0 && (!word.reviewHistory || word.reviewHistory.length === 0);
  });

  // 按创建时间排序，返回前 dailyGoal 个
  return newWords
    .sort((a, b) => {
      const aDate = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const bDate = b.createdAt ? new Date(b.createdAt) : new Date(0);
      return aDate - bDate;
    })
    .slice(0, dailyGoal);
}

// 计算复习计划
export function generateReviewPlan(words, dailyGoal = 10) {
  const dueWords = getDueWords(words);
  let newWords = [];
  
  if (dueWords.length < dailyGoal) {
    const newWordsGoal = dailyGoal - dueWords.length;
    newWords = getNewWords(words, newWordsGoal);
  }

  return {
    dueWords,
    newWords,
    totalWords: dueWords.length + newWords.length
  };
}

// 验证单词数据结构
export function validateWord(word) {
  if (!word) {
    return false;
  }

  if (!word.id || typeof word.id !== 'string') {
    return false;
  }

  if (!word.word || typeof word.word !== 'string') {
    return false;
  }

  if (typeof word.mastery !== 'number' || word.mastery < 0 || word.mastery > 5) {
    return false;
  }

  if (word.meanings && !Array.isArray(word.meanings)) {
    return false;
  }

  if (word.reviewHistory && !Array.isArray(word.reviewHistory)) {
    return false;
  }

  return true;
}