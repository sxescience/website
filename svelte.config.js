import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: 'index.html',
			precompress: false
		}),
		prerender: {
			crawl: true,
			entries: ['/', '/podcast', '/impressum', '/admin', '/sitemap.xml', '/rss.xml']
		}
	}
};

export default config;
