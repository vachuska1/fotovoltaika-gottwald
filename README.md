# GottSol

Nový Next.js / TypeScript web s veřejnými stránkami generovanými při sestavení a českou administrací přes Google OAuth (Auth.js). Žádná databáze, polling, cron, veřejný middleware ani runtime optimalizace obrázků. Původní web a DNS nejsou součástí nasazení.

## Lokální náhled

```sh
npm ci
npm run dev
```

Otevřete http://localhost:3000. Produkční sestavení: `npm run build` a `npm start`. Kontroly: `npm test` a `npm run check`.

Veřejné stránky čtou pouze `content/site.json` během buildu. Převzatý obsah a zdroje jsou v `content/source-inventory.json`, původní HTML v `content/source/`, mapa URL v `content/content-map.json`, přesměrování v `content/redirects.json`. Snímky byly získány 27. 10. 2026. Normalizovány jsou pouze mezery a zalomení; technická tvrzení, časové údaje a případné chyby originálu nejsou aktualizovány ani opravovány. Před ostrým nasazením musí vlastník potvrdit aktuálnost nabídky a původních údajů.

Importní skripty `scripts/inventory.mjs`, `scripts/supplement.mjs`, `scripts/prepare-content.mjs` jsou jednorázové nástroje; nejsou součástí buildu. Nespouštějte je po redakčních úpravách, přepsaly by obsah původním snímkem. Původní nepřevzaté cíle odkazů zůstávají odkazy na původní web. Externí videa, sledovací skripty a původní formulářové endpointy se nevkládají. Nefunkční poptávkový formulář není zveřejněn; používají se skutečné telefonní a e-mailové odkazy. Pro jeho budoucí aktivaci je nutný schválený poskytovatel odesílání, příjemce, ověřená doména a serverové klíče.

## Testovací Vercel — nejdříve ochrana, potom deployment

1. Importovat **nový soukromý** repozitář `vachuska1/fotovoltaika-gottwald` do **nového** projektu `fotovoltaika-gottwald`. Framework Next.js, kořen repozitáře, Node.js 24.x. Žádné placené integrace.
2. Před prvním deploymentem zapnout Vercel Authentication / Deployment Protection na všech dostupných adresách projektu, ideálně **All Deployments**, včetně automatických `vercel.app` aliasů. Pokud tarif nechrání všechny URL, nevytvářet veřejný produkční deployment. Použít pouze chráněný Preview z `develop`. `noindex` přístupovou ochranu nenahrazuje.
3. Produkční větev ponechat `main`; veškerý vývoj a redakční publikování v `develop` vytváří pouze Preview. Nenastavovat `develop` jako produkční větev. Větev `cms-drafts` je v `vercel.json` vyloučena z deploymentů. Ověřit toto nastavení také po importu. Nový projekt importovat bez automatického nechráněného prvního buildu.
4. Připojit Vercel GitHub App pouze k tomuto repozitáři. Automatické Preview Deploymenty vytváří vestavěná Git integrace; další webhook či deploy hook není potřeba. Úspěšný Git zápis ještě neznamená úspěšný build — výsledek je v přehledu Vercelu.
5. Vybrat stabilní chráněný branch alias pro `develop`; použít jej pro `AUTH_URL` a Google callback. Neopírat OAuth o proměnlivou URL konkrétního commitu.
6. **Nepřipojovat `fotovoltaika-gottwald.cz`, neměnit DNS ani původní produkci.** `SITE_LIVE=false` blokuje indexaci a zachovává přípravu canonical pro původní doménu. Připojení ostré domény a `SITE_LIVE=true` vyžaduje výslovné schválení vlastníka.

## Aktivace bezpečné administrace

Bez všech OAuth proměnných je přihlášení i API uzamčené. Bez Git připojení jsou úpravy uzamčené. Neexistuje nouzové heslo ani veřejná registrace.

V Google Cloud Console → Google Auth Platform:

1. Vybrat vlastní projekt, nastavit OAuth consent screen (název aplikace, kontaktní e-mail). Pro testovací režim přidat administrátory mezi test users; při interní aplikaci respektovat omezení Workspace. Využívají se jen `openid email profile`.
2. Vytvořit OAuth Client ID typu **Web application**. Authorized redirect URI: `https://STABILNI-PREVIEW.vercel.app/api/auth/callback/google`. Pro místní vývoj lze přidat `http://localhost:3000/api/auth/callback/google`.
3. Do **serverových environment variables nového projektu**, pouze pro Preview / `develop`, vložit:
   - `AUTH_URL`: stabilní HTTPS Preview URL bez koncového lomítka.
   - `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`: údaje nového OAuth klienta.
   - `AUTH_SECRET`: náhodný tajný klíč, alespoň 32 bajtů (`openssl rand -base64 32`).
   - `ADMIN_EMAILS=odhadyvachuska@gmail.com`: jediný administrátor výslovně schválený vlastníkem. Další adresy přidávat pouze po jeho schválení.
   - Git proměnné podle následující části.
4. Tajemství označit jako Sensitive / chráněné, kde to Vercel umožňuje. Nikdy nepoužívat `NEXT_PUBLIC_`. Tajemství nevkládat do chatu, repozitáře ani klienta. Místně používat ignorovaný `.env.local` a `AUTH_URL=http://localhost:3000`.
5. Po změně proměnných jednou znovu sestavit chráněný Preview. Přihlásit povolený účet a ověřit zamítnutí jiného účtu.

Auth.js provádí standardní OAuth ověření (PKCE, state, nonce), kontroluje Google `email_verified` a přesný allowlist. Šifrované session cookies jsou HttpOnly, SameSite=Lax a v nasazeném produkčním Node režimu Secure. Session platí jednu hodinu. Odebrání adresy z allowlistu se kontroluje znovu při každé administrativní operaci po nasazení nové konfigurace. Všechny zápisy ověřují session a přesný Origin; Auth.js chrání vlastní přihlašovací endpointy. Náhled, média konceptu, upload i historie vyžadují serverové oprávnění. Žádné API tajemství není serializováno do prohlížeče.

## Git úložiště

V GitHub Settings → Developer settings → Fine-grained personal access tokens vytvořit token omezený **jen na tento soukromý repozitář** s `Contents: Read and write` a metadaty ke čtení. Nepotřebuje `Actions`, správu účtu, další repozitáře ani Vercel API. Token musí mít platnost a vlastník ji musí obnovovat. Pro delší životnost lze později nahradit serverový PAT za GitHub App bez změny datového modelu.

Serverové proměnné:

```text
GITHUB_OWNER=vachuska1
GITHUB_REPO=fotovoltaika-gottwald
GITHUB_CONTENT_BRANCH=develop
GITHUB_DRAFT_BRANCH=cms-drafts
GITHUB_TOKEN=<pouze do chráněných proměnných>
SITE_LIVE=false
SITE_URL=https://www.fotovoltaika-gottwald.cz
```

Do `develop` nepřidávat zákaz všech zápisů pro redakční token bez odpovídajícího nastavení výjimky. Naopak tokenu nedávat právo obcházet jiné bezpečnostní politiky účtu. Případný zákaz zápisu se má projevit chybou a musí být vyřešen vlastníkem.

## Návod správce

1. Otevřít chráněný Preview, přihlásit se přes Vercel a poté na `/admin` vlastním povoleným Google účtem. Jde o dvě nezávislé ochrany.
2. Vybrat stránku a sekci. Upravit nadpis, celý text, kontakty nebo SEO. Pořadí měnit šipkami; sekce a položky lze skrýt. Deset šablon zachovává společný design. Delší texty se automaticky nezkracují.
3. Fotografie: vybrat JPEG, PNG, WebP nebo AVIF do 2,5 MB, nejvýše 24 megapixelů; animace a SVG jsou zakázané. Kontroluje se skutečný formát dekodérem, nikoli přípona. Obrázek se znovu zakóduje bez metadat do dvou WebP variant (640 a 1600 px). Ohnisko nastavuje výřez šablony; lze přidat jinou mobilní fotografii a ALT. Upload provede zápis do konceptu, nikdy do veřejné větve.
4. Realizaci přidat jako položku galerie: doložený název, popis, fotografie, případně odkaz. Položku lze skrýt, odstranit a přesunout. Recenze obsahuje skutečný text, autora a odkaz na zdroj.
5. **Uložit koncept** uloží verzi na `cms-drafts`. Kliknout na **Náhled uloženého konceptu**. Neuložené změny se v náhledu neobjeví. Náhled není veřejná URL; odkazy v obsahu vedou na veřejné stránky, jinou stránku konceptu vybírejte v editoru.
6. **Publikovat** a potvrdit. Server atomicky zapíše schválený obsah a média do `develop`. Git integrace Vercelu sestaví nový chráněný Preview. Při totožném obsahu nevzniká nový commit ani build. Při chybě sestavení zůstává dostupné předchozí funkční nasazení.
7. **Historie / obnovení** → **Obnovit do konceptu** obnoví jednu z posledních 25 obsahových verzí včetně médií. Zkontrolovat náhled a znovu výslovně publikovat. Starší soubory médií se nemažou, aby zůstala možná obnova.
8. Při konfliktu se nikdy nepřepisuje cizí novější commit. Neuložené úpravy nejdříve zkopírovat, znovu načíst a přes historii obnovit požadovanou publikovanou verzi do konceptu. Tím se koncept znovu založí na aktuální větvi.

Koncept je společný pro všechny povolené správce. Git uložené revize chrání před souběžným přepsáním. Nezadávejte do veřejného obsahu neveřejné údaje. Nové stránky v mapě obsahu vyžadují redakční rozšíření dat v repozitáři; editor podporuje přidávání sekcí a realizací do existujících stránek.

## Ověření a limity předání

`npm test` ověřuje Git tok uložit → publikovat → obnovit, konflikty a nezměněný obsah proti izolovanému mocku GitHub API, validaci URL, allowlist, limit těla požadavku a dekódování / překódování obrázků. Nenahrazuje skutečné OAuth přihlášení a vzdálený deployment. Reálný přihlašovací a publikační průchod musí být proveden až po nastavení klienta Google, allowlistu, tokenu a Git integrace. Dokud tento průchod neproběhne, administrace není předána jako provozně ověřená.

## Značka GottSol a návrh loga

Aktuální značka webu je GottSol. Původní kontakty, doména a doslovné zákaznické recenze zůstávají skutečné. Realizace jsou na `/realizace`, recenze na `/recenze`; původní společná URL má přesměrování 301. Návrh loga je v `design/logo/gottsol-proposal.svg` a náhled v `artifacts/gottsol-logo-proposal.png`. Logo je schválené a nasazené v hlavičce jako lokální SVG. Samostatný monogram G se sluncem se používá pro SVG favicon, vícevelikostní ICO (16/32/48 px) a Apple ikonu (180 px). Assety lze znovu vytvořit pomocí `node scripts/brand-assets.mjs`.
