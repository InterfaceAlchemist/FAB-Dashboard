<script setup>
import { jsPDF } from "jspdf";
// SKELETON LOADER: Added watch to trigger loading state when panel opens.
import { ref, watch } from "vue";
import { getLogoBase64 } from "../utils/logoBase64.js";

import { useToast } from "../useToast.js";
const { success } = useToast();

import { Line, Bar, Radar, Doughnut } from "vue-chartjs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  layouts,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

// ── Same props pattern as StrategicDashboard.vue ──────────
// SKELETON LOADER: Stored in "props" so watch() can access isOpen.
const props = defineProps(["isOpen", "isExpanded", "isPanelOpen"]);
defineEmits(["close"]);

// ── Filter State ──────────────────────────────────────────
const selectedTimePeriod = ref("Q4 2024");
const selectedZone = ref("All Zones");
const selectedMetric = ref("Revenue Performance");
const selectedComparison = ref("vs Previous Period");

// ── Stats Cards Data ──────────────────────────────────────
const statsCards = [
  {
    value: "₱22.1B",
    label: "Total Portfolio Revenue",
    change: "+12.3% vs Q3 2024",
    borderColor: "#22d3ee",
  },
  {
    value: "89.4%",
    label: "Portfolio Occupancy Rate",
    change: "+3.2% vs previous period",
    borderColor: "#22d3ee",
  },
  {
    value: "15.7%",
    label: "Revenue Growth Rate",
    change: "Above target of 12%",
    borderColor: "#22d3ee",
  },
  {
    value: "₱2.8B",
    label: "EBITDA",
    change: "+18.5% margin improvement",
    borderColor: "#22d3ee",
  },
];

//` ── Line Chart Data & Options (for Revenue Trends) ─────────
const lineChartData = {
  labels: [
    "Q1 2023",
    "Q2 2023",
    "Q3 2023",
    "Q4 2023",
    "Q1 2024",
    "Q2 2024",
    "Q3 2024",
    "Q4 2024",
  ],
  datasets: [
    {
      label: "Revenue (₱B)",
      data: [16.2, 17.8, 18.5, 19.1, 19.8, 20.4, 21.2, 22.1],
      borderColor: "#22d3ee",
      backgroundColor: "rgba(34, 211, 238, 0.1)",
      borderWidth: 2.5,
      pointBackgroundColor: "#22d3ee",
      pointRadius: 4,
      pointHoverRadius: 6,
      tension: 0.4,
      fill: true,
    },
  ],
};

// Chart options with custom tooltip and axis styles to match the dark theme
const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "#0a1929",
      titleColor: "#22d3ee",
      bodyColor: "#ffffff",
      borderColor: "#22d3ee",
      borderWidth: 1,
    },
  },
  scales: {
    x: {
      ticks: { color: "rgba(255,255,255,0.8)", font: { size: 11.5 } },
      grid: { color: "rgba(255,255,255,0.05)" },
    },
    y: {
      ticks: { color: "rgba(255,255,255,0.8)", font: { size: 11.5 } },
      grid: { color: "rgba(255,255,255,0.05)" },
    },
  },
};

// ── Bar Chart Data & Options (for Occupancy Rates by Zone) ─────────
const barChartData = {
  labels: ["Clark Freeport", "BGC Taguig", "Subic Bay", "Bataan Tech Park"],
  datasets: [
    {
      label: "Occupancy Rate (%)",
      data: [92.3, 94.1, 87.6, 84.2],
      backgroundColor: ["#3b82f6", "#a855f7", "#22c55e", "#eab308"],
      borderRadius: { topLeft: 6, topRight: 6, bottomLeft: 0, bottomRight: 0 },
      borderSkipped: false,
    },
  ],
};

// Chart options with custom tooltip and axis styles to match the dark theme
const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "#0a1929",
      titleColor: "#22d3ee",
      bodyColor: "#ffffff",
      borderColor: "#22d3ee",
      borderWidth: 1,
    },
  },
  scales: {
    x: {
      ticks: { color: "rgba(255,255,255,0.8)", font: { size: 11.5 } },
      grid: { color: "rgba(255,255,255,0.05)" },
    },
    y: {
      min: 0,
      max: 100,
      ticks: { color: "rgba(255,255,255,0.8)", font: { size: 11.5 } },
      grid: { color: "rgba(255,255,255,0.05)" },
    },
  },
};

// ── Radar Chart Data & Options (for Growth Metrics Comparison) ─────────
const radarChartData = {
  labels: [
    "Revenue Growth",
    "Occupancy Growth",
    "Locator Growth",
    "Lease Rate Growth",
    "EBITDA Growth",
  ],
  datasets: [
    {
      label: "2024 Performance",
      data: [15.7, 3.2, 8.4, 11.2, 18.5],
      borderColor: "#22d3ee",
      backgroundColor: "rgba(34, 211, 238, 0.15)",
      borderWidth: 2,
      pointBackgroundColor: "#22d3ee",
      pointRadius: 4,
      pointHoverRadius: 6,
    },
  ],
};

// Chart options with custom tooltip and axis styles to match the dark theme
const radarChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "#0a1929",
      titleColor: "#22d3ee",
      bodyColor: "#ffffff",
      borderColor: "#22d3ee",
      borderWidth: 1,
    },
  },
  scales: {
    r: {
      min: 0,
      max: 20,
      ticks: {
        color: "rgba(255,255,255,1)",
        font: { size: 11 },
        backdropColor: "transparent",
        stepSize: 2,
      },
      grid: { color: "rgba(255,255,255,0.3)" },
      pointLabels: {
        color: "rgba(255,255,255,0.8)",
        font: { size: 11 },
        padding: 10,
      },
      angleLines: { color: "rgba(255,255,255,0.1)" },
    },
  },
};

// ── Doughnut Chart Data & Options (for Portfolio Performance Mix) ─────────
const doughnutChartData = {
  labels: ["Clark Freeport", "BGC Taguig", "Subic Bay", "Bataan Tech Park"],
  datasets: [
    {
      data: [37.1, 31.2, 19.5, 12.2],
      backgroundColor: ["#3b82f6", "#a855f7", "#22c55e", "#eab308"],
      borderColor: "#020f1a",
      borderWidth: 3,
      hoverOffset: 8,
    },
  ],
};

// Chart options with custom tooltip and legend styles to match the dark theme
const doughnutChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: "50%",
  plugins: {
    legend: {
      display: true,
      position: "bottom",
      labels: {
        color: "rgba(255,255,255,1)",
        font: { size: 11 },
        usePointStyle: true,
        pointStyle: "circle",
      },
    },
    tooltip: {
      backgroundColor: "#0a1929",
      titleColor: "#22d3ee",
      bodyColor: "#ffffff",
      borderColor: "#22d3ee",
      borderWidth: 1,
      callbacks: {
        label: (ctx) => ` ${ctx.label}: ${ctx.parsed}%`,
      },
    },
  },
};

// ── Zone Performance Table Data ───────────────────────────
const zonePerformance = [
  {
    name: "Clark Freeport",
    borderColor: "border-blue-500",
    revenue: "₱8.2B",
    occupancy: "92.3%",
    growth: "+16.8%",
    locators: 247,
    status: "Excellent",
    statusColor: "text-green-400",
    dot: "bg-green-400",
    leaseRate: "₱1,850",
  },
  {
    name: "BGC Taguig",
    borderColor: "border-purple-500",
    revenue: "₱6.9B",
    occupancy: "94.1%",
    growth: "+14.2%",
    locators: 189,
    status: "Excellent",
    statusColor: "text-green-400",
    dot: "bg-green-400",
    leaseRate: "₱3,200",
  },
  {
    name: "Subic Bay",
    borderColor: "border-green-500",
    revenue: "₱4.3B",
    occupancy: "87.6%",
    growth: "+18.9%",
    locators: 156,
    status: "Excellent",
    statusColor: "text-green-400",
    dot: "bg-green-400",
    leaseRate: "₱1,650",
  },
  {
    name: "Bataan Tech Park",
    borderColor: "border-yellow-500",
    revenue: "₱2.7B",
    occupancy: "84.2%",
    growth: "+12.1%",
    locators: 98,
    status: "Good",
    statusColor: "text-yellow-400",
    dot: "bg-yellow-400",
    leaseRate: "₱1,200",
  },
];

const handleExport = async () => {
  const logoBase64 = await getLogoBase64();
  const doc = new jsPDF("p", "mm", "a4");
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  let y = 0;

  // ── HELPER: draw a section title with a left accent bar ──
  const sectionTitle = (text, yPos) => {
    doc.setFillColor(6, 40, 64);
    doc.rect(14, yPos - 4, 3, 6, "F");
    doc.setTextColor(6, 40, 64);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(text, 19, yPos);
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(14, yPos + 2, pageW - 14, yPos + 2);
    return yPos + 8;
  };

  // ── HEADER ────────────────────────────────────────────────
  // Top navy bar
  doc.setFillColor(6, 40, 64);
  doc.rect(0, 0, pageW, 32, "F");

  // Orange accent line
  doc.setFillColor(243, 130, 0);
  doc.rect(0, 32, pageW, 2, "F");

  // Logo image — right side
  doc.addImage(logoBase64, "PNG", pageW - 45, 5, 32, 20);

  // Report title and subtitle
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Performance Analytics Report", 14, 14);

  // Subtitle info below title
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(180, 210, 230);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 21);
  doc.text(
    `Period: ${selectedTimePeriod.value}   |   Zone: ${selectedZone.value}   |   Metric: ${selectedMetric.value}`,
    14,
    27,
  );

  y = 42;

  // ── SECTION 1: KPI CARDS ──────────────────────────────────
  y = sectionTitle("Key Performance Indicators", y);

  statsCards.forEach((card, i) => {
    const col = i % 2;
    const cardX = 14 + col * 95;
    const cardY = y + Math.floor(i / 2) * 26;

    doc.setFillColor(245, 248, 252);
    doc.roundedRect(cardX, cardY, 90, 22, 2, 2, "F");

    doc.setFillColor(6, 40, 64);
    doc.roundedRect(cardX, cardY, 3, 22, 1, 1, "F");

    doc.setTextColor(6, 40, 64);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(card.value.replace("₱", "PHP "), cardX + 7, cardY + 9);

    doc.setTextColor(80, 80, 80);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.text(card.label, cardX + 7, cardY + 14);

    doc.setFillColor(220, 252, 231);
    doc.roundedRect(cardX + 7, cardY + 15.5, 76, 4.5, 1, 1, "F");
    doc.setTextColor(22, 101, 52);
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "bold");
    doc.text(`+ ${card.change}`, cardX + 9, cardY + 19);
  });

  y += 56;

  // ── SECTION 2: REVENUE TRENDS ─────────────────────────────
  y = sectionTitle("Revenue Trends", y);

  doc.setFillColor(6, 40, 64);
  doc.rect(14, y, 182, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("Quarter", 18, y + 5.5);
  doc.text("Revenue", 80, y + 5.5);
  doc.text("YoY Change", 130, y + 5.5);
  y += 8;

  const revenueChanges = [
    "-",
    "+9.9%",
    "+3.9%",
    "+3.2%",
    "+3.7%",
    "+3.0%",
    "+3.9%",
    "+4.2%",
  ];
  lineChartData.labels.forEach((label, i) => {
    doc.setFillColor(
      i % 2 === 0 ? 250 : 255,
      i % 2 === 0 ? 250 : 255,
      i % 2 === 0 ? 250 : 255,
    );
    doc.rect(14, y, 182, 7, "F");
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.2);
    doc.line(14, y + 7, pageW - 14, y + 7);
    doc.setTextColor(40, 40, 40);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(label, 18, y + 4.8);
    doc.text(`PHP ${lineChartData.datasets[0].data[i]}B`, 80, y + 4.8);
    doc.setTextColor(
      i === 0 ? 100 : 22,
      i === 0 ? 100 : 120,
      i === 0 ? 100 : 52,
    );
    doc.text(revenueChanges[i], 130, y + 4.8);
    y += 7;
  });

  y += 8;

  // ── SECTION 3: ZONE PERFORMANCE TABLE ─────────────────────
  y = sectionTitle("Zone Performance Summary", y);

  const cols = [
    "Zone",
    "Revenue",
    "Occupancy",
    "Growth",
    "Locators",
    "Status",
    "Lease Rate",
  ];
  const colX = [14, 46, 74, 98, 120, 142, 165];

  doc.setFillColor(6, 40, 64);
  doc.rect(14, y, 182, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  cols.forEach((col, i) => doc.text(col, colX[i] + 2, y + 5.5));
  y += 8;

  zonePerformance.forEach((zone, i) => {
    const rowBg = i % 2 === 0 ? [250, 250, 250] : [255, 255, 255];
    doc.setFillColor(...rowBg);
    doc.rect(14, y, 182, 8, "F");
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.2);
    doc.line(14, y + 8, pageW - 14, y + 8);
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.text(zone.name, colX[0] + 2, y + 5.5);
    doc.text(zone.revenue.replace("₱", "PHP "), colX[1] + 2, y + 5.5);
    doc.text(zone.occupancy, colX[2] + 2, y + 5.5);
    doc.setTextColor(22, 101, 52);
    doc.setFont("helvetica", "bold");
    doc.text(zone.growth, colX[3] + 2, y + 5.5);
    doc.setTextColor(40, 40, 40);
    doc.setFont("helvetica", "normal");
    doc.text(String(zone.locators), colX[4] + 2, y + 5.5);
    doc.setFillColor(22, 163, 74);
    doc.circle(colX[5] + 3, y + 4.5, 1.5, "F");
    doc.setTextColor(22, 101, 52);
    doc.setFont("helvetica", "bold");
    doc.text(zone.status, colX[5] + 6, y + 5.5);
    doc.setTextColor(40, 40, 40);
    doc.setFont("helvetica", "normal");
    doc.text(zone.leaseRate.replace("₱", "PHP "), colX[6] + 2, y + 5.5);
    y += 8;
  });

  y += 8;

  // ── SECTION 4: OCCUPANCY RATES ────────────────────────────
  y = sectionTitle("Occupancy Rates by Zone", y);

  doc.setFillColor(6, 40, 64);
  doc.rect(14, y, 182, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.text("Zone", 18, y + 5.5);
  doc.text("Occupancy Rate", 80, y + 5.5);
  doc.text("Performance", 130, y + 5.5);
  y += 8;

  const occupancyColors = {
    "Clark Freeport": [59, 130, 246],
    "BGC Taguig": [168, 85, 247],
    "Subic Bay": [34, 197, 94],
    "Bataan Tech Park": [234, 179, 8],
  };

  barChartData.labels.forEach((label, i) => {
    const rate = barChartData.datasets[0].data[i];
    doc.setFillColor(
      i % 2 === 0 ? 250 : 255,
      i % 2 === 0 ? 250 : 255,
      i % 2 === 0 ? 250 : 255,
    );
    doc.rect(14, y, 182, 8, "F");
    doc.setDrawColor(220, 220, 220);
    doc.line(14, y + 8, pageW - 14, y + 8);
    doc.setTextColor(40, 40, 40);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text(label, 18, y + 5.5);
    doc.text(`${rate}%`, 80, y + 5.5);
    doc.setFillColor(220, 220, 220);
    doc.roundedRect(130, y + 2, 50, 4, 1, 1, "F");
    const color = occupancyColors[label] || [6, 40, 64];
    doc.setFillColor(...color);
    doc.roundedRect(130, y + 2, (rate / 100) * 50, 4, 1, 1, "F");
    y += 8;
  });

  y += 10;

  // ── FOOTER ────────────────────────────────────────────────
  doc.setFillColor(6, 40, 64);
  doc.rect(0, pageH - 14, pageW, 14, "F");
  doc.setFillColor(243, 130, 0);
  doc.rect(0, pageH - 14, pageW, 1.5, "F");
  doc.setTextColor(180, 210, 230);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(
    "FAB Dashboard  —  Performance Analytics Report  —  Confidential",
    14,
    pageH - 6,
  );
  doc.text(`Page 1 of 1`, pageW - 14, pageH - 6, { align: "right" });

  // ── SAVE ─────────────────────────────────────────────────
  doc.save(
    `performance-analytics-${selectedTimePeriod.value.replace(" ", "-")}.pdf`,
  );
  success("PDF exported successfully!");
};

// TABLET FIX: Detect tablet screen size in JavaScript.
// Same pattern used in Dashboard.vue, SideNav.vue, ContentPanel.vue, StrategicDashboard.vue.
// Needed because :style bindings can't use Tailwind breakpoints (md:, lg:).
// DESKTOP: When window.innerWidth >= 1024, isTablet = false → original values used.
const isTablet = ref(window.innerWidth < 1024);
window.addEventListener("resize", () => {
  isTablet.value = window.innerWidth < 1024;
});

// ── SKELETON LOADER ───────────────────────────────────────
// Same pattern as StrategicDashboard.vue.
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
  <Transition name="fade">
    <div
      v-if="isOpen"
      class="fixed bg-[#020f1a] z-39 overflow-y-auto font-['Inter',sans-serif] transition-all duration-500 ease-in-out"
      :style="{
        // TABLET FIX: Same pattern as StrategicDashboard.vue.
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
        <h1 class="text-white text-2xl font-bold">Performance Analytics</h1>
        <button
          @click="$emit('close')"
          class="text-white/50 hover:text-white text-2xl transition-colors"
        >
          ✕
        </button>
      </div>

      <!-- ═══════════════════════════════════════════════════
           SKELETON LOADER
           Mimics: filter bar, 4 stat cards, 2 chart rows, table
      ════════════════════════════════════════════════════ -->
      <div v-if="isLoading" class="px-8 py-6 space-y-8">
        <!-- Skeleton: Filter Bar (4 dropdowns) -->
        <div
          class="bg-[#0a1929] border border-white/10 rounded-xl p-5 animate-pulse"
        >
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div v-for="i in 4" :key="i" class="flex flex-col gap-2">
              <div class="h-3 bg-white/10 rounded w-20"></div>
              <div class="h-10 bg-white/10 rounded"></div>
            </div>
          </div>
        </div>

        <!-- Skeleton: Stats Cards (4 boxes) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            v-for="i in 4"
            :key="i"
            class="bg-[#0a1929] border border-white/10 rounded-xl p-5 animate-pulse"
          >
            <div class="h-8 bg-white/10 rounded w-3/4 mb-3"></div>
            <div class="h-3 bg-white/10 rounded w-full mb-2"></div>
            <div class="h-7 bg-white/10 rounded-full w-full mt-4"></div>
          </div>
        </div>

        <!-- Skeleton: Charts Row 1 (Line + Bar charts side by side) -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div
            v-for="i in 2"
            :key="i"
            class="bg-[#0a1929] border border-white/10 rounded-xl p-6 animate-pulse"
          >
            <div class="flex justify-between mb-1">
              <div class="h-5 bg-white/10 rounded w-40"></div>
              <div class="h-4 bg-white/10 rounded w-24"></div>
            </div>
            <div class="h-3 bg-white/10 rounded w-56 mb-4"></div>
            <!-- Chart area placeholder -->
            <div class="h-95 bg-white/10 rounded"></div>
          </div>
        </div>

        <!-- Skeleton: Charts Row 2 (Radar + Doughnut charts) -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div
            v-for="i in 2"
            :key="i"
            class="bg-[#0a1929] border border-white/10 rounded-xl p-6 animate-pulse"
          >
            <div class="flex justify-between mb-1">
              <div class="h-5 bg-white/10 rounded w-48"></div>
              <div class="h-4 bg-white/10 rounded w-24"></div>
            </div>
            <div class="h-3 bg-white/10 rounded w-48 mb-4"></div>
            <!-- Chart area placeholder -->
            <div class="h-95 bg-white/10 rounded-xl"></div>
          </div>
        </div>

        <!-- Skeleton: Zone Performance Table -->
        <div
          class="bg-[#0a1929] border border-white/10 rounded-xl overflow-hidden animate-pulse"
        >
          <!-- Table header bar -->
          <div
            class="flex items-center justify-between px-6 py-4 border-b border-white/10"
          >
            <div class="h-4 bg-white/10 rounded w-48"></div>
            <div class="h-8 bg-white/10 rounded w-24"></div>
          </div>
          <!-- Table header row -->
          <div class="bg-[#0d2035] px-6 py-3 grid grid-cols-7 gap-4">
            <div v-for="i in 7" :key="i" class="h-3 bg-white/10 rounded"></div>
          </div>
          <!-- Table rows -->
          <div
            v-for="i in 4"
            :key="i"
            class="px-6 py-4 grid grid-cols-7 gap-4 border-t border-white/5"
          >
            <div class="h-6 bg-white/10 rounded-full w-28"></div>
            <div
              v-for="j in 6"
              :key="j"
              class="h-3 bg-white/10 rounded self-center"
            ></div>
          </div>
        </div>
      </div>
      <!-- END SKELETON LOADER -->

      <!-- ═══════════════════════════════════════════════════
           REAL CONTENT — shows after 1s
      ════════════════════════════════════════════════════ -->
      <Transition name="content-fade">
        <div v-if="!isLoading" class="px-8 py-6 space-y-8">
          <!-- SECTION 1: FILTER BAR
               Already uses "grid-cols-2 lg:grid-cols-4" — works perfectly on tablet. ✅
          -->
          <div class="bg-[#0a1929] border border-white/10 rounded-xl p-5">
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <!-- Time Period -->
              <div class="flex flex-col gap-2">
                <label class="text-white/50 text-xs">Time Period</label>
                <select
                  v-model="selectedTimePeriod"
                  class="bg-[#0d2035] border border-white/10 text-white rounded px-3 py-3 text-sm focus:outline-none focus:border-cyan-500/60"
                >
                  <option>Q4 2024</option>
                  <option>Full Year 2024</option>
                  <option>Year-To-Date</option>
                  <option>Trailing 12 Months</option>
                </select>
              </div>

              <!-- Zone Selection -->
              <div class="flex flex-col gap-2">
                <label class="text-white/50 text-xs">Zone Selection</label>
                <select
                  v-model="selectedZone"
                  class="bg-[#0d2035] border border-white/10 text-white rounded px-3 py-3 text-sm focus:outline-none focus:border-cyan-500/60"
                >
                  <option>All Zones</option>
                  <option>Clark Freeport Zone</option>
                  <option>Subic Bay Freeport</option>
                  <option>Bataan Technology Park</option>
                  <option>Bonifacio Global City</option>
                </select>
              </div>

              <!-- Performance Metric -->
              <div class="flex flex-col gap-2">
                <label class="text-white/50 text-xs">Performance Metric</label>
                <select
                  v-model="selectedMetric"
                  class="bg-[#0d2035] border border-white/10 text-white rounded px-3 py-3 text-sm focus:outline-none focus:border-cyan-500/60"
                >
                  <option>Revenue Performance</option>
                  <option>Occupancy Rates</option>
                  <option>Growth Metrics</option>
                  <option>Operational Efficiency</option>
                </select>
              </div>

              <!-- Comparison -->
              <div class="flex flex-col gap-2">
                <label class="text-white/50 text-xs">Comparison</label>
                <select
                  v-model="selectedComparison"
                  class="bg-[#0d2035] border border-white/10 text-white rounded px-3 py-3 text-sm focus:outline-none focus:border-cyan-500/60"
                >
                  <option>vs Previous Period</option>
                  <option>vs Previous Year</option>
                  <option>vs Budget Target</option>
                  <option>vs Industry Average</option>
                </select>
              </div>
            </div>
          </div>

          <!-- SECTION 2: STATS CARDS
               Already uses "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" — works on tablet. ✅
          -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              v-for="card in statsCards"
              :key="card.label"
              class="relative bg-[#0a1929] rounded-xl p-5 transition-all duration-300 overflow-hidden hover:brightness-130"
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
              <!-- Top gradient bar -->
              <div
                class="absolute top-0 left-0 right-0 h-1.25"
                :style="{
                  background: `linear-gradient(to right, ${card.borderColor}, #6366f1)`,
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
                  ↗ {{ card.change }}
                </span>
              </div>
            </div>
          </div>

          <!-- SECTION 3: CHARTS ROW 1 — Revenue Trends + Occupancy by Zone
               Already uses "grid-cols-1 lg:grid-cols-2" — stacks on tablet, side by side on desktop. ✅
          -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <!-- Revenue Trends Chart -->
            <div class="bg-[#0a1929] border border-white/10 rounded-xl p-6">
              <div class="flex items-center justify-between mb-1">
                <h3 class="text-cyan-400 text-xl font-bold">Revenue Trends</h3>
                <span class="text-green-400 text-sm font-semibold"
                  >↗ +15.7% growth</span
                >
              </div>
              <p class="text-white text-xs mb-4">
                Quarterly revenue performance across all zones
              </p>
              <div class="h-95">
                <Line :data="lineChartData" :options="lineChartOptions" />
              </div>
            </div>

            <!-- Occupancy Rates by Zone Chart -->
            <div class="bg-[#0a1929] border border-white/10 rounded-xl p-6">
              <div class="flex items-center justify-between mb-1">
                <h3 class="text-cyan-400 text-xl font-bold">
                  Occupancy Rates by Zone
                </h3>
                <span class="text-green-400 text-sm font-semibold"
                  >↗ Portfolio avg: 89.4%</span
                >
              </div>
              <p class="text-white text-xs mb-4">
                Current occupancy performance
              </p>
              <div class="h-95">
                <Bar :data="barChartData" :options="barChartOptions" />
              </div>
            </div>
          </div>

          <!-- SECTION 4: CHARTS ROW 2 — Growth Metrics + Portfolio Mix
               Already uses "grid-cols-1 lg:grid-cols-2" — stacks on tablet. ✅
          -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <!-- Growth Metrics Comparison — Radar Chart -->
            <div
              class="bg-[#0a1929] border border-white/10 rounded-xl p-6 overflow-visible"
            >
              <div class="flex items-center justify-between mb-1">
                <h3 class="text-cyan-400 text-xl font-bold">
                  Growth Metrics Comparison
                </h3>
                <span class="text-green-400 text-sm font-semibold"
                  >↗ All metrics positive</span
                >
              </div>
              <p class="text-white text-xs mb-4">
                YoY growth across key performance indicators
              </p>
              <div
                class="h-95 border border-white/10 rounded-xl flex items-center justify-center p-5"
              >
                <Radar :data="radarChartData" :options="radarChartOptions" />
              </div>
            </div>

            <!-- Portfolio Performance Mix — Donut Chart -->
            <div
              class="bg-[#0a1929] border border-white/10 rounded-xl p-6 overflow-visible"
            >
              <div class="flex items-center justify-between mb-1">
                <h3 class="text-cyan-400 text-xl font-bold">
                  Portfolio Performance Mix
                </h3>
                <span class="text-green-400 text-sm font-semibold"
                  >↗ Diversified portfolio</span
                >
              </div>
              <p class="text-white text-xs mb-4">
                Revenue contribution by zone
              </p>
              <div
                class="h-95 border border-white/10 rounded-xl flex items-center justify-center p-5"
              >
                <Doughnut
                  :data="doughnutChartData"
                  :options="doughnutChartOptions"
                />
              </div>
            </div>
          </div>

          <!-- SECTION 5: ZONE PERFORMANCE SUMMARY TABLE
               "overflow-x-auto" on the table wrapper already handles tablet — user can scroll horizontally. ✅
          -->
          <div
            class="bg-[#0a1929] border border-white/10 rounded-xl overflow-hidden"
          >
            <div
              class="flex items-center justify-between px-6 py-4 border-b border-white/10"
            >
              <h3 class="text-white font-bold">Zone Performance Summary</h3>
              <button
                @click="handleExport"
                class="px-4 py-2 border border-cyan-500 bg-cyan-400/5 hover:bg-cyan-400 hover:text-white text-cyan-500 text-sm font-bold rounded transition-colors"
              >
                Export Data
              </button>
            </div>

            <!-- Table Header -->
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr
                    class="bg-[#0d2035] text-white/60 text-xs uppercase tracking-wider"
                  >
                    <th class="text-left px-6 py-3">Zone</th>
                    <th class="text-left px-6 py-3">Revenue (₱B)</th>
                    <th class="text-left px-6 py-3">Occupancy (%)</th>
                    <th class="text-left px-6 py-3">Growth Rate (%)</th>
                    <th class="text-left px-6 py-3">Active Locators</th>
                    <th class="text-left px-6 py-3">Performance Status</th>
                    <th class="text-left px-6 py-3">Avg. Lease Rate (₱/sqm)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="zone in zonePerformance"
                    :key="zone.name"
                    class="border-t border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <!-- Zone Name Badge -->
                    <td class="px-6 py-4">
                      <span
                        :class="[
                          zone.borderColor,
                          'text-white text-xs font-bold px-3 py-1 rounded-full border bg-transparent',
                        ]"
                      >
                        {{ zone.name }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-white">{{ zone.revenue }}</td>
                    <td class="px-6 py-4 text-white">{{ zone.occupancy }}</td>
                    <td class="px-6 py-4 text-green-400 font-semibold">
                      {{ zone.growth }}
                    </td>
                    <td class="px-6 py-4 text-white">{{ zone.locators }}</td>
                    <!-- Status with dot -->
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-2">
                        <span
                          :class="[zone.dot, 'w-2 h-2 rounded-full']"
                        ></span>
                        <span :class="zone.statusColor" class="font-semibold">{{
                          zone.status
                        }}</span>
                      </div>
                    </td>
                    <td class="px-6 py-4 text-white">{{ zone.leaseRate }}</td>
                  </tr>
                </tbody>
              </table>
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

/* Same scrollbar style as StrategicDashboard.vue */
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
