<script setup>
import { ref, watch } from "vue";

import { useToast } from "../useToast.js";
const { success, warning, info } = useToast();

// SKELETON LOADER: Stored in "props" so watch() can access isOpen.
const props = defineProps(["isOpen", "isExpanded", "isPanelOpen"]);
defineEmits(["close"]);

// ── Filter State ──────────────────────────────────────────
const selectedReportType = ref("Board Presentation");
const selectedTimePeriod = ref("Q4 2024");
const selectedAudience = ref("Board of Directors");
const selectedFormat = ref("PowerPoint (.pptx)");

// ── Modal State ───────────────────────────────────────────
const isGenerateModalOpen = ref(false);

// ── Stats Cards ───────────────────────────────────────────
const statsCards = [
  {
    label: "Total Portfolio Value",
    value: "₱127.5B",
    change: "+8.2%",
    sub: "Asset valuation as of Q4 2024",
  },
  {
    label: "Annual Revenue",
    value: "₱22.1B",
    change: "+15.7%",
    sub: "Full year 2024 performance",
  },
  {
    label: "Portfolio ROI",
    value: "13.8%",
    change: "+2.1%",
    sub: "Return on investment",
  },
  {
    label: "Active Locators",
    value: "690",
    change: "+12.3%",
    sub: "Across all zones",
  },
  {
    label: "EBITDA Margin",
    value: "12.7%",
    change: "+1.8%",
    sub: "Operational efficiency",
  },
];

// ── Executive Performance Highlight Stats ────────────────
const highlightStats = [
  { value: "₱8.2B", label: "Clark Freeport Revenue" },
  { value: "94.1%", label: "BGC Occupancy Rate" },
  { value: "18.9%", label: "Subic Bay Growth" },
  { value: "₱2.8B", label: "Total EBITDA" },
];

// ── Strategic Priorities ──────────────────────────────────
const strategicPriorities = [
  {
    num: 1,
    title: "Sustainable Development",
    desc: "Green building certifications and renewable energy implementation",
  },
  {
    num: 2,
    title: "Digital Infrastructure",
    desc: "5G deployment and smart city technologies",
  },
  {
    num: 3,
    title: "Portfolio Expansion",
    desc: "New zone development and strategic acquisitions",
  },
  {
    num: 4,
    title: "Locator Diversification",
    desc: "Attract high-growth sectors and international investors",
  },
];

// ── Key Strategic Insights ────────────────────────────────
const strategicInsights = [
  {
    icon: "🏢",
    title: "Market Leadership",
    desc: "BCDA zones command 23% premium over industry average lease rates",
  },
  {
    icon: "📈",
    title: "Growth Trajectory",
    desc: "Consistent 15%+ annual growth over the past 3 years",
  },
  {
    icon: "🌱",
    title: "Sustainability Focus",
    desc: "67% of new developments achieve green building certifications",
  },
  {
    icon: "⚙️",
    title: "Operational Excellence",
    desc: "Industry-leading 89.4% portfolio occupancy rate",
  },
];

// ── Report Templates ──────────────────────────────────────
const reportTemplates = [
  {
    icon: "📊",
    title: "Board Quarterly",
    desc: "Comprehensive quarterly board presentation",
  },
  {
    icon: "💼",
    title: "Investor Update",
    desc: "Financial performance and strategic updates",
  },
  {
    icon: "🎯",
    title: "Strategic Review",
    desc: "Annual strategic planning and review",
  },
  {
    icon: "📉",
    title: "Performance Dashboard",
    desc: "Executive KPI dashboard and metrics",
  },
  {
    icon: "⚠️",
    title: "Risk Assessment",
    desc: "Portfolio risk analysis and mitigation",
  },
  {
    icon: "🌿",
    title: "Sustainability Report",
    desc: "ESG performance and initiatives",
  },
];

// ── Button Handlers ───────────────────────────────────────
const handleGenerateReport = () => {
  isGenerateModalOpen.value = true;
};
const handleScheduleReport = () => {
  info("Auto-report scheduling is currently under development.");
};
const handleShareReport = () => {
  info("Share & Distribute is currently under development.");
};
const handleTemplateClick = (template) => {
  success(`Template selected: ${template.title.toUpperCase()}.`);
};

const handleDownloadReport = () => {
  isGenerateModalOpen.value = false;
  success("Report generated successfully!");
};

// TABLET FIX: Detect tablet screen size in JavaScript.
// Same pattern used across Dashboard.vue, SideNav.vue, ContentPanel.vue,
// StrategicDashboard.vue, and PerformanceAnalytics.vue.
// DESKTOP: When window.innerWidth >= 1024, isTablet = false → original values used.
const isTablet = ref(window.innerWidth < 1024);
window.addEventListener("resize", () => {
  isTablet.value = window.innerWidth < 1024;
});

// ── SKELETON LOADER ───────────────────────────────────────
// Same pattern as StrategicDashboard.vue and PerformanceAnalytics.vue.
// isLoading = true when panel opens → shows skeleton for 1s → shows real content.
const isLoading = ref(false);
let loadingTimer = null;

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      // Panel just opened → start loading
      isLoading.value = true;
      clearTimeout(loadingTimer);
      // After 1.5 seconds, hide skeleton and show real content
      loadingTimer = setTimeout(() => {
        isLoading.value = false;
      }, 1000);
    } else {
      // Panel closed → reset for next open
      isLoading.value = false;
      clearTimeout(loadingTimer);
    }
  },
);
</script>

<template>
  <!-- ① Main Dashboard -->
  <Transition name="fade">
    <div
      v-if="isOpen"
      class="fixed bg-[#020f1a] z-39 overflow-y-auto font-['Inter',sans-serif] transition-all duration-500 ease-in-out"
      :style="{
        // TABLET FIX: Same pattern as StrategicDashboard and PerformanceAnalytics.
        // On desktop (lg+): isExpanded ? '284px' : '6px' — original values unchanged.
        // On tablet (md):   isExpanded ? '200px' : '6px' — matches shorter tablet header.
        top: isExpanded ? (isTablet ? '150px' : '220px') : '0px',

        // TABLET FIX: 300px on tablet matches mainMarginLeft in Dashboard.vue.
        // On desktop (lg+): clamp(0px, 380px, 100vw) — original value unchanged.
        left: isPanelOpen
          ? isTablet
            ? 'clamp(0px, 300px, 100vw)'
            : 'clamp(0px, 380px, 100vw)'
          : 'clamp(0px, 80px, 100vw)',

        right: '0px',
        bottom: '0px',
      }"
    >
      <!-- ── HEADER — always visible, even during loading ── -->
      <div
        class="flex items-center justify-between px-8 py-5 border-b border-white/10"
      >
        <h1 class="text-white text-2xl font-bold">Executive Summary</h1>
        <button
          @click="$emit('close')"
          class="text-white/50 hover:text-white text-2xl transition-colors"
        >
          ✕
        </button>
      </div>

      <!-- ═══════════════════════════════════════════════════
           SKELETON LOADER
           Mimics: generate report bar, 5 stat cards,
           executive summary + strategic priorities, insights, templates
      ════════════════════════════════════════════════════ -->
      <div v-if="isLoading" class="px-8 py-6 space-y-8">
        <!-- Skeleton: Generate Report Bar -->
        <div class="flex flex-col lg:flex-row gap-4">
          <!-- Dropdowns panel -->
          <div
            class="flex-1 bg-[#0a1929] border border-white/10 rounded-xl p-5 animate-pulse"
          >
            <div class="flex items-center gap-2 mb-4">
              <div class="h-4 bg-white/10 rounded w-6"></div>
              <div class="h-4 bg-white/10 rounded w-48"></div>
            </div>
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div v-for="i in 4" :key="i" class="flex flex-col gap-2">
                <div class="h-3 bg-white/10 rounded w-20"></div>
                <div class="h-10 bg-white/10 rounded"></div>
              </div>
            </div>
          </div>
          <!-- Buttons panel -->
          <div
            class="bg-[#0a1929] border border-white/10 rounded-xl p-5 flex flex-col gap-4 justify-center lg:min-w-70 animate-pulse"
          >
            <div class="grid grid-cols-2 gap-4">
              <div class="h-11 bg-white/10 rounded"></div>
              <div class="h-11 bg-white/10 rounded"></div>
            </div>
            <div class="h-11 bg-white/10 rounded"></div>
          </div>
        </div>

        <!-- Skeleton: Stats Cards (5 boxes) -->
        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div
            v-for="i in 5"
            :key="i"
            class="bg-[#0a1929] border border-white/10 rounded-xl p-5 animate-pulse"
          >
            <div class="h-1 bg-white/10 rounded-t-xl mb-3"></div>
            <div class="flex justify-between mb-3">
              <div class="h-3 bg-white/10 rounded w-3/4"></div>
              <div class="h-3 bg-white/10 rounded w-1/6"></div>
            </div>
            <div class="h-8 bg-white/10 rounded w-2/3 mb-2"></div>
            <div class="h-3 bg-white/10 rounded w-full"></div>
          </div>
        </div>

        <!-- Skeleton: Executive Summary + Strategic Priorities (2/3 + 1/3) -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <!-- Summary block -->
          <div
            class="lg:col-span-2 bg-[#0a1929] border border-white/10 rounded-xl p-6 animate-pulse"
          >
            <div class="flex items-center gap-2 mb-6">
              <div class="h-4 bg-white/10 rounded w-6"></div>
              <div class="h-4 bg-white/10 rounded w-56"></div>
            </div>
            <div class="h-3 bg-white/10 rounded w-32 mb-3"></div>
            <div class="space-y-2 mb-5">
              <div class="h-3 bg-white/10 rounded w-full"></div>
              <div class="h-3 bg-white/10 rounded w-5/6"></div>
              <div class="h-3 bg-white/10 rounded w-4/6"></div>
            </div>
            <!-- 2x2 highlight stats -->
            <div class="grid grid-cols-2 gap-3 mb-6">
              <div v-for="i in 4" :key="i" class="bg-slate-800/60 rounded p-3">
                <div class="h-6 bg-white/10 rounded w-2/3 mb-2"></div>
                <div class="h-3 bg-white/10 rounded w-full"></div>
              </div>
            </div>
            <div class="h-3 bg-white/10 rounded w-40 mb-3"></div>
            <div class="space-y-2 mb-5">
              <div class="h-3 bg-white/10 rounded w-full"></div>
              <div class="h-3 bg-white/10 rounded w-3/4"></div>
            </div>
            <div class="h-3 bg-white/10 rounded w-32 mb-3"></div>
            <div class="space-y-2">
              <div class="h-3 bg-white/10 rounded w-full"></div>
              <div class="h-3 bg-white/10 rounded w-3/4"></div>
            </div>
          </div>
          <!-- Strategic priorities -->
          <div
            class="bg-[#0a1929] border border-white/10 rounded-xl p-6 animate-pulse"
          >
            <div class="flex items-center gap-2 mb-5">
              <div class="h-4 bg-white/10 rounded w-5"></div>
              <div class="h-4 bg-white/10 rounded w-44"></div>
            </div>
            <div class="space-y-4">
              <div
                v-for="i in 4"
                :key="i"
                class="flex items-start gap-3 bg-[#0d2035] border border-white/10 rounded-xl p-4"
              >
                <div class="w-7 h-7 rounded-full bg-white/10 shrink-0"></div>
                <div class="flex-1">
                  <div class="h-3 bg-white/10 rounded w-3/4 mb-2"></div>
                  <div class="h-3 bg-white/10 rounded w-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Skeleton: Key Strategic Insights (4 cards) -->
        <div
          class="bg-[#0a1929] border border-white/10 rounded-xl p-6 animate-pulse"
        >
          <div class="flex items-center gap-2 mb-5">
            <div class="h-4 bg-white/10 rounded w-5"></div>
            <div class="h-4 bg-white/10 rounded w-44"></div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              v-for="i in 4"
              :key="i"
              class="bg-[#0d2035] border border-white/10 rounded-xl p-5"
            >
              <div class="h-8 w-8 bg-white/10 rounded mb-3"></div>
              <div class="h-3 bg-white/10 rounded w-3/4 mb-2"></div>
              <div class="h-3 bg-white/10 rounded w-full"></div>
              <div class="h-3 bg-white/10 rounded w-4/5 mt-1"></div>
            </div>
          </div>
        </div>

        <!-- Skeleton: Report Templates (6 cards) -->
        <div
          class="bg-[#0a1929] border border-white/10 rounded-xl p-6 animate-pulse"
        >
          <div class="flex items-center gap-2 mb-5">
            <div class="h-4 bg-white/10 rounded w-5"></div>
            <div class="h-4 bg-white/10 rounded w-36"></div>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div
              v-for="i in 6"
              :key="i"
              class="bg-[#0d2035] border border-white/10 rounded-xl p-8 flex flex-col items-center gap-3"
            >
              <div class="h-8 w-8 bg-white/10 rounded"></div>
              <div class="h-3 bg-white/10 rounded w-3/4"></div>
              <div class="h-3 bg-white/10 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
      <!-- END SKELETON LOADER -->

      <!-- ═══════════════════════════════════════════════════
           REAL CONTENT — shows after 1s
      ════════════════════════════════════════════════════ -->
      <Transition name="content-fade">
        <div v-if="!isLoading" class="px-8 py-6 space-y-8">
          <!-- SECTION 1: GENERATE REPORT BAR
               TABLET FIX: Changed outer wrapper from "flex gap-4" to "flex flex-col lg:flex-row gap-4".
               On desktop (lg+): side by side — "flex-row" → original layout unchanged.
               On tablet (md):   stacks vertically — "flex-col" → dropdowns on top, buttons below.
               This prevents the "min-w-70" buttons panel from squishing the dropdowns on 768px.
               Also removed "min-w-70" on tablet via "lg:min-w-70" so it takes full width when stacked.
          -->
          <div class="flex flex-col lg:flex-row gap-4">
            <div
              class="flex-1 bg-[#0a1929] border border-white/10 rounded-xl p-5 flex flex-col gap-4"
            >
              <div class="flex items-center gap-2">
                <span class="text-lg">📇</span>
                <h2 class="text-cyan-400 font-bold text-lg">
                  Generate Executive Report
                </h2>
              </div>
              <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div class="flex flex-col gap-2">
                  <label class="text-white/50 text-xs">Report Type</label>
                  <select
                    v-model="selectedReportType"
                    class="bg-[#0d2035] border border-white/10 text-white rounded px-3 py-3 text-sm focus:outline-none focus:border-cyan-500/60"
                  >
                    <option>Board Presentation</option>
                    <option>Investor Report</option>
                    <option>Operational Summary</option>
                    <option>Annual Report</option>
                  </select>
                </div>
                <div class="flex flex-col gap-2">
                  <label class="text-white/50 text-xs">Time Period</label>
                  <select
                    v-model="selectedTimePeriod"
                    class="bg-[#0d2035] border border-white/10 text-white rounded px-3 py-3 text-sm focus:outline-none focus:border-cyan-500/60"
                  >
                    <option>Q4 2024</option>
                    <option>Q3 2024</option>
                    <option>Full Year 2024</option>
                    <option>Year-To-Date</option>
                  </select>
                </div>
                <div class="flex flex-col gap-2">
                  <label class="text-white/50 text-xs">Audience Level</label>
                  <select
                    v-model="selectedAudience"
                    class="bg-[#0d2035] border border-white/10 text-white rounded px-3 py-3 text-sm focus:outline-none focus:border-cyan-500/60"
                  >
                    <option>Board of Directors</option>
                    <option>Executive Team</option>
                    <option>Investors</option>
                    <option>Public</option>
                  </select>
                </div>
                <div class="flex flex-col gap-2">
                  <label class="text-white/50 text-xs">Format</label>
                  <select
                    v-model="selectedFormat"
                    class="bg-[#0d2035] border border-white/10 text-white rounded px-3 py-3 text-sm focus:outline-none focus:border-cyan-500/60"
                  >
                    <option>PowerPoint (.pptx)</option>
                    <option>PDF Document</option>
                    <option>Word Document</option>
                    <option>Excel Workbook</option>
                  </select>
                </div>
              </div>
            </div>

            <!--
              TABLET FIX: "min-w-70" → "lg:min-w-70"
              On desktop (lg+): fixed minimum width of 280px — original behavior unchanged.
              On tablet (md):   no min-width — takes full width when stacked vertically.
            -->
            <div
              class="bg-[#0a1929] border border-white/10 rounded-xl p-5 flex flex-col gap-4 justify-center lg:min-w-70"
            >
              <div class="grid grid-cols-2 gap-4">
                <button
                  @click="handleGenerateReport"
                  class="flex items-center justify-center gap-2 px-4 py-3 bg-[#0d2035] border border-white/20 hover:border-cyan-500 text-white text-sm font-bold hover:brightness-125 rounded transition-colors cursor-pointer"
                >
                  📑 Generate Report
                </button>
                <button
                  @click="handleScheduleReport"
                  class="flex items-center justify-center gap-2 px-4 py-3 bg-[#0d2035] border border-white/20 hover:border-cyan-500 text-white text-sm font-bold hover:brightness-125 rounded transition-colors cursor-pointer"
                >
                  📅 Schedule Auto-Report
                </button>
              </div>
              <button
                @click="handleShareReport"
                class="flex items-center justify-center gap-2 px-4 py-3 bg-[#0d2035] border border-white/20 hover:border-cyan-500 text-white text-sm font-bold hover:brightness-125 rounded transition-colors cursor-pointer"
              >
                📤 Share & Distribute
              </button>
            </div>
          </div>

          <!-- SECTION 2: STATS CARDS
               TABLET FIX: Changed "sm:grid-cols-3" to "md:grid-cols-3".
               "sm:" fires at 640px which is below tablet (768px) — the cards were fine.
               "md:" ensures the 3-column layout starts exactly at tablet width.
               DESKTOP: lg:grid-cols-5 → unchanged, shows all 5 cards in one row. ✅
          -->
          <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div
              v-for="card in statsCards"
              :key="card.label"
              class="relative bg-[#0a1929] rounded-xl p-5 cursor-pointer transition-all duration-300 overflow-hidden"
              :style="{ border: '1px solid rgba(255,255,255,0.1)' }"
              @mouseover="
                (e) => {
                  e.currentTarget.style.border = '2px solid #facc24';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px #facc2430';
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
                class="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
                style="
                  background: linear-gradient(to right, #facc24, #22d3ee);
                  border-radius: 11px 11px 0 0;
                "
              ></div>
              <div class="flex items-center justify-between mb-3">
                <span class="text-white/90 text-sm">{{ card.label }}</span>
                <span class="text-green-400 text-sm font-bold"
                  >↗ {{ card.change }}</span
                >
              </div>
              <p class="text-cyan-400 text-3xl font-bold">{{ card.value }}</p>
              <p class="text-white/40 text-xs mt-2">{{ card.sub }}</p>
            </div>
          </div>

          <!-- SECTION 3: EXECUTIVE SUMMARY + STRATEGIC PRIORITIES
               Already uses "grid-cols-1 lg:grid-cols-3" — stacks on tablet. ✅
          -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div
              class="lg:col-span-2 bg-[#0a1929] border border-white/10 rounded-xl p-6"
            >
              <div class="flex items-center gap-2 mb-6">
                <span>📋</span>
                <h3 class="text-cyan-400 font-bold text-lg">
                  Executive Performance Summary
                </h3>
              </div>
              <p
                class="text-yellow-400 font-bold text-sm mb-2 border-b border-white/10 pb-2 pt-2"
              >
                Q4 2024 Highlights
              </p>
              <p class="text-white/60 text-sm leading-relaxed mb-5">
                BCDA achieved exceptional performance in Q4 2024, with total
                revenue reaching ₱22.1 billion, representing a 15.7%
                year-over-year growth. This growth was driven by strong
                performance across all zones, with particularly notable
                contributions from Clark Freeport Zone and Bonifacio Global
                City.
              </p>
              <div class="grid grid-cols-2 gap-3 mb-6">
                <div
                  v-for="stat in highlightStats"
                  :key="stat.label"
                  class="border-l-2 border-yellow-500 pl-4 py-3 bg-slate-800/60 rounded"
                >
                  <p class="text-cyan-400 text-xl font-bold">
                    {{ stat.value }}
                  </p>
                  <p class="text-white/50 text-xs">{{ stat.label }}</p>
                </div>
              </div>
              <p
                class="text-yellow-400 font-bold text-sm mb-2 border-b border-white/10 pb-2 pt-2"
              >
                Strategic Achievements
              </p>
              <p class="text-white/60 text-sm leading-relaxed mb-5">
                Key strategic initiatives delivered significant value creation,
                including the completion of major infrastructure projects,
                successful attraction of high-value locators, and implementation
                of sustainable development practices across all zones.
              </p>
              <p
                class="text-yellow-400 font-bold text-sm mb-2 border-b border-white/10 pb-2 pt-2"
              >
                Market Position
              </p>
              <p class="text-white/60 text-sm leading-relaxed">
                BCDA maintains its position as the leading developer of premier
                business districts in the Philippines, with industry-leading
                occupancy rates and premium lease rates.
              </p>
            </div>

            <div class="bg-[#0a1929] border border-white/10 rounded-xl p-6">
              <div class="flex items-center gap-2 mb-5">
                <span>🎯</span>
                <h3 class="text-cyan-400 font-bold text-lg">
                  Strategic Priorities 2025
                </h3>
              </div>
              <div class="space-y-4">
                <div
                  v-for="priority in strategicPriorities"
                  :key="priority.num"
                  class="flex items-start gap-3 bg-[#0d2035] border border-white/10 hover:border-cyan-500/40 hover:brightness-130 rounded-xl p-4"
                >
                  <span
                    class="w-7 h-7 rounded-full bg-yellow-500 text-black text-xs font-black flex items-center justify-center shrink-0 mt-0.5"
                    >{{ priority.num }}</span
                  >
                  <div>
                    <p class="text-white font-semibold text-sm">
                      {{ priority.title }}
                    </p>
                    <p class="text-white/60 text-xs mt-0.5">
                      {{ priority.desc }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- SECTION 4: KEY STRATEGIC INSIGHTS
               Already uses "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" — works on tablet. ✅
          -->
          <div class="bg-[#0a1929] border border-white/10 rounded-xl p-6">
            <div class="flex items-center gap-2 mb-5">
              <span>💡</span>
              <h3 class="text-cyan-400 font-bold text-lg">
                Key Strategic Insights
              </h3>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div
                v-for="insight in strategicInsights"
                :key="insight.title"
                class="bg-[#0d2035] border border-white/10 rounded-xl p-5 hover:border-cyan-500/40 hover:brightness-130 transition-colors"
              >
                <span class="text-2xl mb-3 block">{{ insight.icon }}</span>
                <p class="text-white font-bold text-sm mb-2">
                  {{ insight.title }}
                </p>
                <p class="text-white/60 text-xs leading-relaxed">
                  {{ insight.desc }}
                </p>
              </div>
            </div>
          </div>

          <!-- SECTION 5: REPORT TEMPLATES
               Already uses "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6" — works on tablet. ✅
          -->
          <div class="bg-[#0a1929] border border-white/10 rounded-xl p-6">
            <div class="flex items-center gap-2 mb-5">
              <span>📁</span>
              <h3 class="text-cyan-400 font-bold text-lg">Report Templates</h3>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div
                v-for="template in reportTemplates"
                :key="template.title"
                @click="handleTemplateClick(template)"
                class="bg-[#0d2035] rounded-xl p-8 flex flex-col items-center text-center cursor-pointer transition-all duration-300 hover:brightness-130"
                :style="{ border: '1px solid rgba(255,255,255,0.1)' }"
                @mouseover="
                  (e) => {
                    e.currentTarget.style.border = '2px solid #facc24';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px #facc2430';
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
                <span class="text-3xl mb-3">{{ template.icon }}</span>
                <p class="text-white font-bold text-sm mb-1">
                  {{ template.title }}
                </p>
                <p class="text-white/60 text-xs leading-tight">
                  {{ template.desc }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Transition>
      <!-- END REAL CONTENT -->
    </div>
  </Transition>

  <!-- ② Modal — OUTSIDE the scrollable div, sibling to the main Transition
       TABLET FIX: Changed "w-150" to "w-full max-w-lg mx-4".
       On desktop (lg+): modal stays centered with max-w-lg (similar to w-150).
       On tablet (md):   "w-full mx-4" gives 16px margins on each side — no overflow.
       DESKTOP: max-w-lg + centered flex → visually same as the original w-150. ✅
  -->
  <Transition name="modal-fade">
    <div
      v-if="isOpen && isGenerateModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div
        class="absolute inset-0 bg-black/60 backdrop-blur-sm"
        @click="isGenerateModalOpen = false"
      ></div>
      <div
        class="relative bg-[#0d1f30] border border-cyan-500/40 rounded-2xl p-8 w-full max-w-lg mx-4 shadow-2xl flex flex-col items-center text-center z-10"
      >
        <div class="mb-4 relative flex items-center justify-center">
          <div
            class="w-16 h-16 rounded-full bg-yellow-green/20 border border-yellow-500/40 flex items-center justify-center animate-pulse"
          >
            <svg viewBox="0 0 24 24" class="w-8 h-8 fill-yellow-400">
              <path
                d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6z"
              />
              <rect
                x="8"
                y="13"
                width="8"
                height="1.5"
                rx="0.75"
                class="animate-pulse"
              />
              <rect
                x="8"
                y="16"
                width="5"
                height="1.5"
                rx="0.75"
                class="animate-pulse"
              />
            </svg>
          </div>
          <!-- Spinning ring around it -->
          <div
            class="absolute w-20 h-20 rounded-full border-2 border-yellow-500/30 border-t-yellow-500 animate-spin"
          ></div>
        </div>
        <h2 class="text-yellow-400 text-xl font-bold mb-2">
          Generating Executive Report
        </h2>
        <p class="text-white/50 text-sm mb-6 leading-relaxed">
          Creating
          {{ selectedReportType.toLowerCase().replace(" ", "-") }} report for
          {{ selectedTimePeriod.toLowerCase().replace(" ", "-") }}<br />
          Audience: {{ selectedAudience.toLowerCase().replace(/ /g, "-")
          }}<br />
          Format: {{ selectedFormat.toLowerCase().split(" ")[0] }}
        </p>
        <div
          class="w-full bg-[#0a1929] border-t-2 border-yellow-500 rounded-lg p-5 text-left mb-5"
        >
          <p class="text-white font-bold text-sm mb-3">Report will include:</p>
          <ul class="space-y-2 text-white/70 text-sm">
            <li class="flex items-center gap-2">
              <span class="text-yellow-400">•</span> Executive summary and key
              highlights
            </li>
            <li class="flex items-center gap-2">
              <span class="text-yellow-400">•</span> Financial performance
              metrics
            </li>
            <li class="flex items-center gap-2">
              <span class="text-yellow-400">•</span> Zone-by-zone analysis
            </li>
            <li class="flex items-center gap-2">
              <span class="text-yellow-400">•</span> Strategic recommendations
            </li>
            <li class="flex items-center gap-2">
              <span class="text-yellow-400">•</span> Risk assessment and
              mitigation
            </li>
          </ul>
        </div>
        <button
          @click="handleDownloadReport"
          class="w-full py-3 bg-[#0a1929] border border-cyan-500/30 hover:bg-cyan-500/10 hover:border-cyan-500/80 text-white font-bold text-sm rounded-xl transition-all duration-300 cursor-pointer"
        >
          Download Report
        </button>
      </div>
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

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

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
