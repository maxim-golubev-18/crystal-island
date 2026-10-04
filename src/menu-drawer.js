export function setupMenuDrawer({keys}) {
  const panel=document.querySelector('#action-drawer');
  const toggle=document.querySelector('#menu-toggle');
  let open=false;
  function setOpen(value) {
    open=value;
    keys.clear();
    panel.inert=!open;
    panel.setAttribute('aria-hidden',String(!open));
    toggle.setAttribute('aria-expanded',String(open));
    toggle.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');
    toggle.querySelector('span').textContent=open?'›':'‹';
    document.querySelector('#game').classList.toggle('menu-open',open);
    if(!open && panel.contains(document.activeElement)) toggle.focus();
  }
  toggle.addEventListener('click',()=>setOpen(!open));
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape' && open && !document.querySelector('dialog[open]')) {
      setOpen(false);
      toggle.focus();
    }
  });
  document.querySelector('#game').addEventListener('pointerdown',event=>{
    if(open && event.target instanceof HTMLCanvasElement) setOpen(false);
  });
  return {get open(){return open;}};
}
