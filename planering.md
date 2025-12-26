# Edugrade Booking System

## Grundbehovet

### Vad ska appen lösa?

- Se vilka salar som finns
- Se när de är lediga eller upptagna
- Boka en sal ett visst tidsintervall
- Undvika dubbelbokningar
- Kunna ändra eller avboka
- Kunna logga in/ut med tokenbaserade sessioner (via Cookies)

## Användartyper

#### Elever

- Se tillgänglighet
- Göra bokningar
- Se sina egna bokningar

#### Lärare

- Allt ovan
- Möjligen boka återkommande tider
- Prioritet över elever

#### Admin, till exempel skoladministration

- Skapa och redigera salar
- Ta bort bokningar
- Se alla bokningar
- Sätta regler
- Hantera användare och roller

## Sal-information

- Namn eller nummer
- Typ:
  - Klassrum
  - Datasal,
  - Labb
- Kapacitet
- Utrustning:
  - Projektor
  - Datorer
  - Whiteboard
- Plats, hus eller våning

## Regler och logik

- Får elever boka på kvällstid?
- Får man boka mer än X timmar per vecka?
- Vad händer vid krock?
- Vem vinner vid konflikt, elev vs lärare?
- Hur långt i förväg får man boka?
- Rollen styr via `authorization.middleware.js` (student, teacher, admin)

## UI och UX

Hur ska det kännas att använda?

- Veckovy eller dagvy, kalender
- Färgkodning per sal eller bokningstyp
- Snabb överblick
- Mobilvänlighet

Konkreta vyer:

- Inloggningsskärm
- Startsida med “vad är ledigt just nu?”
- Kalendervy per sal
- Min sida med mina bokningar

## Architecture

### Data models

#### User

user_id  
user_pw  
user_class

#### Rooms

room_number  
room_assets

#### Bookings

room_number  
user_id

#### Roles/Permission

role (text): 'student' | 'teacher' | 'admin'

Behörighetsmatris (MVP):

- student: Se rum, göra egna bokningar, se egna bokningar
- teacher: Allt som student + skapa/uppdatera rum (administrativt), hantera fler bokningar vid behov
- admin: Full behörighet – hantera användare, radera rum, radera bokningar

### Assets

Edugrade logo

## Tech stack

### Frontend

Javascript  
CSS

### Backend

Javascript
Node.js
Express

### Databas

SQL

### Auth & Security

**Hybrid Authentication**

- **Primary**: HttpOnly Cookies (`auth_token`). Säkrar mot XSS-attacker och hanteras automatiskt av webbläsaren.
- **Fallback**: Bearer Token i Header. Underlättar testning via Postman/Curl.
- `cookieParser.middleware.js` hanterar inkommande cookies.

**Role-Based Authorization**

- Separat middleware för roller: `authorization.middleware.js`
- **Server-Side Protection**: Statiska filer för `/student`, `/teacher`, och `/admin` skyddas direkt i `app.js` innan de levereras.
- 401 = Saknar token (Redirect till /login om det är en sidvisning).
- 403 = Inloggad men saknar behörighet.

Praktisk tillämpning (MVP):

- Users: Endast admin får lista/hämta/skapa användare
- Rooms: GET kräver inloggning; POST/PUT kräver teacher eller admin; DELETE kräver admin
- Bookings: Alla inloggade får använda (vidare begränsning per ägare kan läggas senare)

## MVP

- Ingen återkommande bokning i MVP
- Ingen avancerad prioriteringslogik i MVP
- En typ av inloggning i början
- En vy för bokning
