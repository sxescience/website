import type { PageServerLoad } from "./$types";

import { getPodcastPageContent } from "$lib/cms/service";

export const load: PageServerLoad = async ({ fetch }) => {
	return {
		content: await getPodcastPageContent(fetch)
	};
};
