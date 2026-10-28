import fs from 'node:fs/promises';
import {load} from 'cheerio';
const site=JSON.parse(await fs.readFile('content/site.json','utf8'));
const $=load(await fs.readFile('content/source/index.html','utf8'));
const clean=s=>s.replace(/\s+/g,' ').trim();
const sourceReviews=$('.reference-obal').map((_,element)=>{const e=$(element);return {name:clean(e.find('.reference-title').text()),text:clean(e.find('.reference-txt').text()),metadata:clean(e.find('.reference-time').text()),href:e.find('.reference-button a').attr('href')};}).get();
const provenance=[];let locations=0,services=0;
for(const page of site.pages)for(const section of page.sections.filter(s=>s.kind==='reviews'))for(const item of section.items){
 const source=sourceReviews.find(r=>r.href===item.href&&r.name===item.title&&r.text===clean(item.text));if(!source)continue;
 const pieces=source.metadata.split(' - ');
 const location=/^(19|20)\d{2}$/.test(pieces[0])&&pieces.length>=3?pieces.slice(1,-1).join(' - '):undefined;
 // Refsite links identify a photovoltaic review category. For other providers,
 // require explicit installation evidence in the review, excluding the company name.
 const category=source.href?.startsWith('https://refsite.info/photovoltaics/reviews/');
 const wording=source.text.replace(/Fotovoltaik[ayou]* Gottwald/gi,'');
 const explicit=/\bFVE\b|fotovolta(?:ik|ic)/i.test(wording);
 const service=category||explicit?'Fotovoltaika':undefined;
 delete item.location;delete item.service;
 if(location){item.location=location;locations++;}
 if(service){item.service=service;services++;}
 if(location||service)provenance.push({page:page.path,author:item.title,reviewSource:source.href,archive:'content/source/index.html',originalMetadata:source.metadata,...(location?{location}:{}),...(service?{service,serviceEvidence:category?'Původní odkaz je zařazen do kategorie /photovoltaics/reviews/.':'Fotovoltaika nebo FVE je výslovně uvedena v původním textu recenze.'}:{}),verification:'Přesná shoda autora, zdrojového odkazu a textu s archivem původního webu. Nejde o nové nezávislé potvrzení realizace; aktuální stránky Refsite nebylo možné automaticky načíst.'});
}
await fs.writeFile('content/site.json',JSON.stringify(site,null,2)+'\n');
await fs.writeFile('content/review-details-sources.json',JSON.stringify(provenance,null,2)+'\n');
console.log({displayedReviews:site.pages.flatMap(p=>p.sections.filter(s=>s.kind==='reviews').flatMap(s=>s.items)).length,withLocation:locations,withService:services});
