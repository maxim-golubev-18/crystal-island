export const ponds = [
 {x:10,z:6,rx:6.3,rz:5,axis:'x',name:'Пруд светлячков',original:true},
 {x:-30,z:6,rx:5.7,rz:4.5,axis:'x',name:'Лесное озерцо'},
 {x:28,z:6,rx:5.5,rz:4.4,axis:'x',name:'Бирюзовый пруд'},
 {x:-1,z:-28,rx:4.6,rz:5.6,axis:'z',name:'Сосновый пруд'},
 {x:9,z:33,rx:5,rz:3.8,axis:'x',name:'Солнечный пруд'},
];
export const houses = [
 {x:-10,z:-9,color:0xc57655,original:true},
 {x:-35,z:-14,color:0x5c9397}, {x:-19,z:-34,color:0xc77966},
 {x:17,z:-31,color:0x748ab1}, {x:37,z:-9,color:0xd6a15e},
 {x:27,z:29,color:0x809e71}, {x:-17,z:32,color:0xb583a2},
];
export const groves=[{x:-21,z:-17,color:0xbda0ff},{x:15,z:-17,color:0x72e7ff},{x:37,z:19,color:0xffb2d9},{x:-30,z:24,color:0x88f1ce},{x:0,z:23,color:0xffd876}];
export const trails=[
 [[-38,6],[-39,-2],[-34,-10],[-30,-10],[-26,-17],[-21,-26],[-13,-28],[-10,-35],[-1,-35],[-1,-21],[10,-22],[19,-24],[29,-19],[31,-12],[32,-3],[37,-3],[36,6]],
 [[-38,6],[-37,15],[-31,23],[-23,27],[-15,28],[-6,33],[9,33],[20,33],[22,23],[34,18],[36,6]],
 [[-21,-26],[-21,-17],[-15,-11],[-15,-5],[-10,-5],[-1,-5]],
 [[19,-24],[15,-17],[9,-12],[-1,-8]],
 [[-31,23],[-23,18],[-13,17],[-1,15],[0,23],[-6,33]],
 [[34,18],[37,19]],
 ...houses.filter(h=>!h.original).map(h=>[[h.x,h.z+2.8],[h.x,h.z+5.5]]),
 [[-35,-8.5],[-34,-10]],[[-19,-28.5],[-21,-26]],[[17,-25.5],[19,-24]],[[37,-3.5],[37,-3]],[[27,34.5],[20,33]],[[-17,37.5],[-12,37.5],[-12,28],[-15,28]],
];
export function segmentDistance(x,z,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz||1)));return Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz)}
export function onTrail(x,z,margin=2.8){return trails.some(path=>path.slice(1).some((b,i)=>segmentDistance(x,z,path[i],b)<margin))}
export function reserved(x,z){return onTrail(x,z)||ponds.some(p=>((x-p.x)/(p.rx+2))**2+((z-p.z)/(p.rz+2))**2<1)||houses.some(h=>Math.abs(x-h.x)<5&&Math.abs(z-h.z)<5)||groves.some(g=>Math.hypot(x-g.x,z-g.z)<3.5)}
export function onBridge(x,z,p){return p.axis==='x'?Math.abs(z-p.z)<1.15&&Math.abs(x-p.x)<p.rx+1:Math.abs(x-p.x)<1.15&&Math.abs(z-p.z)<p.rz+1}
export function walkHeight(x,z){return ponds.some(p=>onBridge(x,z,p))?1.38:.86}
