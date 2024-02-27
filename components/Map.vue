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
      <div id="gmMap" class="gm-map"></div>
      <ElIcon color="#409EFC" class="gm-lock" @click="initNewRegion">
        <Check />
      </ElIcon>
    </div>
  </client-only>
</template>

<script lang="ts" setup>
// https://docs.maptiler.com/leaflet/examples/npm-get-started/
// https://element-plus.org/en-US/component/icon.html#icon-collection
import L from "leaflet";
import { ElIcon } from "element-plus";
import { Check } from "@element-plus/icons-vue";

// https://nuxt.com/modules/nuxt3-leaflet
import "leaflet/dist/leaflet.css";
import "@maptiler/sdk/dist/maptiler-sdk.css";

const runTimeConfig = useRuntimeConfig();
const MAPTILER =
  process.env.VERCEL_ENV === "production"
    ? process.env.NUXT_ENV_MAPTILER
    : runTimeConfig.public.maptiler;

const mapName = "Satellite";
const mapURL = `https://api.maptiler.com/tiles/satellite-v2/{z}/{x}/{y}.jpg?key=${MAPTILER}`;
const mapAttribution =
  '\u003ca href="https://www.maptiler.com/copyright/" target="_blank"\u003e\u0026copy; MapTiler\u003c/a\u003e \u003ca href="https://www.openstreetmap.org/copyright" target="_blank"\u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e';
const mapCenter: L.LatLngExpression = [10.72984023054674, 124.79601323604585];
var mapZoom = 20;

type Coordinates = [number, number];
type CoordinatesList = [number, number][];

var gmMap: L.Map;
var customPolygon: CoordinatesList = [];
var newPolygon: L.Polygon | null = null;
var thisPoint: Coordinates | null = null;

var thisRegion = 1;
const customRegions: { [name: string]: CoordinatesList } = {};

const findCoordinateIndex = (target: Coordinates): number => {
  return customPolygon.findIndex(
    (coord) => coord[0] === target[0] && coord[1] === target[1],
  );
};

const deleteCoordinateByIndex = (index: number): void => {
  if (!(index >= 0 && index < customPolygon.length)) return;
  customPolygon.splice(index, 1);
};

onMounted(() => {
  setTimeout(() => {
    const map = document.getElementById("gmMap") as HTMLElement;
    gmMap = L.map(map).setView(mapCenter, mapZoom);

    // console.log(mapURL)
    L.tileLayer(mapURL, {
      attribution: mapAttribution,
    }).addTo(gmMap);

    gmMap.on("click", function (ev) {
      const coordinates = ev.latlng;
      // console.log(coordinates)
      customPolygon.push([coordinates!.lat, coordinates!.lng]);
      if (newPolygon !== null) newPolygon.remove();
      newPolygon = L.polygon(customPolygon, { color: "black" }).addTo(gmMap);
      customRegions[thisRegion.toString()] = customPolygon;
    });
  }, 0.5);
});

async function initNewRegion() {
  if (newPolygon !== null) newPolygon.remove();
  L.polygon(customPolygon, { color: "black" }).addTo(gmMap);
  customPolygon = [];
  thisRegion++;
}
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
  cursor: move;
}

.gm-lock {
  position: fixed;
  margin: 20px;
  padding: 10px;
  right: 20px;
  bottom: 20px;
  height: 50px;
  width: 50px;
  border-radius: 100%;
  background-color: #1e90ff;
  color: #fff;
  cursor: pointer;
  -webkit-box-shadow: 0px 0px 20px 3px rgba(0, 0, 0, 0.5);
  -moz-box-shadow: 0px 0px 20px 3px rgba(0, 0, 0, 0.5);
  box-shadow: 0px 0px 20px 3px rgba(0, 0, 0, 0.5);
}

.gm-lock:hover {
  background-color: #0d80ee;
  -webkit-box-shadow: 0px 0px 20px 3px rgba(0, 0, 0, 0.75);
  -moz-box-shadow: 0px 0px 20px 3px rgba(0, 0, 0, 0.75);
  box-shadow: 0px 0px 20px 3px rgba(0, 0, 0, 0.75);
}
</style>
