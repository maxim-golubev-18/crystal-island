export const homeStyles=[
 {name:'Солнечный',detail:'Мёд, тёплое дерево и мягкий жёлтый ковёр',color:0xe8b95f},
 {name:'Мятный',detail:'Бирюзовый уют и много зелёных растений',color:0x70b6ac},
 {name:'Ягодный',detail:'Коралловый плед и уголок для чтения',color:0xd48e88},
 {name:'Звёздный',detail:'Синие подушки и кристалл у кровати',color:0x8e9fcc},
 {name:'Медовый',detail:'Золотистый ковёр и стол у окна',color:0xd7a556},
 {name:'Лесной',detail:'Зелёный плед и домашний садик',color:0x8bad76},
 {name:'Лавандовый',detail:'Сиреневые подушки и полка с книгами',color:0xb293c1},
];
export const furniture=[
 {x:-1.7,z:-3.8,w:.65,d:.65}, // bedside table
 {x:-3.7,z:-2.4,w:2.7,d:4.1}, // bed
 {x:3.7,z:-3.25,w:3.1,d:1.5}, // desk
 {x:3.6,z:-2.2,w:.85,d:.8}, // desk stool
 {x:3.65,z:1,w:2.6,d:2.1}, // sofa
 {x:2.35,z:3.25,w:1.6,d:1.3}, // coffee table
 {x:-4.5,z:3.3,w:1.15,d:1.15}, // plant
 {x:.3,z:-4.25,w:2.1,d:.7}, // bookcase
];
export function canWalkInside(x,z){return Math.abs(x)<5.35&&Math.abs(z)<4.45&&!furniture.some(o=>Math.abs(x-o.x)<o.w/2+.22&&Math.abs(z-o.z)<o.d/2+.22)}
