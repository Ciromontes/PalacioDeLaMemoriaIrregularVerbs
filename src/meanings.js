const EXTRA_MEANINGS_ES = {
  deal: ['tratar', 'negociar', 'repartir', 'manejar'],
  set: ['poner', 'colocar', 'fijar', 'establecer'],
  run: ['correr', 'funcionar', 'dirigir', 'administrar'],
  take: ['tomar', 'llevar', 'coger', 'aceptar'],
  get: ['obtener', 'conseguir', 'llegar', 'recibir'],
  make: ['hacer', 'fabricar', 'crear'],
  put: ['poner', 'colocar'],
  go: ['ir', 'salir', 'marcharse'],
  come: ['venir', 'llegar'],
  keep: ['mantener', 'guardar', 'conservar'],
  leave: ['irse', 'dejar', 'abandonar'],
  meet: ['conocer', 'encontrarse', 'reunirse', 'cumplir (requisitos)'],
};

function normalizeBase(base) {
  return String(base ?? '').trim().toLowerCase();
}

function splitPrimarySpanish(es) {
  const raw = String(es ?? '').trim();
  if (!raw) return [];

  // Common separators used in the dataset: '/', ';', ','
  return raw
    .split(/\s*[/;,]\s*/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function spanishMeaningsFor(base, primaryEs) {
  const normalized = normalizeBase(base);
  const primaryParts = splitPrimarySpanish(primaryEs);
  const extras = EXTRA_MEANINGS_ES[normalized] ?? [];

  const seen = new Set();
  const out = [];

  for (const m of [...primaryParts, ...extras]) {
    const key = String(m ?? '').trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(String(m).trim());
  }

  return out;
}
