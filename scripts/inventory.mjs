import {load} from 'cheerio';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
const base='https://www.fotovoltaika-gottwald.cz';
const pages=new Map(), errors=[], media=new Map();
const normalize=s=>s.replace(/\s+/g,' ').trim();
async function fetchPage(path){
 try{
 const raw=path==='/'?await readFile('/tmp/gottwald-home.html','utf8'):await(await fetch(base+path)).text();
 const $=load(raw); const main=$('main').length?$('main'):$('body');
 const links=$('a[href]').map((_,el)=>({text:normalize($(el).text()),href:$(el).attr('href')})).get();
 const images=main.find('img').map((_,el)=>({src:$(el).attr('src'),alt:$(el).attr('alt')||''})).get();
 for(const m of raw.matchAll(/background-image:\s*url\(['"]?([^)'"\s]+)['"]?\)/g))images.push({src:m[1],alt:''});
 main.find('script,style,form,iframe').remove();
 const blocks=[];
 main.find('h1,h2,h3,h4,p,li,table').each((_,el)=>{
 if($(el).parents('li,table').length)return;
 const text=normalize($(el).text());if(!text)return;
 const tag=el.tagName;
 if(tag==='table') blocks.push({type:'table',text,rows:$(el).find('tr').map((_,tr)=>[$(tr).find('th,td').map((_,td)=>normalize($(td).text())).get()]).get()});
 else blocks.push({type:/^h/.test(tag)?'heading':'text',text});
 });
 const title=normalize($('h1').first().text())||normalize($('title').text());
 const page={path,source:base+path,title,description:$('meta[name="description"]').attr('content')||'',blocks,images,links,canonical:$('link[rel="canonical"]').attr('href'),forms:$('form').map((_,e)=>({action:$(e).attr('action'),id:$(e).attr('id')})).get()};
 pages.set(path,page);await writeFile('content/source/'+(path==='/'?'index':path.slice(1).replaceAll('/','__').replaceAll('?','_'))+'.html',raw);
 return page;
 }catch(e){errors.push({path,error:String(e)});}
}
await mkdir('content/source',{recursive:true});await mkdir('public/media',{recursive:true});
const home=await fetchPage('/');
const visited=new Set(['/']);
let queue=home.links.map(l=>l.href).filter(p=>p.startsWith('/')&&!p.startsWith('//')&&!p.includes('?')&&!p.startsWith('/sites/'));
// Bounded single pass over navigation, technical pages, articles and realization details.
for(let depth=0;depth<3&&queue.length;depth++){
 const batch=[...new Set(queue)].filter(p=>!visited.has(p)&&!p.includes('#')&&!/\/user|\/search|\/admin/.test(p)).slice(0,160-pages.size);
 batch.forEach(p=>visited.add(p));queue=[];
 for(let i=0;i<batch.length;i+=6){
 const results=await Promise.all(batch.slice(i,i+6).map(fetchPage));
 for(const p of results.filter(Boolean)) for(const l of p.links)if(/^\/(realizace|blog|clanky|slovnik-pojmu|fotovoltaika|technologie|dalsi-sluzby)\//.test(l.href)&&!l.href.includes('?'))queue.push(l.href);
 }
}
console.log('Inventoried pages',pages.size);
// Download original media once, re-encode to two bounded WebP sizes. No SVG or external tracking assets.
for(const p of pages.values())for(const img of p.images){if(!img.src)continue;const url=new URL(img.src,base).href;if(!url.startsWith(base+'/sites/'))continue;media.set(url,{source:url,alt:img.alt});}
const entries=[...media.entries()];
for(let i=0;i<entries.length;i+=5)await Promise.all(entries.slice(i,i+5).map(async([url,item])=>{
 try{
 // Prefer the original photograph rather than a small Drupal derivative.
 const original=url.replace(/\/styles\/[^/]+\/public\//,'/').replace(/\?.*$/,'');
 let response=await fetch(original);if(!response.ok)response=await fetch(url);
 const bytes=Buffer.from(await response.arrayBuffer());
 const id=createHash('sha256').update(url).digest('hex').slice(0,16);
 const meta=await sharp(bytes,{limitInputPixels:40000000}).metadata();
 if(!meta.width||!meta.height)throw Error('Invalid image');
 for(const width of [640,1600])await sharp(bytes,{limitInputPixels:40000000}).rotate().resize({width,withoutEnlargement:true}).webp({quality:80}).toFile(`public/media/${id}-${width}.webp`);
 Object.assign(item,{src:`/media/${id}-1600.webp`,small:`/media/${id}-640.webp`,width:meta.width,height:meta.height});
 }catch(e){item.error=String(e);}
}));
for(const p of pages.values())p.images=p.images.map(img=>({...img,...media.get(new URL(img.src||'/',base).href)})).filter(img=>img.src?.startsWith('/media/'));
const result={capturedAt:new Date().toISOString(),pages:[...pages.values()],media:[...media.values()],errors,notes:['Původní formuláře nejsou přeneseny jako aktivní bez autorizovaného odesílání.','Veřejné texty jsou doslovný obsah DOM s normalizovanými mezerami. Surové HTML uchováno v content/source.']};
await writeFile('content/source-inventory.json',JSON.stringify(result,null,2));
console.log('Media',media.size,'errors',errors.length);
