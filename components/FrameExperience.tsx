'use client';
import {useState,useRef,useEffect,useSyncExternalStore} from 'react';
import gsap from 'gsap';
import {Tabs,TabsList,TabsTrigger,TabsContent} from '@/components/ui/tabs';
import MarketingCarousel from '@/sections/MarketingCarousel';
import StudioExperience from '@/sections/StudioExperience';
import VideoPlayer from './VideoPlayer';
import EditorialSections from '@/sections/EditorialSections';
import SpatialHero from '@/sections/SpatialHero';
import Header from './Header';
import BrandLogo from './BrandLogo';
import CustomCursor from './CustomCursor';
import ProjectDetails from './ProjectDetails';
import {marketing,type Project} from '@/data/marketing';
import {studio} from '@/data/studio';
import {useFrameMotion} from '@/animations/useFrameMotion';
import {MotionContext,useSystemMotion} from '@/hooks/useMotionPreference';

function subscribeMotion(callback:()=>void){window.addEventListener('storage',callback);return()=>window.removeEventListener('storage',callback)}
function readMotion(){try{const value=localStorage.getItem('frame-motion');return value===null?null:value==='full'}catch{return null}}
export default function FrameExperience(){
 const systemMotion=useSystemMotion();
 const [override,setOverride]=useState<boolean|null>(null);
 const savedMotion=useSyncExternalStore(subscribeMotion,readMotion,()=>null);
 const motion=override??savedMotion??systemMotion;
 const [mode,setMode]=useState('overview');
 const [active,setActive]=useState(2);
 const [project,setProject]=useState<Project|null>(null);
 const [projectUniverse,setProjectUniverse]=useState('marketing');
 const root=useRef<HTMLDivElement>(null);
 const curtain=useRef<HTMLDivElement>(null);
 const gallery=useRef<HTMLDivElement>(null);
 const transition=useRef<gsap.core.Timeline|null>(null);
 const openedHere=useRef(false);
 useFrameMotion(root,mode,motion);
 useEffect(()=>{
  const sync=()=>{
   const [universe,id]=location.hash.slice(1).split('/');
   if(universe==='marketing'||universe==='studio'){
    transition.current?.kill();gsap.set(curtain.current,{visibility:'hidden'});
    setProjectUniverse(universe);
    if(!id||!openedHere.current)setMode(universe);
    if(!id)requestAnimationFrame(()=>requestAnimationFrame(()=>document.getElementById('experience')?.scrollIntoView({behavior:'instant'})));
    const collection=universe==='studio'?studio:marketing;
    setProject(collection.find(p=>p.id===id)??null);
    if(universe==='marketing'&&id){const index=marketing.findIndex(p=>p.id===id);if(index>=0)setActive(index)}
   }else{setProject(null);if(!universe||universe==='overview')setMode('overview')}
  };
  const initial=requestAnimationFrame(sync);window.addEventListener('hashchange',sync);
  return()=>{cancelAnimationFrame(initial);window.removeEventListener('hashchange',sync);transition.current?.kill()};
 },[]);
 useEffect(()=>{document.documentElement.dataset.frameMotion=motion?'full':'reduced';return()=>{delete document.documentElement.dataset.frameMotion}},[motion]);
 function toggleMotion(){const next=!motion;setOverride(next);try{localStorage.setItem('frame-motion',next?'full':'reduced')}catch{}}
 function switchMode(next:string){
  const commit=()=>{
   setMode(next);setProject(null);history.replaceState(null,'',`#${next}`);
   requestAnimationFrame(()=>requestAnimationFrame(()=>document.getElementById('experience')?.scrollIntoView({behavior:'instant'})));
  };
  transition.current?.kill();
  if(!motion||next===mode){gsap.set(gallery.current,{opacity:1,y:0});commit();return}
  transition.current=gsap.timeline()
   .to(gallery.current,{opacity:0,y:10,duration:.12,ease:'power2.in'})
   .call(commit)
   .to(gallery.current,{opacity:1,y:0,duration:.3,ease:'power2.out'},'+=.05');
 }
 function openProject(p:Project,universe=mode){openedHere.current=true;setProjectUniverse(universe);setProject(p);history.pushState(null,'',`#${universe}/${p.id}`)}
 function closeProject(){setProject(null);if(openedHere.current){openedHere.current=false;history.back()}else{history.replaceState(null,'',`#${mode}`);requestAnimationFrame(()=>document.getElementById('experience')?.scrollIntoView({behavior:'instant'}))}}
 function nextProject(){const collection=projectUniverse==='studio'?studio:marketing;const index=collection.findIndex(p=>p.id===project?.id);const next=collection[(index+1)%collection.length];setProject(next);if(projectUniverse==='marketing')setActive((index+1)%collection.length);history.replaceState(null,'',`#${projectUniverse}/${next.id}`)}
 return <MotionContext value={motion}><div ref={root} className={`frame-site ${mode}`}>
 <a className="skip" href="#experience">Pular para os projetos</a>
 <Header onMode={switchMode}/><CustomCursor/>
 {!project&&<button className={`experience-toggle ${motion?'is-on':''}`} onClick={toggleMotion} aria-pressed={motion}><i/>{motion?'MOVIMENTO ATIVO — PAUSAR':'ATIVAR MOVIMENTO'}<span>{motion?'Ⅱ':'↗'}</span></button>}
 <div ref={curtain} className="universe-curtain" aria-hidden="true"><span>FRAME<i/></span></div>
 <main><Tabs value={mode} onValueChange={switchMode}>
 <SpatialHero onChoose={switchMode} onOpen={openProject}/>
 <section className="work-heading"><span className="eyebrow">01 / NOSSO OLHAR</span><h2>Não basta aparecer.<br/><em>É preciso ficar.</em></h2></section>
 <div className="universe-bar" id="experience"><span>ESCOLHA SEU UNIVERSO</span><TabsList className="universe-tabs"><TabsTrigger value="overview">Todos</TabsTrigger><TabsTrigger value="marketing">Marcas</TabsTrigger><TabsTrigger value="studio">Eventos</TabsTrigger></TabsList><span>MARKETING + STUDIO</span></div>
 <div ref={gallery} className="work-surface">
 <TabsContent value="overview"><section className="selected-grid" aria-label="Projetos em destaque">{[{p:marketing[2],universe:'marketing',label:'CAMPANHA / DIREÇÃO DE ARTE'},{p:studio[2],universe:'studio',label:'EVENTOS / COBERTURA'},{p:marketing[0],universe:'marketing',label:'MARCA / IDENTIDADE'},{p:studio[1],universe:'studio',label:'STUDIO / FOTOGRAFIA'}].map(({p,universe,label},i)=><button className="selected-project" key={p.id} onClick={()=>openProject(p,universe)} data-cursor="VER"><div className="selected-media"><VideoPlayer src={p.video} poster={p.thumbnail} alt={p.title}/><span className="project-open">↗</span><span className="project-number">0{i+1}</span></div><div className="selected-caption"><h3>{p.title}</h3><span>{label}</span></div></button>)}</section><p className="selection-note">Estudos conceituais com imagens de referência. Explore a direção criativa de cada projeto.</p></TabsContent>
 <TabsContent value="marketing"><MarketingCarousel active={active} onActive={setActive} onOpen={openProject}/></TabsContent>
 <TabsContent value="studio"><StudioExperience onOpen={openProject}/></TabsContent>
 </div>
 </Tabs><EditorialSections/></main>
 <footer><a href="#" className="logo" aria-label="FRAME início"><BrandLogo/></a><span>© 2026 FRAME</span><span>SÃO PAULO ↗ BRASIL</span></footer>
 <ProjectDetails project={project} universe={projectUniverse==='studio'?'Studio':'Marketing'} onClose={closeProject} onNext={nextProject}/>
 </div></MotionContext>;
}
