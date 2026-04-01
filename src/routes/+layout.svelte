<script lang="ts">
	import "../app.css";
	import favicon from "$lib/assets/favicon.svg";

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<script>
		(() => {
			const storageKey = "sxe-theme";
			const root = document.documentElement;

			try {
				const stored = localStorage.getItem(storageKey);
				const mode = stored === "light" ? "light" : "dark";
				root.classList.toggle("dark", mode === "dark");
				root.style.colorScheme = mode;
			} catch {
				root.classList.add("dark");
				root.style.colorScheme = "dark";
			}
		})();
	</script>
</svelte:head>

{@render children()}
