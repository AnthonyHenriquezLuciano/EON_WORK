import { useEffect, useRef } from 'react';
import type { PixelBuffer } from '../art/pixel.ts';

/** Shows a PixelBuffer at native resolution; CSS scales it up with crisp pixels. */
export function PixelView({ buffer, className, label }: { buffer: PixelBuffer; className?: string; label?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    canvas.width = buffer.width; canvas.height = buffer.height;
    canvas.getContext('2d')?.putImageData(new ImageData(new Uint8ClampedArray(buffer.data), buffer.width, buffer.height), 0, 0);
  }, [buffer]);
  return <canvas ref={ref} className={'pixel ' + (className ?? '')} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true} />;
}
