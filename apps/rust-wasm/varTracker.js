export default class VarTracker {
	constructor() {
		this.counter = 0;
		this.rows = 0;
	}

	setCounter() {
		this.counter += 1;
	}
	setRows(rows) {
		this.rows = rows;
	}

	getRows() {
		return this.rows;
	}

	getCounter() {
		return this.counter;
	}
}
