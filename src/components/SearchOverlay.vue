<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  isOpen: Boolean,
  allSites: {
    type: Array,
    default: () => [],
  },
});
const emit = defineEmits(["close", "select-site"]);

const searchQuery = ref("");

// ── Search History ────────────────────────────────────────
// Load from localStorage on startup, max 5 recent searches
const searchHistory = ref(
  JSON.parse(localStorage.getItem("searchHistory") || "[]"),
);

// Save a site to history when selected
function addToHistory(site) {
  // Remove duplicate if already exists
  searchHistory.value = searchHistory.value.filter((s) => s.id !== site.id);
  // Add to the beginning of the list
  searchHistory.value.unshift({ id: site.id, name: site.name });
  // Keep only the last 5
  searchHistory.value = searchHistory.value.slice(0, 5);
  // Save to localStorage
  localStorage.setItem("searchHistory", JSON.stringify(searchHistory.value));
}

// Clear all history
function clearHistory() {
  searchHistory.value = [];
  localStorage.removeItem("searchHistory");
}

// Remove a single history item
function removeHistory(id) {
  searchHistory.value = searchHistory.value.filter((s) => s.id !== id);
  localStorage.setItem("searchHistory", JSON.stringify(searchHistory.value));
}

// ── Search Logic ──────────────────────────────────────────
// Compute best matches (sites whose names start with the query) and other results (sites that contain the query in their name or description but don't start with it) to show in separate sections. This way we can prioritize more relevant results while still showing a comprehensive list of matches.
const bestMatches = computed(() => {
  if (!searchQuery.value) return [];
  const query = searchQuery.value.toLowerCase();
  return props.allSites.filter((site) =>
    site.name.toLowerCase().startsWith(query),
  );
});

// Other results are sites that contain the query in their name or description but don't start with it. We also exclude any sites that are already in bestMatches to avoid duplicates.
const otherResults = computed(() => {
  if (!searchQuery.value) return [];
  const query = searchQuery.value.toLowerCase();
  const bestIds = new Set(bestMatches.value.map((s) => s.id));
  return props.allSites.filter(
    (site) =>
      !bestIds.has(site.id) &&
      (site.name.toLowerCase().includes(query) ||
        (site.description ?? "").toLowerCase().includes(query)),
  );
});

// Highlight matched letters in yellow
const highlight = (text) => {
  if (!searchQuery.value || !text) return text;
  const regex = new RegExp(`(${searchQuery.value})`, "gi");
  return text.replace(
    regex,
    '<mark class="bg-transparent text-yellow-400 font-bold">$1</mark>',
  );
};

// Select a site — add to history and emit
const selectSite = (site) => {
  addToHistory(site);
  emit("select-site", {
    lng: parseFloat(site.location_lng),
    lat: parseFloat(site.location_lat),
    name: site.name,
  });
  emit("close");
};

// Click a history item — find the full site and select it
const selectFromHistory = (historyItem) => {
  const fullSite = props.allSites.find((s) => s.id === historyItem.id);
  if (!fullSite) return;
  selectSite(fullSite);
};
</script>

<template>
  <Transition name="fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-999 flex flex-col items-center pt-16 px-20"
    >
      <div
        class="absolute inset-0 bg-[#001529]/70 backdrop-blur-md"
        @click="$emit('close')"
      ></div>

      <div
        class="relative w-full max-w-[90%] bg-[#1a2b3c] border border-white/20 rounded-xl shadow-2xl overflow-hidden"
      >
        <!-- SEARCH INPUT -->
        <div class="flex items-center p-5 border-b border-white/20">
          <i class="fas fa-search text-white/30 mr-4 text-xl"></i>
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search for hospitals, government services, transport routes..."
            class="bg-transparent border-none outline-none text-white w-full text-lg placeholder:text-white/20"
            autofocus
          />
          <button
            @click="$emit('close')"
            class="text-white/50 hover:text-white px-2"
          >
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>

        <!-- RESULTS AREA -->
        <div class="p-8 max-h-[70vh] overflow-y-auto">
          <!-- EMPTY STATE — show recent searches when nothing is typed -->
          <div v-if="!searchQuery">
            <!-- Has history -->
            <div v-if="searchHistory.length > 0">
              <div class="flex items-center justify-between mb-5">
                <p
                  class="text-white/50 text-[13px] font-black uppercase tracking-[0.2em]"
                >
                  🕐 Recent Searches
                </p>
                <button
                  @click="clearHistory"
                  class="text-white/30 hover:text-red-400 text-xs transition-colors"
                >
                  Clear All
                </button>
              </div>
              <div class="space-y-2">
                <div
                  v-for="item in searchHistory"
                  :key="item.id"
                  class="group flex items-center justify-between p-3.5 rounded-lg cursor-pointer transition-all duration-200 hover:bg-white/5"
                >
                  <!-- Click name to re-search -->
                  <div
                    class="flex items-center gap-4 flex-1"
                    @click="selectFromHistory(item)"
                  >
                    <div
                      class="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center shrink-0 group-hover:border-white/50"
                    >
                      <i class="fas fa-clock text-white/30 text-[10px]"></i>
                    </div>
                    <span
                      class="text-white/70 group-hover:text-white transition-colors text-sm"
                    >
                      {{ item.name }}
                    </span>
                  </div>
                  <!-- Remove single history item -->
                  <button
                    @click.stop="removeHistory(item.id)"
                    class="text-white/20 hover:text-red-400 text-xs px-2 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>

            <!-- No history yet -->
            <div v-else class="text-center text-white/30 py-10">
              <p class="text-sm">Start typing to search sites...</p>
            </div>
          </div>

          <!-- RESULTS — show when something is typed -->
          <div v-else>
            <!-- BEST MATCHES SECTION -->
            <div v-if="bestMatches.length > 0">
              <p
                class="text-blue-400 text-[13px] font-black uppercase tracking-[0.2em] mb-5"
              >
                Best Matches ({{ bestMatches.length }})
              </p>
              <div class="space-y-2 mb-6">
                <div
                  v-for="site in bestMatches"
                  :key="site.id"
                  @click="selectSite(site)"
                  class="group flex gap-4 items-center p-3.5 rounded-lg cursor-pointer transition-all duration-200 hover:bg-white/5"
                >
                  <div
                    class="w-8 h-8 rounded-full border border-blue-400/30 flex items-center justify-center shrink-0 transition-colors group-hover:border-blue-400"
                  >
                    <i class="fas fa-info text-blue-400 text-[10px]"></i>
                  </div>
                  <div class="flex flex-col">
                    <h4
                      class="text-white font-medium transition-colors group-hover:text-blue-300"
                      v-html="highlight(site.name)"
                    ></h4>
                    <p
                      class="text-white/40 text-sm transition-colors group-hover:text-white/90"
                      v-html="highlight(site.description)"
                    ></p>
                  </div>
                </div>
              </div>
            </div>

            <!-- OTHER RESULTS SECTION -->
            <div v-if="otherResults.length > 0">
              <p
                class="text-blue-400 text-[13px] font-black uppercase tracking-[0.2em] mb-5"
              >
                Other Results ({{ otherResults.length }})
              </p>
              <div class="space-y-2 mb-6">
                <div
                  v-for="site in otherResults"
                  :key="site.id"
                  @click="selectSite(site)"
                  class="group flex gap-4 items-center p-3.5 rounded-lg cursor-pointer transition-all duration-200 hover:bg-white/5"
                >
                  <div
                    class="w-8 h-8 rounded-full border border-blue-400/30 flex items-center justify-center shrink-0 transition-colors group-hover:border-blue-400"
                  >
                    <i class="fas fa-info text-blue-400 text-[10px]"></i>
                  </div>
                  <div class="flex flex-col">
                    <h4
                      class="text-white font-medium transition-colors group-hover:text-blue-300"
                      v-html="highlight(site.name)"
                    ></h4>
                    <p
                      class="text-white/40 text-sm transition-colors group-hover:text-white/90"
                      v-html="highlight(site.description)"
                    ></p>
                  </div>
                </div>
              </div>
            </div>

            <!-- NO RESULTS STATE -->
            <div
              v-if="bestMatches.length === 0 && otherResults.length === 0"
              class="text-center text-white/30 py-8"
            >
              <p class="text-sm">
                No results found for "<span class="text-white/50">{{
                  searchQuery
                }}</span
                >"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
div::-webkit-scrollbar {
  width: 12px;
}
div::-webkit-scrollbar-track {
  background: #15232f;
}
div::-webkit-scrollbar-thumb {
  background-color: #facc15;
  border-radius: 10px;
  border: 2px solid rgba(26, 43, 60, 0.8);
}
div::-webkit-scrollbar-thumb:hover {
  background-color: #fde047;
}
</style>
