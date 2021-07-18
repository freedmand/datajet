<script>
  import initSqlJs from "sql.js";
  import { SQL, dbFile, db, tables, table, tableRows } from "@/stores/data";

  import QueryBuilder from "@/components/QueryBuilder";

  import sqlWasm from "!!file-loader?name=sql-wasm-[contenthash].wasm!sql.js/dist/sql-wasm.wasm";

  import { onMount } from "svelte";
  import { get } from "svelte/store";

  onMount(async () => {
    SQL.set(await initSqlJs({ locateFile: () => sqlWasm }));
  });

  function openDb(file) {
    const _SQL = get(SQL);
    if (_SQL == null) return;

    // Read file input into database
    const fileReader = new FileReader();
    if (fileReader) {
      fileReader.onload = () => {
        const buffer = fileReader.result;
        const array = new Uint8Array(buffer);
        // Set the database to the raw file contents
        dbFile.set(array);
      };
      fileReader.readAsArrayBuffer(file);
    }
  }

  function handleFile(e) {
    if (e.target.files.length == 1) {
      // Select file
      openDb(e.target.files[0]);
    }

    // Reset the file input
    e.target.value = "";
  }

  let queries = [{ idx: 0, text: null }];

  function pushQuery(e) {
    queries[0].text = e.detail;
    queries = [
      {
        idx: queries.length,
        text: e.detail,
      },
      ...queries,
    ];
  }
</script>

<h1>DataJet</h1>

{#if $SQL == null}
  <!-- Show loading -->
  <p>Loading...</p>
{:else if $db == null}
  <!-- Show database loader -->
  <p>Select a sqlite database file</p>
  <input type="file" on:change={handleFile} />
{:else if $tables != null && $table == null}
  <!-- Show tables -->
  <h2>Select a table</h2>

  {#each $tables as tableName}
    <button on:click={() => table.set(tableName)}>
      <h3>{tableName}</h3>
      {#if $tableRows[tableName] != null}
        <p>Row count: {$tableRows[tableName].toLocaleString()}</p>
      {/if}
    </button>
  {/each}
{:else}
  <h2>{$table}</h2>
  {#if $tableRows[$table] != null}
    <p>Row count: {$tableRows[$table].toLocaleString()}</p>
  {/if}
  {#each queries as query (query.idx)}
    <QueryBuilder
      query={query.text || `SELECT * from ${$table} LIMIT 10`}
      on:done={pushQuery}
      table={$table}
      db={$db}
    />
  {/each}
{/if}

<hr />

{#if $table != null}
  <button on:click={() => table.set(null)}>Back to tables</button>
{/if}
{#if $dbFile != null}
  <button
    on:click={() =>
      prompt("Clear file selection? Type 'confirm'") == "confirm" &&
      dbFile.set(null)}>Clear file</button
  >
{/if}
