<script>
  import { onMount } from "svelte";
  import CanvasTable from "x-canvas-table";

  let canvasContainer = null;

  export let columns;
  export let values;

  onMount(() => {
    const ct = new CanvasTable({
      container: canvasContainer,
      columns: columns.map((c, i) => ({
        title: c,
        dataIndex: i + 1,
      })),
      style: { height: 500, width: "100%" },
    });

    ct.source = values.map((x) => [null, ...x]);
  });
</script>

<div bind:this={canvasContainer} />
