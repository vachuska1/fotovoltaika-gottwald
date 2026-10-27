'use client';
import {useEffect} from 'react';

// One observer, no scroll listeners, timers, polling or animation dependencies.
export default function Motion(){
 useEffect(()=>{
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const elements=[...document.querySelectorAll<HTMLElement>('.service-feature, .section-gallery .item, .section-image-left, .section-image-right')];
  let observer:IntersectionObserver|undefined;
  const clear=()=>{observer?.disconnect();elements.forEach(el=>{el.removeAttribute('data-motion');el.removeAttribute('data-entered');});};
  const setup=()=>{
   clear();if(reduced.matches||!('IntersectionObserver'in window))return;
   observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.setAttribute('data-entered','true');observer?.unobserve(entry.target);}},{threshold:.08,rootMargin:'0px 0px -24px 0px'});
   for(const el of elements){el.setAttribute('data-motion','ready');observer.observe(el);}
  };
  setup();reduced.addEventListener('change',setup);
  return()=>{clear();reduced.removeEventListener('change',setup);};
 },[]);
 return null;
}
