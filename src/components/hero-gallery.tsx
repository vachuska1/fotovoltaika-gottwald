'use client';
import {useRef,useState} from 'react';
import type {Photo} from '@/lib/schema';
type Slide={title:string;image:Photo;href?:string};
export default function HeroGallery({primary,photos,preview=false,label='Fotografie realizací',priority=true}:{primary:Photo;photos:Slide[];preview?:boolean;label?:string;priority?:boolean}){
 const slides:Slide[]=[{title:photos.find(p=>p.image.src===primary.src)?.title||primary.alt,image:primary,href:photos.find(p=>p.image.src===primary.src)?.href},...photos.filter(p=>p.image.src!==primary.src)];
 const unique=slides.filter((slide,i)=>slides.findIndex(s=>s.image.src===slide.image.src)===i).slice(0,6);
 const [selected,setSelected]=useState(0);const [shown,setShown]=useState(0);const [visited,setVisited]=useState<number[]>([0]);
 const requested=useRef(0);const loaded=useRef(new Set([0]));
 const path=(src:string)=>preview?`/api/admin?media=${encodeURIComponent(src.split('/').pop()!)}`:src;
 function choose(index:number){requested.current=index;setSelected(index);if(loaded.current.has(index))setShown(index);setVisited(current=>current.includes(index)?current:[...current,index]);}
 return <div className="hero-gallery" role="group" aria-label={label}>
 <div className="hero-image hero-gallery-stage" aria-busy={selected!==shown}>{unique.map((slide,i)=>visited.includes(i)&&<picture className={i===shown?'hero-slide is-current':'hero-slide'} key={slide.image.src} aria-hidden={i!==shown}>
 {slide.image.mobile&&<source media="(max-width:640px)" srcSet={path(slide.image.mobile)}/>}
 <img src={path(slide.image.src)} srcSet={slide.image.small?`${path(slide.image.small)} 640w, ${path(slide.image.src)} 1600w`:undefined} sizes="92vw" width={1600} height={1000} alt={slide.image.alt||slide.title} loading={i===0&&!priority?'lazy':'eager'} fetchPriority={i===0&&priority?'high':'auto'} onLoad={()=>{loaded.current.add(i);if(requested.current===i)setShown(i);}} onError={()=>{if(requested.current===i){requested.current=shown;setSelected(shown);}}} style={{objectPosition:`${slide.image.x}% ${slide.image.y}%`}}/>
 </picture>)}</div>
 <div className="hero-gallery-controls"><div className="hero-gallery-caption" aria-live="polite" aria-atomic="true"><span className="hero-gallery-count">{String(shown+1).padStart(2,'0')}<span> / {String(unique.length).padStart(2,'0')}</span></span><span className="hero-gallery-place">{unique[shown].href?<a href={unique[shown].href}>{unique[shown].title}</a>:unique[shown].title}</span></div>
 {unique.length>1&&<div className="hero-thumbnails" aria-label="Vybrat fotografii">{unique.map((slide,i)=><button type="button" key={slide.image.src} aria-label={`Zobrazit fotografii: ${slide.title}`} aria-pressed={selected===i} className={selected===i?'hero-thumbnail is-selected':'hero-thumbnail'} onClick={()=>choose(i)} onKeyDown={event=>{let next:number|undefined;if(event.key==='ArrowRight')next=(i+1)%unique.length;if(event.key==='ArrowLeft')next=(i-1+unique.length)%unique.length;if(event.key==='Home')next=0;if(event.key==='End')next=unique.length-1;if(next!==undefined){event.preventDefault();choose(next);(event.currentTarget.parentElement?.children[next] as HTMLButtonElement)?.focus();}}}><span className="hero-thumbnail-image"><img src={path(slide.image.small||slide.image.src)} alt="" width={160} height={100} loading="lazy" style={{objectPosition:`${slide.image.x}% ${slide.image.y}%`}}/></span><span className="hero-thumbnail-title">{slide.title}</span></button>)}</div>}
 </div></div>;
}
