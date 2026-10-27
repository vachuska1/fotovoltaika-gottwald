import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:{default:'Fotovoltaika Gottwald',template:'%s | Fotovoltaika Gottwald'},robots:process.env.SITE_LIVE==='true'?{index:true,follow:true}:{index:false,follow:false}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="cs"><body><a className="skip-link" href="#main-content">Přejít na obsah</a>{children}</body></html>;}
