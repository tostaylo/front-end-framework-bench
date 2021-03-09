import styles from '../../trace-generator/scripts/css.js';

class MainComponent extends HTMLElement {
	constructor() {
		super();
		this.rows = 0;
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
		k_button.addEventListener('click', () => this.createTable(1000));

		const ten_k_button = document.createElement('button');
		ten_k_button.id = 'create10000';
		ten_k_button.innerText = 'Create 10K';
		ten_k_button.addEventListener('click', () => this.createTable(10000));

		const clear_button = document.createElement('button');
		clear_button.id = 'clear';
		clear_button.innerText = 'Clear';
		clear_button.addEventListener('click', () => {
			this.rows = 0;
			shadow.getElementById('table')?.remove();
		});

		const update_button = document.createElement('button');
		update_button.id = 'update';
		update_button.innerText = 'Update';
		update_button.addEventListener('click', this.updateTableData);

		header.appendChild(h1);
		header.appendChild(k_button);
		header.appendChild(ten_k_button);
		header.appendChild(clear_button);
		header.appendChild(update_button);

		shadow.appendChild(header);
	}

	createTable = (rows) => {
		this.rows = rows;
		this.counter += 1;

		const oldTable = this.shadowRoot.getElementById('table');
		oldTable?.parentNode?.removeChild(oldTable);

		if (rows > 0) {
			const table = document.createElement('table');
			table.id = 'table';
			const tableBody = document.createElement('tbody');

			for (let i = 1; i <= rows; i++) {
				const idx = i <= 14 ? i + 14 + this.counter : i + this.counter;
				const row = document.createElement('tr');
				const data1 = document.createElement('td');
				const data2 = document.createElement('td');
				data2.id = `td${i}`;

				const data1Text = document.createTextNode(i.toString());
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
	};

	updateTableData = () => {
		for (let i = 1; i <= this.rows; i++) {
			if (i % 10 === 0) {
				this.shadowRoot.getElementById(`td${i}`).innerText = 'We are updated';
			}
		}
	};
}

customElements.define('main-component', MainComponent);
