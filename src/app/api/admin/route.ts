import {requireAdmin,checkOrigin} from '@/lib/guard';
import {getState,saveDraft,publishDraft,history,restoreToDraft,mediaBytes} from '@/lib/github';
import {siteSchema} from '@/lib/schema';
import {limitedBody,processImage} from '@/lib/uploads';
export const runtime='nodejs';
export const dynamic='force-dynamic';
function fail(e:unknown){const message=e instanceof Error?e.message:'ERROR';const statuses:Record<string,number>={UNAUTHORIZED:401,FORBIDDEN:403,AUTH_UNAVAILABLE:503,STORAGE_UNAVAILABLE:503,CONFLICT:409,TOO_LARGE:413,INVALID_IMAGE:400,MISSING_MEDIA:400,INVALID_VERSION:400,NOT_FOUND:404};return Response.json({error:message==='CONFLICT'?'Obsah mezitím někdo změnil. Načtěte aktuální verzi.':message in statuses?message:'Operace selhala. Zkontrolujte nastavení nebo vstupní údaje.'},{status:statuses[message]||400});}
export async function GET(request:Request){try{await requireAdmin();const url=new URL(request.url);if(url.searchParams.has('media')){const bytes=await mediaBytes(url.searchParams.get('media')!);return new Response(new Uint8Array(bytes),{headers:{'Content-Type':'image/webp','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});}return Response.json(url.searchParams.has('history')?await history():await getState());}catch(e){return fail(e);}}
export async function POST(request:Request){try{
 const email=await requireAdmin();checkOrigin(request);
 const body=await limitedBody(request);
 if(typeof body.expected!=='string'||!/^([a-f0-9]{40})$/.test(body.expected))throw Error('INVALID_VERSION');
 if(body.action==='save')return Response.json(await saveDraft(siteSchema.parse(body.site),body.expected,email));
 if(body.action==='publish'){if(body.confirm!==true||typeof body.published!=='string')throw Error('FORBIDDEN');return Response.json(await publishDraft(body.expected,body.published,email));}
 if(body.action==='restore')return Response.json(await restoreToDraft(body.sha,body.expected,email));
 if(body.action==='upload'){
  const {photo,files}=await processImage(body.data);
  const state=await saveDraft(siteSchema.parse(body.site),body.expected,email,files);
  return Response.json({...state,photo});
 }
 throw Error('INVALID_ACTION');
 }catch(e){return fail(e);}}
