import * as T from 'three';
import {houses} from './layout.js';
import {homeStyles,canWalkInside} from './home-data.js';
export function setupHomes({scene,avatar,camera,controls,keys,root}){
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
  const h=homeStyles[index],s=new T.Scene();s.background=new T.Color(0x315966);s.add(new T.HemisphereLight(0xfff4df,0x8ba7ae,2.6));const light=new T.DirectionalLight(0xffedd2,3);light.position.set(3,10,6);s.add(light);
  const material=c=>new T.MeshStandardMaterial({color:c,roughness:.85});const timber=material(0xaf805c),cream=material(0xffedcf),accent=material(h.color),white=material(0xfff7e9),dark=material(0x654d41),green=material(0x67a97d);
  function box(w,height,d,m,x,y,z){const o=new T.Mesh(new T.BoxGeometry(w,height,d),m);o.position.set(x,y,z);o.receiveShadow=true;s.add(o);return o}
  function ball(r,m,x,y,z){const o=new T.Mesh(new T.IcosahedronGeometry(r,1),m);o.position.set(x,y,z);s.add(o);return o}
  for(let i=0;i<16;i++)box(.74,.18,10,material(i%2?0xd9b990:0xe2c39b),-5.625+i*.75,0,0);
  box(12,.25,.22,timber,0,.15,5);box(.22,3.8,10,cream,-6,1.9,0);box(12,3.8,.22,cream,0,1.9,-5);box(.22,.75,10,cream,6,.375,0);
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
  box(.12,1.5,1.7,timber,-5.8,2.5,.6);box(.13,1.25,1.45,accent,-5.7,2.5,.6);ball(.35,white,-5.55,2.5,.6);
  const gem=new T.Mesh(new T.OctahedronGeometry(.32),material(h.color));gem.scale.y=1.5;gem.position.set(.3,2.95,-4.25);s.add(gem);
  box(1.9,.035,.8,dark,0,.14,4.35);return s;
 }
 function exit(){if(!inside)return;originalScene.add(avatar);const h=houses[visiting];avatar.position.set(h.x,.86,h.z+3.5);inside=false;const geometries=new Set(),materials=new Set();room.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)materials.add(o.material)});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());room=null;switcher.hidden=false;focus(h.x,h.z+3);}
 function enter(index){keys.clear();visiting=index;room=makeRoom(index);room.add(avatar);avatar.position.set(0,.2,3.7);avatar.rotation.y=Math.PI;inside=true;switcher.hidden=true;focus(0,0,true);}
 function nearby(){return houses.findIndex(h=>Math.hypot(avatar.position.x-h.x,avatar.position.z-(h.z+3.2))<3.2)}
 function interact(){if(dialog.open||chosen===null)return;if(inside)exit();else{const i=nearby();if(i>=0)enter(i)}}action.onclick=interact;
 addEventListener('keydown',e=>{if(e.code==='KeyE'&&!e.repeat){e.preventDefault();interact()}});
 avatar.visible=false;openPicker();
 return {get scene(){return room||originalScene},get inside(){return inside},get blocked(){return dialog.open||chosen===null},canWalk:canWalkInside,
  overview(){if(inside){focus(0,0,true);return true}return false},
  update(){const available=!dialog.open&&chosen!==null&&(inside||nearby()>=0);action.hidden=!available;action.textContent=inside?'Выйти гулять · E':'Войти в домик · E';if(inside)document.querySelector('#place').textContent=`${homeStyles[visiting].name} домик`;},
 };
}
