<script setup>
import { onMounted, onUnmounted, ref, watch } from "vue";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const props = defineProps([
  "selectedSite",
  "selectedSites",
  "checkedFeatures",
  "allSites",
]);
const emit = defineEmits(["polygon-clicked"]);
const mapContainer = ref(null);
let map = null;
let currentPopup = null;

const sites = ref([]);

const CATEGORY_COLORS = {
  "Economic Zones": "#28a745",
  "Locator Management": "#f7a932",
  "Infrastructure Projects": "#4da9f7",
  "AFP Modernization": "#e74c3c",
  "Investment Tracking": "#9b59b6",
  "Sustainability & Environment": "#1abc9c",
};

const POLYGON_COLOR = "#28a745";
const PIN_COLOR = "#e74c3c";

function getSiteColor(site) {
  if (site.status_color) return site.status_color;
  return CATEGORY_COLORS[site.category_name] || "#888888";
}

const CATEGORY_MAP = {
  "Economic Zones": "Economic Zones",
  "Locator Management": "Locators",
  "Infrastructure Projects": "Infrastructure",
  "AFP Modernization": "AFP Modernization",
  "Investment Tracking": "Investments",
  "Sustainability & Environment": "Sustainability & Environment",
};

const markers = {};

function buildPopupHTML(site) {
  return `
    <div style="
      font-family: Inter, sans-serif;
      background: #1a2a3a;
      border-radius: 6px;
      padding: 10px 12px;
      min-width: 270px;
      max-width: 300px;
      color: white;
    ">
      <strong style="
        font-size: 14px;
        font-weight: 700;
        color: #ffffff;
        display: block;
        margin-bottom: 6px;
      ">${site.name}</strong>
      <div style="border-top: 1px solid rgba(255,255,255,0.15); margin-bottom: 6px;"></div>
      <p style="
        font-size: 11px;
        color: rgba(255,255,255,0.6);
        margin: 0 0 8px 0;
        line-height: 1.4;
      ">${site.description ?? "—"}</p>
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
        <div style="display: flex; align-items: center; gap: 4px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="rgba(255,255,255,0.5)">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
          </svg>
          <span style="font-size: 11px; color: rgba(255,255,255,0.6);">${site.lot_size ?? "undefined"}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 4px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="#20c997">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
          </svg>
          <span style="font-size: 11px; color: #20c997; font-weight: 600;">${site.employees ?? "—"} employees</span>
        </div>
      </div>
    </div>
  `;
}

function createPinElement(color) {
  const el = document.createElement("div");
  el.style.cssText = `
    width: 28px;
    height: 36px;
    cursor: pointer;
    display: none;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.45));
  `;
  el.innerHTML = `
    <svg viewBox="0 0 28 36" xmlns="http://www.w3.org/2000/svg" width="28" height="36">
      <path d="M14 0C7.373 0 2 5.373 2 12c0 8.5 12 24 12 24S26 20.5 26 12C26 5.373 20.627 0 14 0z"
            fill="${color}" stroke="white" stroke-width="2"/>
      <circle cx="14" cy="12" r="5" fill="white" opacity="0.9"/>
    </svg>
  `;
  return el;
}

function addPolygon(map, site) {
  let coords;
  try {
    coords = JSON.parse(site.polygon_data);
    if (!Array.isArray(coords) || coords.length < 3) return;
  } catch {
    return;
  }

  const sourceId = `polygon-source-${site.id}`;
  const fillId = `polygon-fill-${site.id}`;
  const outlineId = `polygon-outline-${site.id}`;

  if (map.getSource(sourceId)) return;

  map.addSource(sourceId, {
    type: "geojson",
    data: {
      type: "Feature",
      geometry: { type: "Polygon", coordinates: [coords] },
      properties: { name: site.name, id: site.id },
    },
  });

  map.addLayer({
    id: fillId,
    type: "fill",
    source: sourceId,
    paint: { "fill-color": POLYGON_COLOR, "fill-opacity": 0.35 },
  });

  map.addLayer({
    id: outlineId,
    type: "line",
    source: sourceId,
    paint: {
      "line-color": POLYGON_COLOR,
      "line-width": 2,
      "line-opacity": 0.9,
    },
  });

  map.on("click", fillId, () => {
    emit("polygon-clicked", site);
  });

  map.on("mouseenter", fillId, (e) => {
    map.getCanvas().style.cursor = "pointer";
    map.setPaintProperty(fillId, "fill-color", "#4da9f7");
    map.setPaintProperty(outlineId, "line-color", "#4da9f7");
    if (currentPopup) {
      currentPopup.remove();
      currentPopup = null;
    }
    currentPopup = new maplibregl.Popup({
      offset: 8,
      closeButton: false,
      closeOnClick: false,
    })
      .setLngLat(e.lngLat)
      .setHTML(buildPopupHTML(site))
      .addTo(map);
  });

  map.on("mouseleave", fillId, () => {
    map.getCanvas().style.cursor = "";
    map.setPaintProperty(fillId, "fill-color", POLYGON_COLOR);
    map.setPaintProperty(outlineId, "line-color", POLYGON_COLOR);
    if (currentPopup) {
      currentPopup.remove();
      currentPopup = null;
    }
  });
}

function isVisible(site, features, selected) {
  const mappedCat = CATEGORY_MAP[site.category_name];
  const allChecked = features && features.length === 6;
  if (features && features.length > 0) {
    return allChecked || features.includes(mappedCat);
  }
  if (selected && selected.length > 0) {
    return selected.includes(site.name);
  }
  return false;
}

function setPolygonVisibility(siteId, visible) {
  if (!map) return;
  const vis = visible ? "visible" : "none";
  const fillId = `polygon-fill-${siteId}`;
  const outlineId = `polygon-outline-${siteId}`;
  if (map.getLayer(fillId)) map.setLayoutProperty(fillId, "visibility", vis);
  if (map.getLayer(outlineId))
    map.setLayoutProperty(outlineId, "visibility", vis);
}

// ── Load sites + polygons onto the map ────────────────────
// Called once map is ready AND allSites have arrived.
// Safe to call multiple times — addPolygon() checks for duplicate sources.
function loadSitesOntoMap(siteList) {
  sites.value = siteList;
  siteList.forEach((site) => {
    // Skip if marker already added
    if (markers[site.name]) return;

    const el = createPinElement(PIN_COLOR);
    const popup = new maplibregl.Popup({
      offset: [0, -30],
      closeButton: false,
    }).setHTML(buildPopupHTML(site));

    const marker = new maplibregl.Marker({ element: el })
      .setLngLat([parseFloat(site.location_lng), parseFloat(site.location_lat)])
      .setPopup(popup)
      .addTo(map);

    markers[site.name] = { marker, el };

    if (site.polygon_data) {
      addPolygon(map, site);
      setPolygonVisibility(site.id, false);
    }
  });
}

function flyToSite(site) {
  if (!map) return;
  if (currentPopup) {
    currentPopup.remove();
    currentPopup = null;
  }

  map.flyTo({ center: [site.lng, site.lat], zoom: 16, duration: 1500 });

  const fullSite = sites.value.find((s) => s.name === site.name);

  if (fullSite && markers[fullSite.name]) {
    markers[fullSite.name].el.style.display = "none";
  }

  if (fullSite?.polygon_data) {
    setPolygonVisibility(fullSite.id, true);
  }

  setTimeout(() => {
    currentPopup = new maplibregl.Popup({ offset: [0, -30] })
      .setLngLat([site.lng, site.lat])
      .setHTML(
        fullSite
          ? buildPopupHTML(fullSite)
          : `
        <div style="font-family:Inter,sans-serif;padding:4px;">
          <strong style="font-size:13px;">${site.name}</strong><br/>
          <span style="font-size:11px;color:#555;">Status: ${site.status ?? "—"}</span>
        </div>`,
      )
      .addTo(map);
  }, 1600);
}

onMounted(() => {
  map = new maplibregl.Map({
    container: mapContainer.value,
    style: {
      version: 8,
      sources: {
        osm: {
          type: "raster",
          tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
          tileSize: 256,
          attribution: "© OpenStreetMap contributors",
        },
      },
      layers: [
        {
          id: "osm-tiles",
          type: "raster",
          source: "osm",
          minzoom: 0,
          maxzoom: 19,
        },
      ],
    },
    center: [120.57, 15.18],
    zoom: 6,
  });

  map.addControl(new maplibregl.NavigationControl(), "top-right");

  // When map is ready, load whatever sites are already available
  map.on("load", () => {
    if (props.allSites?.length) {
      loadSitesOntoMap(props.allSites);
    }
  });
});

// ── Watch: allSites — fires when API data arrives after mount ──
// This is the KEY fix: map mounts before allSites loads,
// so we watch for when allSites finally arrives and load them then.
watch(
  () => props.allSites,
  (newSites) => {
    if (!newSites?.length || !map) return;
    const apply = () => loadSitesOntoMap(newSites);
    if (map.loaded()) apply();
    else map.once("load", apply);
  },
  { immediate: false },
);

// ── Watch: selectedSite — search bar and sidebar click ────
watch(
  () => props.selectedSite,
  (site) => {
    if (!site || !map) return;
    flyToSite(site);
  },
  { immediate: false },
);

// ── Watch: selectedSites — content panel checkboxes ───────
watch(
  () => props.selectedSites,
  (selected) => {
    if (!selected || !map || !map.loaded()) return;
    sites.value.forEach((site) => {
      const visible = selected.includes(site.name);
      const { el } = markers[site.name] || {};
      if (el) el.style.display = "none";
      if (site.polygon_data) setPolygonVisibility(site.id, visible);
    });
  },
  { deep: true, immediate: false },
);

// ── Watch: checkedFeatures — Features tab ─────────────────
watch(
  () => props.checkedFeatures,
  (features) => {
    if (!map) return;
    const apply = () => {
      sites.value.forEach((site) => {
        const visible = isVisible(site, features, props.selectedSites);
        const { el } = markers[site.name] || {};
        if (el) el.style.display = "none";
        if (site.polygon_data) setPolygonVisibility(site.id, visible);
      });
    };
    if (map.loaded()) apply();
    else map.once("load", apply);
  },
  { deep: true, immediate: false },
);

onUnmounted(() => {
  if (map) {
    map.remove();
    map = null;
  }
});
</script>

<template>
  <div ref="mapContainer" class="w-full h-full" />
</template>

<style>
.maplibregl-popup-content {
  background: transparent !important;
  padding: 0 !important;
  box-shadow: none !important;
  border-radius: 6px !important;
}
.maplibregl-popup-tip {
  display: none !important;
}
</style>
