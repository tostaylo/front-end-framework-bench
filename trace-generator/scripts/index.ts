import { configs, Config, ThrottleSetting } from './configs.js';
import { metrics, Metric } from './metrics.js';
import { measureEvent } from './measureEvent.js';
import { manageDirs, createHTML, writeMetaFile, makeDir } from './manageFiles.js';

const ROOT_DIR = '../../';
const TRACE_DIR = `${ROOT_DIR}traces/`;

let CHROME_VERSION = '';

(async () => {
	// could get args here
	const configArr = configs;
	const metricArr = metrics;
	const testsToRun = 1;

	for (const throttleSetting in ThrottleSetting) {
		for (const config of configArr) {
			console.info(`starting new run for ${config.framework}`);
			try {
				await manageDirsHtmlTraces(
					config,
					testsToRun,
					metricArr,
					ThrottleSetting[throttleSetting as keyof typeof ThrottleSetting]
				);
			} catch (err) {
				console.error(err, "We've encountered a problem and will exit the process");
				process.exit(1);
			}
		}
	}

	writeMetaFile(CHROME_VERSION, ROOT_DIR);

	console.info('Finished running puppeteer benches successfully');
	process.exit(0);
})();

async function manageDirsHtmlTraces(
	config: Config,
	iterations: number,
	metrics: Metric[],
	throttleSetting: ThrottleSetting
) {
	manageDirs(`${throttleSetting}/${config.dirName}`, TRACE_DIR);
	createHTML(config, ROOT_DIR);
	await runTraces(config, metrics, iterations, throttleSetting);
}

async function runTraces(config: Config, metrics: Metric[], iterations: number, throttleSetting: ThrottleSetting) {
	for (const metric of metrics) {
		makeDir(throttleSetting, config.dirName, metric.dirName, TRACE_DIR);

		for (let i = 1; i <= iterations; i++) {
			const trace = await measureEvent(
				metric.dirName,
				metric.selector,
				`${TRACE_DIR}${throttleSetting}/${config.dirName}/${metric.dirName}/${config.framework}.${metric.fileName}.${i}.json`,
				throttleSetting,
				config.webComponent,
				metric.selector2
			);
			if (!CHROME_VERSION) {
				CHROME_VERSION = trace.chromeVersion;
			}
		}
	}
}
