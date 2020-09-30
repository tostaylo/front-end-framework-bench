import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import { configs, Config } from './configs';
import { metrics, Metric } from './metrics';

const ROOT_DIR = '../traces/';

interface Page extends puppeteer.Page {
	waitForTimeout: (num: number) => Promise<void>;
}

(async () => {
	//could get args here
	// const configArr = configArg ? [config[config[configArg#]] : configs]
	// const metricArr = metricArg ? [metric[metric[metricArg#]] : metrics ]
	// const testToRun = iterationArg ? iterationArg# : 12;

	for (const config of configs) {
		console.warn(`starting new run for ${config.framework}`);
		// try catch here
		await manageDirsHtmlTraces(config, 2, metrics);
	}
	console.log('Finished running puppeteer benches');
	// make sure this is needed
	process.exit(0);
})();

async function manageDirsHtmlTraces(config: Config, iterations: number, metrics: Metric[]) {
	manageDirs(config);
	createHTML(config);
	await runTraces(config, metrics, iterations);
}

async function runTraces(config: Config, metrics: Metric[], iterations: number) {
	for (const metric of metrics) {
		fs.mkdirSync(`${ROOT_DIR}${config.dirName}/${metric.dirName}`, { recursive: true });

		for (let i = 1; i <= iterations; i++) {
			await measureEvent(
				metric.selector,
				`${ROOT_DIR}${config.dirName}/${metric.dirName}/trace${i}.${metric.fileName}.${config.framework}.json`,
				metric.selector2
			);
		}
	}
}

function manageDirs(config: Config) {
	fs.rmdirSync(`${ROOT_DIR}${config.dirName}`, { recursive: true });
	fs.mkdirSync(`${ROOT_DIR}${config.dirName}`, { recursive: true });
}

function createHTML(config: Config) {
	// Let's inline css
	const html = `<html>
	<head>
		<title>${config.framework}</title>
		<meta content="text/html;charset=utf-8" http-equiv="Content-Type" />
		<link rel="stylesheet" href="./main.css" />
    <link rel="icon" href="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2016%2016'%3E%3Ctext%20x='0'%20y='14'%3E🦄%3C/text%3E%3C/svg%3E" type="image/svg+xml" />
	</head>
	<body>
		<div id="root"></div>
		<script src="${config.src}" type="module">
		</script>
	</body>
</html>
`;
	fs.writeFile('../index.html', html, function (err) {
		if (err) return console.log(err);
	});
}

async function measureEvent(selector: string, path: string, selector2 = ''): Promise<void> {
	try {
		const browser = await puppeteer.launch({
			headless: true,
			args: [
				'--incognito',
				'--no-sandbox', // meh but better resource consumption
				'--disable-setuid-sandbox',
				'--disable-dev-shm-usage', // ???
				'--no-zygote', // wtf does that mean ?
			],
		});

		const page = await browser.newPage();
		const navigationPromise = page.waitForNavigation();
		await page.goto('http://localhost:80/');
		await page.setViewport({ width: 1440, height: 714 });
		await navigationPromise;
		await (page as Page).waitForTimeout(2000);
		await page.waitForSelector(selector);
		await page.tracing.start({ path, screenshots: true });
		await page.click(selector);

		if (selector2) {
			await (page as Page).waitForTimeout(3000);
			await page.click(selector2);
		}

		await page.tracing.stop();

		// const metrics = await page.metrics();
		// memory heap info here?
		console.info(selector, '  ', path, '  ', selector2, '  ');

		await browser.close();
	} catch (error) {
		console.error(error);
		console.log('Moving on to the next test');
	}
}
