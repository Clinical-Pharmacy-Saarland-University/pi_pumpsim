// Web demo only: Impressum (§ 5 DDG, § 18 Abs. 2 MStV) and Datenschutzerklärung
// (DSGVO Art. 13) for the public GitHub Pages site. Adapted from the department's
// app template (Clinical-Pharmacy-Saarland-University/apptemplate, docs/legal) for a
// static site: no backend, no storage, hosted by GitHub Pages. Documents, not UI
// strings, so they live here and not in locale.svelte.ts. German is legally
// authoritative; English is a translation. The Pi kiosk never shows them.

export type LegalBlock =
  | { kind: 'p'; text: string }
  | { kind: 'ul'; items: string[] }
  | { kind: 'address'; text: string } // newlines become line breaks
  | { kind: 'link'; href: string; text: string }

export interface LegalSection {
  heading?: string
  blocks: LegalBlock[]
}

export interface LegalDoc {
  title: string
  updatedLabel: string
  intro?: string
  sections: LegalSection[]
}

const APP_NAME = {
  de: 'Dr. Dosis – SafePolyMed Interaktions-Simulator (Web-Demo)',
  en: 'Dr. Dosis – SafePolyMed Interaction Simulator (web demo)',
}

/** Date the texts were last reviewed. Update whenever the copy changes. */
const LEGAL_LAST_UPDATED = {
  de: 'Stand: 30. Oktober 2026',
  en: 'Last updated: 30 October 2026',
}

const ORGANISATION = {
  entity: 'Universität des Saarlandes',
  entityEn: 'Saarland University',
  department: 'Klinische Pharmazie',
  departmentEn: 'Clinical Pharmacy',
  street: 'Campus C4 3',
  city: '66123 Saarbrücken',
  country: 'Deutschland',
  countryEn: 'Germany',
  representedBy:
    'Die Präsidentin / der Präsident der Universität des Saarlandes als gesetzliche Vertretung der Körperschaft des öffentlichen Rechts.',
  representedByEn:
    'The President of Saarland University, as the legal representative of this public-law institution.',
  contactPerson: 'Prof. Dr. Thorsten Lehr',
  email: 'thorsten.lehr@uni-saarland.de',
  website: 'www.clinicalpharmacy.me',
} as const

const DATA_PROTECTION_OFFICER = {
  label: 'Datenschutzbeauftragte:r der Universität des Saarlandes',
  labelEn: 'Data Protection Officer of Saarland University',
  email: 'datenschutz@uni-saarland.de',
} as const

const SUPERVISORY_AUTHORITY = {
  name: 'Unabhängiges Datenschutzzentrum Saarland',
  address: 'Fritz-Dobisch-Straße 12, 66111 Saarbrücken',
  website: 'https://www.datenschutz.saarland.de',
} as const

const HOSTING = {
  name: 'GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, USA',
  privacyUrl: 'https://docs.github.com/site-policy/privacy-policies/github-general-privacy-statement',
} as const

const PROJECT_URL = 'https://safepolymed.eu'

const ADDRESS_DE = `${ORGANISATION.entity}\n${ORGANISATION.department} (${ORGANISATION.departmentEn})\n${ORGANISATION.street}\n${ORGANISATION.city}\n${ORGANISATION.country}`
const ADDRESS_EN = `${ORGANISATION.entityEn}\n${ORGANISATION.departmentEn} (${ORGANISATION.department})\n${ORGANISATION.street}\n${ORGANISATION.city}\n${ORGANISATION.countryEn}`
const CONTACT_DE = `${ORGANISATION.contactPerson}\n${ORGANISATION.department}\n${ORGANISATION.entity}, ${ORGANISATION.street}\n${ORGANISATION.city}\nE-Mail: ${ORGANISATION.email}\nWeb: https://${ORGANISATION.website}`
const CONTACT_EN = `${ORGANISATION.contactPerson}\n${ORGANISATION.departmentEn}\n${ORGANISATION.entityEn}, ${ORGANISATION.street}\n${ORGANISATION.city}, ${ORGANISATION.countryEn}\nE-mail: ${ORGANISATION.email}\nWeb: https://${ORGANISATION.website}`

// ---------------------------------------------------------------------------
// Impressum
// ---------------------------------------------------------------------------

export const imprint: Record<'de' | 'en', LegalDoc> = {
  de: {
    title: 'Impressum',
    updatedLabel: LEGAL_LAST_UPDATED.de,
    sections: [
      { heading: 'Angaben gemäß § 5 DDG', blocks: [{ kind: 'address', text: ADDRESS_DE }] },
      { heading: 'Vertreten durch', blocks: [{ kind: 'p', text: ORGANISATION.representedBy }] },
      { heading: 'Kontakt', blocks: [{ kind: 'address', text: CONTACT_DE }] },
      {
        heading: 'Umsatzsteuer-Identifikationsnummer',
        blocks: [
          {
            kind: 'p',
            text: `Nicht zutreffend – ${APP_NAME.de} wird im Rahmen der wissenschaftlichen Forschung und Lehre nicht-kommerziell betrieben.`,
          },
        ],
      },
      {
        heading: 'Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV',
        blocks: [
          {
            kind: 'address',
            text: `${ORGANISATION.contactPerson}\n${ORGANISATION.department}, ${ORGANISATION.entity}\n${ORGANISATION.street}, ${ORGANISATION.city}`,
          },
        ],
      },
      {
        heading: 'Förderhinweis',
        blocks: [
          {
            kind: 'p',
            text: 'Die Web-Demo entstand im Forschungsprojekt SafePolyMed, gefördert durch das Programm Horizon Europe der Europäischen Union.',
          },
          { kind: 'link', href: PROJECT_URL, text: 'safepolymed.eu' },
        ],
      },
      {
        heading: 'Haftungshinweis',
        blocks: [
          {
            kind: 'p',
            text: `${APP_NAME.de} ist ein Lernspiel mit fiktiven Patientenfällen und ersetzt keine ärztliche oder pharmazeutische Beratung. Inhalte werden mit Sorgfalt erstellt; für Richtigkeit, Vollständigkeit und Aktualität wird keine Gewähr übernommen. Für Inhalte externer Webseiten, auf die verwiesen wird, sind ausschließlich deren Betreiber verantwortlich.`,
          },
        ],
      },
    ],
  },
  en: {
    title: 'Legal Notice',
    updatedLabel: LEGAL_LAST_UPDATED.en,
    intro: 'The German version of this notice is legally authoritative.',
    sections: [
      {
        heading: 'Information pursuant to § 5 DDG (German Digital Services Act)',
        blocks: [{ kind: 'address', text: ADDRESS_EN }],
      },
      { heading: 'Legal representative', blocks: [{ kind: 'p', text: ORGANISATION.representedByEn }] },
      { heading: 'Contact', blocks: [{ kind: 'address', text: CONTACT_EN }] },
      {
        heading: 'VAT identification number',
        blocks: [
          {
            kind: 'p',
            text: `Not applicable – ${APP_NAME.en} is operated non-commercially as part of academic research and teaching.`,
          },
        ],
      },
      {
        heading: 'Responsible for content pursuant to § 18 (2) MStV',
        blocks: [
          {
            kind: 'address',
            text: `${ORGANISATION.contactPerson}\n${ORGANISATION.departmentEn}, ${ORGANISATION.entityEn}\n${ORGANISATION.street}, ${ORGANISATION.city}`,
          },
        ],
      },
      {
        heading: 'Funding',
        blocks: [
          {
            kind: 'p',
            text: 'This web demo was created in the research project SafePolyMed, funded by the European Union’s Horizon Europe programme.',
          },
          { kind: 'link', href: PROJECT_URL, text: 'safepolymed.eu' },
        ],
      },
      {
        heading: 'Liability',
        blocks: [
          {
            kind: 'p',
            text: `${APP_NAME.en} is an educational game with fictional patient cases and does not replace medical or pharmaceutical advice. Content is prepared with care; no warranty is given for accuracy, completeness or currency. Operators of linked external websites are solely responsible for their content.`,
          },
        ],
      },
    ],
  },
}

// ---------------------------------------------------------------------------
// Datenschutzerklärung (DSGVO Art. 13)
// ---------------------------------------------------------------------------

export const privacy: Record<'de' | 'en', LegalDoc> = {
  de: {
    title: 'Datenschutzerklärung',
    updatedLabel: LEGAL_LAST_UPDATED.de,
    sections: [
      {
        heading: '1. Verantwortlicher',
        blocks: [
          { kind: 'address', text: ADDRESS_DE },
          { kind: 'p', text: `Kontakt zur Anwendung: ${ORGANISATION.contactPerson}, ${ORGANISATION.email}` },
        ],
      },
      {
        heading: '2. Datenschutzbeauftragte:r',
        blocks: [
          { kind: 'address', text: `${DATA_PROTECTION_OFFICER.label}\nE-Mail: ${DATA_PROTECTION_OFFICER.email}` },
        ],
      },
      {
        heading: '3. Welche Daten werden verarbeitet?',
        blocks: [
          {
            kind: 'ul',
            items: [
              'Spielablauf: Die Web-Demo läuft vollständig in Ihrem Browser. Ihre Auswahl (Sprache, Altersgruppe, Antworten im Spiel) wird nur im Arbeitsspeicher Ihres Browsers verarbeitet, nicht gespeichert und an niemanden übertragen. Alle Patientenfälle sind fiktiv; es werden keine Gesundheitsdaten erhoben.',
              'Technische Zugriffsdaten: Die Seite wird über GitHub Pages ausgeliefert. Dabei verarbeitet GitHub technisch notwendige Zugriffsdaten wie Ihre IP-Adresse, den Zeitpunkt des Abrufs, die angefragte Datei und die Browser-Kennung, u. a. zur Gewährleistung der Sicherheit. Wir selbst haben auf diese Protokolle keinen Zugriff.',
            ],
          },
        ],
      },
      {
        heading: '4. Zwecke und Rechtsgrundlagen',
        blocks: [
          {
            kind: 'p',
            text: 'Zweck ist die Bereitstellung eines Lernspiels zur Arzneimittelsicherheit im Rahmen der Wissenschaftskommunikation des Forschungsprojekts SafePolyMed.',
          },
          {
            kind: 'ul',
            items: [
              'Art. 6 Abs. 1 lit. e DSGVO i. V. m. § 4 SDSG (Aufgabe im öffentlichen Interesse – universitäre Forschung, Lehre und Wissenschaftskommunikation).',
              'Für die technischen Zugriffsdaten: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einer sicheren und stabilen Bereitstellung).',
            ],
          },
        ],
      },
      {
        heading: '5. Empfänger und Übermittlung in Drittländer',
        blocks: [
          {
            kind: 'p',
            text: `Hosting-Dienstleister: ${HOSTING.name} (GitHub Pages). Dabei können Zugriffsdaten in die USA übermittelt werden. GitHub ist unter dem EU-U.S. Data Privacy Framework zertifiziert; die Übermittlung stützt sich auf den Angemessenheitsbeschluss der EU-Kommission (Art. 45 DSGVO). Einzelheiten enthält die Datenschutzerklärung von GitHub:`,
          },
          { kind: 'link', href: HOSTING.privacyUrl, text: 'GitHub General Privacy Statement' },
          {
            kind: 'p',
            text: 'Darüber hinaus werden keine Daten an Dritte weitergegeben. Die Web-Demo lädt keine externen Skripte, Schriftarten oder Analysedienste. Der Link zu safepolymed.eu führt auf eine externe Website; erst wenn Sie ihn anklicken, werden Daten an deren Betreiber übertragen.',
          },
        ],
      },
      {
        heading: '6. Cookies und lokale Speicherung',
        blocks: [
          {
            kind: 'p',
            text: 'Die Web-Demo setzt keine Cookies und speichert nichts in Ihrem Browser (kein localStorage). Es werden keine Tracking- oder Analysedienste verwendet.',
          },
        ],
      },
      {
        heading: '7. Speicherdauer',
        blocks: [
          {
            kind: 'ul',
            items: [
              'Spielablauf: keine Speicherung – beim Schließen oder Neuladen der Seite wird alles verworfen.',
              'Technische Zugriffsdaten bei GitHub: nach den Vorgaben von GitHub (siehe Abschnitt 5).',
            ],
          },
        ],
      },
      {
        heading: '8. Ihre Rechte',
        blocks: [
          {
            kind: 'p',
            text: 'Sie haben das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20) und Widerspruch (Art. 21). Wenden Sie sich hierfür an die/den Datenschutzbeauftragte:n (Abschnitt 2). Eine automatisierte Einzelfallentscheidung im Sinne von Art. 22 DSGVO findet nicht statt.',
          },
        ],
      },
      {
        heading: '9. Beschwerderecht',
        blocks: [
          {
            kind: 'address',
            text: `Unbeschadet eines anderweitigen Rechtsbehelfs steht Ihnen das Recht auf Beschwerde bei einer Aufsichtsbehörde zu:\n${SUPERVISORY_AUTHORITY.name}\n${SUPERVISORY_AUTHORITY.address}\n${SUPERVISORY_AUTHORITY.website}`,
          },
        ],
      },
    ],
  },
  en: {
    title: 'Privacy Notice',
    updatedLabel: LEGAL_LAST_UPDATED.en,
    intro: 'The German version of this notice is legally authoritative.',
    sections: [
      {
        heading: '1. Controller',
        blocks: [
          { kind: 'address', text: ADDRESS_EN },
          { kind: 'p', text: `Application contact: ${ORGANISATION.contactPerson}, ${ORGANISATION.email}` },
        ],
      },
      {
        heading: '2. Data Protection Officer',
        blocks: [
          { kind: 'address', text: `${DATA_PROTECTION_OFFICER.labelEn}\nE-mail: ${DATA_PROTECTION_OFFICER.email}` },
        ],
      },
      {
        heading: '3. What data is processed?',
        blocks: [
          {
            kind: 'ul',
            items: [
              'Gameplay: the web demo runs entirely in your browser. Your choices (language, age group, answers in the game) are processed only in your browser’s memory, are not stored and are not sent to anyone. All patient cases are fictional; no health data is collected.',
              'Technical access data: the site is delivered by GitHub Pages. GitHub processes technically necessary access data such as your IP address, time of access, requested file and browser identifier, among other things for security purposes. We have no access to these logs ourselves.',
            ],
          },
        ],
      },
      {
        heading: '4. Purposes and legal basis',
        blocks: [
          {
            kind: 'p',
            text: 'The purpose is to provide an educational game on medication safety as part of the science communication of the research project SafePolyMed.',
          },
          {
            kind: 'ul',
            items: [
              'Art. 6(1)(e) GDPR in conjunction with § 4 SDSG (task in the public interest – university research, teaching and science communication).',
              'For technical access data: Art. 6(1)(f) GDPR (legitimate interest in secure and stable delivery).',
            ],
          },
        ],
      },
      {
        heading: '5. Recipients and third-country transfers',
        blocks: [
          {
            kind: 'p',
            text: `Hosting provider: ${HOSTING.name} (GitHub Pages). Access data may be transferred to the USA. GitHub is certified under the EU-U.S. Data Privacy Framework; the transfer is based on the European Commission’s adequacy decision (Art. 45 GDPR). Details are in GitHub’s privacy statement:`,
          },
          { kind: 'link', href: HOSTING.privacyUrl, text: 'GitHub General Privacy Statement' },
          {
            kind: 'p',
            text: 'Beyond that, no data is shared with third parties. The web demo loads no external scripts, fonts or analytics. The link to safepolymed.eu leads to an external website; data is sent to its operator only when you click it.',
          },
        ],
      },
      {
        heading: '6. Cookies and local storage',
        blocks: [
          {
            kind: 'p',
            text: 'The web demo sets no cookies and stores nothing in your browser (no localStorage). No tracking or analytics services are used.',
          },
        ],
      },
      {
        heading: '7. Retention',
        blocks: [
          {
            kind: 'ul',
            items: [
              'Gameplay: not stored – everything is discarded when you close or reload the page.',
              'Technical access data at GitHub: according to GitHub’s policies (see section 5).',
            ],
          },
        ],
      },
      {
        heading: '8. Your rights',
        blocks: [
          {
            kind: 'p',
            text: 'You have the right to access (Art. 15 GDPR), rectification (Art. 16), erasure (Art. 17), restriction of processing (Art. 18), data portability (Art. 20) and objection (Art. 21). Contact the Data Protection Officer (section 2) to exercise them. No automated individual decision-making within the meaning of Art. 22 GDPR takes place.',
          },
        ],
      },
      {
        heading: '9. Right to lodge a complaint',
        blocks: [
          {
            kind: 'address',
            text: `Without prejudice to any other remedy, you have the right to lodge a complaint with a supervisory authority:\n${SUPERVISORY_AUTHORITY.name}\n${SUPERVISORY_AUTHORITY.address}\n${SUPERVISORY_AUTHORITY.website}`,
          },
        ],
      },
    ],
  },
}
