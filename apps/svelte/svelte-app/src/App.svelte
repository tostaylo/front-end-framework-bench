<script>
  let isUpdate = false;
  let counter = 0;
  let tableLength = 0;
  const words = [
    "There",
    "High",
    "Lizards",
    "Sappy",
    "Wreck",
    "Fairly",
    "Barking",
    "Lurching",
    "Carbs",
    "Flat",
    "Hard",
    "Sad",
    "Butterfly",
    "Bandana",
  ];

  function handleCreateClear(len) {
    isUpdate = false;
    tableLength = len;
    counter = counter + 1;
  }

  function getIndex(num) {
    return num <= 14 ? num + 14 + counter : num + counter;
  }

  function add1(one) {
    return one + 1;
  }
</script>

<div id="main" class="main">
  <header>
    <h1>svelte-bench</h1>
    <button
      id="create1000"
      on:click={() => {
        handleCreateClear(1000);
      }}>CreateK</button>
    <button
      id="create10000"
      on:click={() => {
        handleCreateClear(10000);
      }}>Create10K</button>
    <button
      id="clear"
      on:click={() => {
        handleCreateClear(0);
      }}>Clear</button>
    <button
      id="update"
      on:click={() => {
        isUpdate = true;
      }}>Update</button>
  </header>
  {#if tableLength > 0}
    <table>
      <tbody>
        {#each Array(tableLength) as _, i (i)}
          <tr>
            <td>{add1(i)}</td>
            {#if isUpdate && add1(i) % 10 === 0}
              <td>We are updated</td>
            {:else}
              <td>
                {words[getIndex(add1(i)) % 12]}
                {words[getIndex(add1(i)) % 13]}
                {words[getIndex(add1(i)) % 14]}
              </td>
            {/if}
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>
