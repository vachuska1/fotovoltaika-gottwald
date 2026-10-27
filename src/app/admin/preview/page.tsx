import {redirect} from 'next/navigation';
import {requireAdmin} from '@/lib/guard';
import {getState} from '@/lib/github';
import {PageView} from '@/components/site';
export const dynamic='force-dynamic';
export const metadata={title:'Náhled konceptu',robots:{index:false,follow:false}};
export default async function Preview({searchParams}:{searchParams:Promise<{path?:string}>}){try{await requireAdmin();}catch{redirect('/admin');}const {site}=await getState();const {path}=await searchParams;const page=site.pages.find(p=>p.path===(path||'/'));if(!page)return <p>Stránka neexistuje.</p>;return <><div style={{background:'#dce5c5',padding:16,textAlign:'center'}}>Náhled uloženého konceptu · <a href="/admin">Zpět do administrace</a></div><PageView page={page} site={site} preview/></>;}
