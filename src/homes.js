import {cleanRoom} from './room-settings.js';
import * as T from 'three';
import {houses} from './layout.js';
import {homeStyles,canWalkInside} from './home-data.js';
export function setupHomes({scene,avatar,camera,controls,keys,root}){
 let stored={};try{const parsed=JSON.parse(localStorage.getItem('crystal-island-rooms'));if(parsed&&typeof parsed==='object')stored=parsed}catch{}
 const roomSettings=homeStyles.map((_,i)=>cleanRoom(stored[i],i));
 const decorate=document.createElement('button');decorate.id='decorate-home';decorate.textContent='✿ Обустроить дом';decorate.hidden=true;document.querySelector('.tools').append(decorate);
 const editor=document.createElement('dialog');editor.id='room-editor';editor.setAttribute('aria-labelledby','room-title');editor.innerHTML=`<span class="eyebrow">МОЙ УЮТНЫЙ УГОЛОК</span><h2 id="room-title">Обустроим домик</h2><p>Выбирай, как тебе нравится. Всё сразу появляется в комнате.</p><label>Где будет кровать?<select id="bed-position"><option value="left">Слева</option><option value="right">Справа</option></select></label><label>Цветы<select id="room-flowers"><option value="0">Без цветов</option><option value="1">Букет на столике</option><option value="2">Букет и цветы у окна</option><option value="3">Целый цветочный уголок</option></select></label><label>Баночки мёда<select id="room-honey"><option value="0">Без баночек</option><option value="1">Одна баночка</option><option value="2">Две баночки</option><option value="3">Три баночки</option></select></label><p id="room-save-note">Сохраняется для этого домика в твоём браузере.</p><button id="room-done">Красиво, оставляем!</button>`;root.append(editor);
 function disposeRoom(old){const geometry=new Set(),materials=new Set();old.traverse(o=>{if(o.geometry)geometry.add(o.geometry);if(o.material)materials.add(o.material)});geometry.forEach(g=>g.dispose());materials.forEach(m=>m.dispose())}
 function rebuild(){const old=room;old.remove(avatar);room=makeRoom(visiting);room.add(avatar);avatar.position.set(0,.2,3.7);disposeRoom(old)}
 function saveRoom(){roomSettings[visiting]=cleanRoom({...roomSettings[visiting],bed:editor.querySelector('#bed-position').value,flowers:Number(editor.querySelector('#room-flowers').value),honey:Number(editor.querySelector('#room-honey').value)},visiting);try{localStorage.setItem('crystal-island-rooms',JSON.stringify(roomSettings))}catch{editor.querySelector('#room-save-note').textContent='Изменения останутся до закрытия игры.'}rebuild()}
 for(const input of editor.querySelectorAll('select'))input.onchange=saveRoom;
 decorate.onclick=()=>{if(!inside||visiting!==chosen)return;keys.clear();const settings=roomSettings[visiting];editor.querySelector('#bed-position').value=settings.bed;editor.querySelector('#room-flowers').value=settings.flowers;editor.querySelector('#room-honey').value=settings.honey;editor.showModal();focus(0,0,true);controls.enabled=false};
 function finishDecor(){editor.close();keys.clear();controls.enabled=true}editor.querySelector('#room-done').onclick=finishDecor;editor.addEventListener('cancel',()=>{keys.clear();controls.enabled=true});
 let chosen=null,inside=false,visiting=null,room=null;const originalScene=scene;
 const dialog=document.createElement('dialog');dialog.id='house-picker';dialog.setAttribute('aria-labelledby','picker-title');dialog.innerHTML=`<div class="picker-intro"><span class="eyebrow">НОВАЯ ИСТОРИЯ</span><h2 id="picker-title">Какой домик твой?</h2><p>Выбери уютный уголок на острове. Внутри уже всё готово для тебя.</p></div><div class="house-options"></div><button id="settle">Поселиться здесь</button><button id="cancel-house" hidden>Остаться в своём доме</button>`;root.append(dialog);
 const options=dialog.querySelector('.house-options');let preview=0;
 homeStyles.forEach((h,i)=>{const b=document.createElement('button');b.className='house-option';b.innerHTML=`<span class="house-swatch" style="background:#${h.color.toString(16)}">${['☀','❧','❀','✦','☀','❧','✿'][i]}</span><span><strong>${h.name}</strong><small>${h.detail}</small></span>`;b.onclick=()=>{preview=i;showPreview();};options.append(b)});
 const action=document.createElement('button');action.id='house-action';action.hidden=true;root.append(action);
 const switcher=document.createElement('button');switcher.id='change-house';switcher.textContent='⌂ Выбрать дом';document.querySelector('.tools').append(switcher);
 const badge=document.createElement('div');badge.id='my-house';root.append(badge);
 function focus(x,z,interior=false){controls.target.set(x,interior?0.4:1,z);camera.fov=innerWidth<700?55:40;camera.position.set(x+(interior?12:17),interior?15:19,z+(interior?17:22));if(interior&&innerWidth<700)camera.position.sub(controls.target).multiplyScalar(1.4).add(controls.target);camera.updateProjectionMatrix();controls.minDistance=interior?12:10;controls.maxDistance=interior?38:290;controls.update()}
 function showPreview(){[...options.children].forEach((b,i)=>b.setAttribute('aria-pressed',String(i===preview)));const h=houses[preview];focus(h.x,h.z);}
 function openPicker(){keys.clear();dialog.showModal();controls.enabled=false;preview=chosen??0;dialog.querySelector('#cancel-house').hidden=chosen===null;showPreview()}
 function closePicker(){dialog.close();controls.enabled=true;keys.clear()}
 dialog.addEventListener('cancel',e=>{if(chosen===null)e.preventDefault();else{controls.enabled=true;keys.clear()}});
 dialog.querySelector('#cancel-house').onclick=()=>{closePicker();const h=houses[chosen];focus(h.x,h.z)};
 dialog.querySelector('#settle').onclick=()=>{chosen=preview;const h=houses[chosen];avatar.position.set(h.x,.86,h.z+4);avatar.rotation.y=0;avatar.visible=true;badge.textContent=`Твой дом · ${homeStyles[chosen].name}`;closePicker();focus(h.x,h.z+3);};switcher.onclick=openPicker;
 function makeRoom(index){
  const settings=roomSettings[index];
  const h=homeStyles[index],s=new T.Scene();s.background=new T.Color(0x315966);s.add(new T.HemisphereLight(0xfff4df,0x8ba7ae,2.6));const light=new T.DirectionalLight(0xffedd2,3);light.position.set(3,10,6);s.add(light);
  const material=c=>new T.MeshStandardMaterial({color:c,roughness:.85});const timber=material(0xaf805c),cream=material(0xffedcf),accent=material(h.color),white=material(0xfff7e9),dark=material(0x654d41),green=material(0x67a97d);
  function box(w,height,d,m,x,y,z){const o=new T.Mesh(new T.BoxGeometry(w,height,d),m);o.position.set(x,y,z);o.receiveShadow=true;s.add(o);return o}
  function ball(r,m,x,y,z){const o=new T.Mesh(new T.IcosahedronGeometry(r,1),m);o.position.set(x,y,z);s.add(o);return o}
  for(let i=0;i<16;i++)box(.74,.18,10,material(i%2?0xd9b990:0xe2c39b),-5.625+i*.75,0,0);
  box(12,.25,.22,timber,0,.15,5);box(.22,3.8,10,cream,-6,1.9,0);box(12,3.8,.22,cream,0,1.9,-5);box(.22,.75,10,cream,6,.375,0);
  const furnitureStart=s.children.length;
  // Window with framing and curtains above the desk.
  box(2.8,1.9,.12,material(0x9bdce4),3.5,2.25,-4.84);for(const x of [2,3.5,5])box(.12,2.1,.22,white,x,2.25,-4.7);box(3.2,.13,.22,white,3.5,2.25,-4.7);for(const x of [1.9,5.1])box(.4,2.35,.3,accent,x,2.2,-4.58);
  // Soft bed, headboard, quilt, pillow.
  box(2.7,.5,4.1,timber,-3.7,.4,-2.4);box(2.6,.4,4,white,-3.7,.85,-2.4);box(2.8,1.5,.2,timber,-3.7,.9,-4.45);box(2.62,.15,2.7,accent,-3.7,1.13,-1.8);box(1.9,.25,.8,white,-3.7,1.15,-3.8);
  box(4,.035,4.3,accent,-.3,.13,.8);for(const z of [-1.15,2.75])box(3.7,.02,.12,white,-.3,.155,z);
  // Reading sofa and little table.
  box(2.6,.65,2.1,accent,3.65,.6,1);box(.35,1.4,2.1,accent,4.78,.95,1);box(2.6,1.35,.25,accent,3.65,.95,.05);box(.7,.25,.65,white,3.45,1.04,.6);
  box(1.6,.18,1.3,timber,2.35,.95,3.25);for(const x of [1.75,2.95])for(const z of [2.8,3.7])box(.12,.8,.12,dark,x,.45,z);box(.55,.08,.65,accent,2.2,1.08,3.25);
  // Writing desk, stool, open book and lamp.
  box(3.1,.18,1.5,timber,3.7,1.5,-3.25);for(const x of [2.35,5.05])for(const z of [-3.8,-2.7])box(.13,1.4,.13,dark,x,.7,z);box(.85,.85,.8,accent,3.6,.55,-2.2);box(.85,.05,.65,white,3.5,1.63,-3.15);box(.09,.65,.09,dark,4.7,1.85,-3.4);const shade=new T.Mesh(new T.ConeGeometry(.4,.55,12),accent);shade.position.set(4.7,2.3,-3.4);s.add(shade);
  // Bookshelf, plants and framed decoration.
  box(2.1,2.5,.7,timber,.3,1.35,-4.25);for(const y of [.65,1.4,2.15]){box(1.9,.12,.78,cream,.3,y,-4.2);for(let i=0;i<6;i++)box(.19,.42+(i%2)*.15,.42,material([h.color,0x8bbaa4,0xd4a06c][i%3]),-.48+i*.29,y+.3,-3.78)}
  box(1,.7,1,timber,-4.5,.45,3.3);for(let i=0;i<5;i++)ball(.43,green,-4.5+Math.sin(i*2)*.4,1.4+(i%2)*.45,3.3+Math.cos(i*2)*.35);
  // Small joinery, rug weaving, cushions and warm bedside light.
  for(const y of [.3,.5])box(2.73,.025,4.12,dark,-3.7,y,-2.4);
  for(let i=0;i<7;i++)box(.035,.02,2.6,white,-4.78+i*.36,1.22,-1.8);
  for(let i=0;i<13;i++){box(.035,.015,3.9,white,-2.1+i*.3,.16,.8);for(const z of [-1.48,3.08])box(.06,.02,.25,white,-2.1+i*.3,.15,z);}
  const pillow=box(.65,.3,.65,white,4.1,1.13,1.25);pillow.rotation.y=.3;
  box(.65,.8,.65,timber,-1.7,.5,-3.8);box(.68,.08,.68,dark,-1.7,.94,-3.8);box(.08,.55,.08,dark,-1.7,1.2,-3.8);const bedside=new T.Mesh(new T.ConeGeometry(.35,.45,12),white);bedside.position.set(-1.7,1.65,-3.8);s.add(bedside);
  for(let i=0;i<3;i++){box(.45,.07,.6,material([h.color,0x85aba0,0xd4a06c][i]),2.2,1.14+i*.08,3.25);}
  for(const x of [2.15,4.85]){box(.09,.15,.09,dark,x,2.24,-4.55);}
  // Move the furnishings together so that the central walking route stays clear.
  if(settings.bed==='right')for(const item of s.children.slice(furnitureStart)){item.position.x*=-1;item.scale.x*=-1;}
  const mirror=settings.bed==='right'?-1:1;
  function flowerPot(x,y,z){
   const group=new T.Group();group.name='FlowerPot';s.add(group);
   function part(geometry,mat,px,py,pz){const item=new T.Mesh(geometry,mat);item.position.set(px,py,pz);group.add(item);return item}
   part(new T.CylinderGeometry(.24,.18,.36,12),accent,x,y+.18,z);
   for(let i=0;i<5;i++){const a=i*2.4,px=x+Math.cos(a)*.17,pz=z+Math.sin(a)*.17,top=y+.73+(i%2)*.12;part(new T.CylinderGeometry(.025,.025,.5,5),green,px,top-.25,pz);for(let j=0;j<5;j++){const b=j*1.256;part(new T.SphereGeometry(.08,8,6),material(index===0?0xffce55:0xeaa5c5),px+Math.cos(b)*.1,top,pz+Math.sin(b)*.1)}part(new T.SphereGeometry(.055,8,6),white,px,top+.035,pz);}
  }
  if(settings.flowers>=1)flowerPot(2.8*mirror,1.05,3.35);
  if(settings.flowers>=2)flowerPot(2.5*mirror,1.61,-3.45);
  if(settings.flowers>=3)flowerPot(-4.5*mirror,2.1,3.3);
  for(let i=0;i<settings.honey;i++){
   const jar=new T.Group();jar.name='HoneyJar';jar.position.set((-.4+i*.65)*mirror,2.65,-4.12);s.add(jar);
   const body=new T.Mesh(new T.CylinderGeometry(.22,.21,.4,16),material(0xe9a827));body.position.y=.2;jar.add(body);
   const lid=new T.Mesh(new T.CylinderGeometry(.24,.24,.09,16),material(0xb87937));lid.position.y=.445;jar.add(lid);
   const label=new T.Mesh(new T.BoxGeometry(.27,.17,.035),white);label.position.set(0,.23,.21);jar.add(label);
   const mark=new T.Mesh(new T.SphereGeometry(.055,8,6),material(0xc18722));mark.position.set(0,.23,.238);mark.scale.z=.3;jar.add(mark);
   for(const x of [-.043,.043]){const wing=new T.Mesh(new T.SphereGeometry(.035,8,6),white);wing.position.set(x,.27,.245);wing.scale.y=.6;jar.add(wing);}
   const stripe=new T.Mesh(new T.BoxGeometry(.022,.08,.01),dark);stripe.position.set(0,.23,.258);jar.add(stripe);
  }
  s.userData.settings={...settings};
  box(.12,1.5,1.7,timber,-5.8,2.5,.6);box(.13,1.25,1.45,accent,-5.7,2.5,.6);ball(.35,white,-5.55,2.5,.6);
  const gem=new T.Mesh(new T.OctahedronGeometry(.32),material(h.color));gem.scale.y=1.5;gem.position.set(4*mirror,2,-3.4);s.add(gem);
  if(settings.shelf){const shelf=box(.8,.16,2.3,timber,-5.45,2.3,-1.5);shelf.name='PurchasedShelf';for(let i=0;i<4;i++)box(.4,.42,.19,material([h.color,0x8baa76,0xd3a673][i%3]),-5.4,2.59,-2.2+i*.4);for(const z of [-2.35,-.65])box(.55,.35,.12,dark,-5.6,2.08,z);}
  const shell=new T.Group();shell.name='FirstPersonShell';shell.visible=false;s.add(shell);
  function shellBox(w,h,d,m,x,y,z){const item=box(w,h,d,m,x,y,z);shell.attach(item);}
  shellBox(.22,3.8,10,cream,6,1.9,0);shellBox(12,3.8,.22,cream,0,1.9,5);shellBox(12,.18,10,white,0,3.9,0);shellBox(1.8,2.9,.12,timber,0,1.45,4.83);shellBox(.12,.12,.12,dark,.6,1.45,4.7);
  for(const z of [-3,0,3])shellBox(12,.18,.16,timber,0,3.73,z);
  box(1.9,.035,.8,dark,0,.14,4.35);return s;
 }
 function exit(){if(!inside)return;originalScene.add(avatar);const h=houses[visiting];avatar.position.set(h.x,.86,h.z+3.5);inside=false;disposeRoom(room);room=null;switcher.hidden=false;decorate.hidden=true;focus(h.x,h.z+3);}
 function enter(index){keys.clear();visiting=index;room=makeRoom(index);room.add(avatar);avatar.position.set(0,.2,3.7);avatar.rotation.y=Math.PI;inside=true;switcher.hidden=true;decorate.hidden=visiting!==chosen;focus(0,0,true);}
 function nearby(){return houses.findIndex(h=>Math.hypot(avatar.position.x-h.x,avatar.position.z-(h.z+3.2))<3.2)}
 function interact(){if(document.querySelector("dialog[open]")||chosen===null)return;if(inside)exit();else{const i=nearby();if(i>=0)enter(i)}}action.onclick=interact;
 addEventListener('keydown',e=>{if(e.code==='KeyE'&&!e.repeat){e.preventDefault();interact()}});
 avatar.visible=false;openPicker();
 return {get isOwnRoom(){return inside&&visiting===chosen},get chosen(){return chosen},hasShelf(){return chosen!==null&&roomSettings[chosen].shelf},addShelf(){if(chosen===null||roomSettings[chosen].shelf)return false;roomSettings[chosen].shelf=true;try{localStorage.setItem('crystal-island-rooms',JSON.stringify(roomSettings))}catch{}if(inside&&visiting===chosen)rebuild();return true;},get scene(){return room||originalScene},get inside(){return inside},get blocked(){return dialog.open||editor.open||chosen===null},canWalk(x,z){return canWalkInside(roomSettings[visiting]?.bed==='right'?-x:x,z)},
  overview(){if(inside){focus(0,0,true);return true}return false},
  update(){const available=!dialog.open&&chosen!==null&&(inside||nearby()>=0);action.hidden=!available;action.textContent=inside?'Выйти гулять · E':'Войти в домик · E';if(inside)document.querySelector('#place').textContent=`${homeStyles[visiting].name} домик`;},
 };
}
