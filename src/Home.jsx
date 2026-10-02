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

const TRUST = [
  { name: 'Aqmos', logo: '/assets/clients/aqmos.webp' },
  { name: 'Hagleitner', logo: '/assets/clients/hagleitner.webp', height: 38 },
  { name: 'Gamechangersocks', logo: '/assets/clients/gamechangersocks.webp' },
  { name: 'BWT', logo: '/assets/clients/bwt.webp', height: 34 },
  { name: 'Ecosoft', logo: '/assets/clients/ecosoft.webp' }
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
    result: '+50 % Monatsumsatz. Durch Struktur, nicht durch Budget.',
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

function Hero({ onNavigate }) {
  return (
    <div className="dd-hero" style={{ position: 'relative' }}>
      <div style={{ maxWidth: 'var(--measure-wide)', margin: '0 auto' }}>
        <div style={{ marginBottom: 'var(--space-5)' }}><Kicker tone="limeText">E-Commerce-Partner · Salzburg</Kicker></div>
        <h1 style={{ font: 'var(--text-h1)', fontSize: 'var(--fs-h1)', letterSpacing: 'var(--ls-heading)', margin: 0, maxWidth: 'var(--measure-headline)' }}>
          Die richtige Entscheidung für <WordRotator words={ROTATOR} />
        </h1>
        <p style={{ font: 'var(--text-lead)', color: 'var(--text-on-dark-secondary)', maxWidth: 560, margin: 'var(--space-6) 0 var(--space-8)', textWrap: 'pretty' }}>
          Wir führen dein E-Commerce-Geschäft, als wäre es unser eigenes. Strategie und Umsetzung, ein Team, das entscheidet und dazu steht.
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <Button arrow onClick={() => onNavigate('home', 'setup-check')}>Kostenlosen Setup-Check holen</Button>
          <Button variant="ghostDark" href="#phasen">Wie wir arbeiten</Button>
        </div>
        <div style={{ font: 'var(--text-caption)', color: 'var(--text-on-dark-secondary)', marginTop: 'var(--space-4)' }}>
          30 Minuten · ehrliche Einschätzung · kein Pitch
        </div>
      </div>
    </div>
  );
}

export function Home({ onNavigate }) {
  return (
    <div>
      <div id="hero" style={{ position: 'relative', background: 'var(--surface-dark)', color: 'var(--text-on-dark)' }}>
        <Aurora origin="top-right" />
        <Hero onNavigate={onNavigate} />
        <div style={{ position: 'relative', padding: 'var(--space-10) 0 var(--space-12)' }}>
          <div style={{ maxWidth: 'var(--measure)', margin: '0 auto var(--space-8)', padding: '0 var(--pad-page-x)', textAlign: 'center' }}>
            <div style={{ font: 'var(--text-lead)', color: 'var(--text-on-dark)', textWrap: 'pretty' }}>Von D2C-Brand bis Konzern.</div>
            <div style={{ font: 'var(--text-copy)', color: 'var(--text-on-dark-secondary)', marginTop: 'var(--space-2)', textWrap: 'pretty' }}>Marken, die uns zu dem machen, was wir sind.</div>
          </div>
          <LogoMarquee tone="dark" items={TRUST} speed={34} />
        </div>
      </div>

      <ServiceBadges id="leistungen" />

      <Section tone="white">
        <SectionHeading kicker="Was uns anders macht" title="Substanz statt Show." lead="Klassische Agenturen verkaufen Stunden und Präsentationen. Wir haben das Modell an drei Stellen umgedreht:" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-10)' }}>
          {DIFFERENCE.map(([t, b], i) => (
            <div key={t} data-reveal data-reveal-delay={i * 80}>
              <div style={{ font: 'var(--text-h2)', fontSize: 'var(--fs-h2)', letterSpacing: 'var(--ls-heading)', marginBottom: 'var(--space-3)', color: i === 2 ? 'var(--dd-lime)' : 'var(--dd-ink)' }}>{'0' + (i + 1)}</div>
              <div style={{ font: 'var(--text-h3)', fontWeight: 'var(--fw-bold)', fontSize: 20, letterSpacing: 'var(--ls-heading)', marginBottom: 'var(--space-2)' }}>{t}</div>
              <p style={{ font: 'var(--text-copy)', color: 'var(--text-secondary)', margin: 0, textWrap: 'pretty' }}>{b}</p>
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
