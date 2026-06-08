<script lang="ts">
	import { ArrowLeft, ArrowRight, ExternalLink, Moon, Search, Sun } from "lucide-svelte";
	import { onMount } from "svelte";
	import type { LanguageCode, LocalizedString, PodcastEpisode } from "$lib/cms/types";
	import type { PageData } from "./$types";

	const LANGUAGE_STORAGE_KEY = "sxe-language";
	const THEME_STORAGE_KEY = "sxe-theme";

	type ThemeMode = "dark" | "light";

	let { data } = $props<{ data: PageData }>();

	let language = $state<LanguageCode>("de");
	let themeMode = $state<ThemeMode>("dark");
	let searchQuery = $state("");
	let newsletterSubmitted = $state(false);

	const content = $derived(data.content);
	const landing = $derived(content.landing);
	const podcast = $derived(content.podcastSettings);
	const feed = $derived(content.podcastFeed);
	const latestEpisode = $derived(feed.episodes[0]);
	const recentEpisodes = $derived(feed.episodes.slice(1));
	const filteredEpisodes = $derived.by(() => {
		const query = searchQuery.trim().toLowerCase();
		const episodes = recentEpisodes;
		if (!query) {
			return episodes;
		}

		return episodes.filter((episode: PodcastEpisode) =>
			`${episode.title} ${episode.description}`.toLowerCase().includes(query)
		);
	});

	onMount(() => {
		language = getStoredLanguage();
		themeMode = getCurrentThemeMode();
		document.documentElement.lang = language;
	});

	$effect(() => {
		if (typeof document === "undefined") {
			return;
		}

		document.documentElement.lang = language;
		try {
			window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
		} catch {
			// Ignore storage failures in restricted browser modes.
		}
	});

	function t(value: LocalizedString): string {
		return value[language];
	}

	function setLanguage(nextLanguage: LanguageCode) {
		language = nextLanguage;
	}

	function getStoredLanguage(): LanguageCode {
		if (typeof window === "undefined") {
			return "de";
		}

		try {
			return window.localStorage.getItem(LANGUAGE_STORAGE_KEY) === "en" ? "en" : "de";
		} catch {
			return "de";
		}
	}

	function toggleTheme() {
		applyThemeMode(themeMode === "dark" ? "light" : "dark");
	}

	function getCurrentThemeMode(): ThemeMode {
		if (typeof document === "undefined") {
			return "dark";
		}
		return document.documentElement.classList.contains("dark") ? "dark" : "light";
	}

	function applyThemeMode(mode: ThemeMode) {
		if (typeof document === "undefined") {
			return;
		}

		const root = document.documentElement;
		root.classList.toggle("dark", mode === "dark");
		root.style.colorScheme = mode;
		themeMode = mode;

		try {
			window.localStorage.setItem(THEME_STORAGE_KEY, mode);
		} catch {
			// Ignore storage failures in restricted browser modes.
		}
	}

	function formatEpisodeDate(value: string): string {
		const parsed = Date.parse(value);
		if (!Number.isFinite(parsed)) {
			return "";
		}

		return new Date(parsed).toLocaleDateString(language === "de" ? "de-DE" : "en-GB", {
			day: "2-digit",
			month: "short",
			year: "numeric"
		});
	}

	function episodeUrl(episode: PodcastEpisode): string {
		return episode.url || episode.audioUrl || "#";
	}

	function feedStatusMessage(): string {
		if (feed.status === "missing-url") {
			return t(podcast.missingFeedMessage);
		}
		if (feed.status === "error") {
			return t(podcast.feedErrorMessage);
		}
		if (feed.status === "empty") {
			return t(podcast.emptyFeedMessage);
		}
		return "";
	}

	function handleNewsletterSubmit(event: SubmitEvent) {
		event.preventDefault();
		newsletterSubmitted = true;
	}
</script>

<svelte:head>
	<title>{t(podcast.metaTitle)}</title>
	<meta name="description" content={t(podcast.metaDescription)} />
	<meta property="og:title" content={t(podcast.metaTitle)} />
	<meta property="og:description" content={t(podcast.metaDescription)} />
	<meta property="og:type" content="website" />
	<meta property="og:image" content={podcast.fallbackCover} />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="podcast-shell">
	<div class="ambient" aria-hidden="true"></div>

	<header class="podcast-header">
		<a class="brand" href="/">
			<img src="/assets/SxE%20Logo.png" alt="Science x Entrepreneurship" />
		</a>
		<div class="header-actions">
			<div class="language-toggle" aria-label={t(landing.languageToggleLabel)}>
				<button type="button" class:active={language === "de"} onclick={() => setLanguage("de")}>
					DE
				</button>
				<button type="button" class:active={language === "en"} onclick={() => setLanguage("en")}>
					EN
				</button>
			</div>
			<button
				type="button"
				class="theme-toggle"
				class:light={themeMode === "light"}
				aria-label={t(landing.themeToggleAriaLabel)}
				onclick={toggleTheme}
			>
				<Sun size={15} />
				<Moon size={15} />
				<span></span>
			</button>
		</div>
	</header>

	<main class="podcast-main">
		<a class="back-link" href="/"><ArrowLeft size={16} /> {t(podcast.backLinkLabel)}</a>

		<section class="hero-panel">
			<div class="hero-copy">
				<p class="kicker">{t(podcast.kicker)}</p>
				<h1>{t(podcast.title)}</h1>
				<p>{t(podcast.intro)}</p>
				<div class="platform-list" aria-label={t(podcast.listenLabel)}>
					{#each podcast.platformLinks as link (link.label)}
						<a href={link.url} target="_blank" rel="noopener noreferrer">
							{link.label}
							<ExternalLink size={13} />
						</a>
					{/each}
				</div>
			</div>
			<img
				class="hero-cover"
				src={latestEpisode?.image || podcast.fallbackCover}
				alt={latestEpisode?.title || t(podcast.title)}
				loading="eager"
				decoding="async"
			/>
		</section>

		{#if feed.status !== "ok"}
			<section class="status-panel" role="status">
				<h2>{language === "de" ? "RSS-Status" : "RSS status"}</h2>
				<p>{feedStatusMessage()}</p>
				{#if feed.errorMessage}
					<code>{feed.errorMessage}</code>
				{/if}
			</section>
		{/if}

		{#if latestEpisode}
			<section class="latest-panel" aria-labelledby="latest-episode-title">
				<div>
					<p class="kicker">{t(podcast.latestLabel)}</p>
					<h2 id="latest-episode-title">{latestEpisode.title}</h2>
					<p>{latestEpisode.description}</p>
					<div class="episode-meta">
						{#if formatEpisodeDate(latestEpisode.date)}
							<span>{formatEpisodeDate(latestEpisode.date)}</span>
						{/if}
						{#if latestEpisode.duration}
							<span>{latestEpisode.duration}</span>
						{/if}
					</div>
					<a class="button-primary" href={episodeUrl(latestEpisode)} target="_blank" rel="noopener noreferrer">
						{t(podcast.episodeCtaLabel)}
						<ArrowRight size={15} />
					</a>
				</div>
				<img src={latestEpisode.image || podcast.fallbackCover} alt={latestEpisode.title} loading="lazy" />
			</section>
		{/if}

		<section class="episodes-panel" aria-labelledby="recent-episodes-title">
			<div class="section-head">
				<div>
					<p class="kicker">{t(podcast.recentLabel)}</p>
					<h2 id="recent-episodes-title">{t(podcast.recentLabel)}</h2>
				</div>
				<label class="search-box">
					<span>{t(podcast.searchLabel)}</span>
					<div>
						<Search size={15} />
						<input bind:value={searchQuery} placeholder={t(podcast.searchPlaceholder)} />
					</div>
				</label>
			</div>

			{#if filteredEpisodes.length > 0}
				<div class="episode-grid">
					{#each filteredEpisodes as episode (episode.id)}
						<article class="episode-card">
							<img src={episode.image || podcast.fallbackCover} alt={episode.title} loading="lazy" />
							<div>
								<p class="episode-date">{formatEpisodeDate(episode.date)}</p>
								<h3>{episode.title}</h3>
								<p>{episode.description}</p>
								<a href={episodeUrl(episode)} target="_blank" rel="noopener noreferrer">
									{t(podcast.episodeCtaLabel)}
									<ExternalLink size={13} />
								</a>
							</div>
						</article>
					{/each}
				</div>
			{:else}
				<p class="empty-state">{searchQuery ? t(podcast.noResultsMessage) : feedStatusMessage()}</p>
			{/if}
		</section>

		<section class="newsletter-panel">
			<div>
				<p class="kicker">Newsletter</p>
				<h2>{t(podcast.newsletterTitle)}</h2>
				<p>{t(podcast.newsletterLead)}</p>
			</div>
			<form onsubmit={handleNewsletterSubmit}>
				<label for="podcast-newsletter-email">{t(podcast.newsletterEmailLabel)}</label>
				<div class="newsletter-row">
					<input
						id="podcast-newsletter-email"
						name="email"
						type="email"
						required
						placeholder={t(podcast.newsletterEmailPlaceholder)}
					/>
					<button type="submit">{t(podcast.newsletterSubmitLabel)}</button>
				</div>
				{#if newsletterSubmitted}
					<p class="form-note" role="status">
						{language === "de" ? "Danke, wir haben deine Eintragung vorgemerkt." : "Thanks, we noted your subscription."}
					</p>
				{/if}
			</form>
		</section>
	</main>
</div>

<style>
	:global(body) {
		margin: 0;
		font-family: "Manrope", system-ui, sans-serif;
		background: var(--background);
	}

	.podcast-shell {
		min-height: 100vh;
		color: var(--foreground);
		position: relative;
		overflow-x: clip;
	}

	.ambient {
		position: fixed;
		inset: 0;
		pointer-events: none;
		background:
			radial-gradient(circle at 10% 8%, rgb(var(--rgb-brand-blue) / 0.18), transparent 30%),
			radial-gradient(circle at 86% 14%, rgb(var(--rgb-accent-teal) / 0.12), transparent 34%);
		z-index: 0;
	}

	.podcast-header,
	.podcast-main {
		position: relative;
		z-index: 1;
		width: min(1140px, calc(100% - 2.5rem));
		margin-inline: auto;
	}

	.podcast-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 0;
	}

	.brand,
	.back-link,
	.platform-list a,
	.episode-card a {
		color: inherit;
		text-decoration: none;
	}

	.brand {
		display: inline-flex;
		align-items: center;
		font-weight: 800;
	}

	.brand img {
		width: auto;
		height: clamp(3.2rem, 5.2vw, 4.6rem);
		max-width: min(13rem, 44vw);
		object-fit: contain;
	}

	.header-actions,
	.language-toggle,
	.theme-toggle {
		display: inline-flex;
		align-items: center;
	}

	.header-actions {
		gap: 0.55rem;
	}

	.language-toggle,
	.theme-toggle {
		height: 2.25rem;
		border: 1px solid rgb(var(--rgb-white) / 0.14);
		border-radius: 999px;
		background: rgb(var(--rgb-white) / 0.07);
	}

	.language-toggle {
		padding: 0.18rem;
	}

	.language-toggle button {
		height: 1.85rem;
		padding: 0 0.65rem;
		border: 0;
		border-radius: 999px;
		background: transparent;
		color: rgb(181 192 214);
		font-weight: 800;
		cursor: pointer;
	}

	.language-toggle button.active {
		background: rgb(var(--rgb-brand-blue));
		color: rgb(16 32 58);
	}

	.theme-toggle {
		position: relative;
		gap: 0.35rem;
		width: 4.1rem;
		justify-content: space-around;
		color: rgb(237 244 255);
		cursor: pointer;
	}

	.theme-toggle span {
		position: absolute;
		z-index: -1;
		left: 0.22rem;
		width: 1.65rem;
		height: 1.65rem;
		border-radius: 999px;
		background: rgb(var(--rgb-brand-blue));
		transform: translateX(1.76rem);
		transition: transform 0.2s ease;
	}

	.theme-toggle.light span {
		transform: translateX(0);
	}

	.podcast-main {
		display: grid;
		gap: 1rem;
		padding: 0.5rem 0 2rem;
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		width: fit-content;
		color: rgb(197 211 234);
		font-weight: 800;
	}

	.hero-panel,
	.latest-panel,
	.episodes-panel,
	.newsletter-panel,
	.status-panel {
		border: 1px solid rgb(var(--rgb-white) / 0.14);
		border-radius: 0.95rem;
		background: linear-gradient(160deg, rgb(21 30 50 / 0.88), rgb(10 14 23 / 0.92));
		box-shadow: 0 20px 30px rgb(var(--rgb-black) / 0.22);
	}

	.hero-panel,
	.latest-panel,
	.newsletter-panel {
		display: grid;
		grid-template-columns: minmax(0, 1.25fr) minmax(15rem, 0.75fr);
		gap: 1.2rem;
		align-items: center;
		padding: clamp(1rem, 3vw, 1.6rem);
	}

	.hero-copy {
		display: grid;
		gap: 0.9rem;
	}

	.kicker,
	.episode-date {
		margin: 0;
		color: rgb(255 205 130);
		font-size: 0.72rem;
		font-weight: 900;
		letter-spacing: 0.16em;
		text-transform: uppercase;
	}

	h1,
	h2,
	h3 {
		margin: 0;
		font-family: "Space Grotesk", "Manrope", sans-serif;
		line-height: 1.08;
	}

	h1 {
		font-size: clamp(2.3rem, 8vw, 5.2rem);
	}

	h2 {
		font-size: clamp(1.45rem, 4vw, 2.35rem);
	}

	h3 {
		font-size: 1.05rem;
	}

	p {
		margin: 0;
		color: rgb(197 211 234);
		line-height: 1.6;
	}

	.hero-cover,
	.latest-panel img,
	.episode-card img {
		display: block;
		width: 100%;
		border-radius: 0.75rem;
		background: rgb(var(--rgb-white) / 0.92);
		object-fit: cover;
	}

	.hero-cover,
	.latest-panel img {
		aspect-ratio: 1;
	}

	.platform-list,
	.episode-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.platform-list a,
	.button-primary,
	.episode-card a {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		width: fit-content;
		min-height: 2.25rem;
		border-radius: 999px;
		font-weight: 900;
	}

	.platform-list a,
	.episode-card a {
		padding: 0 0.75rem;
		border: 1px solid rgb(var(--rgb-white) / 0.14);
		background: rgb(var(--rgb-white) / 0.07);
		color: rgb(255 205 130);
	}

	.button-primary {
		margin-top: 0.4rem;
		padding: 0 0.9rem;
		background: rgb(var(--rgb-brand-blue));
		color: rgb(16 32 58);
		text-decoration: none;
	}

	.latest-panel > div,
	.newsletter-panel > div,
	.status-panel {
		display: grid;
		gap: 0.75rem;
	}

	.episode-meta span {
		color: rgb(151 173 211);
		font-size: 0.82rem;
		font-weight: 800;
	}

	.status-panel,
	.episodes-panel {
		padding: clamp(1rem, 3vw, 1.35rem);
	}

	.status-panel code {
		overflow-wrap: anywhere;
		color: rgb(255 205 130);
	}

	.section-head {
		display: flex;
		gap: 1rem;
		align-items: end;
		justify-content: space-between;
		margin-bottom: 1rem;
	}

	.search-box {
		display: grid;
		gap: 0.35rem;
		min-width: min(100%, 22rem);
		color: rgb(197 211 234);
		font-size: 0.82rem;
		font-weight: 800;
	}

	.search-box div,
	.newsletter-row {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		gap: 0.45rem;
		align-items: center;
	}

	.search-box div {
		height: 2.5rem;
		padding: 0 0.75rem;
		border: 1px solid rgb(var(--rgb-white) / 0.14);
		border-radius: 999px;
		background: rgb(var(--rgb-black) / 0.18);
	}

	input {
		min-width: 0;
		border: 0;
		background: transparent;
		color: inherit;
		font: inherit;
		outline: none;
	}

	.episode-grid {
		display: grid;
		gap: 0.8rem;
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
	}

	.episode-card {
		display: grid;
		grid-template-columns: 6rem minmax(0, 1fr);
		gap: 0.75rem;
		padding: 0.85rem;
		border: 1px solid rgb(var(--rgb-white) / 0.12);
		border-radius: 0.8rem;
		background: rgb(var(--rgb-white) / 0.06);
	}

	.episode-card img {
		aspect-ratio: 1;
	}

	.episode-card div {
		display: grid;
		gap: 0.4rem;
		min-width: 0;
	}

	.episode-card p:not(.episode-date) {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		overflow: hidden;
	}

	.empty-state,
	.form-note {
		color: rgb(255 205 130);
		font-weight: 800;
	}

	.newsletter-panel form {
		display: grid;
		gap: 0.55rem;
	}

	.newsletter-panel label {
		color: rgb(237 244 255);
		font-weight: 800;
	}

	.newsletter-row {
		grid-template-columns: minmax(0, 1fr) auto;
	}

	.newsletter-row input {
		height: 2.5rem;
		padding: 0 0.8rem;
		border: 1px solid rgb(var(--rgb-white) / 0.14);
		border-radius: 0.65rem;
		background: rgb(var(--rgb-black) / 0.18);
	}

	.newsletter-row button {
		height: 2.5rem;
		border: 0;
		border-radius: 0.65rem;
		padding: 0 0.85rem;
		background: rgb(var(--rgb-brand-blue));
		color: rgb(16 32 58);
		font-weight: 900;
		cursor: pointer;
	}

	:global(html:not(.dark)) .podcast-shell {
		background:
			linear-gradient(180deg, rgb(249 250 252 / 0.98), rgb(246 248 251 / 0.98)),
			rgb(var(--rgb-surface-light));
	}

	:global(html:not(.dark)) .ambient {
		background:
			radial-gradient(circle at 10% 8%, rgb(88 105 128 / 0.08), transparent 30%),
			radial-gradient(circle at 86% 14%, rgb(88 105 128 / 0.06), transparent 34%);
	}

	:global(html:not(.dark)) .back-link,
	:global(html:not(.dark)) p,
	:global(html:not(.dark)) .search-box,
	:global(html:not(.dark)) .newsletter-panel label {
		color: rgb(64 84 114);
	}

	:global(html:not(.dark)) .hero-panel,
	:global(html:not(.dark)) .latest-panel,
	:global(html:not(.dark)) .episodes-panel,
	:global(html:not(.dark)) .newsletter-panel,
	:global(html:not(.dark)) .status-panel {
		border-color: rgb(176 112 24 / 0.18);
		background: linear-gradient(150deg, rgb(var(--rgb-white) / 0.96), rgb(255 238 214 / 0.44));
		box-shadow: 0 18px 28px rgb(var(--rgb-slate-900) / 0.08);
	}

	:global(html:not(.dark)) h1,
	:global(html:not(.dark)) h2,
	:global(html:not(.dark)) h3 {
		color: rgb(18 37 63);
	}

	:global(html:not(.dark)) .language-toggle,
	:global(html:not(.dark)) .theme-toggle,
	:global(html:not(.dark)) .platform-list a,
	:global(html:not(.dark)) .episode-card a,
	:global(html:not(.dark)) .search-box div,
	:global(html:not(.dark)) .newsletter-row input {
		border-color: rgb(176 112 24 / 0.22);
		background: rgb(var(--rgb-white) / 0.7);
		color: rgb(111 70 17);
	}

	:global(html:not(.dark)) .episode-card {
		border-color: rgb(var(--rgb-slate-900) / 0.12);
		background: rgb(var(--rgb-white) / 0.62);
	}

	@media (max-width: 820px) {
		.hero-panel,
		.latest-panel,
		.newsletter-panel {
			grid-template-columns: 1fr;
		}

		.section-head {
			align-items: stretch;
			flex-direction: column;
		}
	}

	@media (max-width: 560px) {
		.podcast-header,
		.podcast-main {
			width: calc(100% - 1.4rem);
		}

		.brand img {
			height: 3.35rem;
			max-width: 42vw;
		}

		.episode-card {
			grid-template-columns: 1fr;
		}

		.newsletter-row {
			grid-template-columns: 1fr;
		}
	}
</style>
