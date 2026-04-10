<script setup>
import { ref, computed, watch } from "vue";

// SKELETON LOADER: Added watch to trigger loading state when panel opens.
const props = defineProps(["isOpen", "isExpanded", "isPanelOpen"]);
defineEmits(["close"]);

// ── Zone Filter Data ──────────────────────────────────────
const zones = [
  { id: "all", label: "All Zones" },
  { id: "clark", label: "Clark Freeport" },
  { id: "newclark", label: "New Clark City" },
  { id: "bonifacio", label: "Bonifacio Global" },
  { id: "aviation", label: "Clark Aviation" },
];

// ── Filter State ─────────────────────────────────────────
const selectedZone = ref("all");
const selectedCategory = ref("All Categories");
const selectedPerformance = ref("All Performance");
const searchZone = ref("");

// ── Stats Cards Data ──────────────────────────────────────
const statsCards = [
  {
    value: "₱22.1B",
    label: "Gross Revenues (2024)",
    change: "+202% vs 2023",
    borderColor: "#facc24",
  },
  {
    value: "₱147.46B",
    label: "Total Disposition Proceeds",
    change: "+4% vs 2023",
    borderColor: "#facc24",
  },
  {
    value: "₱16.6B",
    label: "Total Comprehensive Income",
    change: "+437% vs 2023",
    borderColor: "#facc24",
  },
  {
    value: "₱184.8B",
    label: "Total Equity",
    change: "+8.88% vs 2023",
    borderColor: "#facc24",
  },
];

// ── Economic Zones Portfolio Data ─────────────────────────
const economicZones = [
  {
    name: "Clark Freeport Zone",
    status: "OPERATIONAL",
    statusColor: "bg-green-500/20 text-green-400",
    stats: [
      { label: "Locators", value: "1,198" },
      { label: "Net Income", value: "₱3.49B" },
      { label: "Workers", value: "143,408" },
      { label: "Exports", value: "$5.10B" },
    ],
  },
  {
    name: "New Clark City",
    status: "DEVELOPMENT",
    statusColor: "bg-yellow-500/20 text-yellow-400",
    stats: [
      { label: "Hectares", value: "9,450" },
      { label: "2024 Investments", value: "₱2.61B" },
      { label: "Projected Workforce", value: "600K" },
      { label: "Forest Reserves", value: "60%" },
    ],
  },
  {
    name: "Bonifacio Global City",
    status: "OPERATIONAL",
    statusColor: "bg-green-500/20 text-green-400",
    stats: [
      { label: "Net Revenue", value: "₱6.0B" },
      { label: "Net Income", value: "₱3.5B" },
      { label: "CityFlats Occupancy", value: "89%" },
      { label: "Waste Reduction", value: "16%" },
    ],
  },
  {
    name: "Clark Aviation Capital",
    status: "OPERATIONAL",
    statusColor: "bg-green-500/20 text-green-400",
    stats: [
      { label: "Passengers", value: "2,404,888" },
      { label: "Revenue", value: "₱924.51M" },
      { label: "Hectares", value: "2,367" },
      { label: "Employees", value: "11,433" },
    ],
  },
];

// ── Quick Stats Data ──────────────────────────────────────
const quickStats = [
  { label: "AFP Modernization Share", value: "₱62.80B" },
  { label: "BCDA Share", value: "₱49.29B" },
  { label: "Remittances to Govt (2024)", value: "₱5.87B" },
  { label: "Total Assets", value: "₱218.8B" },
  { label: "Active Economic Zones", value: "8" },
  { label: "Major Infrastructure Projects", value: "15+" },
  { label: "International Partnerships", value: "31" },
];

// ── Filter Logic ──────────────────────────────────────────
// Map zone button id to zone card name
const zoneIdMap = {
  all: null,
  clark: "Clark Freeport Zone",
  newclark: "New Clark City",
  bonifacio: "Bonifacio Global City",
  aviation: "Clark Aviation Capital",
};

// Map category dropdown to zone card names
const categoryMap = {
  "All Categories": null,
  Operational: [
    "Clark Freeport Zone",
    "Bonifacio Global City",
    "Clark Aviation Capital",
  ],
  Development: ["New Clark City"],
  Aviation: ["Clark Aviation Capital"],
  "Business District": ["Bonifacio Global City"],
};

// Map performance dropdown to zone status
const performanceMap = {
  "All Performance": null,
  "High Performing": ["OPERATIONAL"],
  "Medium Performing": ["DEVELOPMENT"],
  "Below Target": [], // no zones match — show empty state
};

const filteredZones = computed(() => {
  let result = economicZones;

  // Filter by selected zone button
  if (selectedZone.value !== "all") {
    const zoneName = zoneIdMap[selectedZone.value];
    result = result.filter((z) => z.name === zoneName);
  }

  // Filter by category dropdown
  if (selectedCategory.value !== "All Categories") {
    const allowedZones = categoryMap[selectedCategory.value];
    if (allowedZones) {
      result = result.filter((z) => allowedZones.includes(z.name));
    }
  }

  // Filter by performance dropdown
  if (selectedPerformance.value !== "All Performance") {
    const allowedStatuses = performanceMap[selectedPerformance.value];
    result = result.filter((z) => allowedStatuses.includes(z.status));
  }

  // Filter by search query
  if (searchZone.value) {
    result = result.filter((z) =>
      z.name.toLowerCase().includes(searchZone.value.toLowerCase()),
    );
  }

  return result;
});

// ── Clear All Filters Function ───────────────────────────
const clearAll = () => {
  selectedZone.value = "all";
  selectedCategory.value = "All Categories";
  selectedPerformance.value = "All Performance";
  searchZone.value = "";
};

// TABLET FIX: Detect tablet screen size in JavaScript.
// Same pattern used in Dashboard.vue, SideNav.vue, and ContentPanel.vue.
// Needed because :style bindings can't use Tailwind breakpoints (md:, lg:).
// DESKTOP: When window.innerWidth >= 1024, isTablet = false → original values used.
const isTablet = ref(window.innerWidth < 1024);
window.addEventListener("resize", () => {
  isTablet.value = window.innerWidth < 1024;
});

// ── SKELETON LOADER ───────────────────────────────────────
// isLoading controls whether the skeleton or real content is shown.
// When the panel opens (isOpen becomes true), we set isLoading = true
// and after 1.5 seconds we set it back to false to reveal the real content.
// We use watch() to detect every time isOpen changes from false → true.
const isLoading = ref(false);
let loadingTimer = null;

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      // Panel just opened → start loading
      isLoading.value = true;
      // Clear any previous timer to avoid double-firing
      clearTimeout(loadingTimer);
      // After 1.5 seconds, hide skeleton and show real content
      loadingTimer = setTimeout(() => {
        isLoading.value = false;
      }, 1000);
    } else {
      // Panel closed → reset loading state for next open
      isLoading.value = false;
      clearTimeout(loadingTimer);
    }
  },
);
</script>

<template>
  <Transition name="fade">
    <div
      v-if="isOpen"
      class="fixed bg-[#020f1a] z-39 overflow-y-auto font-['Inter',sans-serif] transition-all duration-500 ease-in-out"
      :style="{
        // TABLET FIX: 'top' now uses isTablet to pick the correct header height.
        // On desktop (lg+): isExpanded ? '284px' : '6px' — original values unchanged.
        // On tablet (md):   isExpanded ? '200px' : '6px' — matches our shorter tablet header.
        // The 200px matches mapTop, panelTop in Dashboard/SideNav/ContentPanel exactly.
        top: isExpanded ? (isTablet ? '150px' : '220px') : '0px',

        // TABLET FIX: 'left' now uses isTablet to pick the correct panel offset.
        // On desktop (lg+): isPanelOpen ? 'clamp(0px,380px,100vw)' : 'clamp(0px,80px,100vw)'
        //                   — original values unchanged.
        // On tablet (md):   isPanelOpen ? 'clamp(0px,300px,100vw)' : 'clamp(0px,80px,100vw)'
        //                   — 300px matches mainMarginLeft in Dashboard.vue for tablet.
        left: isPanelOpen
          ? isTablet
            ? 'clamp(0px, 300px, 100vw)'
            : 'clamp(0px, 380px, 100vw)'
          : 'clamp(0px, 80px, 100vw)',

        right: '0px',
        bottom: '0px',
      }"
    >
      <!-- HEADER — always visible, even during loading -->
      <div
        class="flex items-center justify-between px-8 py-5 border-b border-white/10"
      >
        <h1 class="text-white text-2xl font-bold">Strategic Dashboard</h1>
        <button
          @click="$emit('close')"
          class="text-white/50 hover:text-white text-2xl transition-colors"
        >
          ✕
        </button>
      </div>

      <!-- ═══════════════════════════════════════════════════
           SKELETON LOADER
           Shows when isLoading = true (first 1s after opening).
           Each skeleton block mimics the shape of the real content below:
           - A wide bar = the filter controls section
           - 4 equal boxes = the stats cards
           - 4 equal boxes = the zone portfolio cards
           - A wide + narrow box = the chart + quick stats
           "animate-pulse" is a Tailwind class that makes them fade in/out
           repeatedly, creating the "breathing" loading effect.
      ════════════════════════════════════════════════════ -->
      <div v-if="isLoading" class="px-8 py-6 space-y-8">
        <!-- Skeleton: Filter Bar -->
        <div
          class="bg-[#0a1929] border border-white/10 rounded-xl p-5 animate-pulse"
        >
          <!-- Title bar -->
          <div class="h-4 bg-white/10 rounded w-48 mb-4"></div>
          <!-- 3 dropdown placeholders -->
          <div
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4"
          >
            <div class="h-10 bg-white/10 rounded"></div>
            <div class="h-10 bg-white/10 rounded"></div>
            <div class="h-10 bg-white/10 rounded"></div>
          </div>
          <!-- Zone filter button placeholders -->
          <div class="flex gap-2">
            <div class="h-8 w-24 bg-white/10 rounded-full"></div>
            <div class="h-8 w-28 bg-white/10 rounded-full"></div>
            <div class="h-8 w-28 bg-white/10 rounded-full"></div>
            <div class="h-8 w-32 bg-white/10 rounded-full"></div>
            <div class="h-8 w-28 bg-white/10 rounded-full"></div>
          </div>
        </div>

        <!-- Skeleton: Stats Cards (4 boxes) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            v-for="i in 4"
            :key="i"
            class="bg-[#0a1929] border border-white/10 rounded-xl p-5 animate-pulse"
          >
            <!-- Big number placeholder -->
            <div class="h-8 bg-white/10 rounded w-3/4 mb-3"></div>
            <!-- Label placeholder -->
            <div class="h-3 bg-white/10 rounded w-full mb-2"></div>
            <!-- Badge placeholder -->
            <div class="h-7 bg-white/10 rounded-full w-full mt-4"></div>
          </div>
        </div>

        <!-- Skeleton: Economic Zones Portfolio (4 cards) -->
        <div>
          <!-- Section title placeholder -->
          <div class="h-4 bg-white/10 rounded w-48 mb-4 animate-pulse"></div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              v-for="i in 4"
              :key="i"
              class="bg-[#0a1929] border border-white/10 rounded-xl p-5 animate-pulse"
            >
              <!-- Zone name + status badge -->
              <div class="flex justify-between mb-4">
                <div class="h-3 bg-white/10 rounded w-1/2"></div>
                <div class="h-5 bg-white/10 rounded w-1/4"></div>
              </div>
              <!-- 4 stat blocks in 2x2 grid -->
              <div class="grid grid-cols-2 gap-3">
                <div v-for="j in 4" :key="j">
                  <div class="h-4 bg-white/10 rounded w-3/4 mb-1"></div>
                  <div class="h-3 bg-white/10 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Skeleton: Performance Analytics (chart + quick stats) -->
        <div>
          <!-- Section title placeholder -->
          <div class="h-4 bg-white/10 rounded w-44 mb-4 animate-pulse"></div>
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <!-- Chart placeholder (takes 2 cols) -->
            <div
              class="lg:col-span-2 bg-[#0a1929] border border-white/10 rounded-xl p-6 animate-pulse"
            >
              <div class="h-4 bg-white/10 rounded w-48 mb-4"></div>
              <div class="h-70 bg-white/10 rounded"></div>
            </div>
            <!-- Quick stats placeholder -->
            <div
              class="bg-[#0a1929] border border-white/10 rounded-xl p-5 animate-pulse"
            >
              <div class="h-4 bg-white/10 rounded w-28 mb-4"></div>
              <div class="space-y-6">
                <div v-for="i in 7" :key="i" class="flex justify-between">
                  <div class="h-3 bg-white/10 rounded w-2/3"></div>
                  <div class="h-3 bg-white/10 rounded w-1/5"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- END SKELETON LOADER -->

      <!-- ═══════════════════════════════════════════════════
           REAL CONTENT
           Shows when isLoading = false (after 1s).
           Wrapped in a Transition for a smooth fade-in.
           v-else means it only shows when isLoading is false.
      ════════════════════════════════════════════════════ -->
      <Transition name="content-fade">
        <div v-if="!isLoading" class="px-8 py-6 space-y-8">
          <!-- ZONE FILTERS & CONTROLS -->
          <div class="bg-[#0a1929] border border-white/10 rounded-xl p-5">
            <div class="flex items-center gap-2 mb-4">
              <span class="text-cyan-400 text-sm">🔵</span>
              <h2 class="text-white font-semibold">Zone Filters & Controls</h2>
              <span class="ml-auto text-white/40 text-sm">
                Showing {{ filteredZones.length }} of
                {{ economicZones.length }} zones
              </span>
            </div>

            <!-- Dropdowns + Search
                 TABLET FIX: Changed from "grid-cols-3" to "grid-cols-1 md:grid-cols-2 lg:grid-cols-3".
                 On tablet the 3 dropdowns were too cramped side by side.
                 Tablet shows 2 columns, desktop restores the original 3 columns.
                 DESKTOP: lg:grid-cols-3 → identical to the original grid-cols-3.
            -->
            <div
              class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4"
            >
              <div class="flex flex-col gap-2">
                <label class="text-white/50 text-xs">Zone Category</label>
                <select
                  v-model="selectedCategory"
                  class="bg-[#0d2035] border border-white/10 text-white rounded px-3 py-3 text-sm focus:outline-none focus:border-cyan-500/60"
                >
                  <option>All Categories</option>
                  <option>Operational</option>
                  <option>Development</option>
                  <option>Aviation</option>
                  <option>Business District</option>
                </select>
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-white/50 text-xs">Performance Level</label>
                <select
                  v-model="selectedPerformance"
                  class="bg-[#0d2035] border border-white/10 text-white rounded px-3 py-3 text-sm focus:outline-none focus:border-cyan-500/60"
                >
                  <option>All Performance</option>
                  <option>High Performing</option>
                  <option>Medium Performing</option>
                  <option>Below Target</option>
                </select>
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-white/50 text-xs">Search Zone</label>
                <div class="flex gap-2">
                  <input
                    v-model="searchZone"
                    type="text"
                    placeholder="Search zone name..."
                    class="flex-1 min-w-0 bg-[#0d2035] border border-white/10 text-white rounded px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-500/60 placeholder:text-white/20"
                  />
                  <button
                    @click="clearAll"
                    class="shrink-0 px-4 py-2 border border-yellow-500 bg-[#ffd700]/10 hover:bg-yellow-500 hover:text-white text-[#ffd700] font-bold text-sm rounded transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>

            <!-- Zone Filter Buttons — unchanged, flex-wrap already handles overflow -->
            <div class="flex gap-2 flex-wrap">
              <button
                v-for="zone in zones"
                :key="zone.id"
                @click="selectedZone = zone.id"
                :class="[
                  'px-4 py-1.5 rounded-full cursor-pointer text-sm font-medium transition-all',
                  selectedZone === zone.id
                    ? 'bg-cyan-500 text-white'
                    : 'bg-[#0d2035] text-white/60 hover:text-white border hover:border-white/30 border-white/10',
                ]"
              >
                {{ zone.label }}
              </button>
            </div>
          </div>

          <!-- STATS CARDS — unchanged, already has sm:grid-cols-2 which works on tablet -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              v-for="card in statsCards"
              :key="card.label"
              class="relative bg-[#0a1929] rounded-xl p-5 transition-all duration-300 hover:brightness-130 overflow-hidden"
              :style="{ border: '1px solid rgba(255,255,255,0.1)' }"
              @mouseover="
                (e) => {
                  e.currentTarget.style.border = `2px solid ${card.borderColor}`;
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = `0 8px 20px ${card.borderColor}30`;
                }
              "
              @mouseleave="
                (e) => {
                  e.currentTarget.style.border =
                    '1px solid rgba(255,255,255,0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              "
            >
              <div
                class="absolute top-0 left-0 right-0 h-1.25"
                :style="{
                  background: `linear-gradient(to right, ${card.borderColor}, #22d3ee)`,
                  borderRadius: '11px 11px 0 0',
                }"
              ></div>
              <p class="text-cyan-400 text-3xl font-bold">{{ card.value }}</p>
              <p class="text-white text-s mt-3">{{ card.label }}</p>
              <div class="mt-4">
                <span
                  class="text-xs rounded-full bg-green-900/50 text-green-400 w-full max-w-full font-bold inline-block"
                  style="padding: 7px 10px"
                >
                  {{ card.change }}
                </span>
              </div>
            </div>
          </div>

          <!-- ECONOMIC ZONES PORTFOLIO — unchanged, already has sm:grid-cols-2 -->
          <div>
            <div class="flex items-center gap-2 mb-4">
              <span class="text-white/60">🏛</span>
              <h2 class="text-cyan-400 font-semibold">
                Economic Zones Portfolio
              </h2>
            </div>
            <!-- Empty state — shows when no zones match filters -->
            <div
              v-if="filteredZones.length === 0"
              class="border border-dashed border-white/30 rounded-xl p-10 flex items-center justify-center bg-gray-50/2"
            >
              <p class="text-white/35 text-sm text-center italic">
                No zones match your current filter criteria. Try adjusting your
                filters or clearing them to see all zones.
              </p>
            </div>
            <div
              v-else
              class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              <div
                v-for="zone in filteredZones"
                :key="zone.name"
                class="bg-[#0a1929] border border-white/10 rounded-xl p-5 transition-all duration-300 hover:brightness-130 hover:border-yellow-500"
              >
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-white font-medium text-sm">
                    {{ zone.name }}
                  </h3>
                  <span
                    :class="[
                      'text-xs px-2 py-1 rounded font-bold',
                      zone.statusColor,
                    ]"
                    >{{ zone.status }}</span
                  >
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div v-for="stat in zone.stats" :key="stat.label">
                    <p class="text-cyan-400 font-bold text-sm">
                      {{ stat.value }}
                    </p>
                    <p class="text-white/40 text-xs">{{ stat.label }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- PERFORMANCE ANALYTICS
               TABLET FIX: Changed "sm:grid-cols-3" to "lg:grid-cols-3".
               On tablet (768px), sm:grid-cols-3 fires too early — the Revenue chart
               and Quick Stats were too cramped side by side.
               Now they stack on tablet and go side by side only on desktop (lg+).
               DESKTOP: lg:grid-cols-3 and col-span-2 → identical to original behavior.
          -->
          <div>
            <div class="flex items-center gap-2 mb-4">
              <span class="text-cyan-400">📊</span>
              <h2 class="text-cyan-400 font-semibold">Performance Analytics</h2>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <!-- Revenue Chart -->
              <div
                class="lg:col-span-2 bg-[#0a1929] border border-white/10 rounded-xl p-6"
              >
                <h3 class="text-white font-bold mb-4">
                  Revenue Trend (2020-2024)
                </h3>
                <div
                  class="h-70 border border-dashed border-cyan-400 rounded flex items-center justify-center bg-cyan-500/6"
                >
                  <div class="text-center">
                    <p class="text-cyan-400 text-sm">
                      Revenue Growth Chart: ₱7.3B (2023) → ₱22.1B (2024)
                    </p>
                    <p class="text-white/50 text-sm mt-1">
                      202% Year-over-Year Growth
                    </p>
                  </div>
                </div>
              </div>
              <!-- Quick Stats -->
              <div class="bg-[#0a1929] border border-white/10 rounded-xl p-5">
                <h3 class="text-white font-bold mb-4">Quick Stats</h3>
                <div class="space-y-6">
                  <div
                    v-for="stat in quickStats"
                    :key="stat.label"
                    class="flex items-center justify-between"
                  >
                    <span class="text-white/60 text-sm">{{ stat.label }}</span>
                    <span class="text-cyan-400 font-bold text-sm">{{
                      stat.value
                    }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
      <!-- END REAL CONTENT -->
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease-in-out;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-90px);
}

/* SKELETON LOADER: Smooth fade-in for real content after skeleton disappears */
.content-fade-enter-active {
  transition: opacity 0.4s ease-in-out;
}
.content-fade-enter-from {
  opacity: 0;
}
.content-fade-enter-to {
  opacity: 1;
}

/* Custom vertical scrollbar */
::-webkit-scrollbar {
  width: 11px;
}
::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 50px;
  margin-block: 20px;
}
::-webkit-scrollbar-thumb {
  background-color: rgb(255, 234, 0);
  background-clip: padding-box;
  border-left: 3px solid transparent;
  border-right: 3px solid transparent;
  border-radius: 50px;
}
::-webkit-scrollbar-thumb:hover {
  background-color: #c5b245;
}
::-webkit-scrollbar-button {
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 50px;
  height: 16px;
}
::-webkit-scrollbar-button:vertical:decrement {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10'%3E%3Cpolygon points='5,2 9,8 1,8' fill='%23facc15'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: center;
  background-size: 15px;
  height: 35px;
}
::-webkit-scrollbar-button:vertical:increment {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10'%3E%3Cpolygon points='5,8 9,2 1,2' fill='%23facc15'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: center;
  background-size: 15px;
  height: 30px;
}
</style>
