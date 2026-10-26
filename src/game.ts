/**
 * First playable day: deterministic, framework-independent actions.
 * This slice starts at age 14; full life-from-birth remains the product goal.
 */
export type LocationId = 'home' | 'street' | 'school' | 'cafe' | 'studio';
export type Stats = { energy: number; mood: number; study: number; creativity: number };
export type JournalEntry = { id: string; day: number; minute: number; title: string; text: string; source: 'observed' | 'testimony' | 'evidence' };
export type GameState = {
  version: 1;
  day: number;
  minute: number;
  location: LocationId;
  stats: Stats;
  evaRelationship: number;
  completed: string[];
  inventory: string[];
  journal: JournalEntry[];
  notice: string;
};
export type Action = { id: string; label: string; location: LocationId; minutes: number; detail: string };
export const PLACES: { id: LocationId; label: string; emoji: string }[] = [
  { id: 'home', label: 'Hogar', emoji: '🏠' },
  { id: 'street', label: 'Barrio Aurora', emoji: '🏙️' },
  { id: 'school', label: 'Escuela', emoji: '🎓' },
  { id: 'cafe', label: 'Cafetería', emoji: '☕' },
  { id: 'studio', label: 'Club de Arte', emoji: '🎨' }
];
export const ACTIONS: Action[] = [
  {id:'breakfast',label:'Desayunar',location:'home',minutes:25,detail:'Recupera energía antes de salir'},
  {id:'bag',label:'Preparar mochila',location:'home',minutes:10,detail:'Necesaria para entregar la tarea'},
  {id:'mom',label:'Hablar con mamá',location:'home',minutes:15,detail:'Escucha una parte de la historia familiar'},
  {id:'submit',label:'Entregar tarea',location:'school',minutes:20,detail:'Requiere la mochila preparada'},
  {id:'eva_listen',label:'Escuchar a Eva',location:'school',minutes:20,detail:'Descubre lo que le preocupa'},
  {id:'eva_busy',label:'Decir a Eva que estás ocupada',location:'school',minutes:10,detail:'Una respuesta también es una decisión'},
  {id:'study',label:'Participar en clase',location:'school',minutes:45,detail:'Practicar y aprender'},
  {id:'coffee',label:'Tomar algo en la cafetería',location:'cafe',minutes:30,detail:'Relajarte después de clases'},
  {id:'paint',label:'Pintar el mural del barrio',location:'studio',minutes:50,detail:'Practicar arte y colaborar'},
  {id:'explore',label:'Explorar el parque',location:'street',minutes:30,detail:'Conocer a tus vecinos'},
  {id:'letter',label:'Revisar una carta familiar',location:'home',minutes:15,detail:'Investiga una pista sobre el pasado'},
  {id:'sleep',label:'Dormir y comenzar otro día',location:'home',minutes:480,detail:'Guarda tus recuerdos y continúa'}
];
export const INITIAL_OBJECTIVES = [
  {id:'breakfast',label:'Desayunar'},
  {id:'bag',label:'Preparar la mochila'},
  {id:'submit',label:'Entregar la tarea'},
  {id:'eva',label:'Hablar con Eva'},
  {id:'paint',label:'Participar en el Club de Arte'}
];
const clamp = (v:number) => Math.max(0,Math.min(100,v));
const has=(s:GameState,id:string)=>s.completed.includes(id);
export function createInitialState(): GameState {
  return {version:1, day:1, minute:450, location:'home', stats:{energy:83,mood:72,study:20,creativity:24},evaRelationship:0,completed:[],inventory:[],journal:[{id:'intro',day:1,minute:450,title:'Un día en Barrio Aurora',text:'Despiertas con muchas cosas que hacer. Hoy puedes explorar, conocer personas y tomar pequeñas decisiones que dejarán recuerdos.',source:'observed'}],notice:'Tu historia se escribe con acciones, no con saltos de un año.'};
}
export function clock(minute:number):string {
  const hour = Math.floor(minute/60)%24;
  return String(hour).padStart(2,'0')+':'+String(minute%60).padStart(2,'0');
}
export function getActions(s:GameState):Action[] {
  return ACTIONS.filter(a=>a.location===s.location && !has(s,a.id) && !(a.id==='letter' && !has(s,'mom')));
}
function remember(s:GameState,id:string,title:string,text:string,source:JournalEntry['source']):void{
  s.journal.push({id,day:s.day,minute:s.minute,title,text,source});
}
export function transition(previous:GameState,command:string):GameState {
  const s:GameState={...previous,stats:{...previous.stats},completed:[...previous.completed],inventory:[...previous.inventory],journal:[...previous.journal]};
  if(command.startsWith('go:')){
    const destination=command.slice(3);
    if(!PLACES.some(p=>p.id===destination)){s.notice='Ese lugar no existe.';return s;}
    if(s.location===destination){s.notice='Ya estás aquí.';return s;}
    if(s.minute>1260){s.notice='Es muy tarde para viajar. Regresa a casa.';return s;}
    s.location=destination as LocationId;s.minute+=15;s.stats.energy=clamp(s.stats.energy-3);
    s.notice='Has llegado a '+PLACES.find(p=>p.id===s.location)?.label+'.';
    return s;
  }
  const a=ACTIONS.find(item=>item.id===command);
  if(!a||a.location!==s.location||has(s,command)){s.notice='Esta acción no está disponible aquí.';return s;}
  if(s.minute>1260&&command!=='sleep'){s.notice='Ya es tarde. Lo mejor es descansar.';return s;}
  if(command==='submit'&&!has(s,'bag')){s.notice='Necesitas preparar tu mochila primero.';return s;}
  if(command==='letter'&&!has(s,'mom')){s.notice='Todavía no tienes ninguna pista sobre esa carta.';return s;}
  s.minute+=a.minutes;
  s.stats.energy=clamp(s.stats.energy-Math.ceil(a.minutes/20));
  s.completed.push(command);
  switch(command){
    case 'breakfast': s.stats.energy=clamp(s.stats.energy+20);s.stats.mood=clamp(s.stats.mood+3);s.notice='Desayunaste con calma. ¡Qué bien empieza el día!';break;
    case 'bag':s.inventory.push('Mochila con tarea');s.notice='Tu tarea está guardada y lista.';break;
    case 'mom':remember(s,command,'La oferta de trabajo','Mamá menciona una oferta laboral que tu padre rechazó cuando eras bebé. No conoces sus razones.','testimony');s.notice='Mamá te ha contado algo sobre tu infancia.';break;
    case 'submit':s.stats.study=clamp(s.stats.study+15);s.notice='Entregaste tu tarea. Has aprendido a organizarte.';break;
    case 'eva_listen':s.evaRelationship+=2;s.stats.mood=clamp(s.stats.mood+5);remember(s,'eva','Una conversación con Eva','Eva te cuenta que quiere participar en el mural del barrio. Decidiste escucharla.','observed');s.notice='Eva agradece que la escucharas.';break;
    case 'eva_busy':s.evaRelationship-=1;remember(s,'eva','Una conversación pendiente','Eva quiso hablar contigo, pero le dijiste que estabas ocupada.','observed');s.notice='Eva parece algo decepcionada. No sabes qué quería contar.';break;
    case 'study':s.stats.study=clamp(s.stats.study+12);s.notice='Participaste en clase y aprendiste algo nuevo.';break;
    case 'coffee':s.stats.mood=clamp(s.stats.mood+7);s.notice='Disfrutaste un descanso en El Encuentro.';break;
    case 'paint':s.stats.creativity=clamp(s.stats.creativity+14);remember(s,'mural','El mural del barrio','Pasaste la tarde aportando algo de ti al mural comunitario.','observed');s.notice='Tu contribución ya forma parte del mural.';break;
    case 'explore':s.stats.mood=clamp(s.stats.mood+8);remember(s,'park','La música del parque','Un músico compartió sus canciones con los vecinos. El barrio no se detiene.','observed');s.notice='Descubriste una nueva historia en el parque.';break;
    case 'letter':s.inventory.push('Copia de una carta familiar');remember(s,'letter','Una carta guardada','Has encontrado una antigua carta. Confirma que existía una oferta, pero no explica qué sentía tu padre ni todas sus razones.','evidence');s.notice='Encontraste una prueba. Tu interpretación del pasado puede cambiar.';break;
    case 'sleep':s.day+=1;s.minute=450;s.location='home';s.completed=[];s.stats.energy=86;s.stats.mood=clamp(s.stats.mood+2);remember(s,'day-'+s.day,'Un nuevo día','Barrio Aurora sigue viviendo. Mañana puedes tomar otras decisiones.','observed');s.notice='Comienza el día '+s.day+'. Tu historia continúa.';break;
  }
  return s;
}
export function loadGame():GameState {
  try { const raw=localStorage.getItem('eon-save-v1');if(raw){const data=JSON.parse(raw);if(data?.version===1 && typeof data.minute==='number' && Array.isArray(data.journal)&&Array.isArray(data.completed))return data as GameState;} }catch{}
  return createInitialState();
}
