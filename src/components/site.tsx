import Motion from './motion';
import HeroGallery from './hero-gallery';
import ContactForm from './contact-form';
import RegionMap from './region-map';
import FloatingContact from './floating-contact';
import type {Site,Page,Section,Photo} from '@/lib/schema';
export function Picture({image,priority=false,preview=false}:{image:Photo;priority?:boolean;preview?:boolean}){
 const path=(src:string)=>preview?`/api/admin?media=${encodeURIComponent(src.split('/').pop()!)}`:src;
 return <picture>{image.mobile&&<source media="(max-width: 640px)" srcSet={path(image.mobile)}/>}<img src={path(image.src)} srcSet={image.small?`${path(image.small)} 640w, ${path(image.src)} 1600w`:undefined} sizes="(max-width: 760px) 100vw, 80vw" alt={image.alt} width={1600} height={1000} loading={priority?'eager':'lazy'} fetchPriority={priority?'high':'auto'} style={{objectPosition:`${image.x}% ${image.y}%`}}/></picture>;
}
export function SiteHeader({site}:{site:Site}){return <header className="site-header"><a href="/" className="brand" aria-label={site.name}><img className="brand-logo" src="/brand/gottsol-logo.svg" alt={site.name} width={188} height={48}/><span className="brand-subtitle">Gottwald Solutions</span></a><nav aria-label="Hlavní navigace" className="desktop-nav">{site.navigation.map(n=><a key={n.href} href={n.href}>{n.label}</a>)}</nav><details className="mobile-menu"><summary aria-label="Otevřít navigaci">☰</summary><nav>{site.navigation.map(n=><a key={n.href} href={n.href}>{n.label}</a>)}</nav></details></header>;}
export function SiteFooter({site}:{site:Site}){return <footer className="site-footer"><div className="footer-brand">{site.name}</div><div className="footer-grid"><p>{site.address}</p><div><a href={'mailto:'+site.email}>{site.email}</a><a href={'tel:'+site.phone.replaceAll(' ','')}>{site.phone}</a></div><nav>{site.navigation.map(n=><a key={n.href} href={n.href}>{n.label}</a>)}</nav></div><div className="footer-line"><span>{site.name}</span><a href="/slovnik-pojmu">Slovník pojmů</a><a href="/node/51">Návody</a><a className="footer-social" href="https://www.facebook.com/profile.php?id=100057269867006" target="_blank" rel="noopener noreferrer" aria-label="GottSol na Facebooku (otevře se v nové kartě)"><svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M13.5 22v-9h3l.5-3.5h-3.5V7.25c0-1.01.28-1.7 1.73-1.7H17V2.42A23.6 23.6 0 0 0 14.42 2C11.86 2 10 3.56 10 6.43V9.5H7V13h3v9z"/></svg></a></div></footer>;}
function Copy({text}:{text:string}){return <div className="copy">{text.split('\n\n').filter(Boolean).map((p,i)=><p key={i}>{p}</p>)}</div>;}
function Services({section,preview}:{section:Section;preview:boolean}){
 return <div className="service-showcase">{section.items.filter(item=>!item.hidden).map((item,i)=><article className="service-feature" key={i} data-reveal="service">
 {item.image&&<div className="service-photo">{item.href?<a href={item.href} tabIndex={-1} aria-hidden="true"><Picture image={item.image} preview={preview}/></a>:<Picture image={item.image} preview={preview}/>}</div>}
 <div className="service-description"><span className="service-number" aria-hidden="true">{String(i+1).padStart(2,'0')}</span><h3>{item.href?<a href={item.href}>{item.title}</a>:item.title}</h3><Copy text={item.text}/>{item.href&&<a className="service-link" href={item.href} aria-label={item.linkLabel?`${item.linkLabel}: ${item.title}`:undefined}>{item.linkLabel||item.title}</a>}</div>
 </article>)}</div>;
}
function Reviews({section}:{section:Section}){
 return <div className="review-collection">{section.items.filter(item=>!item.hidden).map((item,i)=><article className="review-card" key={i}>
 <span className="review-quotation" aria-hidden="true">“</span>
 <blockquote className="review-quote"><Copy text={item.text}/></blockquote>
 <footer className="review-footer">{item.title&&<cite className="review-author">{item.title}</cite>}{item.href&&<a className="review-source" href={item.href} target="_blank" rel="noopener noreferrer">{item.linkLabel||item.title}</a>}</footer>
 </article>)}</div>;
}
function Items({section,preview}:{section:Section;preview:boolean}){if(section.kind==='reviews')return <Reviews section={section}/>;if(section.kind==='services')return <Services section={section} preview={preview}/>;return <div className={`items ${section.kind}-items`}>{section.items.filter(i=>!i.hidden).map((item,i)=><article key={i} className="item">{item.image&&<div className="item-image"><Picture image={item.image} preview={preview}/></div>}<div className="item-body">{section.kind==='services'&&<span className="index">{String(i+1).padStart(2,'0')}</span>}{item.title&&<h3>{item.href&&section.kind!=='reviews'?<a href={item.href}>{item.title}</a>:item.title}</h3>}<Copy text={item.text}/>{item.href&&section.kind==='reviews'&&<a className="text-link" href={item.href} target="_blank" rel="noopener noreferrer">{item.linkLabel||item.title}</a>}</div></article>)}</div>;}
export function SectionView({section:s,preview=false,collectionHref}:{section:Section;preview?:boolean;collectionHref?:string}){
 if(!s.visible)return null;
 if(s.kind==='hero')return <section className="hero" id={s.id}><div className="hero-heading"><div className="hero-title-group"><h1>{s.title}</h1><nav className="hero-section-links" aria-label="Odkazy na sekce">{s.items.filter((item,i)=>i>0&&!item.image&&!item.hidden&&item.href).map(item=><a key={item.href} href={item.href}>{item.title}</a>)}</nav></div><div className="hero-bottom"><Copy text={s.text}/>{s.items[0]?.href&&<a className="action" href={s.items[0].href}>{s.items[0].title}</a>}</div></div>{s.image&&<HeroGallery primary={s.image} preview={preview} photos={s.items.filter(item=>!item.hidden&&item.image).map(item=>({title:item.title,image:item.image!}))}/>}</section>;
 return <section id={s.id} className={`section section-${s.kind}`}>
 {['image-left','image-right','cover'].includes(s.kind)&&s.image&&<div className="section-image"><Picture image={s.image} preview={preview}/></div>}
 <div className="section-copy">{s.title&&<h2>{s.title}</h2>}<Copy text={s.text}/></div>
 {s.kind==='table'&&s.rows.length>0&&<div className="table-scroll"><table><tbody>{s.rows.map((row,i)=><tr key={i}>{row.map((cell,j)=>i===0?<th scope="col" key={j}>{cell}</th>:<td key={j}>{cell}</td>)}</tr>)}</tbody></table></div>}
 {s.title==='Kde působíme?'?<RegionMap/>:s.items.length>0&&<Items section={s} preview={preview}/>}
 {s.kind==='editorial'&&s.image&&<div className="editorial-image"><Picture image={s.image} preview={preview}/></div>}
 {s.kind==='contact'&&<ContactForm id={s.id}/>}
 {collectionHref&&<a className="collection-link" href={collectionHref}>{s.kind==='reviews'?'Recenze':'Realizace'}</a>}
 </section>;
}
export function PageView({page,site,preview=false}:{page:Page;site:Site;preview?:boolean}){return <><Motion/><SiteHeader site={site}/><main id="main-content" className={page.path==='/'?'home':page.path==='/kontakty'?'inner-page contact-page':'inner-page'}>{page.sections[0]?.kind!=='hero'&&<div className="page-heading"><a className="eyebrow" href="/">GottSol</a><h1>{page.title}</h1></div>}{page.sections.map(s=><SectionView key={s.id} section={s} preview={preview} collectionHref={page.path==='/'?(s.kind==='reviews'?'/recenze':s.kind==='gallery'?'/realizace':undefined):undefined}/>)}</main><SiteFooter site={site}/><FloatingContact phone={site.phone} email={site.email} whatsapp="https://wa.me/420731406014"/></>;}
