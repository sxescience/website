<script lang="ts">
	import { ArrowLeft } from "lucide-svelte";
</script>

<svelte:head>
	<title>Forschung mit Folgen | SxE</title>
	<meta
		name="description"
		content="Podcast der Initiative Scientists x Entrepreneurship über Wege aus der Wissenschaft in die Anwendung."
	/>
</svelte:head>

<main class="podcast-page">
	<a href="/" class="back-link"><ArrowLeft size={16} /> Zurück zur Startseite</a>
	<section>
		<p>Podcast</p>
		<h1>Forschung mit Folgen</h1>
		<p>
			Die vollständige Podcast-Unterseite wird hier vorbereitet. Bis dahin findest du die aktuellen
			Folgen und Plattform-Links auf der Startseite.
		</p>
	</section>
</main>

<style>
	.podcast-page {
		min-height: 100vh;
		width: min(760px, calc(100% - 2rem));
		margin: 0 auto;
		padding: 3rem 0;
		font-family: "Manrope", system-ui, sans-serif;
		color: var(--foreground);
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		margin-bottom: 2rem;
		color: inherit;
		font-weight: 700;
		text-decoration: none;
	}

	section {
		display: grid;
		gap: 0.8rem;
		border: 1px solid var(--border);
		border-radius: 0.9rem;
		padding: clamp(1.2rem, 4vw, 2.5rem);
		background: var(--card);
	}

	p {
		margin: 0;
		color: var(--muted-foreground);
	}

	h1 {
		margin: 0;
		font-size: clamp(2rem, 7vw, 4rem);
		line-height: 1;
	}
</style>
