import fs from 'node:fs/promises';
import sharp from 'sharp';
// Approved GottSol logo; no remote fonts or runtime image transforms.
await import('./compose-gottsol-logo.mjs');
const mark=(await fs.readFile('public/brand/gottwald-symbol.svg','utf8')).replace(/<svg\b/, '<svg width="128" height="128"').split('\n').map(line=>line.trimEnd()).join('\n');
await fs.writeFile('src/app/icon.svg',mark);
await sharp(Buffer.from(mark)).resize(180,180).png().toFile('src/app/apple-icon.png');
const sizes=[16,32,48];const images=await Promise.all(sizes.map(size=>sharp(Buffer.from(mark)).resize(size,size).png().toBuffer()));
const header=Buffer.alloc(6+16*sizes.length);header.writeUInt16LE(1,2);header.writeUInt16LE(sizes.length,4);let offset=header.length;
for(let i=0;i<sizes.length;i++){const entry=6+16*i;header[entry]=sizes[i];header[entry+1]=sizes[i];header.writeUInt16LE(1,entry+4);header.writeUInt16LE(32,entry+6);header.writeUInt32LE(images[i].length,entry+8);header.writeUInt32LE(offset,entry+12);offset+=images[i].length;}
await fs.writeFile('src/app/favicon.ico',Buffer.concat([header,...images]));
console.log('Approved logo, SVG favicon, ICO (16/32/48 px) and Apple icon generated.');
