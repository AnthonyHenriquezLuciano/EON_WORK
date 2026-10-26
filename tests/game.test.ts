import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {createInitialState,transition,getActions,clock} from '../src/game.ts';

test('the playable slice starts on a morning at home',()=>{
 const s=createInitialState();assert.equal(s.location,'home');assert.equal(clock(s.minute),'07:30');
});
test('travelling consumes time and energy',()=>{
 const s=createInitialState(),n=transition(s,'go:school');
 assert.equal(n.location,'school');assert.equal(n.minute,s.minute+15);assert.equal(s.location,'home');
});
test('cannot submit homework before preparing a backpack',()=>{
 const s=transition(createInitialState(),'go:school'),n=transition(s,'submit');
 assert.equal(n.minute,s.minute);assert.equal(n.completed.includes('submit'),false);
});
test('preparing backpack enables homework submission',()=>{
 let s=transition(createInitialState(),'bag');s=transition(s,'go:school');s=transition(s,'submit');
 assert.ok(s.completed.includes('submit'));assert.ok(s.stats.study>20);
});
test('Eva responds differently to the player choice',()=>{
 const s=transition(createInitialState(),'go:school');
 const listen=transition(s,'eva_listen'),busy=transition(s,'eva_busy');
 assert.ok(listen.evaRelationship>busy.evaRelationship);assert.equal(s.evaRelationship,0);
});
test('a family rumor stays a testimony; a found letter is evidence not omniscience',()=>{
 let s=transition(createInitialState(),'mom');assert.equal(s.journal.at(-1)?.source,'testimony');
 s=transition(s,'letter');assert.equal(s.journal.at(-1)?.source,'evidence');assert.match(s.journal.at(-1)!.text,/no explica/);
});
test('actions are only available in correct locations, with no repeat farming',()=>{
 let s=createInitialState();assert.ok(!getActions(s).some(a=>a.id==='submit'));
 s=transition(s,'breakfast');const once=s.stats.energy;
 s=transition(s,'breakfast');assert.equal(s.stats.energy,once);
});
test('sleep starts day two while preserving memories',()=>{
 let s=transition(createInitialState(),'mom');s=transition(s,'sleep');
 assert.equal(s.day,2);assert.equal(s.minute,450);assert.ok(s.journal.some(e=>e.id==='mom'));
});
