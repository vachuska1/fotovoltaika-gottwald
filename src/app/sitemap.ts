import {site} from '@/lib/content';
export default function sitemap(){return site.pages.map(p=>({url:(process.env.SITE_URL||'https://www.fotovoltaika-gottwald.cz')+p.path}));}
