import mapboxgl from "mapbox-gl";

async function esriStyle() {
  // Adapted from https://gist.github.com/jgravois/51e2b30e3d6cf6c00f06b263a29108a2

  // https://esri.com/arcgis-blog/products/arcgis-living-atlas/mapping/new-osm-vector-basemap
  const styleUrl =
    "https://www.arcgis.com/sharing/rest/content/items/3e1a00aeae81496587988075fe529f71/resources/styles/root.json";

  // first fetch the esri style file
  // https://www.mapbox.com/mapbox-gl-js/style-spec
  const response = await fetch(styleUrl);
  const style = await response.json();
  // next fetch metadata for the raw tiles
  const metadataUrl = style.sources.esri.url;
  const metadataResponse = await fetch(metadataUrl);
  const metadata = await metadataResponse.json();

  function format(style, metadata, styleUrl) {
    // ArcGIS Pro published vector services dont prepend tile or tileMap urls with a /
    style.sources.esri = {
      type: "vector",
      scheme: "xyz",
      tilejson: metadata.tilejson || "2.0.0",
      format: (metadata.tileInfo && metadata.tileInfo.format) || "pbf",
      /* mapbox-gl-js does not respect the indexing of esri tiles
      because we cache to different zoom levels depending on feature density, in rural areas 404s will still be encountered.
      more info: https://github.com/mapbox/mapbox-gl-js/pull/1377
      */
      // index: metadata.tileMap ? style.sources.esri.url + '/' + metadata.tileMap : null,
      maxzoom: 15,
      tiles: [style.sources.esri.url + "/" + metadata.tiles[0]],
      description: metadata.description,
      name: metadata.name,
    };
    return style;
  }

  return format(style, metadata, styleUrl);
}

const LATITUDE = "lat";
const LONGITUDE = "lng";
const RADIUS = "radius";
const FILL = "fill";

const DEFAULT_RADIUS = 2;
const DEFAULT_FILL = "#ff0000";

function getBounds(values, columnMap) {
  let minLng = null;
  let maxLng = null;
  let minLat = null;
  let maxLat = null;

  const latIdx = columnMap[LATITUDE];
  const lngIdx = columnMap[LONGITUDE];

  for (let i = 0; i < values.length; i++) {
    const lng = parseFloat(values[i][lngIdx]);
    const lat = parseFloat(values[i][latIdx]);

    if (minLng == null || lng < minLng) {
      minLng = lng;
    }

    if (maxLng == null || lng > maxLng) {
      maxLng = lng;
    }

    if (minLat == null || lat < minLat) {
      minLat = lat;
    }

    if (maxLat == null || lat > maxLat) {
      maxLat = lat;
    }
  }

  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ];
}

export async function makeMap(container, columns, values, zoom = 11) {
  const columnMap = {};
  columns.forEach((c, i) => (columnMap[c] = i));
  const latIdx = columnMap[LATITUDE];
  const lngIdx = columnMap[LONGITUDE];
  if (latIdx == null || lngIdx == null) return null;

  const radiusIdx = columnMap[RADIUS];
  const fillIdx = columnMap[FILL];

  const circleRadius =
    radiusIdx == null ? DEFAULT_RADIUS : ["get", `${radiusIdx}`];
  const circleFill = fillIdx == null ? DEFAULT_FILL : ["get", `${fillIdx}`];

  const map = new mapboxgl.Map({
    container,
    style: await esriStyle(),
    customAttribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, map layer by Esri',
    zoom,
  });

  map.on("load", () => {
    console.log(getBounds(values, columnMap));
    map.fitBounds(getBounds(values, columnMap), {
      padding: 20,
      duration: 0,
    });
    map.addSource("coords", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: values.map((x) => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [x[lngIdx], x[latIdx]],
          },
          properties: x,
        })),
      },
    });
    map.addLayer({
      id: "coords",
      type: "circle",
      source: "coords",
      paint: {
        "circle-radius": circleRadius,
        "circle-color": circleFill,
      },
    });
  });

  return map;
}
