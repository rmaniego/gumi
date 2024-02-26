<script lang="ts">
/* https://docs.aws.amazon.com/prescriptive-guidance/latest/best-practices-cdk-typescript-iac/typescript-best-practices.html */
/* https://github.com/bevacqua/dragula/issues/602#issuecomment-477734315 */
if (typeof (window as any).global === "undefined") {
  (window as any).global = window;
}
</script>

<template>
    <client-only>
        <div class="theater">
          <LMap
            class="map"
            ref="map"
            :zoom="mapZoom"
            :center="[12.8797, 121.7740]"
          >
            <LTileLayer
              :url="mapURL"
              :attribution="mapAttribution"
              layer-type="base"
              :name="mapName"
            />
          </LMap>
        </div>
    </client-only>
</template>

<script lang="ts" setup>

// https://nuxt.com/modules/nuxt3-leaflet
import 'leaflet/dist/leaflet.css'

const config = useRuntimeConfig()

const MAPTILER = process.env.VERCEL_ENV === 'production'
        ? process.env.NUXT_ENV_MAPTILER
        : config.public.maptiler;

const mapName = "Satellite"
const mapSource = "Satellite"
const mapURL = `https://api.maptiler.com/tiles/satellite-v2/{z}/{x}/{y}.jpg?key=${MAPTILER}`
const mapAttribution = "\u003ca href=\"https://www.maptiler.com/copyright/\" target=\"_blank\"\u003e\u0026copy; MapTiler\u003c/a\u003e \u003ca href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\"\u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e";
const mapZoom = 6

</script>

<style scoped>

* {
    box-sizing: border-box;
}

body {
  margin: 0 !important;
  padding: 0;
}

.theater {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

</style>