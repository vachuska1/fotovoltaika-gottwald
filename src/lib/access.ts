export function allowedEmail(email:unknown){return typeof email==='string'&&(process.env.ADMIN_EMAILS||'').split(',').map(e=>e.trim().toLowerCase()).filter(Boolean).includes(email.toLowerCase());}
export function authReady(){return !!(process.env.AUTH_SECRET&&process.env.AUTH_GOOGLE_ID&&process.env.AUTH_GOOGLE_SECRET&&process.env.ADMIN_EMAILS&&process.env.AUTH_URL);}
