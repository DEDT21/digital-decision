# digital-decision.at

Produktions-Repo der Marketing-Website der digital decision GmbH.
Quelle des Designs: Claude-Design-Projekt „digital decision Design System" (Master Copy v3, 27.07.2026).

## Stack

- **Vite + React 18** — vorkompiliert, kein Babel im Browser
- **Netlify** — Build: `npm run build`, Publish: `dist/` (siehe `netlify.toml`)
- **Fonts self-hosted** — Space Grotesk + Inter als woff2 in `public/fonts/` (DSGVO: kein Google-Fonts-CDN)
- **Kein Tracking, keine Cookies** — bewusst ohne Cookie-Banner

## Seiten

| Route | Quelle |
|---|---|
| `/` | `index.html` + `src/` (React-Landingpage) |
| `/impressum/` | `impressum/index.html` (statisch) |
| `/datenschutz/` | `datenschutz/index.html` (statisch) |
| `/danke/` | `danke/index.html` (Formular-Bestätigung, noindex) |
| `404` | `404.html` (Netlify Custom 404) |

## Formular (Netlify Forms)

Das Setup-Check-Formular (`src/components/sections/SetupCheck.jsx`) postet nativ an
Netlify Forms (`name="setup-check"`, Honeypot `bot-field`, Redirect auf `/danke`).
Der versteckte statische Spiegel in `index.html` registriert das Formular beim Build —
**Feldnamen müssen in beiden Dateien synchron bleiben** (`name`, `email`, `shop`, `message`).
Benachrichtigungen: in Netlify unter *Forms → Notifications* eine E-Mail an
david@digital-decision.at einrichten.

## Entwicklung

```bash
npm install
npm run dev       # Dev-Server
npm run build     # Produktions-Build nach dist/
npm run preview   # dist/ lokal serven
```

## Asset-Pipeline (einmalig / bei Logo-Änderung)

```bash
npm run assets    # Rohbilder (~/Downloads) → WebP in public/assets/
npm run og        # OG-Image + Favicons aus den Marken-SVGs
```

Outputs sind eingecheckt — die Skripte müssen im CI **nicht** laufen.

## Offene Punkte vor Livegang

- [ ] Aqmos-Case „+50 % Monatsumsatz" braucht Freigabe des Kunden
- [ ] Impressum/Datenschutz mit WKO-Generator gegenchecken (kein Rechtsrat)
- [ ] Netlify: Custom Domain + Forms-Notification einrichten (siehe Launch-Plan im Vault)
