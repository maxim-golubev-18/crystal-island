export const RADIUS = 23;
export function canWalk(x,z){return x*x+z*z<(RADIUS-1.5)**2 && !(x>4&&x<15&&z>1&&z<11&&Math.abs(z-6)>1.5) && !(x>-13&&x<-7&&z>-12&&z<-6)}
export function locationName(x,z){if(x>4&&z>1)return 'Пруд светлячков';if(z<-6&&x<0)return 'Дом у соснового леса';if(z>11)return 'Тихий берег';return 'Кристальная площадь'}
