type FileAndDirectoryNames = 'create-k' | 'create-ten-k' | 'clear-k' | 'clear-ten-k' | 'update-k' | 'update-ten-k';

export type Metric = {
	fileName: FileAndDirectoryNames;
	dirName: FileAndDirectoryNames;
	selector: 'button#create1000' | 'button#create10000';
	selector2?: 'button#clear' | 'button#update';
};

export const metrics: Metric[] = [
	{ fileName: 'create-k', dirName: 'create-k', selector: 'button#create1000' },
	{ fileName: 'create-ten-k', dirName: 'create-ten-k', selector: 'button#create10000' },
	{ fileName: 'clear-k', dirName: 'clear-k', selector: 'button#create1000', selector2: 'button#clear' },
	{ fileName: 'clear-ten-k', dirName: 'clear-ten-k', selector: 'button#create10000', selector2: 'button#clear' },
	{ fileName: 'update-k', dirName: 'update-k', selector: 'button#create1000', selector2: 'button#update' },
	{ fileName: 'update-ten-k', dirName: 'update-ten-k', selector: 'button#create10000', selector2: 'button#update' },
];
