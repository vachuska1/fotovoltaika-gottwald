import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {load} from 'cheerio';
import sharp from 'sharp';
const base='https://www.fotovoltaika-gottwald.cz';
const listing=JSON.parse(await fs.readFile('content/source/articles/listing.json','utf8'));
const site=JSON.parse(await fs.readFile('content/site.json','utf8'));
const inventory=JSON.parse(await fs.readFile('content/source-inventory.json','utf8'));
const unavailableLinks=['https://www.fotovoltaika-gottwald.cz/node/127'];
const redirects=JSON.parse(await fs.readFile('content/redirects.json','utf8'));
const rows=[...new Map(listing.flatMap(list=>list.items).map(item=>[item.path,item])).values()];
const paths=new Set([...site.pages.map(p=>p.path),...rows.map(r=>r.path)]);
const clean=s=>s.replace(/\s+/g,' ').trim();
const original=url=>new URL(url,base).href.replace(/\/styles\/[^/]+\/public\//,'/').replace(/\?.*$/,'');
const media=new Map(inventory.media.filter(m=>m.src).map(m=>[original(m.source),m]));
const pending=new Map(),missing=[];
const articles=[];
for(const [index,row] of rows.entries()){
 const raw=await fs.readFile('content/source/articles/'+row.path.slice(1).replaceAll('/','__')+'.html','utf8'),$=load(raw),node=$('main article.node-blog').first();
 if(!node.length)throw Error('Missing article container: '+row.path);
 const title=clean(node.find('h1').first().text());if(!title)throw Error('Missing title: '+row.path);
 const hero=node.find('.hero-media style').text().match(/background-image:\s*url\(['"]?([^)'"\s]+)/)?.[1];
 const date=$('meta[property="article:published_time"]').attr('content')||node.find('time[datetime]').first().attr('datetime')||null;
 const author=clean(node.find('.node__submitted .username,.field--name-uid').first().text())||null;
 node.find('.hero-media,.back-link,script,style,noscript,form').remove();
 const originalText=clean(node.text());
 const unsupported=node.find('iframe,video,audio').length;if(unsupported)missing.push({path:row.path,reason:'Embedded media requires separate source verification'});
 node.find('iframe,video,audio').remove();
 const images=[row.image,hero,...node.find('img').map((_,e)=>$(e).attr('src')).get()].filter(Boolean);
 for(const image of images){const key=original(image);if(!media.has(key)&&!pending.has(key))pending.set(key,new URL(image,base).href);}
 articles.push({path:row.path,title,summary:row.summary,source:base+row.path,listingPage:listing.find(l=>l.items.some(i=>i.path===row.path)).page,date,author,heroSource:hero||row.image,coverSource:row.image,rawBody:node.html(),originalText,complete:!unsupported,index});
}
// Reuse already optimized photographs; fetch only genuinely missing assets.
for(const [key]of pending){const hash=createHash('sha256').update(key).digest('hex').slice(0,16),src=`/media/${hash}-1600.webp`,small=`/media/${hash}-640.webp`;try{await fs.access('public'+small);const m=await sharp('public'+src).metadata();media.set(key,{src,small,width:m.width,height:m.height});pending.delete(key);}catch{}}
const queue=[...pending];for(let i=0;i<queue.length;i+=5)await Promise.all(queue.slice(i,i+5).map(async([key,url])=>{try{let response=await fetch(key);if(!response.ok)response=await fetch(url);if(!response.ok)throw Error('HTTP '+response.status);const bytes=Buffer.from(await response.arrayBuffer()),meta=await sharp(bytes,{limitInputPixels:40000000}).metadata();if(!meta.width||!meta.height||meta.width<10||meta.height<10)throw Error('Invalid article photograph');const hash=createHash('sha256').update(key).digest('hex').slice(0,16);for(const width of [640,1600])await sharp(bytes,{limitInputPixels:40000000}).rotate().resize({width,withoutEnlargement:true}).webp({quality:82}).toFile(`public/media/${hash}-${width}.webp`);media.set(key,{src:`/media/${hash}-1600.webp`,small:`/media/${hash}-640.webp`,width:meta.width,height:meta.height});}catch(error){missing.push({source:url,reason:String(error)});}}));
const safeHref=href=>{if(!href)return null;if(href.startsWith('#'))return href;let url;try{url=new URL(href,base);}catch{return null;}if(!['https:','http:','mailto:','tel:'].includes(url.protocol)||unavailableLinks.includes(url.href))return null;if(url.origin===base){let path=decodeURI(url.pathname);const redirect=redirects.find(r=>r.source===path);if(redirect){const u=new URL(redirect.destination,base);return u.origin===base?u.pathname+u.hash:u.href;}if(paths.has(path)||path.startsWith('/sites/'))return path.startsWith('/sites/')?url.href:path+url.search+url.hash;return url.href;}return url.href;};
const allowed=new Set('div span p h2 h3 h4 h5 h6 ul ol li strong em b i a br img table thead tbody tfoot tr td th blockquote figure figcaption caption hr sup sub dl dt dd'.split(' '));
for(const a of articles){const $=load('<div id="article-root">'+a.rawBody+'</div>');const root=$('#article-root');
 root.find('*').toArray().reverse().forEach(e=>{const el=$(e);if(!allowed.has(e.tagName)){el.replaceWith(el.contents());return;}const attrs={...e.attribs};for(const key of Object.keys(attrs))el.removeAttr(key);if(attrs.id&&/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(attrs.id))el.attr('id',attrs.id);
 if(e.tagName==='a'){const href=safeHref(attrs.href);if(href){el.attr('href',href);if(href.startsWith('https:'))el.attr('target','_blank').attr('rel','noopener noreferrer');}if(attrs.title)el.attr('title',attrs.title);}
 if(e.tagName==='img'){const asset=attrs.src&&media.get(original(attrs.src));if(asset&&(asset.width<=1||asset.height<=1)){el.remove();return;}if(!asset){a.complete=false;missing.push({path:a.path,source:attrs.src,reason:'Missing body image'});el.remove();return;}el.attr({src:asset.src,srcset:`${asset.small} 640w, ${asset.src} 1600w`,sizes:'(max-width: 760px) 92vw, 820px',alt:attrs.alt||'',width:String(asset.width),height:String(asset.height),loading:'lazy',decoding:'async'});}
 if(['td','th'].includes(e.tagName))for(const key of ['colspan','rowspan','scope'])if(attrs[key]&&/^(\d+|row|col|rowgroup|colgroup)$/.test(attrs[key]))el.attr(key,attrs[key]);if(e.tagName==='ol'&&/^\d+$/.test(attrs.start||''))el.attr('start',attrs.start);
 });
 const text=clean(root.text());if(text!==a.originalText)throw Error('Article text changed during import: '+a.path);
 const photo=(src,alt)=>{const m=media.get(original(src));return m?{src:m.src,small:m.small,alt,width:m.width,height:m.height}:null;};
 a.cover=photo(a.coverSource,a.title);a.hero=photo(a.heroSource,a.title);if(!a.cover||!a.hero){a.complete=false;missing.push({path:a.path,reason:'Missing cover or hero image'});}a.html=root.html();a.textLength=text.length;a.sha256=createHash('sha256').update(text).digest('hex');a.historicalTerms=/dotac|úvěr/i.test(text)&&/\d[\d ,.]*\s*(Kč|korun|milion)/.test(text);delete a.rawBody;delete a.originalText;delete a.heroSource;delete a.coverSource;delete a.index;
}
await fs.writeFile('content/articles.json',JSON.stringify({articles,missing,unavailableLinks},null,2)+'\n');console.log({articles:articles.length,complete:articles.filter(a=>a.complete).length,newImages:pending.size,missing});
