import {
	asRecord,
	list,
	localizedString,
	optionalList,
	optionalRecord,
	optionalString,
	requiredString,
	type UnknownRecord
} from "./content-utils";
import type {
	FaqGroup,
	FaqItem,
	FaqLink,
	HomeContent,
	LandingContent,
	LandingFeature,
	LandingHeroStat,
	LandingNavItem,
	LegalContent,
	LocalizedString,
	PodcastPageContent,
	PodcastLink,
	PodcastSettings,
	ResourceCategory,
	ResourceItem,
	SocialLink
} from "./types";

const MIN_FAQ_GROUP_SIZE = 4;
const MAX_FAQ_GROUP_SIZE = 7;

const DEFAULT_BRAND_NAME = "SxE";
const DEFAULT_BRAND_SUBTITLE = "Scientists x Entrepreneurship";
const DEFAULT_SKIP_LINK_LABEL = { de: "Zum Inhalt springen", en: "Skip to content" };
const DEFAULT_LANGUAGE_TOGGLE_LABEL = { de: "Sprache wechseln", en: "Switch language" };
const DEFAULT_THEME_TOGGLE_LABEL = { de: "Farbmodus umschalten", en: "Toggle color mode" };
const DEFAULT_NAV: LandingNavItem[] = [
	{ id: "about", label: { de: "Über SxE", en: "About SxE" } },
	{ id: "faq", label: { de: "FAQ", en: "FAQ" } },
	{ id: "podcast", label: { de: "Podcast", en: "Podcast" } },
	{ id: "resources", label: { de: "Ressourcen", en: "Resources" } },
	{ id: "contact", label: { de: "Kontakt", en: "Contact" } }
];
const DEFAULT_TEAM: LandingContent["team"] = {
	kicker: { de: "Team", en: "Team" },
	title: { de: "Das Team hinter SxE", en: "The team behind SxE" },
	lead: { de: "", en: "" },
	items: []
};

export function mapHomeContent(source: {
	landing: unknown;
	podcastSettings: unknown;
	podcastFeed: HomeContent["podcastFeed"];
}): HomeContent {
	return {
		landing: mapLandingContent(source.landing),
		podcastSettings: mapPodcastSettings(source.podcastSettings),
		podcastFeed: source.podcastFeed
	};
}

export function mapPodcastPageContent(source: {
	landing: unknown;
	podcastSettings: unknown;
	podcastFeed: HomeContent["podcastFeed"];
}): PodcastPageContent {
	return {
		landing: mapLandingContent(source.landing),
		podcastSettings: mapPodcastSettings(source.podcastSettings),
		podcastFeed: source.podcastFeed
	};
}

export function mapPodcastSettings(source: unknown): PodcastSettings {
	const row = asRecord(source, "podcast_settings");
	const seo = optionalRecord(row.seo);

	return {
		rssUrl: optionalString(row.rssUrl),
		title: localizedString(row.title, "podcast_settings.title"),
		kicker: localizedString(row.kicker, "podcast_settings.kicker"),
		intro: localizedString(row.intro, "podcast_settings.intro"),
		metaTitle: localizedString(seo?.metaTitle ?? row.metaTitle, "podcast_settings.metaTitle"),
		metaDescription: localizedString(
			seo?.metaDescription ?? row.metaDescription,
			"podcast_settings.metaDescription"
		),
		backLinkLabel: localizedString(row.backLinkLabel, "podcast_settings.backLinkLabel"),
		listenLabel: localizedString(row.listenLabel, "podcast_settings.listenLabel"),
		searchLabel: localizedString(row.searchLabel, "podcast_settings.searchLabel"),
		searchPlaceholder: localizedString(
			row.searchPlaceholder,
			"podcast_settings.searchPlaceholder"
		),
		latestLabel: localizedString(row.latestLabel, "podcast_settings.latestLabel"),
		recentLabel: localizedString(row.recentLabel, "podcast_settings.recentLabel"),
		noResultsMessage: localizedString(row.noResultsMessage, "podcast_settings.noResultsMessage"),
		missingFeedMessage: localizedString(
			row.missingFeedMessage,
			"podcast_settings.missingFeedMessage"
		),
		feedErrorMessage: localizedString(row.feedErrorMessage, "podcast_settings.feedErrorMessage"),
		emptyFeedMessage: localizedString(row.emptyFeedMessage, "podcast_settings.emptyFeedMessage"),
		newsletterTitle: localizedString(row.newsletterTitle, "podcast_settings.newsletterTitle"),
		newsletterLead: localizedString(row.newsletterLead, "podcast_settings.newsletterLead"),
		newsletterEmailLabel: localizedString(
			row.newsletterEmailLabel,
			"podcast_settings.newsletterEmailLabel"
		),
		newsletterEmailPlaceholder: localizedString(
			row.newsletterEmailPlaceholder,
			"podcast_settings.newsletterEmailPlaceholder"
		),
		newsletterSubmitLabel: localizedString(
			row.newsletterSubmitLabel,
			"podcast_settings.newsletterSubmitLabel"
		),
		episodeCtaLabel: localizedString(row.episodeCtaLabel, "podcast_settings.episodeCtaLabel"),
		fallbackCover: requiredString(row.fallbackCover, "podcast_settings.fallbackCover"),
		platformLinks: optionalList(row.platformLinks, "podcast_settings.platformLinks").map(
			mapPodcastLink
		)
	};
}

export function mapLegalContent(source: unknown): LegalContent {
	const row = asRecord(source, "legal_content");

	return {
		brandName: requiredString(row.brandName, "legal_content.brandName"),
		pageKicker: requiredString(row.pageKicker, "legal_content.pageKicker"),
		pageTitle: requiredString(row.pageTitle, "legal_content.pageTitle"),
		pageLead: requiredString(row.pageLead, "legal_content.pageLead"),
		backLinkLabel: requiredString(row.backLinkLabel, "legal_content.backLinkLabel"),
		impressumTitle: requiredString(row.impressumTitle, "legal_content.impressumTitle"),
		impressumHtml: requiredString(row.impressumHtml, "legal_content.impressumHtml"),
		websiteCreditLabel: requiredString(row.websiteCreditLabel, "legal_content.websiteCreditLabel"),
		websiteLinkedInUrl: requiredString(row.websiteLinkedInUrl, "legal_content.websiteLinkedInUrl"),
		datenschutzTitle: requiredString(row.datenschutzTitle, "legal_content.datenschutzTitle"),
		datenschutzHtml: requiredString(row.datenschutzHtml, "legal_content.datenschutzHtml"),
		noticeText: requiredString(row.noticeText, "legal_content.noticeText")
	};
}

function mapLandingContent(source: unknown): LandingContent {
	const row = asRecord(source, "landing_content");
	const header = optionalRecord(row.header);
	const faq = mapFaq(asRecord(row.faq, "landing_content.faq"));
	const nav = optionalList(header?.nav, "landing_content.header.nav");

	return {
		meta: mapMeta(row.meta),
		brandName: stringWithFallback(header?.brandName, DEFAULT_BRAND_NAME),
		brandSubtitle: stringWithFallback(header?.brandSubtitle, DEFAULT_BRAND_SUBTITLE),
		skipLinkLabel: localizedStringWithFallback(
			header?.skipLinkLabel,
			DEFAULT_SKIP_LINK_LABEL,
			"landing_content.header.skipLinkLabel"
		),
		languageToggleLabel: localizedStringWithFallback(
			header?.languageToggleLabel,
			DEFAULT_LANGUAGE_TOGGLE_LABEL,
			"landing_content.header.languageToggleLabel"
		),
		themeToggleAriaLabel: localizedStringWithFallback(
			header?.themeToggleAriaLabel,
			DEFAULT_THEME_TOGGLE_LABEL,
			"landing_content.header.themeToggleAriaLabel"
		),
		nav: nav.length > 0 ? nav.map(mapNavItem) : DEFAULT_NAV,
		hero: mapHero(row.hero),
		about: mapAbout(row.about),
		infographics: mapInfographics(row.infographics),
		podcast: mapPodcast(row.podcast),
		faq,
		resources: mapResources(row.resources),
		contact: mapContact(row.contact),
		team: optionalRecord(row.team) ? mapTeam(row.team) : DEFAULT_TEAM,
		footer: mapFooter(row.footer)
	};
}

function stringWithFallback(value: unknown, fallback: string): string {
	return optionalString(value) || fallback;
}

function localizedStringWithFallback(
	value: unknown,
	fallback: LocalizedString,
	context: string
): LocalizedString {
	const row = optionalRecord(value);
	if (!row) {
		return fallback;
	}

	return {
		de: optionalString(row.de) || fallback.de,
		en: optionalString(row.en) || fallback.en
	};
}

function mapMeta(value: unknown): LandingContent["meta"] {
	const row = asRecord(value, "landing_content.meta");

	return {
		title: localizedString(row.title, "landing_content.meta.title"),
		description: localizedString(row.description, "landing_content.meta.description"),
		ogImage: requiredString(row.ogImage, "landing_content.meta.ogImage")
	};
}

function mapNavItem(row: UnknownRecord, index: number): LandingNavItem {
	return {
		id: requiredString(row.id, `landing_content.header.nav[${index}].id`),
		label: localizedString(row.label, `landing_content.header.nav[${index}].label`)
	};
}

function mapHero(value: unknown): LandingContent["hero"] {
	const row = asRecord(value, "landing_content.hero");

	return {
		kicker: localizedString(row.kicker, "landing_content.hero.kicker"),
		title: localizedString(row.title, "landing_content.hero.title"),
		lead: localizedString(row.lead, "landing_content.hero.lead"),
		primaryLabel: localizedString(row.primaryLabel, "landing_content.hero.primaryLabel"),
		primaryHref: requiredString(row.primaryHref, "landing_content.hero.primaryHref"),
		secondaryLabel: localizedString(row.secondaryLabel, "landing_content.hero.secondaryLabel"),
		secondaryHref: requiredString(row.secondaryHref, "landing_content.hero.secondaryHref"),
		stats: list(row.stats, "landing_content.hero.stats").map(mapHeroStat)
	};
}

function mapHeroStat(row: UnknownRecord, index: number): LandingHeroStat {
	return {
		value: requiredString(row.value, `landing_content.hero.stats[${index}].value`),
		label: localizedString(row.label, `landing_content.hero.stats[${index}].label`)
	};
}

function mapAbout(value: unknown): LandingContent["about"] {
	const row = asRecord(value, "landing_content.about");

	return {
		kicker: localizedString(row.kicker, "landing_content.about.kicker"),
		title: localizedString(row.title, "landing_content.about.title"),
		body: localizedString(row.body, "landing_content.about.body"),
		features: list(row.features, "landing_content.about.features").map((feature, index) =>
			mapFeature(feature, `landing_content.about.features[${index}]`)
		)
	};
}

function mapFeature(row: UnknownRecord, context: string): LandingFeature {
	return {
		icon: requiredString(row.icon, `${context}.icon`),
		title: localizedString(row.title, `${context}.title`),
		text: localizedString(row.text, `${context}.text`)
	};
}

function mapInfographics(value: unknown): LandingContent["infographics"] {
	const row = asRecord(value, "landing_content.infographics");

	return {
		kicker: localizedString(row.kicker, "landing_content.infographics.kicker"),
		title: localizedString(row.title, "landing_content.infographics.title"),
		items: list(row.items, "landing_content.infographics.items").map((item, index) => ({
			variant: mapInfographicVariant(
				item.variant,
				`landing_content.infographics.items[${index}].variant`
			),
			title: localizedString(item.title, `landing_content.infographics.items[${index}].title`),
			teaser: localizedString(item.teaser, `landing_content.infographics.items[${index}].teaser`),
			src: requiredString(item.src, `landing_content.infographics.items[${index}].src`),
			alt: localizedString(item.alt, `landing_content.infographics.items[${index}].alt`),
			credit: requiredString(item.credit, `landing_content.infographics.items[${index}].credit`)
		}))
	};
}

function mapInfographicVariant(
	value: unknown,
	context: string
): "career" | "skills" | "cofounder" | undefined {
	if (value === undefined || value === null || value === "") {
		return undefined;
	}

	if (value === "career" || value === "skills" || value === "cofounder") {
		return value;
	}

	throw new Error(`CMS field "${context}" must be career, skills or cofounder.`);
}

function mapPodcast(value: unknown): LandingContent["podcast"] {
	const row = asRecord(value, "landing_content.podcast");

	return {
		kicker: localizedString(row.kicker, "landing_content.podcast.kicker"),
		title: localizedString(row.title, "landing_content.podcast.title"),
		lead: localizedString(row.lead, "landing_content.podcast.lead"),
		ctaLabel: localizedString(row.ctaLabel, "landing_content.podcast.ctaLabel"),
		href: requiredString(row.href, "landing_content.podcast.href")
	};
}

function mapFaq(row: UnknownRecord): LandingContent["faq"] {
	const items = list(row.items, "landing_content.faq.items").map(mapFaqItem);
	const groups = list(row.groups, "landing_content.faq.groups").map(mapFaqGroup);

	validateFaqGroups(groups, items);

	return {
		kicker: localizedString(row.kicker, "landing_content.faq.kicker"),
		title: localizedString(row.title, "landing_content.faq.title"),
		intro: localizedString(row.intro, "landing_content.faq.intro"),
		groups,
		items
	};
}

function mapFaqItem(row: UnknownRecord, index: number): FaqItem {
	return {
		id: requiredString(row.id, `landing_content.faq.items[${index}].id`),
		question: localizedString(row.question, `landing_content.faq.items[${index}].question`),
		answer: localizedString(row.answer, `landing_content.faq.items[${index}].answer`),
		links: optionalList(row.links, `landing_content.faq.items[${index}].links`).map((link, linkIndex) =>
			mapFaqLink(link, `landing_content.faq.items[${index}].links[${linkIndex}]`)
		)
	};
}

function mapFaqLink(row: UnknownRecord, context: string): FaqLink {
	return {
		label: localizedString(row.label, `${context}.label`),
		url: requiredString(row.url, `${context}.url`)
	};
}

function mapFaqGroup(row: UnknownRecord, index: number): FaqGroup {
	return {
		title: localizedString(row.title, `landing_content.faq.groups[${index}].title`),
		itemIds: listFaqItemIds(row.itemIds, `landing_content.faq.groups[${index}].itemIds`)
	};
}

function listFaqItemIds(value: unknown, context: string): string[] {
	if (!Array.isArray(value)) {
		throw new Error(`CMS field "${context}" must be a list.`);
	}

	return value.map((item, index) => requiredString(item, `${context}[${index}]`));
}

function validateFaqGroups(groups: FaqGroup[], items: FaqItem[]) {
	const knownItemIds = new Set(items.map((item) => item.id));
	const groupedItemIds = new Set<string>();

	for (const [index, group] of groups.entries()) {
		if (group.itemIds.length < MIN_FAQ_GROUP_SIZE || group.itemIds.length > MAX_FAQ_GROUP_SIZE) {
			throw new Error(
				`FAQ group ${index + 1} must contain ${MIN_FAQ_GROUP_SIZE}-${MAX_FAQ_GROUP_SIZE} questions.`
			);
		}

		for (const itemId of group.itemIds) {
			if (!knownItemIds.has(itemId)) {
				throw new Error(`FAQ group ${index + 1} references unknown FAQ item "${itemId}".`);
			}

			if (groupedItemIds.has(itemId)) {
				throw new Error(`FAQ item "${itemId}" is assigned to more than one group.`);
			}

			groupedItemIds.add(itemId);
		}
	}

	for (const item of items) {
		if (!groupedItemIds.has(item.id)) {
			throw new Error(`FAQ item "${item.id}" is not assigned to a group.`);
		}
	}
}

function mapResources(value: unknown): LandingContent["resources"] {
	const row = asRecord(value, "landing_content.resources");

	return {
		kicker: localizedString(row.kicker, "landing_content.resources.kicker"),
		title: localizedString(row.title, "landing_content.resources.title"),
		categories: list(row.categories, "landing_content.resources.categories").map(mapResourceCategory)
	};
}

function mapResourceCategory(row: UnknownRecord, index: number): ResourceCategory {
	return {
		title: localizedString(row.title, `landing_content.resources.categories[${index}].title`),
		items: list(row.items, `landing_content.resources.categories[${index}].items`).map(
			(item, itemIndex) =>
				mapResourceItem(item, `landing_content.resources.categories[${index}].items[${itemIndex}]`)
		)
	};
}

function mapResourceItem(row: UnknownRecord, context: string): ResourceItem {
	return {
		name: requiredString(row.name, `${context}.name`),
		description: localizedString(row.description, `${context}.description`),
		url: requiredString(row.url, `${context}.url`)
	};
}

function mapContact(value: unknown): LandingContent["contact"] {
	const row = asRecord(value, "landing_content.contact");

	return {
		kicker: localizedString(row.kicker, "landing_content.contact.kicker"),
		title: localizedString(row.title, "landing_content.contact.title"),
		lead: localizedString(row.lead, "landing_content.contact.lead"),
		newsletterTitle: localizedString(row.newsletterTitle, "landing_content.contact.newsletterTitle"),
		newsletterLead: localizedString(row.newsletterLead, "landing_content.contact.newsletterLead"),
		newsletterEmailLabel: localizedString(
			row.newsletterEmailLabel,
			"landing_content.contact.newsletterEmailLabel"
		),
		newsletterEmailPlaceholder: localizedString(
			row.newsletterEmailPlaceholder,
			"landing_content.contact.newsletterEmailPlaceholder"
		),
		newsletterSubmitLabel: localizedString(
			row.newsletterSubmitLabel,
			"landing_content.contact.newsletterSubmitLabel"
		),
		nameLabel: localizedString(row.nameLabel, "landing_content.contact.nameLabel"),
		emailLabel: localizedString(row.emailLabel, "landing_content.contact.emailLabel"),
		messageLabel: localizedString(row.messageLabel, "landing_content.contact.messageLabel"),
		submitLabel: localizedString(row.submitLabel, "landing_content.contact.submitLabel"),
		successMessage: localizedString(row.successMessage, "landing_content.contact.successMessage"),
		emailHref: requiredString(row.emailHref, "landing_content.contact.emailHref"),
		emailLabelText: requiredString(row.emailLabelText, "landing_content.contact.emailLabelText"),
		socialLinks: optionalList(row.socialLinks, "landing_content.contact.socialLinks").map(
			mapSocialLink
		)
	};
}

function mapSocialLink(row: UnknownRecord, index: number): SocialLink {
	return {
		label: requiredString(row.label, `landing_content.contact.socialLinks[${index}].label`),
		url: requiredString(row.url, `landing_content.contact.socialLinks[${index}].url`)
	};
}

function mapTeam(value: unknown): LandingContent["team"] {
	const row = asRecord(value, "landing_content.team");

	return {
		kicker: localizedString(row.kicker, "landing_content.team.kicker"),
		title: localizedString(row.title, "landing_content.team.title"),
		lead: localizedString(row.lead, "landing_content.team.lead"),
		items: list(row.items, "landing_content.team.items").map((item, index) =>
			mapFeature(item, `landing_content.team.items[${index}]`)
		)
	};
}

function mapFooter(value: unknown): LandingContent["footer"] {
	const row = asRecord(value, "landing_content.footer");

	return {
		description: localizedString(row.description, "landing_content.footer.description"),
		imprintLabel: localizedString(row.imprintLabel, "landing_content.footer.imprintLabel"),
		privacyLabel: localizedString(row.privacyLabel, "landing_content.footer.privacyLabel"),
		copyright: requiredString(row.copyright, "landing_content.footer.copyright")
	};
}

function mapPodcastLink(row: UnknownRecord, index: number): PodcastLink {
	return {
		label: requiredString(row.label, `podcast_settings.platformLinks[${index}].label`),
		url: requiredString(row.url, `podcast_settings.platformLinks[${index}].url`)
	};
}
