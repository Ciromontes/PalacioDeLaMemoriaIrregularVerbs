import React, { useState } from 'react';
import {
  BookOpen,
  Map as MapIcon,
  ChevronRight,
  Lightbulb,
  ArrowLeft,
  Lock
} from 'lucide-react';

import AAAGameEngine from './AAA_Game_Engine';
import ABAGameEngine from './ABA_Game_Engine';
import ABBGameEngine from './ABB_Game_Engine';
import { verbsABA } from './ABA_Game_Engine';
import { groupsABB } from './ABB_Game_Engine';

// --- DATOS DE LAS IMÁGENES MENTALES (Según tus PDFs) ---
const mentalImages = {
  floor1: [
    { verb: "Put-Put-Put", scene: "Un chef coloca cucharas en los bolsillos de todos." },
    { verb: "Cut-Cut-Cut", scene: "Un carnicero corta aire con cuchillos que no tocan nada." },
    { verb: "Hit-Hit-Hit", scene: "Un boxeador golpea un saco de arena que rebota como pelota." }
  ],
  floor2: [
    { verb: "Become", scene: "Una oruga se vuelve mariposa metálica y luego oruga otra vez." },
    { verb: "Come", scene: "Un perro corre hacia ti, camina hacia atrás y corre hacia ti de nuevo." },
    { verb: "Run", scene: "Un atleta corre, se congela en hielo y vuelve a correr fuego." },
    { verb: "Overcome", scene: "Un saltador salta un edificio, cae y vuelve a saltarlo." }
  ],
  floor3: [
    { verb: "Bend", scene: "Un poste de luz se dobla para mirar un celula" },
    { verb: "Build", scene: "Castores con cascos construyen una presa de legos." },
    { verb: "Burn", scene: "Una tostadora lanza pan quemado al espacio." },
    { verb: "Creep", scene: "Una planta crece rápido arrastrándose por la pared." },
    { verb: "Deal", scene: "Un robot reparte cartas que son rebanadas de pizza." },
    { verb: "Dream", scene: "Una nube de pensamiento sólida flota sobre tu cabeza." },
    { verb: "Feel", scene: "Un corazón de felpa gigante late fuerte." },
    { verb: "Keep", scene: "Una ardilla guarda nueces en una caja fuerte blindada." },
    { verb: "Leave", scene: "Unas botas caminan solas hacia la salida." },
    { verb: "Lend", scene: "Un banco presta paraguas de colores." },
    { verb: "Light", scene: "Una bombilla con piernas ilumina el camino." },
    { verb: "Lose", scene: "Un mapa se borra a sí mismo mientras lo miras." },
    { verb: "Mean", scene: "Un diccionario habla y te explica cosas." },
    { verb: "Meet", scene: "Dos clones chocan las manos y hacen chispas." },
    { verb: "Send", scene: "Un buzón escupe cartas como ametralladora." },
    { verb: "Shoot", scene: "Una cámara de fotos dispara flashes que congelan gente." },
    { verb: "Sit", scene: "Una silla corre debajo de ti justo antes de que caigas." },
    { verb: "Sleep", scene: "Una cama flotante te arrulla en el aire." },
    { verb: "Spend", scene: "Monedas de oro se evaporan al tocarlas." },
    { verb: "Sweep", scene: "Una escoba baila vals con el polvo." },
    { verb: "Weep", scene: "Una estatua llora fuentes de limonada." },
    { verb: "Bring", scene: "Un perro trae un dinosaurio en la boca." },
    { verb: "Buy", scene: "Un carrito de compras se come tu dinero." },
    { verb: "Catch", scene: "Un guante de béisbol gigante atrapa un meteorito." },
    { verb: "Fight", scene: "Dos almohadas luchan con espadas de espuma." },
    { verb: "Seek", scene: "Una lupa gigante busca huellas digitales en el aire." },
    { verb: "Teach", scene: "Un búho con gafas escribe en una pizarra digital." },
    { verb: "Think", scene: "Una bombilla se enciende sobre tu cabeza y explota." },
    { verb: "Lay", scene: "Una gallina mecánica pone huevos de oro." },
    { verb: "Pay", scene: "Un cajero automático te da billetes que cantan." },
    { verb: "Say", scene: "Bocadillos de cómic salen de tu boca y flotan." },
    { verb: "Dig", scene: "Un topo con taladro cava un túnel en el piso." },
    { verb: "Stick", scene: "Zapatos con chicle te dejan pegado al techo." },
    { verb: "Sting", scene: "Una abeja mecánica te pica con una inyección de risa." },
    { verb: "Strike", scene: "Un rayo cae sobre un reloj y lo derrite." },
    { verb: "Swing", scene: "Un mono se balancea en una liana de luces neón." },
    { verb: "Hang", scene: "Un clavo en la pared sostiene una mochila que canta" }
  ]
};

const App = () => {
  const [scene, setScene] = useState('MAIN_MENU');
  const [selectedFloor, setSelectedFloor] = useState(null);

  const MainMenu = () => (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-5xl font-bold mb-4 text-amber-400 drop-shadow-lg">🏰 EL PALACIO DE LOS VERBOS IRREGULARES</h1>
      <p className="text-xl mb-8 max-w-2xl text-slate-300 italic">
        "Donde la gramática no se estudia, se recorre. Transforma los verbos en imágenes y nunca los olvidarás."
      </p>

      <div className="flex flex-col gap-4 w-full max-w-md">
        <button
          onClick={() => setScene('MAP')}
          className="bg-amber-600 hover:bg-amber-500 transition-all p-4 rounded-xl font-bold text-xl flex items-center justify-center gap-2 shadow-xl"
        >
          <MapIcon /> Entrar al Palacio
        </button>

        <button
          onClick={() => setScene('ABOUT')}
          className="bg-slate-800 hover:bg-slate-700 transition-all p-4 rounded-xl font-bold flex items-center justify-center gap-2"
        >
          <BookOpen className="text-amber-400" /> Ver más: la técnica
        </button>

        <button
          onClick={() => setScene('TIPS')}
          className="bg-slate-700 hover:bg-slate-600 transition-all p-4 rounded-xl font-bold flex items-center justify-center gap-2"
        >
          <Lightbulb className="text-amber-400" /> Cofre de Consejos
        </button>
      </div>
    </div>
  );

  const AboutRoom = () => (
    <div className="min-h-screen bg-orange-50 p-6 flex flex-col items-center">
      <div className="max-w-3xl w-full bg-white p-8 rounded-2xl shadow-2xl border-t-8 border-amber-700">
        <button onClick={() => setScene('MAIN_MENU')} className="flex items-center text-amber-800 font-bold mb-4 hover:underline">
          <ArrowLeft size={20} /> Volver al Hall
        </button>

        <h2 className="text-3xl font-bold text-amber-900 mb-4 flex items-center gap-2">
          <BookOpen /> 🏰 El Palacio de los verbos irregulares
        </h2>
        <p className="text-lg text-slate-700 italic mb-6">"Donde la gramática no se estudia, se recorre. Transforma los verbos en imágenes y nunca los olvidarás."</p>

        <div className="space-y-5 text-slate-800 text-lg leading-relaxed">
          <p>
            Aprender verbos irregulares puede parecer una tarea interminable… hasta que descubres que tu mente recuerda mejor lo visual, lo absurdo y lo espacial. El palacio de la memoria es una técnica milenaria de la mnemotecnia: ya en la antigua Grecia, oradores y filósofos recorrían mentalmente edificios imaginarios para recordar discursos completos. Hoy, esa misma estrategia se aplica al aprendizaje de idiomas, con resultados sorprendentes.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <p className="font-bold text-amber-900 mb-2">🪜 Los pisos del palacio</p>
            <p>Piso 1 (AAA): verbos que nunca cambian.</p>
            <p>Piso 2 (ABA): verbos que cambian en pasado, pero regresan en participio.</p>
            <p>Piso 3 (ABB): verbos con habitaciones agrupadas por sonidos.</p>
            <p>Piso 4 (ABC): verbos que se transforman completamente.</p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <p className="font-bold text-amber-900 mb-2">🚶 Cómo recorrerlo</p>
            <p>El trabajo comienza en tu mente, antes de usar la aplicación:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Haz el recorrido mental. Entra a cada piso y observa las escenas absurdas.</li>
              <li>Detente en cada imagen. No pases rápido: crea una historia completa por piso.</li>
              <li>Pronuncia en voz alta los verbos. Repite las tres formas mientras visualizas.</li>
              <li>Usa gestos con las manos. El movimiento corporal refuerza la memoria.</li>
            </ul>
            <p className="mt-4 font-bold text-slate-900">Ejemplo:</p>
            <p>
              Entras al Piso 1 (Espejos) y ves a un perro gigante apostando huesos de oro (bet–bet–bet). Al lado, un televisor transmite a un subastador con megáfono ofreciendo montañas de zapatos gigantes (broadcast–broadcast–broadcast). Tu mente convierte estas imágenes en una historia absurda que nunca olvidarás.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <p className="font-bold text-amber-900 mb-2">📌 Estrategias prácticas</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Divide y Vencerás: No intentes memorizar los 4 pisos en un día. Dedica una semana al Piso 1, otra al Piso 3, etc.</li>
              <li>Usa el espacio real: La cocina puede ser tu Piso 1 (AAA: cut, put, hit). La calle puede ser tu Piso 4 (ABC: drive, fly, grow).</li>
              <li>Aprovecha los derivados: Si aprendes get (got–gotten), ya tienes forget (forgot–forgotten). ¡Trampa legal!</li>
              <li>Añade drama: No digas solo “Speak, Spoke, Spoken”. Di: “¡El loro Speak! Ayer Spoke muy fuerte. Siempre ha Spoken así”. Exagera la historia: la emoción fija el recuerdo.</li>
            </ul>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
            <p className="font-bold text-emerald-900 mb-2">🌟 Beneficios</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Aprendes con imágenes absurdas y divertidas.</li>
              <li>Cada piso es una historia completa, fácil de recorrer y recordar.</li>
              <li>El orden alfabético de los verbos hace que la narrativa fluya naturalmente.</li>
              <li>La aplicación refuerza lo que ya construiste mentalmente, convirtiendo la práctica en un juego.</li>
            </ul>
            <p className="mt-4">
              👉 Con este método, los verbos dejan de ser listas aburridas y se convierten en un viaje mental lleno de escenas memorables, apoyado en una técnica que ha demostrado su eficacia desde la antigüedad.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
            <p className="font-bold text-slate-900 mb-2">Nombres de los pisos</p>
            <p>Palacio de los verbos irregulares:</p>
            <p>Piso 1: Palacio de los Espejos (AAA)</p>
            <p>Piso 2: Palacio Boomerang / Palacio del Yo-Yo (ABA)</p>
            <p>Piso 3: Palacio de los Gemelos (ABB)</p>
            <p>Piso 4 : Palacio del Camaleón (ABC): Cada verbo se transforma como un camaleón que nunca tiene el mismo color.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const TipsRoom = () => (
    <div className="min-h-screen bg-orange-50 p-6 flex flex-col items-center">
      <div className="max-w-2xl w-full bg-white p-8 rounded-2xl shadow-2xl border-t-8 border-amber-700">
        <button onClick={() => setScene('MAIN_MENU')} className="flex items-center text-amber-800 font-bold mb-4 hover:underline">
          <ArrowLeft size={20} /> Volver al Hall
        </button>
        <h2 className="text-3xl font-bold text-amber-900 mb-6 flex items-center gap-2">
          <BookOpen /> Sabiduría del Palacio
        </h2>
        <ul className="space-y-4 text-slate-700 text-lg">
          <li className="bg-amber-100 p-4 rounded-lg"><strong>1. No fuerces la memoria:</strong> Visualiza la escena absurda. Si la imagen es divertida, tu cerebro la guardará gratis.</li>
          <li className="bg-amber-100 p-4 rounded-lg"><strong>2. El Recorrido:</strong> Antes de jugar, visita la galería de imágenes del piso para fijar los objetos comunes en situaciones imposibles.</li>
          <li className="bg-amber-100 p-4 rounded-lg"><strong>3. Sonido y Acción:</strong> Repite las formas del verbo en voz alta mientras imaginas la escena.</li>
        </ul>
      </div>
    </div>
  );

  const PalaceMap = () => (
    <div className="min-h-screen bg-slate-800 p-8">
      <button onClick={() => setScene('MAIN_MENU')} className="text-white flex items-center mb-8 hover:text-amber-400 transition-colors">
        <ArrowLeft className="mr-2" /> Salir al Menú Principal
      </button>
      <h2 className="text-4xl font-bold text-white mb-12 text-center">Selecciona un Piso</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {[
          { id: 1, name: "Palacio de los Espejos", pattern: "AAA", color: "bg-blue-600", desc: "Verbos que nunca cambian" },
          { id: 2, name: "Palacio Boomerang / Palacio del Yo-Yo", pattern: "ABA", color: "bg-green-600", desc: "Cambian en pasado, regresan en participio" },
          { id: 3, name: "Palacio de los Gemelos", pattern: "ABB", color: "bg-purple-600", desc: "Pasado y participio idénticos" },
          { id: 4, name: "Palacio del Camaleón", pattern: "ABC", color: "bg-red-600", desc: "Cada verbo se transforma", locked: true },
        ].map((floor) => (
          <div
            key={floor.id}
            onClick={() => { if (!floor.locked) { setSelectedFloor(floor.id); setScene('GALLERY'); } }}
            className={`${floor.color} ${floor.locked ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 cursor-pointer'} transition-all p-6 rounded-2xl shadow-2xl relative overflow-hidden group`}
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded uppercase tracking-widest">{floor.pattern}</span>
                <h3 className="text-2xl font-bold text-white mt-2">Piso {floor.id}: {floor.name}</h3>
                <p className="text-white/80 mt-1">{floor.desc}</p>
              </div>
              {floor.locked ? <Lock className="text-white/50" /> : <ChevronRight className="text-white group-hover:translate-x-2 transition-transform" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const MentalGallery = () => {
    const capitalize = (w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w);

    return (
      <div className="min-h-screen bg-slate-100 p-8">
        <button onClick={() => setScene('MAP')} className="text-slate-600 flex items-center mb-6 font-bold">
          <ArrowLeft className="mr-2" /> Volver al Mapa
        </button>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-8 rounded-3xl shadow-lg border-2 border-slate-200">
            <h2 className="text-3xl font-bold mb-2 text-slate-800">Recorrido Mental: Piso {selectedFloor}</h2>
            <p className="text-slate-500 mb-8 italic">Visualiza estas escenas antes de comenzar el desafío.</p>

            {(selectedFloor === 2 || selectedFloor === 3) && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 text-slate-700">
                <p className="font-bold mb-1">Sugerencia de visualización</p>
                <p>
                  No memorices como lista: crea una historia con las imágenes (una escena lleva a la siguiente). Para recordar las acciones,
                  piensa que los verbos están en orden alfabético.
                </p>
              </div>
            )}

            {selectedFloor === 2 && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-xs uppercase tracking-widest text-slate-500">
                      <th className="py-3 px-3 border-b">Presente</th>
                      <th className="py-3 px-3 border-b">Pasado</th>
                      <th className="py-3 px-3 border-b">Participio</th>
                      <th className="py-3 px-3 border-b">Español</th>
                      <th className="py-3 px-3 border-b">Imagen Absurda</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...verbsABA].sort((a, b) => a.base.localeCompare(b.base)).map((v) => (
                      <tr key={v.base} className="align-top">
                        <td className="py-3 px-3 border-b font-black text-amber-700">{capitalize(v.base)}</td>
                        <td className="py-3 px-3 border-b font-mono text-slate-700">{capitalize(v.past)}</td>
                        <td className="py-3 px-3 border-b font-mono text-slate-700">{capitalize(v.participle)}</td>
                        <td className="py-3 px-3 border-b font-semibold text-slate-700">{v.es}</td>
                        <td className="py-3 px-3 border-b text-slate-700">{v.image}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {selectedFloor === 3 && (
              <div className="space-y-6">
                {groupsABB.map((g) => (
                  <div key={g.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                    <h3 className="text-lg font-bold text-slate-800 mb-3">{g.title}</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="text-xs uppercase tracking-widest text-slate-500">
                            <th className="py-3 px-3 border-b">Presente</th>
                            <th className="py-3 px-3 border-b">Pasado/Part.</th>
                            <th className="py-3 px-3 border-b">Español</th>
                            <th className="py-3 px-3 border-b">Imagen Absurda</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[...g.verbs].sort((a, b) => a.base.localeCompare(b.base)).map((v) => (
                            <tr key={v.base} className="align-top">
                              <td className="py-3 px-3 border-b font-black text-purple-700">{capitalize(v.base)}</td>
                              <td className="py-3 px-3 border-b font-mono text-slate-700">{capitalize(v.past)}</td>
                              <td className="py-3 px-3 border-b font-semibold text-slate-700">{v.es}</td>
                              <td className="py-3 px-3 border-b text-slate-700">{v.image}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedFloor !== 2 && selectedFloor !== 3 && (
              <div className="grid gap-6">
                {(mentalImages[`floor${selectedFloor}`] || []).map((img, i) => (
                  <div key={i} className="flex gap-4 items-center bg-slate-50 p-4 rounded-xl border-l-4 border-amber-500">
                    <div className="text-2xl font-black text-amber-600 min-w-[150px]">{img.verb}</div>
                    <div className="text-slate-700 text-lg">{img.scene}</div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => {
                if (selectedFloor === 1) setScene('GAME_AAA');
                else if (selectedFloor === 2) setScene('GAME_ABA');
                else if (selectedFloor === 3) setScene('GAME_ABB');
                else setScene('MAP');
              }}
              className="mt-10 w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
            >
              ¡Estoy listo para el desafío!
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="font-sans">
      {scene === 'MAIN_MENU' && <MainMenu />}
      {scene === 'ABOUT' && <AboutRoom />}
      {scene === 'TIPS' && <TipsRoom />}
      {scene === 'MAP' && <PalaceMap />}
      {scene === 'GALLERY' && <MentalGallery />}
      {scene === 'GAME_AAA' && (
        <AAAGameEngine onExit={() => setScene('MAP')} />
      )}
      {scene === 'GAME_ABA' && (
        <ABAGameEngine onExit={() => setScene('MAP')} />
      )}
      {scene === 'GAME_ABB' && (
        <ABBGameEngine onExit={() => setScene('MAP')} />
      )}
    </div>
  );
};

export default App;