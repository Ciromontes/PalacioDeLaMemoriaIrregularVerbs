import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Brain, Check, ChevronLeft, ChevronRight, Eye, Lightbulb, RefreshCw, Sparkles, Trophy, X } from 'lucide-react';

import { isSpeechSupported, speakEnglishBlock, stopSpeech, warmUpVoices } from './speech';

// Piso 2 (ABA): Presente = Participio, Pasado distinto
// Regla: El pasado cambia, pero el participio vuelve al origen.
// Imagen mental: Todo va y viene, como un yo-yo o un boomerang.

export const verbsABA = [
  { base: 'become', past: 'became', participle: 'become', es: 'Convertirse', image: 'Una oruga se vuelve mariposa metálica y luego oruga otra vez.' },
  { base: 'come', past: 'came', participle: 'come', es: 'Venir', image: 'Un perro corre hacia ti, camina hacia atrás y corre hacia ti de nuevo.' },
  { base: 'run', past: 'ran', participle: 'run', es: 'Correr', image: 'Un atleta corre, se congela en hielo y vuelve a correr fuego.' },
  { base: 'overcome', past: 'overcame', participle: 'overcome', es: 'Superar', image: 'Un saltador salta un edificio, cae y vuelve a saltarlo.' }
];

function buildLetterPattern(word) {
  const w = (word ?? '').trim();
  if (w.length <= 1) return w;
  if (w.length === 2) return `${w[0]} ${w[1]}`;
  const middle = Array.from({ length: w.length - 2 }, () => '_').join(' ');
  return `${w[0]} ${middle} ${w[w.length - 1]}`;
}

function buildTightPattern(word, revealPrefix = 2) {
  const w = (word ?? '').trim();
  if (w.length <= 2) return w;
  const prefixLen = Math.min(Math.max(1, revealPrefix), Math.max(1, w.length - 1));
  if (w.length <= prefixLen + 1) return w;
  const prefix = w.slice(0, prefixLen);
  const middle = '_'.repeat(Math.max(0, w.length - prefixLen - 1));
  return `${prefix}${middle}${w[w.length - 1]}`;
}

function pointsForHintLevel(hintLevel) {
  const level = Number(hintLevel) || 0;
  if (level <= 0) return 1;
  if (level === 1) return 0.8;
  if (level === 2) return 0.6;
  return 0.4;
}

const intruders = [
  // No-ABA (mezcla de AAA/ABB/ABC) para el nivel de intrusos
  { base: 'put', past: 'put', participle: 'put', es: 'poner', pattern: 'AAA' },
  { base: 'build', past: 'built', participle: 'built', es: 'construir', pattern: 'ABB' },
  { base: 'go', past: 'went', participle: 'gone', es: 'ir', pattern: 'ABC' },
  { base: 'write', past: 'wrote', participle: 'written', es: 'escribir', pattern: 'ABC' },
  { base: 'read', past: 'read', participle: 'read', es: 'leer', pattern: 'AAA' },
];

const contextTemplatesABA = {
  come: {
    present: {
      enFull: 'The client comes to the office for a review.',
      esFull: 'El cliente viene a la oficina para una revisión.',
    },
    past: {
      en: 'Yesterday the client ___ to the office for a review.',
      enFull: 'Yesterday the client came to the office for a review.',
      esFull: 'Ayer el cliente vino a la oficina para una revisión.',
    },
    perf: {
      en: 'This week the client has ___ to two follow-up meetings.',
      enFull: 'This week the client has come to two follow-up meetings.',
      esFull: 'Esta semana el cliente ha venido a dos reuniones de seguimiento.',
    },
  },
  become: {
    present: {
      enFull: 'I become more confident when presenting.',
      esFull: 'Me convierto en una persona más segura al presentar.',
    },
    past: {
      en: 'Last year I ___ the team lead.',
      enFull: 'Last year I became the team lead.',
      esFull: 'El año pasado me convertí en líder del equipo.',
    },
    perf: {
      en: 'This quarter I have ___ more confident when presenting.',
      enFull: 'This quarter I have become more confident when presenting.',
      esFull: 'Este trimestre me he convertido en una persona más segura al presentar.',
    },
  },
  run: {
    present: {
      enFull: 'I run after work to reduce stress.',
      esFull: 'Corro después del trabajo para reducir el estrés.',
    },
    past: {
      en: 'Yesterday I ___ before work as part of the wellness program.',
      enFull: 'Yesterday I ran before work as part of the wellness program.',
      esFull: 'Ayer corrí antes del trabajo como parte del programa de bienestar.',
    },
    perf: {
      en: 'This month I have ___ after work to reduce stress.',
      enFull: 'This month I have run after work to reduce stress.',
      esFull: 'Este mes he corrido después del trabajo para reducir el estrés.',
    },
  },
  overcome: {
    present: {
      enFull: 'The team overcomes challenges with clear communication.',
      esFull: 'El equipo supera retos con una comunicación clara.',
    },
    past: {
      en: 'Last week the team ___ a scheduling issue and delivered on time.',
      enFull: 'Last week the team overcame a scheduling issue and delivered on time.',
      esFull: 'La semana pasada el equipo superó un problema de agenda y entregó a tiempo.',
    },
    perf: {
      en: 'This quarter the team has ___ several challenges with clear communication.',
      enFull: 'This quarter the team has overcome several challenges with clear communication.',
      esFull: 'Este trimestre el equipo ha superado varios retos con comunicación clara.',
    },
  },
};

function fillBlank(sentence, word) {
  return String(sentence ?? '').replace('___', word);
}

function buildContextQuestionsABA() {
  const byBase = Object.entries(contextTemplatesABA);
  return byBase.flatMap(([base, tpl]) => {
    const verb = verbsABA.find((v) => v.base === base);
    if (!verb) return [];

    return [
      {
        verb,
        kind: 'past',
        esFull: tpl.past.esFull,
        en: tpl.past.en,
        answer: verb.past,
        label: 'Past Simple (ABA)',
        note: `Past Simple (ABA): ${verb.base} → ${verb.past}`,
      },
      {
        verb,
        kind: 'perf',
        esFull: tpl.perf.esFull,
        en: tpl.perf.en,
        answer: verb.participle,
        label: 'Present Perfect (ABA)',
        note: `Present Perfect (ABA): has/have ${verb.participle}`,
      },
    ];
  });
}

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

export default function ABAGameEngine({ onExit, onViewGallery }) {
  const [stage, setStage] = useState('menu'); // menu | palace | level1 | level2 | level3 | level4 | results
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [points, setPoints] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [waitingForNext, setWaitingForNext] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackDetails, setFeedbackDetails] = useState('');
  const [showFeedbackDetails, setShowFeedbackDetails] = useState(false);

  const [feedbackSpeechEn, setFeedbackSpeechEn] = useState([]);
  const speechAvailable = isSpeechSupported();

  useEffect(() => {
    warmUpVoices();
    return () => stopSpeech();
  }, []);

  const [userAnswer, setUserAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [selectedIntruders, setSelectedIntruders] = useState([]);
  const [palaceView, setPalaceView] = useState(0);

  const [hintLevel4, setHintLevel4] = useState(0); // 0 none | 1 first letter | 2 spaced pattern | 3 tight pattern

  const [questions, setQuestions] = useState([]);

  const accuracy = totalAnswered > 0 ? Math.round((score / totalAnswered) * 100) : 0;

  const poolForIntruders = useMemo(() => {
    const abaAsCards = verbsABA.map(v => ({ ...v, pattern: 'ABA' }));
    return shuffle([...abaAsCards, ...intruders]);
  }, []);

  const initLevel = (level) => {
    stopSpeech();
    setStage(level);
    setCurrentQuestion(0);
    setScore(0);
    setPoints(0);
    setTotalAnswered(0);
    setWaitingForNext(false);
    setFeedback('');
    setFeedbackDetails('');
    setShowFeedbackDetails(false);
    setFeedbackSpeechEn([]);
    setUserAnswer('');
    setShowHint(false);
    setSelectedAnswer(null);
    setSelectedIntruders([]);
    setHintLevel4(0);

    if (level === 'level1') {
      const selected = shuffle(verbsABA);
      const levelQs = selected.map(verb => {
        const wrongOptions = shuffle(verbsABA.filter(v => v.base !== verb.base)).slice(0, 3);
        const options = shuffle([...wrongOptions.map(v => v.es), verb.es]);
        return { verb, correct: verb.es, options };
      });
      setQuestions(levelQs);
    }

    if (level === 'level2') {
      setQuestions(shuffle(verbsABA));
    }

    if (level === 'level3') {
      const rounds = [];
      const roundsCount = 5;
      for (let i = 0; i < roundsCount; i++) {
        const picks = shuffle(poolForIntruders).slice(0, 5);
        const intr = picks.filter(v => v.pattern !== 'ABA').map(v => v.base);
        rounds.push({ verbs: picks, intruders: intr });
      }
      setQuestions(rounds);
    }

    if (level === 'level4') {
      setQuestions(shuffle(buildContextQuestionsABA()));
    }
  };

  const handleNext = () => {
    stopSpeech();
    setFeedback('');
    setFeedbackDetails('');
    setShowFeedbackDetails(false);
    setFeedbackSpeechEn([]);
    setWaitingForNext(false);
    setUserAnswer('');
    setShowHint(false);
    setSelectedAnswer(null);
    setSelectedIntruders([]);
    setHintLevel4(0);

    if (currentQuestion < questions.length - 1) setCurrentQuestion(prev => prev + 1);
    else setStage('results');
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      stopSpeech();
      setCurrentQuestion(prev => prev - 1);
      setFeedback('');
      setFeedbackDetails('');
      setShowFeedbackDetails(false);
      setFeedbackSpeechEn([]);
      setWaitingForNext(false);
      setUserAnswer('');
      setShowHint(false);
      setSelectedAnswer(null);
      setSelectedIntruders([]);
      setHintLevel4(0);
    }
  };

  const checkAnswerLevel1 = (answer) => {
    const q = questions[currentQuestion];
    const isCorrect = answer === q.correct;
    setSelectedAnswer(answer);
    setTotalAnswered(prev => prev + 1);

    if (isCorrect) {
      setScore(prev => prev + 1);
      setPoints((prev) => prev + 1);
      setFeedback(`✅ ¡Correcto! ${q.verb.base} = ${q.correct}. (ABA)`);
    } else {
      setFeedback(`❌ No. ${q.verb.base} significa "${q.correct}". Imagen: ${q.verb.image}`);
    }
    setWaitingForNext(true);
  };

  const checkLevel2Answer = () => {
    const q = questions[currentQuestion];
    const isCorrect = userAnswer.toLowerCase().trim() === q.base;
    setTotalAnswered(prev => prev + 1);

    if (isCorrect) {
      setScore(prev => prev + 1);
      setPoints((prev) => prev + 1);
      setFeedback(`✅ Bien. ${q.base} - ${q.past} - ${q.participle} (ABA)`);
    } else {
      setFeedback(`❌ Era "${q.base}". Formas: ${q.base} - ${q.past} - ${q.participle}`);
    }
    setWaitingForNext(true);
  };

  const toggleIntruder = (verbBase) => {
    if (waitingForNext) return;
    setSelectedIntruders(prev => prev.includes(verbBase) ? prev.filter(v => v !== verbBase) : [...prev, verbBase]);
  };

  const checkIntruders = () => {
    const q = questions[currentQuestion];
    const correct = [...q.intruders].sort();
    const user = [...selectedIntruders].sort();
    const isCorrect = JSON.stringify(correct) === JSON.stringify(user);

    setTotalAnswered(prev => prev + 1);

    if (isCorrect) {
      setScore(prev => prev + 1);
      setPoints((prev) => prev + 1);
      setFeedback('✅ Perfecto. Identificaste los que NO son ABA.');
    } else {
      const missing = correct.filter(x => !user.includes(x));
      setFeedback(`❌ Te faltó marcar: ${missing.join(', ')}.`);
    }
    setWaitingForNext(true);
  };

  const checkLevel4Answer = () => {
    const q = questions[currentQuestion];
    const isCorrect = userAnswer.toLowerCase().trim() === q.answer;
    setTotalAnswered(prev => prev + 1);

    const tpl = contextTemplatesABA[q.verb.base];
    const presentEn = tpl?.present?.enFull ?? '';
    const presentEs = tpl?.present?.esFull ?? '';
    const pastEn = tpl?.past?.en ? fillBlank(tpl.past.en, q.verb.past) : '';
    const pastEs = tpl?.past?.esFull ?? '';
    const perfEn = tpl?.perf?.en ? fillBlank(tpl.perf.en, q.verb.participle) : '';
    const perfEs = tpl?.perf?.esFull ?? '';

    const earnedPoints = isCorrect ? pointsForHintLevel(hintLevel4) : 0;
    const details = [
      'Presente',
      presentEn,
      presentEs,
      '',
      'Pasado',
      pastEn,
      pastEs,
      '',
      'Participio',
      perfEn,
      perfEs,
    ].filter(Boolean).join('\n');

    setFeedbackDetails(details);
    setShowFeedbackDetails(false);
    setFeedbackSpeechEn([presentEn, pastEn, perfEn].filter(Boolean));

    if (isCorrect) {
      setScore(prev => prev + 1);
      setPoints((prev) => prev + earnedPoints);
      setFeedback(`✅ Correcto. ${q.note} (+${earnedPoints} puntos)`);
    } else {
      setFeedback(`❌ Incorrecto. La forma correcta era "${q.answer}". ${q.note}`);
    }
    setWaitingForNext(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        {typeof onExit === 'function' && (
          <div className="mb-4">
            <button
              onClick={onExit}
              className="inline-flex items-center gap-2 text-slate-200 hover:text-white bg-slate-800/60 hover:bg-slate-700/60 transition px-4 py-2 rounded-lg border border-slate-700"
            >
              <ArrowLeft size={18} /> Volver al Mapa
            </button>
          </div>
        )}

        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-5xl font-bold mb-2 flex items-center justify-center gap-3 text-green-300">
            <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-amber-300" />
            Piso 2: Palacio Boomerang / Palacio del Yo-Yo
          </h1>
          <p className="text-slate-300 text-lg">Patrón ABA: Presente = Participio | Pasado distinto</p>
          <p className="text-slate-500 text-sm mt-2">Ejemplo: come - came - come</p>
        </div>

        {stage !== 'menu' && stage !== 'palace' && stage !== 'results' && (
          <div className="mb-6 bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-700">
            <div className="flex justify-between text-sm mb-2 font-mono text-green-200">
              <span>Progreso: {currentQuestion + 1} / {questions.length}</span>
              <span>Aciertos: {score} | Puntos: {points.toFixed(1)}</span>
            </div>
            <div className="w-full bg-slate-700 h-3 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-500 to-emerald-400 h-full transition-all duration-500 ease-out"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {stage === 'menu' && (
          <div className="grid gap-6">
            <div className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700 text-center">
              <p className="text-xl mb-4 text-green-200">Regla ABA (Boomerang)</p>
              <div className="bg-slate-900/50 p-4 rounded-lg inline-block text-left">
                <p className="font-bold text-amber-300 mb-1">Estructura:</p>
                <p className="font-mono text-slate-200">Base (A) = Participle (A)</p>
                <p className="font-mono text-slate-200">Past (B) es diferente</p>
                <p className="text-sm text-slate-400 mt-2 italic">"En presente vas, en participio vuelves al mismo punto."</p>
              </div>
            </div>

            <button
              onClick={() => setStage('palace')}
              className="group bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 p-6 rounded-2xl transition-all transform hover:scale-[1.02] shadow-xl flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-full"><Eye className="w-6 h-6" /></div>
                <div className="text-left">
                  <h3 className="text-xl font-bold">1. Visitar el Palacio Mental</h3>
                  <p className="text-emerald-100 text-sm">Primero recorre las escenas absurdas para fijar el patrón.</p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 opacity-50 group-hover:opacity-100" />
            </button>

            {typeof onViewGallery === 'function' && (
              <button
                type="button"
                onClick={onViewGallery}
                className="text-sm text-slate-300 hover:text-white underline text-center"
              >
                Recorrido mental (tabla)
              </button>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <button onClick={() => initLevel('level1')} className="bg-slate-700 hover:bg-slate-600 p-6 rounded-xl text-left transition hover:ring-2 ring-green-400">
                <div className="flex items-center gap-3 mb-2 text-green-300"><Brain className="w-5 h-5" /> Nivel 1</div>
                <h3 className="font-bold text-lg">Reconocimiento</h3>
                <p className="text-xs text-slate-400">Significado del verbo</p>
              </button>

              <button onClick={() => initLevel('level2')} className="bg-slate-700 hover:bg-slate-600 p-6 rounded-xl text-left transition hover:ring-2 ring-emerald-400">
                <div className="flex items-center gap-3 mb-2 text-emerald-300"><Lightbulb className="w-5 h-5" /> Nivel 2</div>
                <h3 className="font-bold text-lg">Escritura</h3>
                <p className="text-xs text-slate-400">Escribe la forma base</p>
              </button>

              <button onClick={() => initLevel('level3')} className="bg-slate-700 hover:bg-slate-600 p-6 rounded-xl text-left transition hover:ring-2 ring-orange-400">
                <div className="flex items-center gap-3 mb-2 text-orange-300"><X className="w-5 h-5" /> Nivel 3</div>
                <h3 className="font-bold text-lg">Detectar Intrusos</h3>
                <p className="text-xs text-slate-400">Selecciona los que NO son ABA</p>
              </button>

              <button onClick={() => initLevel('level4')} className="bg-slate-700 hover:bg-slate-600 p-6 rounded-xl text-left transition hover:ring-2 ring-amber-400">
                <div className="flex items-center gap-3 mb-2 text-amber-300"><Check className="w-5 h-5" /> Nivel 4</div>
                <h3 className="font-bold text-lg">Contexto Real</h3>
                <p className="text-xs text-slate-400">Elige la forma correcta (past/participle)</p>
              </button>
            </div>
          </div>
        )}

        {stage === 'palace' && (
          <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-emerald-300">Galería Mental (ABA)</h2>
              <button onClick={() => setStage('menu')} className="text-sm bg-slate-900 px-3 py-1 rounded hover:bg-slate-700 transition">Volver</button>
            </div>

            <div className="bg-slate-900/50 p-8 rounded-xl text-center mb-6 min-h-[200px] flex flex-col justify-center items-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-50"></div>

              <h3 className="text-5xl font-black text-white mb-2 tracking-wider">{verbsABA[palaceView].base.toUpperCase()}</h3>
              <p className="text-xl text-green-200 mb-2 font-serif italic">"{verbsABA[palaceView].es}"</p>
              <p className="text-slate-300 mb-6 font-mono">{verbsABA[palaceView].base} - {verbsABA[palaceView].past} - {verbsABA[palaceView].participle}</p>

              <div className="bg-slate-800 p-4 rounded-lg max-w-lg border border-slate-600">
                <p className="text-slate-100 text-lg leading-relaxed">
                  {verbsABA[palaceView].image}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center gap-4">
              <button
                onClick={() => setPalaceView(prev => Math.max(0, prev - 1))}
                disabled={palaceView === 0}
                className="bg-slate-700 p-4 rounded-full disabled:opacity-30 hover:bg-green-600 transition"
              >
                <ChevronLeft />
              </button>
              <span className="font-mono text-slate-500">{palaceView + 1} / {verbsABA.length}</span>
              <button
                onClick={() => setPalaceView(prev => Math.min(verbsABA.length - 1, prev + 1))}
                disabled={palaceView === verbsABA.length - 1}
                className="bg-slate-700 p-4 rounded-full disabled:opacity-30 hover:bg-green-600 transition"
              >
                <ChevronRight />
              </button>
            </div>
          </div>
        )}

        {stage === 'level1' && questions[currentQuestion] && (
          <div className="bg-slate-800 rounded-2xl p-8 shadow-2xl border border-slate-700">
            <div className="text-center mb-8">
              <h2 className="text-sm font-bold text-green-300 tracking-widest uppercase mb-2">RECONOCIMIENTO</h2>
              <div className="text-6xl font-black text-white mb-4 drop-shadow-lg">{questions[currentQuestion].verb.base}</div>
              <p className="text-slate-400 font-mono">{questions[currentQuestion].verb.base} - {questions[currentQuestion].verb.past} - {questions[currentQuestion].verb.participle}</p>
              <p className="text-slate-400 mt-2">Selecciona el significado correcto</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {questions[currentQuestion].options.map((option, idx) => {
                const isSelected = selectedAnswer === option;
                const isCorrect = option === questions[currentQuestion].correct;
                const showResult = waitingForNext && isSelected;

                return (
                  <button
                    key={idx}
                    onClick={() => !waitingForNext && checkAnswerLevel1(option)}
                    disabled={waitingForNext}
                    className={`p-5 rounded-xl text-lg font-medium transition-all transform hover:scale-[1.02] disabled:transform-none ${
                      showResult && isCorrect
                        ? 'bg-green-600 ring-4 ring-green-400 shadow-lg shadow-green-500/50'
                        : showResult && !isCorrect
                        ? 'bg-red-600 ring-4 ring-red-400 shadow-lg shadow-red-500/50'
                        : 'bg-slate-700 hover:bg-green-700'
                    } ${waitingForNext && !isSelected ? 'opacity-50' : ''}`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {stage === 'level2' && questions[currentQuestion] && (
          <div className="bg-slate-800 rounded-2xl p-8 shadow-2xl border border-slate-700 text-center">
            <h2 className="text-sm font-bold text-emerald-300 tracking-widest uppercase mb-6">PRODUCCIÓN</h2>
            <div className="mb-6">
              <p className="text-3xl font-bold text-white mb-2">{questions[currentQuestion].es}</p>
              <p className="text-slate-500 text-sm">Escribe la forma base (A). Pista: {questions[currentQuestion].base} - {questions[currentQuestion].past} - {questions[currentQuestion].participle}</p>
            </div>

            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !waitingForNext && checkLevel2Answer()}
              placeholder="Escribe aquí..."
              disabled={waitingForNext}
              className="w-full max-w-md bg-slate-900 border-2 border-slate-600 focus:border-emerald-500 rounded-xl p-4 text-center text-2xl outline-none transition-colors mb-4"
              autoFocus
            />

            {!waitingForNext && (
              <div className="flex justify-center gap-4">
                <button onClick={() => setShowHint(!showHint)} className="text-slate-400 hover:text-white text-sm underline">
                  {showHint ? `Empieza con: ${questions[currentQuestion].base[0].toUpperCase()}...` : '¿Necesitas una pista?'}
                </button>
                <button
                  onClick={checkLevel2Answer}
                  disabled={!userAnswer}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-2 rounded-lg font-bold transition disabled:opacity-50"
                >
                  Verificar
                </button>
              </div>
            )}
          </div>
        )}

        {stage === 'level3' && questions[currentQuestion] && (
          <div className="bg-slate-800 rounded-2xl p-8 shadow-2xl border border-slate-700">
            <div className="text-center mb-6">
              <h2 className="text-sm font-bold text-orange-300 tracking-widest uppercase mb-2">CONTROL DE PATRÓN</h2>
              <p className="text-xl text-white">Selecciona los verbos que <span className="text-red-300 font-bold">NO SON ABA</span>.</p>
              <p className="text-slate-400 text-sm mt-1">En ABA: Base = Participle.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {questions[currentQuestion].verbs.map((verb, idx) => (
                <button
                  key={idx}
                  onClick={() => toggleIntruder(verb.base)}
                  disabled={waitingForNext}
                  className={`p-4 rounded-xl transition-all relative overflow-hidden ${
                    selectedIntruders.includes(verb.base)
                      ? 'bg-red-900/50 border-2 border-red-500 text-white'
                      : 'bg-slate-700 hover:bg-slate-600 border-2 border-transparent'
                  }`}
                >
                  <span className="font-bold text-lg block">{verb.base}</span>
                  <span className="text-xs text-slate-300 font-mono block">{verb.base} - {verb.past} - {verb.participle}</span>
                  <span className="text-xs text-slate-400">{verb.es}{verb.pattern ? ` (${verb.pattern})` : ''}</span>
                  {selectedIntruders.includes(verb.base) && (
                    <div className="absolute top-2 right-2 text-red-500"><X size={16} /></div>
                  )}
                </button>
              ))}
            </div>

            {!waitingForNext && (
              <button
                onClick={checkIntruders}
                disabled={selectedIntruders.length === 0}
                className="w-full bg-orange-600 hover:bg-orange-500 p-4 rounded-xl font-bold transition disabled:opacity-50"
              >
                Confirmar
              </button>
            )}
          </div>
        )}

        {stage === 'level4' && questions[currentQuestion] && (
          <div className="bg-slate-800 rounded-2xl p-8 shadow-2xl border border-slate-700">
            <div className="text-center mb-8">
              <h2 className="text-sm font-bold text-amber-300 tracking-widest uppercase mb-2">CONTEXTO REAL</h2>
              <p className="text-slate-400">Completa con la forma correcta (pasado o participio)</p>
            </div>

            <div className="bg-slate-900 p-6 rounded-xl mb-6 space-y-3">
              <p className="text-xl md:text-2xl leading-relaxed text-green-100 text-center">
                {questions[currentQuestion].esFull}
              </p>
              <p className="text-xl md:text-2xl leading-relaxed text-slate-200 text-center">
                {questions[currentQuestion].en.split('___')[0]}
                <span className="inline-block border-b-2 border-slate-400 min-w-[120px] text-amber-300 font-bold px-2">
                  {userAnswer || '...'}
                </span>
                {questions[currentQuestion].en.split('___')[1]}
              </p>
              <p className="text-sm text-slate-400 text-center italic">{questions[currentQuestion].label}</p>
            </div>

            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !waitingForNext && checkLevel4Answer()}
              placeholder="Escribe la forma correcta..."
              disabled={waitingForNext}
              className="w-full bg-slate-700 p-4 rounded-xl text-center text-xl mb-4 outline-none focus:ring-2 ring-amber-500"
            />

            {!waitingForNext && (
              <div className="flex flex-col items-center gap-2 mb-4">
                <button
                  onClick={() => setHintLevel4((prev) => Math.min(3, prev + 1))}
                  className="text-slate-300 hover:text-white text-sm underline"
                >
                  Pedir pista
                </button>
                {hintLevel4 > 0 && (
                  <div className="text-sm text-slate-200 bg-slate-900/60 border border-slate-700 rounded-lg px-4 py-2 text-center whitespace-pre-line">
                    {(() => {
                      const ans = (questions[currentQuestion].answer ?? '').trim();
                      const first = ans ? ans[0] : '';
                      const spaced = buildLetterPattern(ans);
                      const tight = buildTightPattern(ans, 2);

                      if (hintLevel4 === 1) return `Pista 1: el verbo empieza con ${first}`;
                      if (hintLevel4 === 2) return `Pista 2: ${spaced}`;
                      return `Pista 3: ${tight}`;
                    })()}
                  </div>
                )}
              </div>
            )}

            {!waitingForNext && (
              <button
                onClick={checkLevel4Answer}
                disabled={!userAnswer}
                className="w-full bg-amber-600 hover:bg-amber-500 p-4 rounded-xl font-bold transition disabled:opacity-50"
              >
                Completar
              </button>
            )}
          </div>
        )}

        {feedback && (
          <div className={`mt-6 p-6 rounded-xl ${feedback.includes('✅') ? 'bg-green-900/40 border border-green-500/50' : 'bg-red-900/40 border border-red-500/50'}`}>
            <div className="text-center md:text-left font-medium text-lg whitespace-pre-line">{feedback}</div>

            {stage === 'level4' && waitingForNext ? (
              <div className="mt-4 flex flex-col md:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => setShowFeedbackDetails((v) => !v)}
                  className="bg-slate-800 hover:bg-slate-700 px-6 py-3 rounded-lg font-bold transition"
                >
                  Ver retroalimentación
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="bg-white text-slate-900 px-6 py-3 rounded-lg font-bold hover:bg-slate-200 transition flex items-center justify-center gap-2"
                >
                  Siguiente <ChevronRight size={20} />
                </button>
              </div>
            ) : (
              <div className="mt-4 flex gap-3 w-full md:w-auto justify-center">
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                  className="bg-slate-800 p-3 rounded-lg hover:bg-slate-700 disabled:opacity-50 transition"
                >
                  <ChevronLeft />
                </button>
                <button
                  onClick={handleNext}
                  className="bg-white text-slate-900 px-6 py-3 rounded-lg font-bold hover:bg-slate-200 transition flex items-center justify-center gap-2"
                >
                  Siguiente <ChevronRight size={20} />
                </button>
              </div>
            )}

            {stage === 'level4' && showFeedbackDetails && feedbackDetails && (
              <div className="mt-4 bg-slate-900/50 border border-slate-700 rounded-xl p-4 whitespace-pre-line text-slate-100">
                {speechAvailable && feedbackSpeechEn.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => speakEnglishBlock(feedbackSpeechEn)}
                      className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg font-bold transition"
                    >
                      Escuchar EN
                    </button>
                    <button
                      type="button"
                      onClick={stopSpeech}
                      className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg font-bold transition"
                    >
                      Detener
                    </button>
                  </div>
                )}
                {feedbackDetails}
              </div>
            )}
          </div>
        )}

        {stage === 'results' && (
          <div className="bg-slate-800 rounded-2xl p-10 text-center shadow-2xl border border-slate-700">
            <Trophy className="w-20 h-20 text-amber-300 mx-auto mb-6" />
            <h2 className="text-4xl font-bold mb-2">Resultados</h2>
            <p className="text-slate-400 mb-8">Precisión global</p>

            <div className="grid grid-cols-2 gap-6 max-w-md mx-auto mb-8">
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-700">
                <div className="text-4xl font-bold text-emerald-400 mb-1">{accuracy}%</div>
                <div className="text-xs text-slate-400 uppercase tracking-widest">Precisión</div>
              </div>
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-700">
                <div className="text-4xl font-bold text-green-300 mb-1">{score}</div>
                <div className="text-xs text-slate-400 uppercase tracking-widest">Aciertos</div>
                <div className="text-sm text-slate-300 mt-2">Puntos: {points.toFixed(1)}</div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <button
                onClick={() => setStage('menu')}
                className="bg-slate-700 hover:bg-slate-600 px-8 py-3 rounded-xl font-bold transition"
              >
                Volver al Menú
              </button>
              <button
                onClick={() => initLevel('level4')}
                className="bg-emerald-600 hover:bg-emerald-500 px-8 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2"
              >
                <RefreshCw size={20} /> Practicar Contexto
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
