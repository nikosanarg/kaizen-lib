/**
 * Catálogo de camisetas de Haxball, copiado de `global_shirts` en
 * `kaizen-bot/structure/base.js` — mismo patrón que cualquier catálogo
 * portado entre repos de Kaizen (ver `tagsValoracionCancha.ts` en
 * mixbol-front): **tocar el original implica revisar esta copia**, no hay
 * sincronización automática.
 *
 * Dos cosas del original que NO se trajeron:
 * - El 4to valor numérico de cada entrada (`[angulo, colorTexto, colores, N,
 *   nombreNarrativo]`). Sólo lo usa el propio código para nada: el único
 *   consumo real es `room.setTeamColors(equipo, shirt[0], shirt[1],
 *   shirt[2])`, que ni siquiera lee ese 4to valor. No se sabe qué representaba
 *   y no se inventa un significado acá.
 * - El texto narrativo de chat (`" booocaaa"`, `"l equipo con camiseta
 *   oscura"`): está pensado para completar una frase ("cambiaste tu camiseta
 *   a la de..."), no para ser un nombre de exhibición. `nombre` es un rótulo
 *   prolijo nuevo, escrito para esta lista.
 */

export interface CamisetaHaxball {
  /** Nombre para mostrar en un selector o como texto alternativo. */
  nombre: string;
  /** Ángulo de las franjas, en grados — el mismo valor que recibe `room.setTeamColors`. */
  angulo: number;
  /** Color del número de jugador sobre el disco, en Haxball. `DiscoHaxball` no lo dibuja hoy (no hay número que mostrar fuera de una partida). */
  colorTexto: string;
  /** 1 a 3 colores que arman las franjas, en el orden en que se ciclan. */
  colores: string[];
}

export const CAMISETAS_HAXBALL = {
  // Equipos de fantasía
  pataflaca: { nombre: 'Pataflaca', angulo: 0, colorTexto: '#ffffff', colores: ['#000000', '#c26366', '#000000'] },
  negro: { nombre: 'Negro', angulo: 0, colorTexto: '#ffffff', colores: ['#000000'] },
  blanco: { nombre: 'Blanco', angulo: 0, colorTexto: '#000000', colores: ['#ffffff'] },
  pink: { nombre: 'Rosa', angulo: 15, colorTexto: '#6b0068', colores: ['#d47b9f', '#e685ac', '#ff94bf'] },
  hack: { nombre: 'Hacker', angulo: 60, colorTexto: '#00ff00', colores: ['#000000', '#002602', '#000000'] },
  red: { nombre: 'Rojo', angulo: 132, colorTexto: '#ffffff', colores: ['#ba0202', '#540101', '#ba0202'] },
  blue: { nombre: 'Azul', angulo: 60, colorTexto: '#ffffff', colores: ['#0080ff', '#004077', '#002033'] },
  lila: { nombre: 'Lila', angulo: 60, colorTexto: '#efff12', colores: ['#ff03d5', '#991188', '#661155'] },
  green: { nombre: 'Verde', angulo: 60, colorTexto: '#f7ff19', colores: ['#44bb1e', '#177711', '#0d3304'] },
  violet: { nombre: 'Violeta', angulo: 13, colorTexto: '#ffffff', colores: ['#6e00ff', '#6e00ff', '#000000'] },
  aqua: { nombre: 'Aguamarina', angulo: 60, colorTexto: '#00ffd5', colores: ['#003029', '#00211c', '#00120f'] },
  salmon: { nombre: 'Salmón', angulo: 60, colorTexto: '#000000', colores: ['#ff5e5e', '#ff8c8c', '#ffbe99'] },
  halloween1: { nombre: 'Vampiro', angulo: 120, colorTexto: '#a2ff00', colores: ['#463e70', '#513f70', '#5c3f70'] },
  halloween2: { nombre: 'Zombie', angulo: 70, colorTexto: '#a80000', colores: ['#00ff11', '#99c211'] },
  tornasolado: { nombre: 'Tornasolado', angulo: 60, colorTexto: '#ffffff', colores: ['#870fff', '#6e42ff', '#4d58ff'] },
  verano: { nombre: 'Verano', angulo: 60, colorTexto: '#072940', colores: ['#ff7100', '#ff7142', '#ff7162'] },

  // Clubes argentinos
  boca: { nombre: 'Boca Juniors', angulo: 90, colorTexto: '#ffffff', colores: ['#0c004d', '#ffd500', '#0c004d'] },
  bocaa: { nombre: 'Boca Juniors (alterna)', angulo: 90, colorTexto: '#ffffff', colores: ['#ffd500', '#0c004d', '#ffd500'] },
  river: { nombre: 'River Plate', angulo: 40, colorTexto: '#000000', colores: ['#ffffff', '#e31212', '#ffffff'] },
  independiente: { nombre: 'Independiente', angulo: 0, colorTexto: '#ffffff', colores: ['#ff0000', '#b50000', '#9e0500'] },
  racing: { nombre: 'Racing Club', angulo: 0, colorTexto: '#000000', colores: ['#00a2ff', '#ffffff', '#00a2ff'] },

  // Clubes sudamericanos
  flamengo: { nombre: 'Flamengo', angulo: 90, colorTexto: '#ffffff', colores: ['#1f1f1f', '#ff1414', '#1f1f1f'] },
  gremio: { nombre: 'Grêmio', angulo: 0, colorTexto: '#ffffff', colores: ['#000000', '#2457ff', '#000000'] },
  fluminense: { nombre: 'Fluminense', angulo: 0, colorTexto: '#ffffff', colores: ['#004537', '#75021a', '#004537'] },
  palmeiras: { nombre: 'Palmeiras', angulo: 0, colorTexto: '#ffffff', colores: ['#004f00', '#003b00', '#004f00'] },
  corinthians: { nombre: 'Corinthians', angulo: 0, colorTexto: '#d60000', colores: ['#ffffff', '#000000', '#ffffff'] },
  penarol: { nombre: 'Peñarol', angulo: 0, colorTexto: '#ffffff', colores: ['#000000', '#ffee00', '#000000'] },
  nacional: { nombre: 'Nacional (Uruguay)', angulo: 40, colorTexto: '#c90000', colores: ['#0011ff', '#ffffff', '#0011ff'] },
  boston: { nombre: 'Boston River', angulo: 40, colorTexto: '#d9ffe0', colores: ['#058717', '#de2f2f', '#058717'] },
  danubio: { nombre: 'Danubio', angulo: 40, colorTexto: '#ff0000', colores: ['#ffffff', '#000000', '#ffffff'] },
  fenix: { nombre: 'Fénix (Uruguay)', angulo: 0, colorTexto: '#a67014', colores: ['#ffffff', '#671f96'] },
  atleticonacional: { nombre: 'Atlético Nacional', angulo: 37, colorTexto: '#dbdbdb', colores: ['#059c19', '#048a16', '#047d14'] },
  millonarios: { nombre: 'Millonarios', angulo: 37, colorTexto: '#dbdbdb', colores: ['#0843a8', '#073b94', '#063380'] },

  // Selecciones
  argentina: { nombre: 'Argentina', angulo: 0, colorTexto: '#000000', colores: ['#96c7ff', '#ffffff', '#96c7ff'] },
  españa: { nombre: 'España', angulo: 90, colorTexto: '#000000', colores: ['#e61700', '#ffe121', '#e61700'] },
  inglaterra: { nombre: 'Inglaterra', angulo: 40, colorTexto: '#de0000', colores: ['#d7f0ff', '#ffffff', '#d7f0ff'] },
  francia: { nombre: 'Francia', angulo: 90, colorTexto: '#ffffff', colores: ['#156485', '#26294f', '#1b1d38'] },
  alemania: { nombre: 'Alemania', angulo: 270, colorTexto: '#ffffff', colores: ['#ffef5e', '#ff120a', '#002033'] },
  italia: { nombre: 'Italia', angulo: 0, colorTexto: '#000000', colores: ['#00ff00', '#fee8ff', '#ff1c03'] },
  brasil: { nombre: 'Brasil', angulo: 90, colorTexto: '#11520a', colores: ['#4ac900', '#fff700', '#fff700'] },
  uruguay: { nombre: 'Uruguay', angulo: 90, colorTexto: '#000000', colores: ['#94b4eb', '#69aaff'] },
  eeuu: { nombre: 'Estados Unidos', angulo: 0, colorTexto: '#00345c', colores: ['#a30000', '#e80000', '#a30000'] },
  canada: { nombre: 'Canadá', angulo: 0, colorTexto: '#470700', colores: ['#cc0000', '#e8e8e8', '#cc0000'] },
  mexico: { nombre: 'México', angulo: 0, colorTexto: '#030303', colores: ['#009919', '#ffffff', '#fc0000'] },
  colombia: { nombre: 'Colombia', angulo: 90, colorTexto: '#ffffff', colores: ['#f7ff00', '#0022ff', '#fc0000'] },
  bolivia: { nombre: 'Bolivia', angulo: -90, colorTexto: '#ded81f', colores: ['#10a11e', '#11870c', '#0b6911'] },
  holanda: { nombre: 'Países Bajos', angulo: 0, colorTexto: '#0831ff', colores: ['#ed5a11', '#ff6112', '#ed5a11'] },
  portugal: { nombre: 'Portugal', angulo: 0, colorTexto: '#ffff14', colores: ['#c90000', '#2d8501'] },
  egipto: { nombre: 'Egipto', angulo: 90, colorTexto: '#ffff14', colores: ['#c90000', '#ffffff', '#000000'] },
  ucrania: { nombre: 'Ucrania', angulo: 90, colorTexto: '#000000', colores: ['#004fd9', '#e6de00'] },
  suecia: { nombre: 'Suecia', angulo: 0, colorTexto: '#030302', colores: ['#4059ff', '#ffff00', '#4059ff'] },
  belgica: { nombre: 'Bélgica', angulo: 0, colorTexto: '#ffffff', colores: ['#050505', '#fff700', '#c91010'] },
  venezuela: { nombre: 'Venezuela', angulo: 90, colorTexto: '#ffffff', colores: ['#fff700', '#090ead', '#d60000'] },
  nigeria: { nombre: 'Nigeria', angulo: 0, colorTexto: '#030303', colores: ['#086302', '#ffffff', '#086302'] },
  marruecos: { nombre: 'Marruecos', angulo: 0, colorTexto: '#133800', colores: ['#cc1b0e', '#cc1b0e', '#cc1b0e'] },
  japon: { nombre: 'Japón', angulo: 0, colorTexto: '#ffffff', colores: ['#0033aa', '#0033aa', '#0033aa'] },
  corea: { nombre: 'Corea del Sur', angulo: 90, colorTexto: '#000000', colores: ['#ffffff', '#ff0000', '#ffffff'] },
  croacia: { nombre: 'Croacia', angulo: 0, colorTexto: '#000000', colores: ['#ffffff', '#d60000', '#ffffff'] },
  suiza: { nombre: 'Suiza', angulo: 0, colorTexto: '#ffffff', colores: ['#d60000', '#d60000', '#d60000'] },
  dinamarca: { nombre: 'Dinamarca', angulo: 0, colorTexto: '#ffffff', colores: ['#c00000', '#c00000', '#c00000'] },
  serbia: { nombre: 'Serbia', angulo: 90, colorTexto: '#ffffff', colores: ['#c60000', '#0033aa', '#ffffff'] },
  polonia: { nombre: 'Polonia', angulo: 90, colorTexto: '#d60000', colores: ['#ffffff', '#ffffff', '#d60000'] },
  australia: { nombre: 'Australia', angulo: 0, colorTexto: '#ffd700', colores: ['#006b3f', '#006b3f', '#006b3f'] },
  senegal: { nombre: 'Senegal', angulo: 0, colorTexto: '#000000', colores: ['#00853f', '#fdef42', '#e31b23'] },
  camerun: { nombre: 'Camerún', angulo: 0, colorTexto: '#ffd700', colores: ['#007a33', '#c8102e', '#fcd116'] },
  argelia: { nombre: 'Argelia', angulo: 90, colorTexto: '#d60000', colores: ['#ffffff', '#0b8a3e', '#ffffff'] },
  peru: { nombre: 'Perú', angulo: 45, colorTexto: '#d60000', colores: ['#ffffff', '#ffffff', '#ffffff'] },
  chile: { nombre: 'Chile', angulo: 90, colorTexto: '#ffffff', colores: ['#0039a6', '#ffffff', '#d52b1e'] },
  paraguay: { nombre: 'Paraguay', angulo: 90, colorTexto: '#0039a6', colores: ['#d60000', '#ffffff', '#d60000'] },
  ecuador: { nombre: 'Ecuador', angulo: 90, colorTexto: '#000000', colores: ['#ffd100', '#0033a0', '#d60000'] },
  costarica: { nombre: 'Costa Rica', angulo: 90, colorTexto: '#ffffff', colores: ['#0033a0', '#d60000', '#0033a0'] },
  canadaAlt: { nombre: 'Canadá (alterna)', angulo: 0, colorTexto: '#ffffff', colores: ['#d60000', '#d60000', '#d60000'] },
  gales: { nombre: 'Gales', angulo: 0, colorTexto: '#ffffff', colores: ['#c8102e', '#c8102e', '#c8102e'] },
  escocia: { nombre: 'Escocia', angulo: 0, colorTexto: '#ffffff', colores: ['#005eb8', '#005eb8', '#005eb8'] },
  irlanda: { nombre: 'Irlanda', angulo: 90, colorTexto: '#ffffff', colores: ['#009a44', '#ffffff', '#ff8200'] },
  noruega: { nombre: 'Noruega', angulo: 0, colorTexto: '#ffffff', colores: ['#ba0c2f', '#ba0c2f', '#ba0c2f'] },
  turquia: { nombre: 'Turquía', angulo: 0, colorTexto: '#ffffff', colores: ['#e30a17', '#e30a17', '#e30a17'] },
  arabia: { nombre: 'Arabia Saudita', angulo: 0, colorTexto: '#ffffff', colores: ['#006c35', '#006c35', '#006c35'] },
  iran: { nombre: 'Irán', angulo: 90, colorTexto: '#ffffff', colores: ['#239f40', '#ffffff', '#da0000'] },
  qatar: { nombre: 'Qatar', angulo: 0, colorTexto: '#ffffff', colores: ['#8a1538', '#8a1538', '#8a1538'] },
  nuevazelanda: { nombre: 'Nueva Zelanda', angulo: 0, colorTexto: '#ffffff', colores: ['#111111', '#111111', '#111111'] },
} as const satisfies Record<string, CamisetaHaxball>;

export type NombreCamiseta = keyof typeof CAMISETAS_HAXBALL;
