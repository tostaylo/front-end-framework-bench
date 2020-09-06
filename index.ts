const puppeteer = require('puppeteer');

(async () => {
	try {
		const browser = await puppeteer.launch({
			headless: false,
			args: [
				'--incognito',
				'--no-sandbox', // meh but better resource comsuption
				'--disable-setuid-sandbox',
				'--disable-dev-shm-usage', // ???
				'--no-zygote', // wtf does that mean ?
			],
		});
		const page = await browser.newPage();
		const navigationPromise = page.waitForNavigation();
		await page.goto('http://localhost:8000/');
		await page.setViewport({ width: 1440, height: 714 });
		await navigationPromise;
		await page.waitFor(2000);
		const selector = 'button#create1000';
		await page.waitForSelector(selector);
		await page.tracing.start({ path: 'trace.json', screenshots: true });
		await page.click(selector);
		await page.tracing.stop();

		const metrics = await page.metrics();
		console.info(metrics);

		await browser.close();
	} catch (error) {
		console.warn(error);
		process.abort;
	}
})();
