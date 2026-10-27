import 'server-only';
import {mkdir,readFile,writeFile,rename,rm,copyFile,access} from 'node:fs/promises';
import {join} from 'node:path';
import {createHash,randomBytes} from 'node:crypto';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {localCmsEnabled} from './access';
import {siteSchema,type Site} from './schema';
const git=promisify(execFile);const root=()=>join(process.cwd(),'.cms');
const hash=(value:unknown)=>createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0,40);
type Draft={site:Site;head:string;base:string};
async function init(){if(!localCmsEnabled())throw Error('STORAGE_UNAVAILABLE');await mkdir(join(root(),'versions'),{recursive:true});await mkdir(join(root(),'media'),{recursive:true});}
async function json(file:string){return JSON.parse(await readFile(file,'utf8'));}
async function atomic(file:string,data:unknown){const temp=file+'.'+randomBytes(6).toString('hex')+'.tmp';await writeFile(temp,JSON.stringify(data,null,2)+'\n');await rename(temp,file);}
async function draft():Promise<Draft|null>{try{return await json(join(root(),'draft.json'));}catch(e){if((e as NodeJS.ErrnoException).code==='ENOENT')return null;throw e;}}
async function locked<T>(work:()=>Promise<T>){await init();const lock=join(root(),'write.lock');try{await mkdir(lock);}catch{throw Error('CONFLICT');}try{return await work();}finally{await rm(lock,{recursive:true,force:true});}}
export async function getState(){await init();const published=siteSchema.parse(await json('content/site.json'));const publishedHead=hash(published);const d=await draft();return {site:d?.site||published,draftHead:d?.head||publishedHead,publishedHead,base:d?.base||publishedHead,conflict:!!d&&d.base!==publishedHead};}
async function validateMedia(site:Site,files:Set<string>){for(const p of site.pages)for(const s of p.sections)for(const image of [s.image,...s.items.map(i=>i.image)])if(image)for(const src of [image.src,image.small,image.mobile].filter(Boolean)as string[]){const name=src.split('/').pop()!;if(files.has('public'+src))continue;try{await access(join(root(),'media',name));}catch{try{await access('public'+src);}catch{throw Error('MISSING_MEDIA');}}}}
export async function saveDraft(site:Site,expected:string,_email:string,files:Array<{path:string;bytes:Buffer}>=[]){return locked(async()=>{const state=await getState();if(state.draftHead!==expected)throw Error('CONFLICT');const valid=siteSchema.parse(site);await validateMedia(valid,new Set(files.map(f=>f.path)));for(const file of files){if(!/^public\/media\/[\w-]+\.webp$/.test(file.path))throw Error('INVALID_MEDIA');await writeFile(join(root(),'media',file.path.split('/').pop()!),file.bytes);}if(JSON.stringify(valid)===JSON.stringify(state.site)&&!files.length)return state;await atomic(join(root(),'draft.json'),{site:valid,head:randomBytes(20).toString('hex'),base:state.base});return getState();});}
export async function history():Promise<Array<{sha:string;message:string;date:string}>>{await init();try{return await json(join(root(),'history.json'));}catch(e){if((e as NodeJS.ErrnoException).code==='ENOENT')return [];throw e;}}
async function version(site:Site,message:string){const sha=hash(site);await atomic(join(root(),'versions',sha+'.json'),site);const entries=await history();await atomic(join(root(),'history.json'),[{sha,message,date:new Date().toISOString()},...entries.filter(e=>e.sha!==sha)].slice(0,25));}
export async function publishDraft(expected:string,published:string,email:string){return locked(async()=>{const state=await getState();if(state.draftHead!==expected||state.publishedHead!==published||state.base!==published)throw Error('CONFLICT');const original=siteSchema.parse(await json('content/site.json'));if(JSON.stringify(original)===JSON.stringify(state.site))return {...state,unchanged:true};await validateMedia(state.site,new Set());await version(original,'Předchozí lokální verze');
 const tracked=['content/site.json'];const media=await import('node:fs/promises').then(fs=>fs.readdir(join(root(),'media')));for(const name of media){await copyFile(join(root(),'media',name),join('public/media',name));tracked.push('public/media/'+name);}
 // Do not commit unrelated working-tree or staged changes.
 await atomic('content/site.json',state.site);try{await git('git',['add','--',...tracked]);await git('git',['commit','--only','-m',`Lokální publikace obsahu — ${email}`,'--',...tracked]);}catch{await atomic('content/site.json',original);throw Error('LOCAL_GIT_FAILED');}
 await version(state.site,'Lokální publikace');await rm(join(root(),'draft.json'),{force:true});return {...await getState(),publishedCommit:hash(state.site),draftReset:true,unchanged:false};});}
export async function restoreToDraft(sha:string,expected:string,email:string){if(!/^[a-f0-9]{40}$/.test(sha)||!(await history()).some(v=>v.sha===sha))throw Error('INVALID_VERSION');const site=siteSchema.parse(await json(join(root(),'versions',sha+'.json')));return locked(async()=>{const state=await getState();if(state.draftHead!==expected)throw Error('CONFLICT');await atomic(join(root(),'draft.json'),{site,head:randomBytes(20).toString('hex'),base:state.publishedHead});return getState();});}
export async function mediaBytes(name:string){await init();if(!/^[\w-]+\.webp$/.test(name))throw Error('INVALID_MEDIA');try{return await readFile(join(root(),'media',name));}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;return readFile(join('public/media',name));}}
