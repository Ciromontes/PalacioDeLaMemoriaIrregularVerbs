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

// PISO 4: EL LABORATORIO DE METAMORFOSIS / CAMALEÓN (Patrón ABC)
// Regla: Las 3 formas son distintas.
// Estrategia: Memoriza el sonido de cada transformación (base → past → participle).

export const groupsABC = [
  {
    id: 'g1_iau',
    title: 'Grupo 1: I–A–U (El canto de las vocales)',
    hint: 'Patrón vocálico i → a → u. Muy musical: repite el cambio en voz alta.',
    storyId: 'story1',
    verbs: [
      {
        base: 'begin',
        past: 'began',
        participle: 'begun',
        es: 'Empezar',
        image:
          'Una rana cantante de jazz empieza saltando con potencia desde línea de salida junto a corredores en carrera explosiva con disparo de pistola.',
      },
      {
        base: 'drink',
        past: 'drank',
        participle: 'drunk',
        es: 'Beber',
        image:
          'Una rana cantante observa fascinada cómo una botella gigante con boca bebe sola de un vaso volcándose y tragando el líquido.',
      },
      {
        base: 'ring',
        past: 'rang',
        participle: 'rung',
        es: 'Sonar',
        image:
          'Una rana cantante con saxofón mira asombrada cómo un teléfono gigante vintage suena bailando y girando con campanas tintineando.',
      },
      {
        base: 'shrink',
        past: 'shrank',
        participle: 'shrunk',
        es: 'Encoger',
        image:
          'Una rana cantante salta sorprendida cuando un gigante enorme se encoge al tocar un botón rojo volviéndose enano diminuto.',
      },
      {
        base: 'sing',
        past: 'sang',
        participle: 'sung',
        es: 'Cantar',
        image:
          'Una rana cantante con garganta inflada brillante observa maravillada cómo un micrófono cromado canta ópera solo con voz potente.',
      },
      {
        base: 'sink',
        past: 'sank',
        participle: 'sunk',
        es: 'Hundir',
        image:
          'Una rana cantante flota en gelatina transparente viendo cómo un barco de papel se hunde lentamente atravesando la sustancia gelatinosa.',
      },
      {
        base: 'stink',
        past: 'stank',
        participle: 'stunk',
        es: 'Apestar',
        image:
          'Una rana cantante se tapa la nariz con dedos adhesivos mientras un zorrillo elegante apesta rociando perfume francés que huele terrible.',
      },
      {
        base: 'swim',
        past: 'swam',
        participle: 'swum',
        es: 'Nadar',
        image:
          'Una rana cantante aplaude emocionada viendo cómo un pez dorado nada por el aire fuera de su pecera haciendo brazadas aéreas.',
      },
    ],
  },
  {
    id: 'g2a_nfinal_1',
    title: 'Grupo 2 (Parte 1): N final (La transformación final) — Bite → Go',
    hint: 'El participio termina en -n (bitten, broken, chosen...).',
    storyId: 'story2a',
    verbs: [
      {
        base: 'bite',
        past: 'bit',
        participle: 'bitten',
        es: 'Morder',
        image:
          'Una nutria aviadora observa asombrada cómo una dentadura postiza gigante muerde una manzana de metal brillante que cruje y chispea.',
      },
      {
        base: 'break',
        past: 'broke',
        participle: 'broken',
        es: 'Romper',
        image:
          'Una nutria aviadora rompe un vaso cristalino con sus manitas y lo ve transformarse en cascada de arena dorada.',
      },
      {
        base: 'choose',
        past: 'chose',
        participle: 'chosen',
        es: 'Elegir',
        image:
          'Una mano gigante luminosa desciende del cielo y elige a la nutria aviadora señalándola directamente mientras dice "TÚ" con letras brillantes.',
      },
      {
        base: 'drive',
        past: 'drove',
        participle: 'driven',
        es: 'Conducir',
        image:
          'Una nutria aviadora observa fascinada cómo un coche futurista transparente se conduce solo con luces inteligentes de colores neón trazando el camino.',
      },
      {
        base: 'eat',
        past: 'ate',
        participle: 'eaten',
        es: 'Comer',
        image:
          'Una nutria aviadora mira boquiabierta cómo una hamburguesa gigante se come a sí misma mordiéndose sus propias capas en espiral absurdo.',
      },
      {
        base: 'fall',
        past: 'fell',
        participle: 'fallen',
        es: 'Caer',
        image:
          'Una nutria aviadora sostiene una pluma delicada que al soltarla cae como piedra y rompe el suelo creando grietas enormes y explosión de polvo.',
      },
      {
        base: 'fly',
        past: 'flew',
        participle: 'flown',
        es: 'Volar',
        image:
          'Una nutria aviadora vuela junto a un escuadrón de pingüinos con propulsores jet en formación militar dejando estelas de colores en el cielo.',
      },
      {
        base: 'forbid',
        past: 'forbade',
        participle: 'forbidden',
        es: 'Prohibir',
        image:
          'Una nutria aviadora ve cómo un robot policía gigante prohíbe el paso desplegando cinta amarilla luminosa de "NO PASAR" que rodea toda el área con luces parpadeantes.',
      },
      {
        base: 'forget',
        past: 'forgot',
        participle: 'forgotten',
        es: 'Olvidar',
        image:
          'Una nutria aviadora señala confundida hacia una estatua mientras una nube mágica olvida y borra lentamente la cara de la estatua dejándola en blanco.',
      },
      {
        base: 'forgive',
        past: 'forgave',
        participle: 'forgiven',
        es: 'Perdonar',
        image:
          'Una nutria aviadora observa emocionada cómo dos tanques de guerra gigantes se perdonan deteniéndose, bajando sus cañones y abrazándose con sus orugas.',
      },
      {
        base: 'freeze',
        past: 'froze',
        participle: 'frozen',
        es: 'Congelar',
        image:
          'Una nutria aviadora dispara un lanzallamas modificado que congela todo a su paso lanzando llamas de hielo azul cristalino sobre el río.',
      },
      {
        base: 'give',
        past: 'gave',
        participle: 'given',
        es: 'Dar',
        image:
          'Una nutria aviadora recibe con sus manitas extendidas regalos flotantes brillantes que un río de luz dorada le da mientras fluye por el aire.',
      },
      {
        base: 'go',
        past: 'went',
        participle: 'gone',
        es: 'Ir',
        image:
          'Una nutria aviadora pilotea un cohete plateado que se va despegando a toda velocidad y desaparece siendo absorbido por un agujero negro giratorio y brillante.',
      },
    ],
  },
  {
    id: 'g2b_nfinal_2',
    title: 'Grupo 2 (Parte 2): N final (La transformación final) — Grow → Write',
    hint: 'Participios en -n y escenas conectadas (grown, known, written...).',
    storyId: 'story2b',
    verbs: [
      {
        base: 'grow',
        past: 'grew',
        participle: 'grown',
        es: 'Crecer',
        image:
          'Un mono científico mide asombrado con su regla cómo una planta crece tan rápido que rompe el techo con explosión de escombros.',
      },
      {
        base: 'hide',
        past: 'hid',
        participle: 'hidden',
        es: 'Esconderse',
        image:
          'Un mono científico observa fascinado con su lupa cómo un camaleón gigante se esconde cambiando de color y desapareciendo completamente.',
      },
      {
        base: 'know',
        past: 'knew',
        participle: 'known',
        es: 'Saber',
        image:
          'Un mono científico con gafas hace preguntas y un libro gigante sabe las respuestas abriendo sus páginas solo con letras brillantes.',
      },
      {
        base: 'lie',
        past: 'lay',
        participle: 'lain',
        es: 'Yacer/Tumbarse',
        image:
          'Un mono científico descubre sorprendido cómo una estatua de mármol se acuesta a dormir una siesta con ojos cerrados y ronquidos.',
      },
      {
        base: 'ride',
        past: 'rode',
        participle: 'ridden',
        es: 'Montar',
        image:
          'Un mono científico monta emocionado sobre un tiranosaurio rex gigante con sombrero de vaquero agarrándose de las riendas.',
      },
      {
        base: 'rise',
        past: 'rose',
        participle: 'risen',
        es: 'Levantarse',
        image:
          'Un mono científico señala confundido con su telescopio cómo el sol se levanta de noche y es azul brillante en lugar de amarillo.',
      },
      {
        base: 'see',
        past: 'saw',
        participle: 'seen',
        es: 'Ver',
        image:
          'Un mono científico ve maravillado cómo un telescopio gigante con ruedas pasea solo por la calle señalando cosas con láser rojo.',
      },
      {
        base: 'show',
        past: 'showed',
        participle: 'shown',
        es: 'Mostrar',
        image:
          'Un mono científico aplaude emocionado mientras un pavo real muestra desplegando una pantalla de cine completa en su cola con película proyectándose.',
      },
      {
        base: 'tear',
        past: 'tore',
        participle: 'torn',
        es: 'Rasgar',
        image:
          'Un mono científico salta asustado cuando un papel gigante se rasga y grita con boca abierta lanzando sonido visible.',
      },
      {
        base: 'wake',
        past: 'woke',
        participle: 'woken',
        es: 'Despertar',
        image:
          'Un mono científico duerme en su escritorio y un reloj despertador gigante lo despierta tirándole un balde de agua fría encima.',
      },
      {
        base: 'wear',
        past: 'wore',
        participle: 'worn',
        es: 'Llevar puesto',
        image:
          'Un mono científico observa divertido cómo un maniquí lleva puesto 10 abrigos a la vez apilados absurdamente uno sobre otro.',
      },
      {
        base: 'write',
        past: 'wrote',
        participle: 'written',
        es: 'Escribir',
        image:
          'Un mono científico mira boquiabierto cómo una pluma estilográfica gigante escribe sola en el aire con tinta de neón formando palabras flotantes.',
      },
    ],
  },
  {
    id: 'g3_oeo',
    title: 'Grupo 3: O–E–O (Cambio con “o” central)',
    hint: 'Spoke / spoken, stole / stolen: escucha el “o” en el cambio.',
    storyId: 'story3',
    verbs: [
      {
        base: 'speak',
        past: 'spoke',
        participle: 'spoken',
        es: 'Hablar',
        image:
          'Un búho sabio observa sorprendido con sus gafas cómo un loro vestido de político da un discurso presidencial dramático desde un podio dorado.',
      },
      {
        base: 'steal',
        past: 'stole',
        participle: 'stolen',
        es: 'Robar',
        image:
          'Un búho sabio gira su cabeza 270° siguiendo con desaprobación a un mapache ladrón que roba la luna con una red gigante.',
      },
    ],
  },
  {
    id: 'g4_ow_ew_own',
    title: 'Grupo 4: -ow → -ew → -own (Transformación en vuelo)',
    hint: 'Ow → ew → own (throw–threw–thrown).',
    storyId: 'story3',
    verbs: [
      {
        base: 'throw',
        past: 'threw',
        participle: 'thrown',
        es: 'Lanzar',
        image:
          'Un búho sabio toma notas asombrado en su libreta mientras un brazo mecánico gigante lanza pelotas de béisbol directamente al espacio con explosión de estrellas.',
      },
      {
        base: 'grow',
        past: 'grew',
        participle: 'grown',
        es: 'Crecer',
        image:
          'Un búho sabio mide con su regla extensible y expresión fascinada cómo una planta crece tan rápido que rompe el techo con explosión de escombros.',
      },
      {
        base: 'know',
        past: 'knew',
        participle: 'known',
        es: 'Saber',
        image:
          'Un búho sabio con sus gafas ajustadas lee concentrado un libro flotante gigante que abre sus páginas solo y responde preguntas brillando.',
      },
    ],
  },
  {
    id: 'g5_ake_ook_aken',
    title: 'Grupo 5: -ake → -ook → -aken (Los agitadores)',
    hint: 'Ake → ook → aken (take–took–taken).',
    storyId: 'story3',
    verbs: [
      {
        base: 'shake',
        past: 'shook',
        participle: 'shaken',
        es: 'Agitar',
        image:
          'Un búho sabio sostiene su birrete con una garra mientras observa aterrado cómo una licuadora gigante agita un edificio entero con tremenda vibración.',
      },
      {
        base: 'take',
        past: 'took',
        participle: 'taken',
        es: 'Tomar',
        image:
          'Un búho sabio mira por su telescopio con curiosidad extrema mientras una garra mecánica de arcade gigante toma un coche completo del estacionamiento.',
      },
    ],
  },
];

export const storiesABC = {
  story1:
    'El usuario entra al laboratorio y escucha un disparo de salida: la carrera empieza (begin–began–begun). De repente, una botella gigante bebe de un vaso (drink–drank–drunk). Un teléfono gigante suena y baila (ring–rang–rung). Un gigante toca un botón y se encoge hasta volverse enano (shrink–shrank–shrunk). En el centro, un micrófono canta ópera solo (sing–sang–sung). Un barco de papel se hunde en gelatina (sink–sank–sunk). El aire se llena de un olor extraño: un zorrillo con perfume francés apesta (stink–stank–stunk). Finalmente, un pez nada en el aire fuera de la pecera (swim–swam–swum).',
  story2a:
    'El usuario entra a la sala y ve cómo una dentadura postiza muerde una manzana de metal (bite–bit–bitten). A su lado, un vaso cercano se rompe y se convierte en arena (break–broke–broken). Del techo baja una mano gigante que lo elige a él (choose–chose–chosen). En la esquina aparece un coche futurista que se conduce solo con luces inteligentes (drive–drove–driven), y el usuario decide subirse.\nDe repente, en el asiento del copiloto hay una hamburguesa que se come a sí misma (eat–ate–eaten). Una pluma cae sobre el parabrisas y lo rompe como si fuera pesada (fall–fell–fallen). Por el vidrio roto, desde los puestos traseros, salen pingüinos con propulsores que vuelan en formación (fly–flew–flown).\nEl coche avanza y un robot policía aparece frente a él, prohíbe el paso colocando cinta amarilla (forbid–forbade–forbidden). El usuario mira por el retrovisor y ve una nube que olvida y borra la cara de una estatua (forget–forgot–forgotten). En esas mismas nubes, dos tanques de guerra se perdonan y se abrazan (forgive–forgave–forgiven).\nEl auto lo lleva hacia un río, y el usuario usa un lanzallamas que congela el agua disparando hielo azul (freeze–froze–frozen). El río congelado da regalos flotantes que llegan solos a sus manos (give–gave–given). Finalmente, el coche se transforma en un cohete que va y desaparece en un agujero negro (go–went–gone).',
  story2b:
    'El usuario avanza por la sala y observa cómo una planta crece tan rápido que rompe el techo (grow–grew–grown). Entre las ramas aparece un camaleón que se esconde cambiando de color y mimetizándose en el árbol (hide–hid–hidden). Intrigado por lo que sucede, el usuario se acerca a un libro gigante que sabe y le responde todas las preguntas (know–knew–known).\nMás adelante, encuentra una estatua que yace acostada tomando una siesta (lie–lay–lain). Por una ventana, alcanza a ver a un vaquero que monta un tiranosaurio rex rugiente (ride–rode–ridden). De repente, un sol azul se levanta en plena noche, bostezando mientras ilumina la sala (rise–rose–risen).\nEl usuario sigue caminando y se topa con un telescopio con ruedas que ve todo y señala con un láser (see–saw–seen). El láser apunta hacia un pavo real que despliega su cola y muestra una pantalla de cine brillante, acompañada de un sonido al abrir sus plumas (show–showed–shown). En la pantalla aparece un papel que se rasga y grita como si tuviera vida (tear–tore–torn).\nDe pronto, suena un reloj despertador y el usuario despierta porque le han tirado un balde de agua (wake–woke–woken). Confundido, nota que está sudando porque lleva puesto diez abrigos a la vez (wear–wore–worn). Finalmente, toma una pluma mágica que escribe sola en el aire con tinta de neón, registrando todo este sueño increible (write–wrote–written).',
  story3:
    'En la última sala del laboratorio, un loro habla dando un discurso presidencial (speak–spoke–spoken). De repente, un ladrón invisible roba la luna (steal–stole–stolen). Un brazo mecánico lanza pelotas de béisbol al espacio (throw–threw–thrown). A su lado, una planta crece tan rápido que rompe el techo (grow–grew–grown). Un libro gigante sabe y revela secretos (know–knew–known). En el centro, una licuadora gigante agita un edificio entero (shake–shook–shaken). Finalmente, una garra de máquina de peluches toma un coche (take–took–taken).',
};

function getABCPalaceImageUrl(verbBase) {
  const base = String(verbBase ?? '').trim().toLowerCase();
  if (!base) return '';

  const publicBase = String(process.env.PUBLIC_URL ?? '').trim();
  const prefix = publicBase ? `${publicBase.replace(/\/$/, '')}/` : '';

  return `${prefix}img/ABC/${base.toUpperCase()}.webp`;
}

function getABCPalaceImageFallbackUrl(verbBase) {
  const base = String(verbBase ?? '').trim().toLowerCase();
  if (!base) return '';

  const publicBase = String(process.env.PUBLIC_URL ?? '').trim();
  const prefix = publicBase ? `${publicBase.replace(/\/$/, '')}/` : '';

  return `${prefix}img/ABC/${base}.webp`;
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
  // No-ABC (mezcla de otros pisos para variedad)
  { base: 'bet', past: 'bet', participle: 'bet', es: 'apostar', pattern: 'AAA' },
  { base: 'cut', past: 'cut', participle: 'cut', es: 'cortar', pattern: 'AAA' },
  { base: 'let', past: 'let', participle: 'let', es: 'permitir', pattern: 'AAA' },
  { base: 'put', past: 'put', participle: 'put', es: 'poner', pattern: 'AAA' },
  { base: 'read', past: 'read', participle: 'read', es: 'leer', pattern: 'AAA' },
  { base: 'set', past: 'set', participle: 'set', es: 'fijar/colocar', pattern: 'AAA' },

  { base: 'come', past: 'came', participle: 'come', es: 'venir', pattern: 'ABA' },
  { base: 'run', past: 'ran', participle: 'run', es: 'correr', pattern: 'ABA' },
  { base: 'become', past: 'became', participle: 'become', es: 'convertirse', pattern: 'ABA' },
  { base: 'overcome', past: 'overcame', participle: 'overcome', es: 'superar', pattern: 'ABA' },

  { base: 'build', past: 'built', participle: 'built', es: 'construir', pattern: 'ABB' },
  { base: 'meet', past: 'met', participle: 'met', es: 'conocer', pattern: 'ABB' },
  { base: 'keep', past: 'kept', participle: 'kept', es: 'mantener', pattern: 'ABB' },
  { base: 'sleep', past: 'slept', participle: 'slept', es: 'dormir', pattern: 'ABB' },
  { base: 'feel', past: 'felt', participle: 'felt', es: 'sentir', pattern: 'ABB' },
  { base: 'leave', past: 'left', participle: 'left', es: 'irse/dejar', pattern: 'ABB' },
];

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function fillBlank(sentence, word) {
  return sentence.replace('___', word);
}

function getContextTemplates() {
  // Oraciones profesionales/educativas.
  // Importante: el español debe ser natural y NO debe insertar el verbo en inglés.
  return {
    begin: {
      present: { en: 'We ___ every session with a short recap.', esFull: 'Comenzamos cada sesión con un breve repaso.' },
      past: { en: 'Yesterday the course ___ with a short diagnostic test.', esFull: 'Ayer el curso comenzó con una prueba diagnóstica breve.' },
      perf: { en: 'This week the project has ___ with clear goals and roles.', esFull: 'Esta semana el proyecto ha comenzado con objetivos y roles claros.' },
    },
    drink: {
      present: { en: 'I ___ water during breaks to stay focused.', esFull: 'Bebo agua durante los descansos para mantenerme concentrado.' },
      past: { en: 'Yesterday I ___ water during the break.', esFull: 'Ayer bebí agua durante el descanso.' },
      perf: { en: 'Today I have ___ enough water to stay focused.', esFull: 'Hoy he bebido suficiente agua para mantenerme concentrado.' },
    },
    ring: {
      present: { en: 'Phones ___ all the time in shared workspaces.', esFull: 'Los teléfonos suenan todo el tiempo en espacios de trabajo compartidos.' },
      past: { en: 'Yesterday the phone ___ during the meeting.', esFull: 'Ayer el teléfono sonó durante la reunión.' },
      perf: { en: 'This morning my phone has ___ three times already.', esFull: 'Esta mañana mi teléfono ha sonado tres veces.' },
    },
    shrink: {
      present: { en: 'Some fabrics ___ if you wash them in hot water.', esFull: 'Algunas telas encogen si las lavas con agua caliente.' },
      past: { en: 'Yesterday the fabric ___ after the first wash.', esFull: 'Ayer la tela encogió después del primer lavado.' },
      perf: { en: 'This month the budget has ___ due to new constraints.', esFull: 'Este mes el presupuesto se ha reducido debido a nuevas restricciones.' },
    },
    sing: {
      present: { en: 'We ___ a short song to warm up our voices.', esFull: 'Cantamos una canción corta para calentar la voz.' },
      past: { en: 'Yesterday the choir ___ at the end of the ceremony.', esFull: 'Ayer el coro cantó al final de la ceremonia.' },
      perf: { en: 'This semester the group has ___ in several events.', esFull: 'Este semestre el grupo ha cantado en varios eventos.' },
    },
    sink: {
      present: { en: 'Some small boats ___ quickly in rough water.', esFull: 'Algunas embarcaciones pequeñas se hunden rápido en aguas agitadas.' },
      past: { en: 'Yesterday the boat ___ after taking on water.', esFull: 'Ayer el barco se hundió después de entrarle agua.' },
      perf: { en: 'This year several small boats have ___ in the storm season.', esFull: 'Este año varias embarcaciones pequeñas se han hundido en la temporada de tormentas.' },
    },
    stink: {
      present: { en: 'Some cleaning chemicals ___ if you mix them incorrectly.', esFull: 'Algunos químicos de limpieza huelen muy mal si los mezclas incorrectamente.' },
      past: { en: 'Yesterday the trash ___ because the bag tore.', esFull: 'Ayer la basura apestó porque la bolsa se rompió.' },
      perf: { en: 'This week the hallway has ___ due to a plumbing issue.', esFull: 'Esta semana el pasillo ha olido mal por un problema de plomería.' },
    },
    swim: {
      present: { en: 'I ___ twice a week to improve my stamina.', esFull: 'Nado dos veces por semana para mejorar mi resistencia.' },
      past: { en: 'Yesterday I ___ for thirty minutes after work.', esFull: 'Ayer nadé treinta minutos después del trabajo.' },
      perf: { en: 'This month I have ___ regularly to improve my stamina.', esFull: 'Este mes he nadado con regularidad para mejorar mi resistencia.' },
    },

    bite: {
      present: { en: 'Some dogs ___ shoes if they are bored.', esFull: 'Algunos perros muerden zapatos si se aburren.' },
      past: { en: 'Yesterday a dog ___ my shoe near the entrance.', esFull: 'Ayer un perro mordió mi zapato cerca de la entrada.' },
      perf: { en: 'This week a mosquito has ___ me twice at night.', esFull: 'Esta semana un mosquito me ha picado dos veces por la noche.' },
    },
    break: {
      present: { en: 'We ___ the process into smaller steps to make it clear.', esFull: 'Dividimos el proceso en pasos más pequeños para que sea claro.' },
      past: { en: 'Yesterday the glass ___ during transport.', esFull: 'Ayer el vaso se rompió durante el transporte.' },
      perf: { en: 'This quarter the team has ___ the process into clear steps.', esFull: 'Este trimestre el equipo ha desglosado el proceso en pasos claros.' },
    },
    choose: {
      present: { en: 'We ___ a vendor based on quality and support.', esFull: 'Elegimos a un proveedor según la calidad y el soporte.' },
      past: { en: 'Yesterday we ___ a vendor after comparing proposals.', esFull: 'Ayer elegimos a un proveedor después de comparar propuestas.' },
      perf: { en: 'This week we have ___ a simpler approach for the project.', esFull: 'Esta semana hemos elegido un enfoque más simple para el proyecto.' },
    },
    drive: {
      present: { en: 'I ___ to different sites when we run trainings.', esFull: 'Conduzco a distintos lugares cuando damos capacitaciones.' },
      past: { en: 'Yesterday I ___ to the client site for a workshop.', esFull: 'Ayer conduje hasta las instalaciones del cliente para un taller.' },
      perf: { en: 'This month I have ___ to multiple sites for training.', esFull: 'Este mes he conducido a varios lugares por capacitación.' },
    },
    eat: {
      present: { en: 'We ___ lunch between sessions to keep our energy up.', esFull: 'Comemos entre sesiones para mantener la energía.' },
      past: { en: 'Yesterday we ___ lunch between sessions.', esFull: 'Ayer comimos almuerzo entre sesiones.' },
      perf: { en: 'Today I have ___ a balanced meal to keep my energy steady.', esFull: 'Hoy he comido una comida equilibrada para mantener mi energía estable.' },
    },
    fall: {
      present: { en: 'Temperatures often ___ quickly after sunset.', esFull: 'Las temperaturas suelen bajar rápido después del atardecer.' },
      past: { en: 'Yesterday the temperature ___ sharply in the evening.', esFull: 'Ayer la temperatura cayó bruscamente por la tarde.' },
      perf: { en: 'This week sales have ___ after the holiday peak.', esFull: 'Esta semana las ventas han bajado después del pico navideño.' },
    },
    fly: {
      present: { en: 'We ___ to conferences when the schedule allows it.', esFull: 'Volamos a conferencias cuando el calendario lo permite.' },
      past: { en: 'Yesterday I ___ to another city for a conference.', esFull: 'Ayer volé a otra ciudad para una conferencia.' },
      perf: { en: 'This year I have ___ several times for work.', esFull: 'Este año he volado varias veces por trabajo.' },
    },
    forbid: {
      present: { en: 'We ___ phones during exams to avoid distractions.', esFull: 'Prohibimos los teléfonos durante los exámenes para evitar distracciones.' },
      past: { en: 'Yesterday the instructor ___ phones during the exam.', esFull: 'Ayer el instructor prohibió los teléfonos durante el examen.' },
      perf: { en: 'This term the school has ___ late submissions without approval.', esFull: 'Este periodo la institución ha prohibido entregas tardías sin autorización.' },
    },
    forget: {
      present: { en: 'I sometimes ___ my access card if I am in a rush.', esFull: 'A veces olvido mi tarjeta de acceso si voy con prisa.' },
      past: { en: 'Yesterday I ___ my access card at home.', esFull: 'Ayer olvidé mi tarjeta de acceso en casa.' },
      perf: { en: 'This month I have ___ fewer tasks by using reminders.', esFull: 'Este mes he olvidado menos tareas gracias a los recordatorios.' },
    },
    forgive: {
      present: { en: 'We ___ small mistakes and focus on improvement.', esFull: 'Perdonamos errores pequeños y nos enfocamos en mejorar.' },
      past: { en: 'Yesterday I ___ a minor mistake and moved on.', esFull: 'Ayer perdoné un error menor y seguí adelante.' },
      perf: { en: 'This year the team has ___ disagreements to keep collaboration strong.', esFull: 'Este año el equipo ha perdonado desacuerdos para mantener una buena colaboración.' },
    },
    freeze: {
      present: { en: 'Sometimes the screen ___ when the connection is unstable.', esFull: 'A veces la pantalla se congela cuando la conexión es inestable.' },
      past: { en: 'Yesterday the screen ___ during the presentation.', esFull: 'Ayer la pantalla se congeló durante la presentación.' },
      perf: { en: 'This week the app has ___ twice and we investigated the cause.', esFull: 'Esta semana la aplicación se ha quedado congelada dos veces y revisamos la causa.' },
    },
    give: {
      present: { en: 'We ___ clear feedback after each exercise.', esFull: 'Damos retroalimentación clara después de cada ejercicio.' },
      past: { en: 'Yesterday the coach ___ clear feedback after practice.', esFull: 'Ayer el entrenador dio retroalimentación clara después de la práctica.' },
      perf: { en: 'This week the mentor has ___ useful advice to new staff.', esFull: 'Esta semana el mentor ha dado consejos útiles al personal nuevo.' },
    },
    go: {
      present: { en: 'I ___ to the lab on Tuesdays for practice.', esFull: 'Voy al laboratorio los martes para practicar.' },
      past: { en: 'Yesterday we ___ to the lab for a demonstration.', esFull: 'Ayer fuimos al laboratorio para una demostración.' },
      perf: { en: 'This month I have ___ to several meetings with the team.', esFull: 'Este mes he ido a varias reuniones con el equipo.' },
    },

    grow: {
      present: { en: 'We ___ by learning from feedback and practice.', esFull: 'Crecemos aprendiendo de la retroalimentación y la práctica.' },
      past: { en: 'Yesterday the company ___ after launching the new service.', esFull: 'Ayer la empresa creció tras lanzar el nuevo servicio.' },
      perf: { en: 'This year the team has ___ in confidence and skills.', esFull: 'Este año el equipo ha crecido en confianza y habilidades.' },
    },
    hide: {
      present: { en: 'We ___ sensitive data to protect privacy.', esFull: 'Ocultamos datos sensibles para proteger la privacidad.' },
      past: { en: 'Yesterday we ___ the backup key in a secure place.', esFull: 'Ayer escondimos la llave de respaldo en un lugar seguro.' },
      perf: { en: 'This week the team has ___ sensitive data to protect privacy.', esFull: 'Esta semana el equipo ha ocultado datos sensibles para proteger la privacidad.' },
    },
    know: {
      present: { en: 'We ___ the policy well because we review it often.', esFull: 'Conocemos bien la política porque la revisamos seguido.' },
      past: { en: 'Yesterday I ___ the answer after reviewing the notes.', esFull: 'Ayer supe la respuesta después de repasar las notas.' },
      perf: { en: 'This week I have ___ the topic better after practice.', esFull: 'Esta semana he entendido mejor el tema gracias a la práctica.' },
    },
    lie: {
      present: { en: 'The documents ___ on the desk until we file them.', esFull: 'Los documentos yacen sobre el escritorio hasta que los archivamos.' },
      past: { en: 'Yesterday the document ___ on the desk all day.', esFull: 'Ayer el documento yació sobre el escritorio todo el día.' },
      perf: { en: 'This week the device has ___ unused in storage.', esFull: 'Esta semana el dispositivo ha permanecido guardado sin usarse.' },
    },
    ride: {
      present: { en: 'I ___ the subway to avoid traffic.', esFull: 'Uso el metro para evitar el tráfico.' },
      past: { en: 'Yesterday I ___ the bus to the training center.', esFull: 'Ayer tomé el autobús hasta el centro de capacitación.' },
      perf: { en: 'This month I have ___ the subway to avoid traffic.', esFull: 'Este mes he usado el metro para evitar el tráfico.' },
    },
    rise: {
      present: { en: 'Costs often ___ when demand increases.', esFull: 'Los costos suelen subir cuando aumenta la demanda.' },
      past: { en: 'Yesterday prices ___ after the announcement.', esFull: 'Ayer los precios subieron después del anuncio.' },
      perf: { en: 'This year costs have ___ due to inflation.', esFull: 'Este año los costos han aumentado por la inflación.' },
    },
    see: {
      present: { en: 'We ___ good results when we practice consistently.', esFull: 'Vemos buenos resultados cuando practicamos con constancia.' },
      past: { en: 'Yesterday I ___ the error immediately during testing.', esFull: 'Ayer vi el error de inmediato durante las pruebas.' },
      perf: { en: 'This week we have ___ improvements in the results.', esFull: 'Esta semana hemos visto mejoras en los resultados.' },
    },
    show: {
      present: { en: 'We ___ progress in every session.', esFull: 'Mostramos avances en cada sesión.' },
      past: { en: 'Yesterday the trainer ___ the correct steps on the screen.', esFull: 'Ayer el instructor mostró los pasos correctos en la pantalla.' },
      perf: { en: 'This month the team has ___ progress in every session.', esFull: 'Este mes el equipo ha mostrado avances en cada sesión.' },
    },
    tear: {
      present: { en: 'Some labels ___ easily when you remove them.', esFull: 'Algunas etiquetas se rasgan fácilmente al quitarlas.' },
      past: { en: 'Yesterday the paper ___ when I removed the label.', esFull: 'Ayer el papel se rasgó cuando quité la etiqueta.' },
      perf: { en: 'This week the old banner has ___ in several places.', esFull: 'Esta semana la pancarta vieja se ha rasgado en varias partes.' },
    },
    wake: {
      present: { en: 'I ___ early to study consistently.', esFull: 'Me despierto temprano para estudiar con constancia.' },
      past: { en: 'Yesterday I ___ early to prepare for the exam.', esFull: 'Ayer me desperté temprano para prepararme para el examen.' },
      perf: { en: 'This week I have ___ earlier to study consistently.', esFull: 'Esta semana me he despertado más temprano para estudiar con constancia.' },
    },
    wear: {
      present: { en: 'I ___ safety gear on every site visit.', esFull: 'Uso equipo de seguridad en cada visita.' },
      past: { en: 'Yesterday I ___ formal clothes for the presentation.', esFull: 'Ayer llevé ropa formal para la presentación.' },
      perf: { en: 'This month I have ___ safety gear during all site visits.', esFull: 'Este mes he usado equipo de seguridad en todas las visitas.' },
    },
    write: {
      present: { en: 'I ___ a short summary after each meeting.', esFull: 'Escribo un resumen breve después de cada reunión.' },
      past: { en: 'Yesterday I ___ a short summary after the meeting.', esFull: 'Ayer escribí un resumen breve después de la reunión.' },
      perf: { en: 'This week I have ___ three reports for the project.', esFull: 'Esta semana he escrito tres informes para el proyecto.' },
    },

    speak: {
      present: { en: 'We ___ about priorities at the start of the week.', esFull: 'Hablamos de prioridades al inicio de la semana.' },
      past: { en: 'Yesterday the speaker ___ clearly during the workshop.', esFull: 'Ayer el ponente habló con claridad durante el taller.' },
      perf: { en: 'This month I have ___ with the team about priorities.', esFull: 'Este mes he hablado con el equipo sobre prioridades.' },
    },
    steal: {
      present: { en: 'Thieves sometimes ___ devices from parked cars.', esFull: 'A veces los ladrones roban dispositivos de autos estacionados.' },
      past: { en: 'Yesterday someone ___ a laptop from the office.', esFull: 'Ayer alguien robó una laptop de la oficina.' },
      perf: { en: 'This year thieves have ___ several devices in the area.', esFull: 'Este año han robado varios dispositivos en la zona.' },
    },

    throw: {
      present: { en: 'We ___ away outdated documents securely.', esFull: 'Tiramos documentos antiguos de forma segura.' },
      past: { en: 'Yesterday the player ___ the ball too far.', esFull: 'Ayer el jugador lanzó la pelota demasiado lejos.' },
      perf: { en: 'This week I have ___ away outdated documents securely.', esFull: 'Esta semana he tirado documentos antiguos de forma segura.' },
    },

    shake: {
      present: { en: 'Some drills ___ the building a little.', esFull: 'Algunos simulacros sacuden un poco el edificio.' },
      past: { en: 'Yesterday the building ___ during the earthquake drill.', esFull: 'Ayer el edificio se sacudió durante el simulacro de sismo.' },
      perf: { en: 'This week the news has ___ everyone’s confidence a bit.', esFull: 'Esta semana las noticias han sacudido un poco la confianza de todos.' },
    },
    take: {
      present: { en: 'I ___ notes during trainings to remember key points.', esFull: 'Tomo apuntes durante las capacitaciones para recordar lo importante.' },
      past: { en: 'Yesterday I ___ notes during the training.', esFull: 'Ayer tomé apuntes durante la capacitación.' },
      perf: { en: 'This week I have ___ a short course on safety.', esFull: 'Esta semana he tomado un curso corto de seguridad.' },
    },
  };
}

function buildContextQuestionsForGroup(group) {
  const templates = getContextTemplates();

  return group.verbs.flatMap((verb) => {
    const tpl = templates[verb.base];

    const pastEn = tpl?.past?.en ?? 'Yesterday I ___ the task.';
    const pastEsFull = tpl?.past?.esFull ?? 'Ayer realicé la tarea.';
    const perfEn = tpl?.perf?.en ?? 'This week I have ___ the task.';
    const perfEsFull = tpl?.perf?.esFull ?? 'Esta semana he realizado la tarea.';

    return [
      {
        verb,
        kind: 'past',
        esFull: pastEsFull,
        en: pastEn,
        answer: verb.past,
        label: 'Past Simple (ABC)',
        note: `Past Simple (ABC): ${verb.base} → ${verb.past}`,
      },
      {
        verb,
        kind: 'perf',
        esFull: perfEsFull,
        en: perfEn,
        answer: verb.participle,
        label: 'Present Perfect (ABC)',
        note: `Present Perfect (ABC): has/have ${verb.participle}`,
      },
    ];
  });
}

export default function ABCGameEngine({ onExit, onViewGallery }) {
  const [stage, setStage] = useState('menu');
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [points, setPoints] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [waitingForNext, setWaitingForNext] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackDetails, setFeedbackDetails] = useState(null);
  const [showFeedbackDetails, setShowFeedbackDetails] = useState(false);

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

  const selectedGroup = useMemo(() => groupsABC.find((g) => g.id === selectedGroupId) ?? null, [selectedGroupId]);

  const speechAvailable = isSpeechSupported();

  useEffect(() => {
    warmUpVoices();
    return () => stopSpeech();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(pointer: coarse)');
    const update = () => setIsCoarsePointer(Boolean(mq.matches));
    update();

    if (typeof mq.addEventListener === 'function') mq.addEventListener('change', update);
    else if (typeof mq.addListener === 'function') mq.addListener(update);

    return () => {
      if (typeof mq.removeEventListener === 'function') mq.removeEventListener('change', update);
      else if (typeof mq.removeListener === 'function') mq.removeListener(update);
    };
  }, []);

  useEffect(() => {
    if (stage !== 'palace') return;
    setPalaceImageError(false);
    setPalaceImageVariant('primary');
  }, [stage, palaceView, palaceTitle]);

  const goPalacePrev = () => {
    stopSpeech();
    setPalaceView((v) => Math.max(0, v - 1));
  };

  const goPalaceNext = () => {
    stopSpeech();
    setPalaceView((v) => Math.min(Math.max(0, palaceList.length - 1), v + 1));
  };

  const resetRoundState = () => {
    stopSpeech();
    setCurrentQuestion(0);
    setScore(0);
    setPoints(0);
    setTotalAnswered(0);
    setWaitingForNext(false);
    setFeedback('');
    setFeedbackDetails(null);
    setShowFeedbackDetails(false);
    setUserAnswer('');
    setHintLevel2(0);
    setSelectedAnswer(null);
    setSelectedIntruders([]);
    setHintLevel4(0);
  };

  const openPalaceAll = () => {
    const all = groupsABC.flatMap((g) => g.verbs);
    setPalaceTitle('Galería Mental (ABC) — Todos los grupos');
    setPalaceList(all);
    setPalaceView(0);
    setStage('palace');
  };

  const openPalaceGroup = (group) => {
    setPalaceTitle(`Galería Mental (ABC) — ${group.title}`);
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
    stopSpeech();
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

        const abcCards = shuffle(selectedGroup.verbs).map((v) => ({ ...v, pattern: 'ABC' }));
        const maxAbc = Math.max(1, totalCards - desiredIntruders);
        const abcCount = Math.min(maxAbc, abcCards.length);
        const intruderCount = Math.min(intruders.length, totalCards - abcCount);

        const pickedAbc = abcCards.slice(0, totalCards - intruderCount);
        const pickedIntruders = shuffle(intruders).slice(0, intruderCount);
        const picks = shuffle([...pickedAbc, ...pickedIntruders]);
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
    setFeedbackDetails(null);
    setShowFeedbackDetails(false);
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
      setFeedbackDetails(null);
      setShowFeedbackDetails(false);
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
      setFeedback(`✅ ¡Correcto! ${q.verb.base} = ${q.correct}. (ABC)`);
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
      setFeedback(`✅ Bien. ${q.base} - ${q.past} - ${q.participle} (ABC)`);
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
      setFeedback('✅ Perfecto. Identificaste los que NO son ABC.');
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

    const base = q?.verb?.base ?? '';
    const past = q?.verb?.past ?? '';
    const participle = q?.verb?.participle ?? '';

    const templates = getContextTemplates();
    const tpl = templates?.[base] ?? null;

    const presentEnTpl = tpl?.present?.en ?? 'Every day I ___ the task.';
    const presentEsFull = tpl?.present?.esFull ?? 'Cada día hago la tarea.';
    const pastEnTpl = tpl?.past?.en ?? 'Yesterday I ___ the task.';
    const pastEsFull = tpl?.past?.esFull ?? 'Ayer realicé la tarea.';
    const perfEnTpl = tpl?.perf?.en ?? 'This week I have ___ the task.';
    const perfEsFull = tpl?.perf?.esFull ?? 'Esta semana he realizado la tarea.';

    const earnedPoints = isCorrect ? pointsForHintLevel(hintLevel4) : 0;
    const hintSummary = hintLevel4 > 0 ? ` (pistas usadas: ${hintLevel4}, puntos: ${earnedPoints.toFixed(1)}/1.0)` : '';

    setFeedbackDetails({
      present: {
        en: fillBlank(presentEnTpl, base),
        es: presentEsFull,
      },
      past: {
        en: fillBlank(pastEnTpl, past),
        es: pastEsFull,
      },
      perf: {
        en: fillBlank(perfEnTpl, participle),
        es: perfEsFull,
      },
      forms: { base, past, participle },
    });
    setShowFeedbackDetails(false);

    if (isCorrect) {
      setScore((prev) => prev + 1);
      setPoints((prev) => prev + earnedPoints);
      setFeedback(`✅ Correcto. ${q.note}${hintSummary}`);
    } else {
      setFeedback(`❌ La forma correcta era "${q.answer}". ${q.note}${hintSummary}`);
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
          <h1 className="text-3xl md:text-5xl font-bold mb-2 flex items-center justify-center gap-3 text-red-300">
            <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-amber-300" />
            Piso 4: Laboratorio de Metamorfosis / Camaleón
          </h1>
          <p className="text-slate-300 text-lg">Patrón ABC: Las 3 formas son distintas</p>
          <p className="text-slate-500 text-sm mt-2">Tip: di en voz alta el cambio de sonido: base → past → participle</p>
        </div>

        {stage !== 'menu' && stage !== 'group_intro' && stage !== 'palace' && stage !== 'results' && (
          <div className="mb-6 bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-700">
            <div className="flex justify-between text-sm mb-2 font-mono text-red-200">
              <span>Progreso: {currentQuestion + 1} / {questions.length}</span>
              <span>Aciertos: {score} | Puntos: {points.toFixed(1)}</span>
            </div>
            <div className="w-full bg-slate-700 h-3 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-red-500 to-amber-400 h-full transition-all duration-500 ease-out"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {stage === 'menu' && (
          <div className="grid gap-6">
            <div className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700 text-center">
              <p className="text-xl mb-3 text-red-200">Regla ABC</p>
              <div className="bg-slate-900/50 p-4 rounded-lg inline-block text-left">
                <p className="font-bold text-amber-300 mb-1">Estructura:</p>
                <p className="font-mono text-slate-200">Base (A) → Past (B) → Participle (C)</p>
                <p className="text-sm text-slate-400 mt-2 italic">"En ABC, cada forma se transforma."</p>
              </div>
              <p className="text-slate-400 mt-4 text-sm">
                Recomendación: primero visita el palacio mental y repite en voz alta: <span className="font-mono">base - past - participle</span>.
              </p>
            </div>

            <button
              onClick={openPalaceAll}
              className="group bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 p-6 rounded-2xl transition-all transform hover:scale-[1.02] shadow-xl flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-full"><Eye className="w-6 h-6" /></div>
                <div className="text-left">
                  <h3 className="text-xl font-bold">1. Visitar el Palacio Mental</h3>
                  <p className="text-amber-100 text-sm">Recorre las escenas absurdas de todos los grupos.</p>
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
              {groupsABC.map((g) => (
                <button
                  key={g.id}
                  onClick={() => startGroup(g.id)}
                  className="bg-slate-700 hover:bg-slate-600 p-6 rounded-xl text-left transition hover:ring-2 ring-red-400"
                >
                  <div className="text-red-200 font-bold mb-2">Entrenamiento</div>
                  <div className="text-white font-bold text-lg">{g.title}</div>
                  <div className="text-slate-300 text-sm mt-1">{g.hint}</div>
                  <div className="text-slate-400 text-xs mt-2">Verbos: {g.verbs.length}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {stage === 'palace' && palaceList[palaceView] && (
          <div className="bg-slate-800 rounded-2xl p-2 md:p-8 border border-slate-700 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-amber-200">{palaceTitle}</h2>
              <button onClick={() => setStage('menu')} className="text-sm bg-slate-900 px-3 py-1 rounded hover:bg-slate-700 transition">Volver</button>
            </div>

            {isCoarsePointer && (
              <div className="mb-3 bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-slate-200 flex items-center gap-2">
                <span className="font-bold">Desliza</span>
                <span className="text-slate-400">para ver la siguiente</span>
                <ChevronLeft className="w-5 h-5" />
              </div>
            )}

            <div className="bg-slate-900/50 p-2 md:p-6 rounded-xl border border-slate-700">
              <div className="text-xl font-black text-amber-300 mb-2">
                {palaceList[palaceView].base} — {palaceList[palaceView].past} — {palaceList[palaceView].participle}
              </div>
              <div className="text-slate-500 -mt-1 mb-2 font-mono text-sm">
                {formatIPATriplet([palaceList[palaceView].base, palaceList[palaceView].past, palaceList[palaceView].participle])}
              </div>
              <div className="text-slate-200 font-semibold mb-3">{palaceList[palaceView].es}</div>

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
                  if (delta < 0) goPalaceNext();
                  else goPalacePrev();
                }}
              >
                <button
                  type="button"
                  onClick={goPalacePrev}
                  disabled={palaceView === 0}
                  aria-label="Anterior"
                  className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 bg-slate-700/80 p-4 rounded-full hover:bg-amber-600 transition z-10 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft />
                </button>

                {!palaceImageError ? (
                  <img
                    key={`${palaceList[palaceView].base}-${palaceImageVariant}`}
                    src={
                      palaceImageVariant === 'primary'
                        ? getABCPalaceImageUrl(palaceList[palaceView].base)
                        : getABCPalaceImageFallbackUrl(palaceList[palaceView].base)
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
                    className={`w-full h-[96svh] md:h-[80vh] rounded-2xl border border-slate-700 shadow-xl bg-slate-950/30 object-contain mb-3 md:mb-4 ${speechAvailable ? 'cursor-pointer' : ''}`}
                  />
                ) : (
                  <div className="w-full h-[96svh] md:h-[80vh] rounded-2xl border border-slate-700 bg-slate-950/30 flex items-center justify-center text-slate-300 mb-3 md:mb-4">
                    No se pudo cargar la imagen para <span className="font-mono ml-2">{palaceList[palaceView].base}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={goPalaceNext}
                  disabled={palaceView === palaceList.length - 1}
                  aria-label="Siguiente"
                  className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 bg-slate-700/80 p-4 rounded-full hover:bg-amber-600 transition z-10 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight />
                </button>
              </div>

              <div className="text-slate-300">{palaceList[palaceView].image}</div>
            </div>

            <div className="flex items-center justify-center mt-4">
              <div className="text-slate-300 text-sm font-mono">
                {palaceView + 1} / {palaceList.length}
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => setStage('menu')}
                className="w-full bg-slate-700 hover:bg-slate-600 px-6 py-4 rounded-xl font-bold transition flex items-center justify-center gap-2"
              >
                <ArrowLeft size={20} /> Volver al menú del Piso 4
              </button>
            </div>
          </div>
        )}

        {stage === 'group_intro' && selectedGroup && (
          <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-amber-200">{selectedGroup.title}</h2>
              <button onClick={() => setStage('menu')} className="text-sm bg-slate-900 px-3 py-1 rounded hover:bg-slate-700 transition">Volver</button>
            </div>

            <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-700 mb-6">
              <p className="text-amber-300 font-bold mb-2">Explicación técnica (rápida)</p>
              <ul className="text-slate-200 space-y-2">
                <li><span className="font-mono">ABC</span>: presente, pasado y participio son diferentes.</li>
                <li>En <span className="font-mono">Past Simple</span> usas la forma <span className="font-mono">Past</span>.</li>
                <li>En <span className="font-mono">Present Perfect</span> usas <span className="font-mono">have/has</span> + <span className="font-mono">Participle</span>.</li>
              </ul>
              <p className="text-slate-400 text-sm mt-3">Estrategia del grupo: {selectedGroup.hint}</p>
            </div>

            <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-700 mb-6">
              <p className="text-red-200 font-bold mb-2">Cómo practicar (orden recomendado)</p>
              <ol className="text-slate-200 list-decimal list-inside space-y-2">
                <li>
                  Visita el palacio mental del grupo (imágenes absurdas).{' '}
                  {typeof onViewGallery === 'function' && (
                    <button
                      type="button"
                      onClick={onViewGallery}
                      className="underline font-bold text-amber-200 hover:text-white"
                    >
                      Ir al Recorrido Mental
                    </button>
                  )}
                </li>
                <li>Repite 2 veces en voz alta: <span className="font-mono">base - past - participle</span>.</li>
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
                className="flex-1 bg-amber-600 hover:bg-amber-500 px-6 py-4 rounded-xl font-bold transition flex items-center justify-center gap-2"
              >
                <ChevronRight size={20} /> Empezar entrenamiento
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <button onClick={() => initLevel('level1')} className="bg-slate-700 hover:bg-slate-600 p-6 rounded-xl text-left transition hover:ring-2 ring-amber-400">
                <div className="flex items-center gap-3 mb-2 text-amber-200"><Brain className="w-5 h-5" /> Nivel 1</div>
                <h3 className="font-bold text-lg">Reconocimiento</h3>
                <p className="text-xs text-slate-400">Significado del verbo</p>
              </button>

              <button onClick={() => initLevel('level2')} className="bg-slate-700 hover:bg-slate-600 p-6 rounded-xl text-left transition hover:ring-2 ring-red-400">
                <div className="flex items-center gap-3 mb-2 text-red-200"><Lightbulb className="w-5 h-5" /> Nivel 2</div>
                <h3 className="font-bold text-lg">Escritura</h3>
                <p className="text-xs text-slate-400">Escribe la forma base</p>
              </button>

              <button onClick={() => initLevel('level3')} className="bg-slate-700 hover:bg-slate-600 p-6 rounded-xl text-left transition hover:ring-2 ring-orange-400">
                <div className="flex items-center gap-3 mb-2 text-orange-200"><X className="w-5 h-5" /> Nivel 3</div>
                <h3 className="font-bold text-lg">Intrusos</h3>
                <p className="text-xs text-slate-400">Marca los que NO son ABC</p>
              </button>

              <button onClick={() => initLevel('level4')} className="bg-slate-700 hover:bg-slate-600 p-6 rounded-xl text-left transition hover:ring-2 ring-emerald-400">
                <div className="flex items-center gap-3 mb-2 text-emerald-200"><Check className="w-5 h-5" /> Nivel 4</div>
                <h3 className="font-bold text-lg">Contexto real</h3>
                <p className="text-xs text-slate-400">Completa con Past o Participle</p>
              </button>
            </div>
          </div>
        )}

        {stage === 'level1' && questions[currentQuestion] && (
          <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-amber-200">Nivel 1: Reconocimiento</h2>
              <button onClick={() => setStage('group_intro')} className="text-sm bg-slate-900 px-3 py-1 rounded hover:bg-slate-700 transition">Volver</button>
            </div>

            <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700 mb-6">
              <p className="text-slate-300 mb-2">¿Qué significa este verbo?</p>
              <div className="text-4xl font-black text-white">{questions[currentQuestion].verb.base}</div>
              <div className="text-slate-500 mt-2 text-sm">Imagen absurda (para tu historia): {questions[currentQuestion].verb.image}</div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {questions[currentQuestion].options.map((opt) => {
                const isSelected = selectedAnswer === opt;
                const isCorrect = opt === questions[currentQuestion].correct;
                const showResult = waitingForNext;
                return (
                  <button
                    key={opt}
                    disabled={waitingForNext}
                    onClick={() => checkAnswerLevel1(opt)}
                    className={`p-4 rounded-xl text-left font-bold transition border ${
                      showResult
                        ? isCorrect
                          ? 'bg-emerald-600/60 border-emerald-400'
                          : isSelected
                            ? 'bg-red-600/60 border-red-400'
                            : 'bg-slate-700 border-slate-600'
                        : 'bg-slate-700 hover:bg-slate-600 border-slate-600'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {feedback && (
              <div className="mt-6 bg-slate-900/50 p-4 rounded-xl border border-slate-700 whitespace-pre-wrap text-slate-100">
                {feedback}
              </div>
            )}

            <div className="flex items-center justify-between mt-6">
              <button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-600 px-4 py-2 rounded-lg font-bold flex items-center gap-2"
              >
                <ChevronLeft size={18} /> Anterior
              </button>
              <button
                onClick={handleNext}
                disabled={!waitingForNext}
                className="bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-amber-500 px-6 py-3 rounded-lg font-bold flex items-center gap-2"
              >
                Siguiente <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {stage === 'level2' && questions[currentQuestion] && (
          <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-amber-200">Nivel 2: Escritura</h2>
              <button onClick={() => setStage('group_intro')} className="text-sm bg-slate-900 px-3 py-1 rounded hover:bg-slate-700 transition">Volver</button>
            </div>

            <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700 mb-6">
              <p className="text-slate-300 mb-2">Escribe la forma base (presente):</p>
              <div className="text-2xl font-black text-amber-300">{questions[currentQuestion].es}</div>
            </div>

            <div className="flex gap-3">
              <input
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                disabled={waitingForNext}
                className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                placeholder="Escribe aquí..."
              />
              <button
                onClick={checkLevel2Answer}
                disabled={waitingForNext}
                className="bg-amber-600 hover:bg-amber-500 disabled:opacity-40 px-5 py-3 rounded-xl font-bold"
              >
                Verificar
              </button>
            </div>

            <button
              type="button"
              onClick={() => setHintLevel2((v) => Math.min(3, v + 1))}
              disabled={waitingForNext || hintLevel2 >= 3}
              className="mt-4 text-sm underline text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {hintLevel2 > 0 ? `Pista ${hintLevel2}/3` : 'Pista'}
            </button>

            {!waitingForNext && hintLevel2 > 0 && (
              <div className="mt-2 text-slate-200 bg-slate-900/60 border border-slate-700 rounded-lg px-4 py-2 inline-block font-mono">
                {buildLevel2WritingHint(questions[currentQuestion].base, hintLevel2)}
              </div>
            )}

            {feedback && (
              <div className="mt-6 bg-slate-900/50 p-4 rounded-xl border border-slate-700 whitespace-pre-wrap text-slate-100">
                {feedback}
              </div>
            )}

            {waitingForNext && (
              <div className="mt-4 bg-slate-900/50 p-5 rounded-xl border border-slate-700">
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

            <div className="flex items-center justify-between mt-6">
              <button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-600 px-4 py-2 rounded-lg font-bold flex items-center gap-2"
              >
                <ChevronLeft size={18} /> Anterior
              </button>
              <button
                onClick={handleNext}
                disabled={!waitingForNext}
                className="bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-amber-500 px-6 py-3 rounded-lg font-bold flex items-center gap-2"
              >
                Siguiente <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {stage === 'level3' && questions[currentQuestion] && (
          <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-amber-200">Nivel 3: Intrusos</h2>
              <button onClick={() => setStage('group_intro')} className="text-sm bg-slate-900 px-3 py-1 rounded hover:bg-slate-700 transition">Volver</button>
            </div>

            <p className="text-slate-300 mb-4">Marca los verbos que <span className="font-bold">NO</span> pertenecen a este patrón/grupo (NO ABC). Si no estás seguro, puedes verificar sin marcar nada.</p>

            <div className="grid md:grid-cols-2 gap-4">
              {questions[currentQuestion].verbs.map((v) => {
                const selected = selectedIntruders.includes(v.base);
                const isIntruder = questions[currentQuestion].intruders.includes(v.base);
                const reveal = waitingForNext;

                const baseClass = selected
                  ? 'bg-red-700/60 border-red-400'
                  : 'bg-slate-700 hover:bg-slate-600 border-slate-600';

                const revealClass = reveal
                  ? (selected && isIntruder
                      ? 'bg-green-900/40 border-green-500'
                      : selected && !isIntruder
                      ? 'bg-red-900/40 border-red-500'
                      : !selected && isIntruder
                      ? 'bg-amber-900/30 border-amber-500'
                      : 'bg-slate-800 border-slate-600')
                  : baseClass;

                return (
                  <button
                    key={v.base}
                    disabled={waitingForNext}
                    onClick={() => toggleIntruder(v.base)}
                    className={`p-4 rounded-xl text-left transition border ${revealClass}`}
                  >
                    <div className="font-black text-white text-lg">{v.base}</div>
                    <div className="text-slate-300 text-sm font-mono">{v.past} — {v.participle}</div>

                    {waitingForNext && (
                      <>
                        <div className="text-slate-200 text-sm mt-2">{v.es}</div>
                        <div className="text-slate-400 text-xs mt-1">Patrón: {v.pattern}</div>
                      </>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={checkIntruders}
                disabled={waitingForNext}
                className="bg-amber-600 hover:bg-amber-500 disabled:opacity-40 px-6 py-3 rounded-xl font-bold"
              >
                Verificar
              </button>
              <button
                onClick={() => setSelectedIntruders([])}
                disabled={waitingForNext}
                className="bg-slate-700 hover:bg-slate-600 disabled:opacity-40 px-6 py-3 rounded-xl font-bold flex items-center gap-2"
              >
                <RefreshCw size={18} /> Limpiar
              </button>
            </div>

            {feedback && (
              <div className="mt-6 bg-slate-900/50 p-4 rounded-xl border border-slate-700 whitespace-pre-wrap text-slate-100">
                {feedback}
              </div>
            )}

            <div className="flex items-center justify-between mt-6">
              <button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-600 px-4 py-2 rounded-lg font-bold flex items-center gap-2"
              >
                <ChevronLeft size={18} /> Anterior
              </button>
              <button
                onClick={handleNext}
                disabled={!waitingForNext}
                className="bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-amber-500 px-6 py-3 rounded-lg font-bold flex items-center gap-2"
              >
                Siguiente <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {stage === 'level4' && questions[currentQuestion] && (
          <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-amber-200">Nivel 4: Contexto real</h2>
              <button onClick={() => setStage('group_intro')} className="text-sm bg-slate-900 px-3 py-1 rounded hover:bg-slate-700 transition">Volver</button>
            </div>

            <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700 mb-6">
              <div className="text-slate-300 text-sm mb-2">{questions[currentQuestion].label}</div>
              <div className="text-slate-200 text-lg font-semibold mb-3">ES: {questions[currentQuestion].esFull}</div>
              <div className="text-white text-lg">EN: {questions[currentQuestion].en}</div>
            </div>

            <div className="flex gap-3">
              <input
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                disabled={waitingForNext}
                className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                placeholder="Escribe la palabra correcta..."
              />
              <button
                onClick={checkLevel4Answer}
                disabled={waitingForNext}
                className="bg-amber-600 hover:bg-amber-500 disabled:opacity-40 px-5 py-3 rounded-xl font-bold"
              >
                Completar
              </button>
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={() => setHintLevel4((v) => Math.min(3, v + 1))}
                disabled={waitingForNext || hintLevel4 >= 3}
                className="text-sm underline text-slate-300 hover:text-white disabled:opacity-40"
              >
                Pedir pista
              </button>
              {hintLevel4 > 0 && (
                <div className="mt-2 bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-slate-100">
                  <div className="text-sm text-slate-300">Pistas:</div>
                  {hintLevel4 >= 1 && (
                    <div>
                      Pista 1 (inicio):{' '}
                      <span className="font-mono font-bold">{(questions[currentQuestion].answer ?? '')[0]}</span>
                    </div>
                  )}
                  {hintLevel4 >= 2 && (
                    <div>
                      Pista 2 (patrón):{' '}
                      <span className="font-mono font-bold">{buildLetterPattern(questions[currentQuestion].answer)}</span>
                    </div>
                  )}
                  {hintLevel4 >= 3 && (
                    <div>
                      Pista 3 (compacta):{' '}
                      <span className="font-mono font-bold">{buildTightPattern(questions[currentQuestion].answer, 2)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {feedback && (
              <div className="mt-6 bg-slate-900/50 p-4 rounded-xl border border-slate-700 text-slate-100">
                <div className="whitespace-pre-wrap">{feedback}</div>

                {waitingForNext && feedbackDetails && (
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => setShowFeedbackDetails((v) => !v)}
                      className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg font-bold"
                    >
                      {showFeedbackDetails ? 'Ocultar retroalimentación' : 'Ver retroalimentación'}
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="bg-amber-600 hover:bg-amber-500 px-4 py-2 rounded-lg font-bold flex items-center gap-2"
                    >
                      Siguiente <ChevronRight size={18} />
                    </button>
                  </div>
                )}

                {waitingForNext && showFeedbackDetails && feedbackDetails && (
                  <div className="mt-4 bg-slate-900/40 border border-slate-700 rounded-xl p-4">
                    <div className="text-slate-200 font-bold mb-2">Retroalimentación (3 tiempos)</div>

                    {speechAvailable && (
                      <div className="mb-3">
                        <div className="text-slate-300 text-sm mb-2">Elige la frase que desees y tócala para escucharla en inglés.</div>
                        <div className="flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={stopSpeech}
                            className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg font-bold"
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
                            className="text-left text-white hover:text-amber-200 underline decoration-dotted"
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
                            className="text-left text-white hover:text-amber-200 underline decoration-dotted"
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
                            className="text-left text-white hover:text-amber-200 underline decoration-dotted"
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

            {!waitingForNext && (
              <div className="flex items-center justify-between mt-6">
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                  className="bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-600 px-4 py-2 rounded-lg font-bold flex items-center gap-2"
                >
                  <ChevronLeft size={18} /> Anterior
                </button>
                <div className="text-slate-400 text-sm">Completa y luego elige: retroalimentación o siguiente.</div>
              </div>
            )}
          </div>
        )}

        {stage === 'results' && (
          <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 shadow-2xl text-center">
            <div className="flex items-center justify-center gap-3 text-amber-300 mb-3">
              <Trophy className="w-8 h-8" />
              <h2 className="text-3xl font-black">Resultados</h2>
            </div>
            <p className="text-slate-200 text-lg">Aciertos: <span className="font-black">{score}</span> / {totalAnswered}</p>
            <p className="text-slate-300 mt-1">Puntos: <span className="font-black">{points.toFixed(1)}</span></p>
            <p className="text-slate-400 mt-2">Vuelve al grupo para seguir practicando los sonidos.</p>

            <div className="mt-6 grid md:grid-cols-2 gap-4">
              <button
                onClick={() => setStage('group_intro')}
                className="bg-slate-700 hover:bg-slate-600 px-6 py-4 rounded-xl font-bold transition flex items-center justify-center gap-2"
              >
                <ArrowLeft size={20} /> Volver al grupo
              </button>
              <button
                onClick={() => { resetRoundState(); setStage('menu'); }}
                className="bg-amber-600 hover:bg-amber-500 px-6 py-4 rounded-xl font-bold transition flex items-center justify-center gap-2"
              >
                <RefreshCw size={20} /> Elegir otro grupo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
