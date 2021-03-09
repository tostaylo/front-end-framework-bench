import * as fs from 'fs';
import css from './css.js';
import { Config, ThrottleSetting } from './configs.js';
import { Metric } from './metrics.js';

export function manageDirs(path: string, traceDir: string) {
	fs.rmdirSync(`${traceDir}${path}`, { recursive: true });
	fs.mkdirSync(`${traceDir}${path}`, { recursive: true });
}

export function createHTML(config: Config, rootDir: string) {
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
	fs.writeFile(`${rootDir}index.html`, html, function (err) {
		if (err) return console.info(err);
	});
}

export function writeMetaFile(chrome_version: string, rootDir: string) {
	const path = `${rootDir}trace-results/meta.json`;
	const date = new Date();
	try {
		fs.writeFileSync(path, JSON.stringify({ date, chrome_version }));
	} catch (err) {
		console.error(err);
	}
}

export function makeDir(
	throttleSetting: ThrottleSetting,
	configDirName: string,
	metricDirName: Metric['dirName'],
	traceDir: string
) {
	fs.mkdirSync(`${traceDir}${throttleSetting}/${configDirName}/${metricDirName}`, { recursive: true });
}
