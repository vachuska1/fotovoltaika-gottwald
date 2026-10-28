import {site} from '@/lib/content';
import data from '../../content/articles.json';
import {englishPaths,localHref} from '@/lib/locale';
export default function sitemap(){return [...new Set([...site.pages.filter(p=>!p.path.startsWith('/slovnik/')&&!p.path.startsWith('/slovnik-pojmu/')).map(p=>p.path),...data.articles.map(a=>a.path),...englishPaths.map(p=>localHref(p,'en'))])].map(path=>({url:(process.env.SITE_URL||'https://www.fotovoltaika-gottwald.cz')+path}));}
