import {auth} from '@/auth';
import {allowedEmail,authReady} from './access';
export async function requireAdmin(){if(!authReady())throw new Error('AUTH_UNAVAILABLE');const session=await auth();if(!allowedEmail(session?.user?.email))throw new Error('UNAUTHORIZED');return session!.user!.email!;}
export function checkOrigin(request:Request){const expected=process.env.AUTH_URL;if(!expected||request.headers.get('origin')!==new URL(expected).origin)throw new Error('FORBIDDEN');const fetchSite=request.headers.get('sec-fetch-site');if(fetchSite&&fetchSite!=='same-origin'&&fetchSite!=='none')throw new Error('FORBIDDEN');}
