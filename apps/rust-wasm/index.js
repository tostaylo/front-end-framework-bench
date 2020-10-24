import init from './pkg/rust-wasm-bench.js';
import VarTracker from './varTracker.js';

async function run() {
	await init();
}
window.varTracker = new VarTracker();
run();
