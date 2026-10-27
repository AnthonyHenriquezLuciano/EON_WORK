import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {changeGender,createDefaultCharacter,sanitizeCharacter,startingStats,validateProfile,applyStylePreset,toggleExtra,bodyFor} from '../src/character.ts';
import {createInitialState,parseSave} from '../src/game.ts';

test('switching to Masculino gives a male look and keeps skin, eyes and hair colour',()=>{
 const fem={...createDefaultCharacter('femenino')};
 fem.appearance={...fem.appearance,skin:6,eyes:3,hairColor:5};
 const masc=changeGender(fem,'masculino');
 assert.equal(bodyFor(masc.gender),'masc');
 assert.equal(masc.appearance.hair,createDefaultCharacter('masculino').appearance.hair);
 assert.notEqual(masc.appearance.hair,fem.appearance.hair);
 assert.equal(masc.appearance.earrings,0);
 assert.equal(masc.appearance.skin,6);assert.equal(masc.appearance.eyes,3);assert.equal(masc.appearance.hairColor,5);
});
test('a default name follows the gender but a typed name is kept',()=>{
 assert.equal(changeGender(createDefaultCharacter('femenino'),'masculino').firstName,'Leo');
 const typed={...createDefaultCharacter('femenino'),firstName:'Yaritza'};
 assert.equal(changeGender(typed,'masculino').firstName,'Yaritza');
});
test('names and birthdays are validated',()=>{
 const ok=createDefaultCharacter();
 assert.deepEqual(validateProfile(ok),{});
 assert.ok(validateProfile({...ok,firstName:'  '}).firstName);
 assert.ok(validateProfile({...ok,lastName:'R2D2'}).lastName);
 assert.ok(validateProfile({...ok,birthday:{day:31,month:4}}).birthday);
 assert.deepEqual(validateProfile({...ok,firstName:'María José',lastName:"D'Oleo"}),{});
});
test('the chosen strength changes the starting stats',()=>{
 const base=createDefaultCharacter();
 assert.ok(startingStats({...base,trait:'disciplina'}).study>startingStats({...base,trait:'creatividad'}).study);
 assert.equal(createInitialState({...base,trait:'empatia'}).stats.mood,78);
});
test('style presets never put a skirt on the masculine body',()=>{
 const masc=createDefaultCharacter('masculino');
 for(let i=0;i<4;i++)assert.notEqual(applyStylePreset(masc,i).appearance.bottom,2);
});
test('extras toggle on and off, and "ninguno" clears them',()=>{
 let a=createDefaultCharacter('masculino').appearance;
 a=toggleExtra(a,'pecas');assert.deepEqual(a.extras,['pecas']);
 a=toggleExtra(a,'pecas');assert.deepEqual(a.extras,[]);
 a=toggleExtra(toggleExtra(a,'lunar'),'ninguno');assert.deepEqual(a.extras,[]);
});
test('broken character data is repaired instead of crashing',()=>{
 const c=sanitizeCharacter({gender:'masculino',firstName:'',appearance:{hair:99,skin:-1,extras:['pecas','alas']},birthday:{day:40,month:2}});
 assert.equal(c.gender,'masculino');assert.equal(c.firstName,'Leo');
 assert.ok(c.appearance.hair<12);assert.ok(c.appearance.skin>=0);
 assert.deepEqual(c.appearance.extras,['pecas']);assert.equal(c.birthday.month,2);assert.ok(c.birthday.day<=29);
});
test('an old save keeps its progress and gets the original protagonist',()=>{
 const old={...createInitialState(),version:1,day:3,minute:600} as Record<string,unknown>;
 delete old.character;
 const s=parseSave(JSON.stringify(old))!;
 assert.equal(s.version,2);assert.equal(s.day,3);assert.equal(s.character.firstName,'Alma');
});
test('unreadable saves are ignored',()=>{
 assert.equal(parseSave(null),null);assert.equal(parseSave('{oops'),null);
 assert.equal(parseSave(JSON.stringify({version:9})),null);
 assert.equal(parseSave(JSON.stringify({...createInitialState(),location:'luna'})),null);
});
