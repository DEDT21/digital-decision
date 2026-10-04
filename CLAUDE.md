# digital-decision.at — Kontext für Claude Code

Onboarding-Dokument für die Arbeit an diesem Repo. Lies das zuerst, bevor du Änderungen machst.

## Projekt

Produktions-Website **digital-decision.at** der **Digital Decision GmbH** (Geschäftsführer: David Edtmayer & Thomas Jud, Firmensitz laut Firmenbuch Grödig, öffentliche Adresse auf der Website: Karolingerstraße 1, 5020 Salzburg. Die Grödiger Geschäftsanschrift ist eine Privatadresse und gehört nicht auf die Website).

Digital Decision ist eine E-Commerce-Agentur: Shops & Relaunches, Performance Marketing, Content & SEO, E-Mail/CRM, Systeme & Integrationen. Die Website ist eine einseitige Landingpage plus statische Unterseiten, Hauptziel ist der kostenlose **Setup-Check** (Kontaktformular).

## Stack

- **Vite 6 + React 18** — vorkompiliert, kein Babel im Browser
- **Kein Tailwind, kein CSS-Framework** — eigenes CSS mit Custom Properties (Design Tokens), Komponenten stylen inline über `style={{ ... }}` mit CSS-Variablen
- **Fonts**: Space Grotesk (Headlines) + Inter (Body). Bezogen über `@fontsource` (nur devDependency), aber **self-hosted als woff2 in `public/fonts/`** — kein Google-Fonts-CDN (DSGVO). Kein Tracking, keine Cookies, kein Cookie-Banner.
- **Deploy**: Netlify, Build `npm run build`, Publish `dist/` (siehe `netlify.toml`)
- **Prerendering**: `npm run build` baut zusätzlich ein SSR-Bundle (`src/entry-server.jsx` → `dist-ssr/`) und füllt mit `scripts/prerender.mjs` das `#root` in `dist/index.html` mit fertigem HTML. Der Browser hydriert nur noch (`hydrateRoot` in `src/main.jsx`). Crawler und KI-Bots sehen damit den kompletten Seitentext.

```bash
npm install
npm run dev       # lokaler Dev-Server
npm run build     # Produktions-Build nach dist/
npm run preview   # dist/ lokal serven
```

Seiten (alle als Rollup-Inputs in `vite.config.js` registriert): `/` (React), `/impressum/`, `/datenschutz/`, `/danke/`, `404.html`.

---

## KRITISCH 1 — Push auf `main` = Live

Remote: `https://github.com/DEDT21/digital-decision.git`

**Jeder Push auf `main` triggert einen Netlify-Auto-Deploy direkt auf die Live-Domain.** Es gibt keine Staging-Umgebung dazwischen.

Regeln:
1. **Immer `git pull` vor Arbeitsbeginn** — David arbeitet ebenfalls in diesem Repo.
2. Änderungen **lokal mit `npm run dev` testen**.
3. **Erst nach Freigabe von David pushen.** Nicht "schnell mal committen und pushen".

---

## KRITISCH 2 — Das Formular existiert zweimal

Das Netlify-Formular `setup-check` liegt an **zwei** Stellen:

| Datei | Rolle |
|---|---|
| `src/components/sections/SetupCheck.jsx` | die echte React-Version, die der Nutzer sieht. **Ohne** `data-netlify`-Attribute (sie wird vorgerendert; Netlify würde das HTML sonst umschreiben und die Hydration stören) |
| `index.html` | versteckter statischer Spiegel (`<form ... hidden>` mit `data-netlify` + `netlify-honeypot`): **die** Registrierung des Formulars bei Netlify |

**Feldnamen müssen in BEIDEN Dateien identisch bleiben:** `name`, `email`, `shop`, `message` sowie der Honeypot `bot-field`. Ebenso Formularname `setup-check` und `action="/danke/"` (mit Slash, sonst 301).

Wenn du ein Feld hinzufügst, umbenennst oder entfernst: **beide Dateien ändern.** Sonst kommen Submissions unvollständig oder gar nicht an — und das fällt erst live auf.

Dazu gehört die Netlify Function **`netlify/functions/submission-created.mjs`**: sie feuert automatisch bei jeder *verifizierten* Submission und schickt eine Push-Notification über **ntfy.sh**. Der Topic-Name ist das Geheimnis und liegt in der Env-Variable `NTFY_TOPIC` (Netlify UI → Environment variables), nicht im Repo. Ohne die Variable ist die Function ein stiller No-Op, die Submission wird trotzdem gespeichert. **Die Push enthält bewusst keine Personendaten** (ntfy.sh ist ein öffentlicher Dienst und steht nicht in der Datenschutzerklärung), nur den Hinweis auf eine neue Anfrage. Details stehen im Netlify-Dashboard unter Forms. Functions-Verzeichnis ist in `netlify.toml` gesetzt.

---

## Design-Tokens

Alle Tokens liegen in `src/styles/tokens/` (`colors.css`, `fonts.css`, `typography.css`, `spacing.css`, `shape.css`, `motion.css`), eingebunden über `src/styles/index.css`.

**Palette — exakt sechs Farben, keine weiteren, keine Gradients:**

| Token | Hex | Rolle |
|---|---|---|
| `--dd-ink` | `#0A0A0A` | Schwarz, dunkle Flächen & Text |
| `--dd-paper` | `#F6F6F2` | Seitenhintergrund |
| `--dd-white` | `#FFFFFF` | Cards |
| `--dd-lime` | `#C6F04B` | Akzent / Primary-Button |
| `--dd-violet` | `#5936E4` | Sekundärfläche, Links, Focus-Ring |
| `--dd-muted` | `#55554E` | Sekundärtext |

Dazu abgeleitete Neutrals (`--dd-border`, `--dd-chrome`, …) und **semantische Aliase**, die du bevorzugt verwendest: `--text-primary`, `--text-secondary`, `--text-on-dark`, `--surface-page`, `--surface-card`, `--surface-dark`, `--surface-accent`, `--action-primary-bg`, `--focus-ring`, `--border-default`.

Typo-Skala: Faktor **1.25** (große Terz) → 13 / 16 / 20 / 25 / 31 / 39 / 49 / 61 / 76 px, plus semantische Rollen `--text-h1`, `--text-h2`, `--text-lead`, `--text-copy`, `--text-kicker`, `--text-button`.

**Regeln:**
- **Keine neuen Farben, keine neuen Fonts einführen.**
- **Nie Hex-Werte direkt in Komponenten** — immer die CSS-Variablen benutzen.
- Neue Größen/Abstände aus den bestehenden Tokens ableiten, nicht frei erfinden.

## Struktur

```
index.html                  Entry + statischer Formular-Spiegel + SEO/OG/JSON-LD
src/main.jsx                React-Mount
src/App.jsx, src/Nav.jsx    Shell & Navigation
src/Home.jsx                Hauptseite — Copy-Datenarrays am Dateianfang
src/static.js               Skripte für die statischen Unterseiten
src/components/core/        Button, Card, Highlight, Kicker, Logo, WordRotator
src/components/sections/    Sektionen (siehe unten)
src/styles/                 index.css, static.css, tokens/
scripts/                    Asset-Pipeline
netlify/functions/          submission-created.mjs
public/                     fonts/, assets/, Favicons, og-image.png, robots.txt, sitemap.xml
```

**`src/Home.jsx`** ist die Hauptseite. Die komplette Copy liegt als Daten-Arrays am **Dateianfang** (`ROTATOR`, `HERO_OFFER`, `HERO_FACES`, `TRUST`, `DIFFERENCE`, `CASES`, `PHASES`, `SETUP_STEPS`, `TEAM`, `NETWORK`, `NETWORK_FACES`, `MANIFEST`, `FAQS`). Textänderungen passieren dort, nicht im JSX.

**`FAQS` ist zusätzlich wörtlich als FAQPage-JSON-LD in `index.html` gespiegelt.** `scripts/prerender.mjs` bricht den Build ab, wenn beide nicht übereinstimmen. FAQ-Text also immer an beiden Stellen ändern.

**Sektionen in `src/components/sections/`:**

| Datei | Zweck |
|---|---|
| `Section.jsx` | **Basis-Baustein**: Wrapper mit Padding + Maxwidth, Tones `paper` / `white` / `ink` |
| `SectionHeading.jsx` | **Basis-Baustein**: Kicker + H2 + Lead, Tones `light` / `dark` |
| `HeroOffer.jsx` | Setup-Check-Karte rechts im Hero (mobil: kompakter Avatar-Streifen) |
| `Aurora.jsx` | Hintergrund-Effekt im Hero und Footer (pausiert außerhalb des Viewports) |
| `LogoMarquee.jsx` | laufende Kundenlogos |
| `CaseGrid.jsx` | Case Studies |
| `ServiceBadges.jsx` | Leistungen: 7 Sticker-Badges mit Popup (Inhalte immer im DOM, für SEO) |
| `UseCaseSteps.jsx` | **ungenutzt** (durch ServiceBadges ersetzt) |
| `PhaseFlow.jsx` | Chaos → Sortieren → Klarheit → Vorsprung |
| `TeamStructure.jsx` | Team & Partnernetzwerk |
| `ManifestList.jsx` | Manifest-Punkte |
| `FaqChat.jsx` | FAQ im Chat-Look |
| `SetupCheck.jsx` | Kontaktformular (siehe KRITISCH 2) |
| `SiteFooter.jsx` | Footer |

**Neue Sektionen bauen immer auf `Section.jsx` + `SectionHeading.jsx` auf** — nicht eigene Wrapper mit eigenem Padding erfinden. Inhaltskante ist überall dieselbe (1440px-Viewport: x = 180).

## KRITISCH 3: Prerendering, Hydration, CSP

Weil die Seite vorgerendert und dann hydriert wird, gelten für **jede** Komponente:

- **Kein `window`/`document`/`matchMedia`/`ResizeObserver` im Render oder in `useState`-Initialisierern.** Der erste Render muss auf Server und Client identisch sein. Responsives Layout per CSS-Media-Query, Client-Anpassungen nur in `useEffect`. Für Layout-Effekte: `typeof window !== 'undefined' ? useLayoutEffect : useEffect`.
- **Keine Runtime-CSS-Injection** (`document.createElement('style')`). Styles liegen als `.css`-Datei neben der Komponente und werden per `import './X.css'` eingebunden.
- **CSP** (in `netlify.toml`): `script-src 'self'` plus SHA-256-Hash für das eine Inline-Script im `<head>` von `index.html` (setzt die Scroll-Reveal-Klasse vor dem ersten Paint). **Wer ein Inline-Script ändert oder hinzufügt, muss den Hash in `netlify.toml` nachziehen**, sonst blockiert der Browser es. `scripts/prerender.mjs` prüft das und bricht den Build ab. Netlify-Deploy-Previews blenden ihr Feedback-Drawer-Script dadurch nicht ein (Production nicht betroffen).
- **Endlos-Animationen** (Marquee, Aurora, WebGL, Rotator) pausieren außerhalb des Viewports und respektieren `prefers-reduced-motion`. Laufbänder haben einen Pause-Button (WCAG 2.2.2).
- **Fokus:** auf dunklen Flächen ist der Fokusring Lime (`.dd-on-dark` bzw. Section `tone="ink"`), sonst Violet.

**Caching:** Vite legt gehashte Bundles unter `/static/` ab (immutable). Dateien aus `public/assets/` sind nicht gehasht und werden nur 1 Tag gecacht. Ein getauschtes Bild unter gleichem Namen ist also spätestens nach einem Tag überall aktuell.

**Teamfotos:** `public/assets/team/<name>.webp` (Original 900px) plus `-400`/`-800` (srcset Team-Karten) und `-avatar` (quadratischer Gesichts-Crop 160px für Hero und Setup-Check).

## Scripts (`scripts/`)

Beide sind **Einmal-Pipelines**, ihre Outputs sind eingecheckt. Sie laufen **nicht** im CI und du rufst sie nur auf, wenn sich eine Quelldatei ändert.

- **`npm run assets`** → `scripts/build-assets.mjs`: nimmt Rohbilder aus `~/Downloads` (Kundenlogos, Netzwerk-Logos, Team-Fotos mit fest hinterlegten Dateinamen), macht bei Logos Weiß transparent (`whiteToAlpha` + `trim`, weil die Marquee sie durch `brightness(0) invert(1)` rendert), skaliert (Logos 600px, Fotos 900px) und schreibt WebP nach `public/assets/…`. Fehlende Quelldateien werden übersprungen, nicht abgebrochen.
- **`npm run og`** → `scripts/build-og.mjs`: baut aus den Marken-SVGs (`public/assets/dd-wordmark-white.svg`, `dd-mark-lime.svg`) das **OG-Image 1200×630** (Ink-Fläche, weiße Wortmarke, die drei Wellen-Flags in Lime) sowie die **Favicons** — `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png` (Lime-Wellen auf abgerundetem Ink-Quadrat). Rendering via `sharp`.

## Copy-Regeln

- Die Texte folgen der **Master Copy** aus dem Design-/Copy-Projekt. **Die Quelle liegt in Davids Vault, nicht in diesem Repo** — wenn du sie brauchst, frag danach, rate nicht.
- Ton: **direkt, Du-Form, kurze Sätze, keine Marketing-Floskeln.** Keine Superlative, keine Buzzword-Ketten, keine leeren Versprechen.
- **Textänderungen auf der Site nur nach Absprache mit David.** Auch "kleine" Formulierungsverbesserungen nicht eigenmächtig.
- Kundenaussagen und Zahlen (z. B. Case-Ergebnisse) nie erfinden oder schätzen — die sind teils kundenfreigabepflichtig.

## Workflow-Regeln für Claude Code

1. **Vor destruktiven Aktionen fragen** — Dateien löschen, überschreiben, `git reset`, Force-Push, größere Umbauten.
2. **Keine Dependencies ohne Absprache hinzufügen.** Der Stack ist absichtlich schlank (React + Vite + sharp). Kein UI-Kit, keine Animationsbibliothek, kein CSS-Framework nachziehen.
3. **Nach Änderungen `npm run build` als Smoke-Test laufen lassen.** Build grün = Minimum, ersetzt aber nicht den Blick in `npm run dev`.
4. **Commit-Messages kurz und auf Deutsch**, z. B. `Setup-Check: Telefonfeld ergänzt` oder `Footer: Link zu Datenschutz korrigiert`.
5. Änderungen am Formular, an Tokens oder an Deploy-Konfiguration (`netlify.toml`, `vite.config.js`) immer kurz begründen und David gegenlesen lassen.
6. `dist/` ist gitignored — nie committen.

## Offene Punkte (Stand 02.10.2026)

- Impressum/Datenschutz mit WKO-Generator gegenchecken (kein Rechtsrat)
- Regionen im Footer sind reiner Text. Echte SEO-Wirkung bräuchte eigene Landingpages pro Begriff
- Ungenutzt im Repo: `UseCaseSteps.jsx`, `core/Card.jsx`, `core/Highlight.jsx`, `public/assets/team/lina-hoepflinger.webp`
