<script lang="ts">
	import { ShieldCheck, ArrowLeft, Linkedin } from "lucide-svelte";
	import type { PageData } from "./$types";

	let { data } = $props<{ data: PageData }>();
	const content = $derived(data.content);
</script>

<svelte:head>
	<title>{content.pageTitle} | {content.brandName}</title>
	<meta name="description" content={content.pageLead} />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="legal-page">
	<div class="ambient" aria-hidden="true"></div>

	<header class="page-header">
		<a class="back-link" href="/">
			<ArrowLeft size={15} />
			{content.backLinkLabel}
		</a>
		<p class="brand">{content.brandName}</p>
	</header>

	<main class="page-main">
		<section class="hero-panel">
			<p class="kicker"><ShieldCheck size={14} strokeWidth={2.2} /> {content.pageKicker}</p>
			<h1>{content.pageTitle}</h1>
			<p class="lead">{content.pageLead}</p>
		</section>

		<section class="legal-grid">
			<article class="legal-card" id="impressum">
				<h2>{content.impressumTitle}</h2>
				<div class="legal-html">{@html content.impressumHtml}</div>
				<p class="website-credit">
					{content.websiteCreditLabel}
					<a
						href={content.websiteLinkedInUrl}
						target="_blank"
						rel="noopener noreferrer"
						aria-label="LinkedIn Profil"
					>
						<Linkedin size={16} />
					</a>
				</p>
			</article>

			<article class="legal-card" id="datenschutz">
				<h2>{content.datenschutzTitle}</h2>
				<div class="legal-html">{@html content.datenschutzHtml}</div>
			</article>
		</section>

		<p class="notice">{content.noticeText}</p>
	</main>
</div>

<style>
	:global(body) {
		margin: 0;
		font-family: "Manrope", "Avenir Next", sans-serif;
		background: var(--background);
	}

	.legal-page {
		min-height: 100vh;
		position: relative;
		overflow: clip;
		color: var(--foreground);
	}

	.ambient {
		position: fixed;
		inset: 0;
		pointer-events: none;
		background:
			radial-gradient(circle at 10% 10%, rgb(var(--rgb-accent-blue) / 0.22), transparent 30%),
			radial-gradient(circle at 86% 15%, rgb(var(--rgb-accent-teal) / 0.12), transparent 35%);
		z-index: 0;
	}

	.page-header,
	.page-main {
		position: relative;
		z-index: 1;
		width: min(980px, calc(100% - 2rem));
		margin-inline: auto;
	}

	.page-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1.2rem 0 0.7rem;
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		height: 2.15rem;
		padding: 0 0.8rem;
		border-radius: 999px;
		border: 1px solid rgb(var(--rgb-white) / 0.14);
		background: rgb(var(--rgb-white) / 0.04);
		color: rgb(215 227 247);
		text-decoration: none;
		font-size: 0.82rem;
		font-weight: 700;
	}

	.back-link:hover {
		background: rgb(var(--rgb-white) / 0.1);
	}

	.brand {
		margin: 0;
		font-family: "Space Grotesk", "Manrope", sans-serif;
		font-size: 0.9rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: rgb(184 200 229);
	}

	.page-main {
		display: grid;
		gap: 0.9rem;
		padding: 0.5rem 0 2.3rem;
	}

	.hero-panel,
	.legal-card {
		border: 1px solid rgb(var(--rgb-white) / 0.14);
		border-radius: 1rem;
		background: linear-gradient(165deg, rgb(21 30 50 / 0.88), rgb(10 14 23 / 0.92));
		box-shadow: 0 20px 30px rgb(var(--rgb-black) / 0.26);
	}

	.hero-panel {
		padding: clamp(1.1rem, 2.5vw, 1.7rem);
	}

	.kicker {
		margin: 0;
		display: inline-flex;
		align-items: center;
		gap: 0.42rem;
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: rgb(149 173 215);
	}

	h1,
	h2,
	:global(.legal-html h3),
	:global(.legal-html h4) {
		margin: 0;
		font-family: "Space Grotesk", "Manrope", sans-serif;
		line-height: 1.12;
	}

	h1 {
		margin-top: 0.5rem;
		font-size: clamp(1.8rem, 4vw, 2.6rem);
	}

	h2 {
		font-size: clamp(1.1rem, 2.4vw, 1.4rem);
	}

	.lead {
		margin: 0.7rem 0 0;
		color: rgb(186 201 228);
	}

	.legal-grid {
		display: grid;
		gap: 0.8rem;
	}

	.legal-card {
		display: grid;
		align-content: start;
		gap: 0.55rem;
		padding: 1rem;
	}

	:global(.legal-html) {
		display: grid;
		gap: 0.55rem;
	}

	:global(.legal-html p),
	:global(.legal-html li) {
		margin: 0;
		color: rgb(var(--rgb-legal-copy-dark));
		line-height: 1.6;
	}

	:global(.legal-html ul) {
		margin: 0;
		padding-left: 1.2rem;
		display: grid;
		gap: 0.35rem;
	}

	:global(.legal-html a) {
		color: rgb(var(--rgb-link-dark));
	}

	.website-credit {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		margin-top: 0.3rem;
		color: rgb(var(--rgb-legal-copy-dark));
	}

	.website-credit a {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.75rem;
		height: 1.75rem;
		border-radius: 999px;
		border: 1px solid rgb(var(--rgb-white) / 0.2);
		background: rgb(var(--rgb-white) / 0.06);
		color: rgb(var(--rgb-link-dark));
	}

	.website-credit a:hover {
		background: rgb(var(--rgb-white) / 0.14);
	}

	.notice {
		margin: 0.1rem 0 0;
		font-size: 0.86rem;
		color: rgb(158 180 217);
	}

	:global(html:not(.dark)) .ambient {
		background:
			radial-gradient(circle at 10% 10%, rgb(var(--rgb-accent-blue) / 0.16), transparent 30%),
			radial-gradient(circle at 86% 15%, rgb(var(--rgb-accent-teal) / 0.1), transparent 35%);
	}

	:global(html:not(.dark)) .back-link {
		border-color: rgb(var(--rgb-slate-900) / 0.18);
		background: rgb(var(--rgb-slate-800) / 0.08);
		color: rgb(var(--rgb-link-light));
	}

	:global(html:not(.dark)) .back-link:hover {
		background: rgb(var(--rgb-slate-800) / 0.14);
	}

	:global(html:not(.dark)) .brand {
		color: rgb(61 84 118);
	}

	:global(html:not(.dark)) .hero-panel,
	:global(html:not(.dark)) .legal-card {
		border-color: rgb(var(--rgb-slate-900) / 0.14);
		background: linear-gradient(165deg, rgb(251 254 255 / 0.97), rgb(238 246 255 / 0.95));
		box-shadow: 0 16px 28px rgb(20 38 63 / 0.1);
	}

	:global(html:not(.dark)) .kicker {
		color: rgb(79 102 136);
	}

	:global(html:not(.dark)) .lead {
		color: rgb(66 84 111);
	}

	:global(html:not(.dark)) :global(.legal-html p),
	:global(html:not(.dark)) :global(.legal-html li),
	:global(html:not(.dark)) .website-credit {
		color: rgb(64 84 114);
	}

	:global(html:not(.dark)) :global(.legal-html a) {
		color: rgb(29 58 97);
	}

	:global(html:not(.dark)) .website-credit a {
		border-color: rgb(var(--rgb-slate-900) / 0.18);
		background: rgb(var(--rgb-slate-800) / 0.08);
		color: rgb(var(--rgb-link-light));
	}

	:global(html:not(.dark)) .website-credit a:hover {
		background: rgb(var(--rgb-slate-800) / 0.14);
	}

	:global(html:not(.dark)) .notice {
		color: rgb(79 104 142);
	}

	@media (max-width: 640px) {
		.page-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.5rem;
		}
	}
</style>
