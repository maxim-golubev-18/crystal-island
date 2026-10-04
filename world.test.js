import {test} from 'node:test';import assert from 'node:assert/strict';import {canWalk,locationName,RADIUS} from './src/world.js';
test('берег удерживает игрока на острове',()=>{assert.equal(canWalk(0,0),true);assert.equal(canWalk(RADIUS,0),false)});test('через пруд можно пройти по мосту',()=>{assert.equal(canWalk(10,4),false);assert.equal(canWalk(10,6),true)});test('дом нельзя пройти насквозь',()=>assert.equal(canWalk(-10,-9),false));test('места имеют названия',()=>assert.equal(locationName(10,6),'Пруд светлячков'));

test("новая территория доступна, площадь увеличена в пять раз",()=>{assert.ok(Math.abs(RADIUS**2/23**2-5)<1e-10);assert.equal(canWalk(40,0),true);assert.equal(canWalk(0,-40),true);assert.equal(canWalk(40,40),false)});

import {ponds,houses,trails,walkHeight} from './src/layout.js';
test('все лесные дорожки можно пройти от начала до конца',()=>{for(const path of trails)for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i];for(let n=0;n<=100;n++){const x=a[0]+(b[0]-a[0])*n/100,z=a[1]+(b[1]-a[1])*n/100;assert.ok(canWalk(x,z),`Дорожка перекрыта: ${x}, ${z}`);}}});
test('каждый мост проходим, вода рядом не проходима',()=>{for(const p of ponds){assert.ok(canWalk(p.x,p.z));assert.equal(walkHeight(p.x,p.z),1.38);assert.equal(canWalk(p.x+(p.axis==='z'?2:0),p.z+(p.axis==='x'?2:0)),false);}});
test('все домики имеют свободный подход к двери',()=>{for(const h of houses){assert.equal(canWalk(h.x,h.z),false);assert.ok(canWalk(h.x,h.z+3));}});
