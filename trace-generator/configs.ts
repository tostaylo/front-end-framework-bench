export type Config = { dirName: string; framework: string; src: string };

const ROOT_DIR = './apps/';
const INDEX_FILE = 'index.js';
const RUST_FEL = 'rust-fel';
const ES_NEXT = 'es-next';
const VUE = 'vue';
const REACT = 'react';
const BENCH = '-bench/';

export const appConfigs: Config[] = [
	{ dirName: RUST_FEL, framework: RUST_FEL, src: `${ROOT_DIR}${RUST_FEL}${BENCH}${INDEX_FILE}` },
	{ dirName: ES_NEXT, framework: ES_NEXT, src: `${ROOT_DIR}${ES_NEXT}${BENCH}${INDEX_FILE}` },
	{ dirName: VUE, framework: VUE, src: `${ROOT_DIR}${VUE}${BENCH}${INDEX_FILE}` },
	{ dirName: REACT, framework: REACT, src: `${ROOT_DIR}${REACT}${BENCH}${INDEX_FILE}` },
];
