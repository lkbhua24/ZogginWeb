import { describe, it, expect } from 'vitest';
import { calculateSRS, getDueWords, getNewWords, generateReviewPlan, validateWord } from './srs';

// 测试 calculateSRS 函数
describe('calculateSRS', () => {
  it('should throw error for invalid quality', () => {
    expect(() => calculateSRS(-1)).toThrow('Quality must be between 0 and 5');
    expect(() => calculateSRS(6)).toThrow('Quality must be between 0 and 5');
  });

  it('should throw error for invalid easiness', () => {
    expect(() => calculateSRS(3, 1.2)).toThrow('Easiness must be at least 1.3');
  });

  it('should throw error for invalid interval', () => {
    expect(() => calculateSRS(3, 2.5, 0)).toThrow('Interval must be at least 1');
  });

  it('should reset interval when quality < 3', () => {
    const result = calculateSRS(2, 2.5, 6);
    expect(result.interval).toBe(1);
  });

  it('should set interval to 6 for first review with quality >= 3', () => {
    const result = calculateSRS(3, 2.5, 1);
    expect(result.interval).toBe(6);
  });

  it('should calculate interval based on easiness for subsequent reviews', () => {
    const result = calculateSRS(4, 2.5, 6);
    expect(result.interval).toBe(15); // 6 * 2.5 = 15
  });

  it('should calculate easiness correctly', () => {
    const result = calculateSRS(5, 2.5, 1);
    expect(result.easiness).toBeGreaterThan(2.5);

    const result2 = calculateSRS(3, 2.5, 1);
    expect(result2.easiness).toBeLessThan(2.5);
  });

  it('should return nextReview as ISO string', () => {
    const result = calculateSRS(3, 2.5, 1);
    expect(typeof result.nextReview).toBe('string');
    expect(result.nextReview).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });
});

// 测试 getDueWords 函数
describe('getDueWords', () => {
  it('should throw error for non-array input', () => {
    expect(() => getDueWords('not an array')).toThrow('Words must be an array');
  });

  it('should return empty array for empty input', () => {
    const result = getDueWords([]);
    expect(result).toEqual([]);
  });

  it('should return words due today', () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const words = [
      { id: '1', word: 'test1', nextReview: yesterday.toISOString() },
      { id: '2', word: 'test2', nextReview: today.toISOString() },
      { id: '3', word: 'test3', nextReview: tomorrow.toISOString() }
    ];

    const result = getDueWords(words);
    expect(result.length).toBe(2);
    expect(result[0].id).toBe('1');
    expect(result[1].id).toBe('2');
  });

  it('should filter out words without nextReview', () => {
    const today = new Date().toISOString();
    const words = [
      { id: '1', word: 'test1', nextReview: today },
      { id: '2', word: 'test2' } // No nextReview
    ];

    const result = getDueWords(words);
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('1');
  });
});

// 测试 getNewWords 函数
describe('getNewWords', () => {
  it('should throw error for non-array input', () => {
    expect(() => getNewWords('not an array')).toThrow('Words must be an array');
  });

  it('should throw error for invalid dailyGoal', () => {
    expect(() => getNewWords([], 0)).toThrow('Daily goal must be at least 1');
  });

  it('should return empty array for empty input', () => {
    const result = getNewWords([]);
    expect(result).toEqual([]);
  });

  it('should return new words with mastery 0 and no review history', () => {
    const words = [
      { id: '1', word: 'test1', mastery: 0, reviewHistory: [] },
      { id: '2', word: 'test2', mastery: 1, reviewHistory: [] },
      { id: '3', word: 'test3', mastery: 0, reviewHistory: [{ date: new Date().toISOString() }] },
      { id: '4', word: 'test4', mastery: 0 }
    ];

    const result = getNewWords(words, 2);
    expect(result.length).toBe(2);
    expect(result[0].id).toBe('1');
    expect(result[1].id).toBe('4');
  });

  it('should respect dailyGoal limit', () => {
    const words = [
      { id: '1', word: 'test1', mastery: 0 },
      { id: '2', word: 'test2', mastery: 0 },
      { id: '3', word: 'test3', mastery: 0 }
    ];

    const result = getNewWords(words, 2);
    expect(result.length).toBe(2);
  });

  it('should sort by createdAt if available', () => {
    const now = new Date();
    const earlier = new Date(now);
    earlier.setDate(earlier.getDate() - 1);

    const words = [
      { id: '1', word: 'test1', mastery: 0, createdAt: now.toISOString() },
      { id: '2', word: 'test2', mastery: 0, createdAt: earlier.toISOString() }
    ];

    const result = getNewWords(words, 2);
    expect(result[0].id).toBe('2');
    expect(result[1].id).toBe('1');
  });
});

// 测试 generateReviewPlan 函数
describe('generateReviewPlan', () => {
  it('should generate review plan with due and new words', () => {
    const today = new Date().toISOString();
    const words = [
      { id: '1', word: 'test1', nextReview: today, mastery: 1 }, // Due
      { id: '2', word: 'test2', mastery: 0 }, // New
      { id: '3', word: 'test3', mastery: 0 }  // New
    ];

    const result = generateReviewPlan(words, 2);
    expect(result.dueWords.length).toBe(1);
    expect(result.newWords.length).toBe(1);
    expect(result.totalWords).toBe(2);
  });

  it('should prioritize due words over new words', () => {
    const today = new Date().toISOString();
    const words = [
      { id: '1', word: 'test1', nextReview: today, mastery: 1 }, // Due
      { id: '2', word: 'test2', nextReview: today, mastery: 1 }, // Due
      { id: '3', word: 'test3', mastery: 0 }  // New
    ];

    const result = generateReviewPlan(words, 2);
    expect(result.dueWords.length).toBe(2);
    expect(result.newWords.length).toBe(0);
    expect(result.totalWords).toBe(2);
  });
});

// 测试 validateWord 函数
describe('validateWord', () => {
  it('should return false for null/undefined', () => {
    expect(validateWord(null)).toBe(false);
    expect(validateWord(undefined)).toBe(false);
  });

  it('should return false for missing required fields', () => {
    expect(validateWord({})).toBe(false);
    expect(validateWord({ id: '1' })).toBe(false);
    expect(validateWord({ word: 'test' })).toBe(false);
  });

  it('should return false for invalid mastery', () => {
    expect(validateWord({ id: '1', word: 'test', mastery: -1 })).toBe(false);
    expect(validateWord({ id: '1', word: 'test', mastery: 6 })).toBe(false);
    expect(validateWord({ id: '1', word: 'test', mastery: '5' })).toBe(false);
  });

  it('should return false for invalid meanings', () => {
    expect(validateWord({ id: '1', word: 'test', mastery: 0, meanings: 'not array' })).toBe(false);
  });

  it('should return false for invalid reviewHistory', () => {
    expect(validateWord({ id: '1', word: 'test', mastery: 0, reviewHistory: 'not array' })).toBe(false);
  });

  it('should return true for valid word', () => {
    const validWord = {
      id: '1',
      word: 'test',
      mastery: 0,
      meanings: ['meaning1', 'meaning2'],
      reviewHistory: []
    };
    expect(validateWord(validWord)).toBe(true);
  });

  it('should return true for word with optional fields missing', () => {
    const validWord = {
      id: '1',
      word: 'test',
      mastery: 0
    };
    expect(validateWord(validWord)).toBe(true);
  });
});