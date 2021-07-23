<script>
  import { createEventDispatcher, onMount } from "svelte";
  import Map from "@/components/Map";
  import Table from "@/components/Table";

  const dispatch = createEventDispatcher();

  export let db;
  export let query;

  let results = null;
  let running = false;

  function runQuery() {
    running = true;
    results = db.exec(query);
    console.log(results);
    running = false;
    dispatch("done", query);
  }

  onMount(() => {
    runQuery();
  });
</script>

<style lang="scss">
  .query {
    border: solid 1px rgba(255, 255, 255, 0.201);
    padding: 20px 10px;
    margin: 10px 0;
    box-sizing: border-box;
  }
</style>

<div class="query">
  {#if results != null}
    {#each results as resultTable}
      <div><code>{query}</code></div>
      <div>Row count: {resultTable.values.length}</div>
      <Map columns={resultTable.columns} values={resultTable.values} />
      <Table columns={resultTable.columns} values={resultTable.values} />
    {/each}
  {/if}
</div>
