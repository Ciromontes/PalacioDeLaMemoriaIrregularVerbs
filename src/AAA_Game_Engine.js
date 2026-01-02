import React, { useEffect, useRef, useState } from 'react';
import { Check, X, RefreshCw, Sparkles, ChevronRight, ChevronLeft, Eye, Brain, Trophy, Lightbulb, ArrowLeft } from 'lucide-react';

import { isSpeechSupported, speakEnglishBlock, speakEnglishTriplet, stopSpeech, warmUpVoices } from './speech';
import { formatIPA } from './ipa';
import { spanishMeaningsFor } from './meanings';
import { buildLevel2WritingHint } from './hints';

// --- DATA: LOS 28 VERBOS AAA EXACTAMENTE COMO EN EL PDF ---
const verbsAAA = [
  { en: "bet", es: "apostar", image: "El gatito apila monedas de chocolate en una mesa de póker, mientras un perro gigante apuesta huesos de oro. El gatito mira sus monedas con duda." },
  { en: "bid", es: "pujar/ofrecer/subastar", image: "El gatito, con megáfono, subasta un ovillo de lana a ratones. Los ratones ofrecen quesos, y el gatito ríe al aceptar el mejor." },
  { en: "broadcast", es: "transmitir", image: "El gatito habla por una radio de cristal. Su ronroneo se convierte en música que resuena en los espejos." },
  { en: "burst", es: "estallar", image: "El gatito salta sobre un globo de espejo. Al reventar, los fragmentos reflejan su cara asombrada." },
  { en: "cast", es: "lanzar (papel)", image: "Un director lanza guiones a actores robots. El gatito intenta atrapar uno, pero el guion lo envuelve como un abanico." },
  { en: "cost", es: "costar", image: "Una etiqueta de precio con patitas persigue al gatito, que intenta esconderse tras un espejo. La etiqueta marca \"1 abrazo\"." },
  { en: "cut", es: "cortar", image: "El gatito corta un papel de seda con una uña. El corte se refleja infinitamente en los espejos, creando un laberinto de líneas." },
  { en: "fit", es: "encajar", image: "El gatito se mete en una caja de música. Su cola esponjosa asoma, y la caja suena una melodía al cerrarse." },
  { en: "forecast", es: "pronosticar", image: "Un meteorólogo dibuja nubes en el cielo. El gatito, asustado, abre una sombrilla que refleja tormentas de pelusa." },
  { en: "hit", es: "golpear", image: "El gatito golpea una campana de cristal con un guante de boxeo. El sonido hace vibrar todos los espejos, que repiten el \"ding\"." },
  { en: "hurt", es: "herir/doler", image: "El gatito se pincha con un cactus de cristal. Sus lágrimas, al caer, se convierten en diamantes que ruedan por el suelo." },
  { en: "input", es: "introducir", image: "El gatito introduce galletas en una ranura de un \"teclado\" de espejos. Los espejos escupen migajas que forman palabras." },
  { en: "knit", es: "tejer", image: "El gatito teje un suéter con agujas de cristal, pero termina enredado en su propia lana, convertido en un ovillo viviente." },
  { en: "let", es: "permitir", image: "Un semáforo de cristal sonríe y cambia a verde para el gatito, que cruza con una flor en la boca. Todos los reflejos repiten su paso." },
  { en: "output", es: "producir/salir", image: "El gatito saca pelotas de hilo de una impresora de espejos. Las pelotas rebotan y dejan estelas de colores en el aire." },
  { en: "put", es: "poner", image: "El gatito coloca coronas de flores en estatuas de cristal. Las estatuas cobran vida, sonríen y le agradecen con un guiño." },
  { en: "quit", es: "renunciar", image: "Un empleado tira papeles al aire y sale volando en un cohete. El gatito recoge los papeles y los guarda en su mochila, como tesoros." },
  { en: "read", es: "leer", image: "Un libro de espejos lee en voz alta los pensamientos del gatito. Él se sonroja y tapa el libro con la pata." },
  { en: "rid", es: "librar", image: "El gatito usa un secador para soplar pelusas de su pelaje. Las pelusas se convierten en estrellas al caer, iluminando la sala." },
  { en: "set", es: "colocar/fijar", image: "El gatito coloca una taza de té en una mesa flotante al revés. El té forma un remolino dentro de la taza, desafiando la gravedad." },
  { en: "shed", es: "desprender", image: "Un árbol mecánico se sacude y desprende hojas de metal que suenan como campanas." },
  { en: "shut", es: "cerrar", image: "Un hombre sierra una puerta de cristal para evitar que entre un león. El gatito ayuda empujando la puerta, con los ojos como platos." },
  { en: "slit", es: "rajar", image: "El gatito corta un papel de seda con una uña. El corte se multiplica en los espejos, creando un túnel de papel picado." },
  { en: "spread", es: "esparcir", image: "Un cuchillo unta mantequilla en el suelo. El gatito, sorprendido, resbala y termina sentado en un charco de mantequilla brillante." },
  { en: "sweat", es: "sudar", image: "El gatito ve una fuente-persona sudando. Las gotas caen sobre él, y al sacudirse, su pelaje esparce destellos de agua." },
  { en: "thrust", es: "empujar", image: "El gatito empuja un carrito de helados de cristal. El carrito avanza lentamente, dejando un rastro de copos de azúcar." },
  { en: "upset", es: "molestar", image: "Un helado gigante se derrite sobre un escritorio, arruinando papeles. El gatito mete la patita en el charco, y el helado le lame los dedos." },
  { en: "wet", es: "mojar", image: "Una nube personal llueve solo sobre el gatito, que extiende las patitas para atrapar las gotas con la lengua. Al caer, las gotas forman charcos que reflejan peces de colores nadando. El gatito intenta pescar uno con la pata." }
];

function getAAAPalaceImageUrl(verbBase) {
  const base = String(verbBase ?? '').trim().toLowerCase();
  if (!base) return '';

  const publicBase = String(process.env.PUBLIC_URL ?? '').trim();
  // If PUBLIC_URL is empty, prefer relative paths so hosting under a subpath still works.
  const prefix = publicBase ? `${publicBase.replace(/\/$/, '')}/` : '';

  // Files can be case-sensitive in production (Linux). We'll try an uppercase default.
  // Special-case forecast because older assets used lowercase.
  const fileName = base === 'forecast' ? 'forecast.webp' : `${base.toUpperCase()}.webp`;
  return `${prefix}img/AAA/${fileName}`;
}

function getAAAPalaceImageFallbackUrl(verbBase) {
  const base = String(verbBase ?? '').trim().toLowerCase();
  if (!base) return '';

  const publicBase = String(process.env.PUBLIC_URL ?? '').trim();
  const prefix = publicBase ? `${publicBase.replace(/\/$/, '')}/` : '';

  // Secondary attempt: alternate casing.
  const fileName = base === 'forecast' ? 'FORECAST.webp' : `${base}.webp`;
  return `${prefix}img/AAA/${fileName}`;
}

const intruderVerbs = [
  // Pool grande y variado (de otros pisos) para que no se repitan siempre los mismos.
  // Nota: aquí solo ponemos verbos NO-AAA.
  { en: 'come', es: 'venir', pattern: 'ABA' },
  { en: 'came', es: 'venir', pattern: 'ABA' },
  { en: 'run', es: 'correr', pattern: 'ABA' },
  { en: 'ran', es: 'correr', pattern: 'ABA' },
  { en: 'become', es: 'convertirse', pattern: 'ABA' },
  { en: 'became', es: 'convertirse', pattern: 'ABA' },
  { en: 'overcome', es: 'superar', pattern: 'ABA' },
  { en: 'overcame', es: 'superar', pattern: 'ABA' },

  { en: 'build', es: 'construir', pattern: 'ABB' },
  { en: 'built', es: 'construir', pattern: 'ABB' },
  { en: 'keep', es: 'mantener', pattern: 'ABB' },
  { en: 'kept', es: 'mantener', pattern: 'ABB' },
  { en: 'leave', es: 'salir/dejar', pattern: 'ABB' },
  { en: 'left', es: 'salir/dejar', pattern: 'ABB' },
  { en: 'buy', es: 'comprar', pattern: 'ABB' },
  { en: 'bought', es: 'comprar', pattern: 'ABB' },
  { en: 'teach', es: 'enseñar', pattern: 'ABB' },
  { en: 'taught', es: 'enseñar', pattern: 'ABB' },
  { en: 'think', es: 'pensar', pattern: 'ABB' },
  { en: 'thought', es: 'pensar', pattern: 'ABB' },

  { en: 'begin', es: 'empezar', pattern: 'ABC' },
  { en: 'began', es: 'empezar', pattern: 'ABC' },
  { en: 'begun', es: 'empezar', pattern: 'ABC' },
  { en: 'drink', es: 'beber', pattern: 'ABC' },
  { en: 'drank', es: 'beber', pattern: 'ABC' },
  { en: 'drunk', es: 'beber', pattern: 'ABC' },
  { en: 'sing', es: 'cantar', pattern: 'ABC' },
  { en: 'sang', es: 'cantar', pattern: 'ABC' },
  { en: 'sung', es: 'cantar', pattern: 'ABC' },
  { en: 'write', es: 'escribir', pattern: 'ABC' },
  { en: 'wrote', es: 'escribir', pattern: 'ABC' },
  { en: 'written', es: 'escribir', pattern: 'ABC' },
  { en: 'go', es: 'ir', pattern: 'ABC' },
  { en: 'went', es: 'ir', pattern: 'ABC' },
  { en: 'gone', es: 'ir', pattern: 'ABC' },
  { en: 'take', es: 'tomar', pattern: 'ABC' },
  { en: 'took', es: 'tomar', pattern: 'ABC' },
  { en: 'taken', es: 'tomar', pattern: 'ABC' },
];

function fillBlank(sentence, word) {
  return String(sentence ?? '').replace('___', String(word ?? ''));
}

function getContextTemplatesAAA() {
  // Retroalimentación: 3 tiempos (presente / pasado / present perfect) con EN+ES.
  // Nota: En AAA el verbo no cambia, pero igual mostramos 3 ejemplos completos.
  return {
    bet: {
      present: { en: 'I ___ on my team when the pressure is high.', esFull: 'Apuesto por mi equipo cuando hay presión.' },
      past: { en: 'Yesterday I ___ on the underdog for fun.', esFull: 'Ayer aposté por el menos favorito por diversión.' },
      perf: { en: 'This season I have ___ only small amounts.', esFull: 'Esta temporada he apostado solo cantidades pequeñas.' },
    },
    bid: {
      present: { en: 'I ___ on rare books online.', esFull: 'Pujo por libros raros en línea.' },
      past: { en: 'Yesterday I ___ $100 at the auction.', esFull: 'Ayer ofrecí $100 en la subasta.' },
      perf: { en: 'This week I have ___ several times for the same item.', esFull: 'Esta semana he pujado varias veces por el mismo artículo.' },
    },
    broadcast: {
      present: { en: 'The station ___ the news every morning.', esFull: 'La emisora transmite las noticias cada mañana.' },
      past: { en: 'Yesterday they ___ the match live.', esFull: 'Ayer transmitieron el partido en vivo.' },
      perf: { en: 'They have ___ updates all day.', esFull: 'Han transmitido actualizaciones todo el día.' },
    },
    burst: {
      present: { en: 'Some balloons ___ in the heat.', esFull: 'Algunos globos estallan con el calor.' },
      past: { en: 'The balloon ___ suddenly during the party.', esFull: 'El globo estalló de repente durante la fiesta.' },
      perf: { en: 'The pipe has ___ and we shut the water off.', esFull: 'La tubería ha reventado y cerramos el agua.' },
    },
    cast: {
      present: { en: 'The director ___ new actors for each project.', esFull: 'El director selecciona nuevos actores para cada proyecto.' },
      past: { en: 'They ___ her in the lead role.', esFull: 'La eligieron para el papel principal.' },
      perf: { en: 'They have ___ several new actors this month.', esFull: 'Este mes han seleccionado a varios actores nuevos.' },
    },
    cost: {
      present: { en: 'This course ___ less than the advanced one.', esFull: 'Este curso cuesta menos que el avanzado.' },
      past: { en: 'The repair ___ more than expected.', esFull: 'La reparación costó más de lo esperado.' },
      perf: { en: 'It has ___ us a lot of time to fix.', esFull: 'Nos ha costado mucho tiempo arreglarlo.' },
    },
    cut: {
      present: { en: 'I sometimes ___ my finger with paper.', esFull: 'A veces me corto el dedo con papel.' },
      past: { en: 'Yesterday I ___ my finger while cooking.', esFull: 'Ayer me corté el dedo mientras cocinaba.' },
      perf: { en: 'We have ___ the budget by 10%.', esFull: 'Hemos recortado el presupuesto un 10%.' },
    },
    fit: {
      present: { en: 'This key ___ the lock perfectly.', esFull: 'Esta llave encaja perfectamente en la cerradura.' },
      past: { en: 'The suit ___ me perfectly.', esFull: 'El traje me quedó perfecto.' },
      perf: { en: 'All the data has ___ on one page.', esFull: 'Todos los datos han cabido en una sola página.' },
    },
    forecast: {
      present: { en: 'They ___ rain for tomorrow.', esFull: 'Pronostican lluvia para mañana.' },
      past: { en: 'Yesterday they ___ strong winds.', esFull: 'Ayer pronosticaron vientos fuertes.' },
      perf: { en: 'They have ___ a colder week ahead.', esFull: 'Han pronosticado una semana más fría.' },
    },
    hit: {
      present: { en: 'Sales often ___ a peak in December.', esFull: 'Las ventas suelen alcanzar un pico en diciembre.' },
      past: { en: 'Yesterday the ball ___ the window.', esFull: 'Ayer la pelota golpeó la ventana.' },
      perf: { en: 'The team has ___ its target this quarter.', esFull: 'El equipo ha alcanzado su meta este trimestre.' },
    },
    hurt: {
      present: { en: 'My back ___ if I sit too long.', esFull: 'Me duele la espalda si me siento demasiado tiempo.' },
      past: { en: 'Yesterday my knee ___ after the run.', esFull: 'Ayer me dolió la rodilla después de correr.' },
      perf: { en: 'That comment has ___ his feelings.', esFull: 'Ese comentario ha herido sus sentimientos.' },
    },
    input: {
      present: { en: 'I ___ the data into the system every day.', esFull: 'Introduzco los datos en el sistema todos los días.' },
      past: { en: 'Yesterday I ___ the new values manually.', esFull: 'Ayer introduje los nuevos valores manualmente.' },
      perf: { en: 'We have ___ all records for the month.', esFull: 'Hemos ingresado todos los registros del mes.' },
    },
    knit: {
      present: { en: 'She ___ a scarf in the evenings.', esFull: 'Ella teje una bufanda por las noches.' },
      past: { en: 'My grandmother ___ a sweater for me.', esFull: 'Mi abuela tejió un suéter para mí.' },
      perf: { en: 'She has ___ three hats this winter.', esFull: 'Este invierno ha tejido tres gorros.' },
    },
    let: {
      present: { en: 'My manager ___ me work from home on Fridays.', esFull: 'Mi jefe me permite trabajar desde casa los viernes.' },
      past: { en: 'Yesterday they ___ us leave early.', esFull: 'Ayer nos dejaron salir temprano.' },
      perf: { en: 'They have ___ us use the lab for practice.', esFull: 'Nos han dejado usar el laboratorio para practicar.' },
    },
    output: {
      present: { en: 'The machine ___ 100 units per hour.', esFull: 'La máquina produce 100 unidades por hora.' },
      past: { en: 'Yesterday it ___ a complete report.', esFull: 'Ayer produjo un informe completo.' },
      perf: { en: 'It has ___ consistent results all week.', esFull: 'Ha producido resultados consistentes toda la semana.' },
    },
    put: {
      present: { en: 'I ___ my phone on silent during meetings.', esFull: 'Pongo el teléfono en silencio durante las reuniones.' },
      past: { en: 'Yesterday I ___ the keys on the table.', esFull: 'Ayer puse las llaves en la mesa.' },
      perf: { en: 'I have ___ the documents in the folder.', esFull: 'He puesto los documentos en la carpeta.' },
    },
    quit: {
      present: { en: 'Some people ___ when things get hard.', esFull: 'Algunas personas renuncian cuando las cosas se complican.' },
      past: { en: 'He ___ his job last week.', esFull: 'Él renunció a su trabajo la semana pasada.' },
      perf: { en: 'She has ___ smoking.', esFull: 'Ella ha dejado de fumar.' },
    },
    read: {
      present: { en: 'I ___ emails every morning.', esFull: 'Leo correos cada mañana.' },
      past: { en: 'Yesterday I ___ a fascinating book.', esFull: 'Ayer leí un libro fascinante.' },
      perf: { en: 'I have ___ the instructions twice.', esFull: 'He leído las instrucciones dos veces.' },
    },
    rid: {
      present: { en: 'We ___ the garden of weeds every spring.', esFull: 'Nos libramos de las malas hierbas cada primavera.' },
      past: { en: 'Yesterday we ___ the house of old boxes.', esFull: 'Ayer nos deshicimos de cajas viejas en la casa.' },
      perf: { en: 'We have ___ ourselves of distractions during study time.', esFull: 'Nos hemos librado de distracciones durante el tiempo de estudio.' },
    },
    set: {
      present: { en: 'I ___ clear goals for the week.', esFull: 'Fijo metas claras para la semana.' },
      past: { en: 'Yesterday we ___ the table for dinner.', esFull: 'Ayer pusimos la mesa para la cena.' },
      perf: { en: 'We have ___ a deadline for Friday.', esFull: 'Hemos fijado una fecha límite para el viernes.' },
    },
    shed: {
      present: { en: 'Trees ___ leaves in autumn.', esFull: 'Los árboles pierden hojas en otoño.' },
      past: { en: 'The dog ___ a lot of hair yesterday.', esFull: 'El perro mudó mucho pelo ayer.' },
      perf: { en: 'The company has ___ staff this year.', esFull: 'La empresa ha reducido personal este año.' },
    },
    shut: {
      present: { en: 'Please ___ the door quietly.', esFull: 'Por favor, cierra la puerta con cuidado.' },
      past: { en: 'She ___ the door hard last night.', esFull: 'Ella cerró la puerta con fuerza anoche.' },
      perf: { en: 'I have ___ the window to block the noise.', esFull: 'He cerrado la ventana para bloquear el ruido.' },
    },
    slit: {
      present: { en: 'This tool can ___ plastic easily.', esFull: 'Esta herramienta puede rajar el plástico fácilmente.' },
      past: { en: 'The ninja ___ the fabric silently.', esFull: 'El ninja rajó la tela en silencio.' },
      perf: { en: 'Someone has ___ the envelope open.', esFull: 'Alguien ha rajado el sobre.' },
    },
    spread: {
      present: { en: 'I ___ butter on the bread.', esFull: 'Unto mantequilla en el pan.' },
      past: { en: 'Yesterday I ___ the map on the table.', esFull: 'Ayer extendí el mapa sobre la mesa.' },
      perf: { en: 'The news has ___ quickly online.', esFull: 'La noticia se ha difundido rápidamente en línea.' },
    },
    sweat: {
      present: { en: 'I ___ a lot during exercise.', esFull: 'Sudo mucho durante el ejercicio.' },
      past: { en: 'Yesterday I ___ a lot at the gym.', esFull: 'Ayer sudé mucho en el gimnasio.' },
      perf: { en: 'I have ___ through my shirt today.', esFull: 'Hoy he sudado hasta empapar la camiseta.' },
    },
    thrust: {
      present: { en: 'The engine ___ the rocket forward.', esFull: 'El motor impulsa el cohete hacia adelante.' },
      past: { en: 'The rocket ___ forward at launch.', esFull: 'El cohete se impulsó hacia adelante al despegar.' },
      perf: { en: 'The crowd has ___ him to the front.', esFull: 'La multitud lo ha empujado hacia el frente.' },
    },
    upset: {
      present: { en: 'Loud noise ___ my dog.', esFull: 'El ruido fuerte molesta a mi perro.' },
      past: { en: 'The news ___ everyone.', esFull: 'La noticia molestó a todos.' },
      perf: { en: 'The delay has ___ our plans.', esFull: 'El retraso ha trastornado nuestros planes.' },
    },
    wet: {
      present: { en: 'Rain can ___ the floor and make it slippery.', esFull: 'La lluvia puede mojar el piso y volverlo resbaloso.' },
      past: { en: 'The rain ___ the hanging clothes.', esFull: 'La lluvia mojó la ropa tendida.' },
      perf: { en: 'The storm has ___ the streets.', esFull: 'La tormenta ha mojado las calles.' },
    },
  };
}

function buildContextQuestionsAAA() {
  const templates = getContextTemplatesAAA();
  return verbsAAA.flatMap((v) => {
    const base = v.en;
    const tpl = templates?.[base];

    const present = tpl?.present ?? { en: 'I ___ every day.', esFull: 'Lo hago todos los días.' };
    const past = tpl?.past ?? { en: 'Yesterday I ___.', esFull: 'Ayer lo hice.' };
    const perf = tpl?.perf ?? { en: 'This week I have ___.', esFull: 'Esta semana lo he hecho.' };

    return [
      { verb: base, meaning: v.es, label: 'Presente', esFull: present.esFull, en: present.en, answer: base },
      { verb: base, meaning: v.es, label: 'Pasado', esFull: past.esFull, en: past.en, answer: base },
      { verb: base, meaning: v.es, label: 'Participio (Present Perfect)', esFull: perf.esFull, en: perf.en, answer: base },
    ];
  });
}

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

export default function AAA_Game_Engine({ onExit, onViewGallery }) {
  const [stage, setStage] = useState('menu');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [points, setPoints] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [feedbackDetails, setFeedbackDetails] = useState(null);
  const [showFeedbackDetails, setShowFeedbackDetails] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [selectedIntruders, setSelectedIntruders] = useState([]);
  const [hintLevel2, setHintLevel2] = useState(0); // 0 none | 1 first | 2 first+second | 3 first+second+last
  const [hintLevel4, setHintLevel4] = useState(0); // 0 none | 1 first letter | 2 spaced pattern | 3 tight pattern
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [waitingForNext, setWaitingForNext] = useState(false);
  const [palaceView, setPalaceView] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [palaceImageError, setPalaceImageError] = useState(false);
  const [palaceImageVariant, setPalaceImageVariant] = useState('primary');
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);
  const touchStartXRef = useRef(null);

  const speechAvailable = isSpeechSupported();

  useEffect(() => {
    warmUpVoices();
    return () => stopSpeech();
  }, []);

  useEffect(() => {
    const mq = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(pointer: coarse)')
      : null;

    const update = () => setIsCoarsePointer(Boolean(mq ? mq.matches : false));
    update();

    if (!mq) return;
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', update);
      return () => mq.removeEventListener('change', update);
    }
    // Fallback for older browsers
    mq.addListener(update);
    return () => mq.removeListener(update);
  }, []);

  const goPalacePrev = () => {
    stopSpeech();
    setPalaceImageError(false);
    setPalaceImageVariant('primary');
    setPalaceView((prev) => (prev - 1 + verbsAAA.length) % verbsAAA.length);
  };

  const goPalaceNext = () => {
    stopSpeech();
    setPalaceImageError(false);
    setPalaceImageVariant('primary');
    setPalaceView((prev) => (prev + 1) % verbsAAA.length);
  };

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
      const aaaVerbs = shuffle(verbsAAA).slice(0, 3).map((v) => ({ ...v, pattern: 'AAA' }));
      const pickedIntruders = shuffle(intruderVerbs).slice(0, 2);
      const mixed = shuffle([...aaaVerbs, ...pickedIntruders]);
      rounds.push({ verbs: mixed, intruders: pickedIntruders.map(v => v.en) });
    }
    return rounds;
  };

  const generateLevel4Questions = () => {
    return shuffle(buildContextQuestionsAAA()).slice(0, 6);
  };

  const initLevel = (level) => {
    setStage(level);
    setCurrentQuestion(0);
    setScore(0);
    setPoints(0);
    setTotalAnswered(0);
    setFeedback('');
    setFeedbackDetails(null);
    setShowFeedbackDetails(false);
    setWaitingForNext(false);
    setUserAnswer('');
    setSelectedIntruders([]);
    setHintLevel2(0);
    setSelectedAnswer(null);
    setHintLevel4(0);

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
      setPoints((prev) => prev + 1);
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
      setPoints((prev) => prev + 1);
      setFeedback(`✅ ¡Correcto! "${q.es}" es ${q.en}. (AAA: ${q.en} - ${q.en} - ${q.en})`);
    } else {
      setFeedback(`❌ La respuesta es "${q.en}". En el espejo todo se ve igual.`);
    }
    setHintLevel2(0);
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
      setPoints((prev) => prev + 1);
      setFeedback(`✅ ¡Excelente! Sacaste a los intrusos del Palacio de Espejos.`);
    } else {
      const missing = correctIntruders.filter(x => !userIntruders.includes(x));
      setFeedback(`❌ Te faltó identificar: ${missing.join(', ')}. Recuerda, solo los AAA se quedan.`);
    }
    setWaitingForNext(true);
  };

  const checkLevel4Answer = () => {
    const q = questions[currentQuestion];
    const isCorrect = userAnswer.toLowerCase().trim() === q.answer;
    setTotalAnswered(prev => prev + 1);

    const earnedPoints = isCorrect ? pointsForHintLevel(hintLevel4) : 0;

    const templates = getContextTemplatesAAA();
    const tpl = templates?.[q.verb] ?? null;
    const present = tpl?.present ?? { en: 'I ___ every day.', esFull: 'Lo hago todos los días.' };
    const past = tpl?.past ?? { en: 'Yesterday I ___.', esFull: 'Ayer lo hice.' };
    const perf = tpl?.perf ?? { en: 'This week I have ___.', esFull: 'Esta semana lo he hecho.' };

    setFeedbackDetails({
      present: { en: fillBlank(present.en, q.verb), es: present.esFull },
      past: { en: fillBlank(past.en, q.verb), es: past.esFull },
      perf: { en: fillBlank(perf.en, q.verb), es: perf.esFull },
      forms: { base: q.verb, past: q.verb, participle: q.verb },
    });
    setShowFeedbackDetails(false);

    const hintSummary = hintLevel4 > 0 ? ` (pistas usadas: ${hintLevel4}, puntos: ${earnedPoints.toFixed(1)}/1.0)` : '';

    if (isCorrect) {
      setScore(prev => prev + 1);
      setPoints((prev) => prev + earnedPoints);
      setFeedback(`✅ ¡Perfecto! "${q.verb}" es AAA, así que no cambia.${hintSummary}`);
    } else {
      setFeedback(`❌ Incorrecto. Era "${q.verb}". Al ser AAA, no cambia.${hintSummary}`);
    }
    setWaitingForNext(true);
  };

  const handleNext = () => {
    stopSpeech();
    setFeedback('');
    setFeedbackDetails(null);
    setShowFeedbackDetails(false);
    setWaitingForNext(false);
    setUserAnswer('');
    setSelectedIntruders([]);
    setHintLevel2(0);
    setSelectedAnswer(null);
    setHintLevel4(0);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setStage('results');
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      stopSpeech();
      setCurrentQuestion(prev => prev - 1);
      setFeedback('');
      setFeedbackDetails(null);
      setShowFeedbackDetails(false);
      setWaitingForNext(false);
      setUserAnswer('');
      setSelectedIntruders([]);
      setHintLevel2(0);
      setSelectedAnswer(null);
      setHintLevel4(0);
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
              Piso 1: Palacio de los Espejos
          </h1>
          <p className="text-slate-400 text-lg">Donde los verbos nunca cambian (AAA) - 28 Verbos</p>
        </div>

        {stage !== 'menu' && stage !== 'palace' && stage !== 'results' && (
          <div className="mb-6 bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-700">
            <div className="flex justify-between text-sm mb-2 font-mono text-blue-200">
              <span>Progreso: {currentQuestion + 1} / {questions.length}</span>
              <span>Aciertos: {score} | Puntos: {points.toFixed(1)}</span>
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
          <div className="bg-slate-800 rounded-2xl p-4 md:p-8 border border-slate-700 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-emerald-400">Galería Mental</h2>
              <button onClick={() => setStage('menu')} className="text-sm bg-slate-900 px-3 py-1 rounded hover:bg-slate-700 transition">Volver</button>
            </div>

            {isCoarsePointer && (
              <div className="mb-4 bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-slate-200 flex items-center gap-2">
                <span className="font-bold">Desliza</span>
                <span className="text-slate-400">hacia la izquierda</span>
                <ChevronLeft className="w-5 h-5" />
                <span className="text-slate-400">para avanzar</span>
              </div>
            )}

            <div className="bg-slate-900/50 p-4 md:p-8 rounded-xl text-center mb-6 min-h-[200px] flex flex-col justify-center items-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>

              <h3 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-wider">{verbsAAA[palaceView].en.toUpperCase()}</h3>
              <div className="text-slate-400 -mt-1 mb-2 font-mono text-sm">{formatIPA(verbsAAA[palaceView].en)}</div>
              <p className="text-lg md:text-xl text-blue-300 mb-4 md:mb-6 font-serif italic">"{verbsAAA[palaceView].es}"</p>

              <div className="w-full max-w-4xl mb-4 md:mb-6">
                <div
                  className="relative w-full"
                  onTouchStart={(e) => {
                    const x = e.touches?.[0]?.clientX;
                    touchStartXRef.current = typeof x === 'number' ? x : null;
                  }}
                  onTouchEnd={(e) => {
                    const startX = touchStartXRef.current;
                    touchStartXRef.current = null;
                    if (typeof startX !== 'number') return;

                    const endX = e.changedTouches?.[0]?.clientX;
                    if (typeof endX !== 'number') return;

                    const delta = endX - startX;
                    const threshold = 50;
                    if (Math.abs(delta) < threshold) return;

                    // Swipe left => next (ascendente)
                    if (delta < 0) goPalaceNext();
                    else goPalacePrev();
                  }}
                >
                  <button
                    type="button"
                    onClick={goPalacePrev}
                    aria-label="Anterior"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-slate-700/80 p-3 md:p-4 rounded-full hover:bg-blue-600 transition z-10"
                  >
                    <ChevronLeft />
                  </button>

                  {!palaceImageError ? (
                    <img
                      key={`${verbsAAA[palaceView].en}-${palaceImageVariant}`}
                      src={
                        palaceImageVariant === 'primary'
                          ? getAAAPalaceImageUrl(verbsAAA[palaceView].en)
                          : getAAAPalaceImageFallbackUrl(verbsAAA[palaceView].en)
                      }
                      alt={verbsAAA[palaceView].en}
                      loading="lazy"
                      onClick={() => {
                        if (!speechAvailable) return;
                        speakEnglishTriplet(verbsAAA[palaceView].en);
                      }}
                      onKeyDown={(e) => {
                        if (!speechAvailable) return;
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          speakEnglishTriplet(verbsAAA[palaceView].en);
                        }
                      }}
                      role={speechAvailable ? 'button' : undefined}
                      tabIndex={speechAvailable ? 0 : undefined}
                      onError={() => {
                        if (palaceImageVariant === 'primary') {
                          setPalaceImageVariant('fallback');
                        } else {
                          setPalaceImageError(true);
                        }
                      }}
                      className={`w-full h-[55vh] md:h-[420px] rounded-2xl border border-slate-700 shadow-xl bg-slate-950/30 object-contain ${speechAvailable ? 'cursor-pointer' : ''}`}
                    />
                  ) : (
                    <div className="w-full h-[55vh] md:h-[420px] rounded-2xl border border-slate-700 bg-slate-950/30 flex items-center justify-center text-slate-300">
                      No se pudo cargar la imagen para <span className="font-mono ml-2">{verbsAAA[palaceView].en}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={goPalaceNext}
                    aria-label="Siguiente"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-700/80 p-3 md:p-4 rounded-full hover:bg-blue-600 transition z-10"
                  >
                    <ChevronRight />
                  </button>
                </div>

                <div className="mt-3 font-mono text-slate-500">{palaceView + 1} / {verbsAAA.length}</div>
              </div>

              <div className="bg-slate-800 p-4 rounded-lg w-full max-w-3xl border border-slate-600">
                <p className="text-yellow-100 text-base md:text-lg leading-relaxed">
                  👁️ {verbsAAA[palaceView].image}
                </p>
              </div>
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
                <button
                  type="button"
                  onClick={() => setHintLevel2((v) => Math.min(3, v + 1))}
                  disabled={hintLevel2 >= 3}
                  className="text-slate-400 hover:text-white text-sm underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {hintLevel2 > 0 ? `Pista ${hintLevel2}/3` : 'Pista'}
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

            {!waitingForNext && hintLevel2 > 0 && (
              <div className="mt-4 text-slate-200 bg-slate-900/60 border border-slate-700 rounded-lg px-4 py-2 inline-block font-mono">
                {buildLevel2WritingHint(questions[currentQuestion].en, hintLevel2)}
              </div>
            )}

            {waitingForNext && (
              <div className="mt-6 bg-slate-900/50 p-5 rounded-xl border border-slate-700 text-left">
                <button
                  type="button"
                  onClick={() => {
                    if (!speechAvailable) return;
                    speakEnglishTriplet(questions[currentQuestion].en);
                  }}
                  className={`w-full text-left rounded-lg ${speechAvailable ? 'hover:bg-slate-800/70 transition cursor-pointer' : ''}`}
                >
                  <div className="text-slate-300 text-sm mb-2">Toca para escuchar: base → pasado → participio.</div>
                  <div className="text-xl font-black text-white">
                    {questions[currentQuestion].en} - {questions[currentQuestion].en} - {questions[currentQuestion].en}
                  </div>
                  <div className="text-slate-400 font-mono text-sm">{formatIPA(questions[currentQuestion].en)}</div>
                </button>

                <div className="mt-3 text-slate-200 text-sm">
                  Significados: <span className="text-slate-300">{spanishMeaningsFor(questions[currentQuestion].en, questions[currentQuestion].es).join(' / ')}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {stage === 'level3' && questions[currentQuestion] && (
          <div className="bg-slate-800 rounded-2xl p-8 shadow-2xl border border-slate-700">
            <div className="text-center mb-6">
              <h2 className="text-sm font-bold text-orange-400 tracking-widest uppercase mb-2">SEGURIDAD DEL PALACIO</h2>
              <p className="text-xl text-white">Revisa si hay intrusos.</p>
              <p className="text-slate-400 text-sm mt-1">Marca los verbos que <span className="text-red-400 font-bold">NO SON AAA</span>. Si no hay intrusos, confirma sin marcar nada.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {questions[currentQuestion].verbs.map((verb, idx) => {
                const selected = selectedIntruders.includes(verb.en);
                const isIntruder = questions[currentQuestion].intruders.includes(verb.en);
                const reveal = waitingForNext;

                const baseClass = selected
                  ? 'bg-red-900/50 border-2 border-red-500 text-white'
                  : 'bg-slate-700 hover:bg-slate-600 border-2 border-transparent';

                const revealClass = reveal
                  ? (selected && isIntruder
                      ? 'bg-green-900/40 border-2 border-green-500 text-white'
                      : selected && !isIntruder
                      ? 'bg-red-900/40 border-2 border-red-500 text-white'
                      : !selected && isIntruder
                      ? 'bg-amber-900/30 border-2 border-amber-500 text-white'
                      : 'bg-slate-700 border-2 border-slate-600 text-white')
                  : baseClass;

                return (
                <button
                  key={idx}
                  onClick={() => toggleIntruder(verb.en)}
                  disabled={waitingForNext}
                  className={`p-4 rounded-xl transition-all relative overflow-hidden ${revealClass}`}
                >
                  <span className="font-bold text-lg block">{verb.en}</span>
                  {waitingForNext && (
                    <>
                      <span className="text-xs text-slate-300 block">{verb.es}</span>
                      <span className="text-[11px] text-slate-400 font-mono block">Patrón: {verb.pattern}</span>
                    </>
                  )}
                  {selected && !waitingForNext && (
                    <div className="absolute top-2 right-2 text-red-500"><X size={16} /></div>
                  )}
                  {waitingForNext && (selected && isIntruder) && (
                    <div className="absolute top-2 right-2 text-green-400"><Check size={16} /></div>
                  )}
                  {waitingForNext && (selected && !isIntruder) && (
                    <div className="absolute top-2 right-2 text-red-400"><X size={16} /></div>
                  )}
                </button>
                );
              })}
            </div>

            {!waitingForNext && (
              <button
                onClick={checkIntruders}
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
                <div className="text-slate-300 text-sm mb-2">{questions[currentQuestion].label}</div>
                <p className="text-xl md:text-2xl leading-relaxed text-blue-200">ES: {questions[currentQuestion].esFull}</p>
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
              <div className="flex flex-col items-center gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setHintLevel4((prev) => Math.min(3, prev + 1))}
                  disabled={hintLevel4 >= 3}
                  className="text-slate-300 hover:text-white text-sm underline disabled:opacity-50"
                >
                  Pedir pista
                </button>
                {hintLevel4 > 0 && (
                  <div className="text-sm text-slate-200 bg-slate-900/60 border border-slate-700 rounded-lg px-4 py-2 text-center whitespace-pre-line">
                    {(() => {
                      const ans = (questions[currentQuestion].verb ?? '').trim();
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
                className="w-full bg-red-600 hover:bg-red-500 p-4 rounded-xl font-bold transition disabled:opacity-50"
              >
                Completar
              </button>
            )}

            {waitingForNext && feedback && (
              <div className={`mt-6 p-6 rounded-xl border ${feedback.includes('✅') ? 'bg-green-900/40 border-green-500/50' : 'bg-red-900/40 border-red-500/50'}`}>
                <div className="whitespace-pre-wrap font-medium text-lg">{feedback}</div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setShowFeedbackDetails((v) => !v)}
                    className="bg-slate-800 px-4 py-2 rounded-lg hover:bg-slate-700 transition font-bold"
                  >
                    {showFeedbackDetails ? 'Ocultar retroalimentación' : 'Ver retroalimentación'}
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="bg-white text-slate-900 px-6 py-2 rounded-lg font-bold hover:bg-slate-200 transition flex items-center justify-center gap-2"
                  >
                    Siguiente <ChevronRight size={20} />
                  </button>
                </div>

                {showFeedbackDetails && feedbackDetails && (
                  <div className="mt-4 bg-slate-900/40 border border-slate-700 rounded-xl p-4">
                    <div className="text-slate-200 font-bold mb-2">Retroalimentación (3 tiempos)</div>

                    {speechAvailable && (
                      <div className="mb-3">
                        <div className="text-slate-300 text-sm mb-2">Elige la frase que desees y tócala para escucharla en inglés.</div>
                        <div className="flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={stopSpeech}
                            className="bg-slate-800 px-4 py-2 rounded-lg hover:bg-slate-700 transition font-bold"
                          >
                            Detener
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      <div>
                        <div className="text-slate-300 text-sm font-bold">Presente</div>
                        {speechAvailable ? (
                          <button
                            type="button"
                            onClick={() => speakEnglishBlock([feedbackDetails.present.en])}
                            className="text-left text-white hover:text-blue-200 underline decoration-dotted"
                          >
                            EN: {feedbackDetails.present.en}
                          </button>
                        ) : (
                          <div className="text-white">EN: {feedbackDetails.present.en}</div>
                        )}
                        <div className="text-slate-200">ES: {feedbackDetails.present.es}</div>
                      </div>
                      <div>
                        <div className="text-slate-300 text-sm font-bold">Pasado</div>
                        {speechAvailable ? (
                          <button
                            type="button"
                            onClick={() => speakEnglishBlock([feedbackDetails.past.en])}
                            className="text-left text-white hover:text-blue-200 underline decoration-dotted"
                          >
                            EN: {feedbackDetails.past.en}
                          </button>
                        ) : (
                          <div className="text-white">EN: {feedbackDetails.past.en}</div>
                        )}
                        <div className="text-slate-200">ES: {feedbackDetails.past.es}</div>
                      </div>
                      <div>
                        <div className="text-slate-300 text-sm font-bold">Participio (Present Perfect)</div>
                        {speechAvailable ? (
                          <button
                            type="button"
                            onClick={() => speakEnglishBlock([feedbackDetails.perf.en])}
                            className="text-left text-white hover:text-blue-200 underline decoration-dotted"
                          >
                            EN: {feedbackDetails.perf.en}
                          </button>
                        ) : (
                          <div className="text-white">EN: {feedbackDetails.perf.en}</div>
                        )}
                        <div className="text-slate-200">ES: {feedbackDetails.perf.es}</div>
                      </div>
                      <div className="text-slate-400 text-sm font-mono">
                        Formas: {feedbackDetails.forms.base} — {feedbackDetails.forms.past} — {feedbackDetails.forms.participle}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {feedback && stage !== 'level4' && (
          <div className={`mt-6 p-6 rounded-xl flex flex-col md:flex-row items-center gap-4 ${feedback.includes('✅') ? 'bg-green-900/40 border border-green-500/50' : 'bg-red-900/40 border border-red-500/50'}`}>
            <div className="flex-1 text-center md:text-left font-medium text-lg">
              <div className="whitespace-pre-wrap">{feedback}</div>
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
                <div className="text-slate-300 text-sm mt-2">Puntos: <span className="font-mono">{points.toFixed(1)}</span></div>
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
