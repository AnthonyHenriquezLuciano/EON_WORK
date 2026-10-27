import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createInitialState, deleteSave, readSave, writeSave } from './game';
import type { GameState } from './game';
import type { CharacterProfile } from './character';
import { MainMenu } from './screens/MainMenu';
import type { Settings } from './screens/MainMenu';
import { Creator } from './screens/Creator';
import { Game } from './screens/Game';
import '@fontsource/cinzel/600.css';
import '@fontsource/dancing-script/600.css';
import './styles.css';
import './ui.css';

type Screen = 'menu' | 'creator' | 'game';
const SETTINGS_KEY = 'eon-settings';

function readSettings(): Settings {
  const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  try {
    const raw = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? 'null');
    if (raw && typeof raw.animations === 'boolean') return { animations: raw.animations };
  } catch { /* fall through to defaults */ }
  return { animations: !reduced };
}

function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [save, setSave] = useState<GameState | null>(() => readSave());
  const [game, setGame] = useState<GameState | null>(null);
  const [settings, setSettings] = useState<Settings>(readSettings);

  useEffect(() => { if (game) writeSave(game); }, [game]);
  useEffect(() => { window.scrollTo(0, 0); }, [screen]);

  const changeSettings = (s: Settings) => {
    setSettings(s);
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch { /* keep it for this session */ }
  };
  const start = (profile: CharacterProfile) => { const g = createInitialState(profile); writeSave(g); setGame(g); setScreen('game'); };
  const toMenu = () => { setSave(readSave() ?? game); setScreen('menu'); };

  if (screen === 'creator') return <Creator hasSave={!!save} onCancel={() => setScreen('menu')} onConfirm={start} />;
  if (screen === 'game' && game) {
    return <Game game={game} setGame={update => setGame(prev => (prev ? update(prev) : prev))} onMenu={toMenu} />;
  }
  return (
    <MainMenu
      save={save}
      settings={settings}
      onSettings={changeSettings}
      onNew={() => setScreen('creator')}
      onContinue={() => { const s = readSave() ?? save; if (s) { setGame(s); setScreen('game'); } }}
      onDeleteSave={() => { deleteSave(); setSave(null); setGame(null); }}
    />
  );
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
