import React, {useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Scene} from './Scene';
import {ACTIONS,clock,createInitialState,getActions,INITIAL_OBJECTIVES,loadGame,PLACES,transition} from './game';
import type {GameState,LocationId} from './game';
import './styles.css';

type Panel='objectives'|'diary'|'people'|'inventory';
const sourceLabels={observed:'Lo viviste',testimony:'Te lo contaron',evidence:'Documento encontrado'};
const worldPlaces:LocationId[]=['home','street','school','cafe','studio'];

function App(){
 const [game,setGame]=useState<GameState>(()=>loadGame());
 const [panel,setPanel]=useState<Panel>('objectives');
 const [showHelp,setShowHelp]=useState(false);
 const [confirmReset,setConfirmReset]=useState(false);
 useEffect(()=>{localStorage.setItem('eon-save-v1',JSON.stringify(game));},[game]);
 const act=(command:string)=>setGame(prev=>transition(prev,command));
 const done=(id:string)=>game.completed.includes(id)||(id==='eva'&&(game.completed.includes('eva_listen')||game.completed.includes('eva_busy')));
 const currentPlace=PLACES.find(p=>p.id===game.location);
 const actions=getActions(game);
 return <div className="app-shell">
  <header className="topbar">
   <div className="logo-box"><span className="logo">EON <em>WORLD</em></span><small>UNA VIDA, INFINITAS HISTORIAS</small></div>
   <div className="identity"><span className="portrait">👩🏻</span><div><strong>Alma Rodríguez</strong><small>14 años · Día {game.day} · Versión jugable</small></div></div>
   <div className="stats">
    <span title="Energía">⚡ <b>{game.stats.energy}</b></span>
    <span title="Ánimo">♥ <b>{game.stats.mood}</b></span>
    <span title="Estudio">📖 <b>{game.stats.study}</b></span>
    <span title="Creatividad">🎨 <b>{game.stats.creativity}</b></span>
   </div>
   <div className="time-pill"><strong>☀ {clock(game.minute)}</strong><small>Primavera · Día {game.day}</small></div>
   <button className="icon-button" onClick={()=>setShowHelp(!showHelp)} aria-label="Instrucciones">?</button>
  </header>
  <div className="content-grid">
   <section className="world-panel">
    <div className="scene-heading"><div><small>EXPLORACIÓN LIBRE</small><h1>{currentPlace?.emoji} {currentPlace?.label}</h1></div><span className="micro-hint">WASD / flechas para caminar · Toca los puntos para interactuar</span></div>
    <Scene location={game.location} onAction={act}/>
    <div className="notice" role="status"><span>✦</span>{game.notice}</div>
    <nav className="location-nav" aria-label="Viajar entre lugares">
     {worldPlaces.map(place=>{const p=PLACES.find(v=>v.id===place)!;return <button key={place} className={game.location===place?'selected':''} onClick={()=>act('go:'+place)} aria-current={game.location===place?'page':undefined}>{p.emoji}<span>{p.label}</span></button>;})}
    </nav>
    <div className="world-hint"><b>El mundo no se detiene.</b> Cada actividad utiliza tiempo del día. Las decisiones dejan huellas que puedes consultar en el diario.</div>
   </section>
   <aside className="sidebar">
    <div className="tabs" role="tablist" aria-label="Panel de juego">
     {([['objectives','★ Objetivos'],['diary','▤ Diario'],['people','♧ Personas'],['inventory','▣ Objetos']] as const).map(([id,label])=><button role="tab" aria-selected={panel===id} className={panel===id?'active':''} key={id} onClick={()=>setPanel(id)}>{label}</button>)}
    </div>
    {panel==='objectives'&&<div className="side-section">
      <h2>Objetivos del día</h2>
      <p className="muted">No tienes que cumplirlo todo. Tus elecciones crean tu historia.</p>
      <div className="objective-list">{INITIAL_OBJECTIVES.map(o=><div key={o.id} className={'objective '+(done(o.id)?'completed':'')}><span className="check">{done(o.id)?'✓':'○'}</span>{o.label}</div>)}</div>
      <p className="progress-line">Progreso del día · {INITIAL_OBJECTIVES.filter(o=>done(o.id)).length}/{INITIAL_OBJECTIVES.length}</p>
      <div className="progress"><div style={{width:(INITIAL_OBJECTIVES.filter(o=>done(o.id)).length/INITIAL_OBJECTIVES.length*100)+'%'}}/></div>
    </div>}
    {panel==='diary'&&<div className="side-section"><h2>✦ Diario vivo</h2><p className="muted">Solo contiene aquello que Alma presenció o descubrió.</p><div className="diary-items">{[...game.journal].reverse().map(e=><article className="entry" key={e.id+'-'+e.day}><small>Día {e.day} · {clock(e.minute)} · {sourceLabels[e.source]}</small><h3>{e.title}</h3><p>{e.text}</p></article>)}</div></div>}
    {panel==='people'&&<div className="side-section"><h2>Personas de Aurora</h2><p className="muted">La confianza no es un número que puedas leer en la mente de otra persona.</p><article className="person"><span>👩🏻</span><div><b>Eva Molina</b><p>{game.completed.includes('eva_listen')?'Te agradeció que la escucharas.':game.completed.includes('eva_busy')?'Habéis dejado una conversación pendiente.':'Compañera de la escuela. Todavía tienes mucho por descubrir.'}</p></div></article><article className="person"><span>👩🏽</span><div><b>Marina Rojas</b><p>Tu madre. Conoce parte de la historia de tu hogar.</p></div></article><article className="person"><span>👨🏻</span><div><b>Mateo Rojas</b><p>Tu padre. No conoces todos los detalles de su pasado.</p></div></article></div>}
    {panel==='inventory'&&<div className="side-section"><h2>Inventario</h2>{game.inventory.length?game.inventory.map((v,i)=><p className="item" key={v+i}>▧ {v}</p>):<p className="muted">Tu mochila está vacía. Explora la casa.</p>}</div>}
    <div className="side-section action-panel"><h2>¿Qué quieres hacer aquí?</h2><div className="action-list">{actions.length?actions.map(action=><button key={action.id} onClick={()=>act(action.id)}><span><b>{action.label}</b><small>{action.detail}</small></span><i>+{action.minutes} min</i></button>):<p className="muted">No quedan acciones disponibles en este lugar. Explora otros sitios.</p>}</div></div>
    <div className="side-footer"><button onClick={()=>setPanel('diary')}>📖 Abrir diario</button><button onClick={()=>setConfirmReset(true)}>↻ Reiniciar</button></div>
   </aside>
  </div>
  <footer>PRIMERA PARTIDA JUGABLE · PROTOTIPO A LOS 14 AÑOS · LA VIDA COMPLETA DESDE EL NACIMIENTO SE IMPLEMENTARÁ POR ETAPAS</footer>
  {showHelp&&<div className="modal-cover" onClick={()=>setShowHelp(false)}><div className="modal" onClick={e=>e.stopPropagation()}><h2>Cómo jugar</h2><p>Camina con las flechas o WASD, pulsa sobre los puntos de interacción, visita lugares con la navegación inferior y completa algunas actividades. Puedes tomar decisiones distintas con Eva; el diario guardará lo que sepas de verdad.</p><p>La partida se guarda automáticamente en este navegador. Puedes dormir desde tu hogar para continuar al día siguiente.</p><button onClick={()=>setShowHelp(false)}>Entendido</button></div></div>}
  {confirmReset&&<div className="modal-cover"><div className="modal"><h2>¿Comenzar una nueva partida?</h2><p>Se reemplazará la partida guardada en este navegador.</p><div className="modal-buttons"><button onClick={()=>setConfirmReset(false)}>Cancelar</button><button onClick={()=>{setGame(createInitialState());setConfirmReset(false);setPanel('objectives');}}>Nueva partida</button></div></div></div>}
 </div>;
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
