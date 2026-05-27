import {
	asRecord,
	list,
	listFromSource,
	localizedString,
	mapOrderedCollection,
	optionalList,
	requiredNumber,
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
	NewsItem,
	PodcastLink,
	ResourceCategory,
	ResourceItem,
	SocialLink
} from "./types";

const LIVE_STATUSES = new Set(["published", "live", "active", "public"]);
const MIN_FAQ_GROUP_SIZE = 4;
const MAX_FAQ_GROUP_SIZE = 7;

export function mapHomeContent(source: { landing: unknown; news: unknown }): HomeContent {
	return {
		landing: mapLandingContent(source.landing),
		news: mapNews(source.news)
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
	const header = asRecord(row.header ?? row, "landing_content.header");
	const faq = mapFaq(asRecord(row.faq, "landing_content.faq"));

	return {
		meta: mapMeta(row.meta),
		brandName: requiredString(header.brandName, "landing_content.header.brandName"),
		brandSubtitle: requiredString(header.brandSubtitle, "landing_content.header.brandSubtitle"),
		skipLinkLabel: localizedString(header.skipLinkLabel, "landing_content.header.skipLinkLabel"),
		languageToggleLabel: localizedString(
			header.languageToggleLabel,
			"landing_content.header.languageToggleLabel"
		),
		themeToggleAriaLabel: localizedString(
			header.themeToggleAriaLabel,
			"landing_content.header.themeToggleAriaLabel"
		),
		nav: list(header.nav, "landing_content.header.nav").map(mapNavItem),
		hero: mapHero(row.hero),
		about: mapAbout(row.about),
		infographics: mapInfographics(row.infographics),
		podcast: mapPodcast(row.podcast),
		faq,
		resources: mapResources(row.resources),
		contact: mapContact(row.contact),
		team: mapTeam(row.team),
		footer: mapFooter(row.footer)
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
			title: localizedString(item.title, `landing_content.infographics.items[${index}].title`),
			teaser: localizedString(item.teaser, `landing_content.infographics.items[${index}].teaser`),
			src: requiredString(item.src, `landing_content.infographics.items[${index}].src`),
			alt: localizedString(item.alt, `landing_content.infographics.items[${index}].alt`),
			credit: requiredString(item.credit, `landing_content.infographics.items[${index}].credit`)
		}))
	};
}

function mapPodcast(value: unknown): LandingContent["podcast"] {
	const row = asRecord(value, "landing_content.podcast");

	return {
		kicker: localizedString(row.kicker, "landing_content.podcast.kicker"),
		title: localizedString(row.title, "landing_content.podcast.title"),
		lead: localizedString(row.lead, "landing_content.podcast.lead"),
		ctaLabel: localizedString(row.ctaLabel, "landing_content.podcast.ctaLabel"),
		href: requiredString(row.href, "landing_content.podcast.href"),
		fallbackThumbnail: requiredString(
			row.fallbackThumbnail,
			"landing_content.podcast.fallbackThumbnail"
		),
		rssTodo: requiredString(row.rssTodo, "landing_content.podcast.rssTodo")
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

function mapNews(source: unknown): NewsItem[] {
	return mapOrderedCollection(source, "news", (row, index) => {
		const status = requiredString(row.status, `news.items[${index}].status`).toLowerCase();
		if (!LIVE_STATUSES.has(status)) {
			return undefined;
		}

		return {
			id: requiredString(row.id, `news.items[${index}].id`),
			title: requiredString(row.title, `news.items[${index}].title`),
			excerpt: requiredString(row.excerpt, `news.items[${index}].excerpt`),
			date: requiredString(row.date, `news.items[${index}].date`),
			ctaLabel: requiredString(row.ctaLabel, `news.items[${index}].ctaLabel`),
			href: requiredString(row.href, `news.items[${index}].href`),
			podcastLinks: optionalList(row.podcastLinks, `news.items[${index}].podcastLinks`).map(
				mapPodcastLink
			),
			status,
			order: requiredNumber(row.order, `news.items[${index}].order`)
		};
	}).sort(sortNewsItems);
}

function mapPodcastLink(row: UnknownRecord, index: number): PodcastLink {
	return {
		label: requiredString(row.label, `podcastLinks[${index}].label`),
		url: requiredString(row.url, `podcastLinks[${index}].url`)
	};
}

function sortNewsItems(a: NewsItem, b: NewsItem): number {
	const aDate = dateSortValue(a.date);
	const bDate = dateSortValue(b.date);

	if (aDate !== undefined && bDate !== undefined) {
		if (aDate !== bDate) {
			return bDate - aDate;
		}
		return b.order - a.order;
	}

	if (aDate !== undefined) {
		return -1;
	}

	if (bDate !== undefined) {
		return 1;
	}

	return b.order - a.order;
}

function dateSortValue(value: string): number | undefined {
	const parsed = Date.parse(value);
	return Number.isFinite(parsed) ? parsed : undefined;
}
