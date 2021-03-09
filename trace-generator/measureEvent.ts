import puppeteer, { Page } from 'puppeteer';
import { Config, ThrottleSetting } from './configs.js';
import { Metric } from './metrics.js';

async function handleThrottle(throttleSetting: ThrottleSetting, page: Page): Promise<void> {
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
}

async function navigateBrowser(page: Page): Promise<void> {
	const navigationPromise = page.waitForNavigation();
	await page.goto('http://localhost:80/');
	await page.setViewport({ width: 1440, height: 714 });
	await navigationPromise;
	await page.waitForTimeout(2000);
}

async function handleWebComponent(
	page: Page,
	selector: Metric['selector'],
	selector2: Metric['selector2'],
	path: Config['src']
) {
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

		await page.waitForTimeout(3000);

		// This method of clicking instead of page.click seems like it doesn't collect the whole trace
		// Which is why i'm waiting for a timeout below
		await ((shadowSelector2 as unknown) as any).click();
	}

	await page.waitForTimeout(3000);
	// Verification for Web Component is not implemented
	// if (!(await verifier[metricName](page as Page))) {
	// 	throw new Error(`Unable to verify test was accurate for ${metricName}`);
	// }
	await page.tracing.stop();
}

async function handleFramework(
	page: Page,
	selector: Metric['selector'],
	selector2: Metric['selector2'],
	path: Config['src'],
	metricName: Metric['dirName']
) {
	await page.waitForSelector(selector, { timeout: 500 });
	await page.tracing.start({ path, screenshots: false });
	await page.click(selector);

	if (selector2) {
		await page.waitForSelector(selector2, { timeout: 500 });
		await page.waitForTimeout(3000);
		await page.click(selector2);
		await page.waitForTimeout(3000);
	}

	if (!(await verifier[metricName](page))) {
		throw new Error(`Unable to verify test was accurate for ${metricName}`);
	}
	await page.tracing.stop();
}

export async function measureEvent(
	metricName: Metric['dirName'],
	selector: Metric['selector'],
	path: Config['src'],
	throttleSetting: ThrottleSetting,
	webComponent: Config['webComponent'],
	selector2: Metric['selector2']
): Promise<{ chromeVersion: string }> {
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

		await handleThrottle(throttleSetting, page);

		const chromeVersion = await page.browser().version();

		await navigateBrowser(page);

		if (webComponent) {
			await handleWebComponent(page, selector, selector2, path);
		} else {
			await handleFramework(page, selector, selector2, path, metricName);
		}

		// const metrics = await page.metrics();
		// memory heap info here?
		console.info('successful run for', { selector, path, selector2 });

		await browser.close();
		return { chromeVersion };
	} catch (error) {
		console.error(error);

		if (browser) {
			console.info({ pid: browser.process().pid }, 'Trying to shutdown browser.');
			await browser.close();
		}
		console.info('Moving on to the next test');
		return { chromeVersion: '' };
	}
}

const verifier = {
	'create-k': async function (page: Page) {
		const td = await page.evaluate(async () => {
			const td = document.querySelectorAll('td');
			return [[...td].length, td[1998].textContent];
		});
		const result = td[0] === 2000 && td[1] === '1000';
		console.log('Test for create-k', result);
		return result;
	},

	'create-ten-k': async function (page: Page) {
		const td = await page.evaluate(async () => {
			const td = document.querySelectorAll('td');
			return [[...td].length, td[19998].textContent];
		});

		const result = td[0] === 20000 && td[1] === '10000';
		console.log('Test for create-ten-k', result);
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
