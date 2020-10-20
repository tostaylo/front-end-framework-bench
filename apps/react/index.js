'use strict';

function start() {
	const React = window.React;
	const ReactDom = window.ReactDOM;

	class App extends React.Component {
		constructor(props) {
			super(props);
			this.state = {
				isUpdate: false,
				tableRows: 0,
				counter: 0,
				words: [
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
				],
			};
		}

		render() {
			const { tableRows, counter, words, isUpdate } = this.state;

			const h1 = React.createElement('h1', { key: 'h1' }, 'react-bench');
			const kButton = React.createElement(
				'button',
				{
					id: 'create1000',
					key: '1000',
					onClick: () => this.setState({ tableRows: 1000, isUpdate: false, counter: (this.state.counter += 1) }),
				},
				'Create K'
			);

			const tenKButton = React.createElement(
				'button',
				{
					id: 'create10000',
					key: '10000',
					onClick: () => this.setState({ tableRows: 10000, isUpdate: false, counter: (this.state.counter += 1) }),
				},
				'Create 10K'
			);

			const clearButton = React.createElement(
				'button',
				{
					id: 'clear',
					key: '0',
					onClick: () => this.setState({ tableRows: 0, isUpdate: false, counter: (this.state.counter += 1) }),
				},
				'Clear'
			);

			const updateButton = React.createElement(
				'button',
				{
					id: 'update',
					key: '0',
					onClick: () => this.setState({ isUpdate: true }),
				},
				'Update'
			);
			const header = React.createElement('header', { key: 'header' }, [
				h1,
				kButton,
				tenKButton,
				clearButton,
				updateButton,
			]);

			let table;
			if (tableRows > 0) {
				let trows = [];
				for (let i = 1; i <= tableRows; i++) {
					const wordIdx = i <= 14 ? i + 14 + counter : i + counter;
					const wordStr =
						isUpdate && i % 10 === 0
							? 'We are updated'
							: `${words[wordIdx % 12]} ${words[wordIdx % 13]} ${words[wordIdx % 14]}`;

					const td1 = React.createElement('td', { key: i }, i);
					const td2 = React.createElement('td', { key: wordStr }, wordStr);
					const trow = React.createElement('tr', { key: i }, [td1, td2]);

					trows.push(trow);
				}
				const tbody = React.createElement('tbody', null, trows);
				table = React.createElement('table', { key: 'table' }, tbody);
			}

			return React.createElement('div', { id: 'main', className: 'main' }, [header, table]);
		}
	}

	ReactDom.render(React.createElement(App, null, null), document.getElementById('root'));
}

const head = document.querySelector('head');
const reactScript = document.createElement('script');
const reactDomScript = document.createElement('script');
reactScript.src = 'https://unpkg.com/react@16.13.1/umd/react.production.min.js';
reactDomScript.src = 'https://unpkg.com/react-dom@16.13.1/umd/react-dom.production.min.js';
reactScript.crossOrigin = true;
reactDomScript.crossOrigin = true;
head?.appendChild(reactScript);
head?.appendChild(reactDomScript);

reactDomScript.addEventListener('load', start);
