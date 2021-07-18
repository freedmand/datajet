<script>
  import { createEventDispatcher } from "svelte";
  import Table from "@/components/Table";

  const dispatch = createEventDispatcher();

  export let db;
  export let query;

  let results = null;
  let running = false;

  $: disabledButton = running || query.trim().length == 0 || results != null;

  function runQuery() {
    running = true;
    results = db.exec(query);
    console.log(results);
    running = false;
    dispatch("done", query);
  }
</script>

<style lang="scss">
  textarea {
    width: 100%;
    max-width: 600px;
  }

  .query {
    border: solid 1px gainsboro;
    padding: 20px 10px;
    box-sizing: border-box;
  }
</style>

<div class="query">
  <div>
    <textarea
      disabled={running || results != null}
      placeholder="Enter SQLite query"
      bind:value={query}
    />
  </div>
  {#if results == null}
    <button on:click={runQuery} disabled={disabledButton}>Run query</button>
  {/if}

  {#if results != null}
    {#each results as resultTable}
      <div>Row count: {resultTable.values.length}</div>
      <Table columns={resultTable.columns} values={resultTable.values} />
    {/each}
  {/if}
</div>
