import type { HomeContent, LegalContent, PodcastLink } from "./types";

const FALLBACK_PODCAST_LINKS: PodcastLink[] = [
	{ label: "Apple Podcasts", url: "https://podcasts.apple.com/" },
	{ label: "Spotify", url: "https://open.spotify.com/" },
	{ label: "Amazon Music", url: "https://music.amazon.de/podcasts" },
	{ label: "YouTube", url: "https://www.youtube.com/" },
	{ label: "YouTube Music", url: "https://music.youtube.com/" }
];

function getFallbackPodcastLinks(): PodcastLink[] {
	return FALLBACK_PODCAST_LINKS.map((link) => ({ ...link }));
}

export const fallbackHomeContent: HomeContent = {
	site: {
		brandName: "Forschung mit Folgen",
		skipLinkLabel: "Zum Inhalt springen",
		navMainThemeLabel: "Thema & News",
		navMissionLabel: "Mission",
		navNewsletterLabel: "Newsletter",
		navTeamLabel: "Team",
		navImpressumLabel: "Impressum",
		heroKicker: "Podcast",
		heroTitle: "Forschung mit Folgen",
		heroLead: "Ein Podcast über Forschung, die in der Realität etwas verändert: klar, fundiert und nutzbar.",
		heroPrimaryLabel: "Newsletter abonnieren",
		heroPrimaryHref: "#newsletter",
		heroSecondaryLabel: "Mission ansehen",
		heroSecondaryHref: "#mission",
		cmsChipTitle: "CMS-ready News",
		cmsChipBody:
			"Der News-Block ist für die direkte Anbindung an ein Headless CMS vorbereitet und aktuell mit Mock-Daten befüllt.",
		cmsChipTag1: "News Feed",
		cmsChipTag2: "Episode Updates",
		cmsChipTag3: "CMS Adapter",
		newsControlsAriaLabel: "Folgen-Navigation",
		newsCarouselAriaLabel: "Folgenkarussell",
		newsPreviousButtonLabel: "Zurück",
		newsPreviousButtonAriaLabel: "Vorherige Folge anzeigen",
		newsNextButtonLabel: "Weiter",
		newsNextButtonAriaLabel: "Nächste Folge anzeigen",
		missionKicker: "Mission",
		missionTitle: "Wissenschaft mit Klarheit, Kontext und Konsequenz",
		newsletterKicker: "Newsletter",
		newsletterTitle: "Keine Folge verpassen",
		newsletterLead: "Monatliche Updates zu neuen Episoden, Forschungstrends und Hintergründen aus der Redaktion.",
		newsletterEmailLabel: "E-Mail-Adresse",
		newsletterEmailPlaceholder: "name@beispiel.de",
		newsletterSubmitLabel: "Anmelden",
		teamKicker: "Team",
		teamTitle: "Das Team hinter dem Podcast",
		teamAvatarLabel: "Team",
		footerTitle: "Forschung mit Folgen",
		footerDescription: "Podcast zu wirksamer Forschung, klaren Erkenntnissen und praxisnahen Konsequenzen.",
		footerStartLabel: "Start",
		footerNewsLabel: "Folgen",
		footerImpressumLabel: "Impressum",
		footerDatenschutzLabel: "Datenschutz",
		themeToggleAriaLabel: "Farbmodus umschalten",
		themeLightModeLabel: "Hellmodus",
		themeDarkModeLabel: "Dunkelmodus",
		podcastModalCloseButtonAriaLabel: "Popup schließen",
		podcastModalEmptyStateText: "Für diese Folge sind noch keine Podcast-Links hinterlegt.",
		podcastModalYoutubeTitlePrefix: "YouTube-Einbettung",
		copyrightBrandName: "Forschung mit Folgen"
	},
	news: [
		{
			id: "folge-01",
			title: "Folge 01: Forschung und Wirkung",
			excerpt: "Wie neue Erkenntnisse aus Labor und Hochschule in Entscheidungen einfließen.",
			date: "2026-03-03",
			ctaLabel: "Folge anschauen",
			href: "#main-theme",
			podcastLinks: getFallbackPodcastLinks(),
			status: "published",
			order: 1
		},
		{
			id: "folge-02",
			title: "Folge 02: Daten und Verantwortung",
			excerpt: "Welche Standards Forschungsdaten brauchen, damit Vertrauen entstehen kann.",
			date: "2026-02-24",
			ctaLabel: "Folge anschauen",
			href: "#main-theme",
			podcastLinks: getFallbackPodcastLinks(),
			status: "published",
			order: 2
		},
		{
			id: "folge-03",
			title: "Folge 03: Transfer in die Praxis",
			excerpt: "Beispiele, wie Forschungsergebnisse messbar in Unternehmen ankommen.",
			date: "2026-02-10",
			ctaLabel: "Folge anschauen",
			href: "#main-theme",
			podcastLinks: getFallbackPodcastLinks(),
			status: "published",
			order: 3
		}
	],
	missionItems: [
		{
			id: "mission-1",
			title: "Wissen verständlich machen",
			text: "Wir übersetzen aktuelle Forschung in klare Aussagen mit direktem Praxisbezug.",
			order: 1
		},
		{
			id: "mission-2",
			title: "Folgen sichtbar machen",
			text: "Jede Folge zeigt konkrete Auswirkungen für Gesellschaft, Wirtschaft und Alltag.",
			order: 2
		},
		{
			id: "mission-3",
			title: "Dialog fördern",
			text: "Wir bringen Forschung, Praxis und Öffentlichkeit in ein gemeinsames Gespräch.",
			order: 3
		}
	],
	teamMembers: [
		{
			id: "team-1",
			name: "Host",
			role: "Moderation",
			text: "Führt durch jede Episode und verbindet Wissenschaft mit Alltagssprache.",
			avatarLabel: "Team",
			order: 1
		},
		{
			id: "team-2",
			name: "Redaktion",
			role: "Recherche",
			text: "Prüft Quellen, kuratiert Themen und bereitet Expertenfragen vor.",
			avatarLabel: "Team",
			order: 2
		},
		{
			id: "team-3",
			name: "Produktion",
			role: "Audio & Video",
			text: "Sorgt für klare Tonqualität, konsistente Formate und effiziente Publikation.",
			avatarLabel: "Team",
			order: 3
		}
	]
};

export const fallbackLegalContent: LegalContent = {
	brandName: "Forschung mit Folgen",
	pageKicker: "Rechtliches",
	pageTitle: "Impressum & Datenschutz",
	pageLead: "Diese Website ist ein ehrenamtliches, nicht-firmengebundenes Projekt.",
	backLinkLabel: "Zur Startseite",
	impressumTitle: "Impressum",
	impressumHtml: `
		<h3>Angaben gemäß § 5 TMG</h3>
		<p>Tobias Schnell<br />[Bitte ladungsfähige Anschrift eintragen]<br />Deutschland</p>
		<h3>Kontakt</h3>
		<p>E-Mail: [Bitte Kontakt-E-Mail eintragen]<br />Telefon: [Optional]</p>
		<h3>Verantwortlich für den Inhalt gemäß § 18 Abs. 2 MStV</h3>
		<p>Tobias Schnell<br />[Bitte ladungsfähige Anschrift eintragen]</p>
		<h3>Hinweis zur Projektform</h3>
		<p>Dieses Angebot wird privat und ehrenamtlich betrieben. Es besteht keine Firma hinter dieser Website.</p>
	`,
	websiteCreditLabel: "Website: Tobias Schnell",
	websiteLinkedInUrl: "https://www.linkedin.com/in/toschnell/",
	datenschutzTitle: "Datenschutzerklärung",
	datenschutzHtml: `
		<h3>1. Datenschutz auf einen Blick</h3>
		<p>Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen.</p>
		<h3>2. Verantwortliche Stelle</h3>
		<p>Tobias Schnell<br />[Bitte ladungsfähige Anschrift eintragen]<br />E-Mail: [Bitte Kontakt-E-Mail eintragen]</p>
		<h3>3. Datenerfassung auf dieser Website</h3>
		<p>Der Provider der Seiten erhebt und speichert automatisch Informationen in Server-Log-Dateien. Diese Daten dienen der technisch fehlerfreien Bereitstellung der Website.</p>
		<p>Diese Website kann technisch notwendige Cookies verwenden.</p>
		<h3>4. Ihre Rechte</h3>
		<ul>
			<li>Recht auf Auskunft gemäß Art. 15 DSGVO</li>
			<li>Recht auf Berichtigung gemäß Art. 16 DSGVO</li>
			<li>Recht auf Löschung gemäß Art. 17 DSGVO</li>
			<li>Recht auf Einschränkung gemäß Art. 18 DSGVO</li>
			<li>Recht auf Datenübertragbarkeit gemäß Art. 20 DSGVO</li>
			<li>Recht auf Widerspruch gemäß Art. 21 DSGVO</li>
		</ul>
	`,
	noticeText:
		"Wichtig: Bitte die Platzhalter (Anschrift, E-Mail, optional Telefon) durch deine echten Angaben ersetzen, bevor die Seite veröffentlicht wird."
};
