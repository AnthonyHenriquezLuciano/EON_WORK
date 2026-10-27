/**
 * Character model for the creator: pure data and rules, no rendering.
 * Every visual option is an index into a catalog so saves stay small and
 * can be sanitized when the catalogs change.
 */
export type Gender = 'femenino' | 'masculino' | 'no-binario';
export type Body = 'fem' | 'masc' | 'neutral';
export type Extra = 'pecas' | 'lunar' | 'rubor' | 'piercing';
export type Trait = 'creatividad' | 'curiosidad' | 'empatia' | 'disciplina';
export type Dream = 'arte' | 'ciencia' | 'ayudar' | 'emprender';

export type Appearance = {
  skin: number; face: number; eyes: number; brows: number; nose: number; mouth: number;
  hair: number; hairColor: number; extras: Extra[];
  top: number; topColor: number; bottom: number; bottomColor: number; shoes: number;
  earrings: number; glasses: number; necklace: boolean; headphones: boolean; backpack: boolean;
  voice: number;
};
export type CharacterProfile = {
  gender: Gender;
  firstName: string;
  lastName: string;
  birthday: { day: number; month: number };
  trait: Trait;
  dream: Dream;
  appearance: Appearance;
};

type Named = { label: string };
type Colored = Named & { color: number };

export const GENDERS: { id: Gender; label: string }[] = [
  { id: 'femenino', label: 'Femenino' },
  { id: 'masculino', label: 'Masculino' },
  { id: 'no-binario', label: 'No binario' }
];
export const SKIN_TONES: Colored[] = [
  { label: 'Porcelana', color: 0xf6d8c4 }, { label: 'Claro', color: 0xeebf9f },
  { label: 'Miel', color: 0xdba27c }, { label: 'Canela', color: 0xc68862 },
  { label: 'Trigueño', color: 0xa86d4b }, { label: 'Moreno', color: 0x8a5539 },
  { label: 'Chocolate', color: 0x6b3f2a }, { label: 'Ébano', color: 0x4b2c1f }
];
export const FACES: Named[] = [
  { label: 'Ovalado' }, { label: 'Redondo' }, { label: 'Corazón' },
  { label: 'Cuadrado' }, { label: 'Alargado' }, { label: 'Diamante' }
];
export const EYE_COLORS: Colored[] = [
  { label: 'Café oscuro', color: 0x4a2a1c }, { label: 'Miel', color: 0x9a5b26 },
  { label: 'Avellana', color: 0x7a6a2c }, { label: 'Verde', color: 0x3f8a52 },
  { label: 'Azul', color: 0x3f6fb8 }, { label: 'Gris', color: 0x7b8796 }
];
export const BROWS: Named[] = [{ label: 'Finas' }, { label: 'Naturales' }, { label: 'Gruesas' }, { label: 'Arqueadas' }];
export const NOSES: Named[] = [{ label: 'Botón' }, { label: 'Recta' }, { label: 'Ancha' }, { label: 'Respingada' }];
export const MOUTHS: Named[] = [{ label: 'Sonrisa suave' }, { label: 'Neutra' }, { label: 'Sonrisa amplia' }, { label: 'Labios llenos' }];
export const HAIR_STYLES: Named[] = [
  { label: 'Moño despeinado' }, { label: 'Largo liso' }, { label: 'Rizos largos' }, { label: 'Coleta alta' },
  { label: 'Bob' }, { label: 'Trenzas' }, { label: 'Corto clásico' }, { label: 'Rizado corto' },
  { label: 'Degradado' }, { label: 'Rapado' }, { label: 'Raya al lado' }, { label: 'Ondulado medio' }
];
export const HAIR_COLORS: Colored[] = [
  { label: 'Negro', color: 0x241a22 }, { label: 'Castaño oscuro', color: 0x45281e },
  { label: 'Castaño', color: 0x6a3f27 }, { label: 'Caramelo', color: 0xa86b3a },
  { label: 'Cobrizo', color: 0xa6452c }, { label: 'Vino', color: 0x74253a },
  { label: 'Rosa', color: 0xe48db3 }, { label: 'Morado', color: 0x6c4ca8 }
];
export const EXTRAS: { id: Extra; label: string }[] = [
  { id: 'pecas', label: 'Pecas' }, { id: 'lunar', label: 'Lunar' },
  { id: 'rubor', label: 'Rubor' }, { id: 'piercing', label: 'Piercing' }
];
export const TOPS: Named[] = [
  { label: 'Sudadera abierta' }, { label: 'Sudadera' }, { label: 'Camiseta' }, { label: 'Chaqueta' }
];
export const BOTTOMS: Named[] = [
  { label: 'Jeans anchos' }, { label: 'Pantalón' }, { label: 'Falda' }, { label: 'Shorts' }
];
export const SHOES: Named[] = [{ label: 'Tenis' }, { label: 'Botas' }, { label: 'Sandalias' }];
export const CLOTH_COLORS: Colored[] = [
  { label: 'Negro', color: 0x23222c }, { label: 'Gris', color: 0x6d6f7d },
  { label: 'Blanco', color: 0xe9e4dc }, { label: 'Mezclilla', color: 0x6f8fbf },
  { label: 'Azul noche', color: 0x2e3f6e }, { label: 'Vino', color: 0x7e2f45 },
  { label: 'Rosa', color: 0xd88aa6 }, { label: 'Verde', color: 0x4f7a5a },
  { label: 'Mostaza', color: 0xc99a3e }, { label: 'Lavanda', color: 0x9b8ad0 }
];
export const EARRINGS: Named[] = [{ label: 'Ninguno' }, { label: 'Aros' }, { label: 'Pequeños' }];
export const GLASSES: Named[] = [{ label: 'Ninguno' }, { label: 'Redondos' }, { label: 'Cuadrados' }];
export const VOICES: (Named & { pitch: number; wave: OscillatorType })[] = [
  { label: 'Suave', pitch: 330, wave: 'triangle' }, { label: 'Alegre', pitch: 440, wave: 'square' },
  { label: 'Grave', pitch: 165, wave: 'triangle' }, { label: 'Serena', pitch: 247, wave: 'sine' }
];
export const TRAITS: { id: Trait; label: string; detail: string }[] = [
  { id: 'creatividad', label: 'Creatividad', detail: 'Empiezas con más creatividad.' },
  { id: 'curiosidad', label: 'Curiosidad', detail: 'Un poco más de estudio y creatividad.' },
  { id: 'empatia', label: 'Empatía', detail: 'Empiezas con mejor ánimo.' },
  { id: 'disciplina', label: 'Disciplina', detail: 'Empiezas con más estudio.' }
];
export const DREAMS: { id: Dream; label: string }[] = [
  { id: 'arte', label: 'Crear arte' }, { id: 'ciencia', label: 'Descubrir ciencia' },
  { id: 'ayudar', label: 'Ayudar a otros' }, { id: 'emprender', label: 'Emprender' }
];
export const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

/** "Estilo" presets: a whole outfit in one tap, with a version per body. */
export const STYLE_PRESETS: { label: string; fem: Partial<Appearance>; masc: Partial<Appearance> }[] = [
  { label: 'Urbano',
    fem: { top: 0, topColor: 0, bottom: 0, bottomColor: 3, shoes: 0, earrings: 1, necklace: true, backpack: true },
    masc: { top: 0, topColor: 0, bottom: 0, bottomColor: 3, shoes: 0, earrings: 0, necklace: false, backpack: true } },
  { label: 'Artístico',
    fem: { top: 3, topColor: 9, bottom: 2, bottomColor: 0, shoes: 1, earrings: 2, necklace: true, headphones: false },
    masc: { top: 3, topColor: 7, bottom: 1, bottomColor: 0, shoes: 1, earrings: 0, necklace: false } },
  { label: 'Deportivo',
    fem: { top: 1, topColor: 6, bottom: 3, bottomColor: 1, shoes: 0, earrings: 0, necklace: false },
    masc: { top: 1, topColor: 4, bottom: 3, bottomColor: 1, shoes: 0, necklace: false } },
  { label: 'Clásico',
    fem: { top: 2, topColor: 2, bottom: 1, bottomColor: 4, shoes: 2, earrings: 2, necklace: true },
    masc: { top: 2, topColor: 2, bottom: 1, bottomColor: 4, shoes: 2, necklace: false } }
];

const FEM_LOOK: Appearance = {
  skin: 3, face: 0, eyes: 0, brows: 1, nose: 0, mouth: 0, hair: 0, hairColor: 1, extras: ['rubor'],
  top: 0, topColor: 0, bottom: 0, bottomColor: 3, shoes: 0,
  earrings: 1, glasses: 0, necklace: true, headphones: false, backpack: true, voice: 0
};
const MASC_LOOK: Appearance = {
  skin: 3, face: 3, eyes: 0, brows: 2, nose: 1, mouth: 1, hair: 6, hairColor: 0, extras: [],
  top: 0, topColor: 4, bottom: 0, bottomColor: 3, shoes: 0,
  earrings: 0, glasses: 0, necklace: false, headphones: false, backpack: true, voice: 2
};
const NEUTRAL_LOOK: Appearance = {
  skin: 3, face: 0, eyes: 1, brows: 1, nose: 0, mouth: 1, hair: 11, hairColor: 2, extras: [],
  top: 1, topColor: 9, bottom: 1, bottomColor: 0, shoes: 0,
  earrings: 2, glasses: 0, necklace: false, headphones: true, backpack: true, voice: 3
};
const DEFAULT_NAMES: Record<Gender, string> = { femenino: 'Alma', masculino: 'Leo', 'no-binario': 'Ariel' };

export function bodyFor(gender: Gender): Body {
  return gender === 'femenino' ? 'fem' : gender === 'masculino' ? 'masc' : 'neutral';
}
export function presetFor(gender: Gender): Appearance {
  const look = gender === 'femenino' ? FEM_LOOK : gender === 'masculino' ? MASC_LOOK : NEUTRAL_LOOK;
  return { ...look, extras: [...look.extras] };
}
export function createDefaultCharacter(gender: Gender = 'femenino'): CharacterProfile {
  return {
    gender, firstName: DEFAULT_NAMES[gender], lastName: 'Rodríguez',
    birthday: { day: 14, month: 3 }, trait: 'creatividad', dream: 'arte',
    appearance: presetFor(gender)
  };
}

/**
 * Switching gender swaps to that gender's look (hair, face, clothes,
 * accessories, voice) but keeps the personal traits the player picked:
 * skin tone, eye colour and hair colour. A default name follows the gender;
 * a name the player typed is kept.
 */
export function changeGender(profile: CharacterProfile, gender: Gender): CharacterProfile {
  if (profile.gender === gender) return profile;
  const keep = profile.appearance;
  const appearance = { ...presetFor(gender), skin: keep.skin, eyes: keep.eyes, hairColor: keep.hairColor };
  const typedName = profile.firstName !== DEFAULT_NAMES[profile.gender];
  return { ...profile, gender, appearance, firstName: typedName ? profile.firstName : DEFAULT_NAMES[gender] };
}

export function applyStylePreset(profile: CharacterProfile, index: number): CharacterProfile {
  const preset = STYLE_PRESETS[index];
  if (!preset) return profile;
  const part = profile.gender === 'femenino' ? preset.fem : preset.masc;
  return { ...profile, appearance: { ...profile.appearance, ...part } };
}

export function toggleExtra(appearance: Appearance, extra: Extra | 'ninguno'): Appearance {
  if (extra === 'ninguno') return { ...appearance, extras: [] };
  const has = appearance.extras.includes(extra);
  return { ...appearance, extras: has ? appearance.extras.filter(e => e !== extra) : [...appearance.extras, extra] };
}

export function daysInMonth(month: number): number {
  return [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1] ?? 31;
}

/** Errors keyed by field; empty object means the profile can start a game. */
export function validateProfile(p: CharacterProfile): Partial<Record<'firstName' | 'lastName' | 'birthday', string>> {
  const errors: Partial<Record<'firstName' | 'lastName' | 'birthday', string>> = {};
  const nameRule = /^[\p{L}][\p{L}' -]*$/u;
  const first = p.firstName.trim(), last = p.lastName.trim();
  if (!first) errors.firstName = 'Escribe un nombre.';
  else if (first.length > 20) errors.firstName = 'Máximo 20 letras.';
  else if (!nameRule.test(first)) errors.firstName = 'Usa solo letras.';
  if (!last) errors.lastName = 'Escribe un apellido.';
  else if (last.length > 20) errors.lastName = 'Máximo 20 letras.';
  else if (!nameRule.test(last)) errors.lastName = 'Usa solo letras.';
  const { day, month } = p.birthday;
  if (!(month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth(month))) errors.birthday = 'Esa fecha no existe.';
  return errors;
}

export function startingStats(p: CharacterProfile) {
  const stats = { energy: 83, mood: 72, study: 20, creativity: 24 };
  if (p.trait === 'creatividad') stats.creativity += 6;
  if (p.trait === 'disciplina') stats.study += 6;
  if (p.trait === 'empatia') stats.mood += 6;
  if (p.trait === 'curiosidad') { stats.study += 3; stats.creativity += 3; }
  return stats;
}

const index = (v: unknown, size: number, fallback: number) =>
  Number.isInteger(v) && (v as number) >= 0 && (v as number) < size ? (v as number) : fallback;
const bool = (v: unknown, fallback: boolean) => (typeof v === 'boolean' ? v : fallback);

/** Repairs a profile read from storage so a broken or older save never crashes the game. */
export function sanitizeCharacter(raw: unknown): CharacterProfile {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, any>;
  const gender: Gender = GENDERS.some(g => g.id === r.gender) ? r.gender : 'femenino';
  const base = createDefaultCharacter(gender);
  const a = (r.appearance && typeof r.appearance === 'object' ? r.appearance : {}) as Record<string, unknown>;
  const d = base.appearance;
  const appearance: Appearance = {
    skin: index(a.skin, SKIN_TONES.length, d.skin), face: index(a.face, FACES.length, d.face),
    eyes: index(a.eyes, EYE_COLORS.length, d.eyes), brows: index(a.brows, BROWS.length, d.brows),
    nose: index(a.nose, NOSES.length, d.nose), mouth: index(a.mouth, MOUTHS.length, d.mouth),
    hair: index(a.hair, HAIR_STYLES.length, d.hair), hairColor: index(a.hairColor, HAIR_COLORS.length, d.hairColor),
    extras: Array.isArray(a.extras) ? (a.extras as unknown[]).filter((e): e is Extra => EXTRAS.some(x => x.id === e)) : d.extras,
    top: index(a.top, TOPS.length, d.top), topColor: index(a.topColor, CLOTH_COLORS.length, d.topColor),
    bottom: index(a.bottom, BOTTOMS.length, d.bottom), bottomColor: index(a.bottomColor, CLOTH_COLORS.length, d.bottomColor),
    shoes: index(a.shoes, SHOES.length, d.shoes), earrings: index(a.earrings, EARRINGS.length, d.earrings),
    glasses: index(a.glasses, GLASSES.length, d.glasses), necklace: bool(a.necklace, d.necklace),
    headphones: bool(a.headphones, d.headphones), backpack: bool(a.backpack, d.backpack),
    voice: index(a.voice, VOICES.length, d.voice)
  };
  const text = (v: unknown, fallback: string) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, 20) : fallback);
  const b = (r.birthday && typeof r.birthday === 'object' ? r.birthday : {}) as Record<string, unknown>;
  const month = index(Number(b.month) - 1, 12, base.birthday.month - 1) + 1;
  const day = Number.isInteger(b.day) && (b.day as number) >= 1 && (b.day as number) <= daysInMonth(month) ? (b.day as number) : 1;
  return {
    gender,
    firstName: text(r.firstName, base.firstName),
    lastName: text(r.lastName, base.lastName),
    birthday: { day, month },
    trait: TRAITS.some(t => t.id === r.trait) ? r.trait : base.trait,
    dream: DREAMS.some(t => t.id === r.dream) ? r.dream : base.dream,
    appearance
  };
}
