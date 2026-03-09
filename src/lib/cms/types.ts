export type PodcastLink = {
	label: string;
	url: string;
};

export type NewsItem = {
	id: string;
	title: string;
	excerpt: string;
	date: string;
	ctaLabel: string;
	href: string;
	podcastLinks: PodcastLink[];
	status: string;
	order: number;
};

export type MissionItem = {
	id: string;
	title: string;
	text: string;
	order: number;
};

export type TeamMember = {
	id: string;
	name: string;
	role: string;
	text: string;
	avatarLabel: string;
	order: number;
};

export type SiteSettings = {
	brandName: string;
	skipLinkLabel: string;
	navMainThemeLabel: string;
	navMissionLabel: string;
	navNewsletterLabel: string;
	navTeamLabel: string;
	navImpressumLabel: string;
	heroKicker: string;
	heroTitle: string;
	heroLead: string;
	heroPrimaryLabel: string;
	heroPrimaryHref: string;
	heroSecondaryLabel: string;
	heroSecondaryHref: string;
	cmsChipTitle: string;
	cmsChipBody: string;
	cmsChipTag1: string;
	cmsChipTag2: string;
	cmsChipTag3: string;
	missionKicker: string;
	missionTitle: string;
	newsletterKicker: string;
	newsletterTitle: string;
	newsletterLead: string;
	newsletterEmailLabel: string;
	newsletterEmailPlaceholder: string;
	newsletterSubmitLabel: string;
	teamKicker: string;
	teamTitle: string;
	teamAvatarLabel: string;
	footerTitle: string;
	footerDescription: string;
	footerStartLabel: string;
	footerNewsLabel: string;
	footerImpressumLabel: string;
	footerDatenschutzLabel: string;
	copyrightBrandName: string;
};

export type HomeContent = {
	site: SiteSettings;
	news: NewsItem[];
	missionItems: MissionItem[];
	teamMembers: TeamMember[];
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

export type CmsCollectionRow = Record<string, unknown>;
