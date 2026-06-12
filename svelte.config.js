import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			// default options are used
			pages: 'build',
			assets: 'build',
			fallback: 'index.html'
		})
	}
};

export default config;
