import React from 'react';
import { Section } from './components/sections/Section.jsx';
import { SectionHeading } from './components/sections/SectionHeading.jsx';
import { Button } from './components/core/Button.jsx';
import { Kicker } from './components/core/Kicker.jsx';
import { WordRotator } from './components/core/WordRotator.jsx';
import { Aurora } from './components/sections/Aurora.jsx';
import { CaseGrid } from './components/sections/CaseGrid.jsx';
import { ServiceBadges } from './components/sections/ServiceBadges.jsx';
import { ManifestList } from './components/sections/ManifestList.jsx';
import { SetupCheck } from './components/sections/SetupCheck.jsx';
import { FaqChat } from './components/sections/FaqChat.jsx';
import { PhaseFlow } from './components/sections/PhaseFlow.jsx';
import { LogoMarquee } from './components/sections/LogoMarquee.jsx';
import { TeamStructure } from './components/sections/TeamStructure.jsx';
import { HeroOffer, HeroFaces } from './components/sections/HeroOffer.jsx';
import './Home.css';

const ROTATOR = ['deinen Onlineshop.', 'deine Website.', 'deine Ads.', 'deine Marke.', 'deinen Relaunch.', 'dein Amazon-Business.', 'dein Wachstum.'];

/* Was Screenreader und Suchmaschinen als H1 lesen: der Kernclaim, unabhängig vom Rotator. */
const H1_TEXT = 'Die richtige Entscheidung für dein Wachstum.';

/* Setup-Check-Karte im Hero: was du nach den 30 Minuten weißt (aus SETUP_STEPS[1]). */
const HERO_OFFER = {
  title: 'Der Setup-Check',
  meta: ['Kostenlos', '30 Minuten'],
  outcomesLabel: 'Danach weißt du:',
  outcomes: ['Wo dein Wachstum hängt.', 'Was zuerst dran ist.', 'Was du dir sparen kannst.'],
  people: 'David & Thomas',
  peopleRole: 'Geschäftsführer',
  reply: 'Antwort innerhalb von 24 Stunden. Von David oder Thomas persönlich.',
  link: 'Zum Formular'
};

/* Fotos für Karte und mobilen Streifen: quadratische Gesichts-Crops (160×160, Graustufen) */
const HERO_FACES = ['/assets/team/david-edtmayer-avatar.webp', '/assets/team/thomas-jud-avatar.webp'];

/* height: Anzeigehöhe zur optischen Angleichung (breite Wortmarke kleiner, Hagleitner-Oval
   mit kleiner Schrift größer), w/h: Pixelmaße der Datei für width/height-Attribute. */
const TRUST = [
  { name: 'Aqmos', logo: '/assets/clients/aqmos.webp', height: 25, w: 450, h: 96 },
  { name: 'Hagleitner', logo: '/assets/clients/hagleitner.webp', height: 44, w: 165, h: 96 },
  { name: 'Gamechangersocks', logo: '/assets/clients/gamechangersocks.webp', height: 40, w: 150, h: 96 },
  { name: 'BWT', logo: '/assets/clients/bwt.webp', height: 32, w: 255, h: 96 },
  { name: 'Ecosoft', logo: '/assets/clients/ecosoft.webp', height: 30, w: 311, h: 96 }
];

/* mark: Teil des Titels, der den Lime-Textmarker bekommt (Brand-Signature, sparsam). */
const DIFFERENCE = [
  { title: 'Wir arbeiten in deinem Geschäft, nicht daneben.', body: 'Wir arbeiten uns in Produkt, Zahlen und Abläufe ein und übernehmen auf Wunsch operative Rollen, vom Ads-Konto bis zur Shop-Migration. Beraten und dann verschwinden ist nicht unser Modell.' },
  { title: 'Wir bauen auf, was funktioniert.', body: 'Dein Team, deine Systeme, deine bisherige Arbeit haben Wert. Wir reißen nichts ein, um uns wichtig zu machen. Wir verbessern gezielt das, was Wachstum blockiert.' },
  { title: 'Wir gehen mit ins Risiko.', mark: 'mit ins Risiko', body: 'Wenn es zum Projekt passt, koppeln wir einen Teil unseres Honorars an dein Ergebnis. Läuft es gut, verdienen wir mit. Läuft es schlecht, verdienen wir weniger. Frag uns im Setup-Check danach.' }
];

/* stat/statLabel: optionale Kennzahl für die hervorgehobene Case-Karte. Nur freigegebene Zahlen. */
const CASES = [
  { client: 'Aqmos', logo: '/assets/clients/aqmos.webp', industry: 'Wasseraufbereitung · D2C + Marktplätze',
    stat: '+50 %', statLabel: 'Monatsumsatz im Jahresvergleich',
    result: 'Gewachsen durch Struktur, nicht durch Budget.',
    body: 'Wir haben Aqmos neu gebrandet und der Marke ein Gesicht gegeben. Seitdem steuern wir das operative E-Commerce-Geschäft über vier Kanäle. Im Jahresvergleich liegen die Monatsumsätze stabil bei +50 %. Gewachsen ist das über Struktur im Marketing und im technischen E-Commerce.',
    tags: ['Rebranding', 'E-Commerce-Steuerung', '4+ Kanäle'] },
  { client: 'Hagi · Hagleitner', logo: '/assets/clients/hagleitner.webp', industry: 'Hygiene · B2B-Konzern',
    result: 'Vom B2B-Hygieneprofi zur D2C-Marke.',
    body: 'Hagleitner macht seit über 50 Jahren Profi-Hygiene im B2B. Der erste Schritt zum Endkunden blieb unter seinen Möglichkeiten. Jetzt bauen wir ihn neu auf: Shopify-Migration, neues Creative-Konzept, Relaunch von Google und Meta Ads.',
    tags: ['Shop-Migration', 'Ads-Relaunch', 'D2C-Strategie'] },
  { client: 'Gamechangersocks', logo: '/assets/clients/gamechangersocks.webp', industry: 'Fashion · D2C',
    result: 'Technischer E-Commerce, der Conversion bringt.',
    body: 'Bei Gamechangersocks arbeiten wir dort, wo Umsatz technisch entsteht: Conversion-Optimierung, Shop-Strategie und Planung. Jede Änderung muss sich in der Conversion Rate zeigen.',
    tags: ['CRO', 'Shop-Strategie', 'Planung'] }
];

const PHASES = [
  { title: 'Chaos', body: 'Kanäle, Agenturen und Systeme laufen nebeneinander. Jeder macht irgendwas, keiner weiß, was wirkt.' },
  { title: 'Sortieren', body: 'Wir legen alles auf den Tisch: Zahlen, Tools, Zuständigkeiten. Was funktioniert, bleibt. Was blockiert, fliegt raus.' },
  { title: 'Klarheit', body: 'Jeder Kanal hat einen Job, jede Zahl einen Besitzer, jede Entscheidung eine Datengrundlage. Ab hier ist Wachstum planbar.' },
  { title: 'Vorsprung', body: 'Der Modus, in dem Gewinner bleiben: Test um Test, Verbesserung um Verbesserung, bis deine Kunden gar nicht mehr auf die Idee kommen, woanders zu kaufen.' }
];

const SETUP_STEPS = [
  { title: 'Du zeigst uns dein Setup.', body: 'Shop, Ads-Konten, die Zahlen, die dich nerven.' },
  { title: 'Wir sagen dir, was wir sehen.', body: 'Wo es hängt, was zuerst dran ist, was du dir sparen kannst.' },
  { title: 'Du entscheidest.', body: 'Selbst umsetzen, mit uns umsetzen oder gar nicht. Kein Follow-up-Marathon, kein Pitch.' }
];

const TEAM = [
  { name: 'Thomas Jud', role: 'Geschäftsführer · Co-Founder', mail: 'thomas@digital-decision.at', photo: '/assets/team/thomas-jud.webp',
    line: 'Ein gutes Setup erkennst du daran, dass niemand mehr darüber reden muss.',
    bio: 'Denkt in Systemen, nicht in Kampagnen. Thomas sortiert seit Jahren Shops, Prozesse und Agentur-Landschaften und migriert Systeme, ohne die funktionierenden Teile anzufassen.',
    callFor: ['Shop- & Systemarchitektur', 'Prozesse im operativen Geschäft', 'Agentur-Landschaften aufräumen'] },
  { name: 'David Edtmayer', role: 'Geschäftsführer · Co-Founder', mail: 'david@digital-decision.at', photo: '/assets/team/david-edtmayer.webp',
    line: 'Ich schaue mir zuerst die Zahlen an. Dann suche ich den Weg, den noch keiner geht.',
    bio: 'Baut seit seinem 15. Lebensjahr E-Commerce. Heute baut er die Systeme dahinter: AI-first und immer auf der Suche nach der besseren Lösung statt der gewohnten.',
    callFor: ['Wachstumsentscheidungen', 'Performance & Funnels', 'AI-gestützte Prozesse & neue Wege'] }
];

const NETWORK = [
  { name: 'Paid', what: 'Paid Search, Paid Social, Produkt-Feeds.' },
  { name: 'Tech', what: 'Entwicklung an bestehenden Systemen, Schnittstellen, Migrationen.' },
  { name: 'Logistik', what: 'Fulfillment, Versandkosten, Retourenprozesse.' },
  { name: 'Creative', what: 'Foto, Video, Ads-Assets. Nach unserem Briefing, mit euren Produkten.' }
];

const NETWORK_FACES = [
  { name: 'BAM Creative', logo: '/assets/network/bam-creative.webp' },
  { name: 'Otago', logo: '/assets/network/otago.svg' },
  { name: 'Spreadfilms', logo: '/assets/network/spreadfilms.svg', dark: true },
  { name: 'WBFK', logo: '/assets/network/wbfk.svg', dark: true },
  /* tile-style logo (black square, white W): rendered like a profile photo, not filtered to a glyph */
  { name: 'Wipplinger', photo: '/assets/network/wipplinger.svg' },
  { name: 'Partner', logo: '/assets/network/partner-1c.svg', dark: true },
  { name: 'Huber', logo: '/assets/network/huber.webp' }
];

const MANIFEST = [
  'Echte Expertise statt Alleskönner.',
  'Nutzen, was funktioniert, statt alles neu zu bauen.',
  'Verantwortung übernehmen: unternehmerisch und operativ.',
  'Tief eintauchen statt oberflächlich beraten.',
  'Sensibel sortieren, nicht brachial.',
  'Partnerschaft. Auch finanziell.'
];

/* Wird zusätzlich als FAQPage-JSON-LD in index.html gespiegelt. Bei Änderungen beide Stellen pflegen. */
export const FAQS = [
  ['Wir haben schon schlechte Erfahrungen mit Agenturen gemacht. Warum sollte es mit euch anders laufen?', 'Verstehen wir. Ein Teil unserer Kunden kam genau so zu uns. Wir verkaufen keine Stunden, wir übernehmen Verantwortung für Ergebnisse. Deshalb startet alles mit einem kostenlosen Setup-Check statt mit einem Pitch. Danach arbeiten wir in deinem Tagesgeschäft mit und koppeln unser Honorar auf Wunsch an dein Ergebnis. Wenn wir nicht überzeugt sind, dass wir dir helfen können, sagen wir dir das im Check. Dann hast du zumindest eine ehrliche Einschätzung, und die kostet dich nichts.'],
  ['Bietet ihr erfolgsbasierte Vergütung an?', 'Ja, wenn es zum Projekt passt. Dann koppeln wir einen Teil unseres Honorars an dein unternehmerisches Ergebnis. Wie das konkret aussieht, legen wir gemeinsam fest.'],
  ['Entwickelt ihr alles komplett neu?', 'Nur wenn es sinnvoll ist. Wir nutzen, was schon funktioniert, also bestehende Systeme, Prozesse und Teams, und verbessern gezielt das, was blockiert.'],
  ['Was passiert, wenn schon ein Team oder andere Agenturen beteiligt sind?', 'Wir schauen uns an, was funktioniert, und bringen Struktur rein. Sensibel, ohne Politik und ohne alles umzuwerfen.'],
  ['Übernehmt ihr auch operative Verantwortung?', 'Ja. Wir steuern strategisch und setzen im Tagesgeschäft um, zum Beispiel im Ads-Konto, im Shop oder bei einer Migration. Das Ziel ist immer messbares Wachstum.'],
  ['Passt ihr zu jedem Unternehmen?', 'Nein. Wir passen zu Unternehmen, die echte Zusammenarbeit und klare Entscheidungen wollen. Kein weiteres Agenturfeuerwerk.']
];

/* Sichtbarer, fester Teil der H1. Die H1 liest für Screenreader und Crawler exakt H1_TEXT:
   Der feste Teil steht als normaler Text darin, der Rest von H1_TEXT als sr-only-Text, und der
   Rotator ist aria-hidden (seine Wörter sind CSS-Content, also auch nicht im Textinhalt).
   Passt H1_TEXT irgendwann nicht mehr zum festen Teil, wird die ganze sichtbare Zeile
   versteckt und H1_TEXT komplett als sr-only gelesen. */
const H1_VISIBLE = 'Die richtige Entscheidung für';

function Hero({ onNavigate }) {
  const split = H1_TEXT.startsWith(H1_VISIBLE);
  const toForm = (e) => { if (e) e.preventDefault(); onNavigate('home', 'setup-check'); };
  return (
    <div className="dd-hero">
      <div className="dd-hero-inner">
        <div className="dd-hero-eyebrow"><Kicker tone="limeText">E-Commerce-Partner · Salzburg</Kicker></div>
        <h1 className="dd-hero-title">
          {split
            ? <>{H1_VISIBLE}<span className="dd-sr-only">{H1_TEXT.slice(H1_VISIBLE.length)}</span></>
            : <><span aria-hidden="true">{H1_VISIBLE}</span><span className="dd-sr-only">{H1_TEXT}</span></>}
          <WordRotator words={ROTATOR} loops={1} className="dd-hero-rotator" />
        </h1>

        <div className="dd-hero-grid">
          <div className="dd-hero-copy">
            <p className="dd-hero-lead">
              Wir führen dein E-Commerce-Geschäft, als wäre es unser eigenes. Strategie und Umsetzung, ein Team, das entscheidet und dazu steht.
            </p>
            <div className="dd-hero-ctas">
              <Button arrow onClick={toForm}>Kostenlosen Setup-Check holen</Button>
              <Button variant="ghostDark" href="#phasen" onClick={(e) => { e.preventDefault(); onNavigate('home', 'phasen'); }}>Wie wir arbeiten</Button>
            </div>
            <p className="dd-hero-micro">30 Minuten · ehrliche Einschätzung · kein Pitch</p>
            <div className="dd-hero-strip">
              <HeroFaces faces={HERO_FACES} />
              <p className="dd-hero-strip-text">{HERO_OFFER.reply}</p>
            </div>
          </div>
          <HeroOffer offer={HERO_OFFER} faces={HERO_FACES} onNavigate={onNavigate} className="dd-hero-offer" />
        </div>
      </div>
    </div>
  );
}

function PauseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <rect x="3.5" y="2.5" width="3" height="11" rx="1" fill="currentColor" />
      <rect x="9.5" y="2.5" width="3" height="11" rx="1" fill="currentColor" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path d="M5 2.9v10.2a.8.8 0 0 0 1.2.7l8-5.1a.8.8 0 0 0 0-1.4l-8-5.1A.8.8 0 0 0 5 2.9z" fill="currentColor" />
    </svg>
  );
}

/* Logo-Band am Fuß des Hero: Zeile mit Einordnung und Pause-Button, darunter das Laufband.
   Der Button ist ein Toggle (aria-pressed) mit gleichbleibendem Namen; das Icon zeigt den
   Zustand. Bei reduzierter Bewegung steht das Band still, der Button entfällt (CSS). */
function TrustBand() {
  const [paused, setPaused] = React.useState(false);
  return (
    <div className="dd-trust">
      <div className="dd-trust-bar">
        <div className="dd-trust-head">
          <p className="dd-trust-copy">
            <span className="dd-trust-title">Von D2C-Brand bis Konzern.</span>{' '}
            <span className="dd-trust-sub">Marken, die uns zu dem machen, was wir sind.</span>
          </p>
          <button type="button" className="dd-trust-toggle" aria-controls="dd-trust-marquee"
                  aria-pressed={paused} aria-label="Logo-Laufband pausieren"
                  onClick={() => setPaused((v) => !v)}>
            {paused ? <PlayIcon /> : <PauseIcon />}
          </button>
        </div>
      </div>
      <LogoMarquee id="dd-trust-marquee" tone="dark" items={TRUST} speed={34} paused={paused} />
    </div>
  );
}

/* Titel mit optionalem Lime-Textmarker auf genau dem Teilstring `mark` */
function MarkedTitle({ title, mark }) {
  const at = mark ? title.indexOf(mark) : -1;
  if (at < 0) return title;
  return <>{title.slice(0, at)}<span className="dd-diff-mark">{mark}</span>{title.slice(at + mark.length)}</>;
}

export function Home({ onNavigate }) {
  return (
    <div>
      <div id="hero" className="dd-hero-wrap dd-on-dark">
        <Aurora origin="right" intensity={0.28} speed={64} />
        <Hero onNavigate={onNavigate} />
        <TrustBand />
      </div>

      <ServiceBadges id="leistungen" />

      <Section tone="white">
        <SectionHeading kicker="Was uns anders macht" title="Substanz statt Show." lead="Klassische Agenturen verkaufen Stunden und Präsentationen. Wir haben das Modell an drei Stellen umgedreht:" />
        <div className="dd-diff">
          {DIFFERENCE.map((d, i) => (
            <div key={d.title} className="dd-diff-row" data-reveal data-reveal-delay={i * 80}>
              <h3 className="dd-diff-title"><MarkedTitle title={d.title} mark={d.mark} /></h3>
              <p className="dd-diff-body">{d.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="referenzen" tone="ink">
        <SectionHeading tone="dark" kickerTone="underline" kicker="Referenzprojekte" title="Woran wir gerade arbeiten." lead="Keine Hochglanz-Cases von vor fünf Jahren. Das hier läuft. Jetzt." />
        <CaseGrid cases={CASES} />
      </Section>

      <PhaseFlow id="phasen" phases={PHASES}
        kicker="So läuft es ab"
        title="Vom Chaos zu klaren Entscheidungen."
        lead="Jeder Kunde steigt woanders ein. Deshalb stellen wir zuerst fest, in welcher Phase du steckst und wo das Problem wirklich liegt. Notfalls gehen wir eine Phase zurück, um es grundlegend zu lösen." />

      <SetupCheck
        headline="Der Setup-Check: Wir sagen dir, wo's hängt."
        intro="30 Minuten, deine Zahlen, unser Blick von außen. Wir sagen dir ehrlich, in welcher Phase du bist und was als Nächstes zu tun ist. Auch dann, wenn du es ohne uns umsetzt."
        steps={SETUP_STEPS}
        reassurance="Antwort innerhalb von 24 Stunden. Von David oder Thomas persönlich." />

      <Section id="team" tone="white">
        <SectionHeading kicker="Wer entscheidet" title="Du redest mit denen, die entscheiden." lead="Alles andere holen wir gezielt dazu." />
        <TeamStructure people={TEAM} network={NETWORK} networkFaces={NETWORK_FACES}
          hubLabel="Netzwerk aus Spezialisten"
          networkNote="Für Paid, Tech, Logistik und Creative holen wir Spezialisten dazu, die wir seit Jahren kennen. Benannt, nicht anonym, und geführt von uns."
          assetBase="/assets" />
      </Section>

      <Section tone="paper">
        <SectionHeading kicker="Woran wir glauben" title="Sechs Sätze, an denen du uns messen kannst." />
        <ManifestList lines={MANIFEST} />
      </Section>

      <Section id="faq" tone="white">
        <SectionHeading kicker="Antworten von David · ungefiltert" title="Die Fragen, die immer kommen." />
        <FaqChat defaultOpenId={0} items={FAQS.map(([q, a], i) => ({ id: i, question: q, answer: a }))} />
      </Section>
    </div>
  );
}
