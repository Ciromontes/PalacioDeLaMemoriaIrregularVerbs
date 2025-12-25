import React, { useState } from 'react';
import { Check, X, RefreshCw, Sparkles, ChevronRight, ChevronLeft, Eye, Brain, Trophy, Lightbulb, ArrowLeft } from 'lucide-react';

// --- DATA: LOS 28 VERBOS AAA EXACTAMENTE COMO EN EL PDF ---
const verbsAAA = [
  { en: "bet", es: "apostar", image: "Un perro gigante apuesta huesos de oro en una mesa de póker." },
  { en: "burst", es: "estallar", image: "Globos de acero estallan soltando confeti infinito." },
  { en: "cast", es: "lanzar (papel)", image: "Un director de cine lanza guiones a actores robots." },
  { en: "cost", es: "costar", image: "Una etiqueta de precio gigante te persigue por el pasillo." },
  { en: "cut", es: "cortar", image: "Un árbol se corta a sí mismo con ramas en forma de tijeras." },
  { en: "fit", es: "encajar", image: "Un elefante intenta encajar en una caja de fósforos y entra perfecto." },
  { en: "hit", es: "golpear", image: "Un guante de boxeo con alas golpea una campana." },
  { en: "hurt", es: "herir/doler", image: "Un cactus gigante se sienta en una silla y se pincha a sí mismo." },
  { en: "knit", es: "tejer", image: "Dos ovejas tejen su propia lana con agujas láser." },
  { en: "let", es: "permitir", image: "Un semáforo con cara sonriente te deja pasar." },
  { en: "put", es: "poner", image: "Un brazo robótico pone sombreros en cabezas de estatuas." },
  { en: "quit", es: "renunciar", image: "Un empleado tira papeles al aire y sale volando en un cohete." },
  { en: "read", es: "leer", image: "Un libro rojo gigante te lee a ti en voz alta. (Suena 'red' en pasado)." },
  { en: "set", es: "colocar/fijar", image: "Un camarero antigravedad coloca una mesa en el techo (al revés)." },
  { en: "shut", es: "cerrar", image: "Una puerta con boca grita '¡Silencio!' y se cierra sola." },
  { en: "slit", es: "rajar", image: "Un ninja corta un papel tan fino que no se ve." },
  { en: "spread", es: "esparcir", image: "Un cuchillo unta mantequilla en el suelo de toda la sala." },
  { en: "sweat", es: "sudar", image: "Una fuente de agua con forma de persona corriendo y sudando." },
  { en: "thrust", es: "empujar", image: "Un motor a reacción empuja un carrito de supermercado a velocidad luz." },
  { en: "upset", es: "molestar", image: "Un helado enorme se derrite encima de un escritorio y fastidia (molesta) a los papeles." },
  { en: "wet", es: "mojar", image: "Una nube personal llueve solo sobre una silla." },
  { en: "bid", es: "pujar/ofrecer", image: "Un subastador con megáfono ofrece montañas de zapatos gigantes en una feria." },
  { en: "broadcast", es: "transmitir", image: "Una radio parlante gigante transmite noticias a las nubes." },
  { en: "forecast", es: "pronosticar", image: "Un meteorólogo gigante dibuja nubes y rayos en el cielo usando un marcador fluorescente." },
  { en: "input", es: "introducir", image: "Un teclado enorme introduce datos masticando tarjetas perforadas y escupiendo números." },
  { en: "output", es: "producir/salir", image: "Una impresora industrial produce globos de colores que salen volando en formación." },
  { en: "rid", es: "librar", image: "Un perro enorme sacude su pelaje y se libera de todas las pulgas que lo molestaban." },
  { en: "shed", es: "desprender", image: "Un árbol mecánico se sacude y desprende hojas de metal que suenan como campanas." }
];

const intruderVerbs = [
  { en: "sing", es: "cantar", pattern: "Cambia (i-a-u)" },
  { en: "break", es: "romper", pattern: "Cambia (Break-Broke)" },
  { en: "spend", es: "gastar", pattern: "Cambia (d -> t)" },
  { en: "write", es: "escribir", pattern: "Cambia (Write-Wrote)" },
  { en: "drive", es: "conducir", pattern: "Cambia (Drive-Drove)" },
  { en: "bring", es: "traer", pattern: "Cambia (GHT)" },
  { en: "come", es: "venir", pattern: "Va y vuelve (ABA)" },
  { en: "run", es: "correr", pattern: "Va y vuelve (ABA)" }
];

// FRASES PARA NIVEL 4 - 28 frases (una por cada verbo AAA)
const sentences = [
  { es: "Ayer, me ___ el dedo con papel.", en: "Yesterday, I ___ my finger with paper.", verb: "cut", meaning: "cortar" },
  { es: "He ___ las llaves en la mesa.", en: "I have ___ the keys on the table.", verb: "put", meaning: "poner" },
  { es: "El globo ha ___ en mil pedazos.", en: "The balloon has ___ into a thousand pieces.", verb: "burst", meaning: "estallar" },
  { es: "Ella ___ la puerta con fuerza anoche.", en: "She ___ the door hard last night.", verb: "shut", meaning: "cerrar" },
  { es: "¿Cuánto ha ___ este robot?", en: "How much has this robot ___?", verb: "cost", meaning: "costar" },
  { es: "El ninja ___ la tela silenciosamente.", en: "The ninja ___ the fabric silently.", verb: "slit", meaning: "rajar" },
  { es: "Siempre ___ en el casino los viernes.", en: "He always ___ at the casino on Fridays.", verb: "bet", meaning: "apostar" },
  { es: "El actor fue ___ en el papel principal.", en: "The actor was ___ in the leading role.", verb: "cast", meaning: "lanzar" },
  { es: "El traje le ___ perfectamente.", en: "The suit ___ him perfectly.", verb: "fit", meaning: "encajar" },
  { es: "El boxeador ___ a su oponente.", en: "The boxer ___ his opponent.", verb: "hit", meaning: "golpear" },
  { es: "Sus palabras me ___ profundamente.", en: "His words ___ me deeply.", verb: "hurt", meaning: "herir" },
  { es: "Mi abuela ___ un suéter para mí.", en: "My grandmother ___ a sweater for me.", verb: "knit", meaning: "tejer" },
  { es: "El profesor nos ___ usar el teléfono.", en: "The teacher ___ us use the phone.", verb: "let", meaning: "permitir" },
  { es: "Él ___ su trabajo la semana pasada.", en: "He ___ his job last week.", verb: "quit", meaning: "renunciar" },
  { es: "Ayer ___ un libro fascinante.", en: "Yesterday I ___ a fascinating book.", verb: "read", meaning: "leer" },
  { es: "El chef ___ la mesa para la cena.", en: "The chef ___ the table for dinner.", verb: "set", meaning: "colocar" },
  { es: "___ mantequilla en el pan.", en: "I ___ butter on the bread.", verb: "spread", meaning: "esparcir" },
  { es: "___ mucho durante el ejercicio.", en: "I ___ a lot during exercise.", verb: "sweat", meaning: "sudar" },
  { es: "El cohete se ___ hacia adelante.", en: "The rocket ___ forward.", verb: "thrust", meaning: "empujar" },
  { es: "La noticia ___ a todos.", en: "The news ___ everyone.", verb: "upset", meaning: "molestar" },
  { es: "La lluvia ___ la ropa tendida.", en: "The rain ___ the hanging clothes.", verb: "wet", meaning: "mojar" },
  { es: "___ $100 por la pintura.", en: "I ___ $100 for the painting.", verb: "bid", meaning: "pujar" },
  { es: "La cadena ___ el evento en vivo.", en: "The network ___ the live event.", verb: "broadcast", meaning: "transmitir" },
  { es: "El meteorólogo ___ lluvia para mañana.", en: "The meteorologist ___ rain for tomorrow.", verb: "forecast", meaning: "pronosticar" },
  { es: "___ los datos en el sistema.", en: "I ___ the data into the system.", verb: "input", meaning: "introducir" },
  { es: "La máquina ___ 100 unidades por hora.", en: "The machine ___ 100 units per hour.", verb: "output", meaning: "producir" },
  { es: "Nos ___ de las malas hierbas.", en: "We ___ ourselves of the weeds.", verb: "rid", meaning: "librar" },
  { es: "El árbol ___ sus hojas en otoño.", en: "The tree ___ its leaves in autumn.", verb: "shed", meaning: "desprender" }
];

export default function AAA_Game_Engine({ onExit }) {
  const [stage, setStage] = useState('menu');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [questions, setQuestions] = useState([]);
  const [selectedIntruders, setSelectedIntruders] = useState([]);
  const [showHint, setShowHint] = useState(false);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [waitingForNext, setWaitingForNext] = useState(false);
  const [palaceView, setPalaceView] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const shuffle = (array) => [...array].sort(() => Math.random() - 0.5);

  const generateLevel1Questions = () => {
    const selected = shuffle(verbsAAA).slice(0, 10);
    return selected.map(verb => {
      const wrongOptions = shuffle(verbsAAA.filter(v => v.en !== verb.en)).slice(0, 3);
      const options = shuffle([...wrongOptions.map(v => v.es), verb.es]);
      return { verb: verb.en, correct: verb.es, options, image: verb.image };
    });
  };

  const generateLevel2Questions = () => {
    return shuffle(verbsAAA).slice(0, 8);
  };

  const generateLevel3Questions = () => {
    const rounds = [];
    for (let i = 0; i < 5; i++) {
      const aaaVerbs = shuffle(verbsAAA).slice(0, 3);
      const intruders = shuffle(intruderVerbs).slice(0, 2);
      const mixed = shuffle([...aaaVerbs, ...intruders]);
      rounds.push({ verbs: mixed, intruders: intruders.map(v => v.en) });
    }
    return rounds;
  };

  const generateLevel4Questions = () => {
    return shuffle(sentences).slice(0, 6);
  };

  const initLevel = (level) => {
    setStage(level);
    setCurrentQuestion(0);
    setScore(0);
    setTotalAnswered(0);
    setFeedback('');
    setWaitingForNext(false);
    setUserAnswer('');
    setSelectedIntruders([]);
    setShowHint(false);
    setSelectedAnswer(null);

    if (level === 'level1') setQuestions(generateLevel1Questions());
    if (level === 'level2') setQuestions(generateLevel2Questions());
    if (level === 'level3') setQuestions(generateLevel3Questions());
    if (level === 'level4') setQuestions(generateLevel4Questions());
  };

  const checkAnswerLevel1 = (answer) => {
    const q = questions[currentQuestion];
    const isCorrect = answer === q.correct;
    setSelectedAnswer(answer);
    setTotalAnswered(prev => prev + 1);

    if (isCorrect) {
      setScore(prev => prev + 1);
      setFeedback(`✅ ¡Exacto! ${q.verb} = ${q.correct}. (AAA: No cambia)`);
    } else {
      setFeedback(`❌ Ups. ${q.verb} significa "${q.correct}". Recuerda: ${q.image}`);
    }
    setWaitingForNext(true);
  };

  const checkLevel2Answer = () => {
    const q = questions[currentQuestion];
    const isCorrect = userAnswer.toLowerCase().trim() === q.en;
    setTotalAnswered(prev => prev + 1);

    if (isCorrect) {
      setScore(prev => prev + 1);
      setFeedback(`✅ ¡Correcto! "${q.es}" es ${q.en}. (AAA: ${q.en} - ${q.en} - ${q.en})`);
    } else {
      setFeedback(`❌ La respuesta es "${q.en}". En el espejo todo se ve igual.`);
    }
    setShowHint(false);
    setWaitingForNext(true);
  };

  const toggleIntruder = (verbEn) => {
    if (waitingForNext) return;
    setSelectedIntruders(prev =>
      prev.includes(verbEn)
        ? prev.filter(v => v !== verbEn)
        : [...prev, verbEn]
    );
  };

  const checkIntruders = () => {
    const q = questions[currentQuestion];
    const correctIntruders = q.intruders.sort();
    const userIntruders = selectedIntruders.sort();

    const isCorrect = JSON.stringify(correctIntruders) === JSON.stringify(userIntruders);

    setTotalAnswered(prev => prev + 1);

    if (isCorrect) {
      setScore(prev => prev + 1);
      setFeedback(`✅ ¡Excelente! Sacaste a los intrusos del Palacio de Espejos.`);
    } else {
      const missing = correctIntruders.filter(x => !userIntruders.includes(x));
      setFeedback(`❌ Te faltó identificar: ${missing.join(', ')}. Recuerda, solo los AAA se quedan.`);
    }
    setWaitingForNext(true);
  };

  const checkLevel4Answer = () => {
    const q = questions[currentQuestion];
    const isCorrect = userAnswer.toLowerCase().trim() === q.verb;
    setTotalAnswered(prev => prev + 1);

    if (isCorrect) {
      setScore(prev => prev + 1);
      setFeedback(`✅ ¡Perfecto! "${q.verb}" es AAA, así que en pasado se escribe igual.`);
    } else {
      setFeedback(`❌ Incorrecto. Era "${q.verb}". Al ser AAA, no cambia en pasado.`);
    }
    setWaitingForNext(true);
  };

  const handleNext = () => {
    setFeedback('');
    setWaitingForNext(false);
    setUserAnswer('');
    setSelectedIntruders([]);
    setShowHint(false);
    setSelectedAnswer(null);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setStage('results');
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      setFeedback('');
      setWaitingForNext(false);
      setUserAnswer('');
      setSelectedIntruders([]);
      setShowHint(false);
      setSelectedAnswer(null);
    }
  };

  const accuracy = totalAnswered > 0 ? Math.round((score / totalAnswered) * 100) : 0;

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
          <h1 className="text-3xl md:text-5xl font-bold mb-2 flex items-center justify-center gap-3 text-blue-400">
            <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-yellow-300" />
            Piso 1: La Sala de los Espejos
          </h1>
          <p className="text-slate-400 text-lg">Donde los verbos nunca cambian (AAA) - 28 Verbos</p>
        </div>

        {stage !== 'menu' && stage !== 'palace' && stage !== 'results' && (
          <div className="mb-6 bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-700">
            <div className="flex justify-between text-sm mb-2 font-mono text-blue-200">
              <span>Progreso: {currentQuestion + 1} / {questions.length}</span>
              <span>Aciertos: {score}</span>
            </div>
            <div className="w-full bg-slate-700 h-3 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full transition-all duration-500 ease-out"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {stage === 'menu' && (
          <div className="grid gap-6">
            <div className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700 text-center">
              <p className="text-xl mb-4 text-blue-200">Bienvenido al Gran Hotel de la Memoria</p>
              <div className="bg-slate-900/50 p-4 rounded-lg inline-block text-left">
                <p className="font-bold text-yellow-400 mb-1">Regla Universal AAA:</p>
                <p className="font-mono text-slate-300">Presente = Pasado = Participio</p>
                <p className="text-sm text-slate-400 mt-2 italic">"Como un espejo, la imagen no cambia."</p>
              </div>
            </div>

            <button
              onClick={() => setStage('palace')}
              className="group bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 p-6 rounded-2xl transition-all transform hover:scale-[1.02] shadow-xl flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-full"><Eye className="w-6 h-6" /></div>
                <div className="text-left">
                  <h3 className="text-xl font-bold">1. Visitar el Palacio Mental</h3>
                  <p className="text-emerald-100 text-sm">Visualiza las 28 escenas absurdas antes de jugar.</p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 opacity-50 group-hover:opacity-100" />
            </button>

            <div className="grid md:grid-cols-2 gap-4">
              <button onClick={() => initLevel('level1')} className="bg-slate-700 hover:bg-slate-600 p-6 rounded-xl text-left transition hover:ring-2 ring-blue-400">
                <div className="flex items-center gap-3 mb-2 text-blue-300"><Brain className="w-5 h-5" /> Nivel 1</div>
                <h3 className="font-bold text-lg">Reconocimiento</h3>
                <p className="text-xs text-slate-400">¿Qué significa este verbo?</p>
              </button>

              <button onClick={() => initLevel('level2')} className="bg-slate-700 hover:bg-slate-600 p-6 rounded-xl text-left transition hover:ring-2 ring-purple-400">
                <div className="flex items-center gap-3 mb-2 text-purple-300"><Lightbulb className="w-5 h-5" /> Nivel 2</div>
                <h3 className="font-bold text-lg">Escritura</h3>
                <p className="text-xs text-slate-400">Escribe el verbo en inglés.</p>
              </button>

              <button onClick={() => initLevel('level3')} className="bg-slate-700 hover:bg-slate-600 p-6 rounded-xl text-left transition hover:ring-2 ring-orange-400">
                <div className="flex items-center gap-3 mb-2 text-orange-300"><X className="w-5 h-5" /> Nivel 3</div>
                <h3 className="font-bold text-lg">Detectar Intrusos</h3>
                <p className="text-xs text-slate-400">¿Cuál NO pertenece al piso espejo?</p>
              </button>

              <button onClick={() => initLevel('level4')} className="bg-slate-700 hover:bg-slate-600 p-6 rounded-xl text-left transition hover:ring-2 ring-red-400">
                <div className="flex items-center gap-3 mb-2 text-red-300"><Check className="w-5 h-5" /> Nivel 4</div>
                <h3 className="font-bold text-lg">Contexto Real</h3>
                <p className="text-xs text-slate-400">Completa la frase lógica.</p>
              </button>
            </div>
          </div>
        )}

        {stage === 'palace' && (
          <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-emerald-400">Galería Mental</h2>
              <button onClick={() => setStage('menu')} className="text-sm bg-slate-900 px-3 py-1 rounded hover:bg-slate-700 transition">Volver</button>
            </div>

            <div className="bg-slate-900/50 p-8 rounded-xl text-center mb-6 min-h-[200px] flex flex-col justify-center items-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>

              <h3 className="text-5xl font-black text-white mb-2 tracking-wider">{verbsAAA[palaceView].en.toUpperCase()}</h3>
              <p className="text-xl text-blue-300 mb-6 font-serif italic">"{verbsAAA[palaceView].es}"</p>

              <div className="bg-slate-800 p-4 rounded-lg max-w-lg border border-slate-600">
                <p className="text-yellow-100 text-lg leading-relaxed">
                  👁️ {verbsAAA[palaceView].image}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center gap-4">
              <button
                onClick={() => setPalaceView(prev => Math.max(0, prev - 1))}
                disabled={palaceView === 0}
                className="bg-slate-700 p-4 rounded-full disabled:opacity-30 hover:bg-blue-600 transition"
              >
                <ChevronLeft />
              </button>
              <span className="font-mono text-slate-500">{palaceView + 1} / {verbsAAA.length}</span>
              <button
                onClick={() => setPalaceView(prev => Math.min(verbsAAA.length - 1, prev + 1))}
                disabled={palaceView === verbsAAA.length - 1}
                className="bg-slate-700 p-4 rounded-full disabled:opacity-30 hover:bg-blue-600 transition"
              >
                <ChevronRight />
              </button>
            </div>
          </div>
        )}

        {stage === 'level1' && questions[currentQuestion] && (
          <div className="bg-slate-800 rounded-2xl p-8 shadow-2xl border border-slate-700">
            <div className="text-center mb-8">
              <h2 className="text-sm font-bold text-blue-400 tracking-widest uppercase mb-2">RECONOCIMIENTO</h2>
              <div className="text-6xl font-black text-white mb-6 drop-shadow-lg">{questions[currentQuestion].verb}</div>
              <p className="text-slate-400">Selecciona el significado correcto</p>
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
                        : 'bg-slate-700 hover:bg-blue-600'
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
            <h2 className="text-sm font-bold text-purple-400 tracking-widest uppercase mb-6">PRODUCCIÓN</h2>
            <div className="mb-8">
              <p className="text-3xl font-bold text-white mb-2">{questions[currentQuestion].es}</p>
              <p className="text-slate-500 text-sm">Escribe el verbo en inglés</p>
            </div>

            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !waitingForNext && checkLevel2Answer()}
              placeholder="Escribe aquí..."
              disabled={waitingForNext}
              className="w-full max-w-md bg-slate-900 border-2 border-slate-600 focus:border-purple-500 rounded-xl p-4 text-center text-2xl outline-none transition-colors mb-4"
              autoFocus
            />

            {!waitingForNext && (
              <div className="flex justify-center gap-4">
                <button onClick={() => setShowHint(!showHint)} className="text-slate-400 hover:text-white text-sm underline">
                  {showHint ? `Empieza con: ${questions[currentQuestion].en[0].toUpperCase()}...` : "¿Necesitas una pista?"}
                </button>
                <button
                  onClick={checkLevel2Answer}
                  disabled={!userAnswer}
                  className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-2 rounded-lg font-bold transition disabled:opacity-50"
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
              <h2 className="text-sm font-bold text-orange-400 tracking-widest uppercase mb-2">SEGURIDAD DEL PALACIO</h2>
              <p className="text-xl text-white">¡Alerta! Hay intrusos.</p>
              <p className="text-slate-400 text-sm mt-1">Selecciona los verbos que <span className="text-red-400 font-bold">NO SON AAA</span> (los que cambian).</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {questions[currentQuestion].verbs.map((verb, idx) => (
                <button
                  key={idx}
                  onClick={() => toggleIntruder(verb.en)}
                  disabled={waitingForNext}
                  className={`p-4 rounded-xl transition-all relative overflow-hidden ${
                    selectedIntruders.includes(verb.en)
                      ? 'bg-red-900/50 border-2 border-red-500 text-white'
                      : 'bg-slate-700 hover:bg-slate-600 border-2 border-transparent'
                  }`}
                >
                  <span className="font-bold text-lg block">{verb.en}</span>
                  <span className="text-xs text-slate-400">{verb.es}</span>
                  {selectedIntruders.includes(verb.en) && (
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
                Confirmar Intrusos
              </button>
            )}
          </div>
        )}

        {stage === 'level4' && questions[currentQuestion] && (
          <div className="bg-slate-800 rounded-2xl p-8 shadow-2xl border border-slate-700">
            <div className="text-center mb-8">
              <h2 className="text-sm font-bold text-red-400 tracking-widest uppercase mb-2">CONTEXTO</h2>
              <p className="text-slate-400">Completa la frase con el verbo AAA correcto</p>
            </div>

            <div className="bg-slate-900 p-6 rounded-xl mb-6 space-y-4">
              <div className="text-center">
                <p className="text-xl md:text-2xl leading-relaxed text-blue-200">
                  {questions[currentQuestion].es.split('___')[0]}
                  <span className="inline-block border-b-2 border-blue-400 min-w-[100px] text-yellow-400 font-bold px-2">
                    {userAnswer || "?"}
                  </span>
                  {questions[currentQuestion].es.split('___')[1]}
                </p>
              </div>

              <div className="text-center">
                <p className="text-xl md:text-2xl leading-relaxed text-slate-300">
                  {questions[currentQuestion].en.split('___')[0]}
                  <span className="inline-block border-b-2 border-slate-400 min-w-[100px] text-yellow-400 font-bold px-2">
                    {userAnswer || "?"}
                  </span>
                  {questions[currentQuestion].en.split('___')[1]}
                </p>
              </div>

              <p className="text-sm text-slate-500 text-center italic">({questions[currentQuestion].meaning})</p>
            </div>

            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !waitingForNext && checkLevel4Answer()}
              placeholder="Escribe el verbo en inglés..."
              disabled={waitingForNext}
              className="w-full bg-slate-700 p-4 rounded-xl text-center text-xl mb-4 outline-none focus:ring-2 ring-red-500"
            />

            {!waitingForNext && (
              <button
                onClick={checkLevel4Answer}
                disabled={!userAnswer}
                className="w-full bg-red-600 hover:bg-red-500 p-4 rounded-xl font-bold transition disabled:opacity-50"
              >
                Completar
              </button>
            )}
          </div>
        )}

        {feedback && (
          <div className={`mt-6 p-6 rounded-xl flex flex-col md:flex-row items-center gap-4 ${feedback.includes('✅') ? 'bg-green-900/40 border border-green-500/50' : 'bg-red-900/40 border border-red-500/50'}`}>
            <div className="flex-1 text-center md:text-left font-medium text-lg">
              {feedback}
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="flex-1 md:flex-none bg-slate-800 p-3 rounded-lg hover:bg-slate-700 disabled:opacity-50 transition"
              >
                <ChevronLeft />
              </button>
              <button
                onClick={handleNext}
                className="flex-1 md:flex-none bg-white text-slate-900 px-6 py-3 rounded-lg font-bold hover:bg-slate-200 transition flex items-center justify-center gap-2"
              >
                Siguiente <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}

        {stage === 'results' && (
          <div className="bg-slate-800 rounded-2xl p-10 text-center shadow-2xl border border-slate-700">
            <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-6" />
            <h2 className="text-4xl font-bold mb-2">¡Desafío Completado!</h2>
            <p className="text-slate-400 mb-8">Veamos cómo están tus espejos mentales</p>

            <div className="grid grid-cols-2 gap-6 max-w-md mx-auto mb-8">
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-700">
                <div className="text-4xl font-bold text-blue-400 mb-1">{accuracy}%</div>
                <div className="text-xs text-slate-400 uppercase tracking-widest">Precisión</div>
              </div>
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-700">
                <div className="text-4xl font-bold text-emerald-400 mb-1">{score}</div>
                <div className="text-xs text-slate-400 uppercase tracking-widest">Aciertos</div>
              </div>
            </div>

            <div className="mb-8">
              {accuracy === 100 ? (
                <p className="text-yellow-300 font-bold text-xl">🏆 ¡PERFECTO! Tu Palacio AAA es indestructible.</p>
              ) : accuracy >= 80 ? (
                <p className="text-emerald-300 font-bold text-xl">🌟 ¡Excelente! Casi dominas el piso espejo.</p>
              ) : (
                <p className="text-slate-300 text-xl">🔧 Sigue practicando. Usa la visualización absurda.</p>
              )}
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <button
                onClick={() => setStage('menu')}
                className="bg-slate-700 hover:bg-slate-600 px-8 py-3 rounded-xl font-bold transition"
              >
                Volver al Menú
              </button>
              <button
                onClick={() => initLevel('level1')}
                className="bg-blue-600 hover:bg-blue-500 px-8 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2"
              >
                <RefreshCw size={20} /> Intentar de nuevo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
