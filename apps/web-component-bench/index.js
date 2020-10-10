const styles = `
html,
body {
	margin: 0;
	font-family: Helvetica, Arial, sans-serif;
	box-sizing: border-box;
	-webkit-text-size-adjust: 100%;
	color: white;
	background: black;
}

body {
	padding: 20px;
	display: flex;
	flex-direction: column;
	justify-content: flex-start;
	align-items: center;
	min-height: 120vh;
}

#root {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	width: 100%;
}

.main {
	display: flex;
	flex-direction: column;
	justify-content: center;
	width: 70%;
}

header {
	display: flex;
	justify-content: space-evenly;
	align-items: center;
}

table {
  align-self: center;
	border: 1px solid rgb(236, 235, 235);
	border-collapse: collapse;
	width: 300px;
}

th,
td {
	text-align: left;
	padding: 8px;
}

tr:nth-child(even) {
	background: rgb(102, 102, 102);
}

button {
	cursor: pointer;
	padding: 1em;
	background: rgb(102, 102, 102);
	color: white;
	outline: none;
	border: none;
	border-radius: 3px;
	margin-left: 20px;
}
`;

class MainComponent extends HTMLElement {
	constructor() {
		// Always call super first in constructor
		super();
		this.counter = 0;
		this.words = [
			'There',
			'High',
			'Lizards',
			'Sappy',
			'Wreck',
			'Fairly',
			'Barking',
			'Lurching',
			'Carbs',
			'Flat',
			'Hard',
			'Sad',
			'Butterfly',
			'Bandana',
		];

		// write element functionality in here
	}
	connectedCallback() {
		const shadow = this.attachShadow({ mode: 'open' });
		this.id = 'main';
		this.className = 'main';
		const style = document.createElement('style');
		style.innerHTML = styles;
		this.shadowRoot.appendChild(style);

		const header = document.createElement('header');

		const h1 = document.createElement('h1');
		h1.innerText = 'web-component-bench';

		const k_button = document.createElement('button');
		k_button.id = 'create1000';
		k_button.innerText = 'Create K';

		const ten_k_button = document.createElement('button');
		ten_k_button.id = 'create10000';
		ten_k_button.innerText = 'Create 10K';

		const clear_button = document.createElement('button');
		clear_button.id = 'clear';
		clear_button.innerText = 'Clear';

		k_button.addEventListener('click', () => this.createTable(1000));
		ten_k_button.addEventListener('click', () => this.createTable(10000));
		clear_button.addEventListener('click', () => {
			shadow.querySelector('table')?.remove();
		});

		header.appendChild(h1);
		header.appendChild(k_button);
		header.appendChild(ten_k_button);
		header.appendChild(clear_button);

		shadow.appendChild(header);
	}

	createTable(rows) {
		const oldTable = this.shadowRoot.querySelector('table');
		oldTable?.parentNode?.removeChild(oldTable);

		if (rows > 0) {
			const table = document.createElement('table');
			const tableBody = document.createElement('tbody');

			for (let i = 0; i < rows; i++) {
				const idx = i <= 14 ? i + 14 + this.counter : i + this.counter;
				const row = document.createElement('tr');
				const data1 = document.createElement('td');
				const data2 = document.createElement('td');

				const data1Text = document.createTextNode((1 + i).toString());
				const data2Text = document.createTextNode(
					`${this.words[idx % 12]} ${this.words[idx % 13]} ${this.words[idx % 14]}`
				);

				data1.appendChild(data1Text);
				data2.appendChild(data2Text);
				row.appendChild(data1);
				row.appendChild(data2);
				tableBody.appendChild(row);
			}

			table.appendChild(tableBody);
			this.shadowRoot.appendChild(table);
		}
		this.counter += this.counter + 1;
	}
}

customElements.define('main-component', MainComponent);
