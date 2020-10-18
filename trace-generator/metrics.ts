export type Metric = { fileName: string; dirName: string; selector: string; selector2?: string };

export const metrics: Metric[] = [
	{ fileName: 'k', dirName: 'k', selector: 'button#create1000' },
	{ fileName: '10k', dirName: 'ten-k', selector: 'button#create10000' },
	{ fileName: 'clearK', dirName: 'clear-k', selector: 'button#create1000', selector2: 'button#clear' },
	{ fileName: 'clear10K', dirName: 'clear-ten-k', selector: 'button#create10000', selector2: 'button#clear' },
	{ fileName: 'updateK', dirName: 'update-k', selector: 'button#create1000', selector2: 'button#update' },
	{ fileName: 'update10K', dirName: 'update-ten-k', selector: 'button#create10000', selector2: 'button#update' },
];
