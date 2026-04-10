<script setup>
import { ref, computed } from "vue";
defineOptions({
  name: "SideNav",
});

// Receive props from parent (Main.vue)
const props = defineProps(["isExpanded", "activeTab", "isPanelOpen"]);
// controls vertical positioning (header expanded or not), // which tab is currently selected, // whether the content panel is open

// Define events this component can emit to parent (Main.vue)
const emit = defineEmits([
  "update:activeTab", // change current tab (activeTab value)
  "update:isPanelOpen", // change panel open state (true/false)
  "close", // close the panel (used when clicking the same tab or clicking the X button)
  "reload", // trigger a screen reload (used when clicking the reload button at the bottom)
]);

// TABLET FIX: Import ref and computed so we can detect screen size in JavaScript.
// We need this because :style bindings can't use Tailwind breakpoints (md:, lg:) —
// they only accept plain values. isTablet updates live when the window is resized.
// DESKTOP: When window.innerWidth >= 1024, isTablet = false → original 282px is used.
const isTablet = ref(window.innerWidth < 1024);
window.addEventListener("resize", () => {
  isTablet.value = window.innerWidth < 1024;
});

// HEADER HEIGHT REDUCTION: Updated top offset values to match the new shorter header.
// Must match mapTop in Dashboard.vue exactly so SideNav and map are perfectly aligned.
// New header height breakdown:
//   - Header body (lg:h-40):  160px
//   - Nav bar:                 44px
//   - Toggle button:           24px
//   - Total desktop:          228px  (was 282px when header was lg:h-55)
//   - Total tablet:           160px  (was 190px — shorter because logo/padding smaller)
// When collapsed: 0px on both — header is hidden, SideNav fills from top.
const panelTop = computed(() => {
  if (!props.isExpanded) return "0px";
  return isTablet.value ? "153px" : "228px";
});

function handleClick(navValue) {
  if (props.activeTab === navValue && props.isPanelOpen) {
    emit("close");
    emit("update:isPanelOpen", false);
  } else {
    emit("update:activeTab", navValue);
    emit("update:isPanelOpen", true);
  }
}
</script>

<template>
  <!--
    TABLET FIX: ":style top" now uses computed "panelTop" instead of the
    hardcoded "isExpanded ? '282px' : '0px'".
    HEADER HEIGHT REDUCTION: Desktop 228px (was 282px), Tablet 160px (was 190px).
    Collapsed: 0px on both — header hidden, SideNav fills from top.
    Everything else (w-20, bg, border, mt-1.5, z-35) is completely unchanged.
  -->
  <!--
    REMOVED "mt-1.5" — it was adding 6px top margin that showed as a white gap
    at the top of the SideNav. Since :style top already controls the position
    precisely, the extra margin is not needed and was causing the visual gap.
  -->
  <aside
    class="fixed left-0 w-20 bg-[#031E31] border-r-2 border-[#099b96]/30 flex flex-col items-center z-35 transition-all duration-500"
    :style="{
      top: panelTop,
      bottom: '0px',
    }"
  >
    <div
      @click="handleClick('Features')"
      class="flex flex-col items-center justify-center gap-1 group cursor-pointer w-20 py-3 transition-all"
      :class="
        activeTab === 'Features' && isPanelOpen
          ? 'bg-emerald-900 border-r-4 border-[#F38200]'
          : 'hover:bg-cyan-900/50 border-r-4 border-transparent'
      "
    >
      <div
        class="w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-105"
        :class="
          activeTab === 'Features' && isPanelOpen ? 'bg-[#33a852]' : 'bg-white'
        "
      >
        <svg
          viewBox="0 0 24 24"
          class="w-5 h-5 transition-colors duration-300"
          :class="
            activeTab === 'Features' && isPanelOpen
              ? 'fill-white stroke-white'
              : 'fill-[#33a852] stroke-[#33a852]'
          "
        >
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      </div>
      <span
        class="text-[10px] text-white font-medium text-center leading-tight px-1"
        >Features</span
      >
    </div>

    <div
      @click="handleClick('Economic Zone')"
      class="flex flex-col items-center justify-center gap-1 group cursor-pointer w-20 py-3 transition-all"
      :class="
        activeTab === 'Economic Zone' && isPanelOpen
          ? 'bg-emerald-900 border-r-4 border-[#F38200]'
          : 'hover:bg-cyan-900/50 border-r-4 border-transparent'
      "
    >
      <div
        class="w-8 h-8 rounded-full flex items-center justify-center transition-transform group-hover:scale-105"
        :class="
          activeTab === 'Economic Zone' && isPanelOpen
            ? 'bg-[#33a852]'
            : 'bg-white'
        "
      >
        <svg
          viewBox="0 0 24 24"
          class="w-5 h-5 transition-colors duration-300"
          :class="
            activeTab === 'Economic Zone' && isPanelOpen
              ? 'fill-white'
              : 'fill-[#33a852]'
          "
        >
          <path
            d="M4 10v7h3v-7H4zm6 0v7h3v-7h-3zM2 22h19v-3H2v3zm14-12v7h3v-7h-3zm-4.5-9L2 6v2h19V6l-9.5-5z"
          />
        </svg>
      </div>
      <span
        class="text-[10px] text-white font-medium text-center leading-tight px-1"
        >Economic Zones</span
      >
    </div>

    <div
      @click="handleClick('Locators')"
      class="flex flex-col items-center justify-center gap-1 group cursor-pointer w-20 py-3 transition-all"
      :class="
        activeTab === 'Locators' && isPanelOpen
          ? 'bg-emerald-900 border-r-4 border-[#F38200]'
          : 'hover:bg-cyan-900/50 border-r-4 border-transparent'
      "
    >
      <div
        class="w-8 h-8 rounded-full flex items-center justify-center transition-transform group-hover:scale-105"
        :class="
          activeTab === 'Locators' && isPanelOpen ? 'bg-[#33a852]' : 'bg-white'
        "
      >
        <svg
          viewBox="0 0 24 24"
          class="w-5 h-5"
          :class="
            activeTab === 'Locators' && isPanelOpen
              ? 'fill-white'
              : 'fill-[#33a852]'
          "
        >
          <path
            d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"
          />
        </svg>
      </div>
      <span
        class="text-[10px] text-white font-medium text-center leading-tight px-1"
        >Locators</span
      >
    </div>

    <div
      @click="handleClick('Infrastructure')"
      class="flex flex-col items-center justify-center gap-1 group cursor-pointer w-20 py-3 transition-all"
      :class="
        activeTab === 'Infrastructure' && isPanelOpen
          ? 'bg-emerald-900 border-r-4 border-[#F38200]'
          : 'hover:bg-cyan-900/50 border-r-4 border-transparent'
      "
    >
      <div
        class="w-8 h-8 rounded-full flex items-center justify-center transition-transform group-hover:scale-105"
        :class="
          activeTab === 'Infrastructure' && isPanelOpen
            ? 'bg-[#33a852]'
            : 'bg-white'
        "
      >
        <svg
          viewBox="0 0 24 24"
          class="w-5 h-5"
          :class="
            activeTab === 'Infrastructure' && isPanelOpen
              ? 'fill-white'
              : 'fill-[#33a852]'
          "
        >
          <path
            d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.5 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"
          />
        </svg>
      </div>
      <span
        class="text-[10px] text-white font-medium text-center leading-tight px-1"
        >Infrastructure</span
      >
    </div>

    <div
      @click="handleClick('AFP Modernization')"
      class="flex flex-col items-center justify-center gap-1 group cursor-pointer w-20 py-3 transition-all"
      :class="
        activeTab === 'AFP Modernization' && isPanelOpen
          ? 'bg-emerald-900 border-r-4 border-[#F38200]'
          : 'hover:bg-cyan-900/50 border-r-4 border-transparent'
      "
    >
      <div
        class="w-8 h-8 rounded-full flex items-center justify-center transition-transform group-hover:scale-105"
        :class="
          activeTab === 'AFP Modernization' && isPanelOpen
            ? 'bg-[#33a852]'
            : 'bg-white'
        "
      >
        <svg
          viewBox="0 0 24 24"
          class="w-5 h-5"
          :class="
            activeTab === 'AFP Modernization' && isPanelOpen
              ? 'fill-white'
              : 'fill-[#33a852]'
          "
        >
          <path
            d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"
          />
        </svg>
      </div>
      <span
        class="text-[10px] text-white font-medium text-center leading-tight px-1"
        >AFP Modernization</span
      >
    </div>

    <div
      @click="handleClick('Investments')"
      class="flex flex-col items-center justify-center gap-1 group cursor-pointer w-20 py-3 transition-all"
      :class="
        activeTab === 'Investments' && isPanelOpen
          ? 'bg-emerald-900 border-r-4 border-[#F38200]'
          : 'hover:bg-cyan-900/50 border-r-4 border-transparent'
      "
    >
      <div
        class="w-8 h-8 rounded-full flex items-center justify-center transition-transform group-hover:scale-105"
        :class="
          activeTab === 'Investments' && isPanelOpen
            ? 'bg-[#33a852]'
            : 'bg-white'
        "
      >
        <svg
          viewBox="0 0 24 24"
          class="w-6 h-6"
          :class="
            activeTab === 'Investments' && isPanelOpen
              ? 'fill-white stroke-white'
              : 'fill-[#33a852] stroke-[#33a852]'
          "
        >
          <path
            d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 17.08l1.5 1.41z"
          />
        </svg>
      </div>
      <span
        class="text-[10px] text-white font-medium text-center leading-tight px-1"
        >Investments</span
      >
    </div>

    <div
      @click="handleClick('Sustainability')"
      class="flex flex-col items-center justify-center gap-1 group cursor-pointer w-20 py-3 transition-all"
      :class="
        activeTab === 'Sustainability' && isPanelOpen
          ? 'bg-emerald-900 border-r-4 border-[#F38200]'
          : 'hover:bg-cyan-900/50 border-r-4 border-transparent'
      "
    >
      <div
        class="w-8 h-8 rounded-full flex items-center justify-center transition-transform group-hover:scale-105"
        :class="
          activeTab === 'Sustainability' && isPanelOpen
            ? 'bg-[#33a852]'
            : 'bg-white'
        "
      >
        <svg
          viewBox="0 0 24 24"
          class="w-6 h-6"
          :class="
            activeTab === 'Sustainability' && isPanelOpen
              ? 'fill-white'
              : 'fill-[#33a852]'
          "
        >
          <path
            d="M17 8C8 10 5.9 16.17 3.5 21c4-2 8-4 12.5-3.5 2.5.25 4.5-1.25 4.5-4 0-3-2-5.5-4.5-5.5zM12 2c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z"
          />
        </svg>
      </div>
      <span
        class="text-[10px] text-white font-medium text-center leading-tight px-1"
        >Sustainability</span
      >
    </div>

    <div
      @click="emit('reload')"
      class="mt-auto flex flex-col items-center justify-center gap-1 group cursor-pointer w-20 py-4 hover:bg-cyan-900/50 transition-colors border-r-4 border-transparent"
    >
      <div
        class="w-8 h-8 bg-white rounded-full flex items-center justify-center transition-transform group-hover:scale-105"
      >
        <svg viewBox="0 0 24 24" class="w-6 h-6 fill-[#33a852]">
          <path
            d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"
          />
        </svg>
      </div>
      <span class="text-[10px] text-white font-bold text-center leading-tight"
        >Reload</span
      >
    </div>
  </aside>
</template>
