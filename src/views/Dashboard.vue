<script setup>
// Import ref() from Vue (Composition API) to create reactive state variables
// ref() makes a reactive variable that updates the UI when its value changes
import { ref, watch, computed } from "vue";

// Import axios for making HTTP requests to fetch site data from the API
import api from "../axios-test/axiosInstance.js";

// Import the MapView component which will display the interactive map in the main content area
import MapView from "../components/MapView.vue";

// Import FontAwesome CSS and JS for using icons in the app
import "@fortawesome/fontawesome-free/css/all.css";
import "@fortawesome/fontawesome-free/js/all.js";

// Import child components used in this main app component
// These are the layout parts of your app (see their code for details)
import AppHeaderComponent from "../components/AppHeader.vue";
import SideNav from "../components/SideNav.vue";
import ContentPanel from "../components/ContentPanel.vue";
import ScreenReload from "../components/ScreenReload.vue";
import BottomNav from "../components/BottomNav.vue";

// This is the search overlay component that appears when the search button in the header is clicked.
import SearchOverlay from "../components/SearchOverlay.vue";

// These are the dashboard and panel components that appear as overlays when their respective buttons in the header are clicked.
import StrategicDashboard from "../components/StrategicDashboard.vue";
import PerformanceAnalytics from "../components/PerformanceAnalytics.vue";
import ExecutiveSummary from "../components/ExecutiveSummary.vue";
import IssueReport from "../components/IssueReport.vue";
import SiteInfoPanel from "../components/SiteInfoPanel.vue";

// This is the toast notification component that shows temporary messages at the bottom right of the screen.
import ToastNotification from "../components/ToastNotification.vue";

// =======================
// GLOBAL STATE (Reactive)
// =======================

// Controls whether header is expanded or collapsed (affects vertical positioning of header and content panel)
const isExpanded = ref(true);

// Stores which navigation tab is currently active (used to determine content shown in the content panel)
// Default tab is "Features"
const activeTab = ref("Features");

// Controls whether the content panel (SideNav related panel) is open or closed (slides in/out from the left)
const isPanelOpen = ref(true);

// Controls the full screen reload animation visibility (when true → show loading screen, when false → hide it)
const isScreenReloading = ref(false);

// Controls whether the search overlay is open or closed (when true → show search overlay, when false → hide it)
const isSearchOpen = ref(false);

// Stores the currently selected site from the search overlay (used to center map on that site)
const selectedSite = ref(null);

// Stores the list of all sites currently visible on the map based on selected features in the content panel (used to show/hide markers on the map)
const clickedSite = ref(null);

// Stores the list of all sites currently visible on the map based on selected features in the content panel (used to show/hide markers on the map)
const allSites = ref([]);

// Stores the list of sites selected in the content panel (used to show/hide markers on the map)
const selectedSites = ref([]);

// Stores the list of checked features in the content panel (used to show/hide markers on the map)
const checkedFeatures = ref([]);

// Controls whether the strategic dashboard is open or closed (when true → show dashboard overlay, when false → hide it)
const isStrategicDashboardOpen = ref(false);

// Controls whether the performance dashboard is open or closed (when true → show dashboard overlay, when false → hide it)
const isPerformanceOpen = ref(false);

// Controls whether the executive summary panel is open or closed (when true → show panel, when false → hide it)
const isExecutiveSummaryOpen = ref(false);

// Controls whether the issue report panel is open or closed (when true → show panel, when false → hide it)
const isIssueReportOpen = ref(false);

// =======================
// TABLET RESPONSIVE LAYOUT
// =======================

// TABLET FIX: Detect if the screen is tablet-sized (below 1024px = lg breakpoint).
// We need this in JavaScript because :style bindings can't use Tailwind breakpoints —
// they only accept actual values. This ref updates live when the window is resized.
// DESKTOP: When window.innerWidth >= 1024, isTablet is false → original values are used.
const isTablet = ref(window.innerWidth < 1024);
window.addEventListener("resize", () => {
  isTablet.value = window.innerWidth < 1024;
});

// HEADER HEIGHT REDUCTION: Updated top offset values to match the new shorter header.
// New header height breakdown:
//   - Header body (lg:h-40):  160px
//   - Nav bar:                 44px
//   - Toggle button:           24px
//   - Total desktop:          228px  (was 282px when header was lg:h-55)
//   - Total tablet:           160px  (was 190px — shorter because logo/padding smaller)
// When collapsed: 0px on both — header is fully hidden so map fills from top.
// DESKTOP: isTablet is false → 228px is used.
const mapTop = computed(() => {
  if (!isExpanded.value) return "0px";
  return isTablet.value ? "155px" : "228px";
});

// TABLET FIX: Compute the correct left margin for the main content area.
// On desktop (lg+): 380px open / 80px closed — original hardcoded values exactly.
// On tablet (md):   300px open / 80px closed — ContentPanel is narrower on tablet
//                   (SideNav 80px + ContentPanel ~220px = 300px total).
// DESKTOP: isTablet is false → 380px/80px → identical to the original values.
const mainMarginLeft = computed(() => {
  if (!isPanelOpen.value) return "80px";
  return isTablet.value ? "300px" : "380px";
});

// WATCHERS — These react to changes in reactive variables and perform side effects (like filtering sites based on selected features).
watch(checkedFeatures, (features) => {
  console.log("checkedFeatures fired:", features);
  console.log("allSites length:", allSites.value.length);
  console.log("allSites sample:", allSites.value[0]);
  console.log("category_name sample:", allSites.value[0].category_name);

  const categoryMap = {
    "Economic Zones": "Economic Zones",
    Locators: "Locator Management",
    Infrastructure: "Infrastructure Projects",
    "AFP Modernization": "AFP Modernization",
    Investments: "Investment Tracking",
    "Sustainability & Environment": "Sustainability & Environment",
  };

  const newSelectedSites = allSites.value
    .filter((site) =>
      features.some((f) => categoryMap[f] === site.category_name),
    )
    .map((site) => site.name);

  console.log(
    "newSelectedSites:",
    newSelectedSites.length,
    newSelectedSites[0],
  );

  selectedSites.value = newSelectedSites;
});

watch(checkedFeatures, (features) => {
  if (!allSites.value.length) return; // 👈 guard

  const categoryMap = {
    "Economic Zones": "Economic Zones",
    Locators: "Locator Management",
    Infrastructure: "Infrastructure Projects",
    "AFP Modernization": "AFP Modernization",
    Investments: "Investment Tracking",
    "Sustainability & Environment": "Sustainability & Environment",
  };

  const newSelectedSites = allSites.value
    .filter((site) =>
      features.some((f) => categoryMap[f] === site.category_name),
    )
    .map((site) => site.name);

  console.log("newSelectedSites count:", newSelectedSites.length);
  console.log("first site:", newSelectedSites[0]);

  selectedSites.value = newSelectedSites;
});
// =======================
// FUNCTIONS
// =======================

// Fetch all sites from the API and store them in the allSites ref. This is used for the search functionality in SearchOverlay.vue
// We use the api instance which already has the auth token in headers, so we don't need to worry about authentication here.
async function fetchAllSites() {
  try {
    // Using api instance which has the auth token in headers
    const response = await api.get("/sites");
    allSites.value = response.data.data;
  } catch (error) {
    console.error("Failed to fetch all sites:", error);
  }
}

// Fetch sites immediately when Dashboard loads
fetchAllSites();

// Function to simulate screen reload (animation)
function handleReload() {
  // Turn on loading screen
  isScreenReloading.value = true;

  // After 1.5 seconds, turn it off to simulate the end of a loading process
  setTimeout(() => {
    window.location.reload(); // This actually reloads the page, you can remove this line if you just want the animation without reloading
  }, 1500);
}
</script>

<template>
  <!-- SEARCH OVERLAY -->
  <SearchOverlay
    :isOpen="isSearchOpen"
    :allSites="allSites"
    @close="isSearchOpen = false"
    @select-site="
      (site) => {
        selectedSite = site;
        isSearchOpen = false;
      }
    "
  />

  <!-- SCREEN RELOAD OVERLAY -->
  <!-- 
    Pass the loading state as a prop.
    When true → show loading animation.
  -->
  <ScreenReload :isScreenLoading="isScreenReloading" />

  <!-- TOAST NOTIFICATIONS -->
  <ToastNotification />

  <!-- HEADER COMPONENT -->
  <AppHeaderComponent
    :isExpanded="isExpanded"
    @update:isExpanded="(v) => (isExpanded = v)"
    @open-search="isSearchOpen = true"
    @open-strategic-dashboard="
      isStrategicDashboardOpen = !isStrategicDashboardOpen;
      isPerformanceOpen = false;
      isExecutiveSummaryOpen = false;
      isIssueReportOpen = false;
    "
    @open-performance-analytics="
      isPerformanceOpen = !isPerformanceOpen;
      isStrategicDashboardOpen = false;
      isExecutiveSummaryOpen = false;
      isIssueReportOpen = false;
    "
    @open-executive-summary="
      isExecutiveSummaryOpen = !isExecutiveSummaryOpen;
      isStrategicDashboardOpen = false;
      isPerformanceOpen = false;
      isIssueReportOpen = false;
    "
    @open-issue-report="
      isIssueReportOpen = !isIssueReportOpen;
      isStrategicDashboardOpen = false;
      isPerformanceOpen = false;
      isExecutiveSummaryOpen = false;
    "
    :isStrategicOpen="isStrategicDashboardOpen"
    :isAnalyticsOpen="isPerformanceOpen"
    :isExecutiveOpen="isExecutiveSummaryOpen"
    :isIssueOpen="isIssueReportOpen"
  />

  <!-- SIDE NAVIGATION -->
  <SideNav
    :isExpanded="isExpanded"
    :activeTab="activeTab"
    :isPanelOpen="isPanelOpen"
    @update:activeTab="
      (val) => {
        activeTab = val;
        isPanelOpen = true;
      }
    "
    @togglePanel="
      (val) => {
        isPanelOpen = !isPanelOpen;
      }
    "
    @close="isPanelOpen = false"
    @reload="handleReload"
  />

  <!--CONTENT PANEL-->
  <ContentPanel
    :activeTab="activeTab"
    :isPanelOpen="isPanelOpen"
    :isExpanded="isExpanded"
    :selectedSites="selectedSites"
    :checkedFeatures="checkedFeatures"
    :allSites="allSites"
    @close="isPanelOpen = false"
    @update:selectedSites="(val) => (selectedSites = val)"
    @update:checkedFeatures="(val) => (checkedFeatures = val)"
    @fly-to-site="(site) => (selectedSite = site)"
  />

  <!-- STRATEGIC DASHBOARD -->
  <StrategicDashboard
    :isOpen="isStrategicDashboardOpen"
    :isExpanded="isExpanded"
    :isPanelOpen="isPanelOpen"
    @close="isStrategicDashboardOpen = false"
  />

  <!-- PERFORMANCE ANALYTICS DASHBOARD -->
  <PerformanceAnalytics
    :isOpen="isPerformanceOpen"
    :isExpanded="isExpanded"
    :isPanelOpen="isPanelOpen"
    @close="isPerformanceOpen = false"
  />

  <!-- EXECUTIVE SUMMARY PANEL -->
  <ExecutiveSummary
    :isOpen="isExecutiveSummaryOpen"
    :isExpanded="isExpanded"
    :isPanelOpen="isPanelOpen"
    @close="isExecutiveSummaryOpen = false"
  />

  <IssueReport
    :isOpen="isIssueReportOpen"
    :isExpanded="isExpanded"
    :isPanelOpen="isPanelOpen"
    @close="isIssueReportOpen = false"
  />

  <SiteInfoPanel
    :site="clickedSite"
    :isExpanded="isExpanded"
    @close="clickedSite = null"
  />

  <!-- MAIN CONTENT AREA -->
  <!--
      This is the main content area of the app.
      It shifts right when the side panel is open.
      It also shifts down when the header is expanded.

      TABLET FIX: marginLeft now uses computed "mainMarginLeft" instead of the
      hardcoded '380px'/'80px' strings. On tablet it uses 300px open / 80px closed.
      DESKTOP: When isTablet is false → 380px/80px → same as the original.
  -->
  <main
    class="fixed inset-0 transition-all duration-500 ease-in-out z-0"
    :style="{ marginLeft: mainMarginLeft }"
  >
    <!-- MAP VIEW -->
    <!--
      HEADER HEIGHT REDUCTION + TABLET FIX: top now uses computed "mapTop".
      On desktop expanded: 228px → matches new shorter header (was 282px).
      On tablet expanded:  160px → matches shorter tablet header (was 190px).
      When collapsed: 0px on both → header hidden, map fills from top.
    -->
    <div
      class="absolute inset-0 transition-all duration-500 ease-in-out"
      :style="{ top: mapTop }"
    >
      <MapView
        :selectedSite="selectedSite"
        :selectedSites="selectedSites"
        :checkedFeatures="checkedFeatures"
        :allSites="allSites"
        @polygon-clicked="(sites) => (clickedSite = sites)"
      />
    </div>

    <!-- BOTTOM NAV overlays on top of map -->
    <div class="absolute bottom-0 left-0 right-0 z-10">
      <BottomNav :allSites="allSites" />
    </div>
  </main>
</template>
