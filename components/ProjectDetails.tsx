'use client';
import {Fragment,useEffect,useRef,useState} from 'react';
import gsap from 'gsap';
import {Dialog,DialogClose,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import VideoPlayer from './VideoPlayer';
import ProjectBrief from './ProjectBrief';
import {useMotion} from '@/hooks/useMotionPreference';
import {caseStories} from '@/data/caseStories';
import {contact} from '@/data/config';
import type {Project} from '@/data/marketing';
export default function ProjectDetails({project,onClose,onNext,universe,standalone=false}:{project:Project|null;onClose:()=>void;onNext:()=>void;universe:string;standalone?:boolean}){
 const motion=useMotion();const panel=useRef<HTMLDivElement>(null);const [copied,setCopied]=useState(false);const [copyError,setCopyError]=useState(false);
 useEffect(()=>{if(!project)return;const el=panel.current;if(!el)return;el.scrollTop=0;if(!motion)return;const ctx=gsap.context(()=>{gsap.fromTo('.case-reveal',{clipPath:'ellipse(36% 24% at 50% 50%)',scale:.94},{clipPath:'ellipse(100% 100% at 50% 50%)',scale:1,duration:1.1,ease:'expo.out'});gsap.fromTo('.case-story',{y:25,opacity:0},{y:0,opacity:1,duration:.7,delay:.2})},el);return()=>ctx.revert()},[project,motion]);
 useEffect(()=>{setCopied(false);setCopyError(false)},[project?.id]);
 useEffect(()=>{if(!copied)return;const timer=setTimeout(()=>setCopied(false),2200);return()=>clearTimeout(timer)},[copied]);
 const story=project?caseStories[project.id]:null;
 async function share(){setCopyError(false);try{await navigator.clipboard.writeText(new URL(`/projects/${universe.toLowerCase()}/${project?.id}`,location.origin).href);setCopied(true)}catch{setCopied(false);setCopyError(true)}}
 const content=project&&<div key={project.id}>
 {copyError&&<div className="copy-fallback" role="status"><p>Não foi possível copiar automaticamente. Selecione o endereço abaixo:</p><input aria-label="Link do projeto" readOnly value={typeof location!=='undefined'?new URL(`/projects/${universe.toLowerCase()}/${project.id}`,location.origin).href:''} onFocus={e=>e.currentTarget.select()}/></div>}<div className="case-topline"><span>FRAME {universe.toUpperCase()} / {project.year}</span><button onClick={share}>{copied?'LINK COPIADO ✓':'COPIAR LINK ↗'}</button></div>
 <h1 className="project-title">{project.title}</h1>{!standalone&&<DialogTitle className="sr-only">{project.title}</DialogTitle>}
 <div className="project-media case-reveal"><VideoPlayer key={project.id} src={project.video} poster={project.thumbnail} alt={project.title} controls/></div>
 <div className="case-story"><div className="case-summary"><div><span className="case-label">{story?.eyebrow??project.category}</span><h2>{story?.headline??project.description}</h2></div><dl><div><dt>CONCEITO</dt><dd>{project.client}</dd></div><div><dt>DISCIPLINAS</dt><dd>{project.services.join(' · ')}</dd></div></dl></div>
 <p className="case-disclaimer">Estudo demonstrativo com imagens de referência. Sem vínculo comercial com as marcas conceituais.</p>{!standalone&&<DialogDescription className="sr-only">Conceito, direção visual e referências do projeto.</DialogDescription>}
 <div className="case-chapters">{(story?.chapters??[{title:universe==='Studio'?'O olhar':'O conceito',text:project.description},{title:'Sobre este estudo',text:'Exploração de direção visual com materiais de referência. Este projeto não representa uma produção contratada nem apresenta resultados de campanha.'}]).map((chapter,i)=><Fragment key={chapter.title}><section><span>{String(i+1).padStart(2,'0')}</span><div><h3>{chapter.title}</h3><p>{chapter.text}</p></div></section>{i===1&&story&&<figure className="case-comparison"><div><img src={project.thumbnail} alt="Referência com enquadramento amplo" loading="lazy"/><span>01 / CONTEXTO</span></div><div><img src={project.thumbnail} alt="Recorte aproximado da mesma referência" loading="lazy"/><span>02 / APROXIMAÇÃO</span></div><figcaption>{project.id==='noite'?'O plano aberto mostra a escala do evento; o recorte aproxima o público e a luz.':universe==='Studio'?'O plano aberto apresenta o espaço; o recorte aproxima matéria e luz.':'A mesma referência em duas escalas: contexto para apresentar a personagem, aproximação para destacar sua expressão.'} Comparação de recortes da fotografia de referência.</figcaption></figure>}</Fragment>)}</div>
 <div className="case-credits"><span>CRÉDITOS DAS REFERÊNCIAS</span><p>{project.id==='noite'?'Fotografia: Wendy Wei / Pexels.':project.thumbnail.includes('desert')?'Fotografia: Unsplash.':'Fotografia: Pexels.'} Direção do estudo: FRAME.<br/>Material demonstrativo — substituição por acervo autoral pendente.</p></div>
 <div className="case-ending"><div><span>UMA NOVA PERSPECTIVA COMEÇA AQUI.</span><h2>{universe==='Studio'?'Qual história vamos contar?':'O que sua marca quer dizer?'}</h2>{contact.email?<a href={`mailto:${contact.email}?subject=${encodeURIComponent(`Projeto ${universe} — referência: ${project.title}`)}`}>Conversar com a FRAME ↗</a>:contact.whatsapp?<a href={contact.whatsapp}>Conversar com a FRAME ↗</a>:<ProjectBrief initial={universe==='Studio'?'studio':'marketing'} label={universe==='Studio'?'Planejar minha cobertura':'Planejar minha campanha'}/>}</div><button className="next-case" onClick={onNext}><small>CONTINUE EXPLORANDO</small><strong>Próximo<br/><em>frame.</em> ↗</strong></button></div>
 </div></div>;
 if(standalone)return <main ref={panel} className="project-modal immersive-case standalone-case"><button className="modal-close" onClick={onClose} aria-label="Voltar aos projetos">×</button>{content}</main>;
 return <Dialog open={!!project} onOpenChange={open=>{if(!open)onClose()}}><DialogContent ref={panel} className="project-modal immersive-case" showCloseButton={false}><DialogClose className="modal-close" aria-label="Fechar projeto">×</DialogClose>{content}</DialogContent></Dialog>;
}
