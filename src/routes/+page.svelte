<script lang="ts">
	import { ArrowRight, Sparkles, Newspaper, Mail, Users } from "lucide-svelte";
	import type { PageData } from "./$types";

	let { data } = $props<{ data: PageData }>();

	let isMobileMenuOpen = $state(false);
	const content = $derived(data.content);

	function toggleMenu() {
		isMobileMenuOpen = !isMobileMenuOpen;
	}

	function closeMenu() {
		isMobileMenuOpen = false;
	}

	function handleNewsletterSubmit(event: SubmitEvent) {
		event.preventDefault();
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

			<div class="news-grid">
				{#each content.news as item (item.id)}
					<article class="news-card">
						<p class="meta">{item.date}</p>
						<h2>{item.title}</h2>
						<p>{item.excerpt}</p>
						<a href={item.href}>{item.ctaLabel} <ArrowRight size={14} /></a>
					</article>
				{/each}
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
		outline: 2px solid #8ab7ff;
		outline-offset: 2px;
	}

	.page-shell {
		--shell-0: color-mix(in oklch, var(--background) 88%, #08111f 12%);
		--shell-1: color-mix(in oklch, var(--card) 82%, #0b1c2a 18%);
		--shell-2: color-mix(in oklch, var(--card) 72%, #111a2f 28%);
		--line-soft: rgba(255, 255, 255, 0.12);
		--line-strong: rgba(255, 255, 255, 0.2);
		--copy-muted: #b5c0d6;
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
			radial-gradient(circle at 10% 8%, rgba(45, 132, 194, 0.24), transparent 30%),
			radial-gradient(circle at 86% 14%, rgba(33, 186, 162, 0.16), transparent 34%),
			linear-gradient(180deg, rgba(255, 255, 255, 0.02), transparent 30%);
		z-index: 0;
	}

	.skip-link {
		position: absolute;
		left: 1rem;
		top: -5rem;
		padding: 0.6rem 0.9rem;
		border-radius: 0.6rem;
		background: #0f172d;
		color: #f2f6ff;
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
		background: color-mix(in srgb, #060b14 74%, transparent);
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
		color: #edf2ff;
		text-decoration: none;
	}

	.brand-dot {
		width: 0.6rem;
		height: 0.6rem;
		border-radius: 999px;
		background: linear-gradient(135deg, #23c6b0, #5fa3ff);
		box-shadow: 0 0 20px rgba(82, 170, 255, 0.7);
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
		color: #d4deef;
		text-decoration: none;
		transition: all 0.2s ease;
	}

	nav a:hover {
		border-color: var(--line-soft);
		background: rgba(255, 255, 255, 0.06);
		color: #ffffff;
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
		background: #f2f6ff;
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
			0 24px 40px rgba(0, 0, 0, 0.28),
			inset 0 1px 0 rgba(255, 255, 255, 0.04);
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
		color: #99accf;
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
		background: linear-gradient(140deg, #25baa8, #4f8dff);
		color: #f7fbff;
	}

	.button-ghost {
		border: 1px solid var(--line-strong);
		background: rgba(255, 255, 255, 0.04);
		color: #d8e3f7;
	}

	.cms-chip {
		height: fit-content;
		display: grid;
		gap: 0.65rem;
		padding: 1rem;
		border-radius: 0.95rem;
		border: 1px solid rgba(255, 255, 255, 0.14);
		background: linear-gradient(150deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02));
	}

	.cms-chip p {
		margin: 0;
		color: #d0dcf3;
	}

	.chip-head {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.76rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: #9ab2d9;
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
		background: rgba(255, 255, 255, 0.07);
		font-size: 0.77rem;
		color: #d7e4fb;
	}

	.news-grid {
		grid-column: 1 / -1;
		display: grid;
		gap: 0.8rem;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
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
		border: 1px solid rgba(255, 255, 255, 0.12);
		background: var(--shell-2);
		transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
	}

	.news-card:hover,
	.mission-card:hover,
	.team-card:hover {
		transform: translateY(-5px);
		border-color: rgba(154, 195, 255, 0.45);
		box-shadow: 0 16px 24px rgba(0, 0, 0, 0.26);
	}

	.meta {
		margin: 0;
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.13em;
		text-transform: uppercase;
		color: #97add3;
	}

	.news-card p,
	.mission-card p,
	.team-card p {
		margin: 0.15rem 0 0;
		color: #c4d0e6;
	}

	.news-card a {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		margin-top: 0.5rem;
		width: fit-content;
		padding: 0.35rem 0.6rem;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.1);
		color: #f8fbff;
		font-size: 0.76rem;
		font-weight: 700;
		text-decoration: none;
	}

	.news-card a:hover {
		background: rgba(255, 255, 255, 0.17);
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
		border: 1px solid rgba(255, 255, 255, 0.13);
		background: rgba(0, 0, 0, 0.24);
	}

	.newsletter-form label {
		font-size: 0.81rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: #adc0e1;
	}

	.newsletter-form input {
		height: 2.8rem;
		padding: 0 0.85rem;
		border: 1px solid rgba(255, 255, 255, 0.18);
		border-radius: 0.65rem;
		background: rgba(9, 14, 28, 0.8);
		color: #eef4ff;
	}

	.newsletter-form button {
		height: 2.8rem;
		padding: 0 1rem;
		border: 0;
		border-radius: 0.65rem;
		background: linear-gradient(140deg, #21c0ac, #5f97ff);
		font-size: 0.78rem;
		font-weight: 800;
		letter-spacing: 0.09em;
		text-transform: uppercase;
		color: #f8fdff;
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
		background: rgba(255, 255, 255, 0.1);
		font-size: 0.67rem;
		font-weight: 800;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #d9e8ff;
	}

	.site-footer {
		position: relative;
		z-index: 1;
		margin-top: 0.45rem;
		padding: 2.2rem 0 1.25rem;
		border-top: 1px solid var(--line-soft);
		background: color-mix(in srgb, #040912 84%, transparent);
	}

	.footer-grid {
		display: grid;
		gap: 1rem;
		grid-template-columns: 1.3fr 1fr;
	}

	.footer-grid p {
		margin: 0.4rem 0 0;
		color: #b4c2dc;
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
		border: 1px solid rgba(255, 255, 255, 0.14);
		background: rgba(255, 255, 255, 0.05);
		color: #dce6fa;
		font-size: 0.78rem;
		font-weight: 700;
		text-decoration: none;
	}

	.footer-links a:hover {
		background: rgba(255, 255, 255, 0.12);
	}

	.footer-end {
		margin: 1rem 0 0;
		text-align: center;
		color: #8ea1c4;
		font-size: 0.8rem;
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
			background: rgba(7, 11, 20, 0.95);
			box-shadow: 0 16px 24px rgba(0, 0, 0, 0.34);
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
