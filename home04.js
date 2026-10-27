(()=>{
 'use strict';
 const hero=document.querySelector('.home04');if(!hero)return;
 const body=document.body,scenes=[...hero.querySelectorAll('.scene04')],dots=[...hero.querySelectorAll('[data-scene-index]')],reduced=matchMedia('(prefers-reduced-motion:reduce)'),fine=matchMedia('(hover:hover) and (pointer:fine)');
 const toggle=hero.querySelector('.motion-toggle04'),autoplay=hero.querySelector('.autoplay04'),announcement=hero.querySelector('#scene-announcement04');
 let index=0,desired=0,busy=false,queued=null,autoPaused=false,focusHeld=false,visible=true,sceneTimer=0,transitionTimer=0;
 let enabled=true,explicit=true;
 let activeLayers=[],reactive=[],wordRect=null;
 const pointer={x:0,y:0,targetX:0,targetY:0,present:false};
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 const normalize=n=>(n+scenes.length)%scenes.length;
 function cacheLayers(){activeLayers=[...scenes[index].querySelectorAll('.pull04[data-depth]')];reactive=[...hero.querySelectorAll('.brand04'),...scenes[index].querySelectorAll('.reactive04')];wordRect=scenes[index].querySelector('.word04').getBoundingClientRect();}
 function schedule(){clearTimeout(sceneTimer);if(enabled&&!autoPaused&&!focusHeld&&visible&&!document.hidden&&!busy)sceneTimer=setTimeout(()=>go(index+1,false),8000);}
 function syncUI(){toggle.textContent=enabled?'Pausar movimento':'Ativar movimento';toggle.setAttribute('aria-label',enabled?'Pausar animações da página':'Ativar animações da página');toggle.setAttribute('aria-pressed',String(enabled));autoplay.textContent=autoPaused?'▷':'Ⅱ';autoplay.setAttribute('aria-pressed',String(autoPaused));autoplay.setAttribute('aria-label',autoPaused?'Retomar troca automática de cenas':'Pausar troca automática de cenas');}
 function setMotion(value,user=false){enabled=value;body.dataset.motion=enabled?'on':'off';if(user){explicit=true;try{sessionStorage.setItem('frame-motion04',enabled?'on':'off')}catch{}}autoPaused=!enabled;if(!enabled){pointer.targetX=pointer.targetY=pointer.x=pointer.y=0;activeLayers.forEach(el=>{el.style.setProperty('--pull-x','0px');el.style.setProperty('--pull-y','0px')});}syncUI();schedule();wake();}
 async function go(n,manual=true){
  desired=normalize(n);if(busy){queued={n:desired,manual};return;}if(desired===index){schedule();return;}
  busy=true;clearTimeout(sceneTimer);const nextIndex=desired,next=scenes[nextIndex],img=next.querySelector('.mascot04');
  try{await img.decode();}catch{busy=false;announcement.textContent='Esta cena não carregou. Tente novamente.';schedule();return;}
  const old=scenes[index];old.classList.remove('is-active');old.classList.add('is-leaving');old.setAttribute('aria-hidden','true');old.inert=true;
  index=nextIndex;next.classList.remove('is-leaving');next.setAttribute('aria-hidden','false');next.inert=false;void next.offsetWidth;next.classList.add('is-active');hero.dataset.activeScene=next.dataset.scene;
  dots.forEach((dot,i)=>{dot.classList.toggle('active',i===index);dot.setAttribute('aria-pressed',String(i===index));});
  pointer.x=pointer.y=0;cacheLayers();if(manual)announcement.textContent=next.getAttribute('aria-label');
  clearTimeout(transitionTimer);transitionTimer=setTimeout(()=>{old.classList.remove('is-leaving');busy=false;if(queued){const request=queued;queued=null;go(request.n,request.manual);}else schedule();},enabled?620:20);
 }
 hero.querySelector('.next04').addEventListener('click',()=>go((busy?desired:index)+1));hero.querySelector('.prev04').addEventListener('click',()=>go((busy?desired:index)-1));dots.forEach((dot,i)=>dot.addEventListener('click',()=>go(i)));
 hero.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();go((busy?desired:index)+1);}if(e.key==='ArrowLeft'){e.preventDefault();go((busy?desired:index)-1);}});
 toggle.addEventListener('click',()=>setMotion(!enabled,true));autoplay.addEventListener('click',()=>{autoPaused=!autoPaused;if(!autoPaused){focusHeld=false;if(!enabled)setMotion(true,true);}syncUI();schedule();});
 hero.addEventListener('focusin',()=>{focusHeld=true;clearTimeout(sceneTimer);});hero.addEventListener('focusout',()=>{requestAnimationFrame(()=>{focusHeld=hero.contains(document.activeElement);schedule();});});
 let touch=null;hero.addEventListener('touchstart',e=>{touch={x:e.touches[0].clientX,y:e.touches[0].clientY};},{passive:true});hero.addEventListener('touchend',e=>{if(!touch)return;const dx=e.changedTouches[0].clientX-touch.x,dy=e.changedTouches[0].clientY-touch.y;if(Math.abs(dx)>65&&Math.abs(dx)>Math.abs(dy)*1.5)go(index+(dx<0?1:-1));touch=null;},{passive:true});
 const canvas=hero.querySelector('canvas'),ctx=canvas.getContext('2d');let w=0,h=0,stars=[],raf=0,lastTime=0;
 function resize(){const dpr=Math.min(devicePixelRatio||1,1.5);w=hero.clientWidth;h=hero.clientHeight;canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);stars=Array.from({length:Math.min(55,Math.round(w*h/7200))},()=>({x:Math.random()*w,y:Math.random()*h,r:Math.random()*1.15+.25,a:Math.random()*.42+.1,v:Math.random()*.065+.025}));cacheLayers();draw(false,1);}
 function draw(move,dt){ctx.clearRect(0,0,w,h);for(const p of stars){if(move){p.y-=p.v*dt;if(p.y<0)p.y=h;}ctx.fillStyle=`rgba(255,184,156,${p.a})`;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();}}
 function frame(now){raf=0;if(!enabled||!visible||document.hidden)return;const dt=lastTime?Math.min(50,now-lastTime):16;lastTime=now;const spring=1-Math.exp(-dt/150);pointer.x+=(pointer.targetX-pointer.x)*spring;pointer.y+=(pointer.targetY-pointer.y)*spring;
  activeLayers.forEach(el=>{const depth=Number(el.dataset.depth);el.style.setProperty('--pull-x',(pointer.x*depth*14).toFixed(2)+'px');el.style.setProperty('--pull-y',(pointer.y*depth*10).toFixed(2)+'px');});draw(true,dt/16.67);raf=requestAnimationFrame(frame);
 }
 function wake(){if(raf)cancelAnimationFrame(raf);raf=0;lastTime=0;if(enabled&&visible&&!document.hidden)raf=requestAnimationFrame(frame);else draw(false,1);}
 hero.addEventListener('pointermove',e=>{if(!fine.matches||e.pointerType==='touch')return;const r=hero.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;pointer.present=true;pointer.targetX=clamp((x/r.width-.5)*2,-1,1);pointer.targetY=clamp((y/r.height-.5)*2,-1,1);hero.classList.add('is-pointing');hero.style.setProperty('--cursor-x',x+'px');hero.style.setProperty('--cursor-y',y+'px');const heading=scenes[index].querySelector('.word04'),rect=heading.getBoundingClientRect();heading.style.setProperty('--word-x',(e.clientX-rect.left)+'px');heading.style.setProperty('--word-y',(e.clientY-rect.top)+'px');reactive.forEach(el=>{const b=el.getBoundingClientRect();const distance=Math.hypot(e.clientX-(b.left+b.width/2),e.clientY-(b.top+b.height/2));el.style.setProperty('--light-level',Math.max(0,1-distance/430).toFixed(3));});},{passive:true});
 hero.addEventListener('pointerleave',()=>{pointer.present=false;pointer.targetX=pointer.targetY=0;hero.classList.remove('is-pointing');reactive.forEach(el=>el.style.setProperty('--light-level','0'));});
 new IntersectionObserver(es=>{visible=es[0].isIntersecting;hero.classList.toggle('motion-suspended04',!visible);schedule();wake();},{threshold:.08}).observe(hero);
 document.addEventListener('visibilitychange',()=>{body.classList.toggle('page-inactive',document.hidden);schedule();wake();});window.addEventListener('resize',()=>{resize();wake();});
 reduced.addEventListener('change',()=>{if(!explicit)setMotion(!reduced.matches);});
 const sectionObserver=new IntersectionObserver(es=>es.forEach(e=>e.target.classList.toggle('in-view',e.isIntersecting)),{threshold:.12});document.querySelectorAll('.craft-section').forEach(section=>{sectionObserver.observe(section);section.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;const copy=section.querySelector('.craft-copy'),r=copy.getBoundingClientRect();copy.style.setProperty('--light-x',e.clientX-r.left+'px');copy.style.setProperty('--light-y',e.clientY-r.top+'px');},{passive:true});});
 const dropdown=document.querySelector('.nav-dropdown');if(dropdown){const button=dropdown.querySelector('button'),submenu=dropdown.querySelector('.nav-submenu');const close=()=>{submenu.hidden=true;button.setAttribute('aria-expanded','false');};button.addEventListener('click',()=>{submenu.hidden=!submenu.hidden;button.setAttribute('aria-expanded',String(!submenu.hidden));});document.addEventListener('click',e=>{if(!dropdown.contains(e.target))close();});document.addEventListener('keydown',e=>{if(e.key==='Escape')close();});}
 resize();setMotion(enabled);scenes.forEach(s=>{const img=s.querySelector('.mascot04');img.decode().catch(()=>{});});
})();
