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
        <img
          class="gm-brand-logo"
          src="/adventurer.png"
          width="40px"
          height="40px"
        />
        <a href="/">GuMi</a>
      </div>
      <div id="gmMap" class="gm-map"></div>
      <div id="gmControls" class="gm-controls">
        <div id="gmThemeSelected" class="gm-dropdown">
          <span
            id="gmThemeCode"
            :class="`gm-theme-gem gm-${selectedPolygonTheme}`"
            >&nbsp;</span
          >
          <span id="gmThemeName" class="gm-theme-name">{{
            polygonThemeNames[selectedPolygonTheme]
          }}</span>
          <ElIcon class="gm-dropdown-icon">
            <ArrowDown />
          </ElIcon>
        </div>
        <div id="gmThemeOptions" class="gm-themes gm-hide">
          <div
            id="gmTheme0"
            class="gm-theme gm-theme-option"
            data-code="old-black"
          >
            <span class="gm-theme-gem gm-old-black"></span>
            <span class="gm-theme-name" data-code="Old Black">Cloudy Gray</span>
          </div>
          <div
            id="gmTheme1"
            class="gm-theme gm-theme-option"
            data-code="cloudy-gray"
          >
            <span class="gm-theme-gem gm-cloudy-gray"></span>
            <span class="gm-theme-name" data-code="cloudy-gray"
              >Cloudy Gray</span
            >
          </div>
          <div
            id="gmTheme2"
            class="gm-theme gm-theme-option"
            data-code="lightning-yellow"
          >
            <span class="gm-theme-gem gm-lightning-yellow"></span>
            <span class="gm-theme-name" data-code="lightning-yellow"
              >Lightning Yellow</span
            >
          </div>
          <div
            id="gmTheme3"
            class="gm-theme gm-theme-option"
            data-code="electric-yellow"
          >
            <span class="gm-theme-gem gm-electric-yellow"></span>
            <span class="gm-theme-name" data-code="electric-yellow"
              >Electric Yellow</span
            >
          </div>
          <div
            id="gmTheme4"
            class="gm-theme gm-theme-option"
            data-code="bright-green"
          >
            <span class="gm-theme-gem gm-bright-green"></span>
            <span class="gm-theme-name" data-code="bright-green"
              >Bright Yellow</span
            >
          </div>
          <div
            id="gmTheme5"
            class="gm-theme gm-theme-option"
            data-code="basic-blue"
          >
            <span class="gm-theme-gem gm-basic-blue"></span>
            <span class="gm-theme-name" data-code="basic-blue">Basic Blue</span>
          </div>
          <div
            id="gmTheme6"
            class="gm-theme gm-theme-option"
            data-code="just-red"
          >
            <span class="gm-theme-gem gm-just-red"></span>
            <span class="gm-theme-name" data-code="just-red">Just Red</span>
          </div>
          <div
            id="gmTheme7"
            class="gm-theme gm-theme-option"
            data-code="old-firebrick"
          >
            <span class="gm-theme-gem gm-old-firebrick"></span>
            <span class="gm-theme-name" data-code="old-firebrick"
              >Old Firebrick</span
            >
          </div>
        </div>
      </div>
      <ElIcon id="gmLock" class="gm-lock gm-hide" @click="initNewRegion">
        <Check />
      </ElIcon>
      <div class="copyright">
        &copy; 2024
        <a href="https://github.com/rmaniego/" class="profile leckerli-one"
          >Rydeon <span class="emoji1">⚡</span
          ><span class="emoji2">✨</span></a
        >
      </div>
    </div>
  </client-only>
</template>

<script lang="ts" setup>
// https://docs.maptiler.com/leaflet/examples/npm-get-started/
// https://element-plus.org/en-US/component/icon.html#icon-collection
import { ElIcon } from "element-plus";
import L, { tooltip, type LatLngExpression } from "leaflet";
import { Check, ArrowDown } from "@element-plus/icons-vue";

// https://nuxt.com/modules/nuxt3-leaflet
import "leaflet/dist/leaflet.css";
// import geojson from '~/assets/gabas.latest.json'
import geojson from "~/assets/gabas.latest.json";

const runTimeConfig = useRuntimeConfig();
const MAPTILER =
  process.env.VERCEL_ENV === "production"
    ? process.env.NUXT_ENV_MAPTILER
    : runTimeConfig.public.maptiler;

const mapURL = `https://api.maptiler.com/tiles/satellite-v2/{z}/{x}/{y}.jpg?key=${MAPTILER}`;
const mapAttribution =
  '\u003ca href="https://www.maptiler.com/copyright/" target="_blank"\u003e\u0026copy; MapTiler\u003c/a\u003e \u003ca href="https://www.openstreetmap.org/copyright" target="_blank"\u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e';
var mapCenter: L.LatLngExpression = [10.72984023054674, 124.79601323604585];
var mapZoom = 16;

var gmMap: L.Map;
var gmMapFx = false;
const mapOptions: { [name: string]: any } = {
  minZoom: 4,
  inertia: true,
  worldCopyJump: true,
};

var thisRegion = 1;
type PointArray = [number, number][];
var customPolygon: PointArray = [];
var newPolygon: L.Polygon | null = null;
const customRegions: { [name: string]: PointArray } = {};
const polygonThemes: { [theme: string]: { [key: string]: any } } = {
  "old-black": {
    stroke: true,
    color: "#000",
    weight: 3,
    opacity: 1.0,
    dashArray: null,
    fill: true,
    fillRule: "nonzero",
    fillColor: "#fff",
    fillOpacity: 0.1,
  },
  "cloudy-gray": {
    stroke: true,
    color: "#333",
    weight: 3,
    opacity: 1.0,
    dashArray: null,
    fill: true,
    fillRule: "nonzero",
    fillColor: "#333",
    fillOpacity: 0.2,
  },
  "electric-yellow": {
    stroke: true,
    color: "#ffff33",
    weight: 2,
    opacity: 1.0,
    dashArray: null,
    fill: true,
    fillRule: "nonzero",
    fillColor: "#ffff33",
    fillOpacity: 0.1,
  },
  "lightning-yellow": {
    stroke: true,
    color: "#f5a623",
    weight: 2,
    opacity: 1.0,
    dashArray: null,
    fill: true,
    fillRule: "nonzero",
    fillColor: "#f5a623",
    fillOpacity: 0.1,
  },
  "bright-green": {
    stroke: true,
    color: "#66ff00",
    weight: 2,
    opacity: 1.0,
    dashArray: null,
    fill: true,
    fillRule: "nonzero",
    fillColor: "#66ff00",
    fillOpacity: 0.1,
  },
  "basic-blue": {
    stroke: true,
    color: "#0018f9",
    weight: 3,
    opacity: 0.8,
    dashArray: null,
    fill: true,
    fillRule: "nonzero",
    fillColor: "#fff",
    fillOpacity: 0.1,
  },
  "midnight-blue": {
    stroke: true,
    color: "#191970",
    weight: 2,
    opacity: 0.8,
    dashArray: "3 5",
    fill: true,
    fillRule: "nonzero",
    fillColor: "#191970",
    fillOpacity: 0.1,
  },
  "old-firebrick": {
    stroke: true,
    color: "#b22222",
    weight: 3,
    opacity: 1.0,
    dashArray: null,
    fill: true,
    fillRule: "nonzero",
    fillColor: "#b22222",
    fillOpacity: 0.1,
  },
  "just-red": {
    stroke: true,
    color: "#ff0000",
    weight: 3,
    opacity: 1.0,
    dashArray: null,
    fill: true,
    fillRule: "nonzero",
    fillColor: "#ff0000",
    fillOpacity: 0.1,
  },
};

var selectedPolygonTheme = "basic-blue";
const polygonThemeNames: { [theme: string]: string } = {
  "old-black": "Old Black",
  "cloudy-gray": "Cloudy Gray",
  "lightning-yellow": "Lightning Yellow",
  "electric-yellow": "Electric Yellow",
  "bright-green": "Bright Green",
  "basic-blue": "Basic Blue",
  "midnight-blue": "Midnight Blue",
  "just-red": "Just Red",
  "old-firebrick": "Old Firebrick",
};
var thisPolygonTheme: { [name: string]: any } = {
  ...polygonThemes[selectedPolygonTheme],
};

var newMarker: L.Circle | null = null;
const markerTheme: { [name: string]: any } = {
  radius: 5,
  color: "#191970",
  weight: 2,
  fillOpacity: 0.5,
};
markerTheme.color = thisPolygonTheme.color;
markerTheme.fillColor = thisPolygonTheme.color;

onMounted(() => {
  setTimeout(() => {
    const gmTheme = document.getElementById("gmThemeSelected") as HTMLElement;
    const gmThemes = document.getElementById("gmThemeOptions") as HTMLElement;
    const gmThemeCode = document.getElementById("gmThemeCode") as HTMLElement;
    const gmThemeName = document.getElementById("gmThemeName") as HTMLElement;
    const map = document.getElementById("gmMap") as HTMLElement;
    if (
      gmTheme == null ||
      gmThemes == null ||
      gmThemeCode == null ||
      gmThemeName == null ||
      map == null
    )
      return;

    // load map data
    gmMap = L.map(map, mapOptions).setView(mapCenter, mapZoom);
    // getBrowserLocation()
    L.tileLayer(mapURL, {
      attribution: mapAttribution,
    }).addTo(gmMap);

    // ignore squigly
    // to do layer does not resize well
    // console.log(geojson)
    const geoRegions = L.geoJSON(geojson, thisPolygonTheme).addTo(gmMap);

    /*
    geojson.features.forEach((region) => {
      let gmRegionName = region.properties.adm4_en;
      let gmRegionCenter = findCentralCoordinate(
        region.geometry.coordinates[0],
      );

      const gmIcon = new L.DivIcon({
        html: "", className: "gm-icon"
      });

      L.marker(gmRegionCenter, { icon: gmIcon })
        .bindTooltip(gmRegionName.replace(" (", "<br>("), { direction: "left", className: "gm-label", permanent: true})
        .addTo(gmMap)
    }); */

    gmMap.on("click", function (ev) {
      if (!gmThemes.classList.contains("gm-hide")) {
        gmThemes.classList.add("gm-hide");
        return;
      }

      // update region on each new coordinates
      const coordinates = ev.latlng;
      customPolygon.push([coordinates!.lat, coordinates!.lng]);
      if (newPolygon !== null) newPolygon.remove();
      if (newMarker !== null) newMarker.remove();
      newPolygon = L.polygon(customPolygon, thisPolygonTheme).addTo(gmMap);
      newMarker = L.circle(
        [coordinates!.lat, coordinates!.lng],
        markerTheme,
      ).addTo(gmMap);
      customRegions[thisRegion.toString()] = customPolygon;

      /* if (!gmMapFx) {
        // insert path drawing-like fx
        const defsHtml =
          "<defs><filter id='gm-path-filter'><feTurbulence type='fractalNoise' baseFrequency='0.5' numOctaves='3' result='turbulence'/><feDisplacementMap in2='turbulence' in='SourceGraphic' scale='5'/></filter></defs>";
        const svgElements = document.querySelectorAll(
          ".leaflet-zoom-animated > g",
        );
        svgElements.forEach((svgElement) => {
          svgElement.innerHTML = defsHtml + svgElement.innerHTML;
          return;
        });
        gmMapFx = true;
      }

      // path drawing-like filter
      const pathElements = document.querySelectorAll(
        ".leaflet-zoom-animated > g > path",
      );
      pathElements.forEach((pathElement) => {
        pathElement.setAttribute("filter", "url(#gm-path-filter)");
      }); */

      // auto hide/show lock region
      const gmLock = document.getElementById("gmLock");
      if (gmLock == null) return;
      if (customPolygon.length > 2) gmLock.classList.remove("gm-hide");
    });

    gmTheme.addEventListener("click", (_event) => {
      if (gmThemes.classList.contains("gm-hide")) {
        gmThemes.classList.remove("gm-hide");
        return;
      }
      gmThemes.classList.add("gm-hide");
    });

    // set listener to all theme color options
    const gmThemeOptions = document.querySelectorAll(".gm-theme-option");
    gmThemeOptions.forEach((option) => {
      option.addEventListener("click", (event: Event) => {
        // get color code
        let colorCode = (event.target as HTMLElement)!.getAttribute(
          "data-code",
        );
        colorCode = colorCode == null ? selectedPolygonTheme : colorCode;
        // get color name
        let colorName = (event.target as HTMLElement)!.textContent;
        colorName =
          colorName == null
            ? polygonThemeNames[selectedPolygonTheme]
            : colorName;

        // update theme selector
        gmThemeName.textContent = colorName.trim();
        gmThemeCode.classList.remove(`gm-${selectedPolygonTheme}`);
        selectedPolygonTheme = colorCode;

        // update to new color code
        gmThemeCode.classList.add(`gm-${colorCode}`);
        gmThemes.classList.add("gm-hide");

        // update region color
        thisPolygonTheme = { ...polygonThemes[colorCode] };
        markerTheme.color = thisPolygonTheme.color;
        markerTheme.fillColor = thisPolygonTheme.color;

        // update elements if present
        if (customPolygon.length == 0) return;
        if (newPolygon !== null) newPolygon.remove();
        if (newMarker !== null) newMarker.remove();
        newPolygon = L.polygon(customPolygon, thisPolygonTheme).addTo(gmMap);
        newMarker = L.circle(
          customPolygon[customPolygon.length - 1],
          markerTheme,
        ).addTo(gmMap);
      });
    });
  }, 0.5);
});

async function initNewRegion() {
  if (customPolygon.length < 3) return;
  const gmLock = document.getElementById("gmLock");
  if (gmLock == null) return;

  // let gmRegionCenter = findCentralCoordinate(customPolygon)
  // let gmRegionArea: string = calculatePolygonArea(customPolygon).toFixed(1)
  // var gmArea = L.divIcon({html: `${gmRegionArea} sq. km.`, className: 'gm-region-area'})
  // L.marker(gmRegionCenter, {icon: gmArea}).addTo(gmMap)

  console.log(customPolygon);

  gmLock.classList.add("gm-hide");
  if (newPolygon !== null) newPolygon.remove();
  L.polygon(customPolygon, thisPolygonTheme).addTo(gmMap);
  if (newMarker !== null) newMarker.remove();
  customPolygon = [];
  thisRegion++;
}

function getBrowserLocation() {
  if ("geolocation" in navigator) {
    // Get the current location
    navigator.geolocation.getCurrentPosition((position) => {
      mapCenter = [position.coords.latitude, position.coords.longitude];
      zoomMap(mapZoom);
    });
  }

  function zoomMap(zoom: number) {
    setTimeout(() => {
      gmMap.setView(mapCenter, zoom);

      if (zoom > mapZoom + 10) return;
      // console.log(zoom)
      return zoomMap(zoom + 1);
    }, 200);
  }
}

function calculatePolygonArea(coords: [number, number][]): number {
  let area: number = 0;
  const n: number = coords.length;

  for (let i: number = 0; i < n - 1; i++) {
    area += coords[i][0] * coords[i + 1][1] - coords[i + 1][0] * coords[i][1];
  }

  area += coords[n - 1][0] * coords[0][1] - coords[0][0] * coords[n - 1][1];

  area = ((Math.abs(area) / 2.0) * 111320) / 1000000;
  console.log(area);

  return area;
}

function findCentralCoordinate(
  coordinates: [number, number][],
): [number, number] {
  const numCoordinates: number = coordinates.length;

  let sumLatitude: number = 0;
  let sumLongitude: number = 0;

  for (const [longitude, latitude] of coordinates) {
    sumLatitude += latitude;
    sumLongitude += longitude;
  }

  const averageLatitude: number = sumLatitude / numCoordinates;
  const averageLongitude: number = sumLongitude / numCoordinates;

  return [averageLatitude, averageLongitude];
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
  margin: 10px 0 0 60px;
  z-index: 100;
}

.gm-brand-logo {
  margin-top: 15px;
  width: 40px;
  height: 40px;
  margin-right: 5px;
}

.nav-brand a {
  position: absolute;
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
  width: 180px;
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
  width: 180px;
  margin: 50px 10px 0 0;
  padding: 8px 8px 5px 8px;
  max-height: 185px;
  overflow-y: auto;
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

.leaflet-tooltip-left::before {
  background-color: rgba(0, 0, 0, 0) !important;
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

.gm-cloudy-gray {
  background-color: #333;
}

.gm-lightning-yellow {
  background-color: #f5a623;
}

.gm-electric-yellow {
  background-color: #ffff33;
}

.gm-bright-green {
  background-color: #66ff00;
}

.gm-basic-blue {
  background-color: #0018f9;
}

.gm-midnight-blue {
  background-color: #191970;
}

.gm-just-red {
  background-color: #ff0000;
}

.gm-old-firebrick {
  background-color: #b22222;
}

.copyright {
  position: fixed;
  bottom: 0;
  padding: 10px;
  width: 100%;
  color: rgba(255, 255, 255, 0.7);
  font-family: Arial, Helvetica, sans-serif;
  text-align: center;
  font-size: 0.7em;
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
  -webkit-box-shadow: 0px 0px 5px 0px rgba(204, 180, 0, 1);
  -moz-box-shadow: 0px 0px 5px 0px rgba(204, 180, 0, 1);
  box-shadow: 0px 0px 5px 0px rgba(204, 180, 0, 1);
  transition:
    color 0.5,
    background-color 0.5s,
    box-shadow 0.5s;
}

.emoji1 {
  margin-left: -3px;
}

.emoji2 {
  margin-left: -6px;
}

@media only screen and (max-width: 500px) {
  .nav-brand {
    margin: 10px 0 0 60px;
  }

  .gm-brand-logo {
    margin-left: -5px;
    margin-top: 12px;
  }
  .nav-brand a {
    margin-top: 10px;
    font-size: 48px;
  }
  .gm-dropdown {
    margin-top: 26px;
    width: 160px;
  }
  .gm-theme-name {
    margin-top: 0px;
    margin-left: 15px;
  }

  .gm-themes {
    margin-top: 65px;
    width: 160px;
  }

  .copyright {
    margin-bottom: 25px;
  }
}
</style>
