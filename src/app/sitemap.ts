import {site} from '@/lib/content';
import data from '../../content/articles.json';
export default function sitemap(){return [...new Set([...site.pages.map(p=>p.path),...data.articles.map(a=>a.path)])].map(path=>({url:(process.env.SITE_URL||'https://www.fotovoltaika-gottwald.cz')+path}));}
