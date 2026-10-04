export const products=[
 {id:'water',name:'Вода',icon:'💧',price:1,thirst:40,hunger:0},
 {id:'milk',name:'Молоко',icon:'🥛',price:3,thirst:22,hunger:12},
 {id:'bread',name:'Хлеб',icon:'🍞',price:2,thirst:0,hunger:28},
 {id:'eggs',name:'Варёные яйца',icon:'🥚',price:3,thirst:0,hunger:32},
 {id:'vegetables',name:'Овощи',icon:'🥕',price:3,thirst:8,hunger:22},
 {id:'fruit',name:'Фрукты',icon:'🍎',price:2,thirst:12,hunger:20},
];
export function newLife(raw={}){const clamp=(v,otherwise,max)=>Number.isFinite(v)?Math.max(0,Math.min(max,v)):otherwise;const bag={};for(const p of products)bag[p.id]=Math.floor(clamp(raw?.bag?.[p.id],0,999));return {coins:Math.floor(clamp(raw?.coins,30,999999)),hunger:clamp(raw?.hunger,100,100),thirst:clamp(raw?.thirst,100,100),bag};}
export function buy(state,id){const p=products.find(p=>p.id===id);if(!p||state.coins<p.price||state.bag[id]>=999)return false;state.coins-=p.price;state.bag[id]++;return true;}
export function consume(state,id){const p=products.find(p=>p.id===id);if(!p||!state.bag[id])return false;state.bag[id]--;state.hunger=Math.min(100,state.hunger+p.hunger);state.thirst=Math.min(100,state.thirst+p.thirst);return true;}
export function tickNeeds(state,seconds){state.hunger=Math.max(0,state.hunger-seconds*.055);state.thirst=Math.max(0,state.thirst-seconds*.085);}
