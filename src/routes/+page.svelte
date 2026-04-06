<script lang="ts">
	import { onMount } from "svelte";
	import {
		ArrowRight,
		Sparkles,
		Newspaper,
		Mail,
		Users,
		ChevronLeft,
		ChevronRight,
		X
	} from "lucide-svelte";
	import type { NewsItem } from "$lib/cms/types";
	import type { PageData } from "./$types";

	const MOBILE_NEWS_BREAKPOINT = 720;
	const TABLET_NEWS_BREAKPOINT = 1120;
	const SWIPE_ACTIVATION_THRESHOLD = 10;
	const SWIPE_TRIGGER_THRESHOLD = 64;
	const SWIPE_MAX_OFFSET = 68;
	const SWIPE_EDGE_RESISTANCE = 0.34;
	const THEME_STORAGE_KEY = "sxe-theme";

	type ThemeMode = "dark" | "light";
	type PodcastPlatform = "youtube-music" | "youtube" | "spotify" | "apple" | "amazon";

	const PODCAST_BRAND_ICON_URLS: Record<PodcastPlatform, string> = {
		apple: "https://cdn.simpleicons.org/applepodcasts",
		spotify: "https://cdn.simpleicons.org/spotify",
		amazon: "https://cdn.simpleicons.org/amazonmusic",
		youtube: "https://cdn.simpleicons.org/youtube",
		"youtube-music": "https://cdn.simpleicons.org/youtubemusic"
	};

	let { data } = $props<{ data: PageData }>();

	let isMobileMenuOpen = $state(false);
	let viewportWidth = $state(1400);
	let newsStartIndex = $state(0);
	let isPodcastModalOpen = $state(false);
	let activeModalNewsId = $state<string | null>(null);
	let themeMode = $state<ThemeMode>("dark");
	let swipePointerId = $state<number | null>(null);
	let swipeStartX = $state(0);
	let swipeStartY = $state(0);
	let swipeAxis = $state<"horizontal" | "vertical" | null>(null);
	let swipeOffsetX = $state(0);

	let newsCarouselElement: HTMLDivElement | null = null;
	let modalCloseButton = $state<HTMLButtonElement | null>(null);
	let lastFocusedElement: HTMLElement | null = null;

	const content = $derived(data.content);
	const newsVisibleCount = $derived.by(() => {
		const total = content.news.length;
		if (total === 0) {
			return 0;
		}
		if (viewportWidth < MOBILE_NEWS_BREAKPOINT) {
			return 1;
		}
		if (viewportWidth < TABLET_NEWS_BREAKPOINT) {
			return Math.min(2, total);
		}
		return Math.min(3, total);
	});
	const newsMaxStartIndex = $derived.by(() => Math.max(content.news.length - newsVisibleCount, 0));
	const canNavigateNews = $derived.by(() => content.news.length > newsVisibleCount);
	const canGoPreviousNews = $derived.by(() => canNavigateNews && newsStartIndex > 0);
	const canGoNextNews = $derived.by(() => canNavigateNews && newsStartIndex < newsMaxStartIndex);
	const visibleNews = $derived.by(() => {
		const total = content.news.length;
		const visibleCount = Math.min(newsVisibleCount, total);

		if (total === 0 || visibleCount === 0) {
			return [];
		}

		if (total <= visibleCount) {
			return content.news;
		}

		return content.news.slice(newsStartIndex, newsStartIndex + visibleCount);
	});
	const isNewsTrackDragging = $derived.by(
		() => swipePointerId !== null && swipeAxis === "horizontal"
	);
	const activeModalNewsItem = $derived.by((): NewsItem | undefined => {
		if (!activeModalNewsId) {
			return undefined;
		}

		return content.news.find((item: NewsItem) => item.id === activeModalNewsId);
	});
	const activeModalYoutubeEmbedUrl = $derived.by(() => {
		if (!activeModalNewsItem) {
			return null;
		}

		return deriveYoutubeEmbedUrl(activeModalNewsItem);
	});
	const currentThemeModeLabel = $derived.by(() =>
		themeMode === "dark" ? content.site.themeDarkModeLabel : content.site.themeLightModeLabel
	);

	onMount(() => {
		const updateViewportWidth = () => {
			viewportWidth = window.innerWidth;
		};

		updateViewportWidth();
		themeMode = getCurrentThemeMode();
		window.addEventListener("resize", updateViewportWidth);

		return () => {
			window.removeEventListener("resize", updateViewportWidth);
		};
	});

	$effect(() => {
		if (!canNavigateNews) {
			newsStartIndex = 0;
			return;
		}

		if (newsStartIndex < 0) {
			newsStartIndex = 0;
			return;
		}

		if (newsStartIndex > newsMaxStartIndex) {
			newsStartIndex = newsMaxStartIndex;
		}
	});

	$effect(() => {
		if (isPodcastModalOpen && !activeModalNewsItem) {
			closePodcastModal();
		}
	});

	$effect(() => {
		if (!isPodcastModalOpen || typeof window === "undefined") {
			return;
		}

		const handleEscapeKey = (event: KeyboardEvent) => {
			if (event.key !== "Escape") {
				return;
			}

			event.preventDefault();
			closePodcastModal();
		};

		window.addEventListener("keydown", handleEscapeKey);
		return () => {
			window.removeEventListener("keydown", handleEscapeKey);
		};
	});

	$effect(() => {
		if (!isPodcastModalOpen || typeof document === "undefined") {
			return;
		}

		lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";

		requestAnimationFrame(() => {
			modalCloseButton?.focus();
		});

		return () => {
			document.body.style.overflow = previousOverflow;
			lastFocusedElement?.focus();
			lastFocusedElement = null;
		};
	});

	function toggleMenu() {
		isMobileMenuOpen = !isMobileMenuOpen;
	}

	function closeMenu() {
		isMobileMenuOpen = false;
	}

	function toggleThemeMode() {
		applyThemeMode(themeMode === "dark" ? "light" : "dark");
	}

	function handleNewsletterSubmit(event: SubmitEvent) {
		event.preventDefault();
	}

	function formatNewsDate(value: string): string {
		const parsed = Date.parse(value);
		if (!Number.isFinite(parsed)) {
			return value;
		}
		return new Date(parsed).toLocaleDateString("de-DE", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric"
		});
	}

	function showPreviousNews() {
		if (!canGoPreviousNews) {
			return;
		}
		newsStartIndex -= 1;
	}

	function showNextNews() {
		if (!canGoNextNews) {
			return;
		}
		newsStartIndex += 1;
	}

	function openPodcastModal(itemId: string) {
		activeModalNewsId = itemId;
		isPodcastModalOpen = true;
	}

	function closePodcastModal() {
		isPodcastModalOpen = false;
		activeModalNewsId = null;
	}

	function handlePodcastModalBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			closePodcastModal();
		}
	}

	function handleNewsPointerDown(event: PointerEvent) {
		if (!canNavigateNews) {
			return;
		}

		if (!(event.target instanceof HTMLElement)) {
			return;
		}

		// Never start swipe logic from interactive elements like the episode CTA.
		if (event.target.closest(".news-card-action")) {
			return;
		}

		// Swipe should support touch/pen gestures and not interfere with normal mouse clicks.
		if (event.pointerType === "mouse" || event.button !== 0) {
			return;
		}

		swipePointerId = event.pointerId;
		swipeStartX = event.clientX;
		swipeStartY = event.clientY;
		swipeAxis = null;
		swipeOffsetX = 0;
	}

	function handleNewsPointerMove(event: PointerEvent) {
		if (swipePointerId === null || event.pointerId !== swipePointerId) {
			return;
		}

		const deltaX = event.clientX - swipeStartX;
		const deltaY = event.clientY - swipeStartY;

		if (!swipeAxis) {
			if (
				Math.abs(deltaX) < SWIPE_ACTIVATION_THRESHOLD &&
				Math.abs(deltaY) < SWIPE_ACTIVATION_THRESHOLD
			) {
				return;
			}

			swipeAxis = Math.abs(deltaX) >= Math.abs(deltaY) ? "horizontal" : "vertical";
		}

		if (swipeAxis !== "horizontal") {
			return;
		}

		const isBlockedAtEdge = (deltaX > 0 && !canGoPreviousNews) || (deltaX < 0 && !canGoNextNews);
		const adjustedDeltaX = isBlockedAtEdge ? deltaX * SWIPE_EDGE_RESISTANCE : deltaX;
		swipeOffsetX = Math.max(-SWIPE_MAX_OFFSET, Math.min(SWIPE_MAX_OFFSET, adjustedDeltaX));
	}

	function completeNewsSwipe() {
		if (swipePointerId === null) {
			return;
		}

		if (swipeAxis === "horizontal") {
			if (swipeOffsetX <= -SWIPE_TRIGGER_THRESHOLD && canGoNextNews) {
				showNextNews();
			} else if (swipeOffsetX >= SWIPE_TRIGGER_THRESHOLD && canGoPreviousNews) {
				showPreviousNews();
			}
		}

		swipePointerId = null;
		swipeAxis = null;
		swipeOffsetX = 0;
	}

	function bindNewsSwipe(node: HTMLDivElement) {
		newsCarouselElement = node;

		const onPointerDown = (event: PointerEvent) => handleNewsPointerDown(event);
		const onPointerMove = (event: PointerEvent) => handleNewsPointerMove(event);
		const onPointerEnd = () => completeNewsSwipe();

		node.addEventListener("pointerdown", onPointerDown);
		node.addEventListener("pointermove", onPointerMove);
		node.addEventListener("pointerup", onPointerEnd);
		node.addEventListener("pointercancel", onPointerEnd);

		return {
			destroy() {
				node.removeEventListener("pointerdown", onPointerDown);
				node.removeEventListener("pointermove", onPointerMove);
				node.removeEventListener("pointerup", onPointerEnd);
				node.removeEventListener("pointercancel", onPointerEnd);
				if (newsCarouselElement === node) {
					newsCarouselElement = null;
				}
			}
		};
	}

	function podcastPlatformKey(label: string, url: string): PodcastPlatform | null {
		const normalizedLabel = label.toLowerCase();
		const normalizedUrl = url.toLowerCase();
		const combined = `${normalizedLabel} ${normalizedUrl}`;

		if (combined.includes("youtube music") || normalizedUrl.includes("music.youtube.com")) {
			return "youtube-music";
		}

		if (combined.includes("youtube") || normalizedUrl.includes("youtu")) {
			return "youtube";
		}

		if (combined.includes("spotify")) {
			return "spotify";
		}

		if (combined.includes("apple")) {
			return "apple";
		}

		if (combined.includes("amazon")) {
			return "amazon";
		}

		return null;
	}

	function podcastPlatformBrandIconUrl(platform: PodcastPlatform | null): string | null {
		if (!platform) {
			return null;
		}

		return PODCAST_BRAND_ICON_URLS[platform];
	}

	function deriveYoutubeEmbedUrl(news: NewsItem): string | null {
		const youtubeLink = news.podcastLinks.find((link) => {
			const platform = podcastPlatformKey(link.label, link.url);
			return platform === "youtube" || platform === "youtube-music";
		});

		if (!youtubeLink) {
			return null;
		}

		const parsed = parseUrl(youtubeLink.url);
		if (!parsed) {
			return null;
		}

		const host = parsed.hostname.toLowerCase().replace(/^www\./, "").replace(/^m\./, "");
		const pathname = parsed.pathname;
		const pathSegments = pathname.split("/").filter(Boolean);
		const list = parsed.searchParams.get("list");

		if (host === "youtu.be" && pathSegments[0]) {
			return buildYoutubeVideoEmbed(pathSegments[0]);
		}

		if (host === "youtube.com" || host === "music.youtube.com" || host === "youtube-nocookie.com") {
			if (pathname === "/watch") {
				const videoId = parsed.searchParams.get("v");
				if (videoId) {
					return buildYoutubeVideoEmbed(videoId);
				}
			}

			if (pathSegments[0] === "shorts" && pathSegments[1]) {
				return buildYoutubeVideoEmbed(pathSegments[1]);
			}

			if (pathSegments[0] === "live" && pathSegments[1]) {
				return buildYoutubeVideoEmbed(pathSegments[1]);
			}

			if (pathSegments[0] === "embed" && pathSegments[1]) {
				return buildYoutubeVideoEmbed(pathSegments[1]);
			}

			if (list) {
				return buildYoutubePlaylistEmbed(list);
			}
		}

		return null;
	}

	function parseUrl(value: string): URL | null {
		try {
			return new URL(value);
		} catch {
			return null;
		}
	}

	function buildYoutubeVideoEmbed(videoId: string): string {
		return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?rel=0`;
	}

	function buildYoutubePlaylistEmbed(listId: string): string {
		return `https://www.youtube-nocookie.com/embed/videoseries?list=${encodeURIComponent(listId)}`;
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

		if (typeof window !== "undefined") {
			window.localStorage.setItem(THEME_STORAGE_KEY, mode);
		}
	}
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="page-shell">
	<a class="skip-link" href="#main-theme">{content.site.skipLinkLabel}</a>
	<div class="ambient" aria-hidden="true"></div>

	<header class="site-header" id="top">
			<div class="inner header-row">
				<a class="brand" href="#top">
					<span class="brand-dot" aria-hidden="true"></span>
					{content.site.brandName}
				</a>

				<button
					type="button"
					class="menu-toggle"
				onclick={toggleMenu}
				aria-expanded={isMobileMenuOpen}
				aria-controls="site-nav"
				aria-label="Navigation umschalten"
			>
				<span></span>
				<span></span>
				<span></span>
			</button>

				<nav id="site-nav" class:open={isMobileMenuOpen}>
					<a href="#main-theme" onclick={closeMenu}>{content.site.navMainThemeLabel}</a>
					<a href="#mission" onclick={closeMenu}>{content.site.navMissionLabel}</a>
					<a href="#newsletter" onclick={closeMenu}>{content.site.navNewsletterLabel}</a>
					<a href="#team" onclick={closeMenu}>{content.site.navTeamLabel}</a>
					<a href="/impressum" onclick={closeMenu}>{content.site.navImpressumLabel}</a>
					<button
						type="button"
						class="theme-toggle"
						onclick={() => {
							toggleThemeMode();
							closeMenu();
						}}
						aria-label={content.site.themeToggleAriaLabel}
					>
						{currentThemeModeLabel}
					</button>
				</nav>
			</div>
		</header>

	<main class="main-stack">
		<section id="main-theme" class="panel hero-panel reveal" style="--delay: 60ms;">
			<div class="hero-copy">
				<p class="kicker"><Sparkles size={14} strokeWidth={2.2} /> {content.site.heroKicker}</p>
				<h1>{content.site.heroTitle}</h1>
				<p class="lead">{content.site.heroLead}</p>
				<div class="hero-actions">
					<a href={content.site.heroPrimaryHref} class="button button-primary"
						>{content.site.heroPrimaryLabel} <ArrowRight size={16} /></a
					>
					<a href={content.site.heroSecondaryHref} class="button button-ghost"
						>{content.site.heroSecondaryLabel}</a
					>
				</div>
			</div>

			<aside class="cms-chip" aria-label="CMS-Information">
				<p class="chip-head"><Newspaper size={14} strokeWidth={2.2} /> {content.site.cmsChipTitle}</p>
				<p>{content.site.cmsChipBody}</p>
				<div class="chip-grid">
					<span>{content.site.cmsChipTag1}</span>
					<span>{content.site.cmsChipTag2}</span>
					<span>{content.site.cmsChipTag3}</span>
				</div>
			</aside>

				<div class="news-carousel-shell">
					{#if canNavigateNews}
						<div class="news-carousel-controls" aria-label={content.site.newsControlsAriaLabel}>
							<button
								type="button"
								class="news-carousel-button"
								onclick={showPreviousNews}
								disabled={!canGoPreviousNews}
								aria-label={content.site.newsPreviousButtonAriaLabel}
							>
								<ChevronLeft size={16} />
								<span>{content.site.newsPreviousButtonLabel}</span>
							</button>
							<button
								type="button"
								class="news-carousel-button"
								onclick={showNextNews}
								disabled={!canGoNextNews}
								aria-label={content.site.newsNextButtonAriaLabel}
							>
								<span>{content.site.newsNextButtonLabel}</span>
								<ChevronRight size={16} />
							</button>
						</div>
					{/if}

					<div
						class="news-carousel"
						role="region"
						aria-label={content.site.newsCarouselAriaLabel}
						use:bindNewsSwipe
					>
					<div
						class="news-track"
						class:dragging={isNewsTrackDragging}
						style={`--news-columns: ${newsVisibleCount || 1}; --news-drag-offset: ${swipeOffsetX}px;`}
					>
						{#each visibleNews as item (item.id)}
							<article class="news-card">
								<p class="meta">{formatNewsDate(item.date)}</p>
								<h2>{item.title}</h2>
								<p>{item.excerpt}</p>
									<button
										type="button"
										class="news-card-action"
										onclick={() => openPodcastModal(item.id)}
									>
									{item.ctaLabel}
									<ArrowRight size={14} />
								</button>
							</article>
						{/each}
					</div>
				</div>
			</div>
		</section>

		<section id="mission" class="panel mission-panel reveal" style="--delay: 120ms;">
			<p class="kicker"><Sparkles size={14} strokeWidth={2.2} /> {content.site.missionKicker}</p>
			<h2>{content.site.missionTitle}</h2>
			<div class="mission-grid">
				{#each content.missionItems as item (item.id)}
					<article class="mission-card">
						<h3>{item.title}</h3>
						<p>{item.text}</p>
					</article>
				{/each}
			</div>
		</section>

		<section id="newsletter" class="panel newsletter-panel reveal" style="--delay: 180ms;">
			<div class="newsletter-copy">
				<p class="kicker"><Mail size={14} strokeWidth={2.2} /> {content.site.newsletterKicker}</p>
				<h2>{content.site.newsletterTitle}</h2>
				<p class="lead">{content.site.newsletterLead}</p>
			</div>

			<form class="newsletter-form" onsubmit={handleNewsletterSubmit}>
				<label for="newsletter-email">{content.site.newsletterEmailLabel}</label>
				<input
					id="newsletter-email"
					type="email"
					placeholder={content.site.newsletterEmailPlaceholder}
					required
				/>
				<button type="submit">{content.site.newsletterSubmitLabel} <ArrowRight size={14} /></button>
			</form>
		</section>

		<section id="team" class="panel team-panel reveal" style="--delay: 240ms;">
			<p class="kicker"><Users size={14} strokeWidth={2.2} /> {content.site.teamKicker}</p>
			<h2>{content.site.teamTitle}</h2>
			<div class="team-grid">
				{#each content.teamMembers as item (item.id)}
					<article class="team-card">
						<div class="avatar" aria-hidden="true">{item.avatarLabel}</div>
						<h3>{item.name}</h3>
						<p class="meta">{item.role}</p>
						<p>{item.text}</p>
					</article>
				{/each}
			</div>
		</section>
	</main>

	<footer id="footer" class="site-footer reveal" style="--delay: 360ms;">
		<div class="inner footer-grid">
			<div>
				<h2>{content.site.footerTitle}</h2>
				<p>{content.site.footerDescription}</p>
			</div>
			<div class="footer-links">
				<a href="#top">{content.site.footerStartLabel}</a>
				<a href="#main-theme">{content.site.footerNewsLabel}</a>
				<a href="/impressum">{content.site.footerImpressumLabel}</a>
				<a href="/impressum#datenschutz">{content.site.footerDatenschutzLabel}</a>
			</div>
		</div>
		<p class="footer-end">© {new Date().getFullYear()} {content.site.copyrightBrandName}</p>
	</footer>

	{#if isPodcastModalOpen && activeModalNewsItem}
		<div class="modal-overlay" role="presentation" onclick={handlePodcastModalBackdropClick}>
			<div
				class="podcast-modal"
				role="dialog"
				aria-modal="true"
				aria-labelledby="podcast-modal-title"
			>
					<button
						type="button"
						class="podcast-modal-close"
						aria-label={content.site.podcastModalCloseButtonAriaLabel}
						onclick={closePodcastModal}
						bind:this={modalCloseButton}
					>
					<X size={16} />
				</button>

					<p class="podcast-modal-date">{formatNewsDate(activeModalNewsItem.date)}</p>
					<h2 id="podcast-modal-title">{activeModalNewsItem.title}</h2>

					{#if activeModalYoutubeEmbedUrl}
						<div class="podcast-youtube-embed">
							<iframe
								src={activeModalYoutubeEmbedUrl}
								title={`${content.site.podcastModalYoutubeTitlePrefix}: ${activeModalNewsItem.title}`}
								loading="lazy"
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
								referrerpolicy="strict-origin-when-cross-origin"
								allowfullscreen
							></iframe>
						</div>
					{/if}

					{#if activeModalNewsItem.podcastLinks.length > 0}
						<div class="podcast-link-grid">
								{#each activeModalNewsItem.podcastLinks as link (`${link.label}-${link.url}`)}
									{@const platform = podcastPlatformKey(link.label, link.url)}
									{@const brandIconUrl = podcastPlatformBrandIconUrl(platform)}
									<a href={link.url} target="_blank" rel="noopener noreferrer">
										<span class="podcast-link-main">
											{#if brandIconUrl}
												<span class="podcast-link-icon" aria-hidden="true">
													<img src={brandIconUrl} alt="" loading="lazy" decoding="async" />
												</span>
											{/if}
											<span>{link.label}</span>
										</span>
								</a>
							{/each}
						</div>
					{:else}
					<p class="podcast-empty">{content.site.podcastModalEmptyStateText}</p>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	:global(html) {
		scroll-behavior: smooth;
	}

	:global(body) {
		margin: 0;
		font-family: "Manrope", "Avenir Next", sans-serif;
		background: var(--background);
	}

	:global(*:focus-visible) {
		outline: 2px solid rgb(var(--rgb-focus-blue));
		outline-offset: 2px;
	}

	.page-shell {
		--shell-0: rgb(8 17 31);
		--shell-1: rgb(11 28 42);
		--shell-2: rgb(17 26 47);
		--line-soft: rgb(var(--rgb-white) / 0.12);
		--line-strong: rgb(var(--rgb-white) / 0.2);
		--copy-muted: rgb(181 192 214);
		min-height: 100vh;
		color: var(--foreground);
		position: relative;
		overflow: clip;
	}

	.ambient {
		position: fixed;
		inset: 0;
		pointer-events: none;
		background:
			radial-gradient(circle at 10% 8%, rgb(var(--rgb-accent-blue) / 0.24), transparent 30%),
			radial-gradient(circle at 86% 14%, rgb(var(--rgb-accent-teal) / 0.16), transparent 34%),
			linear-gradient(180deg, rgb(var(--rgb-white) / 0.02), transparent 30%);
		z-index: 0;
	}

	.skip-link {
		position: absolute;
		left: 1rem;
		top: -5rem;
		padding: 0.6rem 0.9rem;
		border-radius: 0.6rem;
		background: rgb(15 23 45);
		color: rgb(var(--rgb-text-bright-dark));
		text-decoration: none;
		z-index: 50;
	}

	.skip-link:focus {
		top: 1rem;
	}

	.inner {
		width: min(1140px, calc(100% - 2.5rem));
		margin-inline: auto;
	}

	.site-header {
		position: sticky;
		top: 0;
		z-index: 40;
		backdrop-filter: blur(16px);
		border-bottom: 1px solid var(--line-soft);
		background: rgb(6 11 20 / 0.74);
	}

	.header-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.92rem 0;
	}

	.brand {
		display: inline-flex;
		align-items: center;
		gap: 0.55rem;
		font-family: "Space Grotesk", "Manrope", sans-serif;
		font-size: 1.05rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: rgb(237 242 255);
		text-decoration: none;
	}

	.brand-dot {
		width: 0.6rem;
		height: 0.6rem;
		border-radius: 999px;
		background: linear-gradient(135deg, rgb(35 198 176), rgb(95 163 255));
		box-shadow: 0 0 20px rgb(82 170 255 / 0.7);
	}

	nav {
		display: flex;
		align-items: center;
		gap: 0.45rem;
	}

	nav a {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 2.1rem;
		padding: 0.25rem 0.82rem;
		font-size: 0.87rem;
		font-weight: 600;
		letter-spacing: 0.03em;
		border-radius: 999px;
		border: 1px solid transparent;
		color: rgb(212 222 239);
		text-decoration: none;
		transition: all 0.2s ease;
	}

	nav a:hover {
		border-color: var(--line-soft);
		background: rgb(var(--rgb-white) / 0.06);
		color: rgb(var(--rgb-white));
	}

	.theme-toggle {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		height: 2.15rem;
		padding: 0 0.82rem;
		border-radius: 999px;
		border: 1px solid rgb(var(--rgb-white) / 0.2);
		background: rgb(var(--rgb-white) / 0.08);
		color: rgb(var(--rgb-text-strong-dark));
		font-size: 0.76rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		cursor: pointer;
		transition: background-color 0.2s ease, transform 0.2s ease;
	}

	nav .theme-toggle {
		margin-left: 0.2rem;
	}

	.theme-toggle:hover {
		background: rgb(var(--rgb-white) / 0.16);
		transform: translateY(-1px);
	}

	.menu-toggle {
		display: none;
		padding: 0;
		border: 0;
		background: transparent;
		cursor: pointer;
		flex-direction: column;
		gap: 0.26rem;
	}

	.menu-toggle span {
		display: block;
		width: 1.5rem;
		height: 2px;
		border-radius: 999px;
		background: rgb(var(--rgb-text-bright-dark));
	}

	.main-stack {
		display: grid;
		gap: 1rem;
		padding: clamp(1.1rem, 2.7vw, 1.8rem) 0 clamp(2.8rem, 6vw, 4.2rem);
		position: relative;
		z-index: 1;
	}

	.panel {
		width: min(1140px, calc(100% - 2.5rem));
		margin-inline: auto;
		border-radius: 1.15rem;
		border: 1px solid var(--line-soft);
		background: linear-gradient(165deg, var(--shell-1), var(--shell-0));
		box-shadow:
			0 24px 40px rgb(var(--rgb-black) / 0.28),
			inset 0 1px 0 rgb(var(--rgb-white) / 0.04);
		padding: clamp(1.2rem, 3.2vw, 2.35rem);
	}

	.hero-panel {
		display: grid;
		grid-template-columns: 1.25fr 0.75fr;
		gap: 1rem;
	}

	.hero-copy {
		display: grid;
		gap: 0.8rem;
		align-content: start;
	}

	.kicker {
		display: inline-flex;
		gap: 0.45rem;
		align-items: center;
		font-size: 0.74rem;
		font-weight: 700;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: rgb(153 172 207);
		margin: 0;
	}

	h1,
	h2,
	h3 {
		margin: 0;
		font-family: "Space Grotesk", "Manrope", sans-serif;
		line-height: 1.05;
		letter-spacing: 0.01em;
	}

	h1 {
		font-size: clamp(2.1rem, 4.6vw, 3.6rem);
		max-width: 18ch;
	}

	h2 {
		font-size: clamp(1.5rem, 3.2vw, 2.4rem);
	}

	h3 {
		font-size: clamp(1.03rem, 1.8vw, 1.22rem);
	}

	.lead {
		margin: 0;
		max-width: 62ch;
		color: var(--copy-muted);
	}

	.hero-actions {
		display: flex;
		align-items: center;
		gap: 0.62rem;
		flex-wrap: wrap;
	}

	.button {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		height: 2.75rem;
		padding: 0 1rem;
		border-radius: 0.72rem;
		font-size: 0.84rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		text-decoration: none;
		transition: transform 0.2s ease, filter 0.2s ease, background-color 0.2s ease;
	}

	.button:hover {
		transform: translateY(-2px);
	}

	.button-primary {
		background: linear-gradient(140deg, rgb(37 186 168), rgb(79 141 255));
		color: rgb(var(--rgb-surface-light));
	}

	.button-ghost {
		border: 1px solid var(--line-strong);
		background: rgb(var(--rgb-white) / 0.04);
		color: rgb(216 227 247);
	}

	.cms-chip {
		height: fit-content;
		display: grid;
		gap: 0.65rem;
		padding: 1rem;
		border-radius: 0.95rem;
		border: 1px solid rgb(var(--rgb-white) / 0.14);
		background: linear-gradient(150deg, rgb(var(--rgb-white) / 0.06), rgb(var(--rgb-white) / 0.02));
	}

	.cms-chip p {
		margin: 0;
		color: rgb(208 220 243);
	}

	.chip-head {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.76rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: rgb(154 178 217);
	}

	.chip-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 0.45rem;
	}

	.chip-grid span {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		height: 1.9rem;
		padding: 0 0.72rem;
		border-radius: 999px;
		background: rgb(var(--rgb-white) / 0.07);
		font-size: 0.77rem;
		color: rgb(215 228 251);
	}

	.news-carousel-shell {
		grid-column: 1 / -1;
		display: grid;
		gap: 0.65rem;
	}

	.news-carousel-controls {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
	}

	.news-carousel-button {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		height: 2rem;
		padding: 0 0.72rem;
		border-radius: 999px;
		border: 1px solid rgb(var(--rgb-white) / 0.16);
		background: rgb(var(--rgb-white) / 0.06);
		color: rgb(233 242 255);
		font-size: 0.74rem;
		font-weight: 700;
		letter-spacing: 0.07em;
		text-transform: uppercase;
		cursor: pointer;
		transition: background-color 0.2s ease, transform 0.2s ease;
	}

	.news-carousel-button:hover {
		background: rgb(var(--rgb-white) / 0.14);
		transform: translateY(-1px);
	}

	.news-carousel-button:disabled {
		opacity: 0.45;
		cursor: not-allowed;
		transform: none;
	}

	.news-carousel {
		border-radius: 0.9rem;
		overflow: hidden;
		touch-action: pan-y;
	}

	.news-carousel:focus-visible {
		outline: 2px solid rgb(var(--rgb-focus-blue));
		outline-offset: 3px;
	}

	.news-track {
		display: grid;
		gap: 0.8rem;
		grid-template-columns: repeat(var(--news-columns, 1), minmax(0, 1fr));
		transform: translateX(var(--news-drag-offset, 0px));
		transition: transform 220ms ease;
		will-change: transform;
	}

	.news-track.dragging {
		transition: none;
	}

	.news-card,
	.mission-card,
	.team-card {
		display: grid;
		align-content: start;
		gap: 0.4rem;
		min-height: 100%;
		border-radius: 0.85rem;
		padding: 0.95rem;
		border: 1px solid rgb(var(--rgb-white) / 0.12);
		background: var(--shell-2);
		transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
	}

	.news-card:hover,
	.mission-card:hover,
	.team-card:hover {
		transform: translateY(-5px);
		border-color: rgb(154 195 255 / 0.45);
		box-shadow: 0 16px 24px rgb(var(--rgb-black) / 0.26);
	}

	.meta {
		margin: 0;
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.13em;
		text-transform: uppercase;
		color: rgb(151 173 211);
	}

	.news-card p,
	.mission-card p,
	.team-card p {
		margin: 0.15rem 0 0;
		color: rgb(196 208 230);
	}

	.news-card-action {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		margin-top: 0.5rem;
		width: fit-content;
		padding: 0.35rem 0.6rem;
		border-radius: 999px;
		border: 0;
		background: rgb(var(--rgb-white) / 0.1);
		color: rgb(248 251 255);
		font-size: 0.76rem;
		font-weight: 700;
		cursor: pointer;
		transition: background-color 0.2s ease;
	}

	.news-card-action:hover {
		background: rgb(var(--rgb-white) / 0.17);
	}

	.mission-panel,
	.team-panel {
		display: grid;
		gap: 0.8rem;
	}

	.mission-grid,
	.team-grid {
		display: grid;
		gap: 0.85rem;
		grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
	}

	.newsletter-panel {
		display: grid;
		grid-template-columns: 1fr minmax(300px, 460px);
		gap: 1rem;
		align-items: end;
	}

	.newsletter-copy {
		display: grid;
		gap: 0.8rem;
	}

	.newsletter-form {
		display: grid;
		gap: 0.55rem;
		padding: 1rem;
		border-radius: 0.95rem;
		border: 1px solid rgb(var(--rgb-white) / 0.13);
		background: rgb(var(--rgb-black) / 0.24);
	}

	.newsletter-form label {
		font-size: 0.81rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: rgb(173 192 225);
	}

	.newsletter-form input {
		height: 2.8rem;
		padding: 0 0.85rem;
		border: 1px solid rgb(var(--rgb-white) / 0.18);
		border-radius: 0.65rem;
		background: rgb(9 14 28 / 0.8);
		color: rgb(238 244 255);
	}

	.newsletter-form button {
		height: 2.8rem;
		padding: 0 1rem;
		border: 0;
		border-radius: 0.65rem;
		background: linear-gradient(140deg, rgb(33 192 172), rgb(95 151 255));
		font-size: 0.78rem;
		font-weight: 800;
		letter-spacing: 0.09em;
		text-transform: uppercase;
		color: rgb(248 253 255);
		cursor: pointer;
		display: inline-flex;
		justify-content: center;
		align-items: center;
		gap: 0.38rem;
		transition: filter 0.2s ease;
	}

	.newsletter-form button:hover {
		filter: brightness(1.07);
	}

	.avatar {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 2rem;
		min-width: 4.6rem;
		width: fit-content;
		padding: 0 0.7rem;
		border-radius: 999px;
		background: rgb(var(--rgb-white) / 0.1);
		font-size: 0.67rem;
		font-weight: 800;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: rgb(217 232 255);
	}

	.site-footer {
		position: relative;
		z-index: 1;
		margin-top: 0.45rem;
		padding: 2.2rem 0 1.25rem;
		border-top: 1px solid var(--line-soft);
		background: rgb(4 9 18 / 0.84);
	}

	.footer-grid {
		display: grid;
		gap: 1rem;
		grid-template-columns: 1.3fr 1fr;
	}

	.footer-grid p {
		margin: 0.4rem 0 0;
		color: rgb(180 194 220);
	}

	.footer-links {
		display: flex;
		justify-content: flex-end;
		gap: 0.55rem;
		flex-wrap: wrap;
	}

	.footer-links a {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		height: 2rem;
		padding: 0 0.72rem;
		border-radius: 999px;
		border: 1px solid rgb(var(--rgb-white) / 0.14);
		background: rgb(var(--rgb-white) / 0.05);
		color: rgb(220 230 250);
		font-size: 0.78rem;
		font-weight: 700;
		text-decoration: none;
	}

	.footer-links a:hover {
		background: rgb(var(--rgb-white) / 0.12);
	}

	.footer-end {
		margin: 1rem 0 0;
		text-align: center;
		color: rgb(142 161 196);
		font-size: 0.8rem;
	}

	.modal-overlay {
		position: fixed;
		inset: 0;
		z-index: 90;
		display: grid;
		place-items: center;
		padding: 1rem;
		background: rgb(2 6 13 / 0.72);
		backdrop-filter: blur(6px);
	}

	.podcast-modal {
		width: min(560px, 100%);
		max-height: min(82vh, 700px);
		overflow-y: auto;
		display: grid;
		gap: 0.8rem;
		padding: 1.1rem;
		border-radius: 1rem;
		border: 1px solid rgb(var(--rgb-white) / 0.18);
		background: linear-gradient(165deg, rgb(21 30 50 / 0.92), rgb(8 13 23 / 0.97));
		box-shadow: 0 24px 40px rgb(var(--rgb-black) / 0.42);
	}

	.podcast-modal-close {
		justify-self: end;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		border-radius: 999px;
		border: 1px solid rgb(var(--rgb-white) / 0.18);
		background: rgb(var(--rgb-white) / 0.07);
		color: rgb(var(--rgb-text-strong-dark));
		cursor: pointer;
	}

	.podcast-modal-close:hover {
		background: rgb(var(--rgb-white) / 0.16);
	}

	.podcast-modal-date {
		margin: 0;
		font-size: 0.76rem;
		font-weight: 700;
		letter-spacing: 0.13em;
		text-transform: uppercase;
		color: rgb(157 180 219);
	}

	.podcast-link-grid {
		display: grid;
		gap: 0.55rem;
		grid-template-columns: repeat(auto-fit, minmax(165px, 1fr));
	}

	.podcast-link-grid a {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		min-height: 2.4rem;
		padding: 0 0.8rem;
		border-radius: 0.68rem;
		border: 1px solid rgb(var(--rgb-white) / 0.18);
		background: rgb(var(--rgb-white) / 0.07);
		color: rgb(239 245 255);
		font-size: 0.8rem;
		font-weight: 700;
		text-decoration: none;
	}

	.podcast-link-grid a:hover {
		background: rgb(var(--rgb-white) / 0.16);
	}

	.podcast-link-main {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		min-width: 0;
	}

	.podcast-link-main span:last-child {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.podcast-link-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		height: 1.5rem;
		border-radius: 999px;
		background: rgb(var(--rgb-white) / 0.11);
	}

	.podcast-link-icon img {
		width: 0.95rem;
		height: 0.95rem;
		display: block;
	}

	.podcast-youtube-embed {
		display: grid;
		justify-items: center;
	}

	.podcast-youtube-embed iframe {
		width: min(100%, 740px);
		aspect-ratio: 16 / 9;
		border: 1px solid rgb(var(--rgb-white) / 0.16);
		border-radius: 0.75rem;
		background: rgb(2 4 9);
	}

	.podcast-empty {
		margin: 0;
		color: rgb(197 209 232);
	}

	:global(html:not(.dark)) .page-shell {
		--shell-0: rgb(var(--rgb-surface-light));
		--shell-1: rgb(251 254 255);
		--shell-2: rgb(236 245 255);
		--line-soft: rgb(var(--rgb-slate-900) / 0.12);
		--line-strong: rgb(var(--rgb-slate-900) / 0.22);
		--copy-muted: rgb(66 84 111);
	}

	:global(html:not(.dark)) .ambient {
		background:
			radial-gradient(circle at 10% 8%, rgb(var(--rgb-accent-blue-soft) / 0.18), transparent 32%),
			radial-gradient(circle at 86% 14%, rgb(var(--rgb-accent-teal-soft) / 0.14), transparent 34%),
			linear-gradient(180deg, rgb(17 24 39 / 0.015), transparent 32%);
	}

	:global(html:not(.dark)) .skip-link {
		background: rgb(var(--rgb-text-strong-dark));
		color: rgb(16 32 58);
	}

	:global(html:not(.dark)) .site-header {
		background: rgb(var(--rgb-white) / 0.88);
	}

	:global(html:not(.dark)) .brand {
		color: rgb(18 37 63);
	}

	:global(html:not(.dark)) nav a {
		color: rgb(42 64 97);
	}

	:global(html:not(.dark)) nav a:hover {
		color: rgb(15 31 55);
		background: rgb(16 32 58 / 0.08);
	}

	:global(html:not(.dark)) .theme-toggle {
		border-color: rgb(var(--rgb-slate-900) / 0.18);
		background: rgb(25 54 102 / 0.08);
		color: rgb(17 37 64);
	}

	:global(html:not(.dark)) .theme-toggle:hover {
		background: rgb(25 54 102 / 0.14);
	}

	:global(html:not(.dark)) .menu-toggle span {
		background: rgb(var(--rgb-slate-850));
	}

	:global(html:not(.dark)) .panel {
		box-shadow:
			0 20px 32px rgb(var(--rgb-slate-900) / 0.08),
			inset 0 1px 0 rgb(var(--rgb-white) / 0.8);
	}

	:global(html:not(.dark)) .kicker {
		color: rgb(83 105 139);
	}

	:global(html:not(.dark)) .button-ghost {
		background: rgb(var(--rgb-white) / 0.66);
		color: rgb(22 49 83);
	}

	:global(html:not(.dark)) .cms-chip {
		border-color: rgb(var(--rgb-slate-900) / 0.14);
		background: linear-gradient(150deg, rgb(var(--rgb-white) / 0.85), rgb(238 246 255 / 0.62));
	}

	:global(html:not(.dark)) .cms-chip p {
		color: rgb(54 76 109);
	}

	:global(html:not(.dark)) .chip-head {
		color: rgb(77 99 133);
	}

	:global(html:not(.dark)) .chip-grid span {
		background: rgb(var(--rgb-slate-850) / 0.08);
		color: rgb(35 64 102);
	}

	:global(html:not(.dark)) .news-carousel-button {
		border-color: rgb(var(--rgb-slate-900) / 0.16);
		background: rgb(var(--rgb-slate-850) / 0.08);
		color: rgb(23 50 82);
	}

	:global(html:not(.dark)) .news-carousel-button:hover {
		background: rgb(var(--rgb-slate-850) / 0.14);
	}

	:global(html:not(.dark)) .news-card,
	:global(html:not(.dark)) .mission-card,
	:global(html:not(.dark)) .team-card {
		border-color: rgb(var(--rgb-slate-900) / 0.12);
	}

	:global(html:not(.dark)) .news-card:hover,
	:global(html:not(.dark)) .mission-card:hover,
	:global(html:not(.dark)) .team-card:hover {
		border-color: rgb(54 116 207 / 0.36);
		box-shadow: 0 14px 22px rgb(20 38 63 / 0.12);
	}

	:global(html:not(.dark)) .meta {
		color: rgb(79 106 144);
	}

	:global(html:not(.dark)) .news-card p,
	:global(html:not(.dark)) .mission-card p,
	:global(html:not(.dark)) .team-card p {
		color: rgb(64 84 114);
	}

	:global(html:not(.dark)) .news-card-action {
		background: rgb(var(--rgb-blue-700) / 0.12);
		color: rgb(23 49 82);
	}

	:global(html:not(.dark)) .news-card-action:hover {
		background: rgb(var(--rgb-blue-700) / 0.2);
	}

	:global(html:not(.dark)) .newsletter-form {
		border-color: rgb(var(--rgb-slate-900) / 0.14);
		background: rgb(var(--rgb-white) / 0.72);
	}

	:global(html:not(.dark)) .newsletter-form label {
		color: rgb(77 101 136);
	}

	:global(html:not(.dark)) .newsletter-form input {
		border-color: rgb(var(--rgb-slate-900) / 0.2);
		background: rgb(var(--rgb-white) / 0.9);
		color: rgb(21 47 80);
	}

	:global(html:not(.dark)) .avatar {
		background: rgb(var(--rgb-blue-700) / 0.12);
		color: rgb(29 58 97);
	}

	:global(html:not(.dark)) .site-footer {
		background: rgb(247 251 255 / 0.9);
	}

	:global(html:not(.dark)) .footer-grid p {
		color: rgb(69 90 121);
	}

	:global(html:not(.dark)) .footer-links a {
		border-color: rgb(var(--rgb-slate-900) / 0.16);
		background: rgb(var(--rgb-slate-850) / 0.08);
		color: rgb(28 58 98);
	}

	:global(html:not(.dark)) .footer-links a:hover {
		background: rgb(var(--rgb-slate-850) / 0.14);
	}

	:global(html:not(.dark)) .footer-end {
		color: rgb(91 115 151);
	}

	:global(html:not(.dark)) .podcast-modal {
		border-color: rgb(var(--rgb-slate-900) / 0.16);
		background: linear-gradient(165deg, rgb(251 254 255 / 0.98), rgb(236 245 255 / 0.96));
		box-shadow: 0 22px 38px rgb(13 26 46 / 0.22);
	}

	:global(html:not(.dark)) .podcast-modal h2 {
		color: rgb(18 40 68);
	}

	:global(html:not(.dark)) .podcast-modal-close {
		border-color: rgb(var(--rgb-slate-900) / 0.18);
		background: rgb(var(--rgb-slate-850) / 0.08);
		color: rgb(19 43 74);
	}

	:global(html:not(.dark)) .podcast-modal-close:hover {
		background: rgb(var(--rgb-slate-850) / 0.14);
	}

	:global(html:not(.dark)) .podcast-modal-date {
		color: rgb(79 102 136);
	}

	:global(html:not(.dark)) .podcast-link-grid a {
		border-color: rgb(var(--rgb-slate-900) / 0.18);
		background: rgb(var(--rgb-white) / 0.88);
		color: rgb(24 54 89);
	}

	:global(html:not(.dark)) .podcast-link-grid a:hover {
		background: rgb(220 235 255 / 0.82);
	}

	:global(html:not(.dark)) .podcast-link-icon {
		background: rgb(var(--rgb-blue-700) / 0.12);
	}

	:global(html:not(.dark)) .podcast-empty {
		color: rgb(75 97 130);
	}

	.reveal {
		opacity: 0;
		transform: translateY(22px) scale(0.99);
		animation: reveal-up 720ms cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
		animation-delay: var(--delay, 0ms);
	}

	@keyframes reveal-up {
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	@media (max-width: 980px) {
		.hero-panel,
		.newsletter-panel,
		.footer-grid {
			grid-template-columns: 1fr;
		}

		.footer-links {
			justify-content: flex-start;
		}
	}

		@media (max-width: 860px) {
			.menu-toggle {
				display: flex;
			}

		nav {
			display: none;
			position: absolute;
			top: calc(100% + 0.62rem);
			left: 1.25rem;
			right: 1.25rem;
			padding: 0.65rem;
			gap: 0.3rem;
			border-radius: 0.72rem;
			border: 1px solid var(--line-soft);
			background: rgb(7 11 20 / 0.95);
			box-shadow: 0 16px 24px rgb(var(--rgb-black) / 0.34);
			flex-direction: column;
			align-items: stretch;
		}

		nav.open {
			display: flex;
		}

			nav a {
				justify-content: flex-start;
				height: 2.3rem;
			}

			nav .theme-toggle {
				justify-content: flex-start;
				height: 2.3rem;
				margin-left: 0;
			}

			:global(html:not(.dark)) nav {
				background: rgb(var(--rgb-white) / 0.95);
				box-shadow: 0 16px 24px rgb(30 46 71 / 0.14);
			}
		}

	@media (max-width: 640px) {
		.inner,
		.panel {
			width: calc(100% - 1.4rem);
		}

		.main-stack {
			gap: 0.8rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		* {
			animation: none !important;
			transition: none !important;
			scroll-behavior: auto !important;
		}
	}
</style>
