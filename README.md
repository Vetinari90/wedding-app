# Wedding RSVP

Jednoduchá svatební registrace hostů — Next.js 15 (App Router), TypeScript, Tailwind, SQLite.

## Funkce

- Veřejný formulář pro potvrzení účasti (RSVP)
  - Jméno, email, telefon
  - Potvrzení účasti (Ano/Ne)
  - Počet dospělých, dětí, doprovod
  - Dietní preference, ubytování, doprava
  - Vzkaz novomanželům
- Admin dashboard chráněný heslem
  - Statistiky (kolik přijde, dietní požadavky, ubytování)
  - Tabulka všech odpovědí
  - Export do CSV (UTF-8 s BOM pro Excel)

## Lokální spuštění

```bash
# 1. Instalace závislostí
npm install

# 2. Vytvoř .env.local podle vzoru
cp .env.local.example .env.local
# a uprav heslo a info o svatbě

# 3. Spusť dev server
npm run dev
```

- Formulář: <http://localhost:3000>
- Admin: <http://localhost:3000/admin>

SQLite soubor se vytvoří automaticky v `./data/wedding.db`.

## Konfigurace (`.env.local`)

| Proměnná          | Popis                               |
| ----------------- | ----------------------------------- |
| `ADMIN_PASSWORD`  | Heslo do admin panelu (povinné)     |
| `WEDDING_COUPLE`  | Jména novomanželů                   |
| `WEDDING_DATE`    | Datum svatby (ISO: `2026-06-20`)    |
| `WEDDING_VENUE`   | Místo konání                        |

## Produkce

```bash
npm run build
npm run start
```

Na Vercelu SQLite **nefunguje** (storage je read-only). Pro produkci zvaž:
- Hostování na VPS (DigitalOcean, Hetzner) se Node.js
- Migrace na Supabase/Turso/Postgres (snadno nahradit `src/lib/db.ts`)

## Struktura

```
src/
  app/
    page.tsx              Veřejná úvodní stránka s formulářem
    RsvpForm.tsx          Klientský formulář
    actions.ts            Server action pro uložení
    dekujeme/             Potvrzovací stránka
    admin/                Admin dashboard (chráněný heslem)
      login/              Login stránka
    api/export/           CSV export
  lib/
    db.ts                 SQLite připojení + schema
    schema.ts             Zod validace
    auth.ts               Cookie-based admin session
    config.ts             Config svatby
data/                     SQLite DB (mimo git)
```
