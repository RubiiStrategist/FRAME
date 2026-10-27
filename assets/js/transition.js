(()=>{'use strict';
let busy=false;
const overlay=()=>document.getElementById('frameTransition');
const lock=v=>document.documentElement.classList.toggle('frame-transition-lock',v);
const path=url=>url.pathname.replace(/\/index\.html$/,'/');
const reveal=()=>{
 const el=overlay();if(!el)return;
 let arriving=false;try{arriving=sessionStorage.getItem('frame-cap-route')==='1';sessionStorage.removeItem('frame-cap-route')}catch{}
 if(arriving){el.classList.add('is-arriving');setTimeout(()=>{el.classList.remove('is-arriving');lock(false)},260)}
 else lock(false);
};
window.frameNavigate=(ev,href)=>{
 if(!href||href==='#'||(ev&&(ev.metaKey||ev.ctrlKey||ev.shiftKey||ev.altKey||ev.button>0)))return true;
 let url;try{url=new URL(href,location.href)}catch{return true}
 if(!['http:','https:','file:'].includes(url.protocol)||url.origin!==location.origin)return true;
 if(path(url)===path(new URL(location.href))&&url.search===location.search){
  if(ev)ev.preventDefault();
  if(url.hash){const target=document.getElementById(decodeURIComponent(url.hash.slice(1)));target?.scrollIntoView({behavior:'smooth'});history.replaceState(null,'',url.href)}
  else window.scrollTo({top:0,behavior:'smooth'});
  return false;
 }
 if(ev)ev.preventDefault();if(busy)return false;
 const el=overlay();if(!el){location.assign(url.href);return false}
 busy=true;lock(true);el.classList.remove('is-arriving');el.classList.add('is-closing');
 try{sessionStorage.setItem('frame-cap-route','1')}catch{}
 setTimeout(()=>location.assign(url.href),740);
 return false;
};
document.addEventListener('click',ev=>{
 const a=ev.target.closest?.('a[href]');
 if(!a||ev.defaultPrevented||a.hasAttribute('download')||a.matches('[data-contact]')||(a.target&&a.target!=='_self'))return;
 window.frameNavigate(ev,a.href);
});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',reveal,{once:true});else reveal();
addEventListener('pageshow',ev=>{if(ev.persisted){busy=false;overlay()?.classList.remove('is-closing','is-arriving');lock(false)}});
})();
