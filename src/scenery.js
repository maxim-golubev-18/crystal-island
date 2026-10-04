import * as T from 'three';
import {ponds,houses,trails,onTrail} from './layout.js';
export function buildScenery(scene){
 const group=new T.Group();group.name='LanternWalks';scene.add(group);const posts=[];
 const wood=new T.MeshStandardMaterial({color:0x755039,roughness:.9}),stone=new T.MeshStandardMaterial({color:0x8faaa4,roughness:1}),metal=new T.MeshStandardMaterial({color:0x344c4b,metalness:.45,roughness:.5}),glass=new T.MeshStandardMaterial({color:0xffe8ad,emissive:0xffc46b,emissiveIntensity:.35,roughness:.3}),leaf=new T.MeshStandardMaterial({color:0x559169});
 const boxGeo=new T.BoxGeometry(1,1,1);function box(parent,w,h,d,mat,x,y,z){const o=new T.Mesh(boxGeo,mat);o.scale.set(w,h,d);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
 function lamp(parent,x,y,z){box(parent,.4,.6,.4,glass,x,y,z);for(const dx of [-.23,.23])for(const dz of [-.23,.23])box(parent,.045,.65,.045,metal,x+dx,y,z+dz);for(const dy of [-.34,.34])box(parent,.55,.08,.55,metal,x,y+dy,z);const roof=new T.Mesh(new T.ConeGeometry(.4,.24,4),metal);roof.rotation.y=Math.PI/4;roof.position.set(x,y+.49,z);parent.add(roof);}
 for(const p of ponds){
  for(const side of [-1,1]){
   const arch=new T.Group();arch.name='LanternArch';const extent=(p.axis==='x'?p.rx:p.rz)+1;
   arch.position.set(p.x+(p.axis==='x'?side*extent:0),0,p.z+(p.axis==='z'?side*extent:0));if(p.axis==='x')arch.rotation.y=Math.PI/2;group.add(arch);
   for(const x of [-1.8,1.8]){box(arch,.55,.45,.55,stone,x,1.06,0);box(arch,.25,3.25,.25,wood,x,2.8,0);box(arch,.38,.14,.38,wood,x,4.35,0);box(arch,.55,.09,.38,metal,x,3.5,.1);lamp(arch,x,3.08,.33);}
   const curve=new T.CatmullRomCurve3([new T.Vector3(-1.8,4.3,0),new T.Vector3(-1.1,4.95,0),new T.Vector3(0,5.2,0),new T.Vector3(1.1,4.95,0),new T.Vector3(1.8,4.3,0)]);const beam=new T.Mesh(new T.TubeGeometry(curve,24,.13,6,false),wood);beam.castShadow=true;arch.add(beam);
   for(let i=0;i<7;i++){const t=(i+1)/8;const point=curve.getPoint(t);box(arch,.025,.28,.025,metal,point.x,point.y-.2,0);const bulb=new T.Mesh(new T.SphereGeometry(.09,8,6),glass);bulb.position.set(point.x,point.y-.4,0);arch.add(bulb);}
   arch.updateMatrixWorld(true);for(const x of [-1.8,1.8]){const pos=arch.localToWorld(new T.Vector3(x,0,0));posts.push({x:pos.x,z:pos.z,r:.3});}
  }
  // One light per pond illuminates the bridge; smaller bulbs use emissive materials.
  const light=new T.PointLight(0xffd18b,0,16,2);light.position.set(p.x,4,p.z);light.userData.nightIntensity=12;group.add(light);
  for(let i=0;i<16;i++){const a=i/16*Math.PI*2,x=p.x+Math.cos(a)*(p.rx+.65),z=p.z+Math.sin(a)*(p.rz+.65);if(p.axis==='x'?Math.abs(z-p.z)<2:Math.abs(x-p.x)<2)continue;for(let j=0;j<3;j++){const reed=box(group,.045,.5+j*.17,.045,leaf,x+j*.1,1.1+( .5+j*.17)/2,z);reed.rotation.z=(j-1)*.14;}}
 }
 function blocked(x,z){return Math.hypot(x,z)<7||houses.some(h=>Math.abs(x-h.x)<5&&Math.abs(z-h.z)<6)||ponds.some(p=>((x-p.x)/(p.rx+2))**2+((z-p.z)/(p.rz+2))**2<1)||x>-18&&x<-5&&z>-5&&z<5||x>-15&&x<-3&&z>6&&z<14||x>2&&x<14&&z>-12&&z<-4;}
 const routes=[...trails,[[-1,-40],[-1,44]],[[-44,6],[44,6]]];let count=0;
 for(const path of routes)for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i],length=Math.hypot(b[0]-a[0],b[1]-a[1]),nx=-(b[1]-a[1])/length,nz=(b[0]-a[0])/length;for(let d=2;d<length;d+=6.5)for(const side of [-1,1]){const x=a[0]+(b[0]-a[0])*d/length+nx*side*1.85,z=a[1]+(b[1]-a[1])*d/length+nz*side*1.85;if(blocked(x,z)||onTrail(x,z,1.4)||posts.some(p=>Math.hypot(x-p.x,z-p.z)<3))continue;box(group,.35,.25,.35,stone,x,.98,z);box(group,.13,1.4,.13,wood,x,1.8,z);lamp(group,x,2.8,z);posts.push({x,z,r:.2});count++;}}
 group.userData={arches:10,pathLights:count};
 return {setNight(night){glass.emissiveIntensity=night?2.8:.35;},canWalk(x,z){return !posts.some(p=>Math.hypot(x-p.x,z-p.z)<p.r+.2)}};
}
export function groundTexture(base,spread,repeat){const canvas=document.createElement('canvas');canvas.width=canvas.height=128;const ctx=canvas.getContext('2d'),image=ctx.createImageData(128,128);let seed=93;for(let i=0;i<image.data.length;i+=4){seed=(seed*1664525+1013904223)>>>0;const noise=((seed/4294967296)-.5)*spread;for(let j=0;j<3;j++)image.data[i+j]=Math.max(0,Math.min(255,base[j]+noise));image.data[i+3]=255;}ctx.putImageData(image,0,0);const texture=new T.CanvasTexture(canvas);texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.repeat.set(repeat,repeat);texture.colorSpace=T.SRGBColorSpace;return texture;}
