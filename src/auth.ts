import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import {allowedEmail} from '@/lib/access';
export const {handlers,auth,signIn,signOut}=NextAuth({
 providers:[Google({clientId:process.env.AUTH_GOOGLE_ID||'',clientSecret:process.env.AUTH_GOOGLE_SECRET||'',checks:['pkce','state','nonce']})],
 secret:process.env.AUTH_SECRET,
 trustHost:true,
 useSecureCookies:process.env.NODE_ENV==='production',
 session:{strategy:'jwt',maxAge:3600},
 callbacks:{
 async signIn({account,profile}){return account?.provider==='google'&&profile?.email_verified===true&&allowedEmail(profile.email);},
 async jwt({token,account,profile}){if(account){token.admin=profile?.email_verified===true&&allowedEmail(profile.email);}if(!allowedEmail(token.email))token.admin=false;return token;},
 async session({session,token}){if(token.admin!==true||!allowedEmail(token.email))session.user.email='';return session;},
 async redirect({url,baseUrl}){if(url.startsWith('/'))return baseUrl+url;return new URL(url).origin===baseUrl?url:baseUrl+'/admin';}
 }
});
