'use client';
import {useEffect,useRef,useState} from 'react';
import {useMotion} from '@/hooks/useMotionPreference';
export default function VideoPlayer({src,poster,alt,active=true,controls=false}:{src?:string;poster:string;alt:string;active?:boolean;controls?:boolean}){
 const motion=useMotion();const ref=useRef<HTMLVideoElement>(null);const [failed,setFailed]=useState(false);
 useEffect(()=>{const el=ref.current;if(!el||!src)return;
  if(controls)return;
  let visible=false;
  const sync=()=>{if(visible&&active&&motion&&!document.hidden&&!document.querySelector('[role="dialog"]')){void el.play().catch(()=>{})}else el.pause()};
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync()},{threshold:.15});
  const dialogs=new MutationObserver(sync);dialogs.observe(document.body,{childList:true,subtree:true});
  observer.observe(el);document.addEventListener('visibilitychange',sync);
  return()=>{observer.disconnect();dialogs.disconnect();document.removeEventListener('visibilitychange',sync);el.pause()};
 },[active,src,motion,controls]);
 if(!src||failed||(!controls&&!motion))return <img src={poster} alt={alt} loading={active?'eager':'lazy'} draggable={false}/>;
 return <video ref={ref} src={src} poster={poster} aria-label={alt} muted={!controls} loop={!controls} playsInline preload={controls?'metadata':'none'} controls={controls} onCanPlay={e=>{const el=e.currentTarget;const rect=el.getBoundingClientRect();if(!controls&&active&&rect.bottom>0&&rect.top<innerHeight&&motion&&!document.hidden&&!document.querySelector('[role="dialog"]'))void el.play().catch(()=>{})}} onError={()=>setFailed(true)}/>;
}
