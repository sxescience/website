# CMS und Contentpflege

Stand: 2026-06-08

## Entscheidung

Sveltia CMS bleibt das einzige CMS für diese Website.

Sanity wurde geprüft, aber nicht gewählt: Sanity ist technisch kostenlos nutzbar, der Free Plan ist für echte Redaktion aber nicht passend, wenn Redakteure keine Administratoren sein sollen. Deshalb bleibt der Content Git-basiert in diesem Repository.

Nicht verwendet:

- Sanity: wegen Free-Plan-Rollenmodell nicht passend.
- TinaCMS: Visual Editing ist für SvelteKit nicht stark genug.
- Pages CMS: gute Git-CMS-Alternative, löst aber das visuelle Problem kaum besser als eine vereinfachte Sveltia-Konfiguration.
- Eigene Datenbank, eigener Server oder eigenes CMS: bewusst ausgeschlossen.

## Content-Wartung

1. Website öffnen.
2. `/admin` öffnen.
3. In Sveltia CMS mit GitHub bzw. GitHub-Token anmelden.
4. Inhalte bearbeiten.
5. Änderungen speichern.
6. Sveltia erstellt einen Commit in `main`.
7. Vercel deployed automatisch.

Redakteure brauchen Schreibzugriff auf das GitHub-Repository. Es gibt keine Datenbank und keinen dauerhaft laufenden Server.

## Bearbeitbare Inhalte

Sveltia zeigt drei Bereiche:

- Startseite
- Podcast
- Impressum & Datenschutz

Die Startseite folgt der sichtbaren Seitenstruktur:

1. Hero
2. Über SxE
3. Infografiken
4. FAQ
5. Podcast-Teaser
6. Ressourcen
7. Kontakt
8. Footer
9. SEO & Social Sharing

Die Team-Sektion ist aktuell im Frontend ausgeblendet und deshalb auch nicht im CMS sichtbar.

## Content-Dateien

Die bearbeitbaren JSON-Dateien liegen hier:

- `src/lib/content/landing-content.json`
- `src/lib/content/podcast-settings.json`
- `src/lib/content/legal-content.json`

Die Website lädt diese Dateien über `src/lib/cms/service.ts`. Die Mapper in `src/lib/cms/mappers.ts` validieren die Daten und setzen Defaults für technische Werte, die im CMS nicht mehr angezeigt werden.

## Technische Defaults

Folgende Werte sind absichtlich nicht mehr in der CMS-Oberfläche:

- Header-Markenname und Untertitel
- Skip-Link und Theme-/Sprachwechsel-Labels
- Navigationsanker
- Team-Inhalte

Wenn diese Felder nach einem CMS-Save nicht mehr in der JSON-Datei stehen, setzt die App sichere Defaults. Dadurch bleibt die CMS-Oberfläche einfacher und die Website trotzdem stabil.

## Podcast

Podcast-Folgen werden nicht manuell gepflegt. Im CMS wird nur die zentrale RSS-Feed-URL gepflegt. Landing Page und `/podcast` nutzen dieselbe RSS-Quelle.

Für lokale Tests ist aktuell ein Sample-Feed möglich:

```txt
/assets/apple-rss-sample.xml
```

Später wird dieser Wert im CMS durch die echte Podcast-RSS-URL ersetzt.

## Deployment

Das Setup ist Vercel-kompatibel:

- Keine Datenbank
- Kein eigener Server
- Keine kostenpflichtigen CMS-Abhängigkeiten
- Content-Änderungen laufen über Git-Commits
- Vercel deployed nach jedem Commit

## Quellen

- Sveltia CMS: https://sveltiacms.app/en/docs/intro
- Sanity Pricing: https://www.sanity.io/pricing?lang=en
- TinaCMS Frameworks: https://tina.io/docs/integration/frameworks/
- Pages CMS: https://pagescms.org/docs/
