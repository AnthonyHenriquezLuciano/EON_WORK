import { useEffect, useRef } from 'react';
import { Application, Container, Graphics, Rectangle, Text } from 'pixi.js';
import type { LocationId } from './game';

type Spot={id:string;label:string;x:number;y:number;hue:number};
const locations:Record<LocationId,{title:string;subtitle:string;spots:Spot[];theme:number}>={
 home:{title:'Hogar de Alma',subtitle:'Una mañana llena de posibilidades',theme:0x473b62,spots:[
  {id:'breakfast',label:'Desayunar',x:360,y:290,hue:0xe6a45b},
  {id:'bag',label:'Mochila',x:608,y:310,hue:0xa88ad5},
  {id:'mom',label:'Hablar con mamá',x:485,y:217,hue:0xe79e9c},
  {id:'letter',label:'Carta familiar',x:680,y:430,hue:0xd6c9a1},
  {id:'go:street',label:'Salir al barrio',x:785,y:365,hue:0x9bcab4}
 ]},
 street:{title:'Barrio Aurora',subtitle:'El barrio vive a su propio ritmo',theme:0x345f6b,spots:[
  {id:'go:home',label:'Mi hogar',x:264,y:227,hue:0xe4a66c},
  {id:'go:school',label:'Escuela',x:456,y:169,hue:0x96cce2},
  {id:'go:cafe',label:'El Encuentro',x:692,y:258,hue:0xffb772},
  {id:'go:studio',label:'Club de Arte',x:606,y:385,hue:0xca9ee2},
  {id:'explore',label:'Parque Central',x:350,y:390,hue:0xa4c589}
 ]},
 school:{title:'Escuela de Aurora',subtitle:'Clases, amistades y oportunidades',theme:0x4e6371,spots:[
  {id:'submit',label:'Entregar tarea',x:412,y:243,hue:0xeac46a},
  {id:'eva_listen',label:'Escuchar a Eva',x:620,y:300,hue:0xe69daf},
  {id:'study',label:'Participar',x:528,y:413,hue:0x9ad5c6},
  {id:'go:street',label:'Salir al barrio',x:778,y:455,hue:0xa7c4e7}
 ]},
 cafe:{title:'Cafetería El Encuentro',subtitle:'Un lugar para compartir historias',theme:0x6c4c4b,spots:[
  {id:'coffee',label:'Tomar un café',x:412,y:342,hue:0xefbc7a},
  {id:'go:street',label:'Volver al barrio',x:746,y:441,hue:0xb7d5c4}
 ]},
 studio:{title:'Club de Arte',subtitle:'Las pequeñas acciones también dejan huella',theme:0x62547b,spots:[
  {id:'paint',label:'Pintar el mural',x:424,y:256,hue:0xe5a4d6},
  {id:'go:street',label:'Volver al barrio',x:741,y:434,hue:0xb7d5c4}
 ]}
};

function label(container:Container,text:string,x:number,y:number,size=15,color=0xf6eedb){
 const t=new Text({text,style:{fontFamily:'monospace',fontSize:size,fontWeight:'bold',fill:color,align:'center'}});
 t.anchor.set(.5);t.position.set(x,y);container.addChild(t);return t;
}
function diamond(g:Graphics,x:number,y:number,w:number,h:number,color:number){
 g.poly([x,y-h/2,x+w/2,y,x,y+h/2,x-w/2,y]).fill(color);
}
function boxBuilding(parent:Container,x:number,y:number,w:number,h:number,roof:number,front:number){
 const g=new Graphics();
 g.poly([x-w/2,y,x,y+w/4,x,y+w/4-h,x-w/2,y-h]).fill(front);
 g.poly([x,y+w/4,x+w/2,y,x+w/2,y-h,x,y+w/4-h]).fill(0x26344d);
 g.poly([x-w/2,y-h,x,y+w/4-h,x+w/2,y-h,x,y-w/4-h]).fill(roof);
 for(let j=0;j<3;j++){g.rect(x-w/2+10+j*19,y-h+24,10,14).fill(0xf3c878);}
 parent.addChild(g);
}
function avatar(x:number,y:number,shirt:number,scale=1){
 const c=new Container();c.position.set(x,y);c.scale.set(scale);const g=new Graphics();
 g.rect(-9,-6,7,9).fill(0x262c4c).rect(2,-6,7,9).fill(0x262c4c);
 g.rect(-13,-28,26,25).fill(shirt).rect(-18,-23,6,18).fill(0xf2bd9c).rect(12,-23,6,18).fill(0xf2bd9c);
 g.rect(-11,-46,22,22).fill(0xf2bd9c);g.rect(-14,-51,28,10).fill(0x3c2631);
 g.rect(-14,-45,6,17).fill(0x3c2631).rect(9,-45,6,17).fill(0x3c2631);
 g.rect(-6,-35,3,3).fill(0x352734).rect(4,-35,3,3).fill(0x352734);
 g.rect(-8,1,9,4).fill(0x141d2c).rect(3,1,9,4).fill(0x141d2c);
 c.addChild(g);return c;
}
function drawScene(app:Application,location:LocationId, onAction:(id:string)=>void){
 const stage=app.stage;
 stage.removeChildren().forEach(child=>child.destroy({children:true}));
 const scene=locations[location];
 const back=new Graphics().rect(0,0,960,560).fill(0x111f35);
 back.rect(0,0,960,98).fill(0x253755);
 for(let k=0;k<17;k++){const bheight=25+(k%5)*14;back.rect(k*62,120-bheight,39,bheight).fill(0x1b2840);}
 const skyStars=new Graphics();
 for(let k=0;k<45;k++){const x=(k*173)%950;const y=(k*67)%120;skyStars.rect(x,y,2,2).fill(k%4?0x6385a3:0xffca8a);}
 stage.addChild(back,skyStars);
 const ground=new Graphics();
 for(let ix=0;ix<11;ix++)for(let iy=0;iy<10;iy++){
  const x=474+(ix-iy)*42,y=65+(ix+iy)*22;
  diamond(ground,x,y,83,43,(ix+iy)%3===0?0x617c75:(ix+iy)%3===1?0x52746f:0x486d6d);
 }
 stage.addChild(ground);
 if(location==='street'){
   boxBuilding(stage,256,225,185,95,0x96546a,0xc57f60);
   boxBuilding(stage,477,192,165,116,0x6875a6,0xa2a1b6);
   boxBuilding(stage,685,273,160,100,0x985a57,0xc59069);
   boxBuilding(stage,600,401,176,83,0x775e99,0x8c79ad);
   const park=new Graphics();
   for(let i=0;i<9;i++){const xx=270+i*18,yy=351+(i%3)*16;park.circle(xx,yy-19,19).fill(i%2?0x4c8967:0x73a46c);park.rect(xx-3,yy-12,6,20).fill(0x6a4b40);}
   stage.addChild(park);
 } else if(location==='home'){
   boxBuilding(stage,460,280,375,98,0x8e7180,0xc5a391);
   const furniture=new Graphics();
   furniture.rect(560,323,88,58).fill(0x8d5876).rect(576,337,55,28).fill(0xe8bac4);
   furniture.rect(325,296,90,42).fill(0x845940).rect(345,309,52,18).fill(0xd9aa77);
   furniture.rect(635,417,80,35).fill(0x9b7051);
   stage.addChild(furniture);
 } else if(location==='school'){
   boxBuilding(stage,475,268,340,134,0x7386a3,0xe0b997);
   const furniture=new Graphics();for(let i=0;i<4;i++)furniture.rect(340+i*70,386+i%2*18,48,24).fill(0xaa8058);
   stage.addChild(furniture);
 } else if(location==='cafe'){
   boxBuilding(stage,475,298,360,126,0x985f63,0xd3a17b);
   const furniture=new Graphics();for(let i=0;i<4;i++){furniture.circle(332+i*90,394-i%2*18,24).fill(0x906047);furniture.circle(332+i*90,394-i%2*18,12).fill(0xe6bb81);}
   stage.addChild(furniture);
 } else {
   boxBuilding(stage,466,298,350,117,0x8a6f9e,0xc9a1a8);
   const paintings=new Graphics();for(let i=0;i<5;i++){paintings.rect(340+i*70,364-i%2*35,35,40).fill([0xe7acba,0xa9d3cf,0xe2c17a][i%3]);paintings.rect(350+i*70,375-i%2*35,14,13).fill(0x7761b1);}
   stage.addChild(paintings);
 }
 const decorations=new Graphics();
 for(let i=0;i<25;i++){const x=100+((i*91)%760),y=276+((i*57)%212);if(i%4!==0)continue;
 decorations.rect(x-3,y-5,7,24).fill(0x655043).circle(x,y-17,19).fill(i%3===0?0xb279a8:0x5c9b7a);}
 stage.addChild(decorations);
 const npcNames=location==='home'?['Mamá','Papá']:location==='school'?['Eva','Profesora']:location==='cafe'?['Barista','Vecina']:location==='studio'?['Sofía','Profesor']:['Vecino','Músico'];
 for(let i=0;i<2;i++){const npc=avatar(355+i*210,390-i*54,i?0x93a6c9:0xc77e91,.85);stage.addChild(npc);label(stage,npcNames[i],355+i*210,410-i*54,11);}
 for(const spot of scene.spots){
   const marker=new Container();marker.position.set(spot.x,spot.y);marker.eventMode='static';marker.cursor='pointer';
   const plate=new Graphics().roundRect(-87,-19,174,37,8).fill(0x101d30).roundRect(-85,-17,170,33,7).stroke({color:spot.hue,width:2});
   const dot=new Graphics().circle(-73,0,6).fill(spot.hue);
   marker.addChild(plate,dot);label(marker,spot.label,8,0,13);
   marker.on('pointertap',(event)=>{event.stopPropagation();onAction(spot.id);});
   stage.addChild(marker);
 }
 const player=avatar(485,477,0xf4be8b,1.15);stage.addChild(player);
 label(stage,scene.title,480,27,24,0xf8d17c);
 label(stage,scene.subtitle,480,55,12,0xd1d8e8);
 const destination={x:485,y:477};
 stage.hitArea=new Rectangle(0,0,960,560);stage.eventMode='static';
 stage.on('pointertap',(event)=>{destination.x=Math.max(90,Math.min(850,event.global.x));destination.y=Math.max(200,Math.min(525,event.global.y));});
 let keys=new Set<string>();
 const down=(e:KeyboardEvent)=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d'].includes(e.key)){keys.add(e.key); if(e.key.startsWith('Arrow'))e.preventDefault();}};
 const up=(e:KeyboardEvent)=>keys.delete(e.key);
 window.addEventListener('keydown',down);window.addEventListener('keyup',up);
 const tick=(ticker:{deltaTime:number})=>{
  const speed=Math.min(3.2*ticker.deltaTime,16);
  let x=0,y=0;
  if(keys.has('ArrowLeft')||keys.has('a'))x--;
  if(keys.has('ArrowRight')||keys.has('d'))x++;
  if(keys.has('ArrowUp')||keys.has('w'))y--;
  if(keys.has('ArrowDown')||keys.has('s'))y++;
  if(x||y){player.x+=x*speed;player.y+=y*speed;destination.x=player.x;destination.y=player.y;}
  else{const dx=destination.x-player.x,dy=destination.y-player.y;const len=Math.hypot(dx,dy);if(len>2){player.x+=dx/len*Math.min(len,speed);player.y+=dy/len*Math.min(len,speed);}}
  player.x=Math.max(85,Math.min(865,player.x));player.y=Math.max(170,Math.min(525,player.y));
 };
 app.ticker.add(tick);
 return ()=>{window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);app.ticker.remove(tick);stage.removeAllListeners();};
}
export function Scene({location,onAction}:{location:LocationId;onAction:(id:string)=>void}){
 const host=useRef<HTMLDivElement>(null);
 const appRef=useRef<Application|null>(null);
 const stopRef=useRef<(()=>void)|null>(null);
 const callback=useRef(onAction);callback.current=onAction;
 useEffect(()=>{
  let cancelled=false;
  const app=new Application(); 
  void app.init({width:960,height:560,backgroundColor:0x101e30,antialias:false,resolution:1}).then(()=>{
   if(cancelled){app.destroy();return;}
   appRef.current=app;host.current?.appendChild(app.canvas);
   stopRef.current=drawScene(app,location,(id)=>callback.current(id));
  });
  return ()=>{cancelled=true;stopRef.current?.();stopRef.current=null;appRef.current=null;try{app.destroy();}catch{}};
  // Pixi application initializes once; subsequent location changes redraw it.
 },[]);
 useEffect(()=>{if(appRef.current){stopRef.current?.();stopRef.current=drawScene(appRef.current,location,(id)=>callback.current(id));}},[location]);
 return <div ref={host} className="pixel-scene" role="img" aria-label={'Escenario interactivo: '+locations[location].title}/>;
}
