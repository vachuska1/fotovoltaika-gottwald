import type {Metadata} from 'next';
import {Inter,Manrope} from 'next/font/google';
import './globals.css';
import './theme.css';
const inter=Inter({subsets:['latin','latin-ext'],weight:['400','600'],display:'swap',variable:'--font-inter'});
const manrope=Manrope({subsets:['latin','latin-ext'],weight:'700',display:'swap',variable:'--font-manrope'});
export const metadata:Metadata={title:{default:'GottSol',template:'%s | GottSol'},robots:process.env.SITE_LIVE==='true'?{index:true,follow:true}:{index:false,follow:false}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="cs" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{__html:"try{document.documentElement.dataset.theme=localStorage.getItem('gottsol-theme')==='dark'?'dark':'light'}catch{document.documentElement.dataset.theme='light'}"}}/></head><body className={`${inter.variable} ${manrope.variable}`}><a className="skip-link" href="#main-content">Přejít na obsah</a>{children}</body></html>;}
