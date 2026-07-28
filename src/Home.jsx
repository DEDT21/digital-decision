import React from 'react';
import { Section } from './components/sections/Section.jsx';
import { SectionHeading } from './components/sections/SectionHeading.jsx';
import { Button } from './components/core/Button.jsx';
import { Kicker } from './components/core/Kicker.jsx';
import { WordRotator } from './components/core/WordRotator.jsx';
import { Aurora } from './components/sections/Aurora.jsx';
import { CaseGrid } from './components/sections/CaseGrid.jsx';
import { UseCaseSteps } from './components/sections/UseCaseSteps.jsx';
import { ManifestList } from './components/sections/ManifestList.jsx';
import { SetupCheck } from './components/sections/SetupCheck.jsx';
import { FaqChat } from './components/sections/FaqChat.jsx';
import { PhaseFlow } from './components/sections/PhaseFlow.jsx';
import { LogoMarquee } from './components/sections/LogoMarquee.jsx';
import { TeamStructure } from './components/sections/TeamStructure.jsx';

const ROTATOR = ['deinen Online Shop.', 'deine Website.', 'deine Ads.', 'deine Marke.', 'deinen Relaunch.', 'dein Amazon-Business.', 'dein Wachstum.'];

const TRUST = [
  { name: 'Aqmos', logo: '/assets/clients/aqmos.webp' },
  { name: 'Hagleitner', logo: '/assets/clients/hagleitner.webp', height: 38 },
  { name: 'Gamechangersocks', logo: '/assets/clients/gamechangersocks.webp' },
  { name: 'BWT', logo: '/assets/clients/bwt.webp', height: 34 },
  { name: 'Ecosoft', logo: '/assets/clients/ecosoft.webp' }
];

const TARGETS = [
  ['Solide, aber es skaliert nicht.', 'Gutes Produkt, ein eingespieltes Team, der Shop läuft. Aber seit zwei Jahren steht dieselbe Umsatzzahl im Report — und keiner kann dir sagen, warum.'],
  ['Stationär stark, online blind.', 'Im Laden brummt es. Online: ein Shop, der nebenherläuft, Werbung ohne Plan, keine Zahlen, denen du traust. Du weißt, da liegt Umsatz — du kommst nur nicht ran.'],
  ['Von Agenturen verbrannt.', 'Mehrere Agenturen, Tools, schöne Präsentationen — und am Ende bist du es, der die Entscheidungen treffen muss? Diesmal soll jemand mitdenken. Und liefern.']
];

const DIFFERENCE = [
  ['Wir arbeiten in deinem Geschäft, nicht daneben.', 'Wir tauchen in Produkt, Zahlen und Abläufe ein und übernehmen auf Wunsch operative Rollen — vom Ads-Konto bis zur Shop-Migration. Nicht beraten und verschwinden, sondern machen und dableiben.'],
  ['Wir bauen auf, was funktioniert.', 'Dein Team, deine Systeme, deine bisherige Arbeit haben Wert. Wir reißen nichts ein, um uns wichtig zu machen — wir verbessern gezielt das, was Wachstum blockiert.'],
  ['Wir gehen mit ins Risiko.', 'Wenn es zum Projekt passt, koppeln wir einen Teil unseres Honorars an dein Ergebnis. Erfolg wird geteilt — im Risiko wie im Gewinn. Frag uns danach.']
];

const CASES = [
  { client: 'Aqmos', industry: 'Wasseraufbereitung · D2C + Marktplätze',
    result: '+50 % Monatsumsatz — durch Struktur, nicht durch Budget.',
    body: 'Wir haben Aqmos neu gebrandet und der Marke ein Gesicht gegeben — und steuern seitdem das operative E-Commerce-Geschäft über vier Kanäle. Die Monatsumsätze liegen im Jahresvergleich stabil bei +50 %, gewachsen durch Struktur im Marketing und im technischen E-Commerce.',
    tags: ['Rebranding', 'E-Commerce-Steuerung', '4+ Kanäle'] },
  { client: 'Hagi (Hagleitner)', industry: 'Hygiene · B2B-Konzern',
    result: 'Vom B2B-Marktführer zur D2C-Marke.',
    body: 'Hagleitner ist seit 50 Jahren Profi-Hygiene im B2B. Der erste Schritt zum Endkunden blieb unter den Möglichkeiten — jetzt bauen wir ihn neu: Shopify-Migration, neues Creative-Konzept, Relaunch von Google & Meta Ads. Aus einem B2B-Player wird eine D2C-Plattform.',
    tags: ['Shop-Migration', 'Ads-Relaunch', 'D2C-Strategie'] },
  { client: 'Gamechangersocks', industry: 'Fashion · D2C',
    result: 'Technischer E-Commerce, der Conversion bringt.',
    body: 'Hier arbeiten wir dort, wo Umsatz technisch entsteht: Conversion-Optimierung, Shop-Strategie und Planung. Weniger laut, dafür messbar — jede Änderung muss sich in der Conversion Rate zeigen.',
    tags: ['CRO', 'Shop-Strategie', 'Planung'] }
];

const PHASES = [
  { title: 'Chaos', body: 'Kanäle, Agenturen und Systeme laufen nebeneinander. Jeder macht irgendwas, keiner weiß, was wirkt.' },
  { title: 'Sortieren', body: 'Wir legen alles auf den Tisch: Zahlen, Tools, Zuständigkeiten. Was funktioniert, bleibt. Was blockiert, fliegt raus.' },
  { title: 'Klarheit', body: 'Jeder Kanal hat einen Job, jede Zahl einen Besitzer, jede Entscheidung eine Datengrundlage. Ab hier ist Wachstum planbar.' },
  { title: 'Vorsprung', body: 'Der Modus, in dem Gewinner bleiben: Test um Test, Verbesserung um Verbesserung — bis deine Kunden gar nicht mehr auf die Idee kommen, woanders zu kaufen.' }
];

const SETUP_STEPS = [
  { title: 'Du zeigst uns dein Setup.', body: 'Shop, Ads-Konten, die Zahlen, die dich nerven.' },
  { title: 'Wir sagen dir, was wir sehen.', body: 'Wo es hängt, was zuerst dran ist, was du dir sparen kannst.' },
  { title: 'Du entscheidest.', body: 'Selbst umsetzen, mit uns umsetzen — oder gar nicht. Kein Follow-up-Marathon, kein Pitch.' }
];

const TEAM = [
  { name: 'Thomas Jud', role: 'Geschäftsführer · Co-Founder', mail: 'thomas@digital-decision.at', photo: '/assets/team/thomas-jud.webp',
    line: 'Ein gutes Setup erkennst du daran, dass niemand mehr darüber reden muss.',
    bio: 'Denkt in Systemen, nicht in Kampagnen. Thomas sortiert seit Jahren Shops, Prozesse und Agentur-Landschaften — und migriert Systeme, ohne die funktionierenden Teile anzufassen.',
    callFor: ['Shop- & Systemarchitektur', 'Prozesse im operativen Geschäft', 'Agentur-Landschaften aufräumen'] },
  { name: 'David Edtmayer', role: 'Geschäftsführer · Co-Founder', mail: 'david@digital-decision.at', photo: '/assets/team/david-edtmayer.webp',
    line: 'Ich schaue mir zuerst die Zahlen an — und dann suche ich den Weg, den noch keiner geht.',
    bio: 'Baut seit seinem 15. Lebensjahr E-Commerce. Heute baut er die Systeme dahinter — AI-first, immer auf der Suche nach der besseren Lösung statt der gewohnten.',
    callFor: ['Wachstumsentscheidungen', 'Performance & Funnels', 'AI-gestützte Prozesse & neue Wege'] },
  { name: 'Lina', role: 'Marketing & Projektsteuerung',
    line: 'Kreativ ist nur, was am Ende auch rechnet.',
    bio: 'Marketing und Kreation mit BWL-Fundament: Lina entwickelt Kampagnen und Content — und prüft selbst nach, ob die Zahlen halten.',
    callFor: ['Kampagnen & Content', 'Reporting & Zahlenpflege', 'Status, Termine, Prioritäten'] }
];

const NETWORK = [
  { name: 'Paid', what: 'Paid Search, Paid Social, Feeds — geführt von uns, nicht blind ausgelagert.' },
  { name: 'Tech', what: 'Entwicklung an bestehenden Systemen, Schnittstellen, Migrationen.' },
  { name: 'Logistik', what: 'Fulfillment, Versandkosten, Retourenprozesse.' },
  { name: 'Creative', what: 'Foto, Video, Ads-Assets — nach unserem Briefing, mit euren Produkten.' }
];

const NETWORK_FACES = [
  { name: 'BAM Creative', logo: '/assets/network/bam-creative.webp' },
  { name: 'Otago', logo: '/assets/network/otago.svg' },
  { name: 'Spreadfilms', logo: '/assets/network/spreadfilms.svg', dark: true },
  { name: 'WBFK', logo: '/assets/network/wbfk.svg', dark: true },
  { name: 'WIRO', logo: '/assets/network/wiro.svg', dark: true },
  { name: 'Partner', logo: '/assets/network/partner-1c.svg', dark: true }
];

const MANIFEST = [
  'Echte Expertise statt Alleskönner.',
  'Nutzen, was funktioniert — statt alles neu zu bauen.',
  'Verantwortung übernehmen — unternehmerisch und operativ.',
  'Tief eintauchen statt oberflächlich beraten.',
  'Sensibel sortieren, nicht brachial.',
  'Partnerschaft — auch finanziell.'
];

const FAQS = [
  ['Wir haben schon schlechte Erfahrungen mit Agenturen gemacht. Warum sollte es mit euch anders laufen?', 'Verstehen wir — ein Teil unserer Kunden kam genau so zu uns. Der Unterschied: Wir verkaufen keine Stunden, sondern übernehmen Verantwortung für Ergebnisse. Deshalb starten wir mit einem kostenlosen Setup-Check statt einem Pitch, arbeiten in deinem operativen Geschäft statt daneben — und koppeln unser Honorar auf Wunsch an dein Ergebnis. Wenn wir nicht überzeugt sind, dass wir dir helfen können, sagen wir das im Check. Dann hast du eine ehrliche Einschätzung — gratis.'],
  ['Bietet ihr erfolgsbasierte Vergütung an?', 'Ja, wenn es zum Projekt passt. Wir sind bereit, unser Honorar teilweise an unternehmerische Ergebnisse zu koppeln. Erfolg wird geteilt: im Risiko wie im Gewinn.'],
  ['Entwickelt ihr alles komplett neu?', 'Nur wenn es sinnvoll ist. Wir nutzen, was bereits funktioniert — bestehende Systeme, Prozesse, Teams — und verbessern gezielt das, was blockiert.'],
  ['Was passiert, wenn schon ein Team oder andere Agenturen beteiligt sind?', 'Wir sortieren sensibel, nicht brachial. Wir schauen respektvoll, was funktioniert, und bringen Struktur rein — ohne Chaos und ohne Politik.'],
  ['Übernehmt ihr auch operative Verantwortung?', 'Ja. Von strategischer Steuerung bis zur Umsetzung im Tagesgeschäft — immer mit klarem Ziel: Wachstum, Effizienz, messbare Ergebnisse.'],
  ['Passt ihr zu jedem Unternehmen?', 'Nein. Wir passen zu Unternehmen, die echte Zusammenarbeit und klare Entscheidungen wollen — und kein weiteres Agenturfeuerwerk.']
];

function Hero({ onNavigate }) {
  return (
    <div style={{ position: 'relative', padding: 'var(--space-16) var(--pad-page-x) var(--space-24)' }}>
      <div style={{ maxWidth: 'var(--measure-wide)', margin: '0 auto' }}>
        <div style={{ marginBottom: 'var(--space-5)' }}><Kicker tone="limeText">digital decision · E-Commerce-Partner</Kicker></div>
        <h1 style={{ font: 'var(--text-h1)', fontSize: 'var(--fs-h1)', letterSpacing: 'var(--ls-heading)', margin: 0, maxWidth: 'var(--measure-headline)' }}>
          Die richtige Entscheidung für <WordRotator words={ROTATOR} />
        </h1>
        <p style={{ font: 'var(--text-lead)', color: 'var(--text-on-dark-secondary)', maxWidth: 560, margin: 'var(--space-6) 0 var(--space-8)', textWrap: 'pretty' }}>
          Wir führen dein E-Commerce-Geschäft, als wäre es unser eigenes. Strategie und Umsetzung, ein Team, das entscheidet — und dazu steht.
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <Button onClick={() => onNavigate('home', 'setup-check')}>Kostenlosen Setup-Check holen</Button>
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
          <div style={{ maxWidth: 'var(--measure)', margin: '0 auto var(--space-8)', padding: '0 var(--pad-page-x)', textAlign: 'center', font: 'var(--text-lead)', color: 'var(--text-on-dark-secondary)', textWrap: 'pretty' }}>
            Von D2C-Brand bis Konzern — Marken, die uns ihr E-Commerce anvertrauen.
          </div>
          <LogoMarquee tone="dark" items={TRUST} speed={34} />
        </div>
      </div>

      <UseCaseSteps id="leistungen"
        kicker="Kommt dir bekannt vor?"
        title="Drei Situationen, in denen wir richtig sind."
        closer="In allen drei Fällen ist das Problem selten fehlender Einsatz. Es ist fehlende Struktur — und niemand, der entscheidet."
        cases={TARGETS.map(([title, body]) => ({ title, body }))} />

      <Section tone="white">
        <SectionHeading kicker="Was uns anders macht" title="Substanz statt Show." lead="Klassische Agenturen verkaufen Stunden und Präsentationen. Wir haben das Modell umgedreht — an drei Stellen:" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-10)' }}>
          {DIFFERENCE.map(([t, b], i) => (
            <div key={t}>
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
        lead="Jeder Kunde steigt woanders ein. Deshalb stellen wir zuerst fest, in welcher Phase du steckst und wo das Problem wirklich liegt — notfalls gehen wir eine Phase zurück, um es grundlegend zu lösen." />

      <SetupCheck
        headline="Der Setup-Check: Wir sagen dir, wo's hängt."
        intro="30 Minuten, deine Zahlen, unser Blick von außen. Wir sagen dir ehrlich, in welcher Phase du bist und was als Nächstes zu tun ist — auch wenn du es ohne uns umsetzt."
        steps={SETUP_STEPS}
        reassurance="Antwort innerhalb von 24 Stunden — von David oder Thomas persönlich." />

      <Section id="team" tone="white">
        <SectionHeading kicker="Wer entscheidet" title="Du redest mit denen, die entscheiden." lead="Alles andere holen wir gezielt dazu — benannt, nicht anonym." />
        <TeamStructure people={TEAM} network={NETWORK} networkFaces={NETWORK_FACES}
          hubLabel="Netzwerk aus Spezialisten"
          networkNote="Benannt, nicht anonym: Für Paid, Tech, Logistik und Creative holen wir Spezialisten dazu, die wir seit Jahren kennen — geführt von uns, nicht blind ausgelagert."
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
