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
      <div class="nav-brand">
        <a href="/">GuMi</a>
      </div>
      <div id="gmMap" class="gm-map"></div>
      <div id="gmControls" class="gm-controls">
        <div id="gmThemeSelected" class="gm-dropdown">
          <span class="gm-theme-gem gm-lightning-yellow">&nbsp;</span>
          <span class="gm-theme-name">{{ polygonThemeNames[selectedPolygonTheme] }}</span>
          <ElIcon class="gm-dropdown-icon">
            <ArrowDown />
          </ElIcon>
        </div>
        <div id="gmThemeOptions" class="gm-themes">
          <div id="gmTheme0" class="gm-theme" data-code="cloudy-gray">
            <span class="gm-theme-color cloud-gray"></span>
            <span class="gm-theme0-name">Cloudy Gray</span>
          </div>
          <div id="gmTheme1" class="gm-theme" data-code="lightning-yellow">
            <span class="gm-theme-color lightning-yellow"></span>
            <span class="gm-theme-name">Cloudy Gray</span>
          </div>
          <div id="gmTheme2" class="gm-theme" data-code="old-firebrick">
            <span class="gm-theme-color old-firebrick"></span>
            <span class="gm-theme-name">Old Firebrick</span>
          </div>
          <div id="gmTheme3" class="gm-theme" data-code="midnight-blue">
            <span class="gm-theme-color midnight-blue"></span>
            <span class="gm-theme-name">Midnight Blue</span>
          </div>
        </div>
      </div>
      <ElIcon id="gmLock" class="gm-lock gm-hide" @click="initNewRegion">
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
import { Check, ArrowDown } from "@element-plus/icons-vue";

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

var gmMap: L.Map;
var thisRegion = 1;
type PointArray = [number, number][];
var customPolygon: PointArray = [];
var newPolygon: L.Polygon | null = null;
const customRegions: { [name: string]: PointArray } = {};
const polygonThemes: { [theme: string]: { [key: string]: any }} = {
  "cloudy-gray": {
    stroke: true,
    color: '#333',
    weight: 3,
    opacity: 1.0,
    dashArray: null,
    fill: true,
    fillColor: '#333',
    fillOpacity: 0.2
  },
  "lightning-yellow": {
    stroke: true,
    color: '#f5a623',
    weight: 2,
    opacity: 1.0,
    dashArray: '5 3',
    fill: true,
    fillColor: '#f5a623',
    fillOpacity: 0.1
  },
  "old-firebrick": {
    stroke: true,
    color: '#b22222',
    weight: 3,
    opacity: 1.0,
    dashArray: '4',
    fill: true,
    fillColor: '#b22222',
    fillOpacity: 0.1
  },
  "midnight-blue": {
    stroke: true,
    color: '#191970',
    weight: 2,
    opacity: 0.8,
    dashArray: '3 5',
    fill: true,
    fillColor: '#191970',
    fillOpacity: 0.1
  }
}
var selectedPolygonTheme = "lightning-yellow";
const polygonThemeNames: { [theme: string]: string } = {
  "cloudy-gray": "Cloud Gray",
  "lightning-yellow": "Lightning Yellow",
  "old-firebrick": "Old Firebrick",
  "midnight-blue": "Midnight Blue"
}
var thisPolygonTheme: { [name: string]: any } = { ...polygonThemes[selectedPolygonTheme] }

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
      newPolygon = L.polygon(customPolygon, thisPolygonTheme).addTo(gmMap);
      customRegions[thisRegion.toString()] = customPolygon;

      const gmLock = document.getElementById('gmLock')
      if (gmLock == null) return
      if (customPolygon.length > 2) gmLock.classList.remove('gm-hide')
    });
  }, 0.5);
});

async function initNewRegion() {
  const gmLock = document.getElementById('gmLock')
  if (gmLock == null) return

  gmLock.classList.add('gm-hide')
  if (newPolygon !== null) newPolygon.remove();
  L.polygon(customPolygon, thisPolygonTheme).addTo(gmMap);
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

.nav-brand {
  position: fixed;
  top: 0;
  left: 0;
  margin: 10px 0 0 70px;
  z-index: 100;
}

.nav-brand a {
  font-family: "Micro 5", sans-serif;
  font-size: 72px;
  font-weight: 400;
  font-style: normal;
  text-decoration: none;
  color: #fff;
}

.gm-map {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  cursor: move;
}
.gm-dropdown {
  position: fixed;
  top: 0px;
  right: 0px;
  width: 200px;
  margin: 10px;
  padding: 8px 12px;
  color: #fff;
  background-color: #333;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 8px;
  cursor: pointer;
}

.gm-dropdown:hover {
  background-color: #444;
}

.gm-theme-gem {
  position: absolute;
  margin-top: 5px;
  width: 6px;
  height: 6px;
  border-radius: 100%;
}

.gm-theme-name {
  position: absolute;
  margin-left: 12px;
  padding: 2px 0;
  font-family: "Roboto", sans-serif;
  font-style: normal;
  font-size: 12px;
}

.gm-dropdown-icon {
  width: 16px;
  height: 16px;
  float: right;
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

.gm-hide {
  display: none;
}

.gm-cloud-gray {
  background-color: #333;
}

.gm-lightning-yellow {
  background-color: #f5a623;
}

.gm-old-firebrick {
  background-color: #b22222;
}

.gm-midnight-blue {
  background-color: #191970;
}

</style>
