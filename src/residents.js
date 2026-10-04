import * as T from 'three';
import {canWalk,swimmingPond} from './world.js';
import {houses,walkHeight} from './layout.js';
import {worldTime} from './career-state.js';
export function setupResidents({scene,jobs,career,conversations,life,scenery,homeSystem}){
 const people=[{rig:jobs.mentor,home:[-12,2.5],meet:[-5,16],seat:[-6,20]}, {rig:career.boss,home:[-15,3],meet:[-7,16],seat:[-10,20]},...career.staff.map((worker,i)=>({rig:worker.model,worker,home:[worker.x,worker.z],meet:[-3+i*2,17],seat:[-2+i*4,20]}))];
 const wood=new T.MeshStandardMaterial({color:0xa77950}),metal=new T.MeshStandardMaterial({color:0x35544f});
 function box(w,h,d,m,x,y,z){const o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;scene.add(o);return o}
 for(const p of people){const [x,z]=p.seat;box(2,.18,.8,wood,x,1.3,z);box(2,.65,.13,wood,x,1.8,z+.42);for(const side of [-1,1])box(.14,.6,.7,metal,x+side*.75,1,z);}
 // Use short collision-checked routes so residents go around buildings and water.
 const pass=(x,z)=>canWalk(x,z)&&!swimmingPond(x,z)&&life.canWalk(x,z)&&jobs.canWalk(x,z)&&scenery.canWalk(x,z);
 const xmin=-50,xmax=50,zmin=-50,zmax=50,W=xmax-xmin+1,H=zmax-zmin+1;
 const grid=new Uint8Array(W*H);for(let z=zmin;z<=zmax;z++)for(let x=xmin;x<=xmax;x++)grid[(z-zmin)*W+x-xmin]=pass(x,z)?1:0;
 function clearLine(ax,az,bx,bz){const n=Math.max(1,Math.ceil(Math.hypot(bx-ax,bz-az)/.15));for(let i=1;i<=n;i++)if(!pass(ax+(bx-ax)*i/n,az+(bz-az)*i/n))return false;return true}
 function nearest(x,z){let best=-1,d=Infinity;for(let i=0;i<grid.length;i++)if(grid[i]){const gx=i%W+xmin,gz=Math.floor(i/W)+zmin,dd=(gx-x)**2+(gz-z)**2;if(dd<d&&clearLine(x,z,gx,gz)){d=dd;best=i}}return best}
 function route(from,to){const start=nearest(...from),end=nearest(...to);if(start<0||end<0)return [];const prev=new Int32Array(grid.length).fill(-1),queue=[start];prev[start]=start;for(let k=0;k<queue.length&&prev[end]===-1;k++){const i=queue[k],x=i%W,z=Math.floor(i/W);for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,nz=z+dz,n=nz*W+nx;if(nx<0||nx>=W||nz<0||nz>=H||!grid[n]||prev[n]!==-1||!clearLine(x+xmin,z+zmin,nx+xmin,nz+zmin))continue;prev[n]=i;queue.push(n)}}if(prev[end]===-1)return [];const path=[];for(let i=end;i!==start;i=prev[i])path.push([i%W+xmin,Math.floor(i/W)+zmin]);path.push([start%W+xmin,Math.floor(start/W)+zmin]);return path.reverse()}
 const messages=['Как прошла смена?','Пойдём к пруду?','Фонарики такие красивые!','Я сегодня пёк хлеб.','После работы отдохнём.'];
 function bubble(text){const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#fff3d5';ctx.beginPath();ctx.roundRect(0,0,512,128,25);ctx.fill();ctx.fillStyle='#244d57';ctx.font='bold 27px sans-serif';ctx.textAlign='center';ctx.fillText(text,256,74);const sprite=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(c),depthTest:false}));sprite.scale.set(3.9,.97,1);sprite.visible=false;scene.add(sprite);return sprite}
 people.forEach((p,i)=>{p.path=[];p.phase=-1;p.at=0;p.clock=0;p.bubble=bubble(messages[i]);p.mode='idle';p.sleepingAtHome=false;p.rig.avatar.userData.activity='idle'});
 let elapsed=0;
 function plan(p,phase){p.phase=phase;const target=phase===3?p.door:phase===0?p.meet:phase===1?p.seat:p.home;p.path=route([p.rig.avatar.position.x,p.rig.avatar.position.z],target);p.at=0;}
 return {people,update(dt){elapsed+=dt;const time=worldTime(career.state,Date.now()),daySeconds=(300000-time.left)/1000;const phase=time.night?3:daySeconds<100?2:daySeconds<175?0:daySeconds<235?1:2;const freeHomes=houses.filter((_,i)=>i!==homeSystem.chosen);
 people.forEach((p,i)=>{const model=p.rig.avatar;const house=freeHomes[i%freeHomes.length];const door=[house.x,house.z+3.5];if(!p.door||p.door[0]!==door[0]||p.door[1]!==door[1]){p.door=door;p.phase=-1;p.sleepingAtHome=false;model.visible=true;}p.bubble.visible=false;if(!time.night&&p.sleepingAtHome){p.sleepingAtHome=false;model.visible=true;p.phase=-1;}if(p.sleepingAtHome){model.userData.activity='sleeping-at-home';if(p.worker)p.worker.zzz.visible=false;return;}if(p.worker){p.worker.zzz.position.set(model.position.x,model.position.y+2.8,model.position.z)}
 if(p.worker?.sleeping&&!time.night){model.userData.activity='sleeping';return}if(time.night){model.rotation.z=0;if(p.worker)p.worker.zzz.visible=false;}
 if(conversations.speaker===model){p.rig.legs.forEach(l=>l.rotation.x=0);p.rig.arms.forEach(a=>a.rotation.x=0);model.position.y=.86;model.userData.activity='talking-to-player';return}
 const desiredPhase=p.worker?.assignment&&!time.night?2:phase;if(p.phase!==desiredPhase)plan(p,desiredPhase);
 const next=p.path[p.at];let moving=false;
 if(next){const dx=next[0]-model.position.x,dz=next[1]-model.position.z,d=Math.hypot(dx,dz),step=Math.min(d,dt*2);const nx=model.position.x+dx/(d||1)*step,nz=model.position.z+dz/(d||1)*step;if(pass(nx,nz)){model.position.set(nx,walkHeight(nx,nz),nz);if(d>.05)model.rotation.y=Math.atan2(dx,dz);if(d<.12)p.at++;moving=true}else{p.phase=-1}}
 if(moving){model.userData.activity='walking';p.rig.legs.forEach((l,j)=>l.rotation.x=Math.sin(elapsed*9+j*Math.PI)*.45);p.rig.arms.forEach((a,j)=>a.rotation.x=-Math.sin(elapsed*9+j*Math.PI)*.25);return}
 p.rig.legs.forEach(l=>l.rotation.x=0);p.rig.arms.forEach(a=>a.rotation.x=0);
 const target=p.phase===3?p.door:p.phase===1?p.seat:p.phase===0?p.meet:p.home;
 if(Math.hypot(model.position.x-target[0],model.position.z-target[1])>(p.phase===0?3:1.5)){model.userData.activity='idle';return}
 if(p.phase===3){p.sleepingAtHome=true;model.visible=false;model.userData.activity='sleeping-at-home';if(p.worker)p.worker.zzz.visible=false;return;}
 if(p.phase===1){model.position.set(p.seat[0],.64,p.seat[1]);model.rotation.y=Math.PI;p.rig.legs.forEach(l=>l.rotation.x=-Math.PI/2);p.rig.arms.forEach(a=>a.rotation.x=-.45);model.userData.activity='sitting';}
 else if(p.phase===0){model.userData.activity='chatting';const other=people[(i+1)%people.length];model.rotation.y=Math.atan2(other.rig.avatar.position.x-model.position.x,other.rig.avatar.position.z-model.position.z);p.rig.arms[0].rotation.x=Math.sin(elapsed*2+i)*.18;}
 else {model.userData.activity='working';p.rig.arms[0].rotation.x=-.35+Math.sin(elapsed*2+i)*.15;}
 const neighbor=people.some(other=>other!==p&&Math.hypot(other.rig.avatar.position.x-model.position.x,other.rig.avatar.position.z-model.position.z)<5);
 if(neighbor&&(p.phase===0||p.phase===1)&&Math.floor(elapsed/3)%people.length===i){p.bubble.position.set(model.position.x,model.position.y+3,model.position.z);p.bubble.visible=true;}
 });}};
}
