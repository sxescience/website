import landingContentSource from "$lib/content/landing-content.json";
import legalContentSource from "$lib/content/legal-content.json";
import newsSource from "$lib/content/news.json";

import { mapHomeContent, mapLegalContent } from "./mappers";
import type { HomeContent, LegalContent } from "./types";

export async function getHomeContent(): Promise<HomeContent> {
	return mapHomeContent({
		landing: landingContentSource,
		news: newsSource
	});
}

export async function getLegalContent(): Promise<LegalContent> {
	return mapLegalContent(legalContentSource);
}
