import { defineStore } from 'pinia';
import storage from '../utils/storage';

const VOCAB_KEY = 'zoggin_vocab';

export const useVocabStore = defineStore('vocab', {
  state: () => ({
    words: []
  }),

  getters: {
    getWordById: (state) => (id) => {
      return state.words.find(word => word.id === id);
    },
    getWordsByMastery: (state) => (mastery) => {
      return state.words.filter(word => word.mastery === mastery);
    },
    getWordsDueForReview: (state) => {
      const now = new Date();
      return state.words.filter(word => {
        return word.nextReview && new Date(word.nextReview) <= now;
      });
    }
  },

  actions: {
    async loadWords() {
      const words = await storage.get(VOCAB_KEY);
      if (words && words.length > 0) {
        this.words = words;
      } else {
        await this.loadDemoWords();
      }
    },

    async loadDemoWords() {
      const demoWords = [
        {
          id: '1',
          word: 'ephemeral',
          phonetic: '/ɪˈfemərəl/',
          meanings: ['短暂的', '转瞬即逝的'],
          examples: ['The ephemeral beauty of cherry blossoms.', 'Fame is often ephemeral.'],
          mastery: 0,
          nextReview: new Date().toISOString(),
          reviewHistory: []
        },
        {
          id: '2',
          word: 'ubiquitous',
          phonetic: '/juːˈbɪkwɪtəs/',
          meanings: ['无处不在的', '普遍存在的'],
          examples: ['Smartphones have become ubiquitous in modern life.'],
          mastery: 0,
          nextReview: new Date().toISOString(),
          reviewHistory: []
        },
        {
          id: '3',
          word: 'serendipity',
          phonetic: '/ˌserənˈdɪpəti/',
          meanings: ['意外发现', '机缘巧合'],
          examples: ['It was pure serendipity that we met at the airport.'],
          mastery: 0,
          nextReview: new Date().toISOString(),
          reviewHistory: []
        },
        {
          id: '4',
          word: 'resilient',
          phonetic: '/rɪˈzɪliənt/',
          meanings: ['有弹性的', '能迅速恢复的'],
          examples: ['Children are often more resilient than adults think.'],
          mastery: 0,
          nextReview: new Date().toISOString(),
          reviewHistory: []
        },
        {
          id: '5',
          word: 'eloquent',
          phonetic: '/ˈeləkwənt/',
          meanings: ['雄辩的', '有说服力的'],
          examples: ['She gave an eloquent speech at the ceremony.'],
          mastery: 0,
          nextReview: new Date().toISOString(),
          reviewHistory: []
        },
        {
          id: '6',
          word: 'pragmatic',
          phonetic: '/præɡˈmætɪk/',
          meanings: ['务实的', '实用主义的'],
          examples: ['We need a pragmatic approach to solve this problem.'],
          mastery: 0,
          nextReview: new Date().toISOString(),
          reviewHistory: []
        },
        {
          id: '7',
          word: 'ambiguous',
          phonetic: '/æmˈbɪɡjuəs/',
          meanings: ['模棱两可的', '含糊不清的'],
          examples: ['The contract was written in ambiguous language.'],
          mastery: 0,
          nextReview: new Date().toISOString(),
          reviewHistory: []
        },
        {
          id: '8',
          word: 'meticulous',
          phonetic: '/məˈtɪkjələs/',
          meanings: ['一丝不苟的', '细致的'],
          examples: ['She is meticulous about her research.'],
          mastery: 0,
          nextReview: new Date().toISOString(),
          reviewHistory: []
        },
        {
          id: '9',
          word: 'tenacious',
          phonetic: '/tɪˈneɪʃəs/',
          meanings: ['坚韧的', '顽强的'],
          examples: ['A tenacious competitor never gives up.'],
          mastery: 0,
          nextReview: new Date().toISOString(),
          reviewHistory: []
        },
        {
          id: '10',
          word: 'benevolent',
          phonetic: '/bəˈnevələnt/',
          meanings: ['仁慈的', '慈善的'],
          examples: ['The benevolent donor funded the new library.'],
          mastery: 0,
          nextReview: new Date().toISOString(),
          reviewHistory: []
        }
      ];
      this.words = demoWords;
      await this.saveWords();
    },

    async addWord(wordData) {
      const newWord = {
        id: Date.now().toString(),
        word: wordData.word,
        phonetic: wordData.phonetic || '',
        meanings: wordData.meanings || [],
        mastery: wordData.mastery || 0,
        nextReview: wordData.nextReview || new Date().toISOString(),
        reviewHistory: wordData.reviewHistory || []
      };

      this.words.push(newWord);
      await this.saveWords();
      return newWord;
    },

    async updateWord(id, updates) {
      const index = this.words.findIndex(word => word.id === id);
      if (index !== -1) {
        this.words[index] = { ...this.words[index], ...updates };
        await this.saveWords();
        return this.words[index];
      }
      return null;
    },

    async deleteWord(id) {
      const index = this.words.findIndex(word => word.id === id);
      if (index !== -1) {
        this.words.splice(index, 1);
        await this.saveWords();
        return true;
      }
      return false;
    },

    async saveWords() {
      await storage.set(VOCAB_KEY, this.words);
    },

    async batchAddWords(words) {
      const newWords = words.map(word => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        word: word.word,
        phonetic: word.phonetic || '',
        meanings: word.meanings || [],
        mastery: word.mastery || 0,
        nextReview: word.nextReview || new Date().toISOString(),
        reviewHistory: word.reviewHistory || []
      }));

      this.words = [...this.words, ...newWords];
      await this.saveWords();
      return newWords;
    },

    async updateMastery(id, mastery, reviewDate = new Date()) {
      const word = this.getWordById(id);
      if (word) {
        word.mastery = mastery;
        word.reviewHistory.push({
          date: reviewDate.toISOString(),
          mastery
        });

        const interval = this.calculateNextReviewInterval(mastery);
        word.nextReview = new Date(Date.now() + interval).toISOString();

        await this.saveWords();
        return word;
      }
      return null;
    },

    calculateNextReviewInterval(mastery) {
      const baseInterval = 24 * 60 * 60 * 1000; // 1 day
      const intervals = [
        baseInterval,           // 0: 1 day
        baseInterval * 2,       // 1: 2 days
        baseInterval * 4,       // 2: 4 days
        baseInterval * 7,       // 3: 1 week
        baseInterval * 14,      // 4: 2 weeks
        baseInterval * 30       // 5: 1 month
      ];
      return intervals[Math.min(mastery, 5)];
    }
  }
});