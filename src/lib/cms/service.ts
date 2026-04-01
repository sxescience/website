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
	OrderedContentItem,
	PodcastLink,
	SiteSettings,
	TeamMember
} from "./types";

const LIVE_STATUSES = new Set(["published", "live", "active", "public"]);
const DEFAULT_NEWS_CTA_LABEL = "Folge anschauen";
const DEFAULT_NEWS_HREF = "#main-theme";

type UnknownObject = Record<string, unknown>;

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

function asObject(value: unknown): UnknownObject | undefined {
	if (!value || typeof value !== "object" || Array.isArray(value)) {
		return undefined;
	}

	return value as UnknownObject;
}

function asList(value: unknown): UnknownObject[] {
	if (!Array.isArray(value)) {
		return [];
	}

	return value.filter((entry): entry is UnknownObject => !!entry && typeof entry === "object");
}

function listFromSource(value: unknown): UnknownObject[] {
	const direct = asList(value);
	if (direct.length > 0) {
		return direct;
	}

	const wrapped = asObject(value);
	return asList(wrapped?.items);
}

function mapStringRecord<T extends Record<string, string>>(source: UnknownObject | undefined, defaults: T): T {
	const mapped = {} as Record<keyof T, string>;
	for (const key of Object.keys(defaults) as Array<keyof T>) {
		mapped[key] = stringValue(source?.[key as string], defaults[key]);
	}
	return mapped as T;
}

function mapOrderedCollection<T extends OrderedContentItem>(
	source: unknown,
	defaults: T[],
	mapper: (row: UnknownObject, index: number, fallbackItem: T) => T
): T[] {
	const rows = listFromSource(source);
	if (rows.length === 0) {
		return defaults;
	}

	const baseFallbackItem = defaults[0];
	const mapped = rows.map((row, index) => {
		const fallbackItem = defaults[index] ?? baseFallbackItem;
		return mapper(row, index, fallbackItem);
	});

	return mapped.sort((a, b) => a.order - b.order);
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
	return mapStringRecord(asObject(source), fallbackHomeContent.site);
}

function mapNews(source: unknown): NewsItem[] {
	const defaults = fallbackHomeContent.news;
	const rows = listFromSource(source);
	const fallbackItem = defaults[0];

	if (rows.length === 0 || !fallbackItem) {
		return defaults;
	}

	const mapped = rows
		.map((row, index) => ({
			id: stringValue(row.id, `news-${index + 1}`),
			title: stringValue(row.title, fallbackItem.title),
			excerpt: stringValue(row.excerpt, fallbackItem.excerpt),
			date: stringValue(row.date, ""),
			ctaLabel: stringValue(row.ctaLabel, DEFAULT_NEWS_CTA_LABEL),
			href: stringValue(row.href, DEFAULT_NEWS_HREF),
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

	return mapOrderedCollection(source, defaults, (row, index, fallbackItem) => ({
		id: stringValue(row.id, `mission-${index + 1}`),
		title: stringValue(row.title, fallbackItem.title),
		text: stringValue(row.text, fallbackItem.text),
		order: numberValue(row.order, index + 1)
	}));
}

function mapTeamMembers(source: unknown, fallbackAvatar: string): TeamMember[] {
	const defaults = fallbackHomeContent.teamMembers;

	return mapOrderedCollection(source, defaults, (row, index, fallbackItem) => ({
		id: stringValue(row.id, `team-${index + 1}`),
		name: stringValue(row.name, fallbackItem.name),
		role: stringValue(row.role, fallbackItem.role),
		text: stringValue(row.text, fallbackItem.text),
		avatarLabel: stringValue(row.avatarLabel, fallbackAvatar),
		order: numberValue(row.order, index + 1)
	}));
}

function mapLegalContent(source: unknown): LegalContent {
	return mapStringRecord(asObject(source), fallbackLegalContent);
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
