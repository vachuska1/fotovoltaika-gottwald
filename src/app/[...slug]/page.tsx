import {notFound} from 'next/navigation';
import {site} from '@/lib/content';
import {PageView} from '@/components/site';
export const dynamic='force-static';
export const dynamicParams=false;
export function generateStaticParams(){return site.pages.filter(p=>p.path!=='/').map(p=>({slug:p.path.slice(1).split('/')}));}
export async function generateMetadata({params}:{params:Promise<{slug:string[]}>}){const {slug}=await params;const page=site.pages.find(p=>p.path==='/'+decodeURIComponent(slug.join('/')));return {title:page?.title,description:page?.description,alternates:{canonical:(process.env.SITE_URL||'https://www.fotovoltaika-gottwald.cz')+(page?.path||'/')}};}
export default async function ContentPage({params}:{params:Promise<{slug:string[]}>}){const {slug}=await params;const page=site.pages.find(p=>p.path==='/'+decodeURIComponent(slug.join('/')));if(!page)notFound();return <PageView page={page} site={site}/>;}
