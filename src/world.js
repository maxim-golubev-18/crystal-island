import {ponds,houses,groves,onBridge} from './layout.js';
export const MAP_SCALE = Math.sqrt(5);
export const RADIUS = 23 * MAP_SCALE;
export function canWalk(x,z){
 if(x*x+z*z>=(RADIUS-1.5)**2)return false;
 if(houses.some(h=>Math.abs(x-h.x)<2.85&&Math.abs(z-h.z)<2.55))return false;
 return true;
}
export function locationName(x,z){
 const pond=ponds.find(p=>Math.hypot(x-p.x,z-p.z)<p.rx+3);if(pond)return pond.name+' · вода 28 °C';
 if(groves.some(g=>Math.hypot(x-g.x,z-g.z)<4))return 'Кристальная полянка';
 if(houses.some(h=>Math.hypot(x-h.x,z-h.z)<6))return 'Лесные домики';
 if(Math.hypot(x,z)>25)return z<0?'Большой сосновый лес':z>25?'Дальний берег':'Цветочные поляны';
 return 'Кристальная площадь';
}

export function swimmingPond(x,z){return ponds.find(p=>((x-p.x)/p.rx)**2+((z-p.z)/p.rz)**2<1&&!onBridge(x,z,p))??null;}
