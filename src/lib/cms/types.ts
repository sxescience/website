export const LANGUAGE_CODES = ["de", "en"] as const;

export type LanguageCode = (typeof LANGUAGE_CODES)[number];

export type LocalizedString = Record<LanguageCode, string>;

export type PodcastLink = {
	label: string;
	url: string;
};

export type OrderedContentItem = {
	id: string;
	order: number;
};

export type NewsStatus = "published" | "draft";

export type NewsItem = OrderedContentItem & {
	title: string;
	excerpt: string;
	date: string;
	ctaLabel: string;
	href: string;
	podcastLinks: PodcastLink[];
	status: NewsStatus | string;
};

export type LandingNavItem = {
	id: string;
	label: LocalizedString;
};

export type LandingHeroStat = {
	value: string;
	label: LocalizedString;
};

export type LandingFeature = {
	icon: string;
	title: LocalizedString;
	text: LocalizedString;
};

export type InfographicItem = {
	title: LocalizedString;
	teaser: LocalizedString;
	src: string;
	alt: LocalizedString;
	credit: string;
};

export type FaqLink = {
	label: LocalizedString;
	url: string;
};

export type FaqItem = {
	id: string;
	question: LocalizedString;
	answer: LocalizedString;
	links: FaqLink[];
};

export type FaqGroup = {
	title: LocalizedString;
	itemIds: string[];
};

export type ResourceItem = {
	name: string;
	description: LocalizedString;
	url: string;
};

export type ResourceCategory = {
	title: LocalizedString;
	items: ResourceItem[];
};

export type SocialLink = {
	label: string;
	url: string;
};

export type LandingContent = {
	meta: {
		title: LocalizedString;
		description: LocalizedString;
		ogImage: string;
	};
	brandName: string;
	brandSubtitle: string;
	skipLinkLabel: LocalizedString;
	languageToggleLabel: LocalizedString;
	themeToggleAriaLabel: LocalizedString;
	nav: LandingNavItem[];
	hero: {
		kicker: LocalizedString;
		title: LocalizedString;
		lead: LocalizedString;
		primaryLabel: LocalizedString;
		primaryHref: string;
		secondaryLabel: LocalizedString;
		secondaryHref: string;
		stats: LandingHeroStat[];
	};
	about: {
		kicker: LocalizedString;
		title: LocalizedString;
		body: LocalizedString;
		features: LandingFeature[];
	};
	infographics: {
		kicker: LocalizedString;
		title: LocalizedString;
		items: InfographicItem[];
	};
	podcast: {
		kicker: LocalizedString;
		title: LocalizedString;
		lead: LocalizedString;
		ctaLabel: LocalizedString;
		href: string;
		fallbackThumbnail: string;
		rssTodo: string;
	};
	faq: {
		kicker: LocalizedString;
		title: LocalizedString;
		intro: LocalizedString;
		groups: FaqGroup[];
		items: FaqItem[];
	};
	resources: {
		kicker: LocalizedString;
		title: LocalizedString;
		categories: ResourceCategory[];
	};
	contact: {
		kicker: LocalizedString;
		title: LocalizedString;
		lead: LocalizedString;
		newsletterTitle: LocalizedString;
		newsletterLead: LocalizedString;
		newsletterEmailLabel: LocalizedString;
		newsletterEmailPlaceholder: LocalizedString;
		newsletterSubmitLabel: LocalizedString;
		nameLabel: LocalizedString;
		emailLabel: LocalizedString;
		messageLabel: LocalizedString;
		submitLabel: LocalizedString;
		successMessage: LocalizedString;
		emailHref: string;
		emailLabelText: string;
		socialLinks: SocialLink[];
	};
	team: {
		kicker: LocalizedString;
		title: LocalizedString;
		lead: LocalizedString;
		items: LandingFeature[];
	};
	footer: {
		description: LocalizedString;
		imprintLabel: LocalizedString;
		privacyLabel: LocalizedString;
		copyright: string;
	};
};

export type HomeContent = {
	landing: LandingContent;
	news: NewsItem[];
};

export type LegalContent = {
	brandName: string;
	pageKicker: string;
	pageTitle: string;
	pageLead: string;
	backLinkLabel: string;
	impressumTitle: string;
	impressumHtml: string;
	websiteCreditLabel: string;
	websiteLinkedInUrl: string;
	datenschutzTitle: string;
	datenschutzHtml: string;
	noticeText: string;
};
