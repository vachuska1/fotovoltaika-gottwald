import type {MetadataRoute} from 'next';
export default function robots():MetadataRoute.Robots{return process.env.SITE_LIVE==='true'?{rules:{userAgent:'*',allow:'/',disallow:['/admin','/api']},sitemap:(process.env.SITE_URL||'https://www.fotovoltaika-gottwald.cz')+'/sitemap.xml'}:{rules:{userAgent:'*',disallow:'/'}};}
