const puppeteer = require('puppeteer');
const fs = require('fs');

type Config = { dirName: string; framework: string; src: string };
type Metric = { fileName: string; dirName: string; selector: string; selector2?: string };

(async () => {
	const app_configs = [
		{ dirName: 'rust-fel', framework: 'rust-fel', src: './apps/rust-fel-bench/index.js' },
		{ dirName: 'es-next', framework: 'es-next', src: './apps/es-next-bench/index.js' },
		{ dirName: 'vue', framework: 'vue', src: './apps/vue-bench/index.js' },
		{ dirName: 'react', framework: 'react', src: './apps/react-bench/index.js' },
	];

	const metrics = [
		{ fileName: 'k', dirName: 'k', selector: 'button#create1000' },
		{ fileName: '10k', dirName: 'ten-k', selector: 'button#create10000' },
		{ fileName: 'clearK', dirName: 'clear-k', selector: 'button#create1000', selector2: 'button#clear' },
		{ fileName: 'clear10K', dirName: 'clear-ten-k', selector: 'button#create10000', selector2: 'button#clear' },
	];
	for (const config of app_configs) {
		console.warn(`starting new run for ${config.framework}`);
		await manageDirsHtmlTraces(config, 1, metrics);
	}
	console.log('Finished running puppeteer benches');
	process.exit(0);
})();

async function manageDirsHtmlTraces(config: Config, iterations: number, metrics: Metric[]) {
	manageDirs(config);
	createHTML(config);
	await runTraces(config, metrics, iterations);
}

async function runTraces(config: Config, metrics: Metric[], iterations: number) {
	for (const metric of metrics) {
		fs.mkdirSync(`traces/${config.dirName}/${metric.dirName}`, { recursive: true });

		for (let i = 1; i <= iterations; i++) {
			await measureEvent(
				metric.selector,
				`traces/${config.dirName}/${metric.dirName}/trace${i}.${metric.fileName}.${config.framework}.json`,
				metric.selector2
			);
		}
	}
}

function manageDirs(config: Config) {
	fs.rmdirSync(`traces/${config.dirName}`, { recursive: true });
	fs.mkdirSync(`traces/${config.dirName}`, { recursive: true });
}

function createHTML(config: Config) {
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
}

async function measureEvent(selector: string, path: string, selector2: string = ''): Promise<void> {
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
		await page.waitFor(1000);
		await page.waitForSelector(selector);
		await page.tracing.start({ path, screenshots: true });
		await page.click(selector);

		if (selector2) {
			await page.waitFor(2000);
			await page.click(selector2);
		}

		await page.tracing.stop();

		// const metrics = await page.metrics();
		console.info(selector, '  ', path, '  ', selector2, '  ');

		await browser.close();
	} catch (error) {
		console.error(error);
		console.log('Moving on to the next test');
	}
}
