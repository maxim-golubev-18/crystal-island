import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
export const defaultLook={skin:'#efbc91',hair:'#694438',top:'#e8ae46',pants:'#42637c',shoes:'#eae9dc',bag:'#62a99b',style:'short',backpack:true};
export function cleanLook(value={}){const result={...defaultLook};for(const key of ['skin','hair','top','pants','shoes','bag'])if(/^#[0-9a-f]{6}$/i.test(value?.[key]))result[key]=value[key];if(['short','curls','bun'].includes(value?.style))result.style=value.style;if(typeof value?.backpack==='boolean')result.backpack=value.backpack;return result;}
export function createAvatar(look=defaultLook){
 const avatar=new T.Group();avatar.name='Player';const materials={};for(const [key,color] of Object.entries(defaultLook))if(typeof color==='string'&&color.startsWith('#'))materials[key]=new T.MeshStandardMaterial({color,roughness:.82});
 const ivory=new T.MeshStandardMaterial({color:0xfff6de}),ink=new T.MeshStandardMaterial({color:0x25323a}),rose=new T.MeshStandardMaterial({color:0xd78378});
 function mesh(geo,mat,x,y,z,parent=avatar){const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 function rounded(w,h,d,mat,x,y,z,parent=avatar,r=.06){return mesh(new RoundedBoxGeometry(w,h,d,2,r),mat,x,y,z,parent)}
 function sphere(r,mat,x,y,z,parent=avatar){return mesh(new T.SphereGeometry(r,16,12),mat,x,y,z,parent)}
 rounded(.67,.72,.43,materials.top,0,1.02,0);rounded(.4,.24,.045,materials.top,0,.91,.235);rounded(.08,.38,.035,ivory,0,1.15,.225);sphere(.035,ink,0,1.16,.25);rounded(.35,.15,.37,materials.top,0,1.38,-.045);
 const legs=[],arms=[];
 for(const side of [-1,1]){
  const leg=new T.Group();leg.position.set(side*.19,.7,0);avatar.add(leg);legs.push(leg);
  rounded(.26,.49,.29,materials.pants,0,-.23,0,leg);rounded(.3,.18,.45,materials.shoes,0,-.55,.075,leg);rounded(.31,.07,.46,ivory,0,-.62,.075,leg,.02);
  for(let i=0;i<2;i++)rounded(.18,.018,.025,ivory,0,-.455,.16+i*.065,leg,.005);
  const arm=new T.Group();arm.position.set(side*.43,1.26,0);avatar.add(arm);arms.push(arm);
  rounded(.24,.46,.27,materials.top,0,-.16,0,arm);rounded(.24,.075,.28,ivory,0,-.38,0,arm,.025);sphere(.12,materials.skin,0,-.49,.015,arm);
 }
 sphere(.115,materials.skin,0,1.42,0);const head=rounded(.63,.6,.54,materials.skin,0,1.75,.015,avatar,.15);
 for(const side of [-1,1]){sphere(.09,materials.skin,side*.325,1.73,.015);const eye=sphere(.047,ink,side*.13,1.8,.283);eye.scale.y=1.22;sphere(.014,ivory,side*.13-.009,1.818,.321);rounded(.105,.025,.025,materials.hair,side*.135,1.913,.283,avatar,.008);const cheek=sphere(.046,rose,side*.207,1.69,.28);cheek.scale.set(1,.45,.2);}
 sphere(.045,materials.skin,0,1.72,.309);
 const smile=new T.CatmullRomCurve3([new T.Vector3(-.075,1.639,.287),new T.Vector3(0,1.615,.301),new T.Vector3(.075,1.639,.287)]);mesh(new T.TubeGeometry(smile,10,.012,6,false),ink,0,0,0);
 const hairGroups={};for(const style of ['short','curls','bun']){const g=new T.Group();g.name=style;avatar.add(g);hairGroups[style]=g;const cap=mesh(new T.SphereGeometry(.34,18,12,0,Math.PI*2,0,Math.PI*.53),materials.hair,0,1.91,.01,g);cap.scale.set(1,.66,.88);}
 for(let i=0;i<4;i++){const lock=sphere(.12,materials.hair,-.22+i*.14,1.99-i*.025,.21,hairGroups.short);lock.scale.set(1.05,.66,.85);}
 for(let i=0;i<14;i++){const a=i*2.4,r=i<9?.28:.13;sphere(.115,materials.hair,Math.cos(a)*r,2.01+(i<9?0:.1),Math.sin(a)*r,hairGroups.curls);}
 sphere(.22,materials.hair,0,2.22,-.095,hairGroups.bun);const tie=mesh(new T.TorusGeometry(.145,.03,8,20),materials.top,0,2.13,-.07,hairGroups.bun);tie.rotation.x=Math.PI/2;
 const backpack=new T.Group();backpack.name='Backpack';avatar.add(backpack);rounded(.55,.6,.25,materials.bag,0,1.04,-.33,backpack);rounded(.4,.24,.1,materials.bag,0,.91,-.49,backpack);rounded(.21,.09,.035,ivory,0,1.14,-.475,backpack);for(const side of [-1,1])rounded(.07,.59,.06,materials.bag,side*.245,1.05,.23,backpack,.02);
 function apply(value){const clean=cleanLook(value);for(const key of Object.keys(materials))materials[key].color.set(clean[key]);for(const [key,g] of Object.entries(hairGroups))g.visible=key===clean.style;backpack.visible=clean.backpack;avatar.userData.look=clean;}
 apply(look);return {avatar,legs,arms,apply};
}
export function setupWardrobe({root,player,keys,controls}){
 let saved;try{saved=JSON.parse(localStorage.getItem('crystal-island-look'))}catch{}let look=cleanLook(saved);player.apply(look);
 const preview=createAvatar(look);const scene=new T.Scene();scene.background=new T.Color(0xd2e4df);scene.add(preview.avatar,new T.HemisphereLight(0xffffff,0x73827c,2.6));const light=new T.DirectionalLight(0xffedda,3);light.position.set(-3,5,4);scene.add(light);
 const pedestal=new T.Mesh(new T.CylinderGeometry(.8,.9,.13,48),new T.MeshStandardMaterial({color:0x91b6ad}));pedestal.position.y=-.08;scene.add(pedestal);
 const camera=new T.PerspectiveCamera(32,1,.1,30);camera.position.set(0,1.65,5);camera.lookAt(0,1.12,0);
 const renderer=new T.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));
 const dialog=document.createElement('dialog');dialog.id='wardrobe';dialog.setAttribute('aria-labelledby','wardrobe-title');dialog.innerHTML=`<div class="wardrobe-heading"><div><span class="eyebrow">ТВОЙ СТИЛЬ</span><h2 id="wardrobe-title">Знакомься, это ты!</h2></div><button id="close-wardrobe" aria-label="Закрыть выбор внешности">✕</button></div><div class="wardrobe-body"><div class="avatar-preview"><div id="avatar-canvas"></div><label class="turn-avatar">Повернуть <input id="avatar-turn" type="range" min="-180" max="180" value="-15" aria-label="Повернуть персонажа"></label></div><div class="look-fields"><label>Причёска<select id="hair-style"><option value="short">Чёлка</option><option value="curls">Кудряшки</option><option value="bun">Пучок</option></select></label><div class="look-colors"></div><label class="bag-option"><input id="backpack" type="checkbox"> Рюкзачок для прогулок</label><button id="finish-look">Мне нравится!</button><p class="look-note">Внешность сохранится в этом браузере.</p></div></div>`;root.append(dialog);dialog.querySelector('#avatar-canvas').append(renderer.domElement);
 for(const [key,label] of Object.entries({skin:'Кожа',hair:'Волосы',top:'Кофта',pants:'Брюки',shoes:'Кроссовки',bag:'Рюкзак'})){const field=document.createElement('label');field.className='color-field';field.innerHTML=`<span>${label}</span><input type="color" id="look-${key}" aria-label="${label}" value="${look[key]}">`;field.querySelector('input').oninput=e=>{look[key]=e.target.value;apply()};dialog.querySelector('.look-colors').append(field);}
 function apply(){player.apply(look);preview.apply(look);try{localStorage.setItem('crystal-island-look',JSON.stringify(look))}catch{dialog.querySelector('.look-note').textContent='Внешность действует до закрытия игры.'}}
 dialog.querySelector('#hair-style').value=look.style;dialog.querySelector('#hair-style').onchange=e=>{look.style=e.target.value;apply()};dialog.querySelector('#backpack').checked=look.backpack;dialog.querySelector('#backpack').onchange=e=>{look.backpack=e.target.checked;apply()};
 const button=document.createElement('button');button.id='customize-avatar';button.textContent='☺ Персонаж';document.querySelector('.tools').append(button);
 button.onclick=()=>{keys.clear();dialog.showModal();controls.enabled=false;resize()};function close(){dialog.close();keys.clear();controls.enabled=true}dialog.querySelector('#finish-look').onclick=close;dialog.querySelector('#close-wardrobe').onclick=close;dialog.addEventListener('cancel',()=>{keys.clear();controls.enabled=true});
 function resize(){if(!dialog.open)return;const box=dialog.querySelector('#avatar-canvas').getBoundingClientRect();renderer.setSize(box.width,box.height);camera.aspect=box.width/box.height;camera.updateProjectionMatrix()}
 addEventListener('resize',resize);
 return {get open(){return dialog.open},update(){if(!dialog.open)return;preview.avatar.rotation.y=Number(dialog.querySelector('#avatar-turn').value)*Math.PI/180;renderer.render(scene,camera)}};
}
