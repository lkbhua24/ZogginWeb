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
          pos: 'adj.',
          meanings: ['短暂的', '转瞬即逝的', '朝生暮死的'],
          examples: [
            { en: 'The ephemeral beauty of cherry blossoms.', cn: '樱花转瞬即逝的美。' },
            { en: 'Fame is often ephemeral in the entertainment industry.', cn: '在娱乐圈，名声往往是短暂的。' },
            { en: 'These ephemeral moments of joy are precious.', cn: '这些短暂的快乐时刻弥足珍贵。' }
          ],
          phrases: [
            { en: 'ephemeral beauty', cn: '短暂的美' },
            { en: 'ephemeral success', cn: '短暂的成功' }
          ],
          examTips: '考研常考形容词辨析：ephemeral强调时间短暂，与permanent(永久的)相对。常见搭配：ephemeral nature(短暂的本质)，ephemeral phenomenon(短暂现象)。',
          mastery: 0,
          nextReview: new Date().toISOString(),
          reviewHistory: []
        },
        {
          id: '2',
          word: 'ubiquitous',
          phonetic: '/juːˈbɪkwɪtəs/',
          pos: 'adj.',
          meanings: ['无处不在的', '普遍存在的'],
          examples: [
            { en: 'Smartphones have become ubiquitous in modern life.', cn: '智能手机在现代生活中已经无处不在。' },
            { en: 'The ubiquitous presence of advertising is hard to ignore.', cn: '广告无处不在的存在让人难以忽视。' }
          ],
          phrases: [
            { en: 'ubiquitous presence', cn: '无处不在的存在' },
            { en: 'ubiquitous technology', cn: '普及的技术' }
          ],
          examTips: '考研高频词汇，常用于描述科技、文化现象的普及。同义词：omnipresent, pervasive。反义词：rare, scarce。',
          mastery: 0,
          nextReview: new Date().toISOString(),
          reviewHistory: []
        },
        {
          id: '3',
          word: 'serendipity',
          phonetic: '/ˌserənˈdɪpəti/',
          pos: 'n.',
          meanings: ['意外发现', '机缘巧合', '意外的好运'],
          examples: [
            { en: 'It was pure serendipity that we met at the conference.', cn: '我们在会议上相遇纯属机缘巧合。' },
            { en: 'Many scientific discoveries are the result of serendipity.', cn: '许多科学发现都是机缘巧合的结果。' }
          ],
          phrases: [
            { en: 'pure serendipity', cn: '纯粹的机缘巧合' },
            { en: 'by serendipity', cn: '偶然发现' }
          ],
          examTips: '考研阅读理解常见词汇，表示积极意义的偶然发现。形容词形式：serendipitous。常用于描述科学发现或美好相遇。',
          mastery: 0,
          nextReview: new Date().toISOString(),
          reviewHistory: []
        },
        {
          id: '4',
          word: 'eloquent',
          phonetic: '/ˈeləkwənt/',
          pos: 'adj.',
          meanings: ['雄辩的', '有说服力的', '口才流利的'],
          examples: [
            { en: 'She gave an eloquent speech about climate change.', cn: '她就气候变化发表了雄辩的演讲。' },
            { en: 'His eloquent arguments convinced the jury.', cn: '他有说服力的论点说服了陪审团。' }
          ],
          phrases: [
            { en: 'eloquent speech', cn: '雄辩的演讲' },
            { en: 'eloquent advocate', cn: '能言善辩的倡导者' }
          ],
          examTips: '考研写作高级词汇，用于形容演讲、文章或人。副词：eloquently。名词：eloquence。常与speaker, advocate搭配。',
          mastery: 0,
          nextReview: new Date().toISOString(),
          reviewHistory: []
        },
        {
          id: '5',
          word: 'pragmatic',
          phonetic: '/præɡˈmætɪk/',
          pos: 'adj.',
          meanings: ['务实的', '实用主义的', '注重实效的'],
          examples: [
            { en: 'We need a pragmatic approach to solve this problem.', cn: '我们需要一种务实的方法来解决这个问题。' },
            { en: 'She is known for her pragmatic leadership style.', cn: '她以务实的领导风格而闻名。' }
          ],
          phrases: [
            { en: 'pragmatic approach', cn: '务实的方法' },
            { en: 'pragmatic solution', cn: '务实的解决方案' }
          ],
          examTips: '考研高频词汇，常与idealistic(理想主义的)对比。副词：pragmatically。名词：pragmatism(实用主义)。常用于描述解决问题的方式。',
          mastery: 0,
          nextReview: new Date().toISOString(),
          reviewHistory: []
        },
        {
          id: '6',
          word: 'ambiguous',
          phonetic: '/æmˈbɪɡjuəs/',
          pos: 'adj.',
          meanings: ['模棱两可的', '含糊不清的', '有歧义的'],
          examples: [
            { en: 'The contract was written in ambiguous language.', cn: '这份合同是用模棱两可的语言写成的。' },
            { en: 'His response was deliberately ambiguous.', cn: '他的回应故意含糊其辞。' }
          ],
          phrases: [
            { en: 'ambiguous statement', cn: '模棱两可的声明' },
            { en: 'ambiguous meaning', cn: '有歧义的含义' }
          ],
          examTips: '考研阅读理解重点词汇，常用于分析文章中作者态度或语句含义。副词：ambiguously。名词：ambiguity。反义词：clear, definite。',
          mastery: 0,
          nextReview: new Date().toISOString(),
          reviewHistory: []
        },
        {
          id: '7',
          word: 'meticulous',
          phonetic: '/məˈtɪkjələs/',
          pos: 'adj.',
          meanings: ['一丝不苟的', '细致的', '小心翼翼的'],
          examples: [
            { en: 'She is meticulous about her research.', cn: '她对研究一丝不苟。' },
            { en: 'The detective conducted a meticulous investigation.', cn: '侦探进行了细致的调查。' }
          ],
          phrases: [
            { en: 'meticulous attention to detail', cn: '对细节的一丝不苟' },
            { en: 'meticulous planning', cn: '周密的计划' }
          ],
          examTips: '考研写作加分词汇，用于正面描述工作态度。副词：meticulously。同义词：thorough, painstaking。常与attention, planning搭配。',
          mastery: 0,
          nextReview: new Date().toISOString(),
          reviewHistory: []
        },
        {
          id: '8',
          word: 'tenacious',
          phonetic: '/tɪˈneɪʃəs/',
          pos: 'adj.',
          meanings: ['坚韧的', '顽强的', '紧抓不放的'],
          examples: [
            { en: 'A tenacious competitor never gives up.', cn: '坚韧的竞争者永不放弃。' },
            { en: 'Her tenacious efforts finally paid off.', cn: '她坚韧的努力终于得到了回报。' }
          ],
          phrases: [
            { en: 'tenacious spirit', cn: '坚韧的精神' },
            { en: 'tenacious grip', cn: '紧抓不放' }
          ],
          examTips: '考研词汇，常用于描述人的品质。副词：tenaciously。名词：tenacity。同义词：persistent, determined。常与effort, spirit搭配。',
          mastery: 0,
          nextReview: new Date().toISOString(),
          reviewHistory: []
        },
        {
          id: '9',
          word: 'benevolent',
          phonetic: '/bəˈnevələnt/',
          pos: 'adj.',
          meanings: ['仁慈的', '慈善的', '乐善好施的'],
          examples: [
            { en: 'The benevolent donor funded the new library.', cn: '这位仁慈的捐赠者为新图书馆提供了资金。' },
            { en: 'She has a benevolent smile that puts everyone at ease.', cn: '她慈祥的微笑让每个人都感到放松。' }
          ],
          phrases: [
            { en: 'benevolent dictator', cn: '仁慈的独裁者' },
            { en: 'benevolent fund', cn: '慈善基金' }
          ],
          examTips: '考研阅读常见词汇，用于描述人物性格或组织性质。反义词：malevolent(恶意的)。名词：benevolence。常与leader, smile搭配。',
          mastery: 0,
          nextReview: new Date().toISOString(),
          reviewHistory: []
        },
        {
          id: '10',
          word: 'resilient',
          phonetic: '/rɪˈzɪliənt/',
          pos: 'adj.',
          meanings: ['有弹性的', '能迅速恢复的', '适应力强的'],
          examples: [
            { en: 'Children are often more resilient than adults.', cn: '孩子通常比成年人更有韧性。' },
            { en: 'The resilient economy bounced back quickly.', cn: '具有弹性的经济迅速反弹。' }
          ],
          phrases: [
            { en: 'resilient material', cn: '弹性材料' },
            { en: 'resilient spirit', cn: '坚韧的精神' }
          ],
          examTips: '考研高频词汇，常用于描述经济恢复或人的心理韧性。副词：resiliently。名词：resilience。同义词：flexible, adaptable。',
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
        pos: wordData.pos || '',
        meanings: wordData.meanings || [],
        examples: wordData.examples || [],
        phrases: wordData.phrases || [],
        examTips: wordData.examTips || '',
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
        pos: word.pos || '',
        meanings: word.meanings || [],
        examples: word.examples || [],
        phrases: word.phrases || [],
        examTips: word.examTips || '',
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