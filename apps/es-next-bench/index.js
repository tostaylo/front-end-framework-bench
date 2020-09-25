"use strict";
const words = [
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
let counter = 0;
(function run() {
    const root = document.getElementById('root');
    const header = document.createElement('header');
    const main = document.createElement('div');
    main.id = 'main';
    main.className = 'main';
    root === null || root === void 0 ? void 0 : root.appendChild(main);
    main.appendChild(header);
    const h1 = document.createElement('h1');
    h1.innerText = 'es-next-bench';
    const k_button = document.createElement('button');
    k_button.id = 'create1000';
    k_button.innerText = 'Create K';
    const ten_k_button = document.createElement('button');
    ten_k_button.id = 'create10000';
    ten_k_button.innerText = 'Create 10K';
    const clear_button = document.createElement('button');
    clear_button.id = 'clear';
    clear_button.innerText = 'Clear';
    k_button.addEventListener('click', () => createTable(1000));
    ten_k_button.addEventListener('click', () => createTable(10000));
    clear_button.addEventListener('click', () => {
        var _a;
        (_a = document.querySelector('table')) === null || _a === void 0 ? void 0 : _a.remove();
    });
    header.appendChild(h1);
    header.appendChild(k_button);
    header.appendChild(ten_k_button);
    header.appendChild(clear_button);
})();
function createTable(rows) {
    var _a;
    const oldTable = document.querySelector('table');
    (_a = oldTable === null || oldTable === void 0 ? void 0 : oldTable.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(oldTable);
    const table = document.createElement('table');
    const tableBody = document.createElement('tbody');
    for (let i = 0; i < rows; i++) {
        const idx = i <= 14 ? i + 14 + counter : i + counter;
        const row = document.createElement('tr');
        const data1 = document.createElement('td');
        const data2 = document.createElement('td');
        data1.innerText = i.toString();
        data2.innerText = `${words[idx % 12]} ${words[idx % 13]} ${words[idx % 14]}`;
        row.appendChild(data1);
        row.appendChild(data2);
        tableBody.appendChild(row);
    }
    const root = document.getElementById('main');
    table.appendChild(tableBody);
    root === null || root === void 0 ? void 0 : root.appendChild(table);
    counter += counter + 1;
}
