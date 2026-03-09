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
			radial-gradient(circle at 10% 10%, rgba(45, 132, 194, 0.22), transparent 30%),
			radial-gradient(circle at 86% 15%, rgba(33, 186, 162, 0.12), transparent 35%);
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
		border: 1px solid rgba(255, 255, 255, 0.14);
		background: rgba(255, 255, 255, 0.04);
		color: #d7e3f7;
		text-decoration: none;
		font-size: 0.82rem;
		font-weight: 700;
	}

	.back-link:hover {
		background: rgba(255, 255, 255, 0.1);
	}

	.brand {
		margin: 0;
		font-family: "Space Grotesk", "Manrope", sans-serif;
		font-size: 0.9rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #b8c8e5;
	}

	.page-main {
		display: grid;
		gap: 0.9rem;
		padding: 0.5rem 0 2.3rem;
	}

	.hero-panel,
	.legal-card {
		border: 1px solid rgba(255, 255, 255, 0.14);
		border-radius: 1rem;
		background: linear-gradient(165deg, rgba(21, 30, 50, 0.88), rgba(10, 14, 23, 0.92));
		box-shadow: 0 20px 30px rgba(0, 0, 0, 0.26);
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
		color: #95add7;
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
		color: #bac9e4;
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
		color: #c5d3ea;
		line-height: 1.6;
	}

	:global(.legal-html ul) {
		margin: 0;
		padding-left: 1.2rem;
		display: grid;
		gap: 0.35rem;
	}

	:global(.legal-html a) {
		color: #e7f2ff;
	}

	.website-credit {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		margin-top: 0.3rem;
		color: #c5d3ea;
	}

	.website-credit a {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.75rem;
		height: 1.75rem;
		border-radius: 999px;
		border: 1px solid rgba(255, 255, 255, 0.2);
		background: rgba(255, 255, 255, 0.06);
		color: #e7f2ff;
	}

	.website-credit a:hover {
		background: rgba(255, 255, 255, 0.14);
	}

	.notice {
		margin: 0.1rem 0 0;
		font-size: 0.86rem;
		color: #9eb4d9;
	}

	@media (max-width: 640px) {
		.page-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.5rem;
		}
	}
</style>
