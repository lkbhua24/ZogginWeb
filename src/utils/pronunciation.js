let voicesLoaded = false;
let voicesPromise = null;

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

loadVoices();

export async function speak(word, accent = 'us') {
  if (!word) return false;

  if (!window.speechSynthesis) {
    console.warn('Speech synthesis not supported');
    return false;
  }

  try {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = accent === 'uk' ? 'en-GB' : 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    const voices = await loadVoices();
    const targetLang = accent === 'uk' ? 'en-GB' : 'en-US';
    const matchedVoice = voices.find(v => v.lang === targetLang)
      || voices.find(v => v.lang.startsWith(targetLang))
      || voices.find(v => v.lang.startsWith('en'));

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (e) {
    console.warn('Speech synthesis error:', e);
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
