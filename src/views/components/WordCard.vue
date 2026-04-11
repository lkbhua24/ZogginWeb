<template>
  <div class="word-card" :class="{ flipped: flipped }" @click="$emit('flip')">
    <!-- 卡片正面 -->
    <div class="card-front">
      <div class="word-info">
        <h2 class="word">{{ word.word }}</h2>
        <p class="phonetic" v-if="word.phonetic">{{ word.phonetic }}</p>
      </div>
      <button class="audio-btn" @click.stop="$emit('play-audio', word.word)">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
      </button>
    </div>
    
    <!-- 卡片背面 -->
    <div class="card-back">
      <div class="meanings" v-if="word.meanings && word.meanings.length > 0">
        <h3>释义</h3>
        <ul>
          <li v-for="(meaning, index) in word.meanings" :key="index">
            {{ meaning }}
          </li>
        </ul>
      </div>
      <div class="examples" v-if="word.examples && word.examples.length > 0">
        <h3>例句</h3>
        <ul>
          <li v-for="(example, index) in word.examples" :key="index">
            {{ example }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WordCard',
  props: {
    word: {
      type: Object,
      required: true
    },
    flipped: {
      type: Boolean,
      default: false
    }
  },
  emits: ['flip', 'play-audio']
};
</script>

<style scoped>
.word-card {
  width: 100%;
  max-width: 600px;
  height: 400px;
  perspective: 1000px;
  cursor: pointer;
  position: relative;
}

.card-front,
.card-back {
  width: 100%;
  height: 100%;
  position: absolute;
  backface-visibility: hidden;
  border-radius: 16px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  transition: transform 0.6s ease;
}

.card-front {
  background: white;
  color: #333;
}

.card-back {
  background: #f8f9fa;
  color: #333;
  transform: rotateY(180deg);
  text-align: left;
}

.word-card.flipped .card-front {
  transform: rotateY(180deg);
}

.word-card.flipped .card-back {
  transform: rotateY(0deg);
}

.word-info {
  text-align: center;
  margin-bottom: 2rem;
}

.word {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #333;
}

.phonetic {
  font-size: 1.2rem;
  color: #666;
  font-style: italic;
}

.audio-btn {
  background: #667eea;
  color: white;
  border: none;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

.audio-btn:hover {
  background: #764ba2;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.meanings,
.examples {
  width: 100%;
  margin-bottom: 1.5rem;
}

.meanings h3,
.examples h3 {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 0.8rem;
  color: #667eea;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 0.5rem;
}

.meanings ul,
.examples ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.meanings li,
.examples li {
  margin-bottom: 0.5rem;
  padding-left: 1.2rem;
  position: relative;
  line-height: 1.4;
}

.meanings li::before,
.examples li::before {
  content: "•";
  position: absolute;
  left: 0;
  color: #667eea;
  font-weight: bold;
}

@media (max-width: 768px) {
  .word-card {
    height: 300px;
  }
  
  .card-front,
  .card-back {
    padding: 1.5rem;
  }
  
  .word {
    font-size: 2rem;
  }
  
  .phonetic {
    font-size: 1rem;
  }
  
  .audio-btn {
    width: 50px;
    height: 50px;
  }
}

@media (max-width: 480px) {
  .word-card {
    height: 250px;
  }
  
  .word {
    font-size: 1.5rem;
  }
  
  .meanings h3,
  .examples h3 {
    font-size: 1rem;
  }
  
  .meanings li,
  .examples li {
    font-size: 0.9rem;
  }
}
</style>