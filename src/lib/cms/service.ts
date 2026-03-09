import legalContentSource from "$lib/content/legal-content.json";
import missionItemsSource from "$lib/content/mission-items.json";
import newsSource from "$lib/content/news.json";
import siteSettingsSource from "$lib/content/site-settings.json";
import teamMembersSource from "$lib/content/team-members.json";

import { fallbackHomeContent, fallbackLegalContent } from "./defaults";
import type {
	HomeContent,
	LegalContent,
	MissionItem,
	NewsItem,
	PodcastLink,
	SiteSettings,
	TeamMember
} from "./types";

const LIVE_STATUSES = new Set(["published", "live", "active", "public"]);

function stringValue(value: unknown, fallbackValue: string): string {
	return typeof value === "string" && value.trim().length > 0 ? value : fallbackValue;
}

function numberValue(value: unknown, fallbackValue: number): number {
	if (typeof value === "number" && Number.isFinite(value)) {
		return value;
	}

	if (typeof value === "string") {
		const parsed = Number(value);
		if (Number.isFinite(parsed)) {
			return parsed;
		}
	}

	return fallbackValue;
}

function dateSortValue(value: string): number | undefined {
	const parsed = Date.parse(value);
	return Number.isFinite(parsed) ? parsed : undefined;
}

function asObject(value: unknown): Record<string, unknown> | undefined {
	if (!value || typeof value !== "object" || Array.isArray(value)) {
		return undefined;
	}

	return value as Record<string, unknown>;
}

function asList(value: unknown): Record<string, unknown>[] {
	if (!Array.isArray(value)) {
		return [];
	}

	return value.filter((entry): entry is Record<string, unknown> => !!entry && typeof entry === "object");
}

function listFromSource(value: unknown): Record<string, unknown>[] {
	const direct = asList(value);
	if (direct.length > 0) {
		return direct;
	}

	const wrapped = asObject(value);
	return asList(wrapped?.items);
}

function mapPodcastLinks(value: unknown): PodcastLink[] {
	return asList(value)
		.map((row, index) => ({
			label: stringValue(row.label, `Podcast-Link ${index + 1}`),
			url: stringValue(row.url, "")
		}))
		.filter((link) => link.url.length > 0);
}

function mapSiteSettings(source: unknown): SiteSettings {
	const row = asObject(source);
	const defaults = fallbackHomeContent.site;

	return {
		brandName: stringValue(row?.brandName, defaults.brandName),
		skipLinkLabel: stringValue(row?.skipLinkLabel, defaults.skipLinkLabel),
		navMainThemeLabel: stringValue(row?.navMainThemeLabel, defaults.navMainThemeLabel),
		navMissionLabel: stringValue(row?.navMissionLabel, defaults.navMissionLabel),
		navNewsletterLabel: stringValue(row?.navNewsletterLabel, defaults.navNewsletterLabel),
		navTeamLabel: stringValue(row?.navTeamLabel, defaults.navTeamLabel),
		navImpressumLabel: stringValue(row?.navImpressumLabel, defaults.navImpressumLabel),
		heroKicker: stringValue(row?.heroKicker, defaults.heroKicker),
		heroTitle: stringValue(row?.heroTitle, defaults.heroTitle),
		heroLead: stringValue(row?.heroLead, defaults.heroLead),
		heroPrimaryLabel: stringValue(row?.heroPrimaryLabel, defaults.heroPrimaryLabel),
		heroPrimaryHref: stringValue(row?.heroPrimaryHref, defaults.heroPrimaryHref),
		heroSecondaryLabel: stringValue(row?.heroSecondaryLabel, defaults.heroSecondaryLabel),
		heroSecondaryHref: stringValue(row?.heroSecondaryHref, defaults.heroSecondaryHref),
		cmsChipTitle: stringValue(row?.cmsChipTitle, defaults.cmsChipTitle),
		cmsChipBody: stringValue(row?.cmsChipBody, defaults.cmsChipBody),
		cmsChipTag1: stringValue(row?.cmsChipTag1, defaults.cmsChipTag1),
		cmsChipTag2: stringValue(row?.cmsChipTag2, defaults.cmsChipTag2),
		cmsChipTag3: stringValue(row?.cmsChipTag3, defaults.cmsChipTag3),
		missionKicker: stringValue(row?.missionKicker, defaults.missionKicker),
		missionTitle: stringValue(row?.missionTitle, defaults.missionTitle),
		newsletterKicker: stringValue(row?.newsletterKicker, defaults.newsletterKicker),
		newsletterTitle: stringValue(row?.newsletterTitle, defaults.newsletterTitle),
		newsletterLead: stringValue(row?.newsletterLead, defaults.newsletterLead),
		newsletterEmailLabel: stringValue(row?.newsletterEmailLabel, defaults.newsletterEmailLabel),
		newsletterEmailPlaceholder: stringValue(
			row?.newsletterEmailPlaceholder,
			defaults.newsletterEmailPlaceholder
		),
		newsletterSubmitLabel: stringValue(row?.newsletterSubmitLabel, defaults.newsletterSubmitLabel),
		teamKicker: stringValue(row?.teamKicker, defaults.teamKicker),
		teamTitle: stringValue(row?.teamTitle, defaults.teamTitle),
		teamAvatarLabel: stringValue(row?.teamAvatarLabel, defaults.teamAvatarLabel),
		footerTitle: stringValue(row?.footerTitle, defaults.footerTitle),
		footerDescription: stringValue(row?.footerDescription, defaults.footerDescription),
		footerStartLabel: stringValue(row?.footerStartLabel, defaults.footerStartLabel),
		footerNewsLabel: stringValue(row?.footerNewsLabel, defaults.footerNewsLabel),
		footerImpressumLabel: stringValue(row?.footerImpressumLabel, defaults.footerImpressumLabel),
		footerDatenschutzLabel: stringValue(
			row?.footerDatenschutzLabel,
			defaults.footerDatenschutzLabel
		),
		copyrightBrandName: stringValue(row?.copyrightBrandName, defaults.copyrightBrandName)
	};
}

function mapNews(source: unknown): NewsItem[] {
	const defaults = fallbackHomeContent.news;
	const rows = listFromSource(source);

	if (rows.length === 0) {
		return defaults;
	}

	const mapped = rows
		.map((row, index) => ({
			id: stringValue(row.id, `news-${index + 1}`),
			title: stringValue(row.title, defaults[0]?.title ?? ""),
			excerpt: stringValue(row.excerpt, defaults[0]?.excerpt ?? ""),
			date: stringValue(row.date, ""),
			ctaLabel: stringValue(row.ctaLabel, "Folge anschauen"),
			href: stringValue(row.href, "#main-theme"),
			podcastLinks: mapPodcastLinks(row.podcastLinks ?? row.podcast_links),
			status: stringValue(row.status, "published").toLowerCase(),
			order: numberValue(row.order, index + 1)
		}))
		.filter((item) => LIVE_STATUSES.has(item.status))
		.sort((a, b) => {
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
		});

	return mapped.length > 0 ? mapped : defaults;
}

function mapMissionItems(source: unknown): MissionItem[] {
	const defaults = fallbackHomeContent.missionItems;
	const rows = listFromSource(source);

	if (rows.length === 0) {
		return defaults;
	}

	return rows
		.map((row, index) => ({
			id: stringValue(row.id, `mission-${index + 1}`),
			title: stringValue(row.title, defaults[0]?.title ?? ""),
			text: stringValue(row.text, defaults[0]?.text ?? ""),
			order: numberValue(row.order, index + 1)
		}))
		.sort((a, b) => a.order - b.order);
}

function mapTeamMembers(source: unknown, fallbackAvatar: string): TeamMember[] {
	const defaults = fallbackHomeContent.teamMembers;
	const rows = listFromSource(source);

	if (rows.length === 0) {
		return defaults;
	}

	return rows
		.map((row, index) => ({
			id: stringValue(row.id, `team-${index + 1}`),
			name: stringValue(row.name, defaults[0]?.name ?? ""),
			role: stringValue(row.role, defaults[0]?.role ?? ""),
			text: stringValue(row.text, defaults[0]?.text ?? ""),
			avatarLabel: stringValue(row.avatarLabel, fallbackAvatar),
			order: numberValue(row.order, index + 1)
		}))
		.sort((a, b) => a.order - b.order);
}

function mapLegalContent(source: unknown): LegalContent {
	const row = asObject(source);
	return {
		brandName: stringValue(row?.brandName, fallbackLegalContent.brandName),
		pageKicker: stringValue(row?.pageKicker, fallbackLegalContent.pageKicker),
		pageTitle: stringValue(row?.pageTitle, fallbackLegalContent.pageTitle),
		pageLead: stringValue(row?.pageLead, fallbackLegalContent.pageLead),
		backLinkLabel: stringValue(row?.backLinkLabel, fallbackLegalContent.backLinkLabel),
		impressumTitle: stringValue(row?.impressumTitle, fallbackLegalContent.impressumTitle),
		impressumHtml: stringValue(row?.impressumHtml, fallbackLegalContent.impressumHtml),
		websiteCreditLabel: stringValue(
			row?.websiteCreditLabel,
			fallbackLegalContent.websiteCreditLabel
		),
		websiteLinkedInUrl: stringValue(
			row?.websiteLinkedInUrl,
			fallbackLegalContent.websiteLinkedInUrl
		),
		datenschutzTitle: stringValue(row?.datenschutzTitle, fallbackLegalContent.datenschutzTitle),
		datenschutzHtml: stringValue(row?.datenschutzHtml, fallbackLegalContent.datenschutzHtml),
		noticeText: stringValue(row?.noticeText, fallbackLegalContent.noticeText)
	};
}

export async function getHomeContent(): Promise<HomeContent> {
	const site = mapSiteSettings(siteSettingsSource);
	return {
		site,
		news: mapNews(newsSource),
		missionItems: mapMissionItems(missionItemsSource),
		teamMembers: mapTeamMembers(teamMembersSource, site.teamAvatarLabel)
	};
}

export async function getLegalContent(): Promise<LegalContent> {
	return mapLegalContent(legalContentSource);
}
