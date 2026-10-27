import { useEffect, useMemo, useRef, useState } from 'react';
import { MENU_H, MENU_W, paintMenuScene } from '../art/menuScene.ts';
import { clock } from '../game.ts';
import type { GameState } from '../game.ts';
import { Logo } from '../ui/Logo.tsx';

export type Settings = { animations: boolean };
type Modal = null | 'options' | 'gallery' | 'credits' | 'confirm-delete';
const SOURCE_LABELS = { observed: 'Lo viviste', testimony: 'Te lo contaron', evidence: 'Documento encontrado' };

function MenuBackdrop({ animate }: { animate: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const scene = useMemo(() => paintMenuScene(), []);
  useEffect(() => {
    const canvas = ref.current, ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const still = document.createElement('canvas');
    still.width = MENU_W; still.height = MENU_H;
    still.getContext('2d')?.putImageData(new ImageData(new Uint8ClampedArray(scene.base.data), MENU_W, MENU_H), 0, 0);
    const hex = (c: number) => '#' + c.toString(16).padStart(6, '0');
    let frame = 0, last = 0;
    const draw = (now: number) => {
      if (now - last >= 90) {
        last = now;
        ctx.drawImage(still, 0, 0);
        const t = now / 1000;
        for (const tw of scene.twinkles) {
          ctx.globalAlpha = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(t * tw.speed * 2 + tw.phase));
          ctx.fillStyle = hex(tw.color); ctx.fillRect(tw.x, tw.y, 1, 1);
        }
        ctx.globalAlpha = 1;
        const glow = ctx.createRadialGradient(30, 86, 0, 30, 86, 60);
        const a = 0.06 + 0.04 * Math.sin(t * 1.7);
        glow.addColorStop(0, `rgba(255, 181, 101, ${a})`); glow.addColorStop(1, 'rgba(255, 181, 101, 0)');
        ctx.fillStyle = glow; ctx.fillRect(0, 26, 90, 120);
      }
      if (animate) frame = requestAnimationFrame(draw);
    };
    draw(performance.now() + 100);
    return () => cancelAnimationFrame(frame);
  }, [scene, animate]);
  return <canvas ref={ref} className="menu-backdrop" width={MENU_W} height={MENU_H} aria-hidden="true" />;
}

export function MainMenu({ save, settings, onSettings, onNew, onContinue, onDeleteSave }: {
  save: GameState | null;
  settings: Settings;
  onSettings: (s: Settings) => void;
  onNew: () => void;
  onContinue: () => void;
  onDeleteSave: () => void;
}) {
  const [modal, setModal] = useState<Modal>(null);
  const items: { id: string; label: string; detail?: string; disabled?: boolean; run: () => void }[] = [
    { id: 'new', label: 'Nueva Historia', run: onNew },
    { id: 'continue', label: 'Continuar', disabled: !save, run: onContinue,
      detail: save ? `${save.character.firstName} ${save.character.lastName} · Día ${save.day} · ${clock(save.minute)}` : 'Sin partida guardada' },
    { id: 'options', label: 'Opciones', run: () => setModal('options') },
    { id: 'gallery', label: 'Galería', run: () => setModal('gallery') },
    { id: 'credits', label: 'Créditos', run: () => setModal('credits') }
  ];
  const list = useRef<HTMLDivElement>(null);
  useEffect(() => { list.current?.querySelector<HTMLButtonElement>('button:not([aria-disabled="true"])')?.focus(); }, []);
  useEffect(() => {
    if (!modal) return;
    const close = (e: KeyboardEvent) => { if (e.key === 'Escape') setModal(null); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [modal]);
  const moveFocus = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const buttons = [...(list.current?.querySelectorAll<HTMLButtonElement>('button') ?? [])].filter(b => b.getAttribute('aria-disabled') !== 'true');
    const i = buttons.indexOf(document.activeElement as HTMLButtonElement);
    buttons[(i + (e.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length]?.focus();
  };
  const memories = save ? [...save.journal].reverse() : [];

  return (
    <div className="menu-screen">
      <MenuBackdrop animate={settings.animations} />
      <div className="menu-shade" aria-hidden="true" />
      <main className="menu-content">
        <h1 className="visually-hidden">EON WORLD</h1>
        <Logo />
        <nav className="menu-list" aria-label="Menú principal" ref={list} onKeyDown={moveFocus}>
          {items.map(item => (
            <button key={item.id} aria-disabled={item.disabled || undefined}
              onClick={() => { if (!item.disabled) item.run(); }}>
              <span>{item.label}</span>
              {item.detail && <small>{item.detail}</small>}
            </button>
          ))}
        </nav>
      </main>
      <p className="menu-place">BARRIO AURORA<br /><small>REPÚBLICA DOMINICANA</small></p>
      <p className="menu-version">Prototipo jugable · v0.2</p>

      {modal && (
        <div className="menu-modal-cover" onClick={() => setModal(null)}>
          <div className="menu-modal" role="dialog" aria-modal="true" aria-labelledby="menu-modal-title" onClick={e => e.stopPropagation()}>
            {modal === 'options' && <>
              <h2 id="menu-modal-title">Opciones</h2>
              <label className="switch-row">
                <span><b>Animaciones del menú</b><small>Luces de la ciudad y la lámpara.</small></span>
                <input type="checkbox" role="switch" checked={settings.animations} onChange={e => onSettings({ ...settings, animations: e.target.checked })} />
              </label>
              <div className="switch-row">
                <span><b>Partida guardada</b><small>{save ? 'Se guarda en este navegador.' : 'No hay ninguna partida guardada.'}</small></span>
                <button className="ghost danger" disabled={!save} onClick={() => setModal('confirm-delete')}>Borrar</button>
              </div>
              <button className="primary" autoFocus onClick={() => setModal(null)}>Listo</button>
            </>}
            {modal === 'confirm-delete' && <>
              <h2 id="menu-modal-title">¿Borrar la partida?</h2>
              <p>Se perderán el día, el diario y el personaje de {save?.character.firstName}. No se puede deshacer.</p>
              <div className="modal-actions">
                <button className="ghost" autoFocus onClick={() => setModal('options')}>Cancelar</button>
                <button className="primary danger" onClick={() => { onDeleteSave(); setModal(null); }}>Borrar partida</button>
              </div>
            </>}
            {modal === 'gallery' && <>
              <h2 id="menu-modal-title">Galería de recuerdos</h2>
              {memories.length ? <div className="memory-list">
                {memories.map(m => <article key={m.id + '-' + m.day + '-' + m.minute}>
                  <small>Día {m.day} · {clock(m.minute)} · {SOURCE_LABELS[m.source]}</small>
                  <h3>{m.title}</h3><p>{m.text}</p>
                </article>)}
              </div> : <p className="muted">Aún no hay recuerdos. Empieza una historia y aquí aparecerá lo que vivas.</p>}
              <button className="primary" autoFocus onClick={() => setModal(null)}>Cerrar</button>
            </>}
            {modal === 'credits' && <>
              <h2 id="menu-modal-title">Créditos</h2>
              <dl className="credits">
                <dt>Un juego de</dt><dd>Anthony Henríquez Luciano</dd>
                <dt>Ambientación</dt><dd>Barrio Aurora, República Dominicana</dd>
                <dt>Arte</dt><dd>Pixel art generado por código (provisional)</dd>
                <dt>Tecnología</dt><dd>React, PixiJS y TypeScript</dd>
              </dl>
              <button className="primary" autoFocus onClick={() => setModal(null)}>Cerrar</button>
            </>}
          </div>
        </div>
      )}
    </div>
  );
}
