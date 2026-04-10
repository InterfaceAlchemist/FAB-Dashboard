<script setup>
import { ref, computed, watch } from "vue";
// CHANGE 1: Removed 6 static file imports — data now comes from the real API.
// Added axios to make HTTP requests (same as what Postman does, but from code).
import axios from "axios";

const props = defineProps([
  "activeTab",
  "isPanelOpen",
  "isExpanded",
  "checkedFeatures",
  "selectedSites",
  "allSites",
]);
const emit = defineEmits([
  "close",
  "update:selectedSites",
  "update:checkedFeatures",
  "fly-to-site",
]);

const features = [
  "Economic Zones",
  "Locators",
  "Infrastructure",
  "AFP Modernization",
  "Investments",
  "Sustainability & Environment",
];

// CHANGE 2: Replaced ref(staticData) with ref([]) — start empty, fill from API.
// loadedTabs tracks which tabs have already been fetched so we don't call the API twice.
const economicZones = ref([]);
const locatorsData = ref([]);
const infrastructureData = ref([]);
const afpModernizationData = ref([]);
const investmentsData = ref([]);
const sustainabilityData = ref([]);
const loadedTabs = ref([]);

const filterSites = (sites) => {
  if (!searchQuery.value) return sites;
  const query = searchQuery.value.toLowerCase();
  return sites.filter((site) => site.toLowerCase().includes(query));
};

const searchQuery = ref("");
const openZones = ref([""]);

const selectedSites = computed({
  get() {
    return props.selectedSites ?? [];
  },
  set(val) {
    emit("update:selectedSites", val);
  },
});

const toggleZone = (zoneName) => {
  const index = openZones.value.indexOf(zoneName);
  if (index > -1) openZones.value.splice(index, 1);
  else openZones.value.push(zoneName);
};

const checkedFeatures = ref([]);

const isAllChecked = computed({
  get() {
    return checkedFeatures.value.length === features.length - 1;
  },
  set(value) {
    checkedFeatures.value = value ? features.filter((f) => f !== "All") : [];
  },
});

const isZoneAllChecked = (zone) => {
  if (!zone.sites || zone.sites.length === 0) return false;
  return zone.sites.every((site) => selectedSites.value.includes(site));
};

const toggleZoneAll = (zone) => {
  if (isZoneAllChecked(zone)) {
    selectedSites.value = selectedSites.value.filter(
      (s) => !zone.sites.includes(s),
    );
  } else {
    zone.sites.forEach((site) => {
      if (!selectedSites.value.includes(site)) selectedSites.value.push(site);
    });
  }
};

watch(
  checkedFeatures,
  (val) => {
    emit("update:checkedFeatures", val);
  },
  { deep: true },
);

// CHANGE 3: Groups the flat API array into zones by subcategory_name.
// The API returns a flat list like:
//   [{ name: "Lufthansa", subcategory_name: "Clark Freeport", ... }, ...]
// But the template expects a grouped structure like:
//   [{ name: "Clark Freeport", count: 10, sites: ["Lufthansa", ...] }, ...]
// This function does that grouping/transformation.
function groupBySubcategory(apiData) {
  const grouped = {};

  apiData.forEach((site) => {
    const zone = site.subcategory_name; // e.g. "Clark Freeport"

    // If this zone hasn't been seen yet, create an empty entry for it
    if (!grouped[zone]) {
      grouped[zone] = { name: zone, count: 0, sites: [] };
    }

    // Add the site to the zone's list and increment the count
    grouped[zone].sites.push(site.name);
    grouped[zone].count++;
  });

  // Convert from object to array so v-for can loop over it
  return Object.values(grouped);
}

// CHANGE 4: Fetches sites from the real API for a given category ID,
// transforms the result using groupBySubcategory, and stores it in the correct ref.
// categoryId: 1=Economic Zones, 2=Locators, 3=Infrastructure,
//             4=AFP Modernization, 5=Investments, 6=Sustainability
// targetRef: the ref variable to fill (e.g. economicZones, locatorsData, etc.)
async function fetchCategory(tabName, categoryId, targetRef) {
  // Skip if we already loaded this tab — avoids duplicate API calls
  if (loadedTabs.value.includes(tabName)) return;

  try {
    const response = await axios.get(
      `https://bcda.itbsstudio.com/BCDA/api/sites/filter?category_id=${categoryId}`,
    );
    // Transform flat array → grouped zones, then store in the ref
    targetRef.value = groupBySubcategory(response.data.data);
    // Mark this tab as loaded so we don't fetch it again
    loadedTabs.value.push(tabName);
  } catch (error) {
    console.error(`Failed to fetch ${tabName}:`, error);
  }
}

// CHANGE 5: Watch which tab the user opens and fetch its data on demand.
// This is the trigger that connects the tab click → API call → display.
// immediate: true means it also runs on first load (in case a tab is already active).
watch(
  () => props.activeTab,
  (tab) => {
    if (tab === "Economic Zone")
      fetchCategory("Economic Zone", 1, economicZones);
    if (tab === "Locators") fetchCategory("Locators", 2, locatorsData);
    if (tab === "Infrastructure")
      fetchCategory("Infrastructure", 3, infrastructureData);
    if (tab === "AFP Modernization")
      fetchCategory("AFP Modernization", 4, afpModernizationData);
    if (tab === "Investments") fetchCategory("Investments", 5, investmentsData);
    if (tab === "Sustainability")
      fetchCategory("Sustainability", 6, sustainabilityData);
  },
  { immediate: true },
);

// ── Fly-to on site name click ─────────────────────────────
function handleSiteClick(siteName) {
  const mapSite = (props.allSites ?? []).find((s) => s.name === siteName);
  if (!mapSite) return;
  emit("fly-to-site", {
    name: mapSite.name,
    lng: parseFloat(mapSite.location_lng),
    lat: parseFloat(mapSite.location_lat),
    status: mapSite.status,
  });
}

// TABLET FIX: Detect tablet screen size in JavaScript.
// Same pattern as Dashboard.vue and SideNav.vue — keeps all three files in sync.
// DESKTOP: When window.innerWidth >= 1024, isTablet = false → original values used.
const isTablet = ref(window.innerWidth < 1024);
window.addEventListener("resize", () => {
  isTablet.value = window.innerWidth < 1024;
});

// HEADER HEIGHT REDUCTION: Updated top offset values to match the new shorter header.
// Must match panelTop in SideNav.vue and mapTop in Dashboard.vue exactly.
// New header height breakdown:
//   - Header body (lg:h-40):  160px
//   - Nav bar:                 44px
//   - Toggle button:           24px
//   - Total desktop:          228px  (was 282px when header was lg:h-55)
//   - Total tablet:           160px  (was 190px — shorter because logo/padding smaller)
// When collapsed: 0px on both — header hidden, panel fills from top.
const panelTop = computed(() => {
  if (!props.isExpanded) return "0px";
  return isTablet.value ? "153px" : "228px";
});
</script>

<template>
  <!-- SIDE CONTENT PANEL
       TABLET FIX 1: "top" now uses computed "panelTop".
       HEADER HEIGHT REDUCTION: Desktop 228px (was 282px), Tablet 160px (was 190px).

       TABLET FIX 2: Width "w-55 lg:w-75" — narrower on tablet so map has more space.
       SideNav (80px) + ContentPanel (220px) = 300px = mainMarginLeft on tablet ✅
       SideNav (80px) + ContentPanel (300px) = 380px = mainMarginLeft on desktop ✅
  -->
  <aside
    class="fixed left-20 w-55 lg:w-75 bg-[#031E31]/95 border-r border-[#099b96]/30 z-30 transition-all duration-300 shadow-2xl flex flex-col"
    :class="isPanelOpen ? 'translate-x-0' : '-translate-x-full'"
    :style="{ top: panelTop, bottom: '0px' }"
  >
    <div class="flex items-center justify-between p-5 border-b border-white/10">
      <h2 class="text-medium font-bold text-white uppercase tracking-wider">
        {{ activeTab }}
      </h2>
      <button
        @click="emit('close')"
        class="text-white hover:text-orange-500 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-7 w-7"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>

    <!-- FEATURES CONTENT -->
    <div
      v-if="activeTab === 'Features'"
      class="flex-1 overflow-y-auto p-5 space-y-4"
    >
      <label class="flex items-center gap-3 text-white">
        <input
          type="checkbox"
          class="accent-green-500 w-4 h-4"
          v-model="isAllChecked"
        />
        <span>All</span>
      </label>
      <template v-for="feature in features" :key="feature">
        <label
          v-if="feature !== 'All'"
          class="flex items-center gap-3 text-white"
        >
          <input
            type="checkbox"
            class="accent-green-500 w-4 h-4"
            v-model="checkedFeatures"
            :value="feature"
          />
          <span>{{ feature }}</span>
        </label>
      </template>
    </div>

    <!-- ECONOMIC ZONE CONTENT -->
    <div
      v-if="activeTab === 'Economic Zone'"
      class="flex-1 overflow-y-auto text-white select-none custom-scrollbar"
    >
      <div
        v-for="zone in economicZones"
        :key="zone.name"
        class="border-b border-white/5"
      >
        <div
          @click="toggleZone(zone.name)"
          class="flex items-center justify-between p-4 hover:bg-white/5 cursor-pointer transition-colors"
        >
          <span class="font-medium text-sm Uppercase tracking-tight">{{
            zone.name
          }}</span>
          <div class="flex items-center gap-3">
            <span class="text-sm font-semibold">{{ zone.count }}</span>
            <svg
              class="w-4 h-4 transition-transform duration-200"
              :class="{ 'rotate-180': openZones.includes(zone.name) }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
        <div
          v-if="openZones.includes(zone.name)"
          class="bg-[#042a44] px-4 pb-4 pt-2 space-y-3"
        >
          <div v-if="zone.sites.length > 0" class="relative">
            <span
              class="absolute inset-y-0 left-3 flex items-center text-gray-400"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search sites..."
              class="w-full bg-[#0a3654] border border-white/10 rounded py-1.5 pl-9 pr-3 text-sm focus:outline-none placeholder:italic focus:border-[#099b96]"
            />
          </div>
          <label class="flex items-center gap-3 text-sm py-1 cursor-pointer">
            <input
              type="checkbox"
              class="w-4 h-4 rounded border-gray-300 accent-green-500"
              :checked="isZoneAllChecked(zone)"
              @change="toggleZoneAll(zone)"
            />
            <span class="font-bold">All</span>
          </label>
          <div class="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
            <label
              v-for="site in filterSites(zone.sites)"
              :key="site"
              class="flex items-start gap-3 text-sm py-1 group cursor-pointer"
            >
              <input
                type="checkbox"
                v-model="selectedSites"
                :value="site"
                class="mt-0.5 w-4 h-4 rounded border-gray-300 accent-green-500"
              />
              <span
                class="group-hover:text-[#8ffffb] leading-tight"
                @click="handleSiteClick(site)"
                >{{ site }}</span
              >
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- LOCATORS CONTENT -->
    <div
      v-if="activeTab === 'Locators'"
      class="flex-1 overflow-y-auto text-white select-none custom-scrollbar"
    >
      <div
        v-for="locator in locatorsData"
        :key="locator.name"
        class="border-b border-white/5"
      >
        <div
          @click="toggleZone(locator.name)"
          class="flex items-center justify-between p-4 hover:bg-white/5 cursor-pointer transition-colors"
        >
          <span class="font-medium text-sm Uppercase tracking-tight">{{
            locator.name
          }}</span>
          <div class="flex items-center gap-3">
            <span class="text-sm font-semibold">{{ locator.count }}</span>
            <svg
              class="w-4 h-4 transition-transform duration-200"
              :class="{ 'rotate-180': openZones.includes(locator.name) }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
        <div
          v-if="openZones.includes(locator.name)"
          class="bg-[#042a44] px-4 pb-4 pt-2 space-y-3"
        >
          <div v-if="locator.sites.length > 0" class="relative">
            <span
              class="absolute inset-y-0 left-3 flex items-center text-gray-400"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search sites..."
              class="w-full bg-[#0a3654] border border-white/10 rounded py-1.5 pl-9 pr-3 text-sm focus:outline-none placeholder:italic focus:border-[#099b96]"
            />
          </div>
          <label class="flex items-center gap-3 text-sm py-1 cursor-pointer">
            <input
              type="checkbox"
              class="w-4 h-4 rounded border-gray-300 accent-green-500"
              :checked="isZoneAllChecked(locator)"
              @change="toggleZoneAll(locator)"
            />
            <span class="font-bold">All</span>
          </label>
          <div class="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
            <label
              v-for="site in filterSites(locator.sites)"
              :key="site"
              class="flex items-start gap-3 text-sm py-1 group cursor-pointer"
            >
              <input
                type="checkbox"
                v-model="selectedSites"
                :value="site"
                class="mt-0.5 w-4 h-4 rounded border-gray-300 accent-green-500"
              />
              <span
                class="group-hover:text-[#8ffffb] leading-tight"
                @click="handleSiteClick(site)"
                >{{ site }}</span
              >
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- INFRASTRUCTURE CONTENT -->
    <div
      v-if="activeTab === 'Infrastructure'"
      class="flex-1 overflow-y-auto text-white select-none custom-scrollbar"
    >
      <div
        v-for="infra in infrastructureData"
        :key="infra.name"
        class="border-b border-white/5"
      >
        <div
          @click="toggleZone(infra.name)"
          class="flex items-center justify-between p-4 hover:bg-white/5 cursor-pointer transition-colors"
        >
          <span class="font-medium text-sm Uppercase tracking-tight">{{
            infra.name
          }}</span>
          <div class="flex items-center gap-3">
            <span class="text-sm font-semibold">{{ infra.count }}</span>
            <svg
              class="w-4 h-4 transition-transform duration-200"
              :class="{ 'rotate-180': openZones.includes(infra.name) }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
        <div
          v-if="openZones.includes(infra.name)"
          class="bg-[#042a44] px-4 pb-4 pt-2 space-y-3"
        >
          <div v-if="infra.sites.length > 0" class="relative">
            <span
              class="absolute inset-y-0 left-3 flex items-center text-gray-400"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search sites..."
              class="w-full bg-[#0a3654] border border-white/10 rounded py-1.5 pl-9 pr-3 text-sm focus:outline-none placeholder:italic focus:border-[#099b96]"
            />
          </div>
          <label class="flex items-center gap-3 text-sm py-1 cursor-pointer">
            <input
              type="checkbox"
              class="w-4 h-4 rounded border-gray-300 accent-green-500"
              :checked="isZoneAllChecked(infra)"
              @change="toggleZoneAll(infra)"
            />
            <span class="font-bold">All</span>
          </label>
          <div class="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
            <label
              v-for="site in filterSites(infra.sites)"
              :key="site"
              class="flex items-start gap-3 text-sm py-1 group cursor-pointer"
            >
              <input
                type="checkbox"
                v-model="selectedSites"
                :value="site"
                class="mt-0.5 w-4 h-4 rounded border-gray-300 accent-green-500"
              />
              <span
                class="group-hover:text-[#8ffffb] leading-tight"
                @click="handleSiteClick(site)"
                >{{ site }}</span
              >
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- AFP MODERNIZATION CONTENT -->
    <div
      v-if="activeTab === 'AFP Modernization'"
      class="flex-1 overflow-y-auto text-white select-none custom-scrollbar"
    >
      <div
        v-for="project in afpModernizationData"
        :key="project.name"
        class="border-b border-white/5"
      >
        <div
          @click="toggleZone(project.name)"
          class="flex items-center justify-between p-4 hover:bg-white/5 cursor-pointer transition-colors"
        >
          <span class="font-medium text-sm Uppercase tracking-tight">{{
            project.name
          }}</span>
          <div class="flex items-center gap-3">
            <span class="text-sm font-semibold">{{ project.count }}</span>
            <svg
              class="w-4 h-4 transition-transform duration-200"
              :class="{ 'rotate-180': openZones.includes(project.name) }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
        <div
          v-if="openZones.includes(project.name)"
          class="bg-[#042a44] px-4 pb-4 pt-2 space-y-3"
        >
          <div v-if="project.sites.length > 0" class="relative">
            <span
              class="absolute inset-y-0 left-3 flex items-center text-gray-400"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search projects..."
              class="w-full bg-[#0a3654] border border-white/10 rounded py-1.5 pl-9 pr-3 text-sm focus:outline-none placeholder:italic focus:border-[#099b96]"
            />
          </div>
          <label class="flex items-center gap-3 text-sm py-1 cursor-pointer">
            <input
              type="checkbox"
              class="w-4 h-4 rounded border-gray-300 accent-green-500"
              :checked="isZoneAllChecked(project)"
              @change="toggleZoneAll(project)"
            />
            <span class="font-bold">All</span>
          </label>
          <div class="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
            <!-- Fixed :key="item" bug → :key="site" -->
            <label
              v-for="site in filterSites(project.sites)"
              :key="site"
              class="flex items-start gap-3 text-sm py-1 group cursor-pointer"
            >
              <input
                type="checkbox"
                v-model="selectedSites"
                :value="site"
                class="mt-0.5 w-4 h-4 rounded border-gray-300 accent-green-500"
              />
              <span
                class="group-hover:text-[#8ffffb] leading-tight"
                @click="handleSiteClick(site)"
                >{{ site }}</span
              >
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- INVESTMENTS CONTENT -->
    <div
      v-if="activeTab === 'Investments'"
      class="flex-1 overflow-y-auto text-white select-none custom-scrollbar"
    >
      <div
        v-for="investment in investmentsData"
        :key="investment.name"
        class="border-b border-white/5"
      >
        <div
          @click="toggleZone(investment.name)"
          class="flex items-center justify-between p-4 hover:bg-white/5 cursor-pointer transition-colors"
        >
          <span class="font-medium text-sm Uppercase tracking-tight">{{
            investment.name
          }}</span>
          <div class="flex items-center gap-3">
            <span class="text-sm font-semibold">{{ investment.count }}</span>
            <svg
              class="w-4 h-4 transition-transform duration-200"
              :class="{ 'rotate-180': openZones.includes(investment.name) }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
        <div
          v-if="openZones.includes(investment.name)"
          class="bg-[#042a44] px-4 pb-4 pt-2 space-y-3"
        >
          <div v-if="investment.sites.length > 0" class="relative">
            <span
              class="absolute inset-y-0 left-3 flex items-center text-gray-400"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search sites..."
              class="w-full bg-[#0a3654] border border-white/10 rounded py-1.5 pl-9 pr-3 text-sm focus:outline-none placeholder:italic focus:border-[#099b96]"
            />
          </div>
          <label class="flex items-center gap-3 text-sm py-1 cursor-pointer">
            <input
              type="checkbox"
              class="w-4 h-4 rounded border-gray-300 accent-green-500"
              :checked="isZoneAllChecked(investment)"
              @change="toggleZoneAll(investment)"
            />
            <span class="font-bold">All</span>
          </label>
          <div class="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
            <label
              v-for="site in filterSites(investment.sites)"
              :key="site"
              class="flex items-start gap-3 text-sm py-1 group cursor-pointer"
            >
              <input
                type="checkbox"
                v-model="selectedSites"
                :value="site"
                class="mt-0.5 w-4 h-4 rounded border-gray-300 accent-green-500"
              />
              <span
                class="group-hover:text-[#8ffffb] leading-tight"
                @click="handleSiteClick(site)"
                >{{ site }}</span
              >
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- SUSTAINABILITY CONTENT -->
    <div
      v-if="activeTab === 'Sustainability'"
      class="flex-1 overflow-y-auto text-white select-none custom-scrollbar"
    >
      <div
        v-for="item in sustainabilityData"
        :key="item.name"
        class="border-b border-white/5"
      >
        <div
          @click="toggleZone(item.name)"
          class="flex items-center justify-between p-4 hover:bg-white/5 cursor-pointer transition-colors"
        >
          <span class="font-medium text-sm Uppercase tracking-tight">{{
            item.name
          }}</span>
          <div class="flex items-center gap-3">
            <span class="text-sm font-semibold">{{ item.count }}</span>
            <svg
              class="w-4 h-4 transition-transform duration-200"
              :class="{ 'rotate-180': openZones.includes(item.name) }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
        <div
          v-if="openZones.includes(item.name)"
          class="bg-[#042a44] px-4 pb-4 pt-2 space-y-3"
        >
          <div v-if="item.sites.length > 0" class="relative">
            <span
              class="absolute inset-y-0 left-3 flex items-center text-gray-400"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search sites..."
              class="w-full bg-[#0a3654] border border-white/10 rounded py-1.5 pl-9 pr-3 text-sm focus:outline-none placeholder:italic focus:border-[#099b96]"
            />
          </div>
          <label class="flex items-center gap-3 text-sm py-1 cursor-pointer">
            <input
              type="checkbox"
              class="w-4 h-4 rounded border-gray-300 accent-green-500"
              :checked="isZoneAllChecked(item)"
              @change="toggleZoneAll(item)"
            />
            <span class="font-bold">All</span>
          </label>
          <div class="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
            <label
              v-for="site in filterSites(item.sites)"
              :key="site"
              class="flex items-start gap-3 text-sm py-1 group cursor-pointer"
            >
              <input
                type="checkbox"
                v-model="selectedSites"
                :value="site"
                class="mt-0.5 w-4 h-4 rounded border-gray-300 accent-green-500"
              />
              <span
                class="group-hover:text-[#8ffffb] leading-tight"
                @click="handleSiteClick(site)"
                >{{ site }}</span
              >
            </label>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.custom-scrollbar {
  overflow-y: auto !important;
}
.custom-scrollbar::-webkit-scrollbar {
  width: 6px !important;
  display: block !important;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent !important;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #099b96 !important;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #00fff7 !important;
}
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #099b96 transparent;
}
</style>
