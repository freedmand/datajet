<script>
  import { makeMap } from "@/lib/map";
  import { onMount } from "svelte";

  let mapElem = null;
  export let columns;
  export let values;

  onMount(async () => {
    const map = await makeMap(mapElem, columns, values);
    if (map != null) {
      mapElem.style.height = "600px";
      map.resize();
    }
  });
</script>

<div bind:this={mapElem} />
