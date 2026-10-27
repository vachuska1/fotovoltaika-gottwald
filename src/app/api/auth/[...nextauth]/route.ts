import {handlers} from '@/auth';
import {authReady} from '@/lib/access';
const unavailable=()=>Response.json({error:'Přihlášení není nakonfigurováno.'},{status:503});
export const GET=authReady()?handlers.GET:unavailable;
export const POST=authReady()?handlers.POST:unavailable;
