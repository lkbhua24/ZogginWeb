export function speak(word, accent = 'us') {
  if (!word || !window.speechSynthesis) {
    console.warn('Speech synthesis not supported');
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = accent === 'uk' ? 'en-GB' : 'en-US';
  utterance.rate = 0.9;
  utterance.pitch = 1;
  utterance.volume = 1;

  const voices = window.speechSynthesis.getVoices();
  const targetLang = accent === 'uk' ? 'en-GB' : 'en-US';
  const matchedVoice = voices.find(v => v.lang === targetLang)
    || voices.find(v => v.lang.startsWith(accent === 'uk' ? 'en-GB' : 'en-US'))
    || voices.find(v => v.lang.startsWith('en'));

  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  window.speechSynthesis.speak(utterance);
}

export function getAvailableVoices() {
  if (!window.speechSynthesis) return [];
  return window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('en'));
}

export function ensureVoicesLoaded() {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }
    window.speechSynthesis.onvoiceschanged = () => {
      resolve(window.speechSynthesis.getVoices());
    };
    setTimeout(() => resolve(window.speechSynthesis.getVoices()), 1000);
  });
}
