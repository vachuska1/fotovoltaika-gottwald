import {site} from '@/lib/content';
import {PageView} from '@/components/site';
export const dynamic='force-static';
export const metadata={title:site.pages.find(p=>p.path==='/')!.title,description:site.pages.find(p=>p.path==='/')!.description,alternates:{canonical:(process.env.SITE_URL||'https://www.fotovoltaika-gottwald.cz')+'/'}};
export default function Home(){return <PageView page={site.pages.find(p=>p.path==='/')!} site={site}/>;}
