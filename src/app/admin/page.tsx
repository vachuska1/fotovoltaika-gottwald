import {auth,signIn,signOut} from '@/auth';
import {authReady,allowedEmail,passwordLoginEnabled,localCmsEnabled} from '@/lib/access';
import {storageReady} from '@/lib/github';
import Editor from './editor';
import {AuthError} from 'next-auth';
import {redirect} from 'next/navigation';
import './admin.css';
export const dynamic='force-dynamic';
export const metadata={title:'Administrace',robots:{index:false,follow:false}};
export default async function Admin({searchParams}:{searchParams:Promise<{error?:string}>}){
 const params=await searchParams;
 if(!authReady())return <main id="main-content" className="admin-login"><span className="eyebrow">GottSol</span><h1>Administrace není aktivována</h1><p>Chybí nastavení Google OAuth, session nebo povolených administrátorů. Přístup i veškeré změny obsahu jsou uzamčené.</p><p>Postup nastavení najdete v souboru README.md projektu.</p><a href="/">Zpět na web</a></main>;
 const session=await auth();
 if(!allowedEmail(session?.user?.email))return <main id="main-content" className="admin-login"><span className="eyebrow">GottSol</span><h1>Přihlášení správce</h1>{params.error&&<p role="alert">Nesprávné heslo nebo příliš mnoho pokusů. Zkuste to znovu za minutu.</p>}{passwordLoginEnabled()?<form className="password-login" action={async(data:FormData)=>{'use server';try{await signIn('credentials',{password:data.get('password'),redirectTo:'/admin'});}catch(e){if(e instanceof AuthError)redirect('/admin?error=credentials');throw e;}}}><label htmlFor="admin-password">Heslo</label><input id="admin-password" name="password" type="password" autoComplete="current-password" required maxLength={200}/><button className="action">Přihlásit se</button></form>:<><p>Přístup mají pouze výslovně povolené účty Google.</p><form action={async()=>{'use server';await signIn('google',{redirectTo:'/admin'});}}><button className="action">Přihlásit přes Google</button></form></>}<a href="/">Zpět na web</a></main>;
 return <main id="main-content" className="admin-shell"><header className="admin-header"><a href="/">GottSol / Administrace</a><span>{session!.user!.email}</span><form action={async()=>{'use server';await signOut({redirectTo:'/admin'});}}><button>Odhlásit</button></form></header>{storageReady()?<>{localCmsEnabled()&&<p className="admin-status">Lokální zkušební administrace. Koncepty a historie zůstávají na tomto počítači. Publikování upraví lokální web a vytvoří Git verzi; nespouští vzdálené nasazení.</p>}<Editor local={localCmsEnabled()}/></>:<div className="admin-login"><h1>Úložiště není připojené</h1><p>Nastavte serverové připojení k soukromému GitHub repozitáři podle README.md. Ukládání a publikování jsou do té doby uzamčené.</p></div>}</main>;
}
