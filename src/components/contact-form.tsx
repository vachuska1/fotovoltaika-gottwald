'use client';
import {useState} from 'react';
const services=['Fotovoltaika','Ohřev vody','Infratopení','Elektroinstalace','Revize elektroinstalace','Tepelná čerpadla','Chytrá domácnost','GottSol','Servis','Financování','Dotace','Jiné'];
export default function ContactForm({id}:{id:string}){
 const [message,setMessage]=useState('');
 return <form className="inquiry-form" onSubmit={event=>{event.preventDefault();setMessage('Údaje nebyly odeslány. Odesílání poptávek zatím není aktivní.');}}>
 <p className="form-notice">Odesílání formuláře zatím není aktivní. Kontaktujte nás telefonicky nebo e-mailem.</p>
 <div className="inquiry-fields"><label htmlFor={id+'-first'}>Jméno<input id={id+'-first'} name="firstName" autoComplete="given-name" required maxLength={100}/></label><label htmlFor={id+'-last'}>Příjmení<input id={id+'-last'} name="lastName" autoComplete="family-name" required maxLength={100}/></label><label htmlFor={id+'-email'}>E-mail<input id={id+'-email'} name="email" type="email" autoComplete="email" required maxLength={254}/></label><label htmlFor={id+'-phone'}>Telefon<input id={id+'-phone'} name="phone" type="tel" autoComplete="tel" required pattern="[+0-9() .-]{6,30}" maxLength={30}/></label><label className="inquiry-service" htmlFor={id+'-service'}>O jakou službu máte zájem?<select id={id+'-service'} name="service" required defaultValue=""><option value="" disabled>Vyberte službu</option>{services.map(s=><option key={s}>{s}</option>)}</select></label><label className="inquiry-service" htmlFor={id+'-note'}>Poznámka<textarea id={id+'-note'} name="note" rows={4} maxLength={5000}/></label></div>
 <label className="inquiry-consent"><input type="checkbox" name="privacyConsent" required/><span>Souhlasím se zpracováním osobních údajů podle <a href="/ochrana-osobnich-udaju" target="_blank" rel="noopener noreferrer">zásad ochrany osobních údajů</a>.</span></label>
 <button className="action" type="submit">Odeslat poptávku</button><p className="form-status" role="status" aria-live="polite">{message}</p>
 </form>;
}
