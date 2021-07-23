<script>
  import "codemirror/lib/codemirror.css";
  import "codemirror/theme/blackboard.css";
  import { EditorState, EditorView, basicSetup } from "@codemirror/basic-setup";
  import { oneDark } from "@codemirror/theme-one-dark";
  import { sql, SQLite } from "@codemirror/lang-sql";
  import { onMount } from "svelte";
  import QueryBuilder from "./QueryBuilder.svelte";

  let containerElem = null;
  let editor = null;
  export let schema = {};
  export let db;
  console.log(schema);

  onMount(() => {
    editor = new EditorView({
      state: EditorState.create({
        extensions: [
          basicSetup,
          sql({
            dialect: SQLite,
            schema,
          }),
          oneDark,
        ],
      }),
      parent: containerElem,
    });
  });

  let queries = [];

  function runQuery() {
    queries = [editor.state.doc.toString(), ...queries];
  }
</script>

<style lang="scss">
  :global(.cm-editor) {
    height: 100%;
    font-size: 16px;
    border: solid 1px white;
    margin: 20px 0;
  }

  button {
    margin-top: 20px;
    background: $accent;
    color: $bg;
    font-family: inherit;
    font-size: 16px;
    padding: 0.5em 1em;
    border: none;
  }
</style>

<div style="height: 300px" bind:this={containerElem} />
<div><button on:click={runQuery}>run query</button></div>

<div style="min-height: 100px">
  {#each queries as query (query)}
    <QueryBuilder {db} {query} />
  {/each}
</div>
