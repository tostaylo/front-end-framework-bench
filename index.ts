const puppeteer = require('puppeteer');
const fs = require('fs');

// maybe make this an npm package so when I write a script to start server it also runs all the tests.
// takes a config of {selector, framework, test_name}
// maybe no need to create different directories if the type of test is in the filename.

// alternatively I can just continue to run this from the root directory.
// doesn't make sense to make it a package really I don't think

(async () => {
	const html = `<html>
	<head>
		<title>rust-fel-bench</title>
		<meta content="text/html;charset=utf-8" http-equiv="Content-Type" />
		<link rel="stylesheet" href="./main.css" />
	</head>
	<body>
		<div id="root"></div>
		<script src="./apps/rust-fel-bench/index.js"type="module">
		</script>
	</body>
</html>
`;
	fs.writeFile('index.html', html, function (err: any) {
		if (err) return console.log(err);
	});

	for (let i = 0; i <= 11; i++) {
		await measure_event('button#create1000', `traces/k/trace${i}.k.rust-fel.json`);
	}
	for (let i = 0; i <= 11; i++) {
		await measure_event('button#create10000', `traces/ten_k/trace${i}.10k.react.json`);
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
