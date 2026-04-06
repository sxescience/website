import legalContentSource from "$lib/content/legal-content.json";
import missionItemsSource from "$lib/content/mission-items.json";
import newsSource from "$lib/content/news.json";
import siteSettingsSource from "$lib/content/site-settings.json";
import teamMembersSource from "$lib/content/team-members.json";

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

type UnknownObject = Record<string, unknown>;

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

function requiredString(value: unknown, fieldPath: string): string {
	if (typeof value === "string" && value.trim().length > 0) {
		return value.trim();
	}

	throw new Error(`CMS field "${fieldPath}" must be a non-empty string.`);
}

function requiredNumber(value: unknown, fieldPath: string): number {
	if (typeof value === "number" && Number.isFinite(value)) {
		return value;
	}

	if (typeof value === "string") {
		const parsed = Number(value);
		if (Number.isFinite(parsed)) {
			return parsed;
		}
	}

	throw new Error(`CMS field "${fieldPath}" must be a valid number.`);
}

function dateSortValue(value: string): number | undefined {
	const parsed = Date.parse(value);
	return Number.isFinite(parsed) ? parsed : undefined;
}

function mapRequiredStringRecord<T extends Record<string, string>>(
	source: unknown,
	reference: T,
	context: string
): T {
	const row = asObject(source);
	if (!row) {
		throw new Error(`CMS data "${context}" must be an object.`);
	}

	const mapped = {} as Record<keyof T, string>;
	for (const key of Object.keys(reference) as Array<keyof T>) {
		mapped[key] = requiredString(row[key as string], `${context}.${String(key)}`);
	}

	return mapped as T;
}

function mapOrderedCollection<T extends OrderedContentItem>(
	source: unknown,
	context: string,
	mapper: (row: UnknownObject, index: number) => T
): T[] {
	const rows = listFromSource(source);
	const mapped: T[] = [];

	for (const [index, row] of rows.entries()) {
		try {
			mapped.push(mapper(row, index));
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			console.warn(`[cms] Skipping invalid ${context} item ${index + 1}: ${message}`);
		}
	}

	return mapped.sort((a, b) => a.order - b.order);
}

function mapPodcastLinks(value: unknown, context: string): PodcastLink[] {
	const rows = asList(value);
	const links: PodcastLink[] = [];

	for (const [index, row] of rows.entries()) {
		try {
			links.push({
				label: requiredString(row.label, `${context}[${index}].label`),
				url: requiredString(row.url, `${context}[${index}].url`)
			});
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			console.warn(`[cms] Skipping invalid podcast link ${index + 1}: ${message}`);
		}
	}

	return links;
}

function mapSiteSettings(source: unknown): SiteSettings {
	return mapRequiredStringRecord(source, siteSettingsSource as SiteSettings, "site_settings");
}

function mapNews(source: unknown): NewsItem[] {
	const rows = listFromSource(source);
	const mapped: NewsItem[] = [];

	for (const [index, row] of rows.entries()) {
		try {
			const status = requiredString(row.status, `news.items[${index}].status`).toLowerCase();
			if (!LIVE_STATUSES.has(status)) {
				continue;
			}

			mapped.push({
				id: requiredString(row.id, `news.items[${index}].id`),
				title: requiredString(row.title, `news.items[${index}].title`),
				excerpt: requiredString(row.excerpt, `news.items[${index}].excerpt`),
				date: requiredString(row.date, `news.items[${index}].date`),
				ctaLabel: requiredString(row.ctaLabel, `news.items[${index}].ctaLabel`),
				href: requiredString(row.href, `news.items[${index}].href`),
				podcastLinks: mapPodcastLinks(row.podcastLinks, `news.items[${index}].podcastLinks`),
				status,
				order: requiredNumber(row.order, `news.items[${index}].order`)
			});
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			console.warn(`[cms] Skipping invalid news item ${index + 1}: ${message}`);
		}
	}

	return mapped.sort((a, b) => {
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
}

function mapMissionItems(source: unknown): MissionItem[] {
	return mapOrderedCollection(source, "mission_items.items", (row, index) => ({
		id: requiredString(row.id, `mission_items.items[${index}].id`),
		title: requiredString(row.title, `mission_items.items[${index}].title`),
		text: requiredString(row.text, `mission_items.items[${index}].text`),
		order: requiredNumber(row.order, `mission_items.items[${index}].order`)
	}));
}

function mapTeamMembers(source: unknown): TeamMember[] {
	return mapOrderedCollection(source, "team_members.items", (row, index) => ({
		id: requiredString(row.id, `team_members.items[${index}].id`),
		name: requiredString(row.name, `team_members.items[${index}].name`),
		role: requiredString(row.role, `team_members.items[${index}].role`),
		text: requiredString(row.text, `team_members.items[${index}].text`),
		avatarLabel: requiredString(row.avatarLabel, `team_members.items[${index}].avatarLabel`),
		order: requiredNumber(row.order, `team_members.items[${index}].order`)
	}));
}

function mapLegalContent(source: unknown): LegalContent {
	return mapRequiredStringRecord(source, legalContentSource as LegalContent, "legal_content");
}

export async function getHomeContent(): Promise<HomeContent> {
	const site = mapSiteSettings(siteSettingsSource);
	return {
		site,
		news: mapNews(newsSource),
		missionItems: mapMissionItems(missionItemsSource),
		teamMembers: mapTeamMembers(teamMembersSource)
	};
}

export async function getLegalContent(): Promise<LegalContent> {
	return mapLegalContent(legalContentSource);
}
