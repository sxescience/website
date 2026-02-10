import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite'; // <--- Neu
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		tailwindcss(), // <--- Neu (muss VOR sveltekit stehen)
		sveltekit()
	]
});