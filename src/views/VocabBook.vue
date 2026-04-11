<template>
  <div class="vocab-container">
    <div class="vocab-content">
      <section class="search-section">
        <div class="search-bar">
          <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            class="search-input"
            placeholder="搜索单词、释义..."
            v-model="searchQuery"
          />
          <button v-if="searchQuery" class="search-clear" @click="searchQuery = ''">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="filter-tabs">
          <button
            v-for="tab in filterTabs"
            :key="tab.key"
            class="filter-tab"
            :class="{ active: activeFilter === tab.key }"
            @click="activeFilter = tab.key"
          >
            {{ tab.label }}
            <span class="tab-count">{{ getFilterCount(tab.key) }}</span>
          </button>
        </div>
      </section>

      <div class="vocab-stats">
        <span class="stats-text">共 {{ filteredWords.length }} 个单词</span>
      </div>

      <div v-if="filteredWords.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
        </div>
        <h3 class="empty-title">
          {{ vocabStore.words.length === 0 ? '单词本为空' : '没有匹配的单词' }}
        </h3>
        <p class="empty-desc">
          {{ vocabStore.words.length === 0
            ? '首次使用？点击下方按钮导入考研核心词库，开始你的备考之旅！'
            : '试试调整搜索条件或筛选标签'
          }}
        </p>
        <button v-if="vocabStore.words.length === 0" class="empty-action" @click="importKaoYanVocab">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          导入考研核心词库
        </button>
      </div>

      <div
        v-else
        class="vocab-list"
        ref="listContainer"
        @scroll="onScroll"
      >
        <div class="list-phantom" :style="{ height: totalHeight + 'px' }"></div>
        <div class="list-content" :style="{ transform: 'translateY(' + offsetY + 'px)' }">
          <div
            v-for="word in visibleWords"
            :key="word.id"
            class="word-item"
            :class="{ expanded: expandedId === word.id }"
          >
            <div class="word-summary" @click="toggleExpand(word.id)">
              <div class="word-main">
                <span class="word-text">{{ word.word }}</span>
                <span class="word-phonetic" v-if="word.phonetic">{{ word.phonetic }}</span>
              </div>
              <div class="word-meta">
                <div class="mastery-stars">
                  <svg
                    v-for="i in 5"
                    :key="i"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    :fill="i <= word.mastery ? '#f59e0b' : 'none'"
                    :stroke="i <= word.mastery ? '#f59e0b' : '#ddd'"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                </div>
                <span class="review-date" :class="{ overdue: isOverdue(word) }">
                  {{ formatDate(word.nextReview) }}
                </span>
                <svg
                  class="expand-icon"
                  :class="{ rotated: expandedId === word.id }"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </div>

            <div v-if="expandedId === word.id" class="word-detail">
              <div class="detail-section" v-if="word.meanings && word.meanings.length">
                <h4 class="detail-label">释义</h4>
                <ul class="detail-list">
                  <li v-for="(m, i) in word.meanings" :key="i">{{ m }}</li>
                </ul>
              </div>
              <div class="detail-section" v-if="word.examples && word.examples.length">
                <h4 class="detail-label">例句</h4>
                <ul class="detail-list example-list">
                  <li v-for="(e, i) in word.examples" :key="i">{{ e }}</li>
                </ul>
              </div>
              <div class="detail-actions">
                <div class="mastery-editor">
                  <span class="mastery-label">熟练度</span>
                  <div class="mastery-stars-edit">
                    <svg
                      v-for="i in 5"
                      :key="i"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      :fill="i <= word.mastery ? '#f59e0b' : 'none'"
                      :stroke="i <= word.mastery ? '#f59e0b' : '#ddd'"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="star-btn"
                      @click.stop="updateMastery(word.id, i)"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                  </div>
                </div>
                <button class="delete-btn" @click.stop="confirmDelete(word)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bottom-bar">
      <button class="bottom-btn primary" @click="showAddModal = true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        添加单词
      </button>
      <button class="bottom-btn" @click="triggerImport">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        导入
      </button>
      <button class="bottom-btn" @click="exportData">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="17 8 12 3 7 8"></polyline>
          <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
        导出
      </button>
      <input
        ref="fileInput"
        type="file"
        accept=".csv,.json"
        style="display: none"
        @change="handleFileImport"
      />
    </div>

    <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>添加单词</h3>
          <button class="modal-close" @click="showAddModal = false">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">单词 *</label>
            <input class="form-input" v-model="newWord.word" placeholder="输入英文单词" />
          </div>
          <div class="form-group">
            <label class="form-label">音标</label>
            <input class="form-input" v-model="newWord.phonetic" placeholder="如 /ɪˈfemərəl/" />
          </div>
          <div class="form-group">
            <label class="form-label">释义（每行一条）</label>
            <textarea
              class="form-textarea"
              v-model="newWord.meaningsText"
              placeholder="短暂的&#10;转瞬即逝的"
              rows="3"
            ></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">例句（每行一条）</label>
            <textarea
              class="form-textarea"
              v-model="newWord.examplesText"
              placeholder="The ephemeral beauty of cherry blossoms."
              rows="3"
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="modal-btn cancel" @click="showAddModal = false">取消</button>
          <button class="modal-btn confirm" @click="addWord">添加</button>
        </div>
      </div>
    </div>

    <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="showDeleteConfirm = false">
      <div class="modal-content confirm-modal">
        <div class="modal-header">
          <h3>确认删除</h3>
          <button class="modal-close" @click="showDeleteConfirm = false">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <p>确定要删除单词 <strong>{{ deleteTarget?.word }}</strong> 吗？此操作不可撤销。</p>
        </div>
        <div class="modal-footer">
          <button class="modal-btn cancel" @click="showDeleteConfirm = false">取消</button>
          <button class="modal-btn danger" @click="deleteWord">删除</button>
        </div>
      </div>
    </div>

    <div v-if="toastMessage" class="toast" :class="toastType">{{ toastMessage }}</div>
  </div>
</template>

<script>
import { ref, computed, onMounted, nextTick, onBeforeUnmount } from 'vue';
import { useVocabStore } from '../stores/vocabStore';

const ITEM_HEIGHT = 72;
const BUFFER = 5;

export default {
  name: 'VocabBook',
  emits: ['go-home'],
  setup() {
    const vocabStore = useVocabStore();

    const searchQuery = ref('');
    const activeFilter = ref('all');
    const expandedId = ref(null);
    const showAddModal = ref(false);
    const showDeleteConfirm = ref(false);
    const deleteTarget = ref(null);
    const toastMessage = ref('');
    const toastType = ref('success');
    const fileInput = ref(null);
    const listContainer = ref(null);

    const scrollTop = ref(0);
    const containerHeight = ref(600);

    const newWord = ref({
      word: '',
      phonetic: '',
      meaningsText: '',
      examplesText: ''
    });

    const filterTabs = [
      { key: 'all', label: '全部' },
      { key: 'learning', label: '学习中' },
      { key: 'mastered', label: '已掌握' },
      { key: 'review', label: '今日复习' }
    ];

    const filteredWords = computed(() => {
      let result = [...vocabStore.words];

      if (activeFilter.value === 'learning') {
        result = result.filter(w => w.mastery > 0 && w.mastery < 4);
      } else if (activeFilter.value === 'mastered') {
        result = result.filter(w => w.mastery >= 4);
      } else if (activeFilter.value === 'review') {
        const now = new Date();
        result = result.filter(w => w.nextReview && new Date(w.nextReview) <= now);
      }

      if (searchQuery.value.trim()) {
        const q = searchQuery.value.trim().toLowerCase();
        result = result.filter(w =>
          w.word.toLowerCase().includes(q) ||
          (w.phonetic && w.phonetic.toLowerCase().includes(q)) ||
          (w.meanings && w.meanings.some(m => m.toLowerCase().includes(q)))
        );
      }

      result.sort((a, b) => a.word.localeCompare(b.word));
      return result;
    });

    const totalHeight = computed(() => {
      const expandedExtra = expandedId.value ? 200 : 0;
      return filteredWords.value.length * ITEM_HEIGHT + expandedExtra;
    });

    const visibleCount = computed(() => {
      return Math.ceil(containerHeight.value / ITEM_HEIGHT) + BUFFER * 2;
    });

    const startIndex = computed(() => {
      const raw = Math.floor(scrollTop.value / ITEM_HEIGHT) - BUFFER;
      return Math.max(0, raw);
    });

    const endIndex = computed(() => {
      return Math.min(filteredWords.value.length, startIndex.value + visibleCount.value);
    });

    const offsetY = computed(() => {
      return startIndex.value * ITEM_HEIGHT;
    });

    const visibleWords = computed(() => {
      return filteredWords.value.slice(startIndex.value, endIndex.value);
    });

    function onScroll() {
      if (listContainer.value) {
        scrollTop.value = listContainer.value.scrollTop;
      }
    }

    function updateContainerHeight() {
      if (listContainer.value) {
        containerHeight.value = listContainer.value.clientHeight;
      }
    }

    let resizeObserver = null;

    function getFilterCount(key) {
      if (key === 'all') return vocabStore.words.length;
      if (key === 'learning') return vocabStore.words.filter(w => w.mastery > 0 && w.mastery < 4).length;
      if (key === 'mastered') return vocabStore.words.filter(w => w.mastery >= 4).length;
      if (key === 'review') {
        const now = new Date();
        return vocabStore.words.filter(w => w.nextReview && new Date(w.nextReview) <= now).length;
      }
      return 0;
    }

    function isOverdue(word) {
      if (!word.nextReview) return false;
      return new Date(word.nextReview) <= new Date();
    }

    function formatDate(dateStr) {
      if (!dateStr) return '未设定';
      const d = new Date(dateStr);
      const now = new Date();
      const diffMs = d - now;
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) return '今日复习';
      if (diffDays === 1) return '明天';
      if (diffDays <= 7) return diffDays + '天后';
      return (d.getMonth() + 1) + '/' + d.getDate();
    }

    function toggleExpand(id) {
      expandedId.value = expandedId.value === id ? null : id;
    }

    async function updateMastery(id, level) {
      await vocabStore.updateMastery(id, level);
      showToast('熟练度已更新');
    }

    function confirmDelete(word) {
      deleteTarget.value = word;
      showDeleteConfirm.value = true;
    }

    async function deleteWord() {
      if (deleteTarget.value) {
        await vocabStore.deleteWord(deleteTarget.value.id);
        expandedId.value = null;
        showDeleteConfirm.value = false;
        deleteTarget.value = null;
        showToast('已删除', 'success');
      }
    }

    async function addWord() {
      if (!newWord.value.word.trim()) {
        showToast('请输入单词', 'error');
        return;
      }

      const meanings = newWord.value.meaningsText
        .split('\n')
        .map(s => s.trim())
        .filter(s => s);

      const examples = newWord.value.examplesText
        .split('\n')
        .map(s => s.trim())
        .filter(s => s);

      await vocabStore.addWord({
        word: newWord.value.word.trim(),
        phonetic: newWord.value.phonetic.trim(),
        meanings,
        examples
      });

      newWord.value = { word: '', phonetic: '', meaningsText: '', examplesText: '' };
      showAddModal.value = false;
      showToast('单词已添加');
    }

    function triggerImport() {
      fileInput.value.click();
    }

    async function handleFileImport(event) {
      const file = event.target.files[0];
      if (!file) return;

      try {
        const text = await file.text();
        let words = [];

        if (file.name.endsWith('.json')) {
          const data = JSON.parse(text);
          words = Array.isArray(data) ? data : (data.words || []);
        } else if (file.name.endsWith('.csv')) {
          words = parseCSV(text);
        }

        if (words.length === 0) {
          showToast('未找到有效的单词数据', 'error');
          return;
        }

        await vocabStore.batchAddWords(words);
        showToast('成功导入 ' + words.length + ' 个单词');
      } catch (e) {
        showToast('导入失败：文件格式错误', 'error');
      }

      event.target.value = '';
    }

    function parseCSV(text) {
      const lines = text.split('\n').filter(l => l.trim());
      if (lines.length < 2) return [];

      const results = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(s => s.trim().replace(/^"|"$/g, ''));
        if (cols.length >= 2) {
          results.push({
            word: cols[0],
            phonetic: cols[1] || '',
            meanings: cols[2] ? cols[2].split(';').map(s => s.trim()) : [],
            examples: cols[3] ? cols[3].split(';').map(s => s.trim()) : []
          });
        }
      }
      return results;
    }

    async function exportData() {
      const data = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        words: vocabStore.words
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'zoggin_vocab_' + new Date().toISOString().slice(0, 10) + '.json';
      a.click();
      URL.revokeObjectURL(url);
      showToast('导出成功');
    }

    async function importKaoYanVocab() {
      const kaoYanWords = [
        { word: 'abandon', phonetic: '/əˈbændən/', meanings: ['放弃', '遗弃'], examples: ['He abandoned his plan to travel abroad.'] },
        { word: 'abstract', phonetic: '/ˈæbstrækt/', meanings: ['抽象的', '摘要'], examples: ['The concept is too abstract for children.'] },
        { word: 'acknowledge', phonetic: '/əkˈnɒlɪdʒ/', meanings: ['承认', '确认'], examples: ['She acknowledged her mistake publicly.'] },
        { word: 'acquire', phonetic: '/əˈkwaɪər/', meanings: ['获得', '习得'], examples: ['She acquired a taste for classical music.'] },
        { word: 'adapt', phonetic: '/əˈdæpt/', meanings: ['适应', '改编'], examples: ['We must adapt to the changing environment.'] },
        { word: 'adequate', phonetic: '/ˈædɪkwət/', meanings: ['充足的', '适当的'], examples: ['The supply is not adequate to meet the demand.'] },
        { word: 'advocate', phonetic: '/ˈædvəkeɪt/', meanings: ['提倡', '拥护者'], examples: ['She advocates for equal rights.'] },
        { word: 'affect', phonetic: '/əˈfekt/', meanings: ['影响', '感动'], examples: ['The weather affects his mood.'] },
        { word: 'allocate', phonetic: '/ˈæləkeɪt/', meanings: ['分配', '拨出'], examples: ['The government allocated funds for education.'] },
        { word: 'alternative', phonetic: '/ɔːlˈtɜːnətɪv/', meanings: ['替代的', '选择'], examples: ['We need to find an alternative solution.'] },
        { word: 'ambiguous', phonetic: '/æmˈbɪɡjuəs/', meanings: ['模棱两可的', '含糊的'], examples: ['The statement was deliberately ambiguous.'] },
        { word: 'amend', phonetic: '/əˈmend/', meanings: ['修正', '改正'], examples: ['The law was amended in 2020.'] },
        { word: 'anticipate', phonetic: '/ænˈtɪsɪpeɪt/', meanings: ['预期', '预料'], examples: ['We anticipate that sales will rise.'] },
        { word: 'apparent', phonetic: '/əˈpærənt/', meanings: ['明显的', '表面上的'], examples: ['It was apparent that he was lying.'] },
        { word: 'approach', phonetic: '/əˈprəʊtʃ/', meanings: ['接近', '方法'], examples: ['We need a different approach to this problem.'] },
        { word: 'appropriate', phonetic: '/əˈprəʊpriət/', meanings: ['适当的', '恰当的'], examples: ['This is not an appropriate time for jokes.'] },
        { word: 'arbitrary', phonetic: '/ˈɑːbɪtrəri/', meanings: ['任意的', '专制的'], examples: ['The decision seemed arbitrary and unfair.'] },
        { word: 'assert', phonetic: '/əˈsɜːt/', meanings: ['断言', '主张'], examples: ['He asserted his innocence.'] },
        { word: 'assess', phonetic: '/əˈses/', meanings: ['评估', '评定'], examples: ['We need to assess the impact of the policy.'] },
        { word: 'assumption', phonetic: '/əˈsʌmpʃn/', meanings: ['假设', '承担'], examples: ['The theory is based on several assumptions.'] },
        { word: 'attribute', phonetic: '/əˈtrɪbjuːt/', meanings: ['归因于', '属性'], examples: ['She attributes her success to hard work.'] },
        { word: 'benefit', phonetic: '/ˈbenɪfɪt/', meanings: ['益处', '受益'], examples: ['Regular exercise has many health benefits.'] },
        { word: 'bias', phonetic: '/ˈbaɪəs/', meanings: ['偏见', '偏差'], examples: ['The study was criticized for its bias.'] },
        { word: 'boundary', phonetic: '/ˈbaʊndri/', meanings: ['边界', '界限'], examples: ['The river forms the boundary between the two countries.'] },
        { word: 'capable', phonetic: '/ˈkeɪpəbl/', meanings: ['有能力的', '能干的'], examples: ['She is capable of solving complex problems.'] },
        { word: 'challenge', phonetic: '/ˈtʃælɪndʒ/', meanings: ['挑战', '质疑'], examples: ['The new project presents a significant challenge.'] },
        { word: 'circumstance', phonetic: '/ˈsɜːkəmstəns/', meanings: ['情况', '环境'], examples: ['Under no circumstances should you leave the building.'] },
        { word: 'coincide', phonetic: '/ˌkəʊɪnˈsaɪd/', meanings: ['同时发生', '一致'], examples: ['His arrival coincided with the start of the meeting.'] },
        { word: 'compel', phonetic: '/kəmˈpel/', meanings: ['强迫', '迫使'], examples: ['The evidence compelled him to confess.'] },
        { word: 'compensate', phonetic: '/ˈkɒmpenseɪt/', meanings: ['补偿', '赔偿'], examples: ['The company compensated the victims for their losses.'] },
        { word: 'comprehensive', phonetic: '/ˌkɒmprɪˈhensɪv/', meanings: ['全面的', '综合的'], examples: ['We need a comprehensive review of the system.'] },
        { word: 'conceive', phonetic: '/kənˈsiːv/', meanings: ['构想', '怀孕'], examples: ['I cannot conceive of a better solution.'] },
        { word: 'confirm', phonetic: '/kənˈfɜːm/', meanings: ['确认', '证实'], examples: ['The results confirm our hypothesis.'] },
        { word: 'conflict', phonetic: '/ˈkɒnflɪkt/', meanings: ['冲突', '矛盾'], examples: ['There is a conflict between work and family life.'] },
        { word: 'conscience', phonetic: '/ˈkɒnʃəns/', meanings: ['良心', '良知'], examples: ['His conscience would not let him cheat.'] },
        { word: 'conscious', phonetic: '/ˈkɒnʃəs/', meanings: ['有意识的', '自觉的'], examples: ['She was conscious of being watched.'] },
        { word: 'consequence', phonetic: '/ˈkɒnsɪkwəns/', meanings: ['后果', '结果'], examples: ['He suffered the consequences of his actions.'] },
        { word: 'considerable', phonetic: '/kənˈsɪdərəbl/', meanings: ['相当大的', '重要的'], examples: ['The project requires considerable investment.'] },
        { word: 'constitute', phonetic: '/ˈkɒnstɪtjuːt/', meanings: ['构成', '组成'], examples: ['Women constitute 45% of the workforce.'] },
        { word: 'construct', phonetic: '/kənˈstrʌkt/', meanings: ['建造', '构建'], examples: ['They plan to construct a new bridge.'] },
        { word: 'consume', phonetic: '/kənˈsjuːm/', meanings: ['消费', '消耗'], examples: ['The car consumes a lot of fuel.'] },
        { word: 'contemplate', phonetic: '/ˈkɒntəmpleɪt/', meanings: ['沉思', '凝视'], examples: ['She contemplated the meaning of life.'] },
        { word: 'contribute', phonetic: '/kənˈtrɪbjuːt/', meanings: ['贡献', '捐助'], examples: ['She contributed greatly to the project.'] },
        { word: 'controversy', phonetic: '/ˈkɒntrəvɜːsi/', meanings: ['争议', '论战'], examples: ['The decision caused considerable controversy.'] },
        { word: 'conventional', phonetic: '/kənˈvenʃənl/', meanings: ['传统的', '常规的'], examples: ['He has conventional views on marriage.'] },
        { word: 'convince', phonetic: '/kənˈvɪns/', meanings: ['说服', '使确信'], examples: ['I tried to convince her to stay.'] },
        { word: 'crucial', phonetic: '/ˈkruːʃl/', meanings: ['关键的', '决定性的'], examples: ['This is a crucial moment in history.'] },
        { word: 'decline', phonetic: '/dɪˈklaɪn/', meanings: ['下降', '拒绝'], examples: ['The population has declined significantly.'] },
        { word: 'dedicate', phonetic: '/ˈdedɪkeɪt/', meanings: ['奉献', '致力于'], examples: ['She dedicated her life to teaching.'] },
        { word: 'define', phonetic: '/dɪˈfaɪn/', meanings: ['定义', '界定'], examples: ['How do you define success?'] }
      ];

      await vocabStore.batchAddWords(kaoYanWords);
      showToast('已导入考研核心词库（' + kaoYanWords.length + ' 词）');
    }

    let toastTimer = null;
    function showToast(msg, type = 'success') {
      toastMessage.value = msg;
      toastType.value = type;
      if (toastTimer) clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        toastMessage.value = '';
      }, 2500);
    }

    onMounted(async () => {
      await vocabStore.loadWords();
      await nextTick();
      updateContainerHeight();
      if (listContainer.value) {
        resizeObserver = new ResizeObserver(() => {
          updateContainerHeight();
        });
        resizeObserver.observe(listContainer.value);
      }
    });

    onBeforeUnmount(() => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (toastTimer) {
        clearTimeout(toastTimer);
      }
    });

    return {
      vocabStore,
      searchQuery,
      activeFilter,
      expandedId,
      showAddModal,
      showDeleteConfirm,
      deleteTarget,
      toastMessage,
      toastType,
      newWord,
      fileInput,
      listContainer,
      filterTabs,
      filteredWords,
      totalHeight,
      visibleWords,
      offsetY,
      getFilterCount,
      isOverdue,
      formatDate,
      toggleExpand,
      updateMastery,
      confirmDelete,
      deleteWord,
      addWord,
      triggerImport,
      handleFileImport,
      exportData,
      importKaoYanVocab,
      onScroll
    };
  }
};
</script>

<style scoped>
.vocab-container {
  min-height: 100vh;
  background: #f0f2f5;
  display: flex;
  flex-direction: column;
}

.vocab-content {
  flex: 1;
  max-width: 960px;
  margin: 0 auto;
  padding: 1.5rem;
  padding-bottom: 80px;
  width: 100%;
  box-sizing: border-box;
}

.search-section {
  margin-bottom: 1rem;
}

.search-bar {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 12px;
  padding: 0 1rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  margin-bottom: 0.75rem;
}

.search-icon {
  color: #999;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  padding: 0.85rem 0.75rem;
  font-size: 0.95rem;
  background: transparent;
  color: #333;
}

.search-input::placeholder {
  color: #bbb;
}

.search-clear {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
}

.search-clear:hover {
  color: #666;
}

.filter-tabs {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0.5rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 20px;
  background: white;
  cursor: pointer;
  font-size: 0.85rem;
  color: #666;
  transition: all 0.2s;
  white-space: nowrap;
}

.filter-tab:hover {
  border-color: #c7d2fe;
}

.filter-tab.active {
  border-color: #667eea;
  background: #eef2ff;
  color: #667eea;
  font-weight: 600;
}

.tab-count {
  font-size: 0.75rem;
  background: #f0f2f5;
  padding: 1px 6px;
  border-radius: 10px;
  color: #999;
}

.filter-tab.active .tab-count {
  background: #667eea;
  color: white;
}

.vocab-stats {
  margin-bottom: 0.75rem;
}

.stats-text {
  font-size: 0.85rem;
  color: #999;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  margin-bottom: 1.5rem;
}

.empty-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #555;
  margin-bottom: 0.5rem;
}

.empty-desc {
  font-size: 0.9rem;
  color: #999;
  margin-bottom: 1.5rem;
  line-height: 1.6;
  max-width: 360px;
  margin-left: auto;
  margin-right: auto;
}

.empty-action {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s;
}

.empty-action:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.vocab-list {
  position: relative;
  overflow-y: auto;
  max-height: calc(100vh - 280px);
  border-radius: 12px;
  background: white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.list-phantom {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  z-index: -1;
}

.list-content {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
}

.word-item {
  border-bottom: 1px solid #f0f2f5;
  transition: background 0.15s;
}

.word-item:last-child {
  border-bottom: none;
}

.word-item:hover {
  background: #fafbfc;
}

.word-item.expanded {
  background: #f8f9ff;
}

.word-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1.25rem;
  cursor: pointer;
  min-height: 72px;
  height: 72px;
  box-sizing: border-box;
}

.word-main {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
}

.word-text {
  font-size: 1.05rem;
  font-weight: 600;
  color: #333;
}

.word-phonetic {
  font-size: 0.8rem;
  color: #999;
  font-style: italic;
}

.word-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.mastery-stars {
  display: flex;
  gap: 1px;
}

.review-date {
  font-size: 0.75rem;
  color: #999;
  white-space: nowrap;
}

.review-date.overdue {
  color: #ff6b6b;
  font-weight: 500;
}

.expand-icon {
  color: #ccc;
  transition: transform 0.2s;
}

.expand-icon.rotated {
  transform: rotate(180deg);
  color: #667eea;
}

.word-detail {
  padding: 0 1.25rem 1rem;
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.detail-section {
  margin-bottom: 0.75rem;
}

.detail-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #667eea;
  margin-bottom: 0.4rem;
}

.detail-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.detail-list li {
  font-size: 0.9rem;
  color: #555;
  padding: 0.2rem 0 0.2rem 1rem;
  position: relative;
  line-height: 1.5;
}

.detail-list li::before {
  content: "•";
  position: absolute;
  left: 0;
  color: #667eea;
}

.example-list li {
  color: #777;
  font-style: italic;
}

.example-list li::before {
  color: #c7d2fe;
}

.detail-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 0.75rem;
  border-top: 1px solid #f0f2f5;
}

.mastery-editor {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.mastery-label {
  font-size: 0.8rem;
  color: #999;
}

.mastery-stars-edit {
  display: flex;
  gap: 2px;
}

.star-btn {
  cursor: pointer;
  transition: transform 0.15s;
}

.star-btn:hover {
  transform: scale(1.2);
}

.delete-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0.4rem 0.8rem;
  background: #fff5f5;
  color: #ff6b6b;
  border: 1px solid #fecaca;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s;
}

.delete-btn:hover {
  background: #fee2e2;
  border-color: #fca5a5;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: white;
  border-top: 1px solid #e9ecef;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.06);
  z-index: 100;
  justify-content: center;
}

.bottom-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.65rem 1.25rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-size: 0.85rem;
  color: #555;
  transition: all 0.2s;
}

.bottom-btn:hover {
  border-color: #c7d2fe;
  color: #667eea;
}

.bottom-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
}

.bottom-btn.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
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
  z-index: 200;
  animation: fadeIn 0.15s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 480px;
  max-height: 85vh;
  overflow-y: auto;
  animation: scaleIn 0.2s ease;
}

.confirm-modal {
  max-width: 380px;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f0f2f5;
}

.modal-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
}

.modal-close:hover {
  color: #666;
}

.modal-body {
  padding: 1.25rem 1.5rem;
}

.modal-body p {
  font-size: 0.95rem;
  color: #555;
  line-height: 1.6;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 500;
  color: #555;
  margin-bottom: 0.4rem;
}

.form-input {
  width: 100%;
  padding: 0.65rem 0.85rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
  color: #333;
}

.form-input:focus {
  border-color: #667eea;
}

.form-textarea {
  width: 100%;
  padding: 0.65rem 0.85rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s;
  resize: vertical;
  font-family: inherit;
  box-sizing: border-box;
  color: #333;
}

.form-textarea:focus {
  border-color: #667eea;
}

.modal-footer {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #f0f2f5;
  justify-content: flex-end;
}

.modal-btn {
  padding: 0.6rem 1.5rem;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-weight: 500;
}

.modal-btn.cancel {
  background: #f0f2f5;
  color: #666;
}

.modal-btn.cancel:hover {
  background: #e9ecef;
}

.modal-btn.confirm {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.modal-btn.confirm:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.modal-btn.danger {
  background: #ff6b6b;
  color: white;
}

.modal-btn.danger:hover {
  background: #ef4444;
}

.toast {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.65rem 1.5rem;
  border-radius: 8px;
  font-size: 0.9rem;
  color: white;
  z-index: 300;
  animation: toastIn 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.toast.success {
  background: #10b981;
}

.toast.error {
  background: #ff6b6b;
}

@keyframes toastIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

@media (max-width: 768px) {
  .vocab-content {
    padding: 1rem;
    padding-bottom: 80px;
  }

  .filter-tabs {
    gap: 0.4rem;
  }

  .filter-tab {
    padding: 0.4rem 0.75rem;
    font-size: 0.8rem;
  }

  .word-summary {
    padding: 0.75rem 1rem;
  }

  .word-main {
    flex-direction: column;
    gap: 0.15rem;
  }

  .word-phonetic {
    font-size: 0.75rem;
  }

  .word-detail {
    padding: 0 1rem 0.75rem;
  }

  .bottom-bar {
    padding: 0.6rem 1rem;
  }

  .bottom-btn {
    padding: 0.55rem 0.75rem;
    font-size: 0.8rem;
  }

  .vocab-list {
    max-height: calc(100vh - 260px);
  }
}
</style>
