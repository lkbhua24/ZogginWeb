import { FeatureSupport } from './browserCompatibility.js';

let voicesLoaded = false;
let voicesPromise = null;

// 防止意外自动播放的保护机制
let lastSpeakTime = 0;
const MIN_SPEAK_INTERVAL = 500; // 最小发音间隔 500ms
let userInteracted = false;

// 监听用户首次交互
function initUserInteractionListener() {
  const markInteracted = () => {
    userInteracted = true;
    // 移除监听器
    document.removeEventListener('click', markInteracted);
    document.removeEventListener('keydown', markInteracted);
    document.removeEventListener('touchstart', markInteracted);
  };
  
  document.addEventListener('click', markInteracted, { once: true });
  document.addEventListener('keydown', markInteracted, { once: true });
  document.addEventListener('touchstart', markInteracted, { once: true });
}

// 页面加载时初始化监听器
if (typeof document !== 'undefined') {
  initUserInteractionListener();
}

// 检查语音合成支持
function isSpeechSynthesisSupported() {
  return FeatureSupport.speechSynthesis && 'speechSynthesis' in window;
}

function loadVoices() {
  if (voicesPromise) return voicesPromise;

  voicesPromise = new Promise((resolve) => {
    if (!window.speechSynthesis) {
      resolve([]);
      return;
    }

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      voicesLoaded = true;
      resolve(voices);
      return;
    }

    const onVoicesChanged = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0) {
        voicesLoaded = true;
        window.speechSynthesis.onvoiceschanged = null;
        resolve(v);
      }
    };

    window.speechSynthesis.onvoiceschanged = onVoicesChanged;

    setTimeout(() => {
      if (!voicesLoaded) {
        resolve(window.speechSynthesis.getVoices());
      }
    }, 2000);
  });

  return voicesPromise;
}

// 延迟加载voices，不在模块加载时立即调用
// loadVoices();

export async function speak(word, accent = 'us') {
  if (!word) return false;

  // 检查语音合成支持
  if (!isSpeechSynthesisSupported()) {
    console.warn('[Pronunciation] Speech synthesis not supported in this browser');
    return false;
  }

  // 防止过于频繁的调用
  const now = Date.now();
  if (now - lastSpeakTime < MIN_SPEAK_INTERVAL) {
    console.log('[Pronunciation] Ignored: too frequent');
    return false;
  }
  lastSpeakTime = now;

  // 检查用户是否有过交互（浏览器自动播放策略）
  if (!userInteracted) {
    console.log('[Pronunciation] Ignored: no user interaction yet');
    return false;
  }

  // 记录调用栈用于调试
  console.log('[Pronunciation] Speaking:', word, 'at', new Date().toISOString());

  try {
    // Safari 和 Firefox 可能需要先取消之前的语音
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      // 给浏览器一点时间来处理取消
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = accent === 'uk' ? 'en-GB' : 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    // 加载语音列表
    const voices = await loadVoices();
    const targetLang = accent === 'uk' ? 'en-GB' : 'en-US';
    
    // 尝试找到最佳匹配的语音
    let matchedVoice = voices.find(v => v.lang === targetLang);
    if (!matchedVoice) {
      matchedVoice = voices.find(v => v.lang.startsWith(targetLang.split('-')[0]));
    }
    if (!matchedVoice) {
      matchedVoice = voices.find(v => v.lang.startsWith('en'));
    }

    if (matchedVoice) {
      utterance.voice = matchedVoice;
      console.log('[Pronunciation] Using voice:', matchedVoice.name, matchedVoice.lang);
    }

    // 创建 Promise 来跟踪播放完成
    return new Promise((resolve) => {
      utterance.onend = () => {
        console.log('[Pronunciation] Finished speaking:', word);
        resolve(true);
      };
      
      utterance.onerror = (e) => {
        // 忽略因取消产生的错误
        if (e.error !== 'canceled' && e.error !== 'interrupted') {
          console.warn('[Pronunciation] Error:', e.error);
        }
        resolve(false);
      };

      // Safari 有时需要延迟才能播放
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 10);
    });
  } catch (e) {
    console.warn('[Pronunciation] Speech synthesis error:', e);
    return false;
  }
}

export function getAvailableVoices() {
  if (!window.speechSynthesis) return [];
  return window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('en'));
}

export function ensureVoicesLoaded() {
  return loadVoices();
}

// 重置用户交互状态（用于测试）
export function resetUserInteractionState() {
  userInteracted = false;
  initUserInteractionListener();
}
