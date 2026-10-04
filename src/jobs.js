import * as T from 'three';
import {createAvatar} from './avatar.js';
export const professions=[
 {id:'gardener',name:'Садовник',icon:'🌱',pay:30,lesson:'Садовник ухаживает за растениями. Подойди к каждой отмеченной клумбе: сначала подготовь землю, затем посади цветы и полей их.',steps:[{x:-19,z:12,text:'Подготовить землю',hint:'Рыхлим землю, чтобы корням было легче расти.'},{x:-19,z:15,text:'Посадить цветы',hint:'Сажаем цветы в готовую клумбу.'},{x:-19,z:18,text:'Полить цветы',hint:'Немного воды — и цветы растут.'}]},
 {id:'baker',name:'Пекарь',icon:'🍞',pay:35,lesson:'Пекарь готовит хлеб. Возьми ингредиенты у продуктовой лавки, замеси тесто на столе и испеки хлеб в печи.',steps:[{x:-9,z:13,text:'Взять муку и воду',hint:'Для теста нужны мука и чистая вода.'},{x:-13,z:13,text:'Замесить тесто',hint:'Перемешиваем ингредиенты до мягкого теста.'},{x:-13,z:17,text:'Испечь хлеб',hint:'Игровая печь испечёт хлеб автоматически.'}]},
 {id:'builder',name:'Строитель',icon:'🔨',pay:40,lesson:'Строитель собирает полезные вещи. Возьми доски у магазина мебели, отмерь детали на верстаке и собери учебную скамейку.',steps:[{x:8,z:-5,text:'Взять доски',hint:'Выбираем ровные доски.'},{x:12,z:-4,text:'Отмерить детали',hint:'Сначала измеряем, потом собираем.'},{x:16,z:-4,text:'Собрать скамейку',hint:'Соединяем готовые детали.'}]},
 {id:'courier',name:'Курьер',icon:'📦',pay:45,lesson:'Курьер доставляет покупки. Получи две посылки у лавки и отнеси их к двум отмеченным домикам.',steps:[{x:-9,z:13,text:'Получить посылки',hint:'Проверяем, что обе посылки с нами.'},{x:-10,z:-5.5,text:'Доставить первую посылку',hint:'Оставляем посылку у нужного домика.'},{x:-35,z:-10.5,text:'Доставить вторую посылку',hint:'Вторая доставка завершает смену.'}]},
];
export function setupJobs({scene,avatar,homeSystem,life,keys,root}){
 const center={x:-12,z:2.5};const mentor=createAvatar({top:'#658da1',pants:'#3c4e63',hair:'#6d5240',skin:'#e9b78f',backpack:false,style:'curls'});mentor.avatar.position.set(center.x,.86,center.z);mentor.avatar.rotation.y=.5;scene.add(mentor.avatar);
 function box(x,y,z,w,h,d,color){const m=new T.Mesh(new T.BoxGeometry(w,h,d),new T.MeshStandardMaterial({color}));m.position.set(x,y,z);m.castShadow=true;scene.add(m);return m}
 // A proper job center with a sheltered reception and a large readable sign.
 const centerGroup=new T.Group();centerGroup.name='JobCenter';scene.add(centerGroup);
 function centerPart(x,y,z,w,h,d,color){const part=box(x,y,z,w,h,d,color);centerGroup.attach(part);return part}
 centerPart(-12,.87,-.6,8.6,.16,5.4,0xd7c09a);
 centerPart(-12,2.8,-3.2,8.4,3.8,.24,0xf0dfb9);
 for(const x of [-16.1,-7.9]){centerPart(x,2.8,-.7,.24,3.8,5.1,0xe4cca3);centerPart(x,3.1,1.75,.35,4.4,.35,0x527e83);}
 centerPart(-12,5.35,-.7,9.2,.35,6.1,0x527e83);centerPart(-12,5.62,-.7,9.6,.18,6.4,0x355d68);
 centerPart(-12,1.6,-1,4.7,1.3,.9,0x9f754c);centerPart(-12,2.3,-1,5,.15,1.1,0xd9b778);
 for(const x of [-14.7,-9.3]){centerPart(x,3.2,-3.04,1.9,1.4,.1,0x95cbd4);centerPart(x,3.2,-2.97,.07,1.5,.1,0xffffff);}
 centerPart(-12,.87,3.9,3.3,.07,3.6,0xefdcaa);
 const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=256;const ctx=canvas.getContext('2d');ctx.fillStyle='#214f54';ctx.fillRect(0,0,1024,256);ctx.fillStyle='#ffedbd';ctx.textAlign='center';ctx.font='bold 130px sans-serif';ctx.fillText('РАБОТА',512,170);const sign=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(canvas)}));sign.name='JobCenterSign';sign.position.set(-12,6.35,1.2);sign.scale.set(7.6,1.9,1);centerGroup.add(sign);
 const flowerBeds=[];for(const z of [12,15,18]){box(-19,.95,z,2,.3,1.2,0x997149);flowerBeds.push(box(-19,1.17,z,1.8,.12,1,0x5b4637));}
 box(-13,1.5,13,2,.2,1.3,0xb9895c);for(const x of [-13.8,-12.2])box(x,1.1,13,.15,.8,.8,0x7b5842);box(-13,1.5,17,2,1.4,1.7,0xb77854);box(-13,1.45,17.87,1.3,.7,.04,0x4e413b);
 box(12,1.4,-4,2,.2,1.4,0xbc9463);box(16,1.2,-4,2.4,.2,.7,0xbb9465);
 const marker=new T.Mesh(new T.OctahedronGeometry(.45),new T.MeshStandardMaterial({color:0xffd878,emissive:0xffbb32,emissiveIntensity:.65}));marker.visible=false;scene.add(marker);
 const dialog=document.createElement('dialog');dialog.id='jobs-dialog';dialog.innerHTML='<h2>Наставник Мирон</h2><p id="mentor-speech"></p><div id="job-list"></div><button id="jobs-close">Понятно</button>';root.append(dialog);
 const button=document.createElement('button');button.id='jobs-menu';button.textContent='⚒ Работа';document.querySelector('.tools').append(button);
 const action=document.createElement('button');action.id='job-action';action.hidden=true;root.append(action);const status=document.createElement('div');status.id='job-status';root.append(status);
 let onTalk=null;let onComplete=()=>{};let job=null,step=0,working=false,remaining=0,progress=0;
 function open(){keys.clear();const speech=dialog.querySelector('#mentor-speech'),list=dialog.querySelector('#job-list');list.replaceChildren();speech.textContent=job?`Напомню: ${job.lesson} Сейчас: ${job.steps[step].text.toLowerCase()}. Ищи золотой указатель на острове.`:'Привет! Я Мирон. Какую профессию хочешь освоить? Прочитай подсказку и начни смену. Если забудешь, нажми «Работа» — я напомню.';
 for(const p of professions){const card=document.createElement('section');card.className='job-card';card.innerHTML=`<h3>${p.icon} ${p.name} · рабочая смена</h3><p>${p.lesson}</p>`;const start=document.createElement('button');start.textContent=job?(job.id===p.id?'Твоя текущая смена':'Заверши текущую смену'):'Начать смену';start.disabled=Boolean(job)||homeSystem.chosen===null;start.onclick=()=>{job=p;step=0;working=false;dialog.close();keys.clear()};card.append(start);list.append(card)}if(job){const cancel=document.createElement('button');cancel.textContent='Закончить смену без оплаты';cancel.onclick=()=>{job=null;working=false;dialog.close()};list.append(cancel)}dialog.showModal();}
 button.onclick=open;dialog.querySelector('#jobs-close').onclick=()=>{dialog.close();keys.clear()};dialog.addEventListener('cancel',()=>keys.clear());
 function distance(target){return Math.hypot(avatar.position.x-target.x,avatar.position.z-target.z)}
 action.onclick=()=>{if(homeSystem.inside||document.querySelector('dialog[open]'))return;if(!job){(onTalk||open)();return}if(distance(job.steps[step])<2.8&&!working){working=true;remaining=2;keys.clear()}};
 return {mentor,set onTalk(fn){onTalk=fn},canWalk(x,z){return !(Math.abs(x+12)<4.4&&Math.abs(z+3.2)<.4||Math.abs(Math.abs(x+12)-4.1)<.35&&z>-3.4&&z<1.9||Math.abs(x+12)<2.65&&Math.abs(z+1)<.75)},set onComplete(fn){onComplete=fn},get blocked(){return dialog.open||working},get state(){return {job:job?.id,step,working}},update(dt){const active=homeSystem.chosen!==null&&!homeSystem.inside&&!document.querySelector('dialog[open]');marker.visible=Boolean(job)&&!homeSystem.inside;
 if(job){const target=job.steps[step];marker.position.set(target.x,3.2+Math.sin(performance.now()/300)*.15,target.z);marker.rotation.y+=dt;status.textContent=`${job.name}: ${step+1}/3 · ${target.text} · ${Math.round(distance(target))} м`;status.hidden=homeSystem.chosen===null;action.hidden=!active||distance(target)>=2.8;action.textContent=working?'Работаем…':target.text;action.disabled=working;
 if(working&&active){remaining-=dt;if(remaining<=0){working=false;if(job.id==='gardener')flowerBeds[step].material.color.setHex([0x896940,0x71a35b,0xe7b275][step]);step++;if(step===job.steps.length){job=null;step=0;onComplete()}}}
 }else{marker.visible=false;status.textContent='Центр «РАБОТА» · наставник Мирон';status.hidden=homeSystem.chosen===null;action.hidden=!active||distance(mentor.avatar.position)>3.3;action.disabled=false;action.textContent='Поговорить с Мироном';}
 }};
}
