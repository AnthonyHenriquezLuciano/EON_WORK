/**
 * Title-screen backdrop (320×180): a room at dusk, a window over Barrio Aurora,
 * the protagonist seen from behind with headphones and her cat on the sill.
 * Returns the static image plus the lights the canvas makes twinkle.
 */
import { hash, mix, PixelBuffer, skyBand } from './pixel.ts';
import type { RGB } from './pixel.ts';

export const MENU_W = 320, MENU_H = 180;
export type Twinkle = { x: number; y: number; color: RGB; phase: number; speed: number };
const WIN = { x0: 60, x1: 297, y1: 131 };

function sky(buf: PixelBuffer) {
  const stops: [number, RGB][] = [[0, 0x1b1a40], [0.32, 0x433273], [0.55, 0x8a4b86], [0.72, 0xd46f7c], [0.86, 0xf19a6c], [1, 0xf8c27f]];
  for (let y = 0; y <= WIN.y1; y++) for (let x = WIN.x0; x <= WIN.x1; x++) buf.set(x, y, skyBand(stops, y / 108, x, y, 18));
  // soft clouds catching the last light
  for (let i = 0; i < 7; i++) {
    const cx = WIN.x0 + 20 + hash(i, 1, 4) * 210, cy = 40 + hash(i, 2, 4) * 30, w = 14 + hash(i, 3, 4) * 22;
    buf.ellipse(cx, cy, w, 2.2, 0xf6a58a, undefined, 0.35);
    buf.ellipse(cx + 4, cy - 1, w * 0.6, 1.4, 0xffd0a6, undefined, 0.35);
  }
}

function mountains(buf: PixelBuffer) {
  const far = (x: number) => 86 - Math.max(0, 30 - Math.abs(x - 205) * 0.42) - Math.sin(x / 13) * 3 - Math.sin(x / 5.3);
  const near = (x: number) => 98 - Math.max(0, 18 - Math.abs(x - 110) * 0.3) - Math.sin(x / 9) * 2.5;
  for (let x = WIN.x0; x <= WIN.x1; x++) {
    for (let y = Math.round(far(x)); y <= WIN.y1; y++) buf.set(x, y, y < far(x) + 2 ? 0x8f5e8e : 0x6e4a7e);
    for (let y = Math.round(near(x)); y <= WIN.y1; y++) buf.set(x, y, y < near(x) + 1.5 ? 0x6a4479 : 0x4c3366);
  }
}

function city(buf: PixelBuffer, lights: Twinkle[]) {
  let x = WIN.x0;
  while (x <= WIN.x1) {
    const w = 5 + Math.floor(hash(x, 7, 1) * 9), h = 10 + Math.floor(hash(x, 8, 1) * 22) + (x > 140 && x < 230 ? 6 : 0);
    const top = WIN.y1 - h, col = hash(x, 9, 1) < 0.5 ? 0x2c2244 : 0x33284d;
    for (let i = 0; i < w; i++) for (let y = top; y <= WIN.y1; y++) buf.set(x + i, y, col);
    for (let i = 1; i < w - 1; i += 2) for (let y = top + 2; y < WIN.y1; y += 3) {
      if (hash(x + i, y, 3) < 0.38) {
        const c = hash(x + i, y, 4) < 0.8 ? 0xf7c873 : 0xffe6b0;
        buf.set(x + i, y, c);
        if (hash(x + i, y, 5) < 0.25) lights.push({ x: x + i, y, color: c, phase: hash(x, y, 6) * 6.28, speed: 0.6 + hash(y, x, 7) });
      }
    }
    x += w + (hash(x, 10, 1) < 0.3 ? 1 : 0);
  }
}

function palm(buf: PixelBuffer, x: number, base: number, h: number, color: RGB) {
  for (let y = 0; y < h; y++) buf.set(x + Math.round(Math.sin(y / h * 1.4) * 3), base - y, color);
  const tx = x + Math.round(Math.sin(1.4) * 3), ty = base - h;
  for (const [dx, dy, len] of [[-1, 0.2, 12], [1, 0.25, 13], [-1, -0.35, 9], [1, -0.3, 10], [-0.4, 0.6, 8], [0.5, 0.65, 9]] as const) {
    for (let i = 0; i < len; i++) {
      const px = tx + dx * i, py = ty + dy * i + (i * i) / 28;
      buf.set(px, py, color); buf.set(px, py + 1, color);
    }
  }
}

function room(buf: PixelBuffer) {
  const wall: RGB = 0x1d1626;
  for (let y = 0; y < MENU_H; y++) {
    for (let x = 0; x < WIN.x0 - 4; x++) buf.set(x, y, mix(wall, 0x2a1f33, (x % 7 === 0 ? 0.4 : 0)));
    for (let x = WIN.x1 + 5; x < MENU_W; x++) buf.set(x, y, wall);
  }
  // window frame and sill
  buf.rect(WIN.x0 - 5, 0, 5, 140, 0x2d2233); buf.vline(WIN.x0 - 1, 0, 131, 0x43334a);
  buf.rect(WIN.x1 + 1, 0, 5, 140, 0x2d2233); buf.vline(WIN.x1 + 1, 0, 131, 0x43334a);
  buf.rect(176, 0, 3, 132, 0x2d2233); buf.vline(176, 0, 131, 0x43334a);
  buf.rect(WIN.x0 - 5, 0, WIN.x1 - WIN.x0 + 11, 4, 0x2d2233);
  buf.rect(WIN.x0 - 9, 132, WIN.x1 - WIN.x0 + 19, 7, 0x3c2c37);
  buf.hline(WIN.x0 - 9, WIN.x1 + 9, 132, 0x6a4a52); buf.hline(WIN.x0 - 9, WIN.x1 + 9, 138, 0x231a26);
  for (let y = 139; y < MENU_H; y++) for (let x = 0; x < MENU_W; x++) buf.set(x, y, y < 142 ? 0x150f1b : 0x1a1220);
  // cushion / sofa back the character sits on
  buf.ellipse(118, 152, 60, 12, 0x3a2b45); buf.ellipse(118, 149, 58, 6, 0x4a3656);
  // lamp with warm glow
  for (let y = 40; y < 170; y++) for (let x = 0; x < 90; x++) {
    const d = Math.hypot(x - 30, (y - 86) * 1.15);
    if (d < 66) buf.set(x, y, 0xffb565, 0.34 * (1 - d / 66) ** 1.5);
  }
  for (let y = 0; y < 18; y++) { const hw = 7 + y * 0.45; buf.hline(Math.round(30 - hw), Math.round(29 + hw), 68 + y, y < 2 ? 0xffe2a8 : mix(0xf6c07a, 0xd98b4e, y / 18)); }
  buf.rect(29, 86, 2, 34, 0x2b2030); buf.rect(20, 119, 20, 3, 0x2b2030); buf.rect(12, 122, 36, 26, 0x2a1e2b); buf.hline(12, 47, 122, 0x46333f);
  // plants on the left and books / plants on the right shelf
  for (let i = 0; i < 11; i++) {
    const ang = Math.PI * (1.05 + i * 0.09), r = 7 + (i % 3) * 3;
    buf.ellipse(12 + Math.cos(ang) * r, 146 + Math.sin(ang) * r, 4.5, 2, i % 2 ? 0x2f5a46 : 0x3e7357);
  }
  buf.rect(3, 150, 18, 22, 0x5a3a36); buf.hline(3, 20, 150, 0x7a5048);
  for (const sy of [46, 92]) {
    buf.rect(WIN.x1 + 5, sy, 18, 3, 0x3c2c37);
    for (let b = 0; b < 4; b++) buf.rect(WIN.x1 + 6 + b * 4, sy - 12 + (b % 2) * 2, 3, 12 - (b % 2) * 2, [0x7e2f45, 0x6c4ca8, 0xc99a3e, 0x4f7a5a][b]);
  }
  for (let i = 0; i < 6; i++) buf.ellipse(WIN.x1 + 12 + (i % 2 ? 4 : -3), 120 - i * 3, 5, 2, i % 2 ? 0x2f5a46 : 0x3e7357);
  buf.rect(WIN.x1 + 8, 124, 12, 8, 0x5a3a36);
  // a little plant on the sill
  for (let i = 0; i < 5; i++) buf.ellipse(268 + (i % 2 ? 3 : -3), 121 - i * 2.4, 4, 1.6, i % 2 ? 0x2f5a46 : 0x3e7357);
  buf.rect(264, 124, 9, 8, 0x8a5a44); buf.hline(264, 272, 124, 0xa8735a);
}

function protagonist(buf: PixelBuffer) {
  const L = buf.layer();
  const hood: RGB = 0x262031, hair: RGB = 0x2b1b20;
  L.ellipse(118, 140, 26, 26, hood, (_x, y) => y <= 150);   // shoulders and back
  L.ellipse(118, 117, 9, 5, mix(hood, 0x000000, 0.2));       // hood folded at the neck
  L.rect(115, 107, 6, 8, 0x8f5d44);                          // neck
  L.ellipse(118, 97, 11, 12, hair);                          // head (back of the hair)
  L.ellipse(119, 83, 6, 5.5, hair);                          // bun
  L.ellipse(129, 115, 3.5, 2.5, 0xb27a57);                   // hand resting on the sill
  // headphones: band over the head and the visible cup
  for (let y = 83; y <= 100; y++) for (let x = 104; x <= 132; x++) {
    const v = ((x - 118) / 13.5) ** 2 + ((y - 99) / 15.5) ** 2;
    if (v <= 1 && v >= 0.84) L.set(x, y, 0x3a3648);
  }
  L.rect(103, 94, 5, 9, 0x3a3648); L.rect(129, 94, 5, 9, 0x3a3648); L.vline(131, 96, 100, 0xe58fb5);
  buf.stamp(L, 0x0f0b14);
  // rim light from the sunset window on the top and right edges
  for (let y = 70; y < 152; y++) for (let x = 90; x < 150; x++) {
    if (!L.filled(x, y)) continue;
    if (!L.filled(x, y - 1) || !L.filled(x + 1, y)) buf.set(x, y, 0xf2a07a, 0.55);
  }
  for (let i = 0; i < 6; i++) buf.set(110 + i * 2, 92 + (i % 3), 0x4a2f34);
}

function cat(buf: PixelBuffer) {
  const L = buf.layer(), fur: RGB = 0xd98b45, dark: RGB = 0xa8612d;
  L.ellipse(158, 122, 9, 10, fur);
  L.ellipse(156, 108, 7, 6.5, fur);
  for (const ex of [151, 161]) for (let y = 97; y <= 103; y++) { const w = (y - 97) >> 1; L.hline(ex - w, ex + w, y, fur); }
  L.set(151, 101, 0xf2a8a0); L.set(161, 101, 0xf2a8a0);
  for (let i = 0; i < 4; i++) L.hline(150, 166, 112 + i * 4, i % 2 ? dark : fur);
  for (let y = 126; y <= 131; y++) L.hline(167, 170 + (y - 126), y, fur);
  L.hline(160, 174, 131, fur);
  buf.stamp(L, 0x3d2216);
  for (let y = 96; y < 132; y++) for (let x = 140; x < 180; x++)
    if (L.filled(x, y) && (!L.filled(x, y - 1) || !L.filled(x + 1, y))) buf.set(x, y, 0xffd39a, 0.65);
}

export function paintMenuScene(): { base: PixelBuffer; twinkles: Twinkle[] } {
  const buf = new PixelBuffer(MENU_W, MENU_H);
  const twinkles: Twinkle[] = [];
  sky(buf);
  for (let i = 0; i < 70; i++) {
    const x = WIN.x0 + Math.floor(hash(i, 11, 2) * (WIN.x1 - WIN.x0)), y = Math.floor(hash(i, 12, 2) * 46);
    const c = hash(i, 13) < 0.2 ? 0xffd9a0 : 0xd9d6f5;
    buf.set(x, y, c, 0.5);
    if (i % 2) twinkles.push({ x, y, color: c, phase: hash(i, 14) * 6.28, speed: 0.4 + hash(i, 15) * 0.8 });
  }
  mountains(buf);
  city(buf, twinkles);
  palm(buf, 78, 131, 34, 0x1a1530); palm(buf, 92, 131, 26, 0x1d1733); palm(buf, 282, 131, 38, 0x1a1530);
  room(buf);
  protagonist(buf);
  cat(buf);
  return { base: buf, twinkles };
}
