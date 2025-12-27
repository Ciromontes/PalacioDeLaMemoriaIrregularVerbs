export function isSpeechSupported() {
  return (
    typeof window !== 'undefined' &&
    typeof window.speechSynthesis !== 'undefined' &&
    typeof window.SpeechSynthesisUtterance !== 'undefined'
  );
}

let sequenceRunId = 0;

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
    // Also stops any pending chained utterances.
    sequenceRunId += 1;
    window.speechSynthesis.cancel();
  } catch {
    // ignore
  }
}

function buildUtterance(cleaned, opts = {}) {
  const utter = new SpeechSynthesisUtterance(cleaned);
  utter.lang = opts.lang ?? 'en-US';
  utter.rate = opts.rate ?? 0.95;
  utter.pitch = opts.pitch ?? 1;
  utter.volume = opts.volume ?? 1;

  const voice = pickEnglishVoice();
  if (voice) utter.voice = voice;
  return utter;
}

export function speakEnglish(text, opts = {}) {
  if (!isSpeechSupported()) return false;

  const cleaned = String(text ?? '').trim();
  if (!cleaned) return false;

  try {
    // Ensure previous utterances don't overlap (and cancel any sequences).
    stopSpeech();

    const utter = buildUtterance(cleaned, opts);

    window.speechSynthesis.speak(utter);
    return true;
  } catch {
    return false;
  }
}

// Speaks multiple lines as separate utterances with a small pause between them.
// Useful for repeating a word or letting users pick one sentence at a time.
export function speakEnglishSequence(lines, opts = {}) {
  if (!isSpeechSupported()) return false;

  const cleanedLines = (lines ?? [])
    .map((t) => String(t ?? '').trim())
    .filter(Boolean);
  if (cleanedLines.length === 0) return false;

  const gapMs = Number.isFinite(opts.gapMs) ? Math.max(0, opts.gapMs) : 300;

  try {
    stopSpeech();
    const runId = sequenceRunId;

    let index = 0;
    const speakNext = () => {
      if (runId !== sequenceRunId) return;
      if (index >= cleanedLines.length) return;

      const utter = buildUtterance(cleanedLines[index], opts);
      utter.onend = () => {
        if (runId !== sequenceRunId) return;
        index += 1;
        window.setTimeout(speakNext, gapMs);
      };
      utter.onerror = () => {
        if (runId !== sequenceRunId) return;
        index += 1;
        window.setTimeout(speakNext, gapMs);
      };

      window.speechSynthesis.speak(utter);
    };

    speakNext();
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

// Repeats a single word 3 times with pauses (e.g. "bet… bet… bet").
export function speakEnglishTriplet(word, opts = {}) {
  const w = String(word ?? '').trim();
  if (!w) return false;
  return speakEnglishSequence([w, w, w], { gapMs: 350, ...opts });
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
