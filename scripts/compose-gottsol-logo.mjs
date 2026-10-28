import fs from 'node:fs/promises';
import sharp from 'sharp';
import {load} from 'cheerio';
const original=(await fs.readFile('design/logo/gottwald-original-symbol.svg','utf8')).split('\n').map(line=>line.trimEnd()).join('\n');
const $=load(original,{xml:true});
if($('script,foreignObject,image').length)throw Error('Unexpected embedded content in symbol');
$('*').each((_,element)=>{for(const [key,value]of Object.entries(element.attribs||{}))if(/^on/i.test(key)||(/href$/i.test(key)&&!value.startsWith('#')))throw Error('Unsafe symbol reference');});
const symbol=$('svg').html().split('\n').map(line=>line.trimEnd()).join('\n');
function compose(textColor,accent){return `<svg xmlns="http://www.w3.org/2000/svg" width="450" height="110" viewBox="0 -7 450 110" role="img" aria-label="GottSol"><title>GottSol</title><svg x="0" y="0" width="95.9" height="96" viewBox="0 0 95.9 96">${symbol}</svg><text x="125" y="78" font-family="Arial, Helvetica, sans-serif" font-size="88" font-weight="600" letter-spacing="-5"><tspan fill="${textColor}">Gott</tspan><tspan fill="${accent}">Sol</tspan></text></svg>`;}
const raw=compose('#20382b','#668546');
const {info}=await sharp(Buffer.from(raw),{density:288}).trim().toBuffer({resolveWithObject:true});
const x=-(info.trimOffsetLeft||0)/4,y=-7-(info.trimOffsetTop||0)/4,width=info.width/4,height=info.height/4;
function crop(svg){return svg.replace('width="450" height="110" viewBox="0 -7 450 110"',`width="${width}" height="${height}" viewBox="${x} ${y} ${width} ${height}"`);}
await fs.writeFile('public/brand/gottsol-logo.svg',crop(raw));
await fs.writeFile('public/brand/gottsol-logo-light.svg',crop(compose('#f4f3ed','#b7c99a')));
await fs.writeFile('public/brand/gottwald-symbol.svg',original);
await sharp(Buffer.from(crop(raw))).resize({width:1000}).png().toFile('artifacts/gottsol-original-symbol-logo-local.png');
console.log('Original symbol composed with GottSol; subtitle remains separate; favicon unchanged. Artwork bounds:',width,height);
