import {setupCareer} from './career.js';
import {setupJobs} from './jobs.js';
import {setupLife} from './life.js';
import {setupCameraView} from './camera-view.js';
import {createAvatar,setupWardrobe} from './avatar.js';
import {setupHomes} from './homes.js';
import {ponds,houses,groves,trails,reserved,walkHeight} from './layout.js';
import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import './style.css';
import {canWalk,locationName,MAP_SCALE,RADIUS,swimmingPond} from './world.js';
const root=document.querySelector('#game');
const renderer=new T.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.setClearColor(0x91d4da);renderer.outputColorSpace=T.SRGBColorSpace;root.prepend(renderer.domElement);
const scene=new T.Scene();scene.fog=new T.Fog(0x91d4da,180,380);
const camera=new T.PerspectiveCamera(40,innerWidth/innerHeight,.1,520);camera.position.set(40,40,48);
const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,0,0);controls.enableDamping=true;controls.minDistance=22;controls.maxDistance=290;controls.maxPolarAngle=Math.PI/2.35;controls.minPolarAngle=.2;controls.enablePan=false;
const ambient=new T.HemisphereLight(0xe7ffff,0x567a65,2.3);scene.add(ambient);const sun=new T.DirectionalLight(0xffefd4,3);sun.position.set(-55,90,35);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-65,right:65,top:65,bottom:-65,far:220});sun.shadow.bias=-.0006;scene.add(sun);
const mat=(c,extra={})=>new T.MeshStandardMaterial({color:c,roughness:.85,...extra});const grass=mat(0x80bf62),sand=mat(0xf3d39a),rock=mat(0x799f9d),wood=mat(0x86553b),leaf=[mat(0x348b65),mat(0x52a371),mat(0x76b775)];
function mesh(g,m,x=0,y=0,z=0,parent=scene){const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
function box(w,h,d,m,x,y,z,p){return mesh(new T.BoxGeometry(w,h,d),m,x,y,z,p)}
function cyl(a,b,h,m,x,y,z,n=48,p){return mesh(new T.CylinderGeometry(a,b,h,n),m,x,y,z,p)}
const ocean=mesh(new T.PlaneGeometry(1000,1000),mat(0x55b4c8,{roughness:.32,metalness:.12}),0,-1.9,0);ocean.rotation.x=-Math.PI/2;ocean.castShadow=false;
cyl(23.6*MAP_SCALE,21*MAP_SCALE,2.6,rock,0,-1,0,80);cyl(23.8*MAP_SCALE,23.5*MAP_SCALE,.7,sand,0,.05,0,80);cyl(22.6*MAP_SCALE,23.3*MAP_SCALE,.65,grass,0,.48,0,80);
const pathMat=mat(0xefdcaa);cyl(5.2,5.2,.09,pathMat,0,.85,0,48);box(3,.08,86,pathMat,-1,.84,2);box(90,.08,2.7,pathMat,0,.85,6);box(12,.08,2.8,pathMat,-5,.85,-8);
const pond=cyl(6.3,6.3,.12,mat(0x49adba,{metalness:.25,roughness:.16}),10,.87,6,50);pond.scale.z=.79;
for(let i=0;i<28;i++){let a=i/28*Math.PI*2;const r=mesh(new T.DodecahedronGeometry(.48+(i%3)*.15),rock,10+6.5*Math.cos(a),.95,6+5.2*Math.sin(a));r.scale.y=.65;}
for(let i=0;i<17;i++)box(.6,.23,2.6,mat(i%2?0xc99965:0xb58254),4.6+i*.66,1.25,6);
for(const z of [4.65,7.35]){box(11.4,.14,.16,wood,10,2.1,z);for(let i=0;i<5;i++)box(.18,1.5,.18,wood,4.8+i*2.6,1.6,z)}
const crystalMat=mat(0x65f5e6,{emissive:0x22bbaa,emissiveIntensity:.45,metalness:.3,roughness:.18});
cyl(2.8,3.2,.45,rock,0,1,0,8);cyl(2.2,2.6,.35,mat(0xd9efca),0,1.38,0,8);const crystal=mesh(new T.OctahedronGeometry(1.6,0),crystalMat,0,3.5,0);crystal.scale.y=1.6;
for(let i=0;i<5;i++){let a=i*1.256;let c=mesh(new T.OctahedronGeometry(.55),crystalMat,Math.sin(a)*1.9,1.9,Math.cos(a)*1.9);c.scale.y=1.8;c.rotation.z=.3*Math.sin(a)}
function tree(x,z,s=1,pine=false){if(x>-18&&x<-6&&z>-4&&z<5||x>-15&&x<-3&&z>6&&z<14||x>2&&x<14&&z>-12&&z<-4)return;cyl(.19*s,.28*s,2.1*s,wood,x,1.7*s,z,7);if(pine){for(let j=0;j<3;j++)mesh(new T.ConeGeometry((1.8-j*.35)*s,2.3*s,7),leaf[j],x,(2.7+j*.9)*s,z)}else{const o=mesh(new T.IcosahedronGeometry(1.8*s,1),leaf[Math.abs(Math.floor(x))%3],x,3.6*s,z);o.scale.set(1,1.05,.95);mesh(new T.IcosahedronGeometry(1.2*s,0),leaf[2],x+.9*s,3*s,z+.3*s)}}
let seed=47;function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}
for(let i=0;i<53;i++){const a=rand()*Math.PI*2,r=16+rand()*5,x=Math.cos(a)*r,z=Math.sin(a)*r;if(reserved(x,z)||Math.abs(x+1)<2.5||Math.abs(z-6)<2||x>9&&z>0&&z<12)continue;tree(x,z,.65+rand()*.55,z<0)}
// New outer forest: original landmarks keep their size and position.
const outerTrees=[];
for(let i=0;i<210;i++){
 const a=rand()*Math.PI*2,r=Math.sqrt(26**2+rand()*(47**2-26**2));
 const x=Math.cos(a)*r,z=Math.sin(a)*r;
 if(reserved(x,z)||Math.abs(x+1)<3.5||Math.abs(z-6)<3.5||outerTrees.some(t=>Math.hypot(t.x-x,t.z-z)<2.6))continue;
 outerTrees.push({x,z});tree(x,z,.8+rand()*.65,z<0);
}
const cream=mat(0xffe7b3);box(5,3.8,4.4,cream,-10,2.7,-9);const roof=mesh(new T.ConeGeometry(4.1,2.5,4),mat(0xc57655),-10,5.7,-9);roof.rotation.y=Math.PI/4;box(1.25,2.5,.12,wood,-10,2.05,-6.75);for(const x of [-11.6,-8.4]){box(.9,1,.12,mat(0x8fe4e0,{emissive:0x57c4c4,emissiveIntensity:.25}),x,3,-6.72);box(1.15,.15,.3,wood,x,2.45,-6.6)}box(.65,1.6,.65,mat(0xc19a78),-11.7,6,-9.5);
for(const [x,z] of [[-5,3],[3,-5],[-5,11],[16,6],[-15,-6]]){cyl(.1,.1,2.7,wood,x,2.1,z,8);box(.55,.65,.55,mat(0xffe5a0,{emissive:0xffcb64,emissiveIntensity:.7}),x,3.55,z);mesh(new T.ConeGeometry(.48,.4,4),wood,x,4.04,z);const l=new T.PointLight(0xffd684,0,8);l.position.set(x,3.5,z);scene.add(l)}
for(let i=0;i<650;i++){let x=(rand()-.5)*96,z=(rand()-.5)*96;if(reserved(x,z)||x*x+z*z>(RADIUS-3)**2||Math.abs(x+1)<2||Math.abs(z-6)<2||x*x+z*z<34||x>3&&z>0&&z<12||x>-14&&x<-6&&z>-13&&z<-5)continue;const flower=mat([0xffe88b,0xffb8b1,0xdfc2ff,0xffffff][i%4]);cyl(.035,.035,.35,leaf[0],x,1,z,4);mesh(new T.IcosahedronGeometry(.15,0),flower,x,1.22,z)}
for(let i=0;i<35;i++){let a=rand()*6.28;let x=Math.cos(a)*(RADIUS-3),z=Math.sin(a)*(RADIUS-3);mesh(new T.DodecahedronGeometry(.6+rand()*.6),rock,x,.9,z)}
buildVillage();
// Eaves, cottage foundations, doorstep stones and roof seams.
for(const h of houses){
 box(5.3,.3,4.7,rock,h.x,.88,h.z);
 for(const side of [-1,1]){box(.18,3.55,.18,wood,h.x+side*2.43,2.6,h.z+2.22);box(5.25,.16,.2,wood,h.x,4.3,h.z+side*2.25);}
 for(let row=0;row<4;row++){
  const t=(row+1)/5,width=5.6*(1-t),y=4.2+2.3*t;
  for(const side of [-1,1]){box(width,.045,.06,wood,h.x,y,h.z+side*width/2);box(.06,.045,width,wood,h.x+side*width/2,y,h.z);}
 }
 const knob=mesh(new T.SphereGeometry(.065,8,6),mat(0xeac56e),h.x+.38,2,h.z+2.35);
 for(let j=0;j<3;j++)box(.85,.08,.5,rock,h.x,.9,h.z+3+j*.7);
}

const player=createAvatar();const {avatar,legs,arms}=player;scene.add(avatar);avatar.position.set(-1,.86,4);
const ripples=[];for(let i=0;i<65;i++){let x=(rand()-.5)*130,z=(rand()-.5)*130;if(x*x+z*z<(RADIUS+3)**2)continue;const o=box(1+rand()*2,.012,.065,mat(0xb4e9e6,{transparent:true,opacity:.38}),x,-1.86,z);ripples.push(o)}
const motes=[];for(let i=0;i<24;i++){const o=mesh(new T.SphereGeometry(.045,4,4),mat(0xffefac,{emissive:0xffe89b,emissiveIntensity:2}),rand()*30-15,1+rand()*3,rand()*30-15);motes.push(o)}
const keys=new Set();addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();keys.add(e.code)});addEventListener('keyup',e=>keys.delete(e.code));addEventListener('blur',()=>keys.clear());document.querySelectorAll('[data-key]').forEach(b=>{b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(b.dataset.key)});for(const t of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(t,()=>keys.delete(b.dataset.key))});
const homeSystem=setupHomes({scene,avatar,camera,controls,keys,root});
const wardrobe=setupWardrobe({root,player,keys,controls});
const life=setupLife({scene,avatar,homeSystem,keys,root});
const jobs=setupJobs({scene,avatar,homeSystem,life,keys,root});
const cameraView=setupCameraView({camera,controls,avatar,canvas:renderer.domElement,homeSystem,wardrobe});
function setNight(night){document.querySelector('#day').textContent=night?'☾ Вечер':'☀ День';ambient.intensity=night?1:2.3;sun.intensity=night?.55:3;const c=night?0x325e83:0x91d4da;renderer.setClearColor(c);scene.fog.color.setHex(c);scene.traverse(o=>{if(o.isPointLight)o.intensity=night?8:0});crystalMat.emissiveIntensity=night?1.4:.45}
const career=setupCareer({root,scene,homeSystem,life,jobs,keys,setNight});jobs.onComplete=()=>career.markWorked();
function overview(){if(cameraView.first)cameraView.set(false);if(homeSystem.blocked||homeSystem.overview())return;camera.fov=innerWidth<700?55:40;camera.position.set(40,40,48).multiplyScalar(MAP_SCALE*(innerWidth<700?1.4:1));camera.updateProjectionMatrix();controls.target.set(0,0,0)}overview();document.querySelector('#home').onclick=overview;
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;overview();renderer.setSize(innerWidth,innerHeight)});
const swimRing=mesh(new T.RingGeometry(.5,.56,32),new T.MeshBasicMaterial({color:0xe4ffff,transparent:true,opacity:.6,side:T.DoubleSide}),0,1.1,0);swimRing.rotation.x=-Math.PI/2;swimRing.visible=false;
const clock=new T.Clock();let elapsed=0;const up=new T.Vector3(0,1,0),forward=new T.Vector3(),right=new T.Vector3();function frame(){requestAnimationFrame(frame);let dt=Math.min(clock.getDelta(),.04);elapsed+=dt;let dx=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0),dz=(keys.has('KeyW')||keys.has('ArrowUp')?1:0)-(keys.has('KeyS')||keys.has('ArrowDown')?1:0);if(!homeSystem.blocked&&!wardrobe.open&&!life.open&&!jobs.blocked&&!career.blocked&&(dx||dz)){camera.getWorldDirection(forward);forward.y=0;forward.normalize();right.crossVectors(forward,up);const move=forward.multiplyScalar(dz).add(right.multiplyScalar(dx)).normalize();const speed=!homeSystem.inside&&swimmingPond(avatar.position.x,avatar.position.z)?2.8:5;let nx=avatar.position.x+move.x*dt*speed,nz=avatar.position.z+move.z*dt*speed;if(homeSystem.inside?homeSystem.canWalk(nx,nz):canWalk(nx,nz)&&life.canWalk(nx,nz)&&jobs.canWalk(nx,nz)){if(camera.position.distanceTo(controls.target)<100){const shift=new T.Vector3(nx-avatar.position.x,0,nz-avatar.position.z);camera.position.add(shift);controls.target.add(shift);}avatar.position.x=nx;avatar.position.z=nz;}avatar.rotation.y=Math.atan2(move.x,move.z);legs.forEach((l,i)=>l.rotation.x=Math.sin(elapsed*12+i*Math.PI)*.5);document.querySelector('#place').textContent=locationName(avatar.position.x,avatar.position.z)}else legs.forEach(l=>l.rotation.x=0);const swimming=!homeSystem.inside&&!homeSystem.blocked&&swimmingPond(avatar.position.x,avatar.position.z);player.setSwimming(Boolean(swimming));avatar.position.y=homeSystem.inside?.2:swimming?.1+Math.sin(elapsed*3)*.055:walkHeight(avatar.position.x,avatar.position.z);arms.forEach((a,i)=>{a.rotation.z=swimming?(i?1:-1)*1.2:0;a.rotation.x=swimming?Math.sin(elapsed*5+i*Math.PI)*.4:(!homeSystem.blocked&&!wardrobe.open&&!life.open&&!jobs.blocked&&!career.blocked&&(dx||dz)?Math.sin(elapsed*12+i*Math.PI)*-.3:0)});if(swimming)document.querySelector("#place").textContent="Купаемся · тёплая вода 28 °C";crystal.rotation.y=elapsed*.3;crystal.position.y=3.5+Math.sin(elapsed*1.4)*.16;motes.forEach((o,i)=>{o.position.y+=Math.sin(elapsed+i)*.0018});ripples.forEach((o,i)=>o.scale.x=1+Math.sin(elapsed+i)*.15);swimRing.visible=Boolean(swimming);if(swimming){swimRing.position.set(avatar.position.x,1.1,avatar.position.z);swimRing.scale.setScalar(1+Math.sin(elapsed*4)*.13);}homeSystem.update();career.update();life.update(career.sleeping?0:dt);jobs.update(career.sleeping?0:dt);cameraView.update();renderer.render(homeSystem.scene,camera);wardrobe.update()}frame();document.querySelector('#loading').remove();window.__island={ready:true,avatar,scene,camera,controls,homeSystem,wardrobe,cameraView,life,jobs,career};

function buildVillage(){
 const trailMaterial=mat(0xe9ce99),planks=[mat(0xbb8a59),mat(0xd0a16d)],water=mat(0x53b8c9,{roughness:.22,metalness:.18});
 for(const points of trails){
  // Rounded joins keep the whole walking route continuous.
  for(let i=0;i<points.length;i++){
   const [x,z]=points[i];cyl(1.2,1.2,.045,trailMaterial,x,.885,z,12);
   if(!i)continue;const [ax,az]=points[i-1];const segment=box(2.4,.045,Math.hypot(x-ax,z-az),trailMaterial,(x+ax)/2,.885,(z+az)/2);segment.rotation.y=Math.atan2(x-ax,z-az);
  }
 }
 for(const p of ponds.filter(p=>!p.original)){
  const g=new T.Group();g.name='Pond';g.position.set(p.x,0,p.z);scene.add(g);
  const shore=cyl(p.rx+.65,p.rx+.65,.13,sand,0,.91,0,40,g);shore.scale.z=(p.rz+.65)/(p.rx+.65);
  const lake=cyl(p.rx,p.rx,.14,water,0,.99,0,40,g);lake.scale.z=p.rz/p.rx;
  for(let i=0;i<22;i++){const a=i/22*Math.PI*2;const x=(p.rx+.4)*Math.cos(a),z=(p.rz+.4)*Math.sin(a);if(p.axis==='x'?Math.abs(z)<1.8:Math.abs(x)<1.8)continue;const stone=mesh(new T.DodecahedronGeometry(.35+(i%3)*.13),rock,x,1.06,z,g);stone.scale.y=.65;}
  const bridge=new T.Group();bridge.name='Bridge';g.add(bridge);if(p.axis==='z')bridge.rotation.y=Math.PI/2;
  const length=2*((p.axis==='x'?p.rx:p.rz)+.9),count=Math.ceil(length/.58);
  for(let i=0;i<count;i++)box(length/count-.035,.22,2.7,planks[i%2],-length/2+(i+.5)*length/count,1.25,0,bridge);
  for(const z of [-1.35,1.35]){box(length,.15,.15,wood,0,2.1,z,bridge);for(let i=0;i<=4;i++)box(.16,1.35,.16,wood,-length/2+i*length/4,1.7,z,bridge);}
  for(let i=0;i<5;i++){const a=i*2.4;const lily=cyl(.35,.35,.035,leaf[1],Math.cos(a)*p.rx*.65,1.08,Math.sin(a)*p.rz*.65,9,g);if(p.axis==='x'?Math.abs(lily.position.z)<1.6:Math.abs(lily.position.x)<1.6)lily.visible=false;}
 }
 const windowMat=mat(0xffe8ac,{emissive:0xffd577,emissiveIntensity:.55});
 for(const h of houses.filter(h=>!h.original)){
  const g=new T.Group();g.name='Cottage';g.position.set(h.x,0,h.z);scene.add(g);
  box(5,3.5,4.4,mat(0xf6e1b9),0,2.6,0,g);const roof=mesh(new T.ConeGeometry(4,2.3,4),mat(h.color),0,5.35,0,g);roof.rotation.y=Math.PI/4;
  box(1.15,2.25,.13,wood,0,1.98,2.25,g);box(1.8,.2,1,planks[0],0,.95,2.7,g);
  for(const x of [-1.55,1.55]){box(.9,.95,.14,windowMat,x,2.9,2.26,g);box(.07,1,.18,wood,x,2.9,2.3,g);box(1,.08,.18,wood,x,2.9,2.3,g);box(1.1,.28,.45,wood,x,2.2,2.4,g);for(let i=0;i<3;i++)mesh(new T.IcosahedronGeometry(.17),mat(i%2?0xffb1c5:0xffdf83),x-.32+i*.32,2.43,2.42,g);}
  box(.65,1.5,.65,rock,-1.5,5.7,-.7,g);
 }
 for(const [i,g] of groves.entries()){
  const group=new T.Group();group.name='CrystalGrove';group.position.set(g.x,0,g.z);scene.add(group);cyl(2.6,2.8,.12,pathMat,0,.91,0,16,group);
  const material=mat(g.color,{emissive:g.color,emissiveIntensity:.5,metalness:.25,roughness:.2});
  for(let j=0;j<5;j++){const a=j*2.4;const gem=mesh(new T.OctahedronGeometry(j? .5:.95),material,j?Math.cos(a)*1.5:0,j?1.5:2.1,j?Math.sin(a)*1.5:0,group);gem.scale.y=1.7;gem.rotation.z=j?.2*Math.sin(a):0;}
 }
}
