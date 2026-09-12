'use client';
import {useEffect,useState,useRef} from 'react';
import {type Project,marketing} from '@/data/marketing';
import {studio} from '@/data/studio';
import {useMotion} from '@/hooks/useMotionPreference';
export default function SpatialHero({onChoose,onOpen}:{onChoose:(mode:string)=>void;onOpen:(project:Project,universe:string)=>void}){
 const motion=useMotion();const [scene,setScene]=useState(0);const section=useRef<HTMLElement>(null);
 useEffect(()=>{if(!motion)return;let visible=true;const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting},{threshold:.1});if(section.current)observer.observe(section.current);const timer=setInterval(()=>{if(visible&&!document.hidden&&!document.querySelector('[role="dialog"]'))setScene(s=>1-s)},8500);return()=>{clearInterval(timer);observer.disconnect()}},[motion,scene]);
 return <section ref={section} className="screen-hero" aria-label="FRAME — Marcas e eventos"><div className="screen-stage">
 <div className="screen-images" aria-hidden="true"><img className={scene===0?'is-current':''} src="/projects/studio/event.jpg" alt="" fetchPriority="high"/><img className={scene===1?'is-current':''} src="/projects/marketing/noir.jpg" alt="" decoding="async"/></div><div className="screen-gradient"/>
 <div className="screen-center"><p className="screen-eyebrow">ESTRATÉGIA. IMAGEM. EMOÇÃO.</p><h1><span>O próximo frame</span><span>pode ser <em>seu.</em></span></h1><p>Marcas que deixam uma impressão.<br/>Momentos que continuam vivos.</p><div className="screen-actions"><button onClick={()=>onChoose('marketing')}>Para minha marca <span>↗</span></button><button onClick={()=>onChoose('studio')}>Para meu evento <span>↗</span></button></div></div>
 <div className="screen-bottom"><a href="#experience" className="discover-work">Explore nosso olhar <span>↓</span></a><div className="scene-selector" aria-label="Cenas da abertura"><button aria-label="Mostrar cena de evento" aria-pressed={scene===0} onClick={()=>setScene(0)}>01 <i key={`event-${scene}`}/></button><button aria-label="Mostrar cena de campanha" aria-pressed={scene===1} onClick={()=>setScene(1)}>02 <i key={`brand-${scene}`}/></button></div><button className="scene-credit" onClick={()=>onOpen(scene===0?studio[2]:marketing[2],scene===0?'studio':'marketing')}>ESTUDO VISUAL / {scene===0?'EVENTOS':'CAMPANHA'} <span>↗</span></button></div>
 </div></section>;
}
