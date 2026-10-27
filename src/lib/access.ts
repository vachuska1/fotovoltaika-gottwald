export function allowedEmail(email:unknown){return typeof email==='string'&&(process.env.ADMIN_EMAILS||'').split(',').map(e=>e.trim().toLowerCase()).filter(Boolean).includes(email.toLowerCase());}
export function passwordLoginEnabled(){return process.env.ADMIN_AUTH_MODE==='password'&&!!process.env.ADMIN_TEST_PASSWORD&&(process.env.NODE_ENV!=='production'||process.env.VERCEL_ENV==='preview');}
export function localCmsEnabled(){return process.env.LOCAL_CMS==='true'&&process.env.NODE_ENV!=='production'&&!process.env.VERCEL;}
export function authReady(){return !!(process.env.AUTH_SECRET&&process.env.ADMIN_EMAILS&&process.env.AUTH_URL&&(passwordLoginEnabled()||process.env.AUTH_GOOGLE_ID&&process.env.AUTH_GOOGLE_SECRET));}
