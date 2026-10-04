import {test} from 'node:test';import assert from 'node:assert/strict';import {canWalk,locationName,RADIUS} from './src/world.js';
test('берег удерживает игрока на острове',()=>{assert.equal(canWalk(0,0),true);assert.equal(canWalk(RADIUS,0),false)});test('через пруд можно пройти по мосту',()=>{assert.equal(canWalk(10,4),false);assert.equal(canWalk(10,6),true)});test('дом нельзя пройти насквозь',()=>assert.equal(canWalk(-10,-9),false));test('места имеют названия',()=>assert.equal(locationName(10,6),'Пруд светлячков'));

test("новая территория доступна, площадь увеличена в пять раз",()=>{assert.ok(Math.abs(RADIUS**2/23**2-5)<1e-10);assert.equal(canWalk(40,0),true);assert.equal(canWalk(0,-40),true);assert.equal(canWalk(40,40),false)});
