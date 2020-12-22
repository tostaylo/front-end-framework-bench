const head = document.querySelector('head');
const svelteScript = document.createElement('script');
svelteScript.src = '/apps/svelte/svelte-app/public/build/bundle.js';
head?.appendChild(svelteScript);
