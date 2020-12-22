import puppeteer from 'puppeteer';
import * as fs from 'fs';
import css from './css.js';
import { configs, Config } from './configs.js';
import { metrics, Metric } from './metrics.js';

const ROOT_DIR = '../traces/';

enum ThrottleSetting {
	NO_THROTTLE = 'no-throttle',
	THROTTLE_4X = 'throttle-4x',
}
interface Page extends puppeteer.Page {
	waitForTimeout: (num: number) => Promise<void>;
}

(async () => {
	// could get args here
	const configArr = configs.slice(2, 3);
	const metricArr = metrics.slice(2, 3);
	const testsToRun = 1;

	for (const throttleSetting in ThrottleSetting) {
		for (const config of configArr) {
			console.warn(`starting new run for ${config.framework}`);
			try {
				await manageDirsHtmlTraces(
					config,
					testsToRun,
					metricArr,
					ThrottleSetting[throttleSetting as keyof typeof ThrottleSetting]
				);
			} catch (err) {
				console.warn(err, "We've encountered a problem and will exit the process");
				process.exit(1);
			}
		}
	}
	console.info('Finished running puppeteer benches successfully');
	process.exit(0);
})();

async function manageDirsHtmlTraces(
	config: Config,
	iterations: number,
	metrics: Metric[],
	throttleSetting: ThrottleSetting
) {
	manageDirs(`${throttleSetting}/${config.dirName}`);
	createHTML(config);
	await runTraces(config, metrics, iterations, throttleSetting);
}

async function runTraces(config: Config, metrics: Metric[], iterations: number, throttleSetting: ThrottleSetting) {
	for (const metric of metrics) {
		fs.mkdirSync(`${ROOT_DIR}${throttleSetting}/${config.dirName}/${metric.dirName}`, { recursive: true });

		for (let i = 1; i <= iterations; i++) {
			await measureEvent(
				metric.dirName,
				metric.selector,
				`${ROOT_DIR}${throttleSetting}/${config.dirName}/${metric.dirName}/${config.framework}.${metric.fileName}.${i}.json`,
				throttleSetting,
				config.webComponent,
				metric.selector2
			);
		}
	}
}

function manageDirs(path: string) {
	fs.rmdirSync(`${ROOT_DIR}${path}`, { recursive: true });
	fs.mkdirSync(`${ROOT_DIR}${path}`, { recursive: true });
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
		if (err) return console.info(err);
	});
}

async function measureEvent(
	metricName: Metric['dirName'],
	selector: Metric['selector'],
	path: Config['src'],
	throttleSetting: ThrottleSetting,
	webComponent: Config['webComponent'],
	selector2: Metric['selector2']
): Promise<void> {
	console.info('starting run for', { path, selector, selector2, webComponent });
	let browser;

	try {
		browser = await puppeteer.launch({
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
		if (throttleSetting === ThrottleSetting.THROTTLE_4X) {
			// Connect to Chrome DevTools
			const client = await page.target().createCDPSession();

			// Set Network Throttling property
			// await client.send('Network.emulateNetworkConditions', {
			// 	offline: false,
			// 	downloadThroughput: (200 * 1024) / 8,
			// 	uploadThroughput: (200 * 1024) / 8,
			// 	latency: 20,
			// });

			// Set Network CPU Throttling property
			await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });
		}

		const version = await page.browser().version();

		const navigationPromise = page.waitForNavigation();
		await page.goto('http://localhost:80/');
		await page.setViewport({ width: 1440, height: 714 });
		await navigationPromise;
		await (page as Page).waitForTimeout(2000);

		if (webComponent) {
			const shadowSelector1 = await page.evaluateHandle(
				`document.querySelector('main-component').shadowRoot.getElementById('${selector.split('#')[1]}')`
			);

			await page.tracing.start({ path, screenshots: false });
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
			// Verification for Web Component is not implemented
			// if (!(await verifier[metricName](page as Page))) {
			// 	throw new Error(`Unable to verify test was accurate for ${metricName}`);
			// }
			await page.tracing.stop();
		} else {
			await page.waitForSelector(selector, { timeout: 500 });
			await page.tracing.start({ path, screenshots: false });
			await page.click(selector);

			if (selector2) {
				await page.waitForSelector(selector2, { timeout: 500 });
				await (page as Page).waitForTimeout(3000);
				await page.click(selector2);
				await (page as Page).waitForTimeout(3000);
			}

			if (!(await verifier[metricName](page as Page))) {
				throw new Error(`Unable to verify test was accurate for ${metricName}`);
			}
			await page.tracing.stop();
		}

		// const metrics = await page.metrics();
		// memory heap info here?
		console.info('successful run for', { selector, path, selector2 });

		await browser.close();
	} catch (error) {
		console.error(error);

		if (browser) {
			console.info({ pid: browser.process().pid }, 'Trying to shutdown browser.');
			await browser.close();
		}
		console.info('Moving on to the next test');
	}
}

const verifier = {
	k: async function (page: Page) {
		const td = await page.evaluate(async () => {
			const td = document.querySelectorAll('td');
			return [[...td].length, td[1998].textContent];
		});
		const result = td[0] === 2000 && td[1] === '1000';
		console.log('Test for k', result);
		return result;
	},

	'ten-k': async function (page: Page) {
		const td = await page.evaluate(async () => {
			const td = document.querySelectorAll('td');
			return [[...td].length, td[19998].textContent];
		});

		const result = td[0] === 20000 && td[1] === '10000';
		console.log('Test for ten-k', result);
		return result;
	},

	'clear-k': async function (page: Page) {
		const td = await page.evaluate(async () => {
			const td = document.querySelectorAll('td');

			return td ? [...td].length : 0;
		});

		const result = td === 0;
		console.log('Test for clear-k', result);
		return result;
	},

	'clear-ten-k': async function (page: Page) {
		const td = await page.evaluate(async () => {
			const td = document.querySelectorAll('td');
			return td ? [...td].length : 0;
		});
		const result = td === 0;
		console.log('Test for clear-ten-k', result);
		return result;
	},

	'update-k': async function (page: Page) {
		const td: [number, string] = await page.evaluate(async () => {
			const td = document.querySelectorAll('td');
			return [[...td].length, td[1999].textContent] as [number, string];
		});
		const result = td[0] === 2000 && td[1]?.toLowerCase() === 'we are updated';
		console.log('Test for update-k', result);
		return result;
	},

	'update-ten-k': async function (page: Page) {
		const td: [number, string] = await page.evaluate(async () => {
			const td = document.querySelectorAll('td');
			return [[...td].length, td[19999].textContent] as [number, string];
		});
		const result = td[0] === 20000 && td[1]?.toLowerCase() === 'we are updated';
		console.log('Test for update-ten-k', result);
		return result;
	},
};
