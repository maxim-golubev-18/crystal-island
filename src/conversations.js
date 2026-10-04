import {professions} from './jobs.js';
import {ranks} from './career-state.js';
export function setupConversations({root,avatar,homeSystem,career,jobs,keys}){
 const people=[{name:'Мирон',role:'Наставник',model:jobs.mentor.avatar,kind:'mentor'}, {name:'Алексей',role:'Начальник',model:career.boss.avatar,kind:'boss'},...career.staff.map((worker,i)=>({name:worker.name,role:['Садовница','Пекарь','Строитель'][i],model:worker.model.avatar,kind:'staff',worker,index:i}))];
 const dialog=document.createElement('dialog');dialog.id='conversation';dialog.setAttribute('aria-labelledby','speaker-name');dialog.innerHTML='<span id="speaker-role" class="eyebrow"></span><h2 id="speaker-name"></h2><p id="speaker-text" role="status" aria-live="polite"></p><div id="conversation-choices"></div><button id="conversation-close">До встречи!</button>';root.append(dialog);
 const prompt=document.createElement('button');prompt.id='talk-prompt';prompt.hidden=true;root.append(prompt);let current=null;
 function available(){return homeSystem.chosen!==null&&!homeSystem.inside&&!career.sleeping&&!document.querySelector('dialog[open]')}
 function nearest(){return people.filter(p=>p.model.visible).map(p=>({p,d:Math.hypot(p.model.position.x-avatar.position.x,p.model.position.z-avatar.position.z)})).filter(v=>v.d<3.3).sort((a,b)=>a.d-b.d)[0]?.p??null;}
 function say(text){dialog.querySelector('#speaker-text').textContent=text}
 function choice(label,fn){const b=document.createElement('button');b.textContent=label;b.onclick=fn;dialog.querySelector('#conversation-choices').append(b)}
 function open(person){if(!available())return;current=person;keys.clear();person.model.rotation.y=Math.atan2(avatar.position.x-person.model.position.x,avatar.position.z-person.model.position.z);dialog.querySelector('#speaker-name').textContent=person.name;dialog.querySelector('#speaker-role').textContent=person.role;dialog.querySelector('#conversation-choices').replaceChildren();
 if(person.kind==='mentor'){
 say('Привет! Рад тебя видеть. Я помогу освоиться на работе. О чём поговорим?');
 choice('Напомни, что мне делать',()=>{const state=jobs.state,p=professions.find(p=>p.id===state.job);say(p?`${p.lesson} Сейчас задание ${state.step+1}: ${p.steps[state.step].text.toLowerCase()}. ${p.steps[state.step].hint}`:'Сначала выбери профессию. Я обучаю садовников, пекарей, строителей и курьеров. После трёх заданий смена засчитывается, а зарплата придёт в конце дня.');});
 choice('Хочу выбрать профессию',()=>{dialog.close();keys.clear();document.querySelector('#jobs-menu').click()});
 choice('Что интересного на острове?',()=>say('Прогуляйся по мостикам под арками с фонариками. В прудах тёплая вода! А дома можно поставить цветы, полочки и баночки мёда.'));
 }else if(person.kind==='boss'){
 say(`Здравствуй! Сейчас твой уровень — «${ranks[career.state.rank].name}». Что хочешь узнать?`);
 choice('Какая у меня зарплата?',()=>say(`Твоя зарплата — ${ranks[career.state.rank].pay} монет за игровой день. Заверши смену, и деньги придут после дня и ночи. ${career.state.missPay?'За сон на работе ближайшая выплата пропущена.':career.state.worked?'Сегодня работа уже засчитана.':'Сегодня смена ещё не засчитана.'}`));
 choice('Хочу повышение',()=>{dialog.close();keys.clear();document.querySelector('#career-menu').click()});
 choice('Почему важно отдыхать?',()=>say('После двух игровых дней без сна ты очень устанешь. Спи в своём доме. Если уснёшь во время работы, получишь выговор и пропустишь ближайшую зарплату.'));
 }else{
 const lines=[['Я ухаживаю за клумбами. Люблю, когда на острове много цветов!','Сначала подготовь землю, потом посади цветы и полей их. Не забывай любоваться результатом!'],['Я готовлю хлеб. Как приятно пахнет у печи!','Возьми муку и воду, замеси тесто, а потом подойди к игровой печи.'],['Я собираю мебель. Хочется сделать каждый дом уютным.','За досками — к магазину мебели. Потом измерь детали и собери скамейку.']][person.index];
 say(person.worker.sleeping?'Хр-р… Кажется, я задремал прямо на работе.':`Привет! ${lines[0]}`);
 choice('Как твои дела?',()=>say(person.worker.sleeping?'Очень хочется спать… Начальнику пора меня разбудить.':person.worker.assignment?`Сейчас выполняю задание: ${person.worker.assignment.toLowerCase()}. Скоро закончу!`:'Всё хорошо! Я готов к новой работе. А после смены пойду отдыхать.'));
 choice('Расскажи о своей работе',()=>say(lines[1]));
 choice('Где купить еду?',()=>say('В ларьке у площади есть вода, молоко, хлеб, яйца, овощи и фрукты. Покупки попадают в «Продукты» — там можно поесть и попить.'));
 choice('Просыпайся!',()=>{if(career.state.rank!==ranks.length-1){say('Будить сотрудников на работе может управляющий. Но ты можешь поговорить с Алексеем о повышении.');return}say(career.wake(person.index)?'Спасибо, уже проснулся! Продолжаю работу.':'Я уже бодрствую и готов работать!')});
 }
 dialog.showModal();}
 prompt.onclick=()=>{const p=nearest();if(p)open(p)};dialog.querySelector('#conversation-close').onclick=()=>{dialog.close();keys.clear()};dialog.addEventListener('cancel',()=>keys.clear());
 addEventListener('keydown',e=>{if(e.code==='KeyF'&&!e.repeat&&available()){const p=nearest();if(p){e.preventDefault();open(p)}}});jobs.onTalk=()=>open(people[0]);
 return {get open(){return dialog.open},get speaker(){return dialog.open?current?.model:null},update(){const p=available()?nearest():null;prompt.hidden=!p;if(p)prompt.textContent=`Поговорить: ${p.name} · F`;if(dialog.open&&(career.sleeping||homeSystem.inside))dialog.close()}};
}
