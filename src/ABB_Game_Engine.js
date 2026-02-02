import React, { useEffect, useMemo, useRef, useState } from 'react';
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

import { isSpeechSupported, speakEnglishBlock, speakEnglishSequence, stopSpeech, warmUpVoices } from './speech';
import { formatIPATriplet } from './ipa';
import { spanishMeaningsFor } from './meanings';
import { buildLevel2WritingHint } from './hints';

// PISO 3: LA OFICINA DE LOS GEMELOS (Patrón ABB)
// Regla: El Pasado y el Participio son idénticos.
// Estrategia: Agrúpalos por sonido final para recordarlos mejor.

export const groupsABB = [
  {
    id: 'g1',
    title: 'Grupo 1: Los Explosivos (Terminan en T)',
    hint: 'Muchos terminan con sonido “t” (bent, built, burnt, ...).',
    verbs: [
      {
        base: 'bend',
        past: 'bent',
        participle: 'bent',
        es: 'Doblar',
        image:
          'Una ardilla exploradora observa asombrada cómo un poste de luz gigante se dobla hacia abajo como goma elástica para mirar curiosamente un teléfono celular en el suelo.',
      },
      {
        base: 'build',
        past: 'built',
        participle: 'built',
        es: 'Construir',
        image:
          'Una ardilla exploradora aplaude emocionada viendo cómo castores con cascos de construcción amarillos construyen una presa enorme usando bloques de Lego gigantes de colores.',
      },
      {
        base: 'burn',
        past: 'burnt',
        participle: 'burnt',
        es: 'Quemar',
        image:
          'Una ardilla exploradora se agacha cubriéndose con su cola esponjosa mientras una tostadora gigante cromada quema pan y lo lanza como cohetes ardientes directamente al espacio con llamas.',
      },
      {
        base: 'creep',
        past: 'crept',
        participle: 'crept',
        es: 'Arrastrarse',
        image:
          'Una ardilla exploradora mira divertida con su lupa cómo una tortuga gigante se arrastra lentamente sobre un charco de queso derretido dorado dejando rastro brillante.',
      },
      {
        base: 'deal',
        past: 'dealt',
        participle: 'dealt',
        es: 'Tratar/Repartir',
        image:
          'Una ardilla exploradora recibe cartas con sus manitas mientras un robot crupier plateado reparte cartas que son rebanadas de pizza humeantes con pepperoni y queso derretido.',
      },
      {
        base: 'dream',
        past: 'dreamt',
        participle: 'dreamt',
        es: 'Soñar',
        image:
          'Una ardilla exploradora duerme acurrucada con su cola como almohada mientras una nube de pensamiento sólida y esponjosa sueña flotando sobre su cabeza mostrando bellotas doradas.',
      },
      {
        base: 'feel',
        past: 'felt',
        participle: 'felt',
        es: 'Sentir',
        image:
          'Una ardilla exploradora toca con ambas manitas un corazón gigante de felpa rojo que siente y late fuerte visible creando ondas sonoras y vibraciones que la hacen temblar adorablemente.',
      },
      {
        base: 'keep',
        past: 'kept',
        participle: 'kept',
        es: 'Guardar',
        image:
          'Una ardilla exploradora guarda sus nueces preciosas en una caja fuerte blindada gigante plateada con cerradura de combinación girando la rueda con esfuerzo adorable.',
      },
      {
        base: 'leave',
        past: 'left',
        participle: 'left',
        es: 'Dejar/Salir',
        image:
          'Un reloj de arena gigante comienza a caminar hacia la salida, dejando un rastro de arena dorada que forma patrones ABA en el suelo. La ardilla intenta detenerlo con un paraguas invertido.',
      },
      {
        base: 'lend',
        past: 'lent',
        participle: 'lent',
        es: 'Prestar',
        image:
          'Una ardilla exploradora recibe un paraguas rosa con ambas manos mientras un banco edificio gigante con cara amable presta paraguas de todos los colores del arcoíris que flotan hacia las personas.',
      },
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
      { base: 'weep', past: 'wept', participle: 'wept', es: 'Llorar', image: 'Una estatua llora fuentes de limonada.' },
    ],
  },
  {
    id: 'g2',
    title: 'Grupo 2: Los "GHT" (Sonido gutural)',
    hint: 'Terminaciones “-ought / -aught” (brought, bought, caught...).',
    verbs: [
      { base: 'bring', past: 'brought', participle: 'brought', es: 'Traer', image: 'Un perro que inspira ternura trae un dinosaurio en la boca.' },
      { base: 'buy', past: 'bought', participle: 'bought', es: 'Comprar', image: 'Un carrito de compras llevado por un perrito muy tierno se come tu dinero.' },
      { base: 'catch', past: 'caught', participle: 'caught', es: 'Atrapar', image: 'Un perrito muy tierno con un guante de béisbol gigante atrapa un meteorito.' },
      { base: 'fight', past: 'fought', participle: 'fought', es: 'Pelear', image: 'Dos almohadas lindos perritos luchan con espadas de espuma.' },
      { base: 'seek', past: 'sought', participle: 'sought', es: 'Buscar', image: 'Una perrito muy tierno con una lupa gigante busca huellas digitales en el aire.' },
      { base: 'teach', past: 'taught', participle: 'taught', es: 'Enseñar', image: 'Un búho con gafas escribe en una pizarra digital con alumnos perritos tiernos.' },
      { base: 'think', past: 'thought', participle: 'thought', es: 'Pensar', image: 'Una bombilla se enciende sobre la cabeza de un perrito tierno y explota.' },
    ],
  },
  {
    id: 'g3',
    title: 'Grupo 3: Los "AID/AID" (Sonido Eid)',
    hint: 'Formas compactas con sonido “eid” (laid, paid, said).',
    verbs: [
      {
        base: 'lay',
        past: 'laid',
        participle: 'laid',
        es: 'Poner (huevos)',
        image: 'El panda observa asombrado cómo una gallina mecánica dorada pone un huevo de oro gigante y brillante',
      },
      {
        base: 'pay',
        past: 'paid',
        participle: 'paid',
        es: 'Pagar',
        image: 'El panda recibe billetes que cantan y bailan saliendo de un cajero automático',
      },
      {
        base: 'say',
        past: 'said',
        participle: 'said',
        es: 'Decir',
        image: 'Bocadillos de cómic gigantes y coloridos salen de la boca del panda y flotan alrededor',
      },
    ],
  },
  {
    id: 'g4',
    title: 'Grupo 4: Los que cambian vocales (I -> U)',
    hint: 'Mira la vocal: i → u (dig/dug, stick/stuck...).',
    verbs: [
      { base: 'dig', past: 'dug', participle: 'dug', es: 'Cavar', image: 'El panda cava con un taladro mientras tierra y rocas vuelan por el aire' },
      { base: 'stick', past: 'stuck', participle: 'stuck', es: 'Pegar', image: 'Los zapatos del panda quedan pegados al techo con chicle rosa gigante y elástico' },
      { base: 'sting', past: 'stung', participle: 'stung', es: 'Picar', image: 'Una abeja mecánica dorada pica al panda con una jeringa brillante de risa' },
      { base: 'strike', past: 'struck', participle: 'struck', es: 'Golpear/Huelga', image: 'Un rayo brillante y eléctrico cae sobre un reloj gigante derritiéndolo' },
      { base: 'swing', past: 'swung', participle: 'swung', es: 'Balancear', image: 'El panda se balancea en una liana de luces neón brillantes y coloridas' },
      { base: 'hang', past: 'hung', participle: 'hung', es: 'Colgar', image: 'Perchas flotantes doradas sostienen ropa invisible con siluetas brillantes' },
    ],
  },
];

function getABBPalaceImageUrl(verbBase) {
  const base = String(verbBase ?? '').trim().toLowerCase();
  if (!base) return '';

  const publicBase = String(process.env.PUBLIC_URL ?? '').trim();
  const prefix = publicBase ? `${publicBase.replace(/\/$/, '')}/` : '';

  return `${prefix}img/ABB/${base.toUpperCase()}.webp`;
}

function getABBPalaceImageFallbackUrl(verbBase) {
  const base = String(verbBase ?? '').trim().toLowerCase();
  if (!base) return '';

  const publicBase = String(process.env.PUBLIC_URL ?? '').trim();
  const prefix = publicBase ? `${publicBase.replace(/\/$/, '')}/` : '';

  return `${prefix}img/ABB/${base}.webp`;
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

const intruders = [
  // No-ABB (mezcla de otros pisos)
  { base: 'bet', past: 'bet', participle: 'bet', es: 'apostar', pattern: 'AAA' },
  { base: 'cut', past: 'cut', participle: 'cut', es: 'cortar', pattern: 'AAA' },
  { base: 'let', past: 'let', participle: 'let', es: 'permitir', pattern: 'AAA' },
  { base: 'put', past: 'put', participle: 'put', es: 'poner', pattern: 'AAA' },
  { base: 'set', past: 'set', participle: 'set', es: 'fijar/colocar', pattern: 'AAA' },
  { base: 'read', past: 'read', participle: 'read', es: 'leer', pattern: 'AAA' },

  { base: 'come', past: 'came', participle: 'come', es: 'venir', pattern: 'ABA' },
  { base: 'run', past: 'ran', participle: 'run', es: 'correr', pattern: 'ABA' },
  { base: 'become', past: 'became', participle: 'become', es: 'convertirse', pattern: 'ABA' },
  { base: 'overcome', past: 'overcame', participle: 'overcome', es: 'superar', pattern: 'ABA' },

  { base: 'go', past: 'went', participle: 'gone', es: 'ir', pattern: 'ABC' },
  { base: 'write', past: 'wrote', participle: 'written', es: 'escribir', pattern: 'ABC' },
  { base: 'begin', past: 'began', participle: 'begun', es: 'empezar', pattern: 'ABC' },
  { base: 'drink', past: 'drank', participle: 'drunk', es: 'beber', pattern: 'ABC' },
  { base: 'sing', past: 'sang', participle: 'sung', es: 'cantar', pattern: 'ABC' },
  { base: 'take', past: 'took', participle: 'taken', es: 'tomar', pattern: 'ABC' },
  { base: 'give', past: 'gave', participle: 'given', es: 'dar', pattern: 'ABC' },
  { base: 'know', past: 'knew', participle: 'known', es: 'saber/conocer', pattern: 'ABC' },
];

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function fillBlank(sentence, word) {
  return sentence.replace('___', word);
}

function spanishInfFromEs(es) {
  const raw = String(es ?? '').trim();
  if (!raw) return '';
  const first = raw.split('/')[0].trim();
  if (!first) return '';
  return first.charAt(0).toLowerCase() + first.slice(1);
}

function getContextTemplates() {
  // Oraciones profesionales/educativas.
  // Importante: el español debe ser natural y NO debe insertar el verbo en inglés.
  return {
    bend: {
      past: { en: 'Yesterday the technician ___ a metal bracket during assembly.', esFull: 'Ayer el técnico dobló un soporte metálico durante el ensamblaje.' },
      perf: { en: 'This week the technician has ___ the bracket to fit the design.', esFull: 'Esta semana el técnico ha doblado el soporte para que encaje en el diseño.' },
    },
    build: {
      past: { en: 'Yesterday the team ___ a prototype for the project.', esFull: 'Ayer el equipo construyó un prototipo para el proyecto.' },
      perf: { en: 'This week the team has ___ a small demo for stakeholders.', esFull: 'Esta semana el equipo ha construido una demo pequeña para los interesados.' },
    },
    burn: {
      past: { en: 'Yesterday the lab ___ a test sample during the demo.', esFull: 'Ayer el laboratorio quemó una muestra de prueba durante la demostración.' },
      perf: { en: 'This month the lab has ___ several samples to validate the process.', esFull: 'Este mes el laboratorio ha quemado varias muestras para validar el proceso.' },
    },
    creep: {
      past: { en: 'Yesterday a small error ___ into the spreadsheet.', esFull: 'Ayer se coló un pequeño error en la hoja de cálculo.' },
      perf: { en: 'This week a few issues have ___ into the report and we corrected them.', esFull: 'Esta semana se han colado algunos problemas en el informe y los corregimos.' },
    },
    deal: {
      past: { en: 'Yesterday I ___ with a customer request politely.', esFull: 'Ayer gestioné una solicitud del cliente con cortesía.' },
      perf: { en: 'This week I have ___ with several support tickets.', esFull: 'Esta semana he gestionado varios tickets de soporte.' },
    },
    dream: {
      past: { en: 'Yesterday I ___ about improving my study routine.', esFull: 'Ayer soñé con mejorar mi rutina de estudio.' },
      perf: { en: 'This month I have ___ about a more efficient workflow.', esFull: 'Este mes he soñado con un flujo de trabajo más eficiente.' },
    },
    feel: {
      past: { en: 'Yesterday I ___ confident during the presentation.', esFull: 'Ayer me sentí seguro durante la presentación.' },
      perf: { en: 'This week I have ___ more comfortable speaking in meetings.', esFull: 'Esta semana me he sentido más cómodo hablando en reuniones.' },
    },
    keep: {
      past: { en: 'Yesterday we ___ the documentation updated.', esFull: 'Ayer mantuvimos la documentación actualizada.' },
      perf: { en: 'This quarter we have ___ our notes organized for training.', esFull: 'Este trimestre hemos mantenido nuestras notas organizadas para la capacitación.' },
    },
    leave: {
      past: { en: 'Yesterday I ___ the meeting early to attend a class.', esFull: 'Ayer salí de la reunión temprano para asistir a una clase.' },
      perf: { en: 'This month I have ___ the office on time more often.', esFull: 'Este mes he salido de la oficina a tiempo con más frecuencia.' },
    },
    lend: {
      past: { en: 'Yesterday a colleague ___ me a charger for the workshop.', esFull: 'Ayer un colega me prestó un cargador para el taller.' },
      perf: { en: 'This week the team has ___ equipment to new members.', esFull: 'Esta semana el equipo ha prestado equipo a los nuevos integrantes.' },
    },
    light: {
      past: { en: 'Yesterday we ___ the training room for the session.', esFull: 'Ayer iluminamos la sala de capacitación para la sesión.' },
      perf: { en: 'This week we have ___ the hallway to improve safety.', esFull: 'Esta semana hemos iluminado el pasillo para mejorar la seguridad.' },
    },
    lose: {
      past: { en: 'Yesterday the team ___ a file and recovered it from backups.', esFull: 'Ayer el equipo perdió un archivo y lo recuperó de copias de seguridad.' },
      perf: { en: 'This quarter the team has ___ fewer documents thanks to a checklist.', esFull: 'Este trimestre el equipo ha perdido menos documentos gracias a un checklist.' },
    },
    mean: {
      past: { en: 'Yesterday the instructor explained what the term ___ in the report.', esFull: 'Ayer el instructor explicó lo que significaba el término en el informe.' },
      perf: { en: 'This week the glossary has ___ a lot for new staff.', esFull: 'Esta semana el glosario ha significado mucho para el personal nuevo.' },
    },
    meet: {
      past: { en: 'Yesterday we ___ the new manager for a short introduction.', esFull: 'Ayer conocimos al nuevo gerente en una breve presentación.' },
      perf: { en: 'This month we have ___ with the client twice.', esFull: 'Este mes nos hemos reunido con el cliente dos veces.' },
    },
    send: {
      past: { en: 'Yesterday we ___ the report before the deadline.', esFull: 'Ayer enviamos el informe antes de la fecha límite.' },
      perf: { en: 'This week we have ___ two follow-up emails.', esFull: 'Esta semana hemos enviado dos correos de seguimiento.' },
    },
    shoot: {
      past: { en: 'Yesterday the marketing team ___ product photos for the catalog.', esFull: 'Ayer el equipo de marketing tomó fotos del producto para el catálogo.' },
      perf: { en: 'This quarter the team has ___ several photos for a new campaign.', esFull: 'Este trimestre el equipo ha tomado varias fotos para una nueva campaña.' },
    },
    sit: {
      past: { en: 'Yesterday I ___ near the front during the seminar.', esFull: 'Ayer me senté cerca del frente durante el seminario.' },
      perf: { en: 'This week I have ___ with the same study group.', esFull: 'Esta semana me he sentado con el mismo grupo de estudio.' },
    },
    sleep: {
      past: { en: 'Yesterday I ___ early to be ready for training.', esFull: 'Ayer dormí temprano para estar listo para la capacitación.' },
      perf: { en: 'This month I have ___ better by following a routine.', esFull: 'Este mes he dormido mejor siguiendo una rutina.' },
    },
    spend: {
      past: { en: 'Yesterday the team ___ time reviewing the checklist.', esFull: 'Ayer el equipo dedicó tiempo a revisar el checklist.' },
      perf: { en: 'This week the team has ___ extra time on quality control.', esFull: 'Esta semana el equipo ha dedicado tiempo extra al control de calidad.' },
    },
    sweep: {
      past: { en: 'Yesterday the cleaning robot ___ the office floor.', esFull: 'Ayer el robot de limpieza barrió el piso de la oficina.' },
      perf: { en: 'This week the staff has ___ the workspace every day.', esFull: 'Esta semana el personal ha barrido el espacio de trabajo cada día.' },
    },
    weep: {
      past: { en: 'Yesterday I ___ a little after finishing a difficult course.', esFull: 'Ayer lloré un poco después de terminar un curso difícil.' },
      perf: { en: 'This year I have ___ less by managing stress better.', esFull: 'Este año he llorado menos al manejar mejor el estrés.' },
    },
    bring: {
      past: { en: 'Yesterday I ___ the signed documents to the meeting.', esFull: 'Ayer traje los documentos firmados a la reunión.' },
      perf: { en: 'This week I have ___ all the materials for training.', esFull: 'Esta semana he traído todos los materiales para la capacitación.' },
    },
    buy: {
      past: { en: 'Yesterday we ___ new equipment for the office.', esFull: 'Ayer compramos equipo nuevo para la oficina.' },
      perf: { en: 'This quarter we have ___ licenses for the team.', esFull: 'Este trimestre hemos comprado licencias para el equipo.' },
    },
    catch: {
      past: { en: 'Yesterday the system ___ an error during testing.', esFull: 'Ayer el sistema detectó un error durante las pruebas.' },
      perf: { en: 'This week the monitoring tool has ___ several issues.', esFull: 'Esta semana la herramienta de monitoreo ha detectado varios problemas.' },
    },
    fight: {
      past: { en: 'Yesterday the team ___ for a better solution respectfully.', esFull: 'Ayer el equipo luchó por una mejor solución con respeto.' },
      perf: { en: 'This month the team has ___ to keep the schedule on track.', esFull: 'Este mes el equipo ha luchado para mantener el cronograma.' },
    },
    seek: {
      past: { en: 'Yesterday we ___ feedback from the instructor.', esFull: 'Ayer buscamos retroalimentación del instructor.' },
      perf: { en: 'This week we have ___ clearer requirements.', esFull: 'Esta semana hemos buscado requisitos más claros.' },
    },
    teach: {
      past: { en: 'Yesterday I ___ a short lesson to new staff.', esFull: 'Ayer enseñé una lección corta al personal nuevo.' },
      perf: { en: 'This month I have ___ the same topic in two sessions.', esFull: 'Este mes he enseñado el mismo tema en dos sesiones.' },
    },
    think: {
      past: { en: 'Yesterday I ___ about the plan before the meeting.', esFull: 'Ayer pensé en el plan antes de la reunión.' },
      perf: { en: 'This week I have ___ more carefully about my goals.', esFull: 'Esta semana he pensado con más cuidado sobre mis metas.' },
    },
    lay: {
      past: { en: 'Yesterday the instructor ___ out the steps on the board.', esFull: 'Ayer el instructor expuso los pasos en la pizarra.' },
      perf: { en: 'This week the instructor has ___ out a clear study plan.', esFull: 'Esta semana el instructor ha expuesto un plan de estudio claro.' },
    },
    pay: {
      past: { en: 'Yesterday we ___ the invoice after verification.', esFull: 'Ayer pagamos la factura después de la verificación.' },
      perf: { en: 'This month we have ___ for the new course.', esFull: 'Este mes hemos pagado por el nuevo curso.' },
    },
    say: {
      past: { en: 'Yesterday I ___ the key points clearly.', esFull: 'Ayer dije los puntos clave con claridad.' },
      perf: { en: 'This week I have ___ the same message in two meetings.', esFull: 'Esta semana he dicho el mismo mensaje en dos reuniones.' },
    },
    dig: {
      past: { en: 'Yesterday the team ___ into the data to find the root cause.', esFull: 'Ayer el equipo profundizó en los datos para encontrar la causa raíz.' },
      perf: { en: 'This week the analysts have ___ into the report in detail.', esFull: 'Esta semana los analistas han profundizado en el informe a detalle.' },
    },
    stick: {
      past: { en: 'Yesterday the note ___ to my monitor as a reminder.', esFull: 'Ayer la nota se quedó pegada a mi monitor como recordatorio.' },
      perf: { en: 'This week the labels have ___ well on the folders.', esFull: 'Esta semana las etiquetas se han pegado bien en las carpetas.' },
    },
    sting: {
      past: { en: 'Yesterday the feedback ___ at first, but it helped me improve.', esFull: 'Ayer la retroalimentación dolió al inicio, pero me ayudó a mejorar.' },
      perf: { en: 'This month the comments have ___ a bit, but we learned from them.', esFull: 'Este mes los comentarios han dolido un poco, pero aprendimos de ellos.' },
    },
    strike: {
      past: { en: 'Yesterday a power issue ___ during the session and we continued calmly.', esFull: 'Ayer un problema de energía golpeó la sesión y continuamos con calma.' },
      perf: { en: 'This quarter outages have ___ twice during training.', esFull: 'Este trimestre los cortes han golpeado dos veces durante la capacitación.' },
    },
    swing: {
      past: { en: 'Yesterday sales ___ up and down during the campaign.', esFull: 'Ayer las ventas oscilaron arriba y abajo durante la campaña.' },
      perf: { en: 'This month the metrics have ___ a lot, so we reviewed the data.', esFull: 'Este mes las métricas han oscilado mucho, así que revisamos los datos.' },
    },
    hang: {
      past: { en: 'Yesterday we ___ the schedule on the wall for everyone.', esFull: 'Ayer colgamos el cronograma en la pared para todos.' },
      perf: { en: 'This week we have ___ reminders near the entrance.', esFull: 'Esta semana hemos colgado recordatorios cerca de la entrada.' },
    },
  };
}

function buildContextQuestionsForGroup(group) {
  const templates = getContextTemplates();

  return group.verbs.flatMap((verb) => {
    const tpl = templates[verb.base];

    const pastEn = tpl?.past?.en ?? `Yesterday I ___ the task related to "${verb.base}".`;
    const pastEsFull = tpl?.past?.esFull ?? `Ayer realicé una tarea relacionada con "${verb.base}".`;
    const perfEn = tpl?.perf?.en ?? `This week I have ___ the task related to "${verb.base}".`;
    const perfEsFull = tpl?.perf?.esFull ?? `Esta semana he realizado una tarea relacionada con "${verb.base}".`;

    return [
      {
        verb,
        kind: 'past',
        esFull: pastEsFull,
        en: pastEn,
        answer: verb.past,
        label: 'Past Simple (ABB)',
        note: `Past Simple (ABB): ${verb.base} → ${verb.past}`,
      },
      {
        verb,
        kind: 'perf',
        esFull: perfEsFull,
        en: perfEn,
        answer: verb.participle,
        label: 'Present Perfect (ABB)',
        note: `Present Perfect (ABB): has/have ${verb.participle}`,
      },
    ];
  });
}

export default function ABBGameEngine({ onExit, onViewGallery, onOpenDonation }) {
  const [stage, setStage] = useState('menu');
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [stage]);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [points, setPoints] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [waitingForNext, setWaitingForNext] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackDetails, setFeedbackDetails] = useState('');
  const [showFeedbackDetails, setShowFeedbackDetails] = useState(false);

  const [feedbackSpeechEn, setFeedbackSpeechEn] = useState(null);
  const speechAvailable = isSpeechSupported();

  const [userAnswer, setUserAnswer] = useState('');
  const [hintLevel2, setHintLevel2] = useState(0); // 0 none | 1 first | 2 first+second | 3 first+second+last
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [selectedIntruders, setSelectedIntruders] = useState([]);
  const [hintLevel4, setHintLevel4] = useState(0); // 0 none | 1 first letter | 2 spaced pattern | 3 tight pattern

  const [questions, setQuestions] = useState([]);

  const [palaceTitle, setPalaceTitle] = useState('');
  const [palaceList, setPalaceList] = useState([]);
  const [palaceView, setPalaceView] = useState(0);
  const [palaceImageError, setPalaceImageError] = useState(false);
  const [palaceImageVariant, setPalaceImageVariant] = useState('primary');

  const [isCoarsePointer, setIsCoarsePointer] = useState(false);
  const touchStartXRef = useRef(null);

  const accuracy = totalAnswered > 0 ? Math.round((score / totalAnswered) * 100) : 0;

  const selectedGroup = useMemo(
    () => groupsABB.find((g) => g.id === selectedGroupId) ?? null,
    [selectedGroupId]
  );

  useEffect(() => {
    // reset palace view when group changes (safe UX)
    setPalaceView(0);
  }, [selectedGroupId]);

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
    mq.addListener(update);
    return () => mq.removeListener(update);
  }, []);

  useEffect(() => {
    if (stage !== 'palace') return;
    setPalaceImageError(false);
    setPalaceImageVariant('primary');
  }, [stage, palaceView, palaceTitle]);

  const goPalacePrev = () => {
    if (!palaceList.length) return;
    if (palaceView === 0) return;
    stopSpeech();
    setPalaceImageError(false);
    setPalaceImageVariant('primary');
    setPalaceView((prev) => Math.max(0, prev - 1));
  };

  const goPalaceNext = () => {
    if (!palaceList.length) return;
    if (palaceView >= palaceList.length - 1) return;
    stopSpeech();
    setPalaceImageError(false);
    setPalaceImageVariant('primary');
    setPalaceView((prev) => Math.min(palaceList.length - 1, prev + 1));
  };

  const resetRoundState = () => {
    stopSpeech();
    setCurrentQuestion(0);
    setScore(0);
    setPoints(0);
    setTotalAnswered(0);
    setWaitingForNext(false);
    setFeedback('');
    setFeedbackDetails('');
    setShowFeedbackDetails(false);
    setFeedbackSpeechEn(null);
    setUserAnswer('');
    setHintLevel2(0);
    setSelectedAnswer(null);
    setSelectedIntruders([]);
    setHintLevel4(0);
  };

  const openPalaceAll = () => {
    const all = groupsABB.flatMap((g) => g.verbs.map((v) => ({ ...v, groupTitle: g.title })));
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
        const totalCards = 6;
        const desiredIntruders = 2;

        const abbCards = shuffle(selectedGroup.verbs).map((v) => ({ ...v, pattern: 'ABB' }));
        const maxAbb = Math.max(1, totalCards - desiredIntruders);
        const abbCount = Math.min(maxAbb, abbCards.length);
        const intruderCount = Math.min(intruders.length, totalCards - abbCount);

        const pickedAbb = abbCards.slice(0, totalCards - intruderCount);
        const pickedIntruders = shuffle(intruders).slice(0, intruderCount);
        const picks = shuffle([...pickedAbb, ...pickedIntruders]);
        const intr = pickedIntruders.map((v) => v.base);
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
    stopSpeech();
    setFeedback('');
    setFeedbackDetails('');
    setShowFeedbackDetails(false);
    setFeedbackSpeechEn(null);
    setWaitingForNext(false);
    setUserAnswer('');
    setHintLevel2(0);
    setSelectedAnswer(null);
    setSelectedIntruders([]);
    setHintLevel4(0);

    if (currentQuestion < questions.length - 1) setCurrentQuestion((prev) => prev + 1);
    else setStage('results');
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      stopSpeech();
      setCurrentQuestion((prev) => prev - 1);
      setFeedback('');
      setFeedbackDetails('');
      setShowFeedbackDetails(false);
      setFeedbackSpeechEn(null);
      setWaitingForNext(false);
      setUserAnswer('');
      setHintLevel2(0);
      setSelectedAnswer(null);
      setSelectedIntruders([]);
      setHintLevel4(0);
    }
  };

  const checkAnswerLevel1 = (answer) => {
    const q = questions[currentQuestion];
    const isCorrect = answer === q.correct;
    setSelectedAnswer(answer);
    setTotalAnswered((prev) => prev + 1);

    if (isCorrect) {
      setScore((prev) => prev + 1);
      setPoints((prev) => prev + 1);
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
      setPoints((prev) => prev + 1);
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
      setPoints((prev) => prev + 1);
      setFeedback('✅ Perfecto. Identificaste los que NO son ABB.');
    } else {
      const missing = correct.filter((x) => !user.includes(x));
      const extra = user.filter((x) => !correct.includes(x));
      const parts = [];
      if (missing.length) parts.push(`Te faltó marcar: ${missing.join(', ')}`);
      if (extra.length) parts.push(`Marcaste de más: ${extra.join(', ')}`);
      setFeedback(`❌ No del todo. ${parts.join('. ')}.`.trim());
    }
    setWaitingForNext(true);
  };

  const checkLevel4Answer = () => {
    const q = questions[currentQuestion];
    const isCorrect = userAnswer.toLowerCase().trim() === q.answer;
    setTotalAnswered((prev) => prev + 1);

    const templates = getContextTemplates();
    const tpl = templates[q.verb.base];
    const pastEn = tpl?.past?.en ? fillBlank(tpl.past.en, q.verb.past) : '';
    const pastEs = tpl?.past?.esFull ?? '';
    const perfEn = tpl?.perf?.en ? fillBlank(tpl.perf.en, q.verb.participle) : '';
    const perfEs = tpl?.perf?.esFull ?? '';

    const presentSuffix = tpl?.past?.en ? String(tpl.past.en).split('___')[1] ?? '' : '';
    const presentEn = presentSuffix ? `Normally, people tend to ${q.verb.base}${presentSuffix}` : `Normally, people tend to ${q.verb.base}.`;
    const inf = spanishInfFromEs(q.verb.es);
    const presentEs = inf ? `Normalmente, en el trabajo, yo suelo ${inf}.` : 'Normalmente, en el trabajo, yo suelo practicar.';

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
    setFeedbackSpeechEn({ presentEn, pastEn, perfEn });

    if (isCorrect) {
      setScore((prev) => prev + 1);
      setPoints((prev) => prev + earnedPoints);
      setFeedback(`✅ Correcto. ${q.note} (+${earnedPoints} puntos)`);
    } else {
      setFeedback(`❌ Incorrecto. La forma correcta era "${q.answer}". ${q.note}`);
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
            Piso 3: Palacio de los Gemelos
          </h1>
          <p className="text-slate-300 text-lg">Patrón ABB: Pasado = Participio</p>
          <p className="text-slate-500 text-sm mt-2">Estrategia: agrupa por sonido final</p>
        </div>

        {stage !== 'menu' && stage !== 'group_intro' && stage !== 'palace' && stage !== 'results' && (
          <div className="mb-6 bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-700">
            <div className="flex justify-between text-sm mb-2 font-mono text-purple-200">
              <span>Progreso: {currentQuestion + 1} / {questions.length}</span>
              <span>Aciertos: {score} | Puntos: {points.toFixed(1)}</span>
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
              {groupsABB.map((g) => (
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
                <li>
                  Visita el palacio mental del grupo (imágenes absurdas).{' '}
                  {typeof onViewGallery === 'function' && (
                    <button
                      type="button"
                      onClick={onViewGallery}
                      className="underline font-bold text-purple-200 hover:text-white"
                    >
                      Ir al Recorrido Mental
                    </button>
                  )}
                </li>
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
          <div className="bg-slate-800 rounded-2xl p-2 md:p-8 border border-slate-700 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-purple-200">{palaceTitle}</h2>
              <button
                onClick={() => (selectedGroup ? setStage('group_intro') : setStage('menu'))}
                className="text-sm bg-slate-900 px-3 py-1 rounded hover:bg-slate-700 transition"
              >
                Volver
              </button>
            </div>

            {isCoarsePointer && (
              <div className="mb-4 bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-slate-200 flex items-center gap-2">
                <span className="font-bold">Desliza</span>
                <span className="text-slate-400">para ver la siguiente</span>
                <ChevronLeft className="w-5 h-5" />
              </div>
            )}

            <div className="bg-slate-900/50 p-2 md:p-8 rounded-xl text-center mb-4 md:mb-6 min-h-[200px] flex flex-col justify-center items-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"></div>

              {palaceList[palaceView].groupTitle && (
                <div className="text-xs text-slate-300 mb-2">{palaceList[palaceView].groupTitle}</div>
              )}
              <h3 className="text-5xl font-black text-white mb-2 tracking-wider">{palaceList[palaceView].base.toUpperCase()}</h3>
              <p className="text-xl text-purple-200 mb-2 font-serif italic">"{palaceList[palaceView].es}"</p>
              <p className="text-slate-300 mb-6 font-mono">{palaceList[palaceView].base} - {palaceList[palaceView].past} - {palaceList[palaceView].participle}</p>
              <p className="text-slate-500 -mt-4 mb-6 font-mono text-sm">
                {formatIPATriplet([palaceList[palaceView].base, palaceList[palaceView].past, palaceList[palaceView].participle])}
              </p>

              <div className="w-full max-w-5xl mb-3 md:mb-4">
                <div className="text-slate-300 text-sm mb-2">Toca la imagen para escuchar: base → pasado → participio.</div>

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

                    // Swipe left => next
                    if (delta < 0) goPalaceNext();
                    else goPalacePrev();
                  }}
                >
                  <button
                    type="button"
                    onClick={goPalacePrev}
                    disabled={palaceView === 0}
                    aria-label="Anterior"
                    className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 bg-slate-700/80 p-4 rounded-full hover:bg-purple-600 transition z-10 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft />
                  </button>

                  {!palaceImageError ? (
                    <img
                      key={`${palaceList[palaceView].base}-${palaceImageVariant}`}
                      src={
                        palaceImageVariant === 'primary'
                          ? getABBPalaceImageUrl(palaceList[palaceView].base)
                          : getABBPalaceImageFallbackUrl(palaceList[palaceView].base)
                      }
                      alt={palaceList[palaceView].base}
                      loading="lazy"
                      onClick={() => {
                        if (!speechAvailable) return;
                        speakEnglishSequence(
                          [palaceList[palaceView].base, palaceList[palaceView].past, palaceList[palaceView].participle],
                          { gapMs: 350 }
                        );
                      }}
                      onKeyDown={(e) => {
                        if (!speechAvailable) return;
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          speakEnglishSequence(
                            [palaceList[palaceView].base, palaceList[palaceView].past, palaceList[palaceView].participle],
                            { gapMs: 350 }
                          );
                        }
                      }}
                      role={speechAvailable ? 'button' : undefined}
                      tabIndex={speechAvailable ? 0 : undefined}
                      onError={() => {
                        if (palaceImageVariant === 'primary') setPalaceImageVariant('fallback');
                        else setPalaceImageError(true);
                      }}
                      className={`w-full h-[92svh] md:h-[80vh] rounded-2xl border border-slate-700 shadow-xl bg-slate-950/30 object-contain ${speechAvailable ? 'cursor-pointer' : ''}`}
                    />
                  ) : (
                    <div className="w-full h-[92svh] md:h-[80vh] rounded-2xl border border-slate-700 bg-slate-950/30 flex items-center justify-center text-slate-300">
                      No se pudo cargar la imagen para <span className="font-mono ml-2">{palaceList[palaceView].base}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={goPalaceNext}
                    disabled={palaceView === palaceList.length - 1}
                    aria-label="Siguiente"
                    className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 bg-slate-700/80 p-4 rounded-full hover:bg-purple-600 transition z-10 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight />
                  </button>
                </div>
              </div>

              <div className="bg-slate-800 p-4 rounded-lg max-w-lg border border-slate-600">
                <p className="text-slate-100 text-lg leading-relaxed">{palaceList[palaceView].image}</p>
              </div>
            </div>

            <div className="flex justify-center items-center gap-4">
              <span className="font-mono text-slate-500">{palaceView + 1} / {palaceList.length}</span>
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
              <p className="text-slate-500 text-sm">Escribe la forma base (A).</p>
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
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-2 rounded-lg font-bold transition disabled:opacity-50"
                >
                  Verificar
                </button>
              </div>
            )}

            {!waitingForNext && hintLevel2 > 0 && (
              <div className="mt-4 text-slate-200 bg-slate-900/60 border border-slate-700 rounded-lg px-4 py-2 inline-block font-mono">
                {buildLevel2WritingHint(questions[currentQuestion].base, hintLevel2)}
              </div>
            )}

            {waitingForNext && (
              <div className="mt-6 bg-slate-900/50 p-5 rounded-xl border border-slate-700 text-left">
                <button
                  type="button"
                  onClick={() => {
                    if (!speechAvailable) return;
                    speakEnglishSequence(
                      [questions[currentQuestion].base, questions[currentQuestion].past, questions[currentQuestion].participle],
                      { gapMs: 350 }
                    );
                  }}
                  className={`w-full text-left rounded-lg ${speechAvailable ? 'hover:bg-slate-800/70 transition cursor-pointer' : ''}`}
                >
                  <div className="text-slate-300 text-sm mb-2">Toca para escuchar: base → pasado → participio.</div>
                  <div className="text-xl font-black text-white">
                    {questions[currentQuestion].base} - {questions[currentQuestion].past} - {questions[currentQuestion].participle}
                  </div>
                  <div className="text-slate-400 font-mono text-sm">
                    {formatIPATriplet([
                      questions[currentQuestion].base,
                      questions[currentQuestion].past,
                      questions[currentQuestion].participle,
                    ])}
                  </div>
                </button>

                <div className="mt-3 text-slate-200 text-sm">
                  Significados: <span className="text-slate-300">{spanishMeaningsFor(questions[currentQuestion].base, questions[currentQuestion].es).join(' / ')}</span>
                </div>
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
              <p className="text-slate-500 text-sm mt-1">Si crees que no hay intrusos, confirma sin marcar nada.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {questions[currentQuestion].verbs.map((verb, idx) => {
                const selected = selectedIntruders.includes(verb.base);
                const isIntruder = questions[currentQuestion].intruders.includes(verb.base);
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
                    onClick={() => toggleIntruder(verb.base)}
                    disabled={waitingForNext}
                    className={`p-4 rounded-xl transition-all relative overflow-hidden ${revealClass}`}
                  >
                    <span className="font-bold text-lg block">{verb.base}</span>
                    <span className="text-xs text-slate-300 font-mono block">{verb.base} - {verb.past} - {verb.participle}</span>

                    {waitingForNext && (
                      <>
                        <span className="text-xs text-slate-200 block mt-1">{verb.es}</span>
                        <span className="text-[11px] text-slate-300 font-mono block">Patrón: {verb.pattern}</span>
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
                {speechAvailable && feedbackSpeechEn && (
                  <div className="mb-3">
                    <div className="text-slate-300 text-sm mb-2">Elige la frase que desees y tócala para escucharla en inglés.</div>
                    <div className="flex flex-col gap-2">
                      {feedbackSpeechEn.presentEn ? (
                        <button
                          type="button"
                          onClick={() => speakEnglishBlock([feedbackSpeechEn.presentEn])}
                          className="text-left bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg font-bold transition"
                        >
                          Presente (EN): {feedbackSpeechEn.presentEn}
                        </button>
                      ) : null}
                      {feedbackSpeechEn.pastEn ? (
                        <button
                          type="button"
                          onClick={() => speakEnglishBlock([feedbackSpeechEn.pastEn])}
                          className="text-left bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg font-bold transition"
                        >
                          Pasado (EN): {feedbackSpeechEn.pastEn}
                        </button>
                      ) : null}
                      {feedbackSpeechEn.perfEn ? (
                        <button
                          type="button"
                          onClick={() => speakEnglishBlock([feedbackSpeechEn.perfEn])}
                          className="text-left bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg font-bold transition"
                        >
                          Participio / Present Perfect (EN): {feedbackSpeechEn.perfEn}
                        </button>
                      ) : null}
                      <div className="flex flex-wrap gap-3 pt-1">
                        <button
                          type="button"
                          onClick={stopSpeech}
                          className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg font-bold transition"
                        >
                          Detener
                        </button>
                      </div>
                    </div>
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
                <div className="text-4xl font-bold text-fuchsia-300 mb-1">{accuracy}%</div>
                <div className="text-xs text-slate-400 uppercase tracking-widest">Precisión</div>
              </div>
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-700">
                <div className="text-4xl font-bold text-purple-300 mb-1">{score}</div>
                <div className="text-xs text-slate-400 uppercase tracking-widest">Aciertos</div>
                <div className="text-sm text-slate-300 mt-2">Puntos: {points.toFixed(1)}</div>
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

            {onOpenDonation && (
              <div className="mt-8 pt-8 border-t border-slate-700/50">
                 <button
                    onClick={onOpenDonation}
                    className="text-amber-400 hover:text-amber-300 font-bold underline decoration-amber-400/30 underline-offset-4 hover:decoration-amber-300/60 transition"
                  >
                    ☕ Invítanos un café si te gustó
                  </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
