<script setup>
import { ref, computed } from "vue";

import { useToast } from "../useToast.js";
const { success } = useToast();

// The selected site object passed from Dashboard.vue when a polygon is clicked.
// Contains all site data from the API: id, name, status, category_name, etc.
const props = defineProps(["site", "isExpanded"]);
const emit = defineEmits(["close"]);

// Tracks which report button is currently active (highlighted green)
// Default is "comprehensive" so it shows on first open
const activeReport = ref("comprehensive");

// The 5 report buttons configuration
const reportButtons = [
  { id: "comprehensive", label: "Comprehensive Report" },
  { id: "sioe", label: "SIOE Financial Summary" },
  { id: "land", label: "Land Lease Information" },
  { id: "appraisal", label: "Appraisal of Land/Property" },
  { id: "generate", label: "Generate Report" },
];

// The dynamic content shown below the buttons — changes based on activeReport
const reportContent = computed(() => {
  const name = props.site?.name ?? "this site";
  const contents = {
    comprehensive: {
      title: "Generate Comprehensive Report",
      description: `Generate a detailed executive report for <strong>${name}</strong> including all technical specifications, performance analytics, maintenance history, and strategic recommendations.`,
      listTitle: "Report Contents:",
      list: [
        "Site Information & Classification",
        "Structural Engineering Specifications",
        "Infrastructure Performance Metrics",
        "System Status & Connectivity",
        "Maintenance & Inspection Records",
        "Strategic Recommendations",
      ],
      buttonLabel: "GENERATE EXECUTIVE REPORT",
      buttonStyle: "green", // green button
    },
    sioe: {
      title: "SIOE Financial Summary",
      description: `Generate financial summary report for <strong>${name}</strong>.`,
      list: [],
      buttonLabel: "GENERATE FINANCIAL SUMMARY",
      buttonStyle: "green",
    },
    land: {
      title: "Land Lease Information",
      description: `Generate land lease information report for <strong>${name}</strong>.`,
      list: [],
      buttonLabel: "GENERATE LEASE REPORT",
      buttonStyle: "green",
    },
    appraisal: {
      title: "Appraisal of Land/Property",
      description: `Generate property appraisal report for <strong>${name}</strong>.`,
      list: [],
      buttonLabel: "GENERATE APPRAISAL REPORT",
      buttonStyle: "green",
    },
    generate: {
      title: "Generate Comprehensive Report",
      description: `Generate a detailed executive report for <strong>${name}</strong> including all technical specifications, performance analytics, maintenance history, and strategic recommendations.`,
      listTitle: "Report Contents:",
      list: [
        "Site Information & Classification",
        "Technical Specifications",
        "Performance Analytics",
        "Operational Status",
        "Activity History",
        "Strategic Recommendations",
      ],
      buttonLabel: "Generate Executive Report",
      buttonStyle: "blue", // blue button
    },
  };
  return contents[activeReport.value];
});

// Format the location as "15.207118° N, 120.737691° E"
const formattedLocation = computed(() => {
  if (!props.site) return "—";
  const lat = parseFloat(props.site.location_lat).toFixed(6);
  const lng = parseFloat(props.site.location_lng).toFixed(6);
  return `${lat}° N, ${lng}° E`;
});

// TABLET FIX: Same pattern as other components
const isTablet = ref(window.innerWidth < 1024);
window.addEventListener("resize", () => {
  isTablet.value = window.innerWidth < 1024;
});

// Toast notifications for each report button
function handleGenerateReport() {
  if (activeReport.value === "comprehensive") {
    success("Report Generated Successfully!");
  } else if (activeReport.value === "sioe") {
    success("Summary Generated Successfully!");
  } else if (activeReport.value === "land") {
    success("Lease Report Generated Successfully!");
  } else if (activeReport.value === "appraisal") {
    success("Appraisal Report Generated Successfully!");
  } else if (activeReport.value === "generate") {
    success("Comprehensive Report Generated Successfully!");
  }
}
</script>

<template>
  <!-- Only render if a site is selected -->
  <Transition name="slide-right">
    <div
      v-if="site"
      class="fixed right-0 w-115 bg-[#0d1f30] border-l border-white/10 z-40 flex flex-col overflow-y-auto font-['Inter',sans-serif] transition-all duration-500 ease-in-out"
      :style="{
        top: isExpanded ? (isTablet ? '154px' : '228px') : '0px',
        bottom: '0px',
      }"
    >
      <!-- ── HEADER ─────────────────────────────────────────── -->
      <div
        class="flex items-center justify-between px-5 py-5 border-b border-white/10"
      >
        <h2 class="text-white font-bold text-base">Site Information</h2>
        <button
          @click="emit('close')"
          class="text-white/50 hover:text-white transition-colors text-lg"
        >
          ✕
        </button>
      </div>

      <!-- ── STATUS + DEVICE CHANNEL ───────────────────────── -->
      <div class="px-5 py-4 border-b border-white/10">
        <div class="flex items-center gap-2 mb-1">
          <span class="w-3 h-3 rounded-full bg-green-500"></span>
          <span class="text-green-400 font-semibold text-sm">Active</span>
        </div>
        <p class="text-yellow-400 text-sm font-semibold">
          Device Channel: <span class="text-white">{{ site.id }}</span>
        </p>
      </div>

      <!-- ── SITE NAME + DETAILS TABLE ─────────────────────── -->
      <div class="px-5 py-4 border-b border-white/10">
        <h3 class="text-white text-xl font-bold mb-1">{{ site.name }}</h3>
        <p class="text-white/60 text-sm font-semibold mb-4">Site Details</p>

        <!-- Details rows -->
        <div class="space-y-3">
          <div class="flex justify-between text-sm">
            <span class="text-white/50">Category:</span>
            <span class="text-white font-medium text-right">{{
              site.category_name ?? "—"
            }}</span>
          </div>
          <div
            class="flex justify-between text-sm border-t border-white/5 pt-3"
          >
            <span class="text-white/50">Zone Type:</span>
            <span class="text-white font-medium">{{ site.id }}</span>
          </div>
          <div
            class="flex justify-between text-sm border-t border-white/5 pt-3"
          >
            <span class="text-white/50">Subcategory:</span>
            <span class="text-white font-medium text-right">{{
              site.subcategory_name ?? "—"
            }}</span>
          </div>
          <div
            class="flex justify-between text-sm border-t border-white/5 pt-3"
          >
            <span class="text-white/50">Status:</span>
            <span class="text-white font-medium">{{ site.status ?? "—" }}</span>
          </div>
          <div
            class="flex justify-between text-sm border-t border-white/5 pt-3"
          >
            <span class="text-white/50">Location:</span>
            <span class="text-white font-medium text-right">{{
              formattedLocation
            }}</span>
          </div>
          <div
            class="flex justify-between text-sm border-t border-white/5 pt-3"
          >
            <span class="text-white/50">Lot Size:</span>
            <span class="text-white font-medium">{{
              site.lot_size ?? "—"
            }}</span>
          </div>
          <div
            class="flex justify-between text-sm border-t border-white/5 pt-3"
          >
            <span class="text-white/50">Lease Expiry:</span>
            <span class="text-white font-medium">{{
              site.lease_expiry ?? "—"
            }}</span>
          </div>
          <div
            class="flex justify-between text-sm border-t border-white/5 pt-3"
          >
            <span class="text-white/50">Employees:</span>
            <span class="text-white font-medium">{{
              site.employees ?? "—"
            }}</span>
          </div>
        </div>
      </div>

      <!-- ── REPORT BUTTONS ─────────────────────────────────── -->
      <div class="px-5 py-4 border-b border-white/10">
        <div class="grid grid-cols-2 gap-3">
          <!-- First 4 buttons in 2x2 grid -->
          <button
            v-for="btn in reportButtons.slice(0, 4)"
            :key="btn.id"
            @click="activeReport = btn.id"
            :class="[
              'px-3 py-3 rounded text-sm font-medium transition-colors text-align-center',
              activeReport === btn.id
                ? 'bg-green-500 text-white'
                : 'bg-[#1a2f45] text-white/70 hover:text-white hover:bg-[#1e3650] border border-white/20 hover:border-green-500/50',
            ]"
          >
            {{ btn.label }}
          </button>
        </div>
        <!-- Generate Report button — full width -->
        <button
          @click="activeReport = 'generate'"
          :class="[
            'w-full mt-3 px-3 py-3 rounded text-sm font-medium transition-colors text-align-center',
            activeReport === 'generate'
              ? 'bg-green-500 text-white'
              : 'bg-[#1a2f45] text-white/70 hover:text-white hover:bg-[#1e3650] border border-white/20 hover:border-green-500/50',
          ]"
        >
          Generate Report
        </button>
      </div>

      <!-- ── DYNAMIC REPORT CONTENT ────────────────────────── -->
      <div class="px-5 py-4">
        <h4 class="text-white font-bold text-lg mb-3">
          {{ reportContent.title }}
        </h4>
        <p
          class="text-white/70 text-sm leading-relaxed mb-4"
          v-html="reportContent.description"
        ></p>

        <!-- Report contents list (only for comprehensive and generate) -->
        <div
          v-if="reportContent.list.length > 0"
          class="bg-[#0a1929] border border-white/20 rounded-xl p-4 mb-4"
        >
          <p class="text-yellow-400 text-sm font-bold mb-3">
            {{ reportContent.listTitle ?? "Report Contents:" }}
          </p>
          <ul class="space-y-2">
            <li
              v-for="item in reportContent.list"
              :key="item"
              class="flex items-center gap-2 text-white/70 text-sm"
            >
              <span class="text-white/40">•</span> {{ item }}
            </li>
          </ul>
        </div>

        <!-- Generate button -->
        <button
          @click="handleGenerateReport"
          :class="[
            'w-full py-3 rounded font-bold text-sm flex items-center justify-center gap-2 transition-colors',
            reportContent.buttonStyle === 'green'
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white',
          ]"
        >
          📄 {{ reportContent.buttonLabel }}
        </button>
      </div>
    </div>
  </Transition>
</template>
```
<style scoped>
/* Custom yellow scrollbar for the panel */
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

/* Slide in from right animation */
.slide-right-enter-active,
.slide-right-leave-active {
  transition:
    transform 0.3s ease-in-out,
    opacity 0.3s ease-in-out;
}
.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
.slide-right-enter-to,
.slide-right-leave-from {
  transform: translateX(0);
  opacity: 1;
}
</style>
