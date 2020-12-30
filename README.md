# Front-End Framework Bench

Welcome to the project landing page for [Front-End Framework Bench](https://github.com/tostaylo/front-end-framework-bench), an automated testing suite focused on comparing performance of client-side frameworks. The project utilizes [Puppeteer](https://github.com/puppeteer/puppeteer) to simulate user input (mouse clicks for example) and [Google Chrome Developer Tools Performance Timeline](https://developers.google.com/web/tools/chrome-devtools/evaluate-performance/reference) traces to analyze and record timings of the interaction.

## Methodology

I'll be the first to admit these tests will not hold up to scientific scrutiny. For one, I wrote the app for each framework being tested, and I'm no expert with any of them. There are at least two concerns. One is utilizing each framework to maximize performance. The other being the most desired idiomatic representation of the specific framework's code. I addressed neither concern. Instead, I built each app to be as similar as possible with a minimalist approach.

Each app was built to output identical HTML structure and request the same CSS file. Timings were averaged out of 12 runs throwing out the lowest two scores.

The apps were built to simply create, update, or delete HTML Table element rows. I acknowledge these actions are far from what most robust client-side applications require.

### Environment

- MacBook Pro (Retina, 15-inch, Mid 2015)
- 2.5GHz Quad-Core Intel Core i7 Processor
- 16GB 1600 MHz DDR3 Memory
- Chrome version - HeadlessChrome/86.0.4240.0

### Disclaimer

One of the featured frameworks is [rust-fel](https://github.com/tostaylo/rust-fel) (Rust Front-End-Library). I produced this library as an experiment. Front-End Framework Bench was an avenue to satisfy my curiosity on how it compared to other client-side library/frameworks.

Front-End Framework Bench was inspired by [JS-Framework-Bench](https://github.com/krausest/js-framework-benchmark). All credit goes to the owners of that repository.

### Frameworks

- React
- Vue
- Javascript (no framework)
- Rust-fel
- Rust-wasm (no framework)
- Web Components
- Svelte


### Requirements to run Front-End Framework Bench Locally

- Rust
- Node
- NPM

1. Navigate to the `trace-generator` directory and `npm install`
2. Navigate to the `trace-processor` directory and `cargo build`
3. From the project root run `sh build.sh`

### Add a Framework

Put your app in the `apps` directory.

The minimum required html for your app should look like the below.

Body

```
<body>
  <div id="main" class="main">
    <header>
      <h1>vue-bench</h1>
      <button id="create1000">CreateK</button> <button id="create10000">Create10K</button> <button id="clear">Clear</button>
      <button id="update">Update</button>
      </header>
<!--Table will be appended here --!>
  </div>
  <script src="./apps/vue/index.js" type="module"><script>
</body>
```

Table

```
<table id="table">
  <tbody>
   <tr>
    <td> 1. </td>
      <!-- Three random words !-->
    <td> Random Word String </td>
   </tr>
  </tbody>
</table>
```

### Metrics

```
{
"k": {
  "display_name": "Create One Thousand Rows",
  "definition": "Measures the duration of creating 1,000 table rows. Each row is populated with three random words, each wrapped in a 'td', picked from a list of ~10 words. Total DOM nodes ~ 3,000"
},
"ten-k": {
  "display_name": "Create Ten Thousand Rows",
  "definition": "Measures the duration of creating 10,000 table rows. Each row is populated with three random words, each wrapped in a 'td', picked from a list of ~10 words. Total DOM nodes ~ 30,000"
},
"update-k": {
  "display_name": "Update One Thousand Rows",
  "definition": "Measures the duration of updating every 10th row of 1,000 rows with the text 'We Are Updated'"
},
"update-ten-k": {
  "display_name": "Update Ten Thousand Rows",
  "definition": "Measures the duration of updating every 10th row of 10,000 rows with the text 'We Are Updated'"
},
"clear-k": {
  "display_name": "Clear One Thousand Rows",
  "definition": "Measures the duration of clearing the table with 1,000 rows"
},
"clear-ten-k": {
  "display_name": "Clear Ten Thousand Rows",
  "definition": "Measures the duration of clearing the table with 10,000 rows"
 }
}

```

### Timings

```
{
"timing_type": {
"display_name": "Metric",
"definition": "The metric being tested."
},
"timing_framework": {
"display_name": "Framework",
"definition": "The framework being tested."
},
"total_dur": {
"display_name": "Total Duration",
"definition": "The total duration of the user interaction event, code execution, and the browser's rendering process. Click Duration + Render After Click."
},
"click_dur": {
"display_name": "Click Duration",
"definition": "The duration of the user interaction and the resulting code execution."
},
"render_during_click": {
"display_name": "Render During Click",
"definition": "The duration of the browser's rendering process while code is being executed from the user interaction. This timing is not calculated in the Total Duration."
},
"render_after_click": {
"display_name": "Render After Click",
"definition": "The duration of the browser's rendering process after the user interaction and code execution is complete."
  }
}
```
