'use client';
import {useEffect,useRef,useState,type CSSProperties} from 'react';
import gsap from 'gsap';
import {marketing,type Project} from '@/data/marketing';
import VideoPlayer from '@/components/VideoPlayer';
import {useMotion} from '@/hooks/useMotionPreference';

export default function MarketingCarousel({active,onActive,onOpen}:{active:number;onActive:(index:number)=>void;onOpen:(project:Project)=>void}){
 const motion=useMotion();const [playing,setPlaying]=useState(true);
 const carousel=useRef<HTMLDivElement>(null);
 const position=useRef({value:active});
 const pointer=useRef({id:-1,x:0,y:0,lastX:0,time:0,velocity:0,start:0,dragged:false});
 const wheelTime=useRef(0);
 const clamp=(value:number)=>Math.max(0,Math.min(marketing.length-1,value));
 function draw(){carousel.current?.querySelectorAll<HTMLElement>('.film-card').forEach((el,i)=>{const offset=i-position.current.value;el.style.setProperty('--offset',String(offset));el.style.setProperty('--distance',String(Math.abs(offset)))})}
 function settle(index:number){gsap.to(position.current,{value:index,duration:motion?.85:0,ease:'power3.out',overwrite:true,onUpdate:draw});onActive(index)}
 useEffect(()=>{
  const current=position.current;
  const tween=gsap.to(current,{value:active,duration:motion?.85:0,ease:'power3.out',overwrite:true,onUpdate:()=>{carousel.current?.querySelectorAll<HTMLElement>('.film-card').forEach((el,i)=>{el.style.setProperty('--offset',String(i-current.value));el.style.setProperty('--distance',String(Math.abs(i-current.value)))})}});
  return()=>{tween.kill()};
 },[active,motion]);
 useEffect(()=>{const el=carousel.current;if(!el)return;
  const wheel=(e:WheelEvent)=>{if(e.ctrlKey||(!e.shiftKey&&Math.abs(e.deltaY)>=Math.abs(e.deltaX)))return;const delta=e.shiftKey?e.deltaY:e.deltaX;const next=clamp(active+Math.sign(delta));if(next===active)return;e.preventDefault();if(Math.abs(delta)>8&&Date.now()-wheelTime.current>500){wheelTime.current=Date.now();onActive(next)}};
  el.addEventListener('wheel',wheel,{passive:false});return()=>el.removeEventListener('wheel',wheel);
 },[active,onActive]);
 return <section className="marketing-section"><div className="section-meta"><span>FRAME MARKETING / SELECTED WORK</span><button className="motion-toggle" onClick={()=>setPlaying(p=>!p)} aria-pressed={!playing}>{playing?'PAUSAR VÍDEOS Ⅱ':'REPRODUZIR ▷'}</button></div>
 <h2 className="gallery-heading"><span>Marcas em</span> <em>movimento.</em><small>01 — {String(marketing.length).padStart(2,'0')}</small></h2><div className="gallery-ghost" aria-hidden="true">UNFRAMED</div>
 <div className="carousel-camera"><div className="carousel kinetic-carousel" ref={carousel} role="region" aria-roledescription="carrossel" aria-label="Projetos de Marketing" tabIndex={0} data-cursor="DRAG"
 onKeyDown={e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();settle(clamp(active+(e.key==='ArrowRight'?1:-1)))}}}
 onPointerDown={e=>{if(e.button!==0)return;gsap.killTweensOf(position.current);pointer.current={id:e.pointerId,x:e.clientX,y:e.clientY,lastX:e.clientX,time:e.timeStamp,velocity:0,start:position.current.value,dragged:false}}}
 onPointerMove={e=>{const p=pointer.current;if(p.id!==e.pointerId)return;const dx=e.clientX-p.x;const dy=e.clientY-p.y;if(!p.dragged&&Math.abs(dx)>8&&Math.abs(dx)>Math.abs(dy)){p.dragged=true;e.currentTarget.setPointerCapture(e.pointerId)}if(!p.dragged)return;const now=e.timeStamp;p.velocity=(e.clientX-p.lastX)/Math.max(1,now-p.time);p.lastX=e.clientX;p.time=now;const step=innerWidth<768?270:320;const raw=p.start-dx/step;position.current.value=raw<0?raw*.2:raw>marketing.length-1?marketing.length-1+(raw-marketing.length+1)*.2:raw;draw()}}
 onPointerUp={e=>{const p=pointer.current;if(p.id!==e.pointerId)return;p.id=-1;if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);if(p.dragged){const velocity=e.timeStamp-p.time<100?p.velocity:0;settle(clamp(Math.round(position.current.value-velocity*.28)))}}}
 onPointerCancel={e=>{pointer.current.id=-1;pointer.current.dragged=false;if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);settle(active)}}>
 <span className="vertical-label">ARRASTE PARA EXPLORAR</span>{marketing.map((p,i)=>{const offset=i-active;return <button key={p.id} className={`film-card ${i===active?'selected':''}`} style={{'--offset':offset,'--distance':Math.abs(offset)} as CSSProperties} onClick={e=>{if(pointer.current.dragged&&e.detail!==0){pointer.current.dragged=false;return}if(i===active)onOpen(p);else settle(i)}} aria-label={`${i===active?'Abrir':'Selecionar'} ${p.client}`} tabIndex={Math.abs(offset)<2?0:-1} data-cursor={i===active?'VIEW':'OPEN'}><VideoPlayer src={p.video} poster={p.thumbnail} alt={p.title} active={i===active&&playing&&motion}/><span className="film-top">{p.category}<span>↗</span></span><span className="film-bottom"><small>{p.client}</small><strong>{p.title}</strong></span>{i===active&&<span className="view-project">VER PROJETO ↗</span>}</button>})}
 </div></div><div className="carousel-caption"><span className="case-current" aria-live="polite"><i/> {marketing[active].client}<small>{marketing[active].category} / {marketing[active].year}</small></span><div className="carousel-controls"><button disabled={active===0} onClick={()=>settle(active-1)} aria-label="Projeto anterior">←</button><span>{String(active+1).padStart(2,'0')} <em>/ {String(marketing.length).padStart(2,'0')}</em></span><button disabled={active===marketing.length-1} onClick={()=>settle(active+1)} aria-label="Próximo projeto">→</button></div><span className="drag-label">ARRASTE PARA DESCOBRIR ↔</span></div><p className="demo-note">SELEÇÃO CONCEITUAL — PROJETOS DEMONSTRATIVOS</p></section>;
}
