import type { PodcastEpisode, PodcastFeedResult } from "./types";

const CACHE_DURATION_MS = 60 * 60 * 1000;
const MAX_EPISODES = 100;

type PodcastFetch = typeof fetch;

type CacheEntry = {
	url: string;
	expiresAt: number;
	result: PodcastFeedResult;
};

let feedCache: CacheEntry | undefined;

export async function getPodcastFeed(
	rssUrl: string,
	fallbackCover: string,
	podcastFetch: PodcastFetch = fetch
): Promise<PodcastFeedResult> {
	const normalizedUrl = rssUrl.trim();
	if (!normalizedUrl) {
		return {
			status: "missing-url",
			episodes: []
		};
	}

	if (feedCache && feedCache.url === normalizedUrl && feedCache.expiresAt > Date.now()) {
		return feedCache.result;
	}

	try {
		const response = await podcastFetch(normalizedUrl, {
			headers: {
				accept: "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8"
			}
		});

		if (!response.ok) {
			throw new Error(`RSS request failed with ${response.status}`);
		}

		const xml = await response.text();
		const episodes = parsePodcastRss(xml, fallbackCover);
		const result: PodcastFeedResult = {
			status: episodes.length > 0 ? "ok" : "empty",
			episodes
		};

		feedCache = {
			url: normalizedUrl,
			expiresAt: Date.now() + CACHE_DURATION_MS,
			result
		};

		return result;
	} catch (error) {
		const result: PodcastFeedResult = {
			status: "error",
			episodes: [],
			errorMessage: error instanceof Error ? error.message : String(error)
		};

		feedCache = {
			url: normalizedUrl,
			expiresAt: Date.now() + CACHE_DURATION_MS,
			result
		};

		return result;
	}
}

function parsePodcastRss(xml: string, fallbackCover: string): PodcastEpisode[] {
	const items = xml.match(/<item\b[\s\S]*?<\/item>/gi) ?? [];
	const channelImage = channelImageUrl(xml);

	return items
		.slice(0, MAX_EPISODES)
		.map((item, index) => mapRssItem(item, index, channelImage || fallbackCover))
		.filter((episode): episode is PodcastEpisode => Boolean(episode))
		.sort((a, b) => dateSortValue(b.date) - dateSortValue(a.date));
}

function mapRssItem(item: string, index: number, fallbackCover: string): PodcastEpisode | undefined {
	const title = textFromTag(item, "title") || textFromTag(item, "itunes:title");
	const guid = textFromTag(item, "guid");
	const url = textFromTag(item, "link");
	const audioUrl = enclosureUrl(item);
	const description =
		textFromTag(item, "itunes:summary") ||
		textFromTag(item, "description") ||
		textFromTag(item, "content:encoded");

	if (!title && !url && !audioUrl) {
		return undefined;
	}

	return {
		id: slugify(guid || url || title || `episode-${index + 1}`),
		title: title || `Episode ${index + 1}`,
		description: stripHtml(description),
		date: normalizeDate(textFromTag(item, "pubDate") || textFromTag(item, "dc:date")),
		url,
		audioUrl,
		image: imageUrl(item) || fallbackCover,
		duration: textFromTag(item, "itunes:duration")
	};
}

function textFromTag(xml: string, tagName: string): string {
	const escapedTagName = escapeRegExp(tagName);
	const match = xml.match(new RegExp(`<${escapedTagName}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escapedTagName}>`, "i"));
	return match ? decodeXml(match[1].trim()) : "";
}

function enclosureUrl(xml: string): string {
	const match = xml.match(/<enclosure\b[^>]*\burl=(["'])(.*?)\1[^>]*>/i);
	return match ? decodeXml(match[2]) : "";
}

function imageUrl(xml: string): string {
	const itunesImage = xml.match(/<itunes:image\b[^>]*\bhref=(["'])(.*?)\1[^>]*>/i);
	if (itunesImage) {
		return decodeXml(itunesImage[2]);
	}

	const mediaThumbnail = xml.match(/<media:thumbnail\b[^>]*\burl=(["'])(.*?)\1[^>]*>/i);
	if (mediaThumbnail) {
		return decodeXml(mediaThumbnail[2]);
	}

	return textFromTag(xml, "image") || textFromTag(xml, "media:thumbnail");
}

function channelImageUrl(xml: string): string {
	const channel = xml.match(/<channel\b[\s\S]*?<\/channel>/i)?.[0] ?? xml;
	const channelWithoutItems = channel.replace(/<item\b[\s\S]*?<\/item>/gi, "");
	return imageUrl(channelWithoutItems);
}

function normalizeDate(value: string): string {
	const parsed = Date.parse(value);
	return Number.isFinite(parsed) ? new Date(parsed).toISOString() : "";
}

function dateSortValue(value: string): number {
	const parsed = Date.parse(value);
	return Number.isFinite(parsed) ? parsed : 0;
}

function stripHtml(value: string): string {
	return decodeXml(value.replace(/<[^>]+>/g, " "))
		.replace(/\s+/g, " ")
		.trim();
}

function decodeXml(value: string): string {
	return value
		.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
		.replace(/&amp;/g, "&")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(Number.parseInt(hex, 16)))
		.replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 10)));
}

function slugify(value: string): string {
	const slug = value
		.toLowerCase()
		.replace(/^https?:\/\//, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");

	return slug || "episode";
}

function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
