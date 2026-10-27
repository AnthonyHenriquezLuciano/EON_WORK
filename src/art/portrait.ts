/**
 * Bust portrait (64×80) painted from an Appearance.
 * Coordinates are hand-tuned around a vertical axis between x=31 and x=32.
 */
import { bodyFor, CLOTH_COLORS, EYE_COLORS, HAIR_COLORS, SKIN_TONES } from '../character.ts';
import type { Appearance, Body, Gender } from '../character.ts';
import { hash, mix, PixelBuffer, ramp, skyBand } from './pixel.ts';
import type { Ramp, RGB } from './pixel.ts';

export const PORTRAIT_W = 64, PORTRAIT_H = 80;
const FACE_TOP = 22, FACE_ROWS = 30;
const GOLD = 0xf0c35a, GOLD_DARK = 0xa97a2c, TEE = 0xeee8e0, PACK = 0x3d3550, INK = 0x231722;

const FACE_SHAPES = [
  { w: 13, cheek: 0.55, chin: 0.36, pow: 1.7, forehead: 1 },     // ovalado
  { w: 13.6, cheek: 0.6, chin: 0.5, pow: 2.4, forehead: 1 },     // redondo
  { w: 13.6, cheek: 0.42, chin: 0.27, pow: 1.25, forehead: 1 },  // corazón
  { w: 13.2, cheek: 0.62, chin: 0.6, pow: 3.2, forehead: 1 },    // cuadrado
  { w: 12.2, cheek: 0.55, chin: 0.4, pow: 1.8, forehead: 1 },    // alargado
  { w: 12.8, cheek: 0.5, chin: 0.32, pow: 1.4, forehead: 0.84 }  // diamante
];

export function faceHalfWidths(face: number, body: Body): number[] {
  const f = FACE_SHAPES[face] ?? FACE_SHAPES[0];
  let { w, chin, pow } = f;
  if (body === 'masc') { w += 0.5; chin = Math.min(0.68, chin + 0.13); pow += 0.8; }
  if (body === 'neutral') { chin += 0.05; pow += 0.3; }
  const rows: number[] = [];
  for (let r = 0; r < FACE_ROWS; r++) {
    const t = r / (FACE_ROWS - 1);
    let hw: number;
    if (t < f.cheek) {
      const u = (f.cheek - t) / (f.cheek + 0.1);
      const narrow = t < f.cheek * 0.7 ? f.forehead + (1 - f.forehead) * (t / (f.cheek * 0.7)) : 1;
      hw = w * Math.sqrt(1 - u * u) * narrow;
    } else {
      const u = (t - f.cheek) / (1 - f.cheek);
      hw = w * (1 - (1 - chin) * Math.pow(u, pow));
    }
    rows.push(Math.max(3, Math.round(hw)));
  }
  return rows;
}

/** Draws a left-side template and its mirror on the right side of the face. */
function mirrorTemplate(buf: PixelBuffer, x0: number, y0: number, rows: string[], colors: Record<string, RGB>) {
  rows.forEach((row, j) => [...row].forEach((ch, i) => {
    const c = colors[ch];
    if (c === undefined) return;
    buf.set(x0 + i, y0 + j, c);
    buf.set(63 - (x0 + i), y0 + j, c);
  }));
}
function centredTemplate(buf: PixelBuffer, x0: number, y0: number, rows: string[], colors: Record<string, RGB>) {
  rows.forEach((row, j) => [...row].forEach((ch, i) => { const c = colors[ch]; if (c !== undefined) buf.set(x0 + i, y0 + j, c); }));
}

const EYES: Record<Body, string[]> = {
  fem: ['DD.....', '.DDDDDD', '.WIHIIW', '.WIPPIW', '..LJJL.'],
  neutral: ['.......', '.DDDDDD', '.WIHIIW', '.WIPPIW', '..LJJL.'],
  masc: ['.......', '.DDDDDD', '.WIHIIW', '.WIPPIW', '..LLLL.']
};
const BROW_SHAPES = [
  ['.......', '..DDDD.', '.D.....'],
  ['.......', '..DDDDD', '.DD....'],
  ['...DDD.', '.DDDDDD', '.DD....'],
  ['..DDD..', '.D...DD', 'D......']
];
const NOSE_SHAPES = [
  ['......', '......', '......', '..SS..'],
  ['...S..', '...S..', '...S..', '..SS..'],
  ['......', '......', '.S..S.', '..SS..'],
  ['......', '..L...', '...S..', '..S...']
];
const MOUTH_SHAPES = [
  ['.M....M.', '..MMMM..', '...BB...'],
  ['........', '..MMMM..', '...BB...'],
  ['.MMMMMM.', '.MTTTTM.', '..MBBM..'],
  ['..UUUU..', '.MMMMMM.', '..BBBB..']
];

type Hair = { back: PixelBuffer; front: PixelBuffer; pal: Ramp; skin: Ramp };
const saw = (x: number) => [0, 1, 2, 1][x & 3];
function cap(L: PixelBuffer, c: RGB, rx: number, ry: number, yMax = 99, cy = 31) {
  L.ellipse(32, cy, rx, ry, c, (_x, y) => y <= yMax);
}
function capTop(x: number, rx = 16, ry = 19, cy = 31) {
  const u = (x + 0.5 - 32) / rx;
  return Math.abs(u) >= 1 ? cy : cy - ry * Math.sqrt(1 - u * u);
}
function fringe(L: PixelBuffer, c: RGB, from: number, to: number, bottom: (x: number) => number, rx = 16, ry = 19) {
  for (let x = from; x <= to; x++) for (let y = Math.ceil(capTop(x, rx, ry)) - 1; y <= bottom(x); y++) L.set(x, y, c);
}
function sides(L: PixelBuffer, c: RGB, y0: number, y1: number, left: (y: number) => [number, number]) {
  for (let y = y0; y <= y1; y++) {
    const [a, b] = left(y);
    L.hline(a, b, y, c);
    L.hline(63 - b, 63 - a, y, c);
  }
}

const HAIR_DRAW: ((h: Hair) => void)[] = [
  // 0 Moño despeinado
  ({ back, front, pal }) => {
    cap(back, pal.shade, 16, 19, 40); back.ellipse(34, 11, 7, 6, pal.shade);
    back.rect(16, 30, 3, 14, pal.shade); back.rect(45, 30, 3, 16, pal.shade);
    fringe(front, pal.base, 16, 47, x => 22 + Math.round(Math.abs(x - 29) * 0.2) + saw(x));
    front.line(17, 27, 15, 45, pal.base); front.line(18, 27, 17, 43, pal.base);
    front.line(46, 27, 48, 47, pal.base); front.line(45, 27, 46, 44, pal.base);
    front.hline(30, 37, 16, pal.dark);
  },
  // 1 Largo liso
  ({ back, front, pal }) => {
    cap(back, pal.shade, 17, 19.5); back.rect(15, 30, 34, 34, pal.shade);
    fringe(front, pal.base, 15, 48, x => 21 + Math.round(Math.abs(x - 31.5) * 0.42));
    sides(front, pal.base, 28, 58, y => [15, y > 55 ? 17 : 18]);
  },
  // 2 Rizos largos
  ({ back, front, pal }) => {
    cap(back, pal.shade, 18.5, 20.5);
    for (let y = 30; y <= 64; y++) { const half = 17 + Math.round(Math.sin(y / 2.3) * 1.2); back.hline(32 - half, 31 + half, y, pal.shade); }
    fringe(front, pal.base, 14, 49, x => 23 + saw(x), 18.5, 20.5);
    sides(front, pal.base, 27, 60, y => { const s = 13 + Math.round(Math.sin(y / 2) * 1); return [s, s + 5]; });
  },
  // 3 Coleta alta
  ({ back, front, pal }) => {
    cap(back, pal.shade, 16, 19, 36);
    back.ellipse(48, 24, 5, 11, pal.shade); back.ellipse(50, 37, 3.5, 8, pal.shade);
    fringe(front, pal.base, 16, 47, x => 20 + Math.round(Math.abs(x - 31.5) * 0.38) + (x < 24 ? saw(x) : 0));
    front.line(16, 26, 16, 38, pal.base); front.line(17, 26, 17, 36, pal.base);
    front.rect(44, 13, 3, 3, 0xd06a8a);
  },
  // 4 Bob
  ({ back, front, pal }) => {
    cap(back, pal.shade, 17.5, 19.5); back.rect(14, 30, 36, 18, pal.shade);
    fringe(front, pal.base, 15, 48, x => 27 + (x % 5 === 0 ? 1 : 0), 17.5, 19.5);
    sides(front, pal.base, 27, 47, y => [14, y === 47 ? 17 : 18]);
  },
  // 5 Trenzas
  ({ back, front, pal }) => {
    cap(back, pal.shade, 16.5, 19.5, 40);
    fringe(front, pal.base, 15, 48, x => Math.min(28, 21 + Math.round(Math.abs(x - 31.5) * 0.4)));
    front.rect(15, 27, 4, 10, pal.base); front.rect(45, 27, 4, 10, pal.base);
    for (let i = 0, y = 37; y <= 66; i++, y += 3) {
      const c = i % 2 ? pal.base : pal.light, o = i % 2 ? 1 : 0;
      front.ellipse(17 + o, y, 2.6, 2, c); front.ellipse(47 - o, y, 2.6, 2, c);
    }
    front.rect(15, 68, 4, 2, 0xd06a8a); front.rect(45, 68, 4, 2, 0xd06a8a);
  },
  // 6 Corto clásico
  ({ back, front, pal }) => {
    cap(back, pal.shade, 16.5, 19.5, 34);
    fringe(front, pal.base, 16, 47, x => 23 + saw(x) - (x > 40 ? 1 : 0));
    front.rect(16, 26, 3, 9, pal.base); front.rect(45, 26, 3, 9, pal.base);
  },
  // 7 Rizado corto
  ({ back, front, pal }) => {
    cap(back, pal.shade, 18, 20.5, 34);
    for (let a = 0.12; a <= 0.88; a += 0.085) back.ellipse(32 + Math.cos(a * Math.PI) * 17, 31 - Math.sin(a * Math.PI) * 20, 3, 3, pal.shade);
    fringe(front, pal.base, 16, 47, x => 24 + saw(x), 18, 20.5);
    for (let a = 0.22; a <= 0.78; a += 0.09) front.ellipse(32 + Math.cos(a * Math.PI) * 15, 30 - Math.sin(a * Math.PI) * 18, 2.6, 2.6, pal.base);
    front.rect(16, 26, 3, 8, pal.base); front.rect(45, 26, 3, 8, pal.base);
  },
  // 8 Degradado
  ({ back, front, pal, skin }) => {
    cap(back, mix(pal.shade, skin.base, 0.45), 16, 19, 35);
    front.ellipse(32, 23, 13.5, 10, pal.base, (_x, y) => y <= 23);
    fringe(front, pal.base, 19, 44, x => 21 + (x % 3 === 0 ? 0 : 1));
  },
  // 9 Rapado
  ({ back, front, pal, skin }) => {
    cap(back, mix(pal.shade, skin.base, 0.55), 15.8, 18.8, 34);
    fringe(front, mix(pal.base, skin.base, 0.45), 18, 45, () => 21, 15.8, 18.8);
  },
  // 10 Raya al lado
  ({ back, front, pal }) => {
    cap(back, pal.shade, 17, 19.5, 35);
    fringe(front, pal.base, 16, 47, x => (x < 22 ? 23 : 21 + Math.round((x - 22) * 0.2) + saw(x)), 17, 19.5);
    front.rect(16, 26, 3, 9, pal.base); front.rect(45, 26, 3, 9, pal.base);
    for (let y = 13; y <= 20; y++) front.set(22, y, pal.dark);
  },
  // 11 Ondulado medio
  ({ back, front, pal }) => {
    cap(back, pal.shade, 17.5, 20);
    for (let y = 30; y <= 53; y++) { const half = 16 + Math.round(Math.sin(y / 2.2)); back.hline(32 - half, 31 + half, y, pal.shade); }
    fringe(front, pal.base, 15, 48, x => 23 + Math.round(Math.sin(x / 2.2) * 1.5) + (Math.abs(x - 31.5) > 10 ? 2 : 0), 17.5, 20);
    sides(front, pal.base, 26, 52, y => { const s = 15 + Math.round(Math.sin(y / 2)); return [s, s + 4]; });
  }
];
const CURLY = new Set([2, 7]);

function textureHair(front: PixelBuffer, back: PixelBuffer, pal: Ramp, style: number) {
  const curly = CURLY.has(style);
  for (let y = 0; y < front.height; y++) for (let x = 0; x < front.width; x++) {
    if (back.filled(x, y)) {
      if (curly && hash(x, y, 7) < 0.22) back.set(x, y, pal.base);
      else if (!curly && x % 5 === 0 && hash(x, y, 3) > 0.35) back.set(x, y, mix(pal.shade, pal.base, 0.5));
    }
    if (!front.filled(x, y)) continue;
    const top = capTop(x);
    if (curly) {
      const n = hash(x, y, 11);
      if (n < 0.16) front.set(x, y, pal.light); else if (n < 0.3) front.set(x, y, pal.shade);
    } else if (y >= top + 3 && y <= top + 4 && x >= 20 && x <= 36 && hash(x >> 1, y, 13) > 0.3) {
      front.set(x, y, x >= 23 && x <= 26 && y === Math.round(top + 3) ? pal.hi : pal.light);
    }
    if (!front.filled(x, y + 1) || (x >= 42 && hash(x, y, 5) < 0.5)) front.set(x, y, pal.shade);
  }
}

function drawBackdrop(buf: PixelBuffer) {
  const sky: [number, RGB][] = [[0, 0x231f4a], [0.4, 0x6a4386], [0.66, 0xc8697f], [0.82, 0xee9d72], [1, 0xf6c08a]];
  for (let y = 0; y < buf.height; y++) for (let x = 0; x < buf.width; x++) buf.set(x, y, skyBand(sky, y / 78, x, y, 12));
  for (let i = 0; i < 18; i++) buf.set(Math.floor(hash(i, 1, 9) * 64), Math.floor(hash(i, 2, 9) * 26), 0xfbe7c4, 0.6 + hash(i, 3) * 0.4);
  for (let x = 0; x < 64; x++) {
    const m = 49 + Math.round(Math.sin(x / 9) * 3 + Math.sin(x / 3.7));
    for (let y = m; y < 80; y++) buf.set(x, y, 0x4a3266);
  }
  let x = 0;
  while (x < 64) {
    const w = 4 + Math.floor(hash(x, 4, 2) * 6), h = 8 + Math.floor(hash(x, 5, 2) * 16);
    for (let i = 0; i < w; i++) for (let y = 80 - h; y < 80; y++) {
      const lit = i > 0 && i < w - 1 && (y - (80 - h)) % 3 === 1 && i % 2 === 1 && hash(x + i, y, 6) < 0.5;
      buf.set(x + i, y, lit ? 0xf7c873 : 0x2b2142);
    }
    x += w + 1;
  }
  buf.rect(55, 0, 4, 80, 0x1d1726); buf.vline(55, 0, 79, 0x2c2338);
}

function drawTorso(buf: PixelBuffer, a: Appearance, body: Body) {
  const S = body === 'masc' ? 26 : body === 'fem' ? 22 : 24;
  const cloth = ramp(CLOTH_COLORS[a.topColor].color);
  const inner = a.topColor === 2 ? 0x2d2b36 : TEE;
  const layer = buf.layer();
  for (let y = 55; y < 80; y++) {
    const hw = Math.min(S, 7 + Math.round((y - 55) * 2.6));
    const round = hw === S && y < 66 && Math.min(S, 7 + Math.round((y - 56) * 2.6)) < S ? 1 : 0;
    for (let x = 32 - hw + round; x <= 31 + hw - round; x++) {
      const light = x < 32 - hw + 4 && y < 64, shade = x > 31 + hw - 4 || (x > 31 + hw - 7 && hash(x, y) < 0.3);
      layer.set(x, y, light ? cloth.light : shade ? cloth.shade : cloth.base);
    }
  }
  if (a.top === 0 || a.top === 1) layer.ellipse(32, 55, 11, 4.5, cloth.shade);
  buf.stamp(layer, cloth.dark);
  if (a.top === 0) {
    for (let y = 56; y < 80; y++) {
      const hw = 2.5 + (y - 56) * 0.28;
      for (let x = 0; x < 64; x++) {
        const d = Math.abs(x + 0.5 - 32);
        if (d <= hw) buf.set(x, y, d > hw - 1 ? cloth.dark : inner);
      }
    }
  }
  if (a.top === 3) {
    for (let y = 56; y < 80; y++) {
      const hw = (y - 55) * 0.55;
      for (let x = 0; x < 64; x++) { const d = Math.abs(x + 0.5 - 32); if (d <= hw) buf.set(x, y, d > hw - 1 ? cloth.dark : inner); }
    }
    for (let k = 0; k < 7; k++) { buf.set(25 + Math.floor(k * 0.6), 55 + k, cloth.light); buf.set(38 - Math.floor(k * 0.6), 55 + k, cloth.light); }
    buf.rect(20, 66, 5, 1, cloth.dark); buf.vline(20, 66, 69, cloth.dark); buf.vline(24, 66, 69, cloth.dark);
  }
  if (a.top === 2) {
    buf.vline(32 - S + 6, 62, 79, cloth.shade); buf.vline(31 + S - 6, 62, 79, cloth.shade);
  }
  if (a.top === 1) buf.hline(22, 41, 74, cloth.shade);
  if (a.top === 0 || a.top === 1) {
    buf.vline(27, 58, 66, cloth.light); buf.vline(36, 58, 66, cloth.light);
    buf.set(27, 67, 0xc9c3bb); buf.set(36, 67, 0xc9c3bb);
  }
  return S;
}

export type PortraitOptions = { gender: Gender; backdrop?: boolean };

export function paintPortrait(a: Appearance, opts: PortraitOptions): PixelBuffer {
  const body = bodyFor(opts.gender);
  const buf = new PixelBuffer(PORTRAIT_W, PORTRAIT_H);
  if (opts.backdrop !== false) drawBackdrop(buf);
  const skin = ramp(SKIN_TONES[a.skin].color);
  const pal = ramp(HAIR_COLORS[a.hairColor].color);
  const hair: Hair = { back: buf.layer(), front: buf.layer(), pal, skin };
  (HAIR_DRAW[a.hair] ?? HAIR_DRAW[0])(hair);
  textureHair(hair.front, hair.back, pal, a.hair);
  buf.stamp(hair.back, pal.dark);

  const S = drawTorso(buf, a, body);
  if (a.backpack) { const sx = 32 - S + 7; buf.rect(sx, 57, 4, 23, PACK); buf.vline(sx, 57, 79, 0x5a4f72); buf.rect(sx, 70, 4, 2, 0x8a7aa8); }

  const widths = faceHalfWidths(a.face, body);
  const neck = buf.layer(), nw = body === 'masc' ? 6 : 5;
  neck.rect(32 - nw, 46, nw * 2, 12, skin.shade);
  neck.rect(32 - nw, 50, nw * 2, 3, mix(skin.shade, skin.dark, 0.35));
  buf.stamp(neck, skin.dark);

  const face = buf.layer();
  widths.forEach((hw, r) => {
    const y = FACE_TOP + r, t = r / (FACE_ROWS - 1);
    for (let x = 32 - hw; x <= 31 + hw; x++) face.set(x, y, x >= 30 + hw && t > 0.15 ? skin.shade : skin.base);
  });
  const ear = widths[16];
  face.ellipse(32 - ear - 0.5, 38.5, 2, 3.2, skin.base); face.ellipse(32 + ear + 0.5, 38.5, 2, 3.2, skin.shade);
  face.set(32 - ear - 1, 38, skin.shade); face.set(32 + ear, 38, skin.dark);
  for (let r = FACE_ROWS - 2; r < FACE_ROWS; r++) {
    const hw = widths[r];
    for (let x = 32 - hw; x <= 31 + hw; x++) face.set(x, FACE_TOP + r, skin.shade);
  }
  face.set(23, 41, skin.light); face.set(24, 41, skin.light); face.set(24, 40, skin.light);
  buf.stamp(face, skin.dark);

  const iris = ramp(EYE_COLORS[a.eyes].color);
  const lash = body === 'masc' ? mix(INK, skin.dark, 0.25) : INK;
  mirrorTemplate(buf, 21, 34, EYES[body], { D: lash, W: 0xf7efe9, I: iris.base, J: iris.light, P: iris.dark, H: 0xffffff, L: skin.shade });
  const brow = mix(pal.dark, pal.base, 0.35);
  const browRows = BROW_SHAPES[a.brows] ?? BROW_SHAPES[1];
  mirrorTemplate(buf, 21, 30, body === 'masc' ? browRows.map((row, j) => j === 2 ? [...row].map((c, i) => (c === 'D' || browRows[1][i] === 'D' ? 'D' : '.')).join('') : row) : browRows, { D: brow });
  centredTemplate(buf, 29, 39, NOSE_SHAPES[a.nose] ?? NOSE_SHAPES[0], { S: skin.shade, L: skin.light });
  const lip = body === 'masc' ? mix(skin.shade, 0xb4565f, 0.2) : body === 'fem' ? mix(skin.base, 0xc4596a, 0.55) : mix(skin.base, 0xb4565f, 0.35);
  centredTemplate(buf, 28, 45, MOUTH_SHAPES[a.mouth] ?? MOUTH_SHAPES[0], { M: mix(skin.dark, 0x5e2234, 0.5), U: mix(lip, skin.shade, 0.3), B: lip, T: 0xfaf3ee });
  if (a.extras.includes('rubor')) { buf.ellipse(24.5, 42.5, 2.6, 1.3, 0xe0708a, undefined, 0.45); buf.ellipse(39.5, 42.5, 2.6, 1.3, 0xe0708a, undefined, 0.45); }
  if (a.extras.includes('pecas')) for (const [x, y] of [[23, 40], [25, 41], [22, 42], [26, 39], [40, 40], [38, 41], [41, 42], [37, 39], [30, 40], [33, 40]]) buf.set(x, y, mix(skin.shade, skin.dark, 0.5));
  if (a.extras.includes('lunar')) buf.set(37, 46, mix(skin.dark, 0x2a1414, 0.6));
  if (a.extras.includes('piercing')) { buf.set(34, 42, GOLD); buf.set(34, 41, 0xfff1c2); }

  buf.stamp(hair.front, pal.dark);
  for (let x = 16; x < 48; x++) for (let y = 18; y < 32; y++)
    if (hair.front.filled(x, y) && !hair.front.filled(x, y + 1) && face.filled(x, y + 2) && !hair.front.filled(x, y + 2)) buf.set(x, y + 2, skin.shade);

  const earX = 32 - ear - 1;
  if (a.earrings === 1) for (const ex of [earX, 63 - earX]) {
    for (let y = 41; y <= 46; y++) for (let x = ex - 3; x <= ex + 3; x++) {
      const d = Math.hypot(x + 0.5 - (ex + 0.5), y + 0.5 - 44);
      if (d > 1.6 && d < 2.6) buf.set(x, y, y > 44 ? GOLD_DARK : GOLD);
    }
  }
  if (a.earrings === 2) for (const ex of [earX, 63 - earX]) { buf.set(ex, 41, GOLD); buf.set(ex, 42, GOLD_DARK); }
  if (a.necklace) {
    for (let x = 27; x <= 36; x++) buf.set(x, 54 + Math.round(3 * (1 - ((x + 0.5 - 32) / 5) ** 2)), GOLD);
    buf.set(31, 58, GOLD); buf.set(32, 58, GOLD); buf.set(31, 59, GOLD_DARK); buf.set(32, 59, GOLD_DARK);
  }
  if (a.glasses) {
    const frame = a.glasses === 1 ? 0x8a6a3a : 0x221a28;
    for (const [x0, x1] of [[19, 28], [35, 44]]) {
      for (let x = x0; x <= x1; x++) for (let y = 33; y <= 41; y++) {
        const edge = x === x0 || x === x1 || y === 33 || y === 41;
        const corner = a.glasses === 1 && (x === x0 || x === x1) && (y === 33 || y === 41);
        if (edge && !corner) buf.set(x, y, frame); else if (!edge) buf.set(x, y, 0xffffff, 0.1);
      }
    }
    buf.hline(29, 34, 36, frame);
  }
  if (a.headphones) {
    for (let y = 8; y <= 34; y++) for (let x = 10; x <= 53; x++) {
      const v = ((x + 0.5 - 32) / 20.5) ** 2 + ((y + 0.5 - 34) / 25) ** 2;
      if (v <= 1 && v >= 0.86) buf.set(x, y, v < 0.92 ? 0x4a455c : 0x2b2838);
    }
    for (const x0 of [10, 48]) {
      const cupL = buf.layer();
      cupL.rect(x0, 31, 6, 12, 0x3a3648); cupL.rect(x0 + 1, 33, 4, 8, 0xe58fb5);
      cupL.rect(x0 + 2, 34, 2, 6, 0x3a3648);
      buf.stamp(cupL, 0x1d1a27);
    }
  }
  return buf;
}
