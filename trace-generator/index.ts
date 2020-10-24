import puppeteer from 'puppeteer';
import * as fs from 'fs';
import css from './css.js';
import { configs, Config } from './configs.js';
import { metrics, Metric } from './metrics.js';

const ROOT_DIR = '../traces/';

interface Page extends puppeteer.Page {
	waitForTimeout: (num: number) => Promise<void>;
}

(async () => {
	// could get args here
	const configArr = configs;
	const metricArr = metrics;
	const testsToRun = 6 || 11;

	for (const config of configArr) {
		console.warn(`starting new run for ${config.framework}`);
		try {
			await manageDirsHtmlTraces(config, testsToRun, metricArr);
		} catch (err) {
			console.warn(err, "We've encountered a problem and will exit the process");
			process.exit(1);
		}
	}
	console.log('Finished running puppeteer benches successfully');
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
				`${ROOT_DIR}${config.dirName}/${metric.dirName}/${config.framework}.${metric.fileName}.${i}.json`,
				config.webComponent,
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
	const html = `<html>
	<head>
		<title>${config.framework}</title>
		<meta content="text/html;charset=utf-8" http-equiv="Content-Type" />
		<style>${css}</style>
    <link rel="icon" href="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2016%2016'%3E%3Ctext%20x='0'%20y='14'%3E🦄%3C/text%3E%3C/svg%3E" type="image/svg+xml" />
	</head>
	<body>
		<div id="root">${config.webComponent ? config.webComponent : ''}</div>
		<script src="${config.src}" type="module">
		</script>
	</body>
</html>
`;
	fs.writeFile('../index.html', html, function (err) {
		if (err) return console.log(err);
	});
}

async function measureEvent(
	selector: string,
	path: string,
	webComponent: Config['webComponent'],
	selector2 = ''
): Promise<void> {
	let browser;
	try {
		browser = await puppeteer.launch({
			headless: true,
			args: [
				'--single-process',
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

		if (webComponent) {
			const shadowSelector1 = await page.evaluateHandle(
				`document.querySelector('main-component').shadowRoot.getElementById('${selector.split('#')[1]}')`
			);

			await page.tracing.start({ path, screenshots: true });
			await ((shadowSelector1 as unknown) as any).click();

			if (selector2) {
				const shadowSelector2 = await page.evaluateHandle(
					`document.querySelector('main-component').shadowRoot.getElementById('${selector2.split('#')[1]}')`
				);

				const jsonVal = await shadowSelector2.jsonValue();
				if (!jsonVal) {
					// Don't record stats if we do not have the selector
					throw new Error('ShadowSelector2 does not have a jsonValue');
				}

				await (page as Page).waitForTimeout(3000);

				// This method of clicking instead of page.click seems like it doesn't collect the whole trace
				// Which is why i'm waiting for a timeout below
				await ((shadowSelector2 as unknown) as any).click();
			}

			await (page as Page).waitForTimeout(3000);
			await page.tracing.stop();
		} else {
			await page.waitForSelector(selector, { timeout: 500 });
			await page.tracing.start({ path, screenshots: true });
			await page.click(selector);

			if (selector2) {
				await page.waitForSelector(selector2, { timeout: 500 });
				await (page as Page).waitForTimeout(3000);
				await page.click(selector2);
			}
			// Check verification element here. Count maybe.
			await page.tracing.stop();
		}

		const metrics = await page.metrics();
		// memory heap info here?
		console.info(selector, '  ', path, '  ', selector2, '  ', metrics);

		await browser.close();
	} catch (error) {
		console.error(error);
		if (browser) {
			console.log({ pid: browser.process().pid }, 'Trying to shutdown browser.');
			await browser.close();
		}
		console.log('Moving on to the next test');
	}
}
