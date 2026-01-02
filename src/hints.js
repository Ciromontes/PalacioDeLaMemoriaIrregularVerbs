function normalizeWord(word) {
  return String(word ?? '').trim();
}

function spacedChars(chars) {
  return chars.join(' ');
}

export function buildLevel2WritingHint(word, hintLevel) {
  const w = normalizeWord(word);
  const level = Number(hintLevel) || 0;
  if (!w || level <= 0) return '';

  const len = w.length;
  const mask = Array.from({ length: len }, () => '_');

  // Level 1: first letter
  // Level 2: first + second
  // Level 3: first + second + last (example: f i _ _ t)
  const revealIndexes = [];
  if (len >= 1) revealIndexes.push(0);
  if (level >= 2 && len >= 2) revealIndexes.push(1);
  if (level >= 3 && len >= 3) revealIndexes.push(len - 1);

  for (const idx of revealIndexes) {
    mask[idx] = w[idx];
  }

  return spacedChars(mask);
}
