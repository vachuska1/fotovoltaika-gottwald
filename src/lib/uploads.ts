import sharp from 'sharp';
import {createHash} from 'node:crypto';
export async function limitedBody(request:Request,max=4000000){
 if(Number(request.headers.get('content-length')||0)>max)throw Error('TOO_LARGE');
 const reader=request.body?.getReader();if(!reader)throw Error('INVALID_BODY');let size=0;const chunks:Uint8Array[]=[];
 try{while(true){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>max){await reader.cancel();throw Error('TOO_LARGE');}chunks.push(value);}}finally{reader.releaseLock();}
 return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}
export async function processImage(data:unknown){
 if(typeof data!=='string'||!data||data.length>3500000||!/^[A-Za-z0-9+/]+={0,2}$/.test(data))throw Error('INVALID_IMAGE');
 const bytes=Buffer.from(data,'base64');if(bytes.length>2500000)throw Error('TOO_LARGE');
 const image=sharp(bytes,{limitInputPixels:24000000,failOn:'warning'});const meta=await image.metadata();
 if(!['jpeg','png','webp','avif'].includes(meta.format||'')||!meta.width||!meta.height||(meta.pages||1)>1||meta.width<100||meta.height<100)throw Error('INVALID_IMAGE');
 const variants=await Promise.all([640,1600].map(width=>image.clone().rotate().resize({width,withoutEnlargement:true}).webp({quality:82}).toBuffer()));
 const id=createHash('sha256').update(variants[1]).digest('hex').slice(0,24);
 return {photo:{src:`/media/upload-${id}-1600.webp`,small:`/media/upload-${id}-640.webp`,alt:'',x:50,y:50},files:variants.map((bytes,i)=>({path:`public/media/upload-${id}-${[640,1600][i]}.webp`,bytes}))};
}
