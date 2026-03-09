import type { PageServerLoad } from "./$types";

import { getLegalContent } from "$lib/cms/service";

export const load: PageServerLoad = async () => {
	return {
		content: await getLegalContent()
	};
};
