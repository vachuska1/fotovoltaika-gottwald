import 'server-only';
import {siteSchema,type Site} from './schema';
const owner=()=>process.env.GITHUB_OWNER;
const repo=()=>process.env.GITHUB_REPO;
const published=()=>process.env.GITHUB_CONTENT_BRANCH||'develop';
const draft=()=>process.env.GITHUB_DRAFT_BRANCH||'cms-drafts';
const contentPath='content/site.json';
type TreeEntry={path:string;mode:string;type:string;sha:string};
export function storageReady(){return !!(owner()&&repo()&&process.env.GITHUB_TOKEN)&&published()!==draft();}
async function api(path:string,init:RequestInit={}){
 if(!storageReady())throw Error('STORAGE_UNAVAILABLE');
 const response=await fetch(`https://api.github.com/repos/${encodeURIComponent(owner()!)}/${encodeURIComponent(repo()!)}${path}`,{...init,cache:'no-store',headers:{Authorization:`Bearer ${process.env.GITHUB_TOKEN}`,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json',...init.headers}});
 if(!response.ok){if(response.status===404)throw Error('NOT_FOUND');if(response.status===409||response.status===422)throw Error('CONFLICT');throw Error('GITHUB_UNAVAILABLE');}
 return response.status===204?null:response.json();
}
const post=(path:string,data:unknown)=>api(path,{method:'POST',body:JSON.stringify(data)});
async function head(branch:string):Promise<string>{return (await api(`/git/ref/heads/${encodeURIComponent(branch)}`)).object.sha;}
async function readJson(path:string,ref:string){const file=await api(`/contents/${path}?ref=${encodeURIComponent(ref)}`);return JSON.parse(Buffer.from(file.content,'base64').toString('utf8'));}
async function draftHead(){try{return await head(draft());}catch(e){if((e as Error).message==='NOT_FOUND')return null;throw e;}}
export async function getState(){
 const publishedHead=await head(published());const dh=await draftHead();
 const site=siteSchema.parse(await readJson(contentPath,dh||publishedHead));
 let base=publishedHead;if(dh){try{base=(await readJson('content/cms-meta.json',dh)).base;}catch(e){if((e as Error).message!=='NOT_FOUND')throw e;}}
 return {site,draftHead:dh||publishedHead,publishedHead,base,conflict:base!==publishedHead};
}
async function commit(branch:string,parent:string,entries:unknown[],message:string){
 const old=await api(`/git/commits/${parent}`);
 const tree=await post('/git/trees',{base_tree:old.tree.sha,tree:entries});
 const c=await post('/git/commits',{message,tree:tree.sha,parents:[parent]});
 // Never force: concurrent writers or a changed head reject this update.
 await api(`/git/refs/heads/${encodeURIComponent(branch)}`,{method:'PATCH',body:JSON.stringify({sha:c.sha,force:false})});return c.sha as string;
}
async function ensureDraft(expected:string){let dh=await draftHead();if(!dh){const ph=await head(published());if(ph!==expected)throw Error('CONFLICT');await post('/git/refs',{ref:`refs/heads/${draft()}`,sha:ph});dh=ph;}if(dh!==expected)throw Error('CONFLICT');return dh;}
export async function saveDraft(site:Site,expected:string,email:string,files:Array<{path:string;bytes:Buffer}>=[]){
 const parent=await ensureDraft(expected);const state=await getState();if(state.draftHead!==parent)throw Error('CONFLICT');
 const parsed=siteSchema.parse(site);await validateMedia(parsed,parent,new Set(files.map(f=>f.path)));
 const entries:unknown[]=[{path:contentPath,mode:'100644',type:'blob',content:JSON.stringify(parsed,null,2)+'\n'},{path:'content/cms-meta.json',mode:'100644',type:'blob',content:JSON.stringify({base:state.base})}];
 for(const file of files){const blob=await post('/git/blobs',{content:file.bytes.toString('base64'),encoding:'base64'});entries.push({path:file.path,mode:'100644',type:'blob',sha:blob.sha});}
 if(!files.length&&JSON.stringify(parsed)===JSON.stringify(state.site))return state;
 await commit(draft(),parent,entries,`Koncept obsahu — ${email}`);return getState();
}
async function tree(ref:string):Promise<TreeEntry[]>{const result=await api(`/git/trees/${ref}?recursive=1`);if(result.truncated)throw Error('TREE_TOO_LARGE');return result.tree;}
async function validateMedia(site:Site,ref:string,extra=new Set<string>()){
 const paths=new Set((await tree(ref)).filter(e=>e.type==='blob').map(e=>e.path));
 const check=(image:unknown)=>{if(!image)return;for(const [key,value]of Object.entries(image)){if(['src','small','mobile'].includes(key)&&typeof value==='string'&&!paths.has('public'+value)&&!extra.has('public'+value))throw Error('MISSING_MEDIA');}};
 for(const p of site.pages)for(const s of p.sections){check(s.image);s.items.forEach(i=>check(i.image));}
}
export async function publishDraft(expectedDraft:string,expectedPublished:string,email:string){
 const state=await getState();if(state.draftHead!==expectedDraft||state.publishedHead!==expectedPublished||state.base!==expectedPublished)throw Error('CONFLICT');
 await validateMedia(state.site,expectedDraft);
 const current=siteSchema.parse(await readJson(contentPath,expectedPublished));
 if(JSON.stringify(current)===JSON.stringify(state.site))return {...state,unchanged:true};
 const entries=(await tree(expectedDraft)).filter(e=>e.type==='blob'&&(e.path===contentPath||/^public\/media\/[\w-]+\.webp$/.test(e.path))).map(e=>({path:e.path,mode:'100644',type:'blob',sha:e.sha}));
 const sha=await commit(published(),expectedPublished,entries,`Publikace obsahu — ${email}`);
 // Publication is already committed. Draft cleanup must never hide that success.
 let draftReset=true;
 try{await commit(draft(),expectedDraft,[{path:'content/cms-meta.json',mode:'100644',type:'blob',content:JSON.stringify({base:sha})}],`Publikováno ${sha}`);}catch{draftReset=false;}
 return {...await getState(),publishedCommit:sha,draftReset,unchanged:false};
}
export async function history(){const commits=await api(`/commits?sha=${encodeURIComponent(published())}&path=content/site.json&per_page=25`);return commits.map((c:any)=>({sha:c.sha,message:c.commit.message,date:c.commit.author.date}));}
export async function restoreToDraft(sha:string,expected:string,email:string){
 if(!/^[a-f0-9]{40}$/.test(sha)||!(await history()).some((c:{sha:string})=>c.sha===sha))throw Error('INVALID_VERSION');
 const site=siteSchema.parse(await readJson(contentPath,sha));
 const parent=await ensureDraft(expected);const state=await getState();if(state.draftHead!==parent)throw Error('CONFLICT');
 const oldTree=await tree(sha);await validateMedia(site,sha);
 const entries:unknown[]=oldTree.filter(e=>e.type==='blob'&&(e.path===contentPath||/^public\/media\/[\w-]+\.webp$/.test(e.path))).map(e=>({path:e.path,mode:'100644',type:'blob',sha:e.sha}));
 entries.push({path:'content/cms-meta.json',mode:'100644',type:'blob',content:JSON.stringify({base:state.publishedHead})});
 await commit(draft(),parent,entries,`Obnovení do konceptu ${sha} — ${email}`);return getState();
}
export async function mediaBytes(name:string){if(!/^[\w-]+\.webp$/.test(name))throw Error('INVALID_MEDIA');const dh=await draftHead();const file=await api(`/contents/public/media/${name}?ref=${encodeURIComponent(dh||await head(published()))}`);if(file.size>2500000)throw Error('TOO_LARGE');return Buffer.from(file.content,'base64');}
