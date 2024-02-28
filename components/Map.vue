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
          <span id="gmThemeCode" class="gm-theme-gem gm-lightning-yellow">&nbsp;</span>
          <span id="gmThemeName" class="gm-theme-name">{{ polygonThemeNames[selectedPolygonTheme] }}</span>
          <ElIcon class="gm-dropdown-icon">
            <ArrowDown />
          </ElIcon>
        </div>
        <div id="gmThemeOptions" class="gm-themes gm-hide">
          <div id="gmTheme0" class="gm-theme gm-theme-option" data-code="cloudy-gray">
            <span class="gm-theme-gem gm-cloud-gray"></span>
            <span class="gm-theme-name" data-code="cloudy-gray">Cloudy Gray</span>
          </div>
          <div id="gmTheme1" class="gm-theme gm-theme-option" data-code="lightning-yellow">
            <span class="gm-theme-gem gm-lightning-yellow"></span>
            <span class="gm-theme-name" data-code="lightning-yellow">Lightning Yellow</span>
          </div>
          <div id="gmTheme2" class="gm-theme gm-theme-option" data-code="old-firebrick">
            <span class="gm-theme-gem gm-old-firebrick"></span>
            <span class="gm-theme-name" data-code="old-firebrick">Old Firebrick</span>
          </div>
          <div id="gmTheme3" class="gm-theme gm-theme-option" data-code="midnight-blue">
            <span class="gm-theme-gem gm-midnight-blue"></span>
            <span class="gm-theme-name" data-code="midnight-blue">Midnight Blue</span>
          </div>
        </div>
      </div>
      <ElIcon id="gmLock" class="gm-lock gm-hide" @click="initNewRegion">
        <Check />
      </ElIcon>
      <div class="copyright">&copy; 2021-present <a href="https://github.com/rmaniego/" class="profile leckerli-one">Rydeon <span class="emoji1">⚡</span><span class="emoji2">✨</span></a></div>
    </div>
  </client-only>
</template>

<script lang="ts" setup>
// https://docs.maptiler.com/leaflet/examples/npm-get-started/
// https://element-plus.org/en-US/component/icon.html#icon-collection
import L, { type LatLngExpression } from "leaflet";
import { ElIcon } from "element-plus";
import { Check, ArrowDown } from "@element-plus/icons-vue";

// https://nuxt.com/modules/nuxt3-leaflet
import "leaflet/dist/leaflet.css";

const runTimeConfig = useRuntimeConfig();
const MAPTILER =
  process.env.VERCEL_ENV === "production"
    ? process.env.NUXT_ENV_MAPTILER
    : runTimeConfig.public.maptiler;

const mapName = "Satellite";
const mapURL = `https://api.maptiler.com/tiles/satellite-v2/{z}/{x}/{y}.jpg?key=${MAPTILER}`;
const mapAttribution =
  '\u003ca href="https://www.maptiler.com/copyright/" target="_blank"\u003e\u0026copy; MapTiler\u003c/a\u003e \u003ca href="https://www.openstreetmap.org/copyright" target="_blank"\u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e';
var mapCenter: L.LatLngExpression = [10.72984023054674, 124.79601323604585];
var mapZoom = 5;

var gmMap: L.Map;
const mapOptions: { [name: string]: any } = {
  minZoom: 4,
  inertia: true,
  worldCopyJump: true
}

var thisRegion = 1;
type PointArray = [number, number][]
var customPolygon: PointArray = []
var newPolygon: L.Polygon | null = null
const customRegions: { [name: string]: PointArray } = {}
const polygonThemes: { [theme: string]: { [key: string]: any }} = {
  "cloudy-gray": {
    stroke: true,
    color: '#333',
    weight: 3,
    opacity: 1.0,
    dashArray: null,
    fill: true,
    fillRule: "nonzero",
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
    fillRule: "nonzero",
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
    fillRule: "nonzero",
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
    fillRule: "nonzero",
    fillColor: '#191970',
    fillOpacity: 0.1
  }
}
var selectedPolygonTheme = "lightning-yellow"
const polygonThemeNames: { [theme: string]: string } = {
  "cloudy-gray": "Cloud Gray",
  "lightning-yellow": "Lightning Yellow",
  "old-firebrick": "Old Firebrick",
  "midnight-blue": "Midnight Blue"
}
var thisPolygonTheme: { [name: string]: any } = { ...polygonThemes[selectedPolygonTheme] }

var newMarker: L.Circle | null = null
const markerTheme: { [name: string]: any } = {
  radius: 5,
  color: '#191970',
  weight: 2,
  fillOpacity: 0.5
}
markerTheme.color = thisPolygonTheme.color
markerTheme.fillColor = thisPolygonTheme.color

onMounted(() => {
  setTimeout(() => {
    const gmTheme = document.getElementById('gmThemeSelected') as HTMLElement;
    const gmThemes = document.getElementById('gmThemeOptions') as HTMLElement;
    const gmThemeCode = document.getElementById('gmThemeCode') as HTMLElement;
    const gmThemeName = document.getElementById('gmThemeName') as HTMLElement;
    const map = document.getElementById("gmMap") as HTMLElement;
    if (gmTheme == null || gmThemes == null || gmThemeCode == null || gmThemeName == null || map == null) return

    // load map data
    gmMap = L.map(map, mapOptions).setView(mapCenter, mapZoom)
    getBrowserLocation()
    L.tileLayer(mapURL, {
      attribution: mapAttribution,
    }).addTo(gmMap);

    gmMap.on("click", function (ev) {
      if (!gmThemes.classList.contains('gm-hide')) {
        gmThemes.classList.add('gm-hide')
        return
      }

      // update region on each new coordinates
      const coordinates = ev.latlng;
      customPolygon.push([coordinates!.lat, coordinates!.lng])
      if (newPolygon !== null) newPolygon.remove();
      if (newMarker !== null) newMarker.remove()
      newPolygon = L.polygon(customPolygon, thisPolygonTheme).addTo(gmMap);
      newMarker = L.circle([coordinates!.lat, coordinates!.lng], markerTheme).addTo(gmMap)
      customRegions[thisRegion.toString()] = customPolygon;

      // auto hide/show lock region
      const gmLock = document.getElementById('gmLock')
      if (gmLock == null) return
      if (customPolygon.length > 2) gmLock.classList.remove('gm-hide')
    });

    gmTheme.addEventListener("click", (_event) => {
      if (gmThemes.classList.contains('gm-hide')) {
        gmThemes.classList.remove('gm-hide')
        return
      }
      gmThemes.classList.add('gm-hide')
    })

    // set listener to all theme color options
    const gmThemeOptions = document.querySelectorAll('.gm-theme-option');
    gmThemeOptions.forEach((option) => {
      option.addEventListener('click', (event: Event) => {
        // get color code
        let colorCode = (event.target as HTMLElement)!.getAttribute('data-code')
        colorCode = colorCode == null ? selectedPolygonTheme : colorCode
        // get color name
        let colorName = (event.target as HTMLElement)!.textContent
        colorName = colorName == null ? polygonThemeNames[selectedPolygonTheme] : colorName

        // update theme selector
        gmThemeName.textContent = colorName.trim()
        gmThemeCode.classList.remove(`gm-${selectedPolygonTheme}`)
        selectedPolygonTheme = colorCode
        
        // update to new color code
        gmThemeCode.classList.add(`gm-${colorCode}`)
        gmThemes.classList.add('gm-hide')

        // update region color
        thisPolygonTheme = { ...polygonThemes[colorCode] }
        markerTheme.color = thisPolygonTheme.color
        markerTheme.fillColor = thisPolygonTheme.color

        // update elements if present
        if (customPolygon.length == 0) return 
        if (newPolygon !== null) newPolygon.remove();
        if (newMarker !== null) newMarker.remove()
        newPolygon = L.polygon(customPolygon, thisPolygonTheme).addTo(gmMap);
        newMarker = L.circle(customPolygon[customPolygon.length-1], markerTheme).addTo(gmMap)
      })
    })
  }, 0.5);
});

async function initNewRegion() {
  if (customPolygon.length < 3) return
  const gmLock = document.getElementById('gmLock')
  if (gmLock == null) return
  
  // let gmRegionCenter = findCentralCoordinate(customPolygon)
  // let gmRegionArea: string = calculatePolygonArea(customPolygon).toFixed(1)
  // var gmArea = L.divIcon({html: `${gmRegionArea} sq. km.`, className: 'gm-region-area'})
  // L.marker(gmRegionCenter, {icon: gmArea}).addTo(gmMap)

  gmLock.classList.add('gm-hide')
  if (newPolygon !== null) newPolygon.remove();
  L.polygon(customPolygon, thisPolygonTheme).addTo(gmMap);
  if (newMarker !== null) newMarker.remove()
  customPolygon = [];
  thisRegion++;

}


function getBrowserLocation() {
  if ("geolocation" in navigator) {
    // Get the current location
    navigator.geolocation.getCurrentPosition(
        (position) => {
            mapCenter = [position.coords.latitude, position.coords.longitude]
            zoomMap(mapZoom)
        }
    );
  }

  function zoomMap(zoom: number) {
    setTimeout(() => {
      gmMap.setView(mapCenter, zoom)

      if (zoom>mapZoom+10) return
      // console.log(zoom)
      return zoomMap(zoom+1)
    }, 200)
  }
}

function calculatePolygonArea(coords: [number, number][]): number {
    let area: number = 0;
    const n: number = coords.length;

    for (let i: number = 0; i < n - 1; i++) {
        area += coords[i][0] * coords[i + 1][1] - coords[i + 1][0] * coords[i][1];
    }

    area += coords[n - 1][0] * coords[0][1] - coords[0][0] * coords[n - 1][1];

    area = ((Math.abs(area) / 2.0) * 111320 ) / 1000000;
    console.log(area)

    return area
}

function findCentralCoordinate(coordinates: [number, number][]): [number, number] {
    const numCoordinates: number = coordinates.length;

    let sumLatitude: number = 0;
    let sumLongitude: number = 0;

    for (const [longitude, latitude] of coordinates) {
        sumLatitude += latitude;
        sumLongitude += longitude;
    }

    const averageLatitude: number = sumLatitude / numCoordinates;
    const averageLongitude: number = sumLongitude / numCoordinates;

    return [averageLongitude, averageLatitude];
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
  background-color: #222;
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
  width: 7px;
  height: 7px;
  border: 1px solid rgba(255, 255, 255, 0.1);
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

.gm-themes {
  position: fixed;
  top: 0px;
  right: 0px;
  width: 200px;
  margin: 50px 10px 0 0;
  padding: 8px 8px 5px 8px;
  color: #fff;
  background-color: #222;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 8px;
  cursor: pointer;
}

.gm-theme {
  margin-bottom: 5px;
  padding: 7px 10px;
  height: 30px;
  border-radius: 5px;
}

.gm-theme:hover {
  background-color: #444;
}

.gm-region-area {
  padding: 2px 3px;
  width: 50px;
  background-color: #fff !important;
  border-radius: 3px;
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

.copyright {
	position: fixed;
	padding: 10px; 
	width: 100%;
	color: rgba(0, 0, 0, 0.7);
	text-align: center;
	font-size: 0.7em;
	bottom: 0px;
}

.profile {
	padding: 3px 5px 3px 8px;
	color: #fff;
	background-color: #382f66;
  font-family: "Leckerli One", cursive;
  font-weight: 400;
  font-style: normal;
	text-decoration: none;
	border-radius: 8px;
}

.profile:hover {
	color: #111 !important;
	background-color: #e1b403 !important;
	-webkit-box-shadow: 0px 0px 5px 0px rgba(204,180,0,1);
	-moz-box-shadow: 0px 0px 5px 0px rgba(204,180,0,1);
	box-shadow: 0px 0px 5px 0px rgba(204,180,0,1);
	transition: color 0.5, background-color 0.5s, box-shadow 0.5s;
}

.emoji1 {
	margin-left: -3px;
}

.emoji2 {
	margin-left: -6px;
}

</style>
