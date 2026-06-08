export const LANGUAGE_CODES = ["de", "en"] as const;

export type LanguageCode = (typeof LANGUAGE_CODES)[number];

export type LocalizedString = Record<LanguageCode, string>;

export type PodcastLink = {
	label: string;
	url: string;
};

export type PodcastEpisode = {
	id: string;
	title: string;
	description: string;
	date: string;
	url: string;
	audioUrl: string;
	image: string;
	duration: string;
};

export type PodcastFeedStatus = "missing-url" | "ok" | "error" | "empty";

export type PodcastFeedResult = {
	status: PodcastFeedStatus;
	episodes: PodcastEpisode[];
	errorMessage?: string;
};

export type PodcastSettings = {
	rssUrl: string;
	title: LocalizedString;
	kicker: LocalizedString;
	intro: LocalizedString;
	metaTitle: LocalizedString;
	metaDescription: LocalizedString;
	backLinkLabel: LocalizedString;
	listenLabel: LocalizedString;
	searchLabel: LocalizedString;
	searchPlaceholder: LocalizedString;
	latestLabel: LocalizedString;
	recentLabel: LocalizedString;
	noResultsMessage: LocalizedString;
	missingFeedMessage: LocalizedString;
	feedErrorMessage: LocalizedString;
	emptyFeedMessage: LocalizedString;
	newsletterTitle: LocalizedString;
	newsletterLead: LocalizedString;
	newsletterEmailLabel: LocalizedString;
	newsletterEmailPlaceholder: LocalizedString;
	newsletterSubmitLabel: LocalizedString;
	episodeCtaLabel: LocalizedString;
	fallbackCover: string;
	platformLinks: PodcastLink[];
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
	variant?: "career" | "skills" | "cofounder";
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
	podcastSettings: PodcastSettings;
	podcastFeed: PodcastFeedResult;
};

export type PodcastPageContent = {
	landing: LandingContent;
	podcastSettings: PodcastSettings;
	podcastFeed: PodcastFeedResult;
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
