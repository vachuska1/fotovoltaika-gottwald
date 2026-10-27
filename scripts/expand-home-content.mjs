// One-time editorial update using only the already captured source inventory.
import fs from 'node:fs/promises';
const inventory=JSON.parse(await fs.readFile('content/source-inventory.json','utf8'));
const site=JSON.parse(await fs.readFile('content/site.json','utf8'));
const home=site.pages.find(p=>p.path==='/');const sources=[];
function excerpt(path,contains,start,end){const page=inventory.pages.find(p=>p.path===path);const block=page.blocks.find(b=>b.type==='text'&&b.text.includes(contains));if(!block)throw Error('Missing original: '+contains);let text=block.text;if(start){const i=text.indexOf(start);if(i<0)throw Error(start);text=text.slice(i);}if(end){const i=text.indexOf(end);if(i<0)throw Error(end);text=text.slice(0,i);}sources.push({source:page.source,text});return text;}
const section=id=>home.sections.find(s=>s.id===id);
section('intro').text=excerpt('/','Navrhneme Vám fotovoltaickou elektrárnu');
const descriptions={
 Fotovoltaika:[excerpt('/','Na trhu v oblasti elektroniky'),excerpt('/','Navrhneme Vám fotovoltaickou elektrárnu'),excerpt('/','Potřebujete financovat Vaši elektrárnu')],
 Infratopení:[excerpt('/dalsi-sluzby/infratopeni','Infratopení zahřívá','Infratopení zahřívá','? Zdravější prostředí:'),excerpt('/dalsi-sluzby/infratopeni','Naše společnost se specializuje')],
 Elektroinstalace:[excerpt('/dalsi-sluzby/elektroinstalace','Elektroinstalace je jednou'),excerpt('/dalsi-sluzby/elektroinstalace','Kompletní výstavbu elektroinstalace','Kompletní výstavbu elektroinstalace','- Rekonstrukce elektroinstalace')],
 'Revize elektroinstalace':[excerpt('/dalsi-sluzby/revize-instalace','Revize elektrické instalace není'),excerpt('/dalsi-sluzby/revize-instalace','Provádíme revize domovních','Provádíme revize domovních')],
 'Tepelná čerpadla':[excerpt('/technologie/tepelna-cerpadla','Moderní tepelné čerpadlo'),excerpt('/technologie/tepelna-cerpadla','Vyspělá elektronická výbava')]
};
for(const item of section('services').items)item.text=descriptions[item.title].join('\n\n');
section('services').text=excerpt('/','Navrhneme Vám fotovoltaickou elektrárnu');
section('about').text=[excerpt('/o-nas','Jmenuji se Jiří Gottwald'),excerpt('/o-nas','Od první instalované elektrárny')].join('\n\n');
section('technology').text=[excerpt('/sdileni-prodej-energie/program-gottsol-inteligentni-rizeni','GOTTSOL je cloudová platforma'),excerpt('/sdileni-prodej-energie/program-gottsol-inteligentni-rizeni','Predikuje výrobu')].join('\n\n');
// Explain the related energy ecosystem in its own existing-template section.
const ecosystem=excerpt('/o-nas','K rodinné firmě jsem přizval');
let solutions=home.sections.find(s=>s.id==='solutions');
if(!solutions){solutions={id:'solutions',kind:'image-right',title:'Tepelná čerpadla',text:'',visible:true,items:[],rows:[],image:structuredClone(section('about').image)};home.sections.splice(home.sections.findIndex(s=>s.id==='regions'),0,solutions);}
solutions.text=ecosystem;solutions.items=[{title:'Tepelná čerpadla',text:'',href:'/technologie/tepelna-cerpadla',hidden:false},{title:'Chytrá domácnost',text:'',href:'/technologie/chytra-domacnost',hidden:false}];
section('contact').text=[excerpt('/','Zašlete nám nezávaznou poptávku'),excerpt('/kontakty','Jiří Gottwald Majitel')].join('\n\n');
await fs.writeFile('content/site.json',JSON.stringify(site,null,2)+'\n');
await fs.writeFile('content/home-expansion-sources.json',JSON.stringify({note:'Doslovné odstavce nebo souvislé výňatky ze zachyceného původního webu.',sources},null,2)+'\n');
console.log('Expanded homepage using',sources.length,'original excerpts.');
