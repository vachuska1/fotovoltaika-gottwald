import type {Metadata} from 'next';
import {site} from '@/lib/content';
import {SiteHeader,SiteFooter} from '@/components/site';
import FloatingContact from '@/components/floating-contact';
import GlossaryNavigation from './navigation';
import data from '../../../content/glossary.json';
import styles from './glossary.module.css';
const original=site.pages.find(p=>p.path==='/slovnik-pojmu')!;
export const dynamic='force-static';
export const metadata:Metadata={title:original.title,description:original.description,alternates:{canonical:(process.env.SITE_URL||'https://www.fotovoltaika-gottwald.cz')+'/slovnik-pojmu'}};
const letterId=(letter:string)=>'slovnik-filtr-'+letter.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export default function GlossaryPage(){return <><SiteHeader site={site}/><main id="main-content" className={styles.page}><header className="page-heading unified-page-heading"><a href="/" className="eyebrow">Gottwald Solutions</a><h1>{original.title}</h1></header><div className={styles.content}>
 <fieldset className={styles.filters}><legend className={styles.screenReader}>Filtrovat pojmy podle prvního písmene</legend><label className={styles.filter}><input id="glossary-all" type="radio" name="glossary-letter" value="all" defaultChecked/><span>Vše</span></label>{data.letters.map(letter=><label className={styles.filter} key={letter}><input id={letterId(letter)} type="radio" name="glossary-letter" value={letter}/><span>{letter}</span></label>)}</fieldset>
 <div className={styles.definitions}>{data.terms.map(term=><details className={styles.entry} id={term.id} data-letter={term.letter} key={term.id}><summary><h2>{term.title}</h2></summary><div className={styles.definition} dangerouslySetInnerHTML={{__html:term.html}}/></details>)}</div>
 </div><GlossaryNavigation/></main><SiteFooter site={site}/><FloatingContact phone={site.phone} email={site.email} whatsapp="https://wa.me/420731406014"/></>;}
