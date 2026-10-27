/**
 * Tiny pixel-art painter that writes RGBA into a plain buffer.
 * No DOM needed, so the art can be unit tested in Node and then
 * copied to a <canvas> or a PixiJS texture.
 */
export type RGB = number;

export class PixelBuffer {
  readonly data: Uint8ClampedArray;
  readonly width: number;
  readonly height: number;
  constructor(width: number, height: number) {
    this.width = width; this.height = height;
    this.data = new Uint8ClampedArray(width * height * 4);
  }
  inside(x: number, y: number) { return x >= 0 && y >= 0 && x < this.width && y < this.height; }
  set(x: number, y: number, c: RGB, alpha = 1) {
    x = Math.floor(x); y = Math.floor(y);
    if (!this.inside(x, y)) return;
    const i = (y * this.width + x) * 4, d = this.data;
    const r = (c >> 16) & 255, g = (c >> 8) & 255, b = c & 255;
    if (alpha >= 1 || d[i + 3] === 0) {
      d[i] = r; d[i + 1] = g; d[i + 2] = b; d[i + 3] = alpha >= 1 ? 255 : Math.round(alpha * 255);
      return;
    }
    d[i] = d[i] + (r - d[i]) * alpha; d[i + 1] = d[i + 1] + (g - d[i + 1]) * alpha; d[i + 2] = d[i + 2] + (b - d[i + 2]) * alpha;
    d[i + 3] = Math.max(d[i + 3], Math.round(alpha * 255));
  }
  /** Colour at a pixel, or null when it is transparent. */
  get(x: number, y: number): RGB | null {
    if (!this.inside(x, y)) return null;
    const i = (y * this.width + x) * 4, d = this.data;
    return d[i + 3] === 0 ? null : (d[i] << 16) | (d[i + 1] << 8) | d[i + 2];
  }
  filled(x: number, y: number) { return this.get(x, y) !== null; }
  clear(x: number, y: number) { if (this.inside(x, y)) this.data[(y * this.width + x) * 4 + 3] = 0; }
  rect(x: number, y: number, w: number, h: number, c: RGB, alpha = 1) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, c, alpha);
  }
  hline(x0: number, x1: number, y: number, c: RGB) { for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++) this.set(x, y, c); }
  vline(x: number, y0: number, y1: number, c: RGB) { for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++) this.set(x, y, c); }
  /** Filled ellipse; centre may be fractional (31.5 is between two pixels). */
  ellipse(cx: number, cy: number, rx: number, ry: number, c: RGB, clip?: (x: number, y: number) => boolean, alpha = 1) {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
        if (dx * dx + dy * dy <= 1 && (!clip || clip(x, y))) this.set(x, y, c, alpha);
      }
  }
  line(x0: number, y0: number, x1: number, y1: number, c: RGB) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (;;) {
      this.set(x0, y0, c);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  }
  /** Draws `layer` on top of this buffer, with an optional 1px outline around its shape. */
  stamp(layer: PixelBuffer, outline?: RGB, ox = 0, oy = 0) {
    if (outline !== undefined) {
      for (let y = -1; y <= layer.height; y++) for (let x = -1; x <= layer.width; x++) {
        if (layer.filled(x, y)) continue;
        if (layer.filled(x - 1, y) || layer.filled(x + 1, y) || layer.filled(x, y - 1) || layer.filled(x, y + 1)) this.set(x + ox, y + oy, outline);
      }
    }
    for (let y = 0; y < layer.height; y++) for (let x = 0; x < layer.width; x++) {
      const i = (y * layer.width + x) * 4, a = layer.data[i + 3];
      if (a) this.set(x + ox, y + oy, (layer.data[i] << 16) | (layer.data[i + 1] << 8) | layer.data[i + 2], a / 255);
    }
  }
  /** A same-sized empty layer to draw a shape on before stamping it. */
  layer() { return new PixelBuffer(this.width, this.height); }
  mirrored() {
    const out = new PixelBuffer(this.width, this.height);
    for (let y = 0; y < this.height; y++) for (let x = 0; x < this.width; x++) {
      const s = (y * this.width + x) * 4, t = (y * this.width + (this.width - 1 - x)) * 4;
      out.data.set(this.data.subarray(s, s + 4), t);
    }
    return out;
  }
  crop(x: number, y: number, w: number, h: number) {
    const out = new PixelBuffer(w, h);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      if (!this.inside(x + i, y + j)) continue;
      const s = ((y + j) * this.width + x + i) * 4;
      out.data.set(this.data.subarray(s, s + 4), (j * w + i) * 4);
    }
    return out;
  }
}

export function mix(a: RGB, b: RGB, t: number): RGB {
  const ch = (s: number) => Math.round(((a >> s) & 255) + (((b >> s) & 255) - ((a >> s) & 255)) * t);
  return (ch(16) << 16) | (ch(8) << 8) | ch(0);
}
export type Ramp = { dark: RGB; shade: RGB; base: RGB; light: RGB; hi: RGB };
/** Hue-shifted shading: shadows lean purple, lights lean warm, as in hand-made pixel art. */
export function ramp(base: RGB): Ramp {
  return {
    dark: mix(base, 0x1a0f22, 0.58),
    shade: mix(base, 0x3a1d3c, 0.3),
    base,
    light: mix(base, 0xfff0d8, 0.24),
    hi: mix(base, 0xffffff, 0.5)
  };
}
/** Deterministic noise in [0,1) so the art never changes between renders. */
export function hash(x: number, y: number, seed = 0) {
  let h = (x * 374761393 + y * 668265263 + seed * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
/** Ordered dithering for smooth sky gradients. */
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
export function dither(x: number, y: number) { return (BAYER[(y & 3) * 4 + (x & 3)] + 0.5) / 16; }
export function gradient(stops: [number, RGB][], t: number): RGB {
  if (t <= stops[0][0]) return stops[0][1];
  for (let i = 1; i < stops.length; i++) {
    if (t <= stops[i][0]) {
      const [t0, c0] = stops[i - 1], [t1, c1] = stops[i];
      return mix(c0, c1, (t - t0) / (t1 - t0));
    }
  }
  return stops[stops.length - 1][1];
}
/** A banded (posterised) gradient, which reads as pixel art instead of a smooth blur. */
export function skyBand(stops: [number, RGB][], t: number, x: number, y: number, bands = 14) {
  const v = t * bands + dither(x, y) - 0.5;
  return gradient(stops, Math.max(0, Math.min(1, Math.round(v) / bands)));
}
