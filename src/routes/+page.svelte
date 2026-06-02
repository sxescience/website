<script lang="ts">
	import { onMount, tick } from "svelte";
	import {
		ArrowRight,
		BookOpen,
		ChevronDown,
		ExternalLink,
		Mail,
		Menu,
		Moon,
		Podcast,
		Rocket,
		Sparkles,
		Sun,
		Users,
		X
	} from "lucide-svelte";
	import type { FaqItem, LanguageCode, LocalizedString, NewsItem } from "$lib/cms/types";
	import type { PageData } from "./$types";

	const LANGUAGE_STORAGE_KEY = "sxe-language";
	const THEME_STORAGE_KEY = "sxe-theme";
	const SECTION_IDS = ["about", "faq", "podcast", "resources", "team", "contact"];

	type ThemeMode = "dark" | "light";

	let { data } = $props<{ data: PageData }>();

	let language = $state<LanguageCode>("de");
	let themeMode = $state<ThemeMode>("dark");
	let isMobileMenuOpen = $state(false);
	let activeSectionId = $state("about");
	let openFaqId = $state<string | null>(null);
	let contactSubmitted = $state(false);

	const content = $derived(data.content);
	const landing = $derived(content.landing);
	const latestEpisode = $derived(content.news[0]);

	onMount(() => {
		language = getStoredLanguage();
		themeMode = getCurrentThemeMode();
		document.documentElement.lang = language;

		const observer = new IntersectionObserver(
			(entries) => {
				const visibleEntry = entries
					.filter((entry) => entry.isIntersecting)
					.sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

				if (visibleEntry?.target.id) {
					activeSectionId = visibleEntry.target.id;
				}
			},
			{
				rootMargin: "-35% 0px -55% 0px",
				threshold: [0.12, 0.28, 0.48]
			}
		);

		for (const id of SECTION_IDS) {
			const section = document.getElementById(id);
			if (section) {
				observer.observe(section);
			}
		}

		const openFaqFromHash = () => {
			const hash = window.location.hash.replace("#faq-", "");
			if (hash && landing.faq.items.some((item: FaqItem) => item.id === hash)) {
				openFaqId = hash;
				requestAnimationFrame(() => scrollToElementWithHeaderOffset(`faq-${hash}`));
			}
		};

		openFaqFromHash();
		window.addEventListener("hashchange", openFaqFromHash);

		return () => {
			observer.disconnect();
			window.removeEventListener("hashchange", openFaqFromHash);
		};
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

	function setLanguage(nextLanguage: LanguageCode) {
		language = nextLanguage;
		closeMenu();
	}

	function toggleMenu() {
		isMobileMenuOpen = !isMobileMenuOpen;
	}

	function closeMenu() {
		isMobileMenuOpen = false;
	}

	function toggleThemeMode() {
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

	function formatNewsDate(value: string): string {
		const parsed = Date.parse(value);
		if (!Number.isFinite(parsed)) {
			return value;
		}
		return new Date(parsed).toLocaleDateString(language === "de" ? "de-DE" : "en-GB", {
			day: "2-digit",
			month: "short",
			year: "numeric"
		});
	}

	async function toggleFaq(itemId: string) {
		const nextOpenFaqId = openFaqId === itemId ? null : itemId;
		openFaqId = nextOpenFaqId;

		if (!nextOpenFaqId || typeof window === "undefined") {
			return;
		}

		window.history.replaceState(null, "", `#faq-${nextOpenFaqId}`);
		await tick();
		scrollToElementWithHeaderOffset(`faq-${nextOpenFaqId}`);
	}

	function scrollToElementWithHeaderOffset(elementId: string) {
		const element = document.getElementById(elementId);
		const header = document.querySelector(".site-header");
		if (!element) {
			return;
		}

		const headerHeight = header instanceof HTMLElement ? header.offsetHeight : 0;
		const top = element.getBoundingClientRect().top + window.scrollY - headerHeight - 18;
		window.scrollTo({ top, behavior: "smooth" });
	}

	function handleContactSubmit(event: SubmitEvent) {
		event.preventDefault();
		contactSubmitted = true;
		// TODO: Echten Formularversand anbinden.
	}

	function podcastLinkForEpisode(item: NewsItem | undefined): string {
		return item?.podcastLinks[0]?.url ?? landing.podcast.href;
	}

	function resourceLogoUrl(url: string): string {
		try {
			const hostname = new URL(url).hostname.replace(/^www\./, "");
			return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=96`;
		} catch {
			return "/assets/sxe-logo-science-transparent.png";
		}
	}

	function faqItemsForGroup(itemIds: string[]): FaqItem[] {
		return itemIds
			.map((itemId) => landing.faq.items.find((item: FaqItem) => item.id === itemId))
			.filter((item): item is FaqItem => Boolean(item));
	}

	function faqItemNumber(itemId: string): string {
		const index = landing.faq.items.findIndex((item: FaqItem) => item.id === itemId);
		return String(index + 1).padStart(2, "0");
	}

	function isExternalUrl(url: string): boolean {
		return /^https?:\/\//.test(url);
	}
</script>

<svelte:head>
	<title>{t(landing.meta.title)}</title>
	<meta name="description" content={t(landing.meta.description)} />
	<meta property="og:title" content={t(landing.meta.title)} />
	<meta property="og:description" content={t(landing.meta.description)} />
	<meta property="og:type" content="website" />
	<meta property="og:image" content={landing.meta.ogImage} />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="page-shell">
	<a class="skip-link" href="#about">{t(landing.skipLinkLabel)}</a>
	<div class="ambient" aria-hidden="true"></div>

	<header class="site-header">
		<div class="inner header-row">
			<a class="brand" href="#top" onclick={closeMenu} aria-label="SxE">
				<img
					class="brand-logo"
					src="/assets/sxe-logo-science-transparent.png"
					alt="Science x Entrepreneurship"
					decoding="async"
				/>
				<span class="brand-subtitle">{landing.brandSubtitle}</span>
			</a>

			<button
				type="button"
				class="menu-toggle"
				onclick={toggleMenu}
				aria-expanded={isMobileMenuOpen}
				aria-controls="site-nav"
				aria-label="Navigation umschalten"
			>
				{#if isMobileMenuOpen}
					<X size={22} />
				{:else}
					<Menu size={22} />
				{/if}
			</button>

			<nav id="site-nav" class:open={isMobileMenuOpen} aria-label="Hauptnavigation">
				{#each landing.nav as item (item.id)}
					<a
						href={`#${item.id}`}
						class:active={activeSectionId === item.id}
						onclick={closeMenu}
						aria-current={activeSectionId === item.id ? "page" : undefined}
					>
						{t(item.label)}
					</a>
				{/each}
				<div class="header-controls">
					<div class="language-toggle" aria-label={t(landing.languageToggleLabel)}>
						<button
							type="button"
							class:active={language === "de"}
							onclick={() => setLanguage("de")}
							aria-pressed={language === "de"}
						>
							DE
						</button>
						<button
							type="button"
							class:active={language === "en"}
							onclick={() => setLanguage("en")}
							aria-pressed={language === "en"}
						>
							EN
						</button>
					</div>
					<button
						type="button"
						class="theme-toggle"
						class:light={themeMode === "light"}
						onclick={() => {
							toggleThemeMode();
							closeMenu();
						}}
						aria-label={t(landing.themeToggleAriaLabel)}
						aria-pressed={themeMode === "light"}
					>
						<span class="theme-toggle-icon" aria-hidden="true">
							<Sun size={14} strokeWidth={2.4} />
						</span>
						<span class="theme-toggle-icon" aria-hidden="true">
							<Moon size={14} strokeWidth={2.4} />
						</span>
						<span class="theme-toggle-thumb" aria-hidden="true"></span>
					</button>
				</div>
			</nav>
		</div>
	</header>

	<main class="main-stack">
		<section id="top" class="panel hero-panel reveal" aria-labelledby="hero-title">
			<div class="hero-copy">
				<p class="kicker"><Sparkles size={14} strokeWidth={2.2} /> {t(landing.hero.kicker)}</p>
				<h1 id="hero-title" class:de-title={language === "de"}>{t(landing.hero.title)}</h1>
				<p class="lead">{t(landing.hero.lead)}</p>
				<div class="hero-actions">
					<a href={landing.hero.primaryHref} class="button button-primary"
						>{t(landing.hero.primaryLabel)} <ArrowRight size={16} /></a
					>
					<a href={landing.hero.secondaryHref} class="button button-ghost"
						>{t(landing.hero.secondaryLabel)}</a
					>
				</div>
			</div>

			<aside class="hero-visual" aria-label="SxE">
				<img
					class="hero-cover"
					src={landing.podcast.fallbackThumbnail}
					alt="Podcast-Cover Forschung mit Folgen, Episode 03 mit Nicholas Turley"
					decoding="async"
					fetchpriority="high"
				/>
			</aside>
		</section>

		<section id="about" class="panel section-panel reveal" aria-labelledby="about-title">
			<div class="section-head">
				<p class="kicker"><Users size={14} strokeWidth={2.2} /> {t(landing.about.kicker)}</p>
				<h2 id="about-title">{t(landing.about.title)}</h2>
				<div class="lead rich-text">
					{#each t(landing.about.body).split("\n\n") as paragraph}
						<p>{paragraph}</p>
					{/each}
				</div>
			</div>
			<div class="card-grid three">
				{#each landing.about.features as feature (t(feature.title))}
					<article class="content-card">
						<span class="card-icon" aria-hidden="true">{feature.icon}</span>
						<h3>{t(feature.title)}</h3>
						<p>{t(feature.text)}</p>
					</article>
				{/each}
			</div>
		</section>

		<section class="panel section-panel reveal" aria-labelledby="infographics-title">
			<div class="section-head">
				<p class="kicker"><BookOpen size={14} strokeWidth={2.2} /> {t(landing.infographics.kicker)}</p>
				<h2 id="infographics-title">{t(landing.infographics.title)}</h2>
			</div>
			<div class="infographic-grid">
				{#each landing.infographics.items as item (item.src)}
					<article class="infographic-card">
						<div>
							<h3>{t(item.title)}</h3>
							<p>{t(item.teaser)}</p>
							<p class="meta">{item.credit}</p>
						</div>
						<img src={item.src} alt={t(item.alt)} loading="lazy" decoding="async" />
					</article>
				{/each}
			</div>
		</section>

		<section id="faq" class="panel section-panel reveal" aria-labelledby="faq-title">
			<div class="section-head">
				<p class="kicker"><Sparkles size={14} strokeWidth={2.2} /> {t(landing.faq.kicker)}</p>
				<h2 id="faq-title">{t(landing.faq.title)}</h2>
				<p class="lead">{t(landing.faq.intro)}</p>
			</div>
			<div class="faq-list">
				{#each landing.faq.groups as group (t(group.title))}
					<section class="faq-group" aria-labelledby={`faq-group-${group.itemIds[0]}`}>
						<h3 id={`faq-group-${group.itemIds[0]}`} class="faq-group-title">{t(group.title)}</h3>
						{#each faqItemsForGroup(group.itemIds) as item (item.id)}
							<article id={`faq-${item.id}`} class="faq-item" class:open={openFaqId === item.id}>
								<h4>
									<button
										type="button"
										aria-expanded={openFaqId === item.id}
										aria-controls={`faq-panel-${item.id}`}
										onclick={() => toggleFaq(item.id)}
									>
										<span>{faqItemNumber(item.id)}</span>
										{t(item.question)}
										<span class="faq-chevron" aria-hidden="true">
											<ChevronDown size={18} />
										</span>
									</button>
								</h4>
								<div id={`faq-panel-${item.id}`} class="faq-answer" hidden={openFaqId !== item.id}>
									<p>{t(item.answer)}</p>
									{#if item.links?.length}
										<div class="faq-link-block">
											<strong>{language === "de" ? "Weiterführende Links" : "Further links"}</strong>
											<ul>
												{#each item.links as link (`${item.id}-${link.url}`)}
													<li>
														<a
															href={link.url}
															target={isExternalUrl(link.url) ? "_blank" : undefined}
															rel={isExternalUrl(link.url) ? "noopener noreferrer" : undefined}
														>
															{t(link.label)}
															{#if isExternalUrl(link.url)}
																<ExternalLink size={13} />
															{/if}
														</a>
													</li>
												{/each}
											</ul>
										</div>
									{/if}
								</div>
							</article>
						{/each}
					</section>
				{/each}
			</div>
		</section>

		<section id="podcast" class="panel podcast-panel reveal" aria-labelledby="podcast-title">
			<div class="podcast-copy">
				<p class="kicker"><Podcast size={14} strokeWidth={2.2} /> {t(landing.podcast.kicker)}</p>
				<h2 id="podcast-title">{t(landing.podcast.title)}</h2>
				<p class="lead">{t(landing.podcast.lead)}</p>
				<a class="button button-primary" href={landing.podcast.href}
					>{t(landing.podcast.ctaLabel)} <ArrowRight size={16} /></a
				>
			</div>
			<article class="latest-episode-card">
				<img
					src={landing.podcast.fallbackThumbnail}
					alt="Forschung mit Folgen"
					loading="lazy"
					decoding="async"
				/>
				<div>
					<p class="meta">
						{#if latestEpisode}{formatNewsDate(latestEpisode.date)}{:else}Podcast{/if}
					</p>
					<h3>{latestEpisode?.title ?? landing.podcast.title}</h3>
					<p>
						{latestEpisode?.excerpt ??
							(language === "de" ? "Neue Folgen erscheinen hier." : "New episodes will appear here.")}
					</p>
					<a href={podcastLinkForEpisode(latestEpisode)} target="_blank" rel="noopener noreferrer">
						{language === "de" ? "Aktuelle Folge öffnen" : "Open latest episode"}
						<ExternalLink size={14} />
					</a>
				</div>
				<!-- TODO: RSS-Feed-URL einfügen und latest episode serverseitig mappen. -->
			</article>
		</section>

		<section id="resources" class="panel section-panel reveal" aria-labelledby="resources-title">
			<div class="section-head">
				<p class="kicker"><Rocket size={14} strokeWidth={2.2} /> {t(landing.resources.kicker)}</p>
				<h2 id="resources-title">{t(landing.resources.title)}</h2>
			</div>
			<div class="resource-category-grid">
				{#each landing.resources.categories as category (t(category.title))}
					<section class="resource-category" aria-labelledby={`resource-${t(category.title)}`}>
						<h3 id={`resource-${t(category.title)}`}>{t(category.title)}</h3>
						<div class="resource-grid">
							{#each category.items as item (item.name)}
								<a class="resource-card" href={item.url} target="_blank" rel="noopener noreferrer">
									<span class="resource-card-head">
										<span class="resource-logo" aria-hidden="true">
											<img src={resourceLogoUrl(item.url)} alt="" loading="lazy" decoding="async" />
										</span>
										<strong>{item.name}</strong>
									</span>
									<span>{t(item.description)}</span>
									<span class="resource-external" aria-hidden="true">
										<ExternalLink size={14} />
									</span>
								</a>
							{/each}
						</div>
					</section>
				{/each}
			</div>
		</section>

		<section id="team" class="panel section-panel reveal" aria-labelledby="team-title">
			<div class="section-head">
				<p class="kicker"><Users size={14} strokeWidth={2.2} /> {t(landing.team.kicker)}</p>
				<h2 id="team-title">{t(landing.team.title)}</h2>
				<p class="lead">{t(landing.team.lead)}</p>
			</div>
			<div class="card-grid three">
				{#each landing.team.items as item (t(item.title))}
					<article class="content-card">
						<span class="card-icon" aria-hidden="true">{item.icon}</span>
						<h3>{t(item.title)}</h3>
						<p>{t(item.text)}</p>
					</article>
				{/each}
			</div>
		</section>

		<section id="contact" class="panel contact-panel reveal" aria-labelledby="contact-title">
			<div class="contact-copy">
				<p class="kicker"><Mail size={14} strokeWidth={2.2} /> {t(landing.contact.kicker)}</p>
				<h2 id="contact-title">{t(landing.contact.title)}</h2>
				<p class="lead">{t(landing.contact.lead)}</p>
				<a href={landing.contact.emailHref}>{landing.contact.emailLabelText}</a>
				<form class="newsletter-form" onsubmit={handleContactSubmit}>
					<h3>{t(landing.contact.newsletterTitle)}</h3>
					<p>{t(landing.contact.newsletterLead)}</p>
					<label for="newsletter-email">{t(landing.contact.newsletterEmailLabel)}</label>
					<div class="newsletter-row">
						<input
							id="newsletter-email"
							name="newsletter-email"
							type="email"
							autocomplete="email"
							placeholder={t(landing.contact.newsletterEmailPlaceholder)}
							required
						/>
						<button type="submit">{t(landing.contact.newsletterSubmitLabel)}</button>
					</div>
				</form>
			</div>

			<form class="contact-form" onsubmit={handleContactSubmit}>
				<label for="contact-name">{t(landing.contact.nameLabel)}</label>
				<input id="contact-name" name="name" autocomplete="name" required />

				<label for="contact-email">{t(landing.contact.emailLabel)}</label>
				<input id="contact-email" name="email" type="email" autocomplete="email" required />

				<label for="contact-message">{t(landing.contact.messageLabel)}</label>
				<textarea id="contact-message" name="message" rows="5" required></textarea>

				<button type="submit">{t(landing.contact.submitLabel)} <ArrowRight size={14} /></button>
				{#if contactSubmitted}
					<p class="form-note" role="status">{t(landing.contact.successMessage)}</p>
				{/if}
			</form>
		</section>
	</main>

	<footer class="site-footer reveal">
		<div class="inner footer-grid">
			<div>
				<img
					class="footer-logo"
					src="/assets/sxe-logo-science-transparent.png"
					alt="Science x Entrepreneurship"
					loading="lazy"
					decoding="async"
				/>
				<p>{t(landing.footer.description)}</p>
			</div>
			<div class="footer-links">
				<a href="/impressum">{t(landing.footer.imprintLabel)}</a>
				<a href="/impressum#datenschutz">{t(landing.footer.privacyLabel)}</a>
				<div class="language-toggle footer-language" aria-label={t(landing.languageToggleLabel)}>
					<button
						type="button"
						class:active={language === "de"}
						onclick={() => setLanguage("de")}
						aria-pressed={language === "de"}
					>
						DE
					</button>
					<button
						type="button"
						class:active={language === "en"}
						onclick={() => setLanguage("en")}
						aria-pressed={language === "en"}
					>
						EN
					</button>
				</div>
				{#each landing.contact.socialLinks as link (link.label)}
					{#if link.url === "#"}
						<!-- TODO: Link einfügen -->
					{/if}
					<a href={link.url} target="_blank" rel="noopener noreferrer">{link.label}</a>
				{/each}
			</div>
		</div>
		<p class="footer-end">© {new Date().getFullYear()} {landing.footer.copyright}</p>
	</footer>
</div>

<style>
	:global(html) {
		scroll-behavior: smooth;
	}

	:global(body) {
		margin: 0;
		font-family: "Manrope", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
	}

	:global(a:focus-visible),
	:global(button:focus-visible),
	:global(input:focus-visible),
	:global(textarea:focus-visible) {
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
		overflow-x: clip;
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
		background: rgb(6 11 20 / 0.82);
	}

	.header-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.72rem 0;
	}

	.brand {
		display: inline-flex;
		align-items: center;
		gap: 0.72rem;
		min-width: 0;
		text-decoration: none;
	}

	.brand-logo {
		display: block;
		width: auto;
		height: clamp(2.8rem, 4.8vw, 4rem);
		max-width: min(12rem, 34vw);
		object-fit: contain;
		object-position: left center;
	}

	.brand-subtitle {
		color: rgb(var(--rgb-text-soft-dark));
		font-size: 0.72rem;
		font-weight: 800;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		white-space: nowrap;
	}

	nav,
	.header-controls,
	.language-toggle {
		display: flex;
		align-items: center;
	}

	nav {
		gap: 0.35rem;
	}

	nav a,
	.footer-links a {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 2.1rem;
		padding: 0.25rem 0.72rem;
		border: 1px solid transparent;
		border-radius: 999px;
		color: rgb(209 220 241);
		font-size: 0.84rem;
		font-weight: 700;
		text-decoration: none;
		transition: all 0.2s ease;
	}

	nav a:hover,
	nav a.active,
	.footer-links a:hover {
		border-color: var(--line-soft);
		background: rgb(var(--rgb-white) / 0.08);
		color: rgb(var(--rgb-white));
	}

	.header-controls {
		gap: 0.4rem;
		margin-left: 0.2rem;
	}

	.language-toggle {
		padding: 0.16rem;
		border: 1px solid rgb(var(--rgb-white) / 0.16);
		border-radius: 999px;
		background: rgb(var(--rgb-white) / 0.08);
	}

	.language-toggle button {
		min-width: 2rem;
		height: 1.75rem;
		border: 0;
		border-radius: 999px;
		background: transparent;
		color: rgb(var(--rgb-text-soft-dark));
		font-size: 0.72rem;
		font-weight: 800;
		cursor: pointer;
	}

	.language-toggle button.active {
		background: rgb(var(--rgb-brand-blue));
		color: rgb(24 23 18);
	}

	.theme-toggle {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: space-between;
		width: 3.85rem;
		height: 2.1rem;
		padding: 0 0.42rem;
		border-radius: 999px;
		border: 1px solid rgb(var(--rgb-white) / 0.2);
		background: rgb(var(--rgb-white) / 0.08);
		color: rgb(var(--rgb-text-strong-dark));
		cursor: pointer;
		transition: background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
	}

	.theme-toggle:hover {
		background: rgb(var(--rgb-white) / 0.16);
		transform: translateY(-1px);
	}

	.theme-toggle-icon {
		position: relative;
		z-index: 2;
		display: grid;
		width: 1.2rem;
		height: 1.2rem;
		place-items: center;
		color: rgb(var(--rgb-text-soft-dark));
		transition: color 0.2s ease;
	}

	.theme-toggle:not(.light) .theme-toggle-icon:last-of-type,
	.theme-toggle.light .theme-toggle-icon:first-of-type {
		color: rgb(255 246 231);
	}

	.theme-toggle-thumb {
		position: absolute;
		z-index: 1;
		top: 0.22rem;
		left: 0.22rem;
		width: 1.62rem;
		height: 1.62rem;
		border-radius: 999px;
		background: rgb(var(--rgb-brand-blue));
		box-shadow: 0 5px 12px rgb(var(--rgb-black) / 0.24);
		transform: translateX(1.72rem);
		transition: transform 0.22s ease, background-color 0.2s ease;
	}

	.theme-toggle.light .theme-toggle-thumb {
		transform: translateX(0);
		background: rgb(var(--rgb-warning-amber));
	}

	.menu-toggle {
		display: none;
		width: 2.35rem;
		height: 2.35rem;
		place-items: center;
		border: 1px solid var(--line-soft);
		border-radius: 999px;
		background: rgb(var(--rgb-white) / 0.08);
		color: rgb(var(--rgb-text-strong-dark));
		cursor: pointer;
	}

	.main-stack {
		position: relative;
		z-index: 1;
		display: grid;
		gap: 1rem;
		width: min(1140px, calc(100% - 2.5rem));
		margin: 1rem auto 0;
	}

	.panel {
		width: 100%;
		border: 1px solid var(--line-soft);
		border-radius: 0.9rem;
		background:
			linear-gradient(150deg, rgb(var(--rgb-white) / 0.09), rgb(var(--rgb-white) / 0.035)),
			var(--shell-1);
		box-shadow:
			0 24px 50px rgb(var(--rgb-black) / 0.24),
			inset 0 1px 0 rgb(var(--rgb-white) / 0.1);
	}

	.hero-panel,
	.podcast-panel,
	.contact-panel {
		display: grid;
		grid-template-columns: minmax(0, 1.12fr) minmax(280px, 0.88fr);
		gap: clamp(1rem, 3vw, 2rem);
		align-items: center;
		padding: clamp(1.15rem, 4vw, 3rem);
	}

	.section-panel {
		display: grid;
		gap: 1.15rem;
		padding: clamp(1.1rem, 3vw, 2rem);
	}

	.hero-copy,
	.section-head,
	.podcast-copy,
	.contact-copy {
		display: grid;
		gap: 0.75rem;
	}

	.kicker {
		display: inline-flex;
		align-items: center;
		gap: 0.42rem;
		width: fit-content;
		margin: 0;
		border-radius: 999px;
		color: rgb(255 205 130);
		font-size: 0.78rem;
		font-weight: 800;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	h1,
	h2,
	h3,
	h4,
	p {
		margin: 0;
	}

	h1,
	h2,
	h3,
	h4 {
		font-family: "Space Grotesk", "Manrope", sans-serif;
		color: rgb(var(--rgb-text-bright-dark));
		letter-spacing: 0;
	}

	h1 {
		max-width: 12ch;
		font-size: clamp(2.35rem, 7vw, 5.25rem);
		line-height: 0.96;
	}

	h1.de-title {
		max-width: 14ch;
		font-size: clamp(2rem, 5.8vw, 4.3rem);
		line-height: 1;
	}

	h2 {
		font-size: clamp(1.65rem, 3vw, 2.75rem);
		line-height: 1.05;
	}

	h3 {
		font-size: 1.05rem;
		line-height: 1.2;
	}

	h4 {
		font-size: 1rem;
		line-height: 1.2;
	}

	.lead,
	.content-card p,
	.infographic-card p,
	.latest-episode-card p,
	.resource-card span,
	.footer-grid p,
	.contact-copy a,
	.faq-answer p {
		color: var(--copy-muted);
	}

	.lead {
		max-width: 66ch;
		font-size: clamp(1rem, 1.5vw, 1.15rem);
	}

	.rich-text {
		display: grid;
		gap: 0.7rem;
	}

	.hero-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.7rem;
		margin-top: 0.25rem;
	}

	.button,
	.newsletter-form button,
	.contact-form button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.45rem;
		min-height: 2.75rem;
		padding: 0.7rem 1rem;
		border-radius: 999px;
		font-weight: 800;
		text-decoration: none;
		cursor: pointer;
		transition: transform 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
	}

	.button:hover,
	.newsletter-form button:hover,
	.contact-form button:hover {
		transform: translateY(-1px);
	}

	.button-primary,
	.newsletter-form button,
	.contact-form button {
		border: 1px solid rgb(var(--rgb-brand-blue) / 0.55);
		background: rgb(var(--rgb-brand-blue));
		color: rgb(22 22 18);
	}

	.button-ghost {
		border: 1px solid var(--line-soft);
		background: rgb(var(--rgb-white) / 0.06);
		color: rgb(var(--rgb-text-bright-dark));
	}

	.hero-visual {
		display: grid;
	}

	.hero-cover {
		display: block;
		width: min(100%, 28rem);
		justify-self: center;
		aspect-ratio: 1;
		border-radius: 0.85rem;
		border: 1px solid var(--line-soft);
		object-fit: cover;
		box-shadow: 0 24px 38px rgb(var(--rgb-black) / 0.24);
	}

	.card-grid,
	.resource-grid {
		display: grid;
		gap: 0.85rem;
	}

	.content-card,
	.infographic-card,
	.latest-episode-card,
	.resource-card,
	.faq-item,
	.contact-form {
		border: 1px solid rgb(var(--rgb-white) / 0.12);
		border-radius: 0.85rem;
		background: var(--shell-2);
	}

	.card-grid.three {
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}

	.content-card {
		display: grid;
		gap: 0.45rem;
		padding: 1rem;
		transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
	}

	.content-card:hover,
	.resource-card:hover {
		transform: translateY(-4px);
		border-color: rgb(var(--rgb-brand-blue) / 0.45);
		box-shadow: 0 16px 24px rgb(var(--rgb-black) / 0.22);
	}

	.card-icon {
		font-size: 1.55rem;
	}

	.infographic-grid,
	.resource-category-grid {
		display: grid;
		gap: 1rem;
	}

	.infographic-card {
		display: grid;
		grid-template-columns: minmax(220px, 0.7fr) minmax(0, 1.3fr);
		gap: 1rem;
		align-items: center;
		padding: 1rem;
	}

	.infographic-card div {
		display: grid;
		gap: 0.45rem;
	}

	.infographic-card img,
	.latest-episode-card img {
		display: block;
		width: 100%;
		border-radius: 0.65rem;
		background: rgb(var(--rgb-white) / 0.9);
	}

	.infographic-card img {
		max-height: 27rem;
		object-fit: contain;
	}

	.meta {
		color: rgb(151 173 211);
		font-size: 0.72rem;
		font-weight: 800;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	.faq-list {
		display: grid;
		gap: 1rem;
	}

	.faq-group {
		display: grid;
		gap: 0.6rem;
	}

	.faq-group-title {
		padding: 0 0.15rem;
		color: rgb(255 205 130);
		font-size: 0.98rem;
		letter-spacing: 0.03em;
	}

	.faq-item {
		overflow: clip;
		scroll-margin-top: 7rem;
	}

	.faq-item h4 button {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto;
		gap: 0.75rem;
		align-items: center;
		width: 100%;
		padding: 0.95rem 1rem;
		border: 0;
		background: transparent;
		color: rgb(var(--rgb-text-bright-dark));
		font: inherit;
		text-align: left;
		cursor: pointer;
	}

	.faq-item h4 button span {
		color: rgb(255 205 130);
		font-size: 0.78rem;
		font-weight: 800;
	}

	.faq-chevron {
		transition: transform 0.22s ease;
	}

	.faq-item.open .faq-chevron {
		transform: rotate(180deg);
	}

	.faq-answer {
		display: grid;
		gap: 0.8rem;
		padding: 0 1rem 1rem 3.55rem;
	}

	.faq-link-block {
		display: grid;
		gap: 0.45rem;
	}

	.faq-link-block strong {
		color: rgb(var(--rgb-text-bright-dark));
		font-size: 0.82rem;
	}

	.faq-link-block ul {
		display: flex;
		flex-wrap: wrap;
		gap: 0.45rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.faq-link-block a {
		display: inline-flex;
		align-items: center;
		gap: 0.32rem;
		min-height: 2rem;
		padding: 0.28rem 0.58rem;
		border: 1px solid rgb(var(--rgb-white) / 0.14);
		border-radius: 999px;
		background: rgb(var(--rgb-white) / 0.07);
		color: rgb(255 205 130);
		font-size: 0.78rem;
		font-weight: 800;
		text-decoration: none;
	}

	.podcast-panel {
		align-items: stretch;
	}

	.latest-episode-card {
		display: grid;
		grid-template-columns: 8rem minmax(0, 1fr);
		gap: 1rem;
		align-items: center;
		padding: 1rem;
	}

	.latest-episode-card img {
		aspect-ratio: 1;
		object-fit: contain;
	}

	.latest-episode-card div {
		display: grid;
		gap: 0.45rem;
	}

	.latest-episode-card a,
	.contact-copy a {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		width: fit-content;
		color: rgb(255 205 130);
		font-weight: 800;
		text-decoration: none;
	}

	.resource-category {
		display: grid;
		gap: 0.75rem;
	}

	.resource-grid {
		grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
	}

	.resource-card {
		position: relative;
		display: grid;
		gap: 0.4rem;
		min-height: 9rem;
		padding: 1rem;
		text-decoration: none;
		transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
	}

	.resource-card-head {
		display: flex;
		align-items: center;
		gap: 0.65rem;
		min-width: 0;
	}

	.resource-logo {
		display: grid;
		flex: 0 0 auto;
		width: 2.4rem;
		height: 2.4rem;
		place-items: center;
		border: 1px solid rgb(var(--rgb-white) / 0.14);
		border-radius: 0.65rem;
		background: rgb(var(--rgb-white) / 0.9);
	}

	.resource-logo img {
		display: block;
		width: 1.55rem;
		height: 1.55rem;
		object-fit: contain;
	}

	.resource-card strong {
		color: rgb(var(--rgb-text-bright-dark));
	}

	.resource-external {
		position: absolute;
		right: 1rem;
		bottom: 1rem;
		color: rgb(255 205 130);
	}

	.contact-form {
		display: grid;
		gap: 0.6rem;
		padding: 1rem;
	}

	.newsletter-form {
		display: grid;
		gap: 0.55rem;
		margin-top: 0.5rem;
		padding: 1rem;
		border: 1px solid rgb(var(--rgb-white) / 0.12);
		border-radius: 0.85rem;
		background: var(--shell-2);
	}

	.newsletter-form p {
		color: var(--copy-muted);
	}

	.newsletter-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: 0.5rem;
	}

	.newsletter-form label,
	.contact-form label {
		color: rgb(var(--rgb-text-bright-dark));
		font-size: 0.82rem;
		font-weight: 800;
	}

	.newsletter-form input,
	.contact-form input,
	.contact-form textarea {
		width: 100%;
		border: 1px solid var(--line-soft);
		border-radius: 0.65rem;
		background: rgb(var(--rgb-black) / 0.18);
		color: rgb(var(--rgb-text-bright-dark));
		font: inherit;
		padding: 0.72rem 0.8rem;
		resize: vertical;
	}

	.newsletter-form button,
	.contact-form button {
		margin-top: 0.25rem;
		border: 0;
	}

	.form-note {
		color: rgb(255 205 130);
		font-size: 0.88rem;
	}

	.site-footer {
		position: relative;
		z-index: 1;
		margin-top: 1.1rem;
		padding: 1.4rem 0 1.6rem;
		border-top: 1px solid var(--line-soft);
		background: rgb(6 11 20 / 0.72);
	}

	.footer-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: 1rem;
		align-items: center;
	}

	.footer-logo {
		display: block;
		width: 9rem;
		height: auto;
		margin-bottom: 0.55rem;
	}

	.footer-links {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		justify-content: flex-end;
		align-items: center;
	}

	.footer-language {
		margin-inline: 0.2rem;
	}

	.footer-end {
		width: min(1140px, calc(100% - 2.5rem));
		margin: 1rem auto 0;
		color: rgb(145 158 183);
		font-size: 0.82rem;
	}

	.reveal {
		opacity: 0;
		transform: translateY(18px);
		animation: reveal-up 640ms cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
	}

	@keyframes reveal-up {
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	:global(html:not(.dark)) .page-shell {
		--line-soft: rgb(var(--rgb-slate-900) / 0.12);
		--line-strong: rgb(var(--rgb-slate-900) / 0.22);
		--copy-muted: rgb(64 84 114);
		background:
			linear-gradient(180deg, rgb(249 250 252 / 0.98), rgb(246 248 251 / 0.98)),
			rgb(var(--rgb-surface-light));
	}

	:global(html:not(.dark)) .ambient {
		background:
			radial-gradient(circle at 10% 8%, rgb(88 105 128 / 0.08), transparent 30%),
			radial-gradient(circle at 86% 14%, rgb(88 105 128 / 0.06), transparent 34%),
			linear-gradient(180deg, rgb(var(--rgb-white) / 0.38), transparent 30%);
	}

	:global(html:not(.dark)) .site-header {
		background: rgb(var(--rgb-white) / 0.9);
	}

	:global(html:not(.dark)) .brand-subtitle,
	:global(html:not(.dark)) nav a,
	:global(html:not(.dark)) .footer-links a {
		color: rgb(42 64 97);
	}

	:global(html:not(.dark)) nav a:hover,
	:global(html:not(.dark)) nav a.active,
	:global(html:not(.dark)) .footer-links a:hover {
		color: rgb(111 70 17);
		background: rgb(255 238 214 / 0.74);
		border-color: rgb(176 112 24 / 0.22);
	}

	:global(html:not(.dark)) .language-toggle,
	:global(html:not(.dark)) .theme-toggle,
	:global(html:not(.dark)) .menu-toggle {
		border-color: rgb(176 112 24 / 0.24);
		background: rgb(255 238 214 / 0.72);
		color: rgb(111 70 17);
	}

	:global(html:not(.dark)) .language-toggle button {
		color: rgb(111 70 17 / 0.72);
	}

	:global(html:not(.dark)) .panel {
		background:
			linear-gradient(150deg, rgb(var(--rgb-white) / 0.97), rgb(238 246 255 / 0.5)),
			rgb(var(--rgb-white));
		box-shadow:
			0 20px 32px rgb(var(--rgb-slate-900) / 0.08),
			inset 0 1px 0 rgb(var(--rgb-white) / 0.8);
	}

	:global(html:not(.dark)) .button-ghost {
		border-color: rgb(176 112 24 / 0.24);
		background: rgb(255 248 238 / 0.88);
		color: rgb(111 70 17);
	}

	:global(html:not(.dark)) .button-ghost:hover {
		background: rgb(255 226 184 / 0.82);
	}

	:global(html:not(.dark)) h1,
	:global(html:not(.dark)) h2,
	:global(html:not(.dark)) h3,
	:global(html:not(.dark)) h4,
	:global(html:not(.dark)) .resource-card strong,
	:global(html:not(.dark)) .faq-item h4 button,
	:global(html:not(.dark)) .faq-link-block strong,
	:global(html:not(.dark)) .contact-form label {
		color: rgb(18 37 63);
	}

	:global(html:not(.dark)) .faq-link-block a {
		border-color: rgb(176 112 24 / 0.2);
		background: rgb(176 112 24 / 0.1);
		color: rgb(111 70 17);
	}

	:global(html:not(.dark)) .resource-logo {
		border-color: rgb(176 112 24 / 0.2);
		background: rgb(var(--rgb-white) / 0.96);
	}

	:global(html:not(.dark)) .content-card,
	:global(html:not(.dark)) .infographic-card,
	:global(html:not(.dark)) .latest-episode-card,
	:global(html:not(.dark)) .resource-card,
	:global(html:not(.dark)) .faq-item,
	:global(html:not(.dark)) .newsletter-form,
	:global(html:not(.dark)) .contact-form {
		border-color: rgb(176 112 24 / 0.18);
		background: linear-gradient(150deg, rgb(var(--rgb-white) / 0.96), rgb(255 238 214 / 0.48));
	}

	:global(html:not(.dark)) .newsletter-form input,
	:global(html:not(.dark)) .contact-form input,
	:global(html:not(.dark)) .contact-form textarea {
		border-color: rgb(var(--rgb-slate-900) / 0.18);
		background: rgb(var(--rgb-white) / 0.88);
		color: rgb(18 37 63);
	}

	:global(html:not(.dark)) .site-footer {
		background: rgb(247 251 255 / 0.92);
	}

	@media (max-width: 1040px) {
		.brand-subtitle {
			display: none;
		}
	}

	@media (max-width: 900px) {
		.menu-toggle {
			display: grid;
		}

		nav {
			display: none;
			position: absolute;
			top: calc(100% + 0.62rem);
			left: 1.25rem;
			right: 1.25rem;
			padding: 0.65rem;
			gap: 0.35rem;
			border-radius: 0.72rem;
			border: 1px solid var(--line-soft);
			background: rgb(7 11 20 / 0.96);
			box-shadow: 0 16px 24px rgb(var(--rgb-black) / 0.34);
			flex-direction: column;
			align-items: stretch;
		}

		nav.open {
			display: flex;
		}

		nav a {
			justify-content: flex-start;
		}

		.header-controls {
			margin-left: 0;
			justify-content: space-between;
		}

		:global(html:not(.dark)) nav {
			background: rgb(var(--rgb-white) / 0.97);
			box-shadow: 0 16px 24px rgb(30 46 71 / 0.14);
		}

		.hero-panel,
		.podcast-panel,
		.contact-panel,
		.infographic-card,
		.footer-grid {
			grid-template-columns: 1fr;
		}

		.card-grid.three {
			grid-template-columns: 1fr;
		}

		.footer-links {
			justify-content: flex-start;
		}
	}

	@media (max-width: 640px) {
		.inner,
		.main-stack,
		.footer-end {
			width: calc(100% - 1.4rem);
		}

		.brand-logo {
			max-width: 9rem;
		}

		.hero-panel,
		.section-panel,
		.podcast-panel,
		.contact-panel {
			padding: 1rem;
		}

		.latest-episode-card {
			grid-template-columns: 1fr;
		}

		.faq-answer {
			padding-left: 1rem;
		}

		.newsletter-row {
			grid-template-columns: 1fr;
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
