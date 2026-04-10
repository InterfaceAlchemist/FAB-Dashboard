<template>
  <div
    class="w-full font-['Inter',sans-serif] bg-[#001529]/70 border-t border-white/10 px-4 pt-4 overflow-x-auto custom-scrollbar relative"
  >
    <div class="flex gap-4 min-w-max pb-2.5">
      <div
        v-for="(stat, index) in stats"
        :key="stat.label"
        :class="[stat.bgColor, index === 0 ? 'text-black' : 'text-white']"
        class="flex flex-col justify-between p-5 rounded-lg w-75 h-26 shadow-lg transition-all duration-300 hover:scale-105 hover:brightness-120 border border-white/80 cursor-pointer relative overflow-hidden"
      >
        <div class="flex justify-between items-start">
          <span class="text-[16px] font-black Uppercase leading-tight w-2/3">
            {{ stat.label }}
          </span>
        </div>

        <div class="flex justify-between items-end">
          <!-- TASK 7: No more loading indicator needed — data comes from prop -->
          <span class="text-3xl font-semibold tabular-nums">{{
            stat.value
          }}</span>
          <i
            :class="[stat.icon, index === 0 ? 'text-black' : 'text-white']"
            class="text-2xl mb-1"
          ></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// TASK 7: Removed axios import and onMounted fetch.
// Data now comes from Dashboard.vue as a prop — no API calls needed here.
import { computed } from "vue";

// Receive all sites from Dashboard.vue
const props = defineProps({
  allSites: {
    type: Array,
    default: () => [],
  },
});

// Maps API status values to card labels.
// "Active" and "active_locators" both count toward "Active Locators".
const statusMap = {
  active_locators: "Active Locators",
  Active: "Active Locators",
  available_lots: "For Lease",
  pending_permits: "Planning",
  critical_issues: "Inactive",
  infrastructure_assets: "Under Development",
  transfer_pending: "Transitional",
  recently_acquired: "Leased",
};

// Card definitions — labels, colors and icons unchanged
const cardDefinitions = [
  {
    label: "Active Locators",
    bgColor: "bg-gradient-to-br from-[#FFD700] via-[#FFA000] to-[#FFA000]",
    icon: "fas fa-map-marker-alt",
  },
  {
    label: "Proposed",
    bgColor: "bg-gradient-to-br from-[#9C27B0] via-[#7B1FA2] to-[#4A148C]",
    icon: "fas fa-lightbulb",
  },
  {
    label: "Under Development",
    bgColor: "bg-gradient-to-br from-[#4FC3F7] via-[#29B6F6] to-[#0288D1]",
    icon: "fas fa-hammer",
  },
  {
    label: "Planning",
    bgColor: "bg-gradient-to-br from-[#4CAF50] via-[#388E3C] to-[#1B5E20]",
    icon: "fas fa-drafting-compass",
  },
  {
    label: "For Lease",
    bgColor: "bg-gradient-to-br from-[#FF9800] via-[#F57C00] to-[#F57C00]",
    icon: "fas fa-building",
  },
  {
    label: "Inactive",
    bgColor: "bg-gradient-to-br from-[#F44336] via-[#D32F2F] to-[#B71C1C]",
    icon: "fas fa-exclamation-triangle",
  },
  {
    label: "Reserved",
    bgColor: "bg-gradient-to-r from-[#FF9E7A] via-[#EB876B] to-[#D76949]",
    icon: "fas fa-bookmark",
  },
  {
    label: "Transitional",
    bgColor: "bg-gradient-to-br from-[#c44fd8] via-[#9c27b0] to-[#7e0992]",
    icon: "fas fa-sync-alt",
  },
  {
    label: "Leased",
    bgColor: "bg-gradient-to-br from-[#48f1bf] via-[#20c997] to-[#02ab79]",
    icon: "fas fa-file-contract",
  },
  {
    label: "Renovation",
    bgColor: "bg-gradient-to-br from-[#ffc028] via-[#ff9800] to-[#e17a00]",
    icon: "fas fa-tools",
  },
  {
    label: "Decommissioned",
    bgColor: "bg-gradient-to-br from-[#ff5d6d] via-[#dc3545] to-[#be1727]",
    icon: "fas fa-trash-alt",
  },
];

// TASK 7: Count statuses locally from allSites prop.
// No API calls needed — data comes from Dashboard.vue.
// This replaces the old fetchAllStats() that made 6 separate API calls.
const stats = computed(() => {
  const counts = {};
  cardDefinitions.forEach((card) => {
    counts[card.label] = 0;
  });

  props.allSites.forEach((site) => {
    const cardLabel = statusMap[site.status];
    if (cardLabel && counts[cardLabel] !== undefined) {
      counts[cardLabel]++;
    }
  });

  return cardDefinitions.map((card) => ({
    ...card,
    value: counts[card.label] ?? 0,
  }));
});
</script>

<style scoped>
/* 1. This defines the total height of the scrollbar interaction area */
.custom-scrollbar::-webkit-scrollbar {
  height: 12px !important;
  display: block !important;
}

/* 2. Make the track completely invisible so the handle 'floats' */
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent !important;
  margin-inline: 40px !important;
}

/* 3. The Actual Visible Pill */
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.25) !important;
  background-clip: padding-box !important;
  border-top: 4px solid transparent !important;
  border-bottom: 4px solid transparent !important;
  border-radius: 50px !important;
}

/* 4. Glow effect on hover */
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(152, 152, 152, 0.5) !important;
}

/* 5. Ensure the container actually allows the scrollbar to show */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgb(255, 234, 0) transparent;
}
</style>
