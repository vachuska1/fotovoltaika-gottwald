import fs from 'node:fs/promises';
import sharp from 'sharp';
// Approved GottSol logo; no remote fonts or runtime image transforms.
const proposal=await fs.readFile('design/logo/gottsol-proposal.svg','utf8');
const logo=proposal.replace('width="620" height="160" viewBox="0 0 620 160"','width="470" height="120" viewBox="15 18 470 120"').replace('GottSol — návrh loga','GottSol');
await fs.writeFile('public/brand/gottsol-logo.svg',logo);
const mark=`<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><title>GottSol</title><rect width="128" height="128" rx="22" fill="#f4f3ed"/><g transform="translate(4 6)"><path d="M91 33a43 43 0 1 0 1 58V66H62" fill="none" stroke="#20382b" stroke-width="13" stroke-linecap="butt" stroke-linejoin="miter"/><circle cx="95" cy="17" r="12" fill="#8fa868"/></g></svg>`;
await fs.writeFile('src/app/icon.svg',mark);
await sharp(Buffer.from(mark)).resize(180,180).png().toFile('src/app/apple-icon.png');
const sizes=[16,32,48];const images=await Promise.all(sizes.map(size=>sharp(Buffer.from(mark)).resize(size,size).png().toBuffer()));
const header=Buffer.alloc(6+16*sizes.length);header.writeUInt16LE(1,2);header.writeUInt16LE(sizes.length,4);let offset=header.length;
for(let i=0;i<sizes.length;i++){const entry=6+16*i;header[entry]=sizes[i];header[entry+1]=sizes[i];header.writeUInt16LE(1,entry+4);header.writeUInt16LE(32,entry+6);header.writeUInt32LE(images[i].length,entry+8);header.writeUInt32LE(offset,entry+12);offset+=images[i].length;}
await fs.writeFile('src/app/favicon.ico',Buffer.concat([header,...images]));
console.log('Approved logo, SVG favicon, ICO (16/32/48 px) and Apple icon generated.');
