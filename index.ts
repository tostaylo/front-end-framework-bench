const puppeteer = require('puppeteer');
const fs = require('fs');

const app_configs = [
	{ dirName: 'rust-fel', framework: 'rust-fel', src: './apps/rust-fel-bench/index.js' },
	{ dirName: 'es-next', framework: 'es-next', src: './apps/es-next-bench/index.js' },
];

const metrics = [
	{ fileName: 'k', dirName: 'k', selector: 'button#create1000' },
	{ fileName: '10k', dirName: 'ten_k', selector: 'button#create10000' },
];

(async () => {
	for (const config of app_configs) {
		fs.rmdirSync(`traces/${config.dirName}`, { recursive: true });
		fs.mkdirSync(`traces/${config.dirName}`, { recursive: true });

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
		fs.writeFile('index.html', html, function (err: any) {
			if (err) return console.log(err);
		});

		for (const metric of metrics) {
			fs.mkdirSync(`traces/${config.dirName}/${metric.dirName}`, { recursive: true });

			for (let i = 0; i <= 11; i++) {
				await measure_event(
					metric.selector,
					`traces/${config.dirName}/${metric.dirName}/trace${i}.${metric.fileName}.${config.framework}.json`
				);
			}
		}
	}
})();

async function measure_event(selector: string, path: string): Promise<void> {
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
		await page.goto('http://localhost:8000/');
		await page.setViewport({ width: 1440, height: 714 });
		await navigationPromise;
		await page.waitFor(1000);
		await page.waitForSelector(selector);
		await page.tracing.start({ path, screenshots: true });
		await page.click(selector);
		await page.tracing.stop();

		const metrics = await page.metrics();
		console.info(metrics);

		await browser.close();
	} catch (error) {
		console.warn(error);
		process.abort;
	}
}
