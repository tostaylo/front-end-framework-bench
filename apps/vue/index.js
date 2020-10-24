'use strict';

const App = {
	name: 'App',
	data() {
		return {
			isUpdate: false,
			counter: 0,
			tableLength: 0,
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
	},

	methods: {
		handleCreateClear: function (len) {
			this.isUpdate = false;
			this.tableLength = len;
			this.counter = this.counter += 1;
		},
		getIndex: function (num) {
			return num <= 14 ? num + 14 + this.counter : num + this.counter;
		},
		setIsUpdate: function () {
			this.isUpdate = true;
		},
	},

	template: `
    <div id="main" class="main">
      <header>
	      <h1>vue-bench</h1>
        <button id="create1000" v-on:click="() => handleCreateClear(1000)">CreateK</button>
        <button id="create10000" v-on:click="() => handleCreateClear(10000)">Create10K</button>
        <button id="clear" v-on:click="() => handleCreateClear(0)">Clear</button>
        <button id="update" v-on:click="setIsUpdate">Update</button>
      </header>
      <table v-if="tableLength > 0">
        <tbody>
          <tr v-for="(n) in tableLength" :key=n>
            <td>{{n}}</td>
            <td v-if="isUpdate && n % 10 === 0">We are updated</td>
            <td v-else>{{ words[getIndex(n) % 12]}} {{words[getIndex(n) % 13]}} {{words[getIndex(n) % 14]}}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
};

function mountApp() {
	new Vue({ render: (h) => h(App) }).$mount('#root');
}

const head = document.querySelector('head');
const vueScript = document.createElement('script');
vueScript.src = 'https://cdn.jsdelivr.net/npm/vue@2.6.12';
// Dev
// vueScript.src = 'https://cdn.jsdelivr.net/npm/vue/dist/vue.js';
head?.appendChild(vueScript);

vueScript.addEventListener('load', mountApp);
