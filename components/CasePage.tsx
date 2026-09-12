'use client';
import {useSyncExternalStore,useEffect} from 'react';
import ProjectDetails from './ProjectDetails';
import {marketing,type Project} from '@/data/marketing';
import {studio} from '@/data/studio';
import {MotionContext,useSystemMotion} from '@/hooks/useMotionPreference';
function subscribe(callback:()=>void){window.addEventListener('storage',callback);return()=>window.removeEventListener('storage',callback)}
function read(){try{const v=localStorage.getItem('frame-motion');return v===null?null:v==='full'}catch{return null}}
export default function CasePage({project,universe}:{project:Project;universe:string}){
 const system=useSystemMotion();const saved=useSyncExternalStore(subscribe,read,()=>null);const motion=saved??system;
 useEffect(()=>{document.documentElement.dataset.frameMotion=motion?'full':'reduced';return()=>{delete document.documentElement.dataset.frameMotion}},[motion]);
 const collection=universe==='studio'?studio:marketing;
 const next=collection[(collection.findIndex(p=>p.id===project.id)+1)%collection.length];
 return <MotionContext value={motion}><ProjectDetails standalone project={project} universe={universe==='studio'?'Studio':'Marketing'} onClose={()=>{location.href=`/#${universe}`}} onNext={()=>{location.href=`/projects/${universe}/${next.id}`}}/></MotionContext>;
}
