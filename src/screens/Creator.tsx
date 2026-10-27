import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { paintPortrait } from '../art/portrait.ts';
import { FACINGS, paintSprite, paintWorldPreview } from '../art/sprite.ts';
import type { Facing } from '../art/sprite.ts';
import type { PixelBuffer } from '../art/pixel.ts';
import { speak } from '../audio.ts';
import {
  applyStylePreset, BOTTOMS, BROWS, changeGender, CLOTH_COLORS, createDefaultCharacter, daysInMonth, DREAMS, EARRINGS,
  EXTRAS, EYE_COLORS, FACES, GENDERS, GLASSES, HAIR_COLORS, HAIR_STYLES, MONTHS, MOUTHS, NOSES, SHOES, SKIN_TONES,
  STYLE_PRESETS, TOPS, toggleExtra, TRAITS, validateProfile, VOICES
} from '../character.ts';
import type { Appearance, CharacterProfile, Gender } from '../character.ts';
import { PixelView } from '../ui/PixelView.tsx';

const STEPS = [
  { title: 'Esencia', text: 'Define quién eres y cómo quieres vivir esta historia.' },
  { title: 'Tu apariencia', text: 'Personaliza cada detalle de tu personaje.' },
  { title: 'Tu historia', text: 'Algunos datos que marcarán tu comienzo.' },
  { title: 'Confirmar', text: 'Revisa y comienza tu aventura en EON WORLD.' }
];
type Tab = 'apariencia' | 'ropa' | 'accesorios' | 'estilo' | 'voz';
const TABS: { id: Tab; label: string; icon: ReactNode }[] = [
  { id: 'apariencia', label: 'Apariencia', icon: <path d="M12 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm-7 18c0-4 3-7 7-7s7 3 7 7" /> },
  { id: 'ropa', label: 'Ropa', icon: <path d="M8 3 4 6l2 4 2-1v12h8V9l2 1 2-4-4-3c-1 2-2.5 3-4 3S9 5 8 3Z" /> },
  { id: 'accesorios', label: 'Accesorios', icon: <path d="M4 10a8 8 0 0 1 16 0v4M4 14h3v6H4zM17 14h3v6h-3z" /> },
  { id: 'estilo', label: 'Estilo', icon: <path d="M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5Z" /> },
  { id: 'voz', label: 'Voz', icon: <path d="M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3ZM5 11a7 7 0 0 0 14 0M12 18v3" /> }
];
const FACING_LABELS: Record<Facing, string> = { front: 'De frente', right: 'Perfil derecho', back: 'De espaldas', left: 'Perfil izquierdo' };
const GENDER_ICONS: Record<Gender, ReactNode> = {
  femenino: <path d="M12 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 10v8m-3-3h6" />,
  masculino: <path d="M10 8a6 6 0 1 1 0 12 6 6 0 0 1 0-12Zm4-2 6-3m0 0h-5m5 0v5" />,
  'no-binario': <path d="M12 7a6 6 0 1 1 0 12 6 6 0 0 1 0-12Zm0 0V2m-2.5 1.2 5 2.6m0-2.6-5 2.6" />
};
const Icon = ({ children }: { children: ReactNode }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
);
const hex = (c: number) => '#' + c.toString(16).padStart(6, '0');

/** Renders the portrait with one option changed and crops the part that shows the difference. */
function useVariants(profile: CharacterProfile, field: keyof Appearance, count: number, crop: [number, number, number, number]) {
  return useMemo(() => Array.from({ length: count }, (_, i) =>
    paintPortrait({ ...profile.appearance, [field]: i } as Appearance, { gender: profile.gender, backdrop: false }).crop(...crop)
  ), [profile.appearance, profile.gender, field, count, crop]);
}
const CROPS = {
  face: [12, 14, 40, 42] as [number, number, number, number],
  eyes: [18, 30, 28, 12] as [number, number, number, number],
  brows: [18, 28, 28, 8] as [number, number, number, number],
  nose: [24, 34, 16, 12] as [number, number, number, number],
  mouth: [24, 42, 16, 10] as [number, number, number, number],
  head: [8, 2, 48, 50] as [number, number, number, number],
  torso: [4, 50, 56, 30] as [number, number, number, number],
  ears: [8, 26, 48, 26] as [number, number, number, number]
};

function Tiles({ label, count, value, onChange, buffers, names, wide }: {
  label: string; count: number; value: number; onChange: (i: number) => void;
  buffers: PixelBuffer[]; names: { label: string }[]; wide?: boolean;
}) {
  return (
    <fieldset className="option-row">
      <legend>{label}</legend>
      <div className="carousel">
        <button className="arrow" aria-label={`${label}: anterior`} onClick={() => onChange((value - 1 + count) % count)}>‹</button>
        <div className={'tiles' + (wide ? ' tiles--wide' : '')}>
          {buffers.map((b, i) => (
            <button key={i} className="tile" aria-pressed={value === i} title={names[i].label} aria-label={names[i].label} onClick={() => onChange(i)}>
              <PixelView buffer={b} />
            </button>
          ))}
        </div>
        <button className="arrow" aria-label={`${label}: siguiente`} onClick={() => onChange((value + 1) % count)}>›</button>
      </div>
    </fieldset>
  );
}
function Swatches({ label, colors, value, onChange, round }: {
  label: string; colors: { label: string; color: number }[]; value: number; onChange: (i: number) => void; round?: boolean;
}) {
  return (
    <fieldset className="option-row">
      <legend>{label}</legend>
      <div className={'swatches' + (round ? ' swatches--round' : '')}>
        {colors.map((c, i) => (
          <button key={c.label} className="swatch" style={{ background: hex(c.color) }} aria-pressed={value === i} aria-label={c.label} title={c.label} onClick={() => onChange(i)} />
        ))}
      </div>
    </fieldset>
  );
}
function Toggle({ label, checked, onChange, buffer }: { label: string; checked: boolean; onChange: (v: boolean) => void; buffer: PixelBuffer }) {
  return (
    <button className="tile tile--labelled" aria-pressed={checked} onClick={() => onChange(!checked)}>
      <PixelView buffer={buffer} /><span>{label}</span>
    </button>
  );
}

function AppearanceTab({ profile, set }: { profile: CharacterProfile; set: (a: Partial<Appearance>) => void }) {
  const a = profile.appearance;
  const faces = useVariants(profile, 'face', FACES.length, CROPS.face);
  const eyes = useVariants(profile, 'eyes', EYE_COLORS.length, CROPS.eyes);
  const brows = useVariants(profile, 'brows', BROWS.length, CROPS.brows);
  const noses = useVariants(profile, 'nose', NOSES.length, CROPS.nose);
  const mouths = useVariants(profile, 'mouth', MOUTHS.length, CROPS.mouth);
  const hair = useVariants(profile, 'hair', HAIR_STYLES.length, CROPS.head);
  const extras = useMemo(() => [{ id: 'ninguno' as const, label: 'Ninguno' }, ...EXTRAS].map(e =>
    paintPortrait({ ...a, extras: e.id === 'ninguno' ? [] : [e.id] }, { gender: profile.gender, backdrop: false }).crop(16, 30, 32, 22)
  ), [a, profile.gender]);
  return (
    <div className="editor-columns">
      <div className="editor-col">
        <Swatches label="Tono de piel" colors={SKIN_TONES} value={a.skin} onChange={skin => set({ skin })} />
        <Tiles label="Rostro" count={FACES.length} value={a.face} onChange={face => set({ face })} buffers={faces} names={FACES} />
        <Tiles label="Ojos" count={EYE_COLORS.length} value={a.eyes} onChange={eyes => set({ eyes })} buffers={eyes} names={EYE_COLORS} wide />
        <Tiles label="Cejas" count={BROWS.length} value={a.brows} onChange={brows => set({ brows })} buffers={brows} names={BROWS} wide />
        <Tiles label="Nariz" count={NOSES.length} value={a.nose} onChange={nose => set({ nose })} buffers={noses} names={NOSES} />
        <Tiles label="Boca" count={MOUTHS.length} value={a.mouth} onChange={mouth => set({ mouth })} buffers={mouths} names={MOUTHS} />
      </div>
      <div className="editor-col">
        <fieldset className="option-row">
          <legend>Cabello</legend>
          <div className="hair-grid">
            {hair.map((b, i) => (
              <button key={i} className="tile" aria-pressed={a.hair === i} aria-label={HAIR_STYLES[i].label} title={HAIR_STYLES[i].label} onClick={() => set({ hair: i })}>
                <PixelView buffer={b} />
              </button>
            ))}
          </div>
        </fieldset>
        <Swatches label="Color de cabello" colors={HAIR_COLORS} value={a.hairColor} onChange={hairColor => set({ hairColor })} round />
        <fieldset className="option-row">
          <legend>Extras</legend>
          <div className="extras-row">
            {[{ id: 'ninguno' as const, label: 'Ninguno' }, ...EXTRAS].map((e, i) => {
              const on = e.id === 'ninguno' ? a.extras.length === 0 : a.extras.includes(e.id);
              return (
                <button key={e.id} className="tile" aria-pressed={on} aria-label={e.label} title={e.label} onClick={() => set(toggleExtra(a, e.id))}>
                  <PixelView buffer={extras[i]} />
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>
    </div>
  );
}

function ClothesTab({ profile, set }: { profile: CharacterProfile; set: (a: Partial<Appearance>) => void }) {
  const a = profile.appearance;
  const tops = useVariants(profile, 'top', TOPS.length, CROPS.torso);
  const bottoms = useMemo(() => BOTTOMS.map((_, i) => paintSprite({ ...a, bottom: i }, profile.gender, 'front').crop(2, 24, 20, 16)), [a, profile.gender]);
  const shoes = useMemo(() => SHOES.map((_, i) => paintSprite({ ...a, shoes: i }, profile.gender, 'front').crop(4, 30, 16, 10)), [a, profile.gender]);
  return (
    <div className="editor-columns">
      <div className="editor-col">
        <Tiles label="Parte de arriba" count={TOPS.length} value={a.top} onChange={top => set({ top })} buffers={tops} names={TOPS} wide />
        <Swatches label="Color de arriba" colors={CLOTH_COLORS} value={a.topColor} onChange={topColor => set({ topColor })} />
        <Tiles label="Calzado" count={SHOES.length} value={a.shoes} onChange={s => set({ shoes: s })} buffers={shoes} names={SHOES} wide />
      </div>
      <div className="editor-col">
        <Tiles label="Parte de abajo" count={BOTTOMS.length} value={a.bottom} onChange={bottom => set({ bottom })} buffers={bottoms} names={BOTTOMS} wide />
        <Swatches label="Color de abajo" colors={CLOTH_COLORS} value={a.bottomColor} onChange={bottomColor => set({ bottomColor })} />
      </div>
    </div>
  );
}

function AccessoriesTab({ profile, set }: { profile: CharacterProfile; set: (a: Partial<Appearance>) => void }) {
  const a = profile.appearance, g = profile.gender;
  const earrings = useVariants(profile, 'earrings', EARRINGS.length, CROPS.ears);
  const glasses = useVariants(profile, 'glasses', GLASSES.length, CROPS.ears);
  const toggles = useMemo(() => ({
    necklace: paintPortrait({ ...a, necklace: true }, { gender: g, backdrop: false }).crop(16, 40, 32, 24),
    headphones: paintPortrait({ ...a, headphones: true }, { gender: g, backdrop: false }).crop(4, 4, 56, 46),
    backpack: paintSprite({ ...a, backpack: true }, g, 'back').crop(2, 14, 20, 16)
  }), [a, g]);
  return (
    <div className="editor-columns">
      <div className="editor-col">
        <Tiles label="Aretes" count={EARRINGS.length} value={a.earrings} onChange={earrings => set({ earrings })} buffers={earrings} names={EARRINGS} wide />
        <Tiles label="Lentes" count={GLASSES.length} value={a.glasses} onChange={gl => set({ glasses: gl })} buffers={glasses} names={GLASSES} wide />
      </div>
      <div className="editor-col">
        <fieldset className="option-row">
          <legend>Complementos</legend>
          <div className="toggle-grid">
            <Toggle label="Collar" checked={a.necklace} onChange={necklace => set({ necklace })} buffer={toggles.necklace} />
            <Toggle label="Audífonos" checked={a.headphones} onChange={headphones => set({ headphones })} buffer={toggles.headphones} />
            <Toggle label="Mochila" checked={a.backpack} onChange={backpack => set({ backpack })} buffer={toggles.backpack} />
          </div>
        </fieldset>
      </div>
    </div>
  );
}

function StyleTab({ profile, onProfile }: { profile: CharacterProfile; onProfile: (p: CharacterProfile) => void }) {
  const looks = useMemo(() => STYLE_PRESETS.map((_, i) => paintSprite(applyStylePreset(profile, i).appearance, profile.gender, 'front')), [profile]);
  return (
    <fieldset className="option-row">
      <legend>Estilos completos</legend>
      <p className="hint">Un toque cambia la ropa y los complementos. Después puedes ajustar cada detalle.</p>
      <div className="style-grid">
        {STYLE_PRESETS.map((s, i) => (
          <button key={s.label} className="tile tile--labelled tile--style" onClick={() => onProfile(applyStylePreset(profile, i))}>
            <PixelView buffer={looks[i]} /><span>{s.label}</span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function VoiceTab({ value, set }: { value: number; set: (a: Partial<Appearance>) => void }) {
  return (
    <fieldset className="option-row">
      <legend>Voz</legend>
      <p className="hint">Así sonará tu personaje en las conversaciones.</p>
      <div className="voice-grid">
        {VOICES.map((v, i) => (
          <div key={v.label} className={'voice-card' + (value === i ? ' is-on' : '')}>
            <button className="voice-pick" aria-pressed={value === i} onClick={() => { set({ voice: i }); speak(i); }}>
              <b>{v.label}</b><small>{v.pitch < 200 ? 'Tono grave' : v.pitch < 300 ? 'Tono medio' : 'Tono agudo'}</small>
            </button>
            <button className="voice-play" aria-label={`Escuchar voz ${v.label}`} onClick={() => speak(i)}>
              <Icon><path d="M8 5v14l11-7Z" /></Icon>
            </button>
          </div>
        ))}
      </div>
    </fieldset>
  );
}

export function Creator({ hasSave, onCancel, onConfirm }: {
  hasSave: boolean; onCancel: () => void; onConfirm: (p: CharacterProfile) => void;
}) {
  const [profile, setProfile] = useState<CharacterProfile>(() => createDefaultCharacter('femenino'));
  const [step, setStep] = useState(0);
  const [reached, setReached] = useState(0);
  const [tab, setTab] = useState<Tab>('apariencia');
  const [facing, setFacing] = useState(0);
  const [inWorld, setInWorld] = useState(false);
  const [touched, setTouched] = useState(false);
  const a = profile.appearance;
  const set = (patch: Partial<Appearance>) => setProfile(p => ({ ...p, appearance: { ...p.appearance, ...patch } }));
  const errors = validateProfile(profile);
  const portrait = useMemo(() => paintPortrait(a, { gender: profile.gender }), [a, profile.gender]);
  const sprites = useMemo(() => FACINGS.map(f => paintSprite(a, profile.gender, f)), [a, profile.gender]);
  const world = useMemo(() => inWorld ? paintWorldPreview(a, profile.gender, FACINGS[facing]) : null, [a, profile.gender, facing, inWorld]);
  const name = `${profile.firstName.trim()} ${profile.lastName.trim()}`.trim();
  const blocked = (step === 0 && (errors.firstName || errors.lastName)) || (step === 2 && errors.birthday);

  const go = (target: number) => {
    if (target > step && blocked) { setTouched(true); return; }
    setTouched(false);
    setStep(target); setReached(r => Math.max(r, target));
    document.querySelector('.creator-editor')?.scrollTo({ top: 0 });
  };
  const next = () => {
    if (step < 3) return go(step + 1);
    if (Object.keys(errors).length) { setTouched(true); setStep(errors.birthday ? 2 : 0); return; }
    onConfirm({ ...profile, firstName: profile.firstName.trim(), lastName: profile.lastName.trim() });
  };

  return (
    <div className="creator">
      <aside className="creator-steps" aria-label="Pasos de la creación">
        <button className="back-link" onClick={onCancel}>‹ Menú principal</button>
        <ol>
          {STEPS.map((s, i) => (
            <li key={s.title} className={(i === step ? 'is-current ' : '') + (i < step ? 'is-done' : '')}>
              <button onClick={() => i <= reached && go(i)} disabled={i > reached} aria-current={i === step ? 'step' : undefined}>
                <span className="step-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="step-text"><b>{s.title}</b><small>{s.text}</small></span>
              </button>
            </li>
          ))}
        </ol>
      </aside>

      <section className="creator-stage">
        <header className="creator-head">
          <div>
            <h1>Creación de personaje</h1>
            <p>Tu historia comienza contigo</p>
          </div>
          <div className="gender-toggle" role="radiogroup" aria-label="Género">
            {GENDERS.map(g => (
              <button key={g.id} role="radio" aria-checked={profile.gender === g.id} onClick={() => setProfile(p => changeGender(p, g.id))}>
                <Icon>{GENDER_ICONS[g.id]}</Icon>{g.label}
              </button>
            ))}
          </div>
        </header>
        <div className="stage-body">
          <div className="portrait-frame">
            <PixelView buffer={portrait} label={`Retrato de ${name || 'tu personaje'}`} />
            <span className="portrait-name">{name || 'Sin nombre'}</span>
          </div>
          <div className="sprite-column">
            <div className="sprite-stage">
              <button className="arrow arrow--big" aria-label="Girar a la izquierda" onClick={() => setFacing(f => (f + 3) % 4)}>‹</button>
              <div className={'sprite-box' + (inWorld ? ' sprite-box--world' : '')}>
                <PixelView buffer={world ?? sprites[facing]} label={`${name || 'Tu personaje'}, ${FACING_LABELS[FACINGS[facing]].toLowerCase()}`} />
              </div>
              <button className="arrow arrow--big" aria-label="Girar a la derecha" onClick={() => setFacing(f => (f + 1) % 4)}>›</button>
            </div>
            <button className="world-toggle" aria-pressed={inWorld} onClick={() => setInWorld(v => !v)}>
              {inWorld ? 'Ver sin fondo' : 'Vista previa en el mundo'}
            </button>
            <div className="facing-thumbs" role="group" aria-label="Dirección">
              {sprites.map((b, i) => (
                <button key={FACINGS[i]} className="tile" aria-pressed={facing === i} aria-label={FACING_LABELS[FACINGS[i]]} onClick={() => setFacing(i)}>
                  <PixelView buffer={b} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="creator-editor" aria-label={STEPS[step].title}>
        {step === 0 && (
          <div className="panel">
            <h2>¿Quién eres?</h2>
            <div className="field-pair">
              <label className="field">
                <span>Nombre</span>
                <input value={profile.firstName} maxLength={20} autoComplete="off" aria-invalid={touched && !!errors.firstName}
                  onChange={e => setProfile(p => ({ ...p, firstName: e.target.value }))} />
                {touched && errors.firstName && <small className="error">{errors.firstName}</small>}
              </label>
              <label className="field">
                <span>Apellido</span>
                <input value={profile.lastName} maxLength={20} autoComplete="off" aria-invalid={touched && !!errors.lastName}
                  onChange={e => setProfile(p => ({ ...p, lastName: e.target.value }))} />
                {touched && errors.lastName && <small className="error">{errors.lastName}</small>}
              </label>
            </div>
            <fieldset className="option-row">
              <legend>Tu mayor fortaleza</legend>
              <div className="choice-grid">
                {TRAITS.map(t => (
                  <button key={t.id} className="choice" aria-pressed={profile.trait === t.id} onClick={() => setProfile(p => ({ ...p, trait: t.id }))}>
                    <b>{t.label}</b><small>{t.detail}</small>
                  </button>
                ))}
              </div>
            </fieldset>
            <p className="hint">El género lo eliges arriba, junto al título. Puedes cambiarlo en cualquier paso.</p>
          </div>
        )}
        {step === 1 && (
          <>
            <div className="tabs-bar" role="tablist" aria-label="Personalización">
              {TABS.map(t => (
                <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}>
                  <Icon>{t.icon}</Icon><span>{t.label}</span>
                </button>
              ))}
            </div>
            <div className="panel panel--tabs" role="tabpanel">
              {tab === 'apariencia' && <AppearanceTab profile={profile} set={set} />}
              {tab === 'ropa' && <ClothesTab profile={profile} set={set} />}
              {tab === 'accesorios' && <AccessoriesTab profile={profile} set={set} />}
              {tab === 'estilo' && <StyleTab profile={profile} onProfile={setProfile} />}
              {tab === 'voz' && <VoiceTab value={a.voice} set={set} />}
            </div>
          </>
        )}
        {step === 2 && (
          <div className="panel">
            <h2>Tu comienzo</h2>
            <fieldset className="option-row">
              <legend>Cumpleaños</legend>
              <div className="field-pair">
                <label className="field"><span>Día</span>
                  <select value={profile.birthday.day} onChange={e => setProfile(p => ({ ...p, birthday: { ...p.birthday, day: Number(e.target.value) } }))}>
                    {Array.from({ length: daysInMonth(profile.birthday.month) }, (_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}
                  </select>
                </label>
                <label className="field"><span>Mes</span>
                  <select value={profile.birthday.month} onChange={e => {
                    const month = Number(e.target.value);
                    setProfile(p => ({ ...p, birthday: { month, day: Math.min(p.birthday.day, daysInMonth(month)) } }));
                  }}>
                    {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m[0].toUpperCase() + m.slice(1)}</option>)}
                  </select>
                </label>
              </div>
              {touched && errors.birthday && <small className="error">{errors.birthday}</small>}
            </fieldset>
            <fieldset className="option-row">
              <legend>Un sueño para el futuro</legend>
              <div className="choice-grid">
                {DREAMS.map(d => (
                  <button key={d.id} className="choice" aria-pressed={profile.dream === d.id} onClick={() => setProfile(p => ({ ...p, dream: d.id }))}>
                    <b>{d.label}</b>
                  </button>
                ))}
              </div>
            </fieldset>
            <dl className="facts">
              <dt>Lugar</dt><dd>Barrio Aurora, República Dominicana</dd>
              <dt>Familia</dt><dd>Mamá, Marina Rojas · Papá, Mateo {profile.lastName.trim() || '—'}</dd>
              <dt>Edad en esta versión</dt><dd>14 años. La vida desde el nacimiento llegará por etapas.</dd>
            </dl>
          </div>
        )}
        {step === 3 && (
          <div className="panel">
            <h2>Todo listo</h2>
            <dl className="summary">
              <dt>Nombre</dt><dd>{name}</dd>
              <dt>Género</dt><dd>{GENDERS.find(g => g.id === profile.gender)?.label}</dd>
              <dt>Cumpleaños</dt><dd>{profile.birthday.day} de {MONTHS[profile.birthday.month - 1]}</dd>
              <dt>Fortaleza</dt><dd>{TRAITS.find(t => t.id === profile.trait)?.label}</dd>
              <dt>Sueño</dt><dd>{DREAMS.find(d => d.id === profile.dream)?.label}</dd>
              <dt>Cabello</dt><dd>{HAIR_STYLES[a.hair].label}, {HAIR_COLORS[a.hairColor].label.toLowerCase()}</dd>
              <dt>Ropa</dt><dd>{TOPS[a.top].label} y {BOTTOMS[a.bottom].label.toLowerCase()}</dd>
              <dt>Voz</dt><dd>{VOICES[a.voice].label}</dd>
            </dl>
            {hasSave && <p className="warning" role="note">Al comenzar se reemplazará la partida guardada en este navegador.</p>}
          </div>
        )}
      </section>

      <footer className="creator-foot">
        <button className="nav-button" onClick={() => (step === 0 ? onCancel() : go(step - 1))}>‹ {step === 0 ? 'Menú' : 'Anterior'}</button>
        <div className="dots" aria-hidden="true">{STEPS.map((s, i) => <span key={s.title} className={i === step ? 'on' : ''} />)}</div>
        <button className="nav-button nav-button--primary" onClick={next}>{step === 3 ? 'Comenzar historia' : 'Siguiente'} ›</button>
      </footer>
    </div>
  );
}
