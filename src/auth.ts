import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import {allowedEmail,passwordLoginEnabled} from '@/lib/access';
import Credentials from 'next-auth/providers/credentials';
import {timingSafeEqual} from 'node:crypto';
const attempts=new Map<string,{count:number;until:number}>();
export const {handlers,auth,signIn,signOut}=NextAuth({
 providers:[...(passwordLoginEnabled()?[Credentials({credentials:{password:{label:'Heslo',type:'password'}},async authorize(credentials,request){
 if(!passwordLoginEnabled()||typeof credentials.password!=='string'||credentials.password.length>200)return null;
 const key=request.headers.get('x-forwarded-for')?.split(',')[0]||'local';const now=Date.now();const entry=attempts.get(key);if(entry&&entry.until>now&&entry.count>=5)return null;
 const actual=Buffer.from(credentials.password);const expected=Buffer.from(process.env.ADMIN_TEST_PASSWORD||'');
 if(actual.length!==expected.length||!timingSafeEqual(actual,expected)){if(attempts.size>1000)attempts.clear();attempts.set(key,{count:entry&&entry.until>now?entry.count+1:1,until:entry&&entry.until>now?entry.until:now+60000});return null;}
 attempts.delete(key);const email=(process.env.ADMIN_EMAILS||'').split(',')[0].trim();return {id:'test-administrator',name:'Správce',email};
 }})]:[]),Google({clientId:process.env.AUTH_GOOGLE_ID||'',clientSecret:process.env.AUTH_GOOGLE_SECRET||'',checks:['pkce','state','nonce']})],
 secret:process.env.AUTH_SECRET,
 trustHost:true,
 useSecureCookies:process.env.NODE_ENV==='production',
 session:{strategy:'jwt',maxAge:3600},
 callbacks:{
 async signIn({account,profile,user}){if(account?.provider==='credentials')return passwordLoginEnabled()&&allowedEmail(user.email);return account?.provider==='google'&&profile?.email_verified===true&&allowedEmail(profile.email);},
 async jwt({token,account,profile,user}){if(account){token.loginProvider=account.provider;token.admin=account.provider==='credentials'?passwordLoginEnabled()&&allowedEmail(user.email):profile?.email_verified===true&&allowedEmail(profile.email);}if(token.loginProvider==='credentials'&&!passwordLoginEnabled())token.admin=false;if(!allowedEmail(token.email))token.admin=false;return token;},
 async session({session,token}){if(token.admin!==true||!allowedEmail(token.email))session.user.email='';return session;},
 async redirect({url,baseUrl}){if(url.startsWith('/'))return baseUrl+url;return new URL(url).origin===baseUrl?url:baseUrl+'/admin';}
 }
});
