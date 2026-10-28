// Targeted content rearrangement; preserves detail pages and authentic review text.
import fs from 'node:fs/promises';
const file='content/site.json';const site=JSON.parse(await fs.readFile(file,'utf8'));const home=site.pages.find(p=>p.path==='/');
const before=structuredClone(home);const get=id=>home.sections.find(s=>s.id===id);const services=get('services');const main=services.items.find(i=>i.title==='Fotovoltaika');const infra=services.items.find(i=>i.title==='Infratopení');
const textSize=p=>p.sections.reduce((n,s)=>n+s.text.length+s.items.reduce((a,i)=>a+i.text.length,0),0);
const link=(title,href)=>({title,text:'',href,hidden:false});
const hero=get('intro');hero.title='Fotovoltaika a infratopení Gottwald';hero.items=[link('Nezávazně poptat','/#poptavka'),link('Fotovoltaika','/#fotovoltaika'),link('Infratopení','/#infratopeni'),link('Chytré řízení GottSol','/#gottsol'),...hero.items.filter(i=>i.image)];
const section=(id,kind,item,text)=>({id,kind,title:item.title,text,visible:true,image:structuredClone(item.image),items:[link('Zobrazit více',item.href),link('Nezávazně poptat','/#poptavka')],rows:[]});
const photovoltaic=section('fotovoltaika','image-left',main,main.text.split('\n\n')[1]);
const heating=section('infratopeni','image-right',infra,infra.text.slice(0,infra.text.indexOf('.')+1));
const gottsol=get('technology');gottsol.id='gottsol';gottsol.kind='image-right';gottsol.title='Chytré řízení GottSol';gottsol.items=[link('Zobrazit více','/sdileni-prodej-energie/program-gottsol-inteligentni-rizeni')];gottsol.image={src:'/media/2e3d1e7789d65e8f-1600.webp',small:'/media/2e3d1e7789d65e8f-640.webp',alt:'Chytré řízení GottSol',x:50,y:50};
services.items=services.items.filter(i=>!['Fotovoltaika','Infratopení'].includes(i.title)).map(i=>({...i,text:i.text.split('\n\n')[0].split(/(?<=\.)\s/)[0],linkLabel:'Zobrazit více'}));services.text='';
const contact=get('contact');contact.id='poptavka';home.sections=[hero,photovoltaic,heating,gottsol,services,get('gallery'),get('reviews'),get('regions'),contact];
const regionPaths=new Set(get('regions').items.map(i=>i.href));
for(const page of site.pages){const mapSection=page.sections.find(s=>s.title==='Kde působíme?');if(mapSection){mapSection.text=mapSection.text.split('\n\n')[0];mapSection.items=[];delete mapSection.image;mapSection.kind='editorial';for(const s of page.sections)if(s!==mapSection)s.items=s.items.filter(i=>!regionPaths.has(i.href));}
 for(const s of page.sections)for(const item of s.items){if(item.title==='Nezávazně poptat')item.href='/#poptavka';if(item.href==='/#technology')item.href='/#gottsol';}}
await fs.writeFile(file,JSON.stringify(site,null,2)+'\n');const map=JSON.parse(await fs.readFile('content/content-map.json','utf8'));for(const p of map){const page=site.pages.find(page=>page.path===p.path);if(page)p.sections=page.sections.length;}await fs.writeFile('content/content-map.json',JSON.stringify(map,null,2)+'\n');
await fs.writeFile('artifacts/home-refinement.json',JSON.stringify({beforeTextCharacters:textSize(before),afterTextCharacters:textSize(home),reductionPercent:Math.round((1-textSize(home)/textSize(before))*100),preservedDetails:['/o-nas','/dalsi-sluzby/infratopeni','/fotovoltaicke-elektrarny'],whatsappSource:'Původní inventář / obsahuje dva skutečné odkazy api.whatsapp.com/send?phone=420731406014',mapSource:'ČÚZK / RÚIAN, CC BY 4.0, 14 krajů / 10 aktivních'},null,2)+'\n');
console.log('Homepage text:',textSize(before),'→',textSize(home),'characters');
