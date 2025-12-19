[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/2XOSb5hU)
# .NET25: Fullstack

Ett projekt där vi skapar en server och klient, i formen av en Node server som
tillhandahåller en vanlig webbsida.

## Hur allt fungerar

Innan utveckling påbörjas ska **node** och **npm** installeras, och följande
kommand ska köras:

```bash
npm init
npm install express --save
```

Och för den som vill:

```bash
npm install nodemon --save-dev
```

Uppladdning via commits och push fungerar som det brukar!

## Begränsningar

- Inga bibliotek eller tredjepartskod får användas, all HTML, CSS och JavaScript
  ska skrivas för hand, med undantaget att [Express](https://expressjs.com/) och
  [nodemon](https://www.npmjs.com/package/nodemon) ska användas såklart!

- Inga externa resurser får användas, eventuella typsnitt, bilder, ljudfiler,
  videor och så vidare ska finnas i detta GitHub repo och tillhandahållas av
  Node servern så att klienten kommer åt dem

- Det ska finnas **en** `package.json` i hela projektet, och den ska vara
  bredvid den här README filen, inte under någon annan mapp

- **Alla** API endpoints som skapas på servern **ska anropas** av klienten

- Servern ska gå att starta via `npm start` utan extra argument, filredigering
  eller krav på att något annat ska vara igång

- Det ska gå att navigera till [localhost](http://localhost) utan att få `404`
  (_vi ska alltså inte behöva navigera till
  [localhost/index.html](http://localhost/index.html) eller motsvarande_)

## Godkänt

För den här uppgiften finns det inga tester, utan det gäller att skapa följande:

- En **Node server** som använder **Express** och:

  - Tillhandahåller statiska filer för klienten (_index.html, styles.css osv_)

  - Lyssnar på port `80`

  - Har ett **REST** API med minst:
    - en `GET`
    - en `POST`
    > ⚠️ **OBS**: Båda ska vara för samma resurs (med samma URL) om det endast
    > finns **en** GET och **en** POST i hela API:et!

<br>

- En **klient** (_dvs själva webbsidan_) som:

  - Består av **minst** (_men gärna fler om många sidor önskas_):
    - `index.html` (som ska vara åtkomlig via endast `/`, inte bara
      `/index.html`)
    - `styles.css`
    - `index.js`
    > 💡**Tips**: Placera dessa filer under en `public` mapp som i de senare
    > uppgifterna, och använd
    > [static files](https://expressjs.com/en/starter/static-files.html) för att
    > leverera dem till webben automatiskt!

  - Anropar och användare datan från alla endpoints i **REST** API:et via
    `fetch`

## Väl Godkänt

Utöver kraven för godkänt behövs följande för att få **VG**:

- Ha ett automatiskt mörkt tema baserat på webbläsarinställningar

- Fungera på både mobila enheter liksom vanliga datorer, dvs alla olika
  skärmstorlekar ska fungera inom en rimlig marginal utan att webbsidan går
  sönder

- En egen 404 sida som passar in med resten av sidan

- Uppfyller följande krav från kursplanen:

  - med gott resultat utveckla i HTML5 och tar tydlig hänsyn till
    tillgänglighet, semantik och kompatibilitet

  - med gott resultat utveckla i CSS3 för att omsätta designkrav i praktiken och
    tar tydlig hänsyn till anpassning för olika enheter och kompatibilitet.

  - Eleven tar dessutom tydligt hänsyn till tillgänglighet, semantik,
    kompatibilitet och anpassning för olika enheter
