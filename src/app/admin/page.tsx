import {auth,signIn,signOut} from '@/auth';
import {authReady,allowedEmail} from '@/lib/access';
import {storageReady} from '@/lib/github';
import Editor from './editor';
import './admin.css';
export const dynamic='force-dynamic';
export const metadata={title:'Administrace',robots:{index:false,follow:false}};
export default async function Admin(){
 if(!authReady())return <main id="main-content" className="admin-login"><span className="eyebrow">GottSol</span><h1>Administrace není aktivována</h1><p>Chybí nastavení Google OAuth, session nebo povolených administrátorů. Přístup i veškeré změny obsahu jsou uzamčené.</p><p>Postup nastavení najdete v souboru README.md projektu.</p><a href="/">Zpět na web</a></main>;
 const session=await auth();
 if(!allowedEmail(session?.user?.email))return <main id="main-content" className="admin-login"><span className="eyebrow">GottSol</span><h1>Přihlášení správce</h1><p>Přístup mají pouze výslovně povolené účty Google.</p><form action={async()=>{'use server';await signIn('google',{redirectTo:'/admin'});}}><button className="action">Přihlásit přes Google</button></form><a href="/">Zpět na web</a></main>;
 return <main id="main-content" className="admin-shell"><header className="admin-header"><a href="/">GottSol / Administrace</a><span>{session!.user!.email}</span><form action={async()=>{'use server';await signOut({redirectTo:'/admin'});}}><button>Odhlásit</button></form></header>{storageReady()?<Editor/>:<div className="admin-login"><h1>Úložiště není připojené</h1><p>Nastavte serverové připojení k soukromému GitHub repozitáři podle README.md. Ukládání a publikování jsou do té doby uzamčené.</p></div>}</main>;
}
