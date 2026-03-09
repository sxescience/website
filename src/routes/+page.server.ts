import type { PageServerLoad } from "./$types";

import { getHomeContent } from "$lib/cms/service";

export const load: PageServerLoad = async () => {
	return {
		content: await getHomeContent()
	};
};
