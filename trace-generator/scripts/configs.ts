const WebC = `<main-component/>`;

export enum ThrottleSetting {
	NO_THROTTLE = 'no-throttle',
	THROTTLE_4X = 'throttle-4x',
}

export type Config = { dirName: string; framework: string; src: string; webComponent?: typeof WebC | null };

function createConfig(name: string, isWebComp = false): Config {
	return {
		dirName: name,
		framework: name,
		src: `./apps/${name}/index.js`,
		webComponent: isWebComp ? WebC : null,
	};
}

export const configs: Config[] = [
	createConfig('svelte'),
	createConfig('web-component', true),
	createConfig('rust-wasm'),
	createConfig('rust-fel'),
	createConfig('react'),
	createConfig('vue'),
	createConfig('javascript'),
];
