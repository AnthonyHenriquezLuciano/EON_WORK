import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {paintPortrait,PORTRAIT_W,PORTRAIT_H} from '../src/art/portrait.ts';
import {paintSprite,FACINGS,SPRITE_W,SPRITE_H} from '../src/art/sprite.ts';
import {paintMenuScene,MENU_W,MENU_H} from '../src/art/menuScene.ts';
import {changeGender,createDefaultCharacter,HAIR_STYLES,FACES,TOPS,BOTTOMS} from '../src/character.ts';

const differs=(a:Uint8ClampedArray,b:Uint8ClampedArray)=>{let n=0;for(let i=0;i<a.length;i+=4)if(a[i]!==b[i]||a[i+1]!==b[i+1]||a[i+2]!==b[i+2]||a[i+3]!==b[i+3])n++;return n;};

test('switching to Masculino visibly changes the portrait and the sprite',()=>{
 const fem=createDefaultCharacter('femenino'),masc=changeGender(fem,'masculino');
 const pf=paintPortrait(fem.appearance,{gender:fem.gender}),pm=paintPortrait(masc.appearance,{gender:masc.gender});
 assert.ok(differs(pf.data,pm.data)>400,'portrait should change a lot');
 assert.ok(differs(paintSprite(fem.appearance,'femenino','front').data,paintSprite(masc.appearance,'masculino','front').data)>40);
});
test('the same body type renders the same face shape, so only gender changes the build',()=>{
 const a=createDefaultCharacter('femenino').appearance;
 assert.ok(differs(paintPortrait(a,{gender:'femenino'}).data,paintPortrait(a,{gender:'masculino'}).data)>0);
});
test('art is deterministic',()=>{
 const a=createDefaultCharacter('no-binario').appearance;
 assert.equal(differs(paintPortrait(a,{gender:'no-binario'}).data,paintPortrait(a,{gender:'no-binario'}).data),0);
});
test('every hair style, face, top and bottom renders in every direction',()=>{
 for(const gender of ['femenino','masculino','no-binario'] as const){
  const base=createDefaultCharacter(gender).appearance;
  for(let hair=0;hair<HAIR_STYLES.length;hair++){
   const a={...base,hair,face:hair%FACES.length,top:hair%TOPS.length,bottom:hair%BOTTOMS.length,headphones:hair%2===0,glasses:hair%3};
   const p=paintPortrait(a,{gender});assert.equal(p.width,PORTRAIT_W);assert.equal(p.height,PORTRAIT_H);
   for(const f of FACINGS){const s=paintSprite(a,gender,f);assert.equal(s.width,SPRITE_W);assert.equal(s.height,SPRITE_H);assert.ok(s.data.some((v,i)=>i%4===3&&v>0));}
  }
 }
});
test('each hair style looks different from the others',()=>{
 const a=createDefaultCharacter('femenino').appearance;
 const renders=HAIR_STYLES.map((_,hair)=>paintPortrait({...a,hair},{gender:'femenino',backdrop:false}).data);
 for(let i=0;i<renders.length;i++)for(let j=i+1;j<renders.length;j++)assert.ok(differs(renders[i],renders[j])>20,`hair ${i} vs ${j}`);
});
test('the left-facing sprite is the mirror of the right-facing one',()=>{
 const a=createDefaultCharacter('masculino').appearance;
 const r=paintSprite(a,'masculino','right'),l=paintSprite(a,'masculino','left');
 for(let y=0;y<SPRITE_H;y++)for(let x=0;x<SPRITE_W;x++)assert.equal(l.get(x,y),r.get(SPRITE_W-1-x,y));
});
test('the title scene paints the whole frame and has lights to animate',()=>{
 const {base,twinkles}=paintMenuScene();
 assert.equal(base.width,MENU_W);assert.equal(base.height,MENU_H);
 for(let i=3;i<base.data.length;i+=4)assert.equal(base.data[i],255);
 assert.ok(twinkles.length>20);
});
