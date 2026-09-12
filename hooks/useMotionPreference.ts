'use client';
import {createContext,useContext,useSyncExternalStore} from 'react';
export const MotionContext=createContext(false);
export const useMotion=()=>useContext(MotionContext);
function subscribe(callback:()=>void){const query=matchMedia('(prefers-reduced-motion: reduce)');query.addEventListener('change',callback);return()=>query.removeEventListener('change',callback)}
export function useSystemMotion(){return useSyncExternalStore(subscribe,()=>!matchMedia('(prefers-reduced-motion: reduce)').matches,()=>false)}
