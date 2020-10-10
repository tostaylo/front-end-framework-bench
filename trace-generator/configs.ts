const webComponent = '<main-component/>';
export type Config = { dirName: string; framework: string; src: string; webComponent?: typeof webComponent };

const ROOT_DIR = './apps/';
const INDEX_FILE = 'index.js';
const RUST_FEL = 'rust-fel';
const ES_NEXT = 'es-next';
const VUE = 'vue';
const REACT = 'react';
const RUST_WASM = 'rust-wasm';
const WEB_COMPONENT = 'web-component';
const BENCH = '-bench/';

export const configs: Config[] = [
	{
		dirName: WEB_COMPONENT,
		framework: WEB_COMPONENT,
		src: `${ROOT_DIR}${WEB_COMPONENT}${BENCH}${INDEX_FILE}`,
		webComponent,
	},
	{ dirName: RUST_WASM, framework: RUST_WASM, src: `${ROOT_DIR}${RUST_WASM}${BENCH}${INDEX_FILE}` },
	{ dirName: RUST_FEL, framework: RUST_FEL, src: `${ROOT_DIR}${RUST_FEL}${BENCH}${INDEX_FILE}` },
	{ dirName: ES_NEXT, framework: ES_NEXT, src: `${ROOT_DIR}${ES_NEXT}${BENCH}${INDEX_FILE}` },
	{ dirName: VUE, framework: VUE, src: `${ROOT_DIR}${VUE}${BENCH}${INDEX_FILE}` },
	{ dirName: REACT, framework: REACT, src: `${ROOT_DIR}${REACT}${BENCH}${INDEX_FILE}` },
];
