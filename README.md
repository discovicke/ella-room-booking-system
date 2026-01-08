

# ![ELLA Logo](src/public/assets/ELLA%20small.png) ELLA - Edugrade Location & Logistics Assistant 
ELLA är ett fullständigt rumbokningssystem byggt för utbildningsmiljöer med tre olika användarroller: Admin, Lärare och Elev. Systemet erbjuder en modern och responsiv gränssnittsdesign med rollbaserad åtkomstkontroll.
Vi bifogar härunder emails och lösenord som ligger i vår SQLite-databas så du kan logga in och faktiskt se hemsidan. Lösenorden är hashade så vi kan inte bifoga någon skärmdump, men kanske lättare att kopiera från tabellen bara.

## Testanvändare
| Email  | Lösen | Roll |
| ------------- | ------ |:-------------:|
| anette.johansson@edugrade.com | FluentInCSN | Admin |
| oscar.marcusson@edugrade.com | ducksducks| Lärare |
| andre.ponten@edu.edugrade.com | heaton| Elev |
| christian.gennari@edu.edugrade.com| scalar | Elev |
| marcus.loov@edu.edugrade.com| javascriptlover | Elev |
| viktor.johansson@edu.edugrade.com| ettanlös | Elev |

## Huvudfunktioner
### Bokningshantering
* Boka studierum med val av datum, starttid och längd (2h, 4h, 6h eller 8h)
* Avboka rum för aktiva bokningar
* Visa bokningar uppdelat på "Kommande" och "Historik"
* Filtrera bort avbokade bokningar via checkbox
* Validering förhindrar bokningar på helger och efter 19:00
### Rumsadministration (Admin)
* Skapa nya rum med rumsnamn, typ, kapacitet, våning och utrustning
* Redigera befintliga rum
* Ta bort rum med säkerhetsbekräftelse
* Översikt visar lediga/upptagna rum
### Användarhantering (Admin)
* Skapa användare med namn, email, lösenord och roll
* Redigera användaruppgifter
* Ta bort användare
* Sök efter användare via sökfält
* Filtrera användare baserat på roll (Student/Lärare/Admin)
* Dropdown för snabbåtkomst till specifika användare
### Dashboard & Statistik (Admin)
* Totalt antal rum och lediga rum
* Aktiva bokningar och totala bokningar
* Realtidsuppdatering vid ändringar
## Teknisk Stack
* Frontend: HTML5, CSS3 (med CSS-variabler), Vanilla JavaScript
* Backend: Node.js med Express
* Databas: SQLite3
* Autentisering: Session-baserad med cookies och bcrypt för lösenordshantering
* Arkitektur: MVC-struktur med middleware för autentisering och auktorisering

## Säkerhet
* Rollbaserad åtkomstkontroll (RBAC) – varje roll har specifika rättigheter
* Hashade lösenord med bcrypt
* Session management med automatisk rensning av utgångna sessioner
* Skyddade API-endpoints – kräver autentisering
* Input-validering både på frontend och backend
 
## UI/UX-funktioner
* Responsiv design – fungerar på desktop, tablet och mobil
* Toast-notifikationer för feedback vid åtgärder
* Modala dialoger för bokningar och formulär med nudge-animation vid felaktig input
* Bekräftelsedialoger vid borttagning av användare/rum
* Dark mode-stöd via CSS-variabler
* Tillgänglighetsanpassat med semantisk HTML och ARIA-attribut

## Noterbart
* Modulär JavaScript – kod är uppdelad i återanvändbara komponenter (BookingModal, UserModal, RoomModal)
* API-wrapper – centraliserad hantering av alla API-anrop
* Error handling – översättning av tekniska felmeddelanden till användarvänliga texter
* State management – lokal hantering av användare, rum och bokningar med filtrering
* Optimerad rendering – effektiv uppdatering av UI baserat på filterval

ELLA är ett nästintill komplett exempel på en modern webbapplikation med tydlig separation mellan frontend och backend, säker autentisering och en användarvänlig gränssnittsdesign.
Vi hoppas att den kan komma till användning på Edugrade för att kunna lösa bokningsproblematiken när det hålls externa kurser på skolan så att elever kan se och boka rum när de vill studera på plats. Den borde vara modulär nog för att koppla andra databaser till den för att lätt implementera den i verkligheten. Ni vet var ni hittar oss om ni är köpsugna :)
