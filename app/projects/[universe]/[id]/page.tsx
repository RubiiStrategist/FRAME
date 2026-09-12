import {notFound} from 'next/navigation';
import type {Metadata} from 'next';
import CasePage from '@/components/CasePage';
import {marketing} from '@/data/marketing';
import {studio} from '@/data/studio';
type Props={params:Promise<{universe:string;id:string}>};
function findProject(universe:string,id:string){return (universe==='marketing'?marketing:universe==='studio'?studio:[]).find(p=>p.id===id)}
export async function generateMetadata({params}:Props):Promise<Metadata>{
 const {universe,id}=await params;const project=findProject(universe,id);
 if(!project)return {title:'Projeto não encontrado — FRAME'};
 const title=`${project.title} — FRAME ${universe==='studio'?'Studio':'Marketing'}`;
 return {title,description:project.description,openGraph:{title,description:project.description,type:'article',locale:'pt_BR'}};
}
export default async function Page({params}:Props){
 const {universe,id}=await params;const project=findProject(universe,id);if(!project)notFound();
 return <CasePage project={project} universe={universe}/>;
}
