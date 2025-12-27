export function isSpeechSupported() {
  return (
    typeof window !== 'undefined' &&
    typeof window.speechSynthesis !== 'undefined' &&
    typeof window.SpeechSynthesisUtterance !== 'undefined'
  );
}

function getVoicesSafe() {
  try {
    const synth = window.speechSynthesis;
    if (!synth || typeof synth.getVoices !== 'function') return [];
    return synth.getVoices() || [];
  } catch {
    return [];
  }
}

function pickEnglishVoice() {
  const voices = getVoicesSafe();
  const lower = (s) => String(s || '').toLowerCase();

  // Prefer en-US first, then any English voice.
  return (
    voices.find((v) => lower(v.lang).startsWith('en-us')) ||
    voices.find((v) => lower(v.lang).startsWith('en')) ||
    null
  );
}

export function stopSpeech() {
  if (!isSpeechSupported()) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    // ignore
  }
}

export function speakEnglish(text, opts = {}) {
  if (!isSpeechSupported()) return false;

  const cleaned = String(text ?? '').trim();
  if (!cleaned) return false;

  try {
    // Ensure previous utterances don't overlap
    window.speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(cleaned);
    utter.lang = opts.lang ?? 'en-US';
    utter.rate = opts.rate ?? 0.95;
    utter.pitch = opts.pitch ?? 1;
    utter.volume = opts.volume ?? 1;

    const voice = pickEnglishVoice();
    if (voice) utter.voice = voice;

    window.speechSynthesis.speak(utter);
    return true;
  } catch {
    return false;
  }
}

// Reads multiple lines as one utterance (more reliable on mobile Safari).
export function speakEnglishBlock(lines, opts = {}) {
  const joined = (lines ?? []).filter(Boolean).join('   ');
  return speakEnglish(joined, opts);
}

// iOS/Safari sometimes populates voices asynchronously; calling warmUp can help.
export function warmUpVoices() {
  if (!isSpeechSupported()) return;
  try {
    // Trigger voice loading.
    getVoicesSafe();
  } catch {
    // ignore
  }
}
