import {notFound} from 'next/navigation';
import {englishSite} from '@/lib/english';
import {localHref} from '@/lib/locale';
import {PageView} from '@/components/site';
import ServicePage from '@/components/service-pages';
export const dynamic='force-static';
export const dynamicParams=false;
export function generateStaticParams(){return englishSite.pages.map(p=>({slug:p.path==='/'?[]:p.path.slice(1).split('/')}));}
export async function generateMetadata({params}:{params:Promise<{slug?:string[]}>}){const {slug=[]}=await params;const path='/'+slug.join('/'),page=englishSite.pages.find(p=>p.path===path),base=process.env.SITE_URL||'https://www.fotovoltaika-gottwald.cz';return {title:page?.title,description:page?.description,alternates:{canonical:base+localHref(path,'en'),languages:{cs:base+path,en:base+localHref(path,'en'),'x-default':base+path}}};}
export default async function EnglishPage({params}:{params:Promise<{slug?:string[]}>}){const {slug=[]}=await params;const page=englishSite.pages.find(p=>p.path==='/'+slug.join('/'));if(!page)notFound();return page.path==='/'?<PageView page={page} site={englishSite} locale="en"/>:<ServicePage page={page} site={englishSite} locale="en"/>;}
