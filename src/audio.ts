import { VOICES } from './character.ts';

let ctx: AudioContext | null = null;
/** A short synthesized "babble" so each voice option can be heard (no recorded audio). */
export function speak(voice: number) {
  const v = VOICES[voice] ?? VOICES[0];
  try {
    ctx ??= new AudioContext();
    void ctx.resume();
    const t0 = ctx.currentTime + 0.02, filter = ctx.createBiquadFilter();
    filter.type = 'lowpass'; filter.frequency.value = v.pitch * 5; filter.connect(ctx.destination);
    [0, 4, 2, 5, 3, 7, 4, 0].forEach((step, i) => {
      const o = ctx!.createOscillator(), g = ctx!.createGain(), t = t0 + i * 0.085;
      o.type = v.wave; o.frequency.setValueAtTime(v.pitch * 2 ** (step / 12), t);
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v.wave === 'square' ? 0.05 : 0.12, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.075);
      o.connect(g).connect(filter); o.start(t); o.stop(t + 0.08);
    });
  } catch { /* audio unavailable: the choice still saves */ }
}
