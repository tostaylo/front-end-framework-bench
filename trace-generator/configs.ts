export type Config = { dirName: string; framework: string; src: string };

export const appConfigs: Config[] = [
	{ dirName: 'rust-fel', framework: 'rust-fel', src: './apps/rust-fel-bench/index.js' },
	{ dirName: 'es-next', framework: 'es-next', src: './apps/es-next-bench/index.js' },
	{ dirName: 'vue', framework: 'vue', src: './apps/vue-bench/index.js' },
	{ dirName: 'react', framework: 'react', src: './apps/react-bench/index.js' },
];
