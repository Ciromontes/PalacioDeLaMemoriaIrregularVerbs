import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Brain,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  Lightbulb,
  RefreshCw,
  Sparkles,
  Trophy,
  X,
} from 'lucide-react';

// PISO 3: LA OFICINA DE LOS GEMELOS (Patrón ABB)
// Regla: El Pasado y el Participio son idénticos.
// Estrategia: Agrúpalos por sonido final para recordarlos mejor.

const groups = [
  {
    id: 'g1',
    title: 'Grupo 1: Los Explosivos (Terminan en T)',
    hint: 'Muchos terminan con sonido “t” (bent, built, burnt, ...).',
    verbs: [
      { base: 'bend', past: 'bent', participle: 'bent', es: 'Doblar', image: 'Un poste de luz se dobla para mirar un celula' },
      { base: 'build', past: 'built', participle: 'built', es: 'Construir', image: 'Castores con cascos construyen una presa de legos.' },
      { base: 'burn', past: 'burnt', participle: 'burnt', es: 'Quemar', image: 'Una tostadora lanza pan quemado al espacio.' },
      { base: 'creep', past: 'crept', participle: 'crept', es: 'Arrastrarse', image: 'Una planta crece rápido arrastrándose por la pared.' },
      { base: 'deal', past: 'dealt', participle: 'dealt', es: 'Tratar/Repartir', image: 'Un robot reparte cartas que son rebanadas de pizza.' },
      { base: 'dream', past: 'dreamt', participle: 'dreamt', es: 'Soñar', image: 'Una nube de pensamiento sólida flota sobre tu cabeza.' },
      { base: 'feel', past: 'felt', participle: 'felt', es: 'Sentir', image: 'Un corazón de felpa gigante late fuerte.' },
      { base: 'keep', past: 'kept', participle: 'kept', es: 'Guardar', image: 'Una ardilla guarda nueces en una caja fuerte blindada.' },
      { base: 'leave', past: 'left', participle: 'left', es: 'Dejar/Salir', image: 'Unas botas caminan solas hacia la salida.' },
      { base: 'lend', past: 'lent', participle: 'lent', es: 'Prestar', image: 'Un banco presta paraguas de colores.' },
      { base: 'light', past: 'lit', participle: 'lit', es: 'Iluminar', image: 'Una bombilla con piernas ilumina el camino.' },
      { base: 'lose', past: 'lost', participle: 'lost', es: 'Perder', image: 'Un mapa se borra a sí mismo mientras lo miras.' },
      { base: 'mean', past: 'meant', participle: 'meant', es: 'Significar', image: 'Un diccionario habla y te explica cosas.' },
      { base: 'meet', past: 'met', participle: 'met', es: 'Encontrarse', image: 'Dos clones chocan las manos y hacen chispas.' },
      { base: 'send', past: 'sent', participle: 'sent', es: 'Enviar', image: 'Un buzón escupe cartas como ametralladora.' },
      { base: 'shoot', past: 'shot', participle: 'shot', es: 'Disparar', image: 'Una cámara de fotos dispara flashes que congelan gente.' },
      { base: 'sit', past: 'sat', participle: 'sat', es: 'Sentarse', image: 'Una silla corre debajo de ti justo antes de que caigas.' },
      { base: 'sleep', past: 'slept', participle: 'slept', es: 'Dormir', image: 'Una cama flotante te arrulla en el aire.' },
      { base: 'spend', past: 'spent', participle: 'spent', es: 'Gastar', image: 'Monedas de oro se evaporan al tocarlas.' },
      { base: 'sweep', past: 'swept', participle: 'swept', es: 'Barrer', image: 'Una escoba baila vals con el polvo.' },
      { base: 'weep', past: 'wept', participle: 'wept', es: 'Lloar', image: 'Una estatua llora fuentes de limonada.' },
    ],
  },
  {
    id: 'g2',
    title: 'Grupo 2: Los "GHT" (Sonido gutural)',
    hint: 'Terminaciones “-ought / -aught” (brought, bought, caught...).',
    verbs: [
      { base: 'bring', past: 'brought', participle: 'brought', es: 'Traer', image: 'Un perro trae un dinosaurio en la boca.' },
      { base: 'buy', past: 'bought', participle: 'bought', es: 'Comprar', image: 'Un carrito de compras se come tu dinero.' },
      { base: 'catch', past: 'caught', participle: 'caught', es: 'Atrapar', image: 'Un guante de béisbol gigante atrapa un meteorito.' },
      { base: 'fight', past: 'fought', participle: 'fought', es: 'Pelear', image: 'Dos almohadas luchan con espadas de espuma.' },
      { base: 'seek', past: 'sought', participle: 'sought', es: 'Buscar', image: 'Una lupa gigante busca huellas digitales en el aire.' },
      { base: 'teach', past: 'taught', participle: 'taught', es: 'Enseñar', image: 'Un búho con gafas escribe en una pizarra digital.' },
      { base: 'think', past: 'thought', participle: 'thought', es: 'Pensar', image: 'Una bombilla se enciende sobre tu cabeza y explota.' },
    ],
  },
  {
    id: 'g3',
    title: 'Grupo 3: Los "AID/AID" (Sonido Eid)',
    hint: 'Formas compactas con sonido “eid” (laid, paid, said).',
    verbs: [
      { base: 'lay', past: 'laid', participle: 'laid', es: 'Poner (huevos)', image: 'Una gallina mecánica pone huevos de oro.' },
      { base: 'pay', past: 'paid', participle: 'paid', es: 'Pagar', image: 'Un cajero automático te da billetes que cantan.' },
      { base: 'say', past: 'said', participle: 'said', es: 'Decir', image: 'Bocadillos de cómic salen de tu boca y flotan.' },
    ],
  },
  {
    id: 'g4',
    title: 'Grupo 4: Los que cambian vocales (I -> U)',
    hint: 'Mira la vocal: i → u (dig/dug, stick/stuck...).',
    verbs: [
      { base: 'dig', past: 'dug', participle: 'dug', es: 'Cavar', image: 'Un topo con taladro cava un túnel en el piso.' },
      { base: 'stick', past: 'stuck', participle: 'stuck', es: 'Pegar', image: 'Zapatos con chicle te dejan pegado al techo.' },
      { base: 'sting', past: 'stung', participle: 'stung', es: 'Picar', image: 'Una abeja mecánica te pica con una inyección de risa.' },
      { base: 'strike', past: 'struck', participle: 'struck', es: 'Golpear/Huelga', image: 'Un rayo cae sobre un reloj y lo derrite.' },
      { base: 'swing', past: 'swung', participle: 'swung', es: 'Balancear', image: 'Un mono se balancea en una liana de luces neón.' },
      { base: 'hang', past: 'hung', participle: 'hung', es: 'Colgar', image: 'Un clavo en la pared sostiene una mochila que canta' },
    ],
  },
];

const intruders = [
  { base: 'put', past: 'put', participle: 'put', es: 'poner', pattern: 'AAA' },
  { base: 'come', past: 'came', participle: 'come', es: 'venir', pattern: 'ABA' },
  { base: 'go', past: 'went', participle: 'gone', es: 'ir', pattern: 'ABC' },
  { base: 'write', past: 'wrote', participle: 'written', es: 'escribir', pattern: 'ABC' },
  { base: 'read', past: 'read', participle: 'read', es: 'leer', pattern: 'AAA' },
];

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function fillBlank(sentence, word) {
  return sentence.replace('___', word);
}

function getContextTemplates() {
  // Oraciones profesionales/educativas. En ES se inserta el verbo EN (el que practicas) para mantener un formato consistente.
  return {
    bend: {
      past: { en: 'Yesterday the technician ___ a metal bracket during assembly.', es: 'Ayer el técnico ___ un soporte metálico durante el ensamblaje.' },
      perf: { en: 'This week the technician has ___ the bracket to fit the design.', es: 'Esta semana el técnico ha ___ el soporte para que encaje en el diseño.' },
    },
    build: {
      past: { en: 'Yesterday the team ___ a prototype for the project.', es: 'Ayer el equipo ___ un prototipo para el proyecto.' },
      perf: { en: 'This week the team has ___ a small demo for stakeholders.', es: 'Esta semana el equipo ha ___ una demo pequeña para los interesados.' },
    },
    burn: {
      past: { en: 'Yesterday the lab ___ a test sample during the demo.', es: 'Ayer el laboratorio ___ una muestra de prueba durante la demostración.' },
      perf: { en: 'This month the lab has ___ several samples to validate the process.', es: 'Este mes el laboratorio ha ___ varias muestras para validar el proceso.' },
    },
    creep: {
      past: { en: 'Yesterday a small error ___ into the spreadsheet.', es: 'Ayer un pequeño error ___ en la hoja de cálculo.' },
      perf: { en: 'This week a few issues have ___ into the report and we corrected them.', es: 'Esta semana algunos problemas han ___ en el informe y los corregimos.' },
    },
    deal: {
      past: { en: 'Yesterday I ___ with a customer request politely.', es: 'Ayer yo ___ con una solicitud del cliente con calma.' },
      perf: { en: 'This week I have ___ with several support tickets.', es: 'Esta semana yo he ___ con varios tickets de soporte.' },
    },
    dream: {
      past: { en: 'Yesterday I ___ about improving my study routine.', es: 'Ayer yo ___ con mejorar mi rutina de estudio.' },
      perf: { en: 'This month I have ___ about a more efficient workflow.', es: 'Este mes yo he ___ con un flujo de trabajo más eficiente.' },
    },
    feel: {
      past: { en: 'Yesterday I ___ confident during the presentation.', es: 'Ayer yo ___ confianza durante la presentación.' },
      perf: { en: 'This week I have ___ more comfortable speaking in meetings.', es: 'Esta semana yo me he ___ más cómodo hablando en reuniones.' },
    },
    keep: {
      past: { en: 'Yesterday we ___ the documentation updated.', es: 'Ayer nosotros ___ la documentación actualizada.' },
      perf: { en: 'This quarter we have ___ our notes organized for training.', es: 'Este trimestre nosotros hemos ___ nuestras notas organizadas para la capacitación.' },
    },
    leave: {
      past: { en: 'Yesterday I ___ the meeting early to attend a class.', es: 'Ayer yo ___ la reunión temprano para asistir a una clase.' },
      perf: { en: 'This month I have ___ the office on time more often.', es: 'Este mes yo he ___ la oficina a tiempo con más frecuencia.' },
    },
    lend: {
      past: { en: 'Yesterday a colleague ___ me a charger for the workshop.', es: 'Ayer un colega me ___ un cargador para el taller.' },
      perf: { en: 'This week the team has ___ equipment to new members.', es: 'Esta semana el equipo ha ___ equipo a los nuevos integrantes.' },
    },
    light: {
      past: { en: 'Yesterday we ___ the training room for the session.', es: 'Ayer nosotros ___ la sala de capacitación para la sesión.' },
      perf: { en: 'This week we have ___ the hallway to improve safety.', es: 'Esta semana nosotros hemos ___ el pasillo para mejorar la seguridad.' },
    },
    lose: {
      past: { en: 'Yesterday the team ___ a file and recovered it from backups.', es: 'Ayer el equipo ___ un archivo y lo recuperó de copias de seguridad.' },
      perf: { en: 'This quarter the team has ___ fewer documents thanks to a checklist.', es: 'Este trimestre el equipo ha ___ menos documentos gracias a un checklist.' },
    },
    mean: {
      past: { en: 'Yesterday the instructor explained what the term ___ in the report.', es: 'Ayer el instructor explicó lo que el término ___ en el informe.' },
      perf: { en: 'This week the glossary has ___ a lot for new staff.', es: 'Esta semana el glosario ha ___ mucho para el personal nuevo.' },
    },
    meet: {
      past: { en: 'Yesterday we ___ the new manager for a short introduction.', es: 'Ayer nosotros ___ al nuevo gerente para una breve presentación.' },
      perf: { en: 'This month we have ___ with the client twice.', es: 'Este mes nosotros hemos ___ con el cliente dos veces.' },
    },
    send: {
      past: { en: 'Yesterday we ___ the report before the deadline.', es: 'Ayer nosotros ___ el informe antes de la fecha límite.' },
      perf: { en: 'This week we have ___ two follow-up emails.', es: 'Esta semana nosotros hemos ___ dos correos de seguimiento.' },
    },
    shoot: {
      past: { en: 'Yesterday the marketing team ___ product photos for the catalog.', es: 'Ayer el equipo de marketing ___ fotos del producto para el catálogo.' },
      perf: { en: 'This quarter the team has ___ several photos for a new campaign.', es: 'Este trimestre el equipo ha ___ varias fotos para una nueva campaña.' },
    },
    sit: {
      past: { en: 'Yesterday I ___ near the front during the seminar.', es: 'Ayer yo ___ cerca del frente durante el seminario.' },
      perf: { en: 'This week I have ___ with the same study group.', es: 'Esta semana yo he ___ con el mismo grupo de estudio.' },
    },
    sleep: {
      past: { en: 'Yesterday I ___ early to be ready for training.', es: 'Ayer yo ___ temprano para estar listo para la capacitación.' },
      perf: { en: 'This month I have ___ better by following a routine.', es: 'Este mes yo he ___ mejor siguiendo una rutina.' },
    },
    spend: {
      past: { en: 'Yesterday the team ___ time reviewing the checklist.', es: 'Ayer el equipo ___ tiempo revisando el checklist.' },
      perf: { en: 'This week the team has ___ extra time on quality control.', es: 'Esta semana el equipo ha ___ tiempo extra en control de calidad.' },
    },
    sweep: {
      past: { en: 'Yesterday the cleaning robot ___ the office floor.', es: 'Ayer el robot de limpieza ___ el piso de la oficina.' },
      perf: { en: 'This week the staff has ___ the workspace every day.', es: 'Esta semana el personal ha ___ el espacio de trabajo cada día.' },
    },
    weep: {
      past: { en: 'Yesterday I ___ a little after finishing a difficult course.', es: 'Ayer yo ___ un poco después de terminar un curso difícil.' },
      perf: { en: 'This year I have ___ less by managing stress better.', es: 'Este año yo he ___ menos al manejar mejor el estrés.' },
    },
    bring: {
      past: { en: 'Yesterday I ___ the signed documents to the meeting.', es: 'Ayer yo ___ los documentos firmados a la reunión.' },
      perf: { en: 'This week I have ___ all the materials for training.', es: 'Esta semana yo he ___ todos los materiales para la capacitación.' },
    },
    buy: {
      past: { en: 'Yesterday we ___ new equipment for the office.', es: 'Ayer nosotros ___ equipo nuevo para la oficina.' },
      perf: { en: 'This quarter we have ___ licenses for the team.', es: 'Este trimestre nosotros hemos ___ licencias para el equipo.' },
    },
    catch: {
      past: { en: 'Yesterday the system ___ an error during testing.', es: 'Ayer el sistema ___ un error durante las pruebas.' },
      perf: { en: 'This week the monitoring tool has ___ several issues.', es: 'Esta semana la herramienta de monitoreo ha ___ varios problemas.' },
    },
    fight: {
      past: { en: 'Yesterday the team ___ for a better solution respectfully.', es: 'Ayer el equipo ___ por una mejor solución con respeto.' },
      perf: { en: 'This month the team has ___ to keep the schedule on track.', es: 'Este mes el equipo ha ___ para mantener el cronograma.' },
    },
    seek: {
      past: { en: 'Yesterday we ___ feedback from the instructor.', es: 'Ayer nosotros ___ retroalimentación del instructor.' },
      perf: { en: 'This week we have ___ clearer requirements.', es: 'Esta semana nosotros hemos ___ requisitos más claros.' },
    },
    teach: {
      past: { en: 'Yesterday I ___ a short lesson to new staff.', es: 'Ayer yo ___ una lección corta al personal nuevo.' },
      perf: { en: 'This month I have ___ the same topic in two sessions.', es: 'Este mes yo he ___ el mismo tema en dos sesiones.' },
    },
    think: {
      past: { en: 'Yesterday I ___ about the plan before the meeting.', es: 'Ayer yo ___ sobre el plan antes de la reunión.' },
      perf: { en: 'This week I have ___ more carefully about my goals.', es: 'Esta semana yo he ___ con más cuidado sobre mis metas.' },
    },
    lay: {
      past: { en: 'Yesterday the instructor ___ out the steps on the board.', es: 'Ayer el instructor ___ los pasos en la pizarra.' },
      perf: { en: 'This week the instructor has ___ out a clear study plan.', es: 'Esta semana el instructor ha ___ un plan de estudio claro.' },
    },
    pay: {
      past: { en: 'Yesterday we ___ the invoice after verification.', es: 'Ayer nosotros ___ la factura después de la verificación.' },
      perf: { en: 'This month we have ___ for the new course.', es: 'Este mes nosotros hemos ___ por el nuevo curso.' },
    },
    say: {
      past: { en: 'Yesterday I ___ the key points clearly.', es: 'Ayer yo ___ los puntos clave con claridad.' },
      perf: { en: 'This week I have ___ the same message in two meetings.', es: 'Esta semana yo he ___ el mismo mensaje en dos reuniones.' },
    },
    dig: {
      past: { en: 'Yesterday the team ___ into the data to find the root cause.', es: 'Ayer el equipo ___ en los datos para encontrar la causa raíz.' },
      perf: { en: 'This week the analysts have ___ into the report in detail.', es: 'Esta semana los analistas han ___ en el informe a detalle.' },
    },
    stick: {
      past: { en: 'Yesterday the note ___ to my monitor as a reminder.', es: 'Ayer la nota ___ a mi monitor como recordatorio.' },
      perf: { en: 'This week the labels have ___ well on the folders.', es: 'Esta semana las etiquetas han ___ bien en las carpetas.' },
    },
    sting: {
      past: { en: 'Yesterday the feedback ___ at first, but it helped me improve.', es: 'Ayer la retroalimentación ___ al inicio, pero me ayudó a mejorar.' },
      perf: { en: 'This month the comments have ___ a bit, but we learned from them.', es: 'Este mes los comentarios han ___ un poco, pero aprendimos de ellos.' },
    },
    strike: {
      past: { en: 'Yesterday a power issue ___ during the session and we continued calmly.', es: 'Ayer un problema de energía ___ durante la sesión y continuamos con calma.' },
      perf: { en: 'This quarter outages have ___ twice during training.', es: 'Este trimestre los cortes han ___ dos veces durante la capacitación.' },
    },
    swing: {
      past: { en: 'Yesterday sales ___ up and down during the campaign.', es: 'Ayer las ventas ___ arriba y abajo durante la campaña.' },
      perf: { en: 'This month the metrics have ___ a lot, so we reviewed the data.', es: 'Este mes las métricas han ___ mucho, así que revisamos los datos.' },
    },
    hang: {
      past: { en: 'Yesterday we ___ the schedule on the wall for everyone.', es: 'Ayer nosotros ___ el cronograma en la pared para todos.' },
      perf: { en: 'This week we have ___ reminders near the entrance.', es: 'Esta semana nosotros hemos ___ recordatorios cerca de la entrada.' },
    },
  };
}

function buildContextQuestionsForGroup(group) {
  const templates = getContextTemplates();

  return group.verbs.flatMap((verb) => {
    const tpl = templates[verb.base];

    const pastEn = tpl?.past?.en ?? `Yesterday I ___ the task related to "${verb.base}".`;
    const pastEs = tpl?.past?.es ?? `Ayer yo ___ la tarea relacionada con "${verb.base}".`;
    const perfEn = tpl?.perf?.en ?? `This week I have ___ the task related to "${verb.base}".`;
    const perfEs = tpl?.perf?.es ?? `Esta semana yo he ___ la tarea relacionada con "${verb.base}".`;

    return [
      {
        verb,
        kind: 'past',
        es: pastEs,
        en: pastEn,
        answer: verb.past,
        note: `Past Simple (ABB): ${verb.base} → ${verb.past}`,
      },
      {
        verb,
        kind: 'perf',
        es: perfEs,
        en: perfEn,
        answer: verb.participle,
        note: `Present Perfect (ABB): has/have ${verb.participle}`,
      },
    ];
  });
}

export default function ABBGameEngine({ onExit }) {
  const [stage, setStage] = useState('menu');
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [waitingForNext, setWaitingForNext] = useState(false);
  const [feedback, setFeedback] = useState('');

  const [userAnswer, setUserAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [selectedIntruders, setSelectedIntruders] = useState([]);

  const [questions, setQuestions] = useState([]);

  const [palaceTitle, setPalaceTitle] = useState('');
  const [palaceList, setPalaceList] = useState([]);
  const [palaceView, setPalaceView] = useState(0);

  const accuracy = totalAnswered > 0 ? Math.round((score / totalAnswered) * 100) : 0;

  const selectedGroup = useMemo(
    () => groups.find((g) => g.id === selectedGroupId) ?? null,
    [selectedGroupId]
  );

  useEffect(() => {
    // reset palace view when group changes (safe UX)
    setPalaceView(0);
  }, [selectedGroupId]);

  const resetRoundState = () => {
    setCurrentQuestion(0);
    setScore(0);
    setTotalAnswered(0);
    setWaitingForNext(false);
    setFeedback('');
    setUserAnswer('');
    setShowHint(false);
    setSelectedAnswer(null);
    setSelectedIntruders([]);
  };

  const openPalaceAll = () => {
    const all = groups.flatMap((g) => g.verbs.map((v) => ({ ...v, groupTitle: g.title })));
    setPalaceTitle('Galería Mental (ABB) — Todos los grupos');
    setPalaceList(all);
    setPalaceView(0);
    setStage('palace');
  };

  const openPalaceGroup = (group) => {
    setPalaceTitle(`Galería Mental (ABB) — ${group.title}`);
    setPalaceList(group.verbs);
    setPalaceView(0);
    setStage('palace');
  };

  const startGroup = (groupId) => {
    setSelectedGroupId(groupId);
    resetRoundState();
    setStage('group_intro');
  };

  const initLevel = (level) => {
    if (!selectedGroup) return;
    resetRoundState();
    setStage(level);

    if (level === 'level1') {
      const selected = shuffle(selectedGroup.verbs);
      const levelQs = selected.map((verb) => {
        const wrongOptions = shuffle(selectedGroup.verbs.filter((v) => v.base !== verb.base)).slice(0, 3);
        const options = shuffle([...wrongOptions.map((v) => v.es), verb.es]);
        return { verb, correct: verb.es, options };
      });
      setQuestions(levelQs);
    }

    if (level === 'level2') {
      setQuestions(shuffle(selectedGroup.verbs));
    }

    if (level === 'level3') {
      const rounds = [];
      const roundsCount = Math.max(3, Math.min(6, Math.ceil(selectedGroup.verbs.length / 4)));
      for (let i = 0; i < roundsCount; i++) {
        const abbCards = selectedGroup.verbs.map((v) => ({ ...v, pattern: 'ABB' }));
        const picks = shuffle([...abbCards, ...intruders]).slice(0, 6);
        const intr = picks.filter((v) => v.pattern !== 'ABB').map((v) => v.base);
        rounds.push({ verbs: picks, intruders: intr });
      }
      setQuestions(rounds);
    }

    if (level === 'level4') {
      const all = buildContextQuestionsForGroup(selectedGroup);
      setQuestions(shuffle(all));
    }
  };

  const handleNext = () => {
    setFeedback('');
    setWaitingForNext(false);
    setUserAnswer('');
    setShowHint(false);
    setSelectedAnswer(null);
    setSelectedIntruders([]);

    if (currentQuestion < questions.length - 1) setCurrentQuestion((prev) => prev + 1);
    else setStage('results');
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
      setFeedback('');
      setWaitingForNext(false);
      setUserAnswer('');
      setShowHint(false);
      setSelectedAnswer(null);
      setSelectedIntruders([]);
    }
  };

  const checkAnswerLevel1 = (answer) => {
    const q = questions[currentQuestion];
    const isCorrect = answer === q.correct;
    setSelectedAnswer(answer);
    setTotalAnswered((prev) => prev + 1);

    if (isCorrect) {
      setScore((prev) => prev + 1);
      setFeedback(`✅ ¡Correcto! ${q.verb.base} = ${q.correct}. (ABB)`);
    } else {
      setFeedback(`❌ No. ${q.verb.base} significa "${q.correct}".\nImagen absurda: ${q.verb.image}`);
    }
    setWaitingForNext(true);
  };

  const checkLevel2Answer = () => {
    const q = questions[currentQuestion];
    const isCorrect = userAnswer.toLowerCase().trim() === q.base;
    setTotalAnswered((prev) => prev + 1);

    if (isCorrect) {
      setScore((prev) => prev + 1);
      setFeedback(`✅ Bien. ${q.base} - ${q.past} - ${q.participle} (ABB)`);
    } else {
      setFeedback(`❌ Era "${q.base}".\nFormas: ${q.base} - ${q.past} - ${q.participle}`);
    }
    setWaitingForNext(true);
  };

  const toggleIntruder = (verbBase) => {
    if (waitingForNext) return;
    setSelectedIntruders((prev) =>
      prev.includes(verbBase) ? prev.filter((v) => v !== verbBase) : [...prev, verbBase]
    );
  };

  const checkIntruders = () => {
    const q = questions[currentQuestion];
    const correct = [...q.intruders].sort();
    const user = [...selectedIntruders].sort();
    const isCorrect = JSON.stringify(correct) === JSON.stringify(user);

    setTotalAnswered((prev) => prev + 1);

    if (isCorrect) {
      setScore((prev) => prev + 1);
      setFeedback('✅ Perfecto. Identificaste los que NO son ABB.');
    } else {
      const missing = correct.filter((x) => !user.includes(x));
      setFeedback(`❌ Te faltó marcar: ${missing.join(', ')}.`);
    }
    setWaitingForNext(true);
  };

  const checkLevel4Answer = () => {
    const q = questions[currentQuestion];
    const isCorrect = userAnswer.toLowerCase().trim() === q.answer;
    setTotalAnswered((prev) => prev + 1);

    const enFull = fillBlank(q.en, q.answer);
    const esFull = fillBlank(q.es, q.answer);

    if (isCorrect) {
      setScore((prev) => prev + 1);
      setFeedback(`✅ Correcto. ${q.note}\nVerbo (EN): ${q.answer}\n\nEN: ${enFull}\nES: ${esFull}`);
    } else {
      setFeedback(`❌ La forma correcta era "${q.answer}". ${q.note}\nVerbo (EN): ${q.answer}\n\nEN: ${enFull}\nES: ${esFull}`);
    }
    setWaitingForNext(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
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
          <h1 className="text-3xl md:text-5xl font-bold mb-2 flex items-center justify-center gap-3 text-purple-300">
            <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-amber-300" />
            Piso 3: La Oficina de los Gemelos
          </h1>
          <p className="text-slate-300 text-lg">Patrón ABB: Pasado = Participio</p>
          <p className="text-slate-500 text-sm mt-2">Estrategia: agrupa por sonido final</p>
        </div>

        {stage !== 'menu' && stage !== 'group_intro' && stage !== 'palace' && stage !== 'results' && (
          <div className="mb-6 bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-700">
            <div className="flex justify-between text-sm mb-2 font-mono text-purple-200">
              <span>Progreso: {currentQuestion + 1} / {questions.length}</span>
              <span>Aciertos: {score}</span>
            </div>
            <div className="w-full bg-slate-700 h-3 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-500 to-fuchsia-400 h-full transition-all duration-500 ease-out"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {stage === 'menu' && (
          <div className="grid gap-6">
            <div className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700 text-center">
              <p className="text-xl mb-3 text-purple-200">Regla ABB</p>
              <div className="bg-slate-900/50 p-4 rounded-lg inline-block text-left">
                <p className="font-bold text-amber-300 mb-1">Estructura:</p>
                <p className="font-mono text-slate-200">Past (B) = Participle (B)</p>
                <p className="text-sm text-slate-400 mt-2 italic">"Pasado y participio van juntos."</p>
              </div>
              <p className="text-slate-400 mt-4 text-sm">
                Recomendación: primero visita el palacio mental y repite en voz alta: <span className="font-mono">base - past - participle</span>.
              </p>
            </div>

            <button
              onClick={openPalaceAll}
              className="group bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 p-6 rounded-2xl transition-all transform hover:scale-[1.02] shadow-xl flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-full"><Eye className="w-6 h-6" /></div>
                <div className="text-left">
                  <h3 className="text-xl font-bold">1. Visitar el Palacio Mental</h3>
                  <p className="text-indigo-100 text-sm">Recorre las escenas absurdas de todos los grupos.</p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 opacity-50 group-hover:opacity-100" />
            </button>

            <div className="grid md:grid-cols-2 gap-4">
              {groups.map((g) => (
                <button
                  key={g.id}
                  onClick={() => startGroup(g.id)}
                  className="bg-slate-700 hover:bg-slate-600 p-6 rounded-xl text-left transition hover:ring-2 ring-purple-400"
                >
                  <div className="text-purple-200 font-bold mb-2">Entrenamiento</div>
                  <div className="text-white font-bold text-lg">{g.title}</div>
                  <div className="text-slate-300 text-sm mt-1">{g.hint}</div>
                  <div className="text-slate-400 text-xs mt-2">Verbos: {g.verbs.length}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {stage === 'group_intro' && selectedGroup && (
          <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-purple-200">{selectedGroup.title}</h2>
              <button onClick={() => setStage('menu')} className="text-sm bg-slate-900 px-3 py-1 rounded hover:bg-slate-700 transition">Volver</button>
            </div>

            <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-700 mb-6">
              <p className="text-amber-300 font-bold mb-2">Explicación técnica (rápida)</p>
              <ul className="text-slate-200 space-y-2">
                <li><span className="font-mono">ABB</span>: el pasado y el participio son iguales.</li>
                <li>En <span className="font-mono">Past Simple</span> usas esa forma B.</li>
                <li>En <span className="font-mono">Present Perfect</span> usas <span className="font-mono">have/has</span> + esa misma forma B.</li>
              </ul>
              <p className="text-slate-400 text-sm mt-3">Estrategia del grupo: {selectedGroup.hint}</p>
            </div>

            <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-700 mb-6">
              <p className="text-purple-200 font-bold mb-2">Cómo practicar (orden recomendado)</p>
              <ol className="text-slate-200 list-decimal list-inside space-y-2">
                <li>Visita el palacio mental del grupo (imágenes absurdas).</li>
                <li>Repite 2 veces: <span className="font-mono">base - past - participle</span>.</li>
                <li>Haz la práctica: Reconocimiento → Escritura → Intrusos → Contexto real.</li>
              </ol>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <button
                onClick={() => openPalaceGroup(selectedGroup)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 px-6 py-4 rounded-xl font-bold transition flex items-center justify-center gap-2"
              >
                <Eye size={20} /> Ver palacio del grupo
              </button>
              <button
                onClick={() => initLevel('level1')}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 px-6 py-4 rounded-xl font-bold transition flex items-center justify-center gap-2"
              >
                <ChevronRight size={20} /> Empezar entrenamiento
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <button onClick={() => initLevel('level1')} className="bg-slate-700 hover:bg-slate-600 p-6 rounded-xl text-left transition hover:ring-2 ring-purple-400">
                <div className="flex items-center gap-3 mb-2 text-purple-200"><Brain className="w-5 h-5" /> Nivel 1</div>
                <h3 className="font-bold text-lg">Reconocimiento</h3>
                <p className="text-xs text-slate-400">Significado del verbo</p>
              </button>

              <button onClick={() => initLevel('level2')} className="bg-slate-700 hover:bg-slate-600 p-6 rounded-xl text-left transition hover:ring-2 ring-indigo-400">
                <div className="flex items-center gap-3 mb-2 text-indigo-200"><Lightbulb className="w-5 h-5" /> Nivel 2</div>
                <h3 className="font-bold text-lg">Escritura</h3>
                <p className="text-xs text-slate-400">Escribe la forma base</p>
              </button>

              <button onClick={() => initLevel('level3')} className="bg-slate-700 hover:bg-slate-600 p-6 rounded-xl text-left transition hover:ring-2 ring-orange-400">
                <div className="flex items-center gap-3 mb-2 text-orange-200"><X className="w-5 h-5" /> Nivel 3</div>
                <h3 className="font-bold text-lg">Detectar Intrusos</h3>
                <p className="text-xs text-slate-400">Selecciona los que NO son ABB</p>
              </button>

              <button onClick={() => initLevel('level4')} className="bg-slate-700 hover:bg-slate-600 p-6 rounded-xl text-left transition hover:ring-2 ring-amber-400">
                <div className="flex items-center gap-3 mb-2 text-amber-200"><Check className="w-5 h-5" /> Nivel 4</div>
                <h3 className="font-bold text-lg">Contexto Real</h3>
                <p className="text-xs text-slate-400">Past Simple + Present Perfect (usa todos los verbos)</p>
              </button>
            </div>
          </div>
        )}

        {stage === 'palace' && palaceList[palaceView] && (
          <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-purple-200">{palaceTitle}</h2>
              <button
                onClick={() => (selectedGroup ? setStage('group_intro') : setStage('menu'))}
                className="text-sm bg-slate-900 px-3 py-1 rounded hover:bg-slate-700 transition"
              >
                Volver
              </button>
            </div>

            <div className="bg-slate-900/50 p-8 rounded-xl text-center mb-6 min-h-[200px] flex flex-col justify-center items-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"></div>

              {palaceList[palaceView].groupTitle && (
                <div className="text-xs text-slate-300 mb-2">{palaceList[palaceView].groupTitle}</div>
              )}
              <h3 className="text-5xl font-black text-white mb-2 tracking-wider">{palaceList[palaceView].base.toUpperCase()}</h3>
              <p className="text-xl text-purple-200 mb-2 font-serif italic">"{palaceList[palaceView].es}"</p>
              <p className="text-slate-300 mb-6 font-mono">{palaceList[palaceView].base} - {palaceList[palaceView].past} - {palaceList[palaceView].participle}</p>

              <div className="bg-slate-800 p-4 rounded-lg max-w-lg border border-slate-600">
                <p className="text-slate-100 text-lg leading-relaxed">{palaceList[palaceView].image}</p>
              </div>
            </div>

            <div className="flex justify-between items-center gap-4">
              <button
                onClick={() => setPalaceView((prev) => Math.max(0, prev - 1))}
                disabled={palaceView === 0}
                className="bg-slate-700 p-4 rounded-full disabled:opacity-30 hover:bg-purple-600 transition"
              >
                <ChevronLeft />
              </button>
              <span className="font-mono text-slate-500">{palaceView + 1} / {palaceList.length}</span>
              <button
                onClick={() => setPalaceView((prev) => Math.min(palaceList.length - 1, prev + 1))}
                disabled={palaceView === palaceList.length - 1}
                className="bg-slate-700 p-4 rounded-full disabled:opacity-30 hover:bg-purple-600 transition"
              >
                <ChevronRight />
              </button>
            </div>
          </div>
        )}

        {stage === 'level1' && questions[currentQuestion] && (
          <div className="bg-slate-800 rounded-2xl p-8 shadow-2xl border border-slate-700">
            <div className="text-center mb-8">
              <h2 className="text-sm font-bold text-purple-200 tracking-widest uppercase mb-2">RECONOCIMIENTO</h2>
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
                        : 'bg-slate-700 hover:bg-purple-700'
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
            <h2 className="text-sm font-bold text-indigo-200 tracking-widest uppercase mb-6">PRODUCCIÓN</h2>
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
              className="w-full max-w-md bg-slate-900 border-2 border-slate-600 focus:border-indigo-500 rounded-xl p-4 text-center text-2xl outline-none transition-colors mb-4"
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
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-2 rounded-lg font-bold transition disabled:opacity-50"
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
              <h2 className="text-sm font-bold text-orange-200 tracking-widest uppercase mb-2">CONTROL DE PATRÓN</h2>
              <p className="text-xl text-white">Selecciona los verbos que <span className="text-red-300 font-bold">NO SON ABB</span>.</p>
              <p className="text-slate-400 text-sm mt-1">En ABB: Past = Participle.</p>
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
              <h2 className="text-sm font-bold text-amber-200 tracking-widest uppercase mb-2">CONTEXTO REAL</h2>
              <p className="text-slate-400">Completa con la forma correcta (Past Simple / Present Perfect)</p>
              <p className="text-slate-500 text-sm mt-1">Usa todos los verbos del grupo (sin saltos).</p>
            </div>

            <div className="bg-slate-900 p-6 rounded-xl mb-6 space-y-3">
              <p className="text-xl md:text-2xl leading-relaxed text-purple-100 text-center">
                {questions[currentQuestion].es.split('___')[0]}
                <span className="inline-block border-b-2 border-purple-400 min-w-[120px] text-amber-300 font-bold px-2">
                  {userAnswer || '...'}
                </span>
                {questions[currentQuestion].es.split('___')[1]}
              </p>
              <p className="text-xl md:text-2xl leading-relaxed text-slate-200 text-center">
                {questions[currentQuestion].en.split('___')[0]}
                <span className="inline-block border-b-2 border-slate-400 min-w-[120px] text-amber-300 font-bold px-2">
                  {userAnswer || '...'}
                </span>
                {questions[currentQuestion].en.split('___')[1]}
              </p>
              <p className="text-sm text-slate-400 text-center italic">{questions[currentQuestion].note}</p>
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
              <button
                onClick={checkLevel4Answer}
                disabled={!userAnswer}
                className="w-full bg-amber-600 hover:bg-amber-500 p-4 rounded-xl font-bold transition disabled:opacity-50"
              >
                Verificar
              </button>
            )}
          </div>
        )}

        {feedback && (
          <div className={`mt-6 p-6 rounded-xl flex flex-col md:flex-row items-center gap-4 ${feedback.includes('✅') ? 'bg-green-900/40 border border-green-500/50' : 'bg-red-900/40 border border-red-500/50'}`}>
            <div className="flex-1 text-center md:text-left font-medium text-lg whitespace-pre-line">{feedback}</div>
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
            <Trophy className="w-20 h-20 text-amber-300 mx-auto mb-6" />
            <h2 className="text-4xl font-bold mb-2">Resultados</h2>
            <p className="text-slate-400 mb-8">Precisión global</p>

            <div className="grid grid-cols-2 gap-6 max-w-md mx-auto mb-8">
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-700">
                <div className="text-4xl font-bold text-fuchsia-300 mb-1">{accuracy}%</div>
                <div className="text-xs text-slate-400 uppercase tracking-widest">Precisión</div>
              </div>
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-700">
                <div className="text-4xl font-bold text-purple-300 mb-1">{score}</div>
                <div className="text-xs text-slate-400 uppercase tracking-widest">Aciertos</div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <button
                onClick={() => setStage(selectedGroup ? 'group_intro' : 'menu')}
                className="bg-slate-700 hover:bg-slate-600 px-8 py-3 rounded-xl font-bold transition"
              >
                Volver
              </button>
              <button
                onClick={() => initLevel('level4')}
                disabled={!selectedGroup}
                className="bg-indigo-600 hover:bg-indigo-500 px-8 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 disabled:opacity-50"
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
