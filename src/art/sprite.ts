/**
 * Full-body chibi sprite (24×40) in four directions, painted from an Appearance.
 * Used by the creator preview and as the player/NPC texture in the PixiJS world.
 */
import { bodyFor, CLOTH_COLORS, EYE_COLORS, HAIR_COLORS, SKIN_TONES } from '../character.ts';
import type { Appearance, Body, Gender } from '../character.ts';
import { mix, PixelBuffer, ramp } from './pixel.ts';
import type { Ramp, RGB } from './pixel.ts';

export const SPRITE_W = 24, SPRITE_H = 40;
export type Facing = 'front' | 'right' | 'back' | 'left';
export const FACINGS: Facing[] = ['front', 'right', 'back', 'left'];
const OUTLINE = 0x1c1427, GOLD = 0xf0c35a, TEE = 0xeee8e0, PACK = 0x3d3550;
const LONG = new Set([1, 2, 5]);      // hair reaching the back
const SHORT = new Set([6, 7, 8, 9, 10]);
const SHOE_COLORS: RGB[] = [0xece6df, 0x4a3226, 0x7a4a32];

type Ctx = { L: PixelBuffer; a: Appearance; body: Body; skin: Ramp; hair: Ramp; top: Ramp; bottom: Ramp };

function hairLength(style: number) {
  if (LONG.has(style)) return 24;
  if (style === 11) return 19;
  if (style === 4) return 16;
  if (style === 0) return 13;
  return 11;
}

function legs(c: Ctx, side: boolean) {
  const { L, a, skin, bottom } = c;
  const xs = side ? [[10, 14]] : [[8, 11], [12, 15]];
  if (a.bottom === 2) {
    for (let y = 27; y <= 31; y++) { const k = (y - 27) >> 1; L.hline((side ? 9 : 8) - k, (side ? 15 : 15) + k, y, y === 31 ? bottom.shade : bottom.base); }
    for (const [x0] of xs) for (let y = 32; y <= 35; y++) { L.set(x0 + 1, y, skin.base); L.set(x0 + 2, y, skin.shade); }
  } else if (a.bottom === 3) {
    for (let y = 27; y <= 30; y++) L.hline(side ? 10 : 8, side ? 14 : 15, y, bottom.base);
    for (const [x0] of xs) for (let y = 31; y <= 35; y++) { L.set(x0 + 1, y, skin.base); L.set(x0 + 2, y, skin.shade); }
  } else {
    const wide = a.bottom === 0 && !side;
    L.hline(side ? 10 : 8, side ? 14 : 15, 27, bottom.base); L.hline(side ? 10 : 8, side ? 14 : 15, 28, bottom.base);
    for (let y = 29; y <= 35; y++) {
      if (side) { L.hline(10, 14 + (a.bottom === 0 && y > 32 ? 1 : 0), y, bottom.base); L.set(14, y, bottom.shade); continue; }
      const flare = wide && y > 32 ? 1 : 0;
      L.hline(8 - flare, 11, y, bottom.base); L.hline(12, 15 + flare, y, bottom.base);
      L.set(11, y, bottom.shade); L.set(15 + flare, y, bottom.shade);
    }
  }
  const shoe = ramp(SHOE_COLORS[a.shoes] ?? SHOE_COLORS[0]);
  for (const [x0, x1] of xs) {
    const toe = side ? 1 : 0;
    if (a.shoes === 2) { L.hline(x0, x1 + toe, 37, skin.base); L.hline(x0, x1 + toe, 38, shoe.base); L.set(x0 + 1, 36, shoe.base); continue; }
    if (a.shoes === 1) L.hline(x0, x1, 35, shoe.base);
    L.hline(x0, x1 + toe, 36, shoe.base); L.hline(x0, x1 + toe, 37, shoe.base);
    L.hline(x0, x1 + toe, 38, a.shoes === 0 ? 0xb9b0c4 : shoe.dark);
  }
}

function torso(c: Ctx, facing: Facing) {
  const { L, a, body, skin, top } = c;
  const side = facing === 'right';
  const [x0, x1] = side ? [9, 15] : body === 'masc' ? [7, 16] : body === 'neutral' ? [8, 15] : [8, 15];
  for (let y = 17; y <= 27; y++) {
    const inset = y === 17 ? 1 : 0;
    for (let x = x0 + inset; x <= x1 - inset; x++) L.set(x, y, x === x1 - inset || x === x1 - inset - 1 && side ? top.shade : top.base);
  }
  if (facing === 'front' && a.top === 0) for (let y = 18; y <= 26; y++) { L.set(11, y, TEE); L.set(12, y, TEE); L.set(10, y, top.dark); L.set(13, y, top.dark); }
  if (facing === 'front' && a.top === 3) for (let y = 18; y <= 22; y++) { const w = (y - 17) >> 1; L.hline(12 - w, 11 + w, y, TEE); }
  if (facing === 'front' && a.top === 1) L.hline(9, 14, 24, top.shade);
  if ((a.top === 0 || a.top === 1) && facing !== 'front') L.hline(side ? 9 : 9, side ? 12 : 14, 17, top.shade);
  // arms
  const short = a.top === 2;
  const arms = side ? [[11, 13]] : [[x0 - 2, x0 - 1], [x1 + 1, x1 + 2]];
  for (const [ax0, ax1] of arms) {
    for (let y = 18; y <= 25; y++) for (let x = ax0; x <= ax1; x++) L.set(x, y, short && y > 20 ? skin.base : x === ax1 ? top.shade : top.light);
    L.hline(ax0, ax1, 26, skin.base); L.hline(ax0, ax1, 27, skin.shade);
  }
  if (facing === 'front' && a.necklace) { L.set(11, 18, GOLD); L.set(12, 18, GOLD); }
  if (a.backpack) {
    if (facing === 'front') { L.vline(x0 + 1, 18, 23, PACK); L.vline(x1 - 1, 18, 23, PACK); }
    if (facing === 'back') { L.rect(8, 18, 8, 9, PACK); L.hline(8, 15, 18, 0x5a4f72); L.rect(9, 21, 6, 1, 0x8a7aa8); }
    if (side) { L.rect(6, 18, 3, 9, PACK); L.vline(6, 18, 26, 0x5a4f72); }
  }
}

function head(c: Ctx, facing: Facing) {
  const { L, a, body, skin, hair } = c;
  const side = facing === 'right';
  const cx = side ? 12.5 : 12;
  L.rect(11, 15, 2, 3, skin.shade);
  L.ellipse(cx, 10.5, side ? 6 : 6.5, 6.5, skin.base);
  for (let y = 5; y <= 16; y++) for (let x = 0; x < 24; x++) if (L.get(x, y) === skin.base && (!L.filled(x + 1, y) || !L.filled(x, y + 1))) L.set(x, y, skin.shade);
  if (facing === 'front') {
    L.set(5, 11, skin.base); L.set(18, 11, skin.shade);
    const iris = ramp(EYE_COLORS[a.eyes].color);
    for (const ex of [8, 14]) { L.set(ex, 11, iris.dark); L.set(ex + 1, 11, iris.dark); L.set(ex, 12, iris.base); L.set(ex + 1, 12, iris.light); }
    if (body === 'fem') { L.set(7, 11, 0x231722); L.set(16, 11, 0x231722); }
    if (a.extras.includes('rubor') || body === 'fem') { L.set(7, 13, 0xe0708a, 0.5); L.set(16, 13, 0xe0708a, 0.5); }
    L.set(11, 14, body === 'masc' ? skin.dark : mix(skin.base, 0xc4596a, 0.6)); L.set(12, 14, body === 'masc' ? skin.dark : mix(skin.base, 0xc4596a, 0.6));
    if (a.glasses) { const f = a.glasses === 1 ? 0x8a6a3a : 0x221a28; for (const x of [7, 10, 13, 16]) { L.set(x, 11, f); L.set(x, 12, f); } L.hline(10, 13, 11, f); }
  }
  if (side) {
    const iris = ramp(EYE_COLORS[a.eyes].color);
    L.set(15, 11, iris.dark); L.set(16, 11, iris.dark); L.set(15, 12, iris.base); L.set(16, 12, iris.light);
    if (body === 'fem') L.set(17, 10, 0x231722);
    L.set(19, 12, skin.base); L.set(16, 14, body === 'masc' ? skin.dark : mix(skin.base, 0xc4596a, 0.6));
    L.set(11, 11, skin.shade); L.set(11, 12, skin.shade);
    if (a.glasses) { const f = a.glasses === 1 ? 0x8a6a3a : 0x221a28; L.hline(14, 18, 11, f); L.set(14, 12, f); L.set(17, 12, f); }
  }
  // hair
  const style = a.hair, len = hairLength(style);
  const capColor = style === 9 ? mix(hair.base, skin.base, 0.45) : hair.base;
  const sideColor = style === 8 || style === 9 ? mix(hair.shade, skin.base, 0.45) : hair.base;
  const big = style === 2 || style === 7 ? 1 : 0;
  if (facing === 'back') {
    L.ellipse(12, 10, 7.5 + big, 7.5 + big, capColor, (_x, y) => y <= Math.max(12, len));
    if (len > 12) for (let y = 12; y <= len; y++) L.hline(LONG.has(style) ? 5 - big : 6, LONG.has(style) ? 18 + big : 17, y, y === len ? hair.shade : hair.base);
    if (style === 5) { for (let y = 12; y <= 24; y++) { L.set(7 + (y & 1), y, hair.light); L.set(16 - (y & 1), y, hair.light); } }
    if (style === 8) L.ellipse(12, 10, 7.5, 7.5, sideColor, (_x, y) => y >= 8 && y <= 12);
  } else if (side) {
    L.ellipse(12.5, 10, 7, 7.5 + big, capColor, (x, y) => y <= 7 || (x <= 13 && y <= 13));
    if (len > 12) for (let y = 12; y <= len; y++) L.hline(6 - big, LONG.has(style) ? 11 : 10, y, hair.base);
    if (style === 8 || style === 9) L.ellipse(12.5, 10, 7, 7.5, sideColor, (x, y) => y > 7 && x <= 13 && y <= 12);
    L.set(17, 6, hair.light); L.set(18, 7, hair.base);
  } else {
    L.ellipse(12, 10, 7.5 + big, 7.5 + big, capColor, (_x, y) => y <= (style === 4 || style === 1 ? 9 : 8));
    const sideTo = SHORT.has(style) ? 11 : len;
    for (let y = 7; y <= sideTo; y++) {
      const w = LONG.has(style) || style === 11 ? 2 : 1;
      L.hline(5 - big - (w - 1), 5 - big + 0, y, y > 7 && (style === 8 || style === 9) ? sideColor : hair.base);
      L.hline(18 + big, 18 + big + (w - 1), y, y > 7 && (style === 8 || style === 9) ? sideColor : hair.shade);
    }
    if (style === 5) for (let y = 13; y <= 24; y++) { L.set(5, y, y & 1 ? hair.light : hair.base); L.set(18, y, y & 1 ? hair.base : hair.light); }
    if (style === 10) { L.set(9, 9, hair.base); L.set(10, 9, hair.base); }
    for (let x = 8; x <= 13; x++) if (L.get(x, 5) === hair.base) L.set(x, 5, hair.light);
  }
  if (style === 0) L.ellipse(facing === 'back' ? 12 : side ? 9 : 12.5, 2.5, 3, 2.6, hair.base);
  if (style === 3) {
    if (facing === 'front') L.ellipse(19, 9, 2.2, 5, hair.shade);
    else if (facing === 'back') { L.ellipse(12, 6, 2.5, 3, hair.base); L.ellipse(12, 12, 2, 5, hair.base); }
    else L.ellipse(6, 9, 2.4, 5, hair.base);
  }
  if (style === 7) for (const [x, y] of [[5, 6], [8, 3], [12, 2], [16, 3], [19, 6]]) L.ellipse(x + (side ? 0.5 : 0), y + 0.5, 1.6, 1.6, hair.base);
  if (a.headphones) {
    for (let x = side ? 9 : 6; x <= (side ? 15 : 17); x++) L.set(x, 2, 0x2b2838);
    if (facing === 'front' || facing === 'back') { L.rect(3, 8, 2, 5, 0x3a3648); L.rect(19, 8, 2, 5, 0x3a3648); L.set(3, 10, 0xe58fb5); L.set(20, 10, 0xe58fb5); }
    else { L.rect(10, 8, 3, 5, 0x3a3648); L.set(11, 10, 0xe58fb5); }
  }
  if (a.earrings && facing === 'front' && !LONG.has(style)) { L.set(5, 13, GOLD); L.set(18, 13, GOLD); }
}

export function paintSprite(a: Appearance, gender: Gender, facing: Facing): PixelBuffer {
  if (facing === 'left') return paintSprite(a, gender, 'right').mirrored();
  const out = new PixelBuffer(SPRITE_W, SPRITE_H);
  const L = out.layer();
  const c: Ctx = {
    L, a, body: bodyFor(gender), skin: ramp(SKIN_TONES[a.skin].color), hair: ramp(HAIR_COLORS[a.hairColor].color),
    top: ramp(CLOTH_COLORS[a.topColor].color), bottom: ramp(CLOTH_COLORS[a.bottomColor].color)
  };
  // Long hair seen from the front falls behind the body.
  if (facing === 'front' && LONG.has(a.hair)) L.rect(6, 12, 12, 12, c.hair.shade);
  legs(c, facing === 'right');
  torso(c, facing);
  head(c, facing);
  out.stamp(L, OUTLINE);
  return out;
}

/** The sprite standing on a patch of Barrio Aurora, for the "Vista previa en el mundo" toggle. */
export function paintWorldPreview(a: Appearance, gender: Gender, facing: Facing): PixelBuffer {
  const W = 48, H = 56, out = new PixelBuffer(W, H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) out.set(x, y, y < 20 ? mix(0x2a2f55, 0x5a4a7a, y / 20) : 0x2f4a4f);
  for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) {
    const cx = 24 + (i - j) * 8, cy = 18 + (i + j) * 4;
    const col = (i + j) % 3 === 0 ? 0x617c75 : (i + j) % 3 === 1 ? 0x52746f : 0x486d6d;
    for (let y = -4; y <= 4; y++) { const hw = 8 - Math.abs(y) * 2; out.hline(cx - hw, cx + hw - 1, cy + y, col); }
  }
  out.rect(3, 6, 10, 18, 0xc57f60); out.rect(3, 6, 10, 3, 0x96546a);
  for (let k = 0; k < 3; k++) out.rect(5 + k * 3, 12, 2, 3, 0xf3c878);
  out.ellipse(41, 22, 6, 6, 0x4c8967); out.ellipse(39, 19, 4, 4, 0x73a46c); out.rect(40, 26, 2, 6, 0x6a4b40);
  out.ellipse(24, 51, 8, 2.5, 0x1d2e33, undefined, 0.6);
  out.stamp(paintSprite(a, gender, facing), undefined, 12, 13);
  return out;
}
