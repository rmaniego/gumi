<script lang="ts">
/* https://docs.aws.amazon.com/prescriptive-guidance/latest/best-practices-cdk-typescript-iac/typescript-best-practices.html */
/* https://github.com/bevacqua/dragula/issues/602#issuecomment-477734315 */
if (typeof (window as any).global === "undefined") {
  (window as any).global = window;
}
</script>

<template>
    <client-only>
        <div class="gm-theater">
          <div id="gmMap" class="gm-map" @click="addMarker"></div>
        </div>
    </client-only>
</template>

<script lang="ts" setup>

// https://docs.maptiler.com/leaflet/examples/npm-get-started/
import L from "leaflet";

// https://nuxt.com/modules/nuxt3-leaflet
import 'leaflet/dist/leaflet.css'
import "@maptiler/sdk/dist/maptiler-sdk.css";

const runTimeConfig = useRuntimeConfig()
const MAPTILER = process.env.VERCEL_ENV === 'production'
        ? process.env.NUXT_ENV_MAPTILER
        : runTimeConfig.public.maptiler;

const mapName = "Satellite"
const mapURL = `https://api.maptiler.com/tiles/satellite-v2/{z}/{x}/{y}.jpg?key=${MAPTILER}`
const mapAttribution = "\u003ca href=\"https://www.maptiler.com/copyright/\" target=\"_blank\"\u003e\u0026copy; MapTiler\u003c/a\u003e \u003ca href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\"\u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e";
const mapCenter: L.LatLngExpression = [10.6521, 124.8526]
var mapZoom = 12

var gmMap: L.Map;
const customPolygon: [number, number][] = [];
var newPolygon: L.Polygon | null  = null;

onMounted(() => {
  setTimeout(() => {
    const map = document.getElementById('gmMap') as HTMLElement;
    gmMap = L.map(map).setView(mapCenter, mapZoom);

      console.log(mapURL)
    L.tileLayer(mapURL, {
      attribution: mapAttribution,
    }).addTo(gmMap);

    gmMap.on('click', function(ev) {
      const coordinates = ev.latlng
      const newMarker: [number, number] = [coordinates!.lat, coordinates!.lng]
      customPolygon.push(newMarker)
      if (newPolygon !== null) newPolygon.remove()
      newPolygon = L.polygon(customPolygon, {color: 'black'}).addTo(gmMap);
      // gmMap.fitBounds(newPolygon.getBounds());
    });
  }, 0.5)
})

</script>

<style scoped>

* {
    box-sizing: border-box;
}

body {
  margin: 0 !important;
  padding: 0;
}

.gm-map {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}



</style>