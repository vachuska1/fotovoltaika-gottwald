import {notFound} from 'next/navigation';
import {site} from '@/lib/content';
import {PageView} from '@/components/site';
import ArticlesPage,{articles} from '@/components/articles';
import ServicePage,{serviceLayouts} from '@/components/service-pages';
export const dynamic='force-static';
export const dynamicParams=false;
export function generateStaticParams(){return [...new Set([...site.pages.filter(p=>p.path!=='/'&&p.path!=='/slovnik-pojmu'&&!p.path.startsWith('/slovnik/')&&!p.path.startsWith('/slovnik-pojmu/')).map(p=>p.path),...articles.map(a=>a.path)])].map(path=>({slug:path.slice(1).split('/')}));}
export async function generateMetadata({params}:{params:Promise<{slug:string[]}>}){const {slug}=await params;const path='/'+decodeURIComponent(slug.join('/'));const page=site.pages.find(p=>p.path===path);const article=articles.find(a=>a.path===path);return {title:article?.title||page?.title,description:article?.summary||page?.description,alternates:{canonical:(process.env.SITE_URL||'https://www.fotovoltaika-gottwald.cz')+(article?.path||page?.path||'/')}};}
export default async function ContentPage({params}:{params:Promise<{slug:string[]}>}){const {slug}=await params;const page=site.pages.find(p=>p.path==='/'+decodeURIComponent(slug.join('/')));const path='/'+decodeURIComponent(slug.join('/'));if(path==='/clanky')return <ArticlesPage site={site}/>;const article=articles.find(a=>a.path===path);if(article)return <ArticlesPage site={site} article={article}/>;if(!page)notFound();if(serviceLayouts[path])return <ServicePage page={page} site={site}/>;return <PageView page={page} site={site}/>;}
