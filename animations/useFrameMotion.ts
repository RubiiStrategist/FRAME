'use client';
import {useEffect,type RefObject} from 'react';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
export function useFrameMotion(root:RefObject<HTMLDivElement|null>,mode:string,motion:boolean){
 useEffect(()=>{if(!motion)return;gsap.registerPlugin(ScrollTrigger);
 const ctx=gsap.context(()=>{
  if(scrollY<80)gsap.timeline({defaults:{ease:'power3.out'}}).fromTo('.screen-stage',{clipPath:'inset(12% 9% round 100px)'},{clipPath:'inset(0% 0% round 0px)',duration:1.5},0).from('.screen-center h1>span',{yPercent:55,opacity:0,stagger:.13,duration:1.2},.2).from('.screen-eyebrow,.screen-center>p,.screen-actions,.screen-bottom',{opacity:0,y:15,stagger:.08,duration:.9},.6);
  gsap.to('.screen-stage',{scale:.93,borderRadius:'0 0 80px 80px',ease:'none',scrollTrigger:{trigger:'.screen-hero',start:'top top',end:'bottom top',scrub:1}});
  gsap.to('.screen-center',{y:80,opacity:.1,ease:'none',scrollTrigger:{trigger:'.screen-hero',start:'20% top',end:'bottom top',scrub:1}});
  gsap.utils.toArray<HTMLElement>('.selected-media,.studio-image').forEach(el=>{
   gsap.fromTo(el,{clipPath:'inset(10% 0% 0% round 50px)'},{clipPath:'inset(0% 0% 0% round 20px)',ease:'none',scrollTrigger:{trigger:el,start:'top 95%',end:'top 40%',scrub:.65}});
   const image=el.querySelector('img,video');if(image)gsap.fromTo(image,{yPercent:-5,scale:1.13},{yPercent:5,scale:1.03,ease:'none',scrollTrigger:{trigger:el,start:'top bottom',end:'bottom top',scrub:1}});
  });
  gsap.utils.toArray<HTMLElement>('.work-heading h2,.service-heading h2,.manifesto-title,.contact-heading').forEach(el=>gsap.fromTo(el,{y:45,opacity:.2},{y:0,opacity:1,ease:'none',scrollTrigger:{trigger:el,start:'top 95%',end:'top 55%',scrub:.7}}));
  gsap.utils.toArray<HTMLElement>('.service-poster').forEach((el,i)=>{gsap.fromTo(el,{y:i?65:25,rotate:i?2:-2},{y:0,rotate:0,ease:'none',scrollTrigger:{trigger:el,start:'top 95%',end:'top 25%',scrub:1}});const image=el.querySelector('img');gsap.fromTo(image,{scale:1.15},{scale:1,ease:'none',scrollTrigger:{trigger:el,start:'top bottom',end:'bottom top',scrub:1}})});
  gsap.from('.process-step',{y:30,opacity:0,duration:.8,stagger:.16,scrollTrigger:{trigger:'.process-grid',start:'top 85%'}});
  gsap.fromTo('.closing-image',{scale:1.15,yPercent:-8},{scale:1,yPercent:5,ease:'none',scrollTrigger:{trigger:'.closing-scene',start:'top bottom',end:'bottom top',scrub:1}});
 },root);const refresh=requestAnimationFrame(()=>ScrollTrigger.refresh());const current=root.current;const onToggle=()=>ScrollTrigger.refresh();current?.addEventListener('toggle',onToggle,true);return()=>{cancelAnimationFrame(refresh);current?.removeEventListener('toggle',onToggle,true);ctx.revert()};
 },[root,mode,motion]);
}
