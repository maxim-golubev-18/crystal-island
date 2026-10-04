import * as T from 'three';
export function setupCameraView({camera,controls,avatar,canvas,homeSystem,wardrobe}){
 let first=false,yaw=0,pitch=0,drag=null;const button=document.createElement('button');button.id='camera-view';button.textContent='◉ От первого лица';document.querySelector('.tools').append(button);
 const isBlocked=()=>homeSystem.blocked||wardrobe.open||Boolean(document.querySelector('dialog[open]'));
 function set(value){first=Boolean(value);drag=null;button.textContent=first?'◉ Вид сверху':'◉ От первого лица';button.setAttribute('aria-pressed',String(first));controls.enabled=!first&&!isBlocked();camera.near=first?.06:.1;camera.updateProjectionMatrix();if(first){yaw=avatar.rotation.y+Math.PI;pitch=0;}else{camera.fov=innerWidth<700?55:40;camera.updateProjectionMatrix();avatar.visible=!homeSystem.blocked;const x=homeSystem.inside?0:avatar.position.x,z=homeSystem.inside?0:avatar.position.z;controls.target.set(x,.4,z);camera.position.set(x+14,18,z+22);controls.update();}document.querySelector('footer>span:last-child').textContent=first?'Зажми мышь и двигай — осмотреться':'Потяни карту, чтобы повернуть · Колёсико — ближе';}
 button.onclick=()=>set(!first);
 canvas.addEventListener('pointerdown',e=>{if(!first||isBlocked())return;drag={id:e.pointerId,x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId)});
 canvas.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId||isBlocked())return;yaw-=(e.clientX-drag.x)*.005;pitch=Math.max(-1.3,Math.min(1.3,pitch-(e.clientY-drag.y)*.005));drag.x=e.clientX;drag.y=e.clientY;});
 for(const name of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(name,()=>drag=null);
 return {set,get first(){return first},update(){const shell=homeSystem.scene.getObjectByName('FirstPersonShell');if(shell)shell.visible=first&&!homeSystem.blocked;if(first&&homeSystem.blocked){set(false);return;}controls.enabled=!first&&!isBlocked();avatar.visible=!first&&!homeSystem.blocked;if(first){camera.position.set(avatar.position.x,avatar.position.y+1.96,avatar.position.z);camera.rotation.set(pitch,yaw,0,'YXZ');camera.fov=70;camera.updateProjectionMatrix();}else controls.update();}};
}
