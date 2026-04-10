<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";

// Import the useToast composable for showing toast notifications
import { useToast } from "../useToast.js";
const { info } = useToast();

// Import the useRouter composable from Vue Router to programmatically navigate between pages
import { useRouter } from "vue-router";
const router = useRouter();

// Define props that this component accepts from its parent (App.vue)
const props = defineProps([
  "isExpanded",
  "isStrategicOpen",
  "isAnalyticsOpen",
  "isExecutiveOpen",
  "isIssueOpen",
]);
const emit = defineEmits([
  "update:isExpanded",
  "openSearch",
  "open-strategic-dashboard",
  "open-performance-analytics",
  "open-executive-summary",
  "open-issue-report",
]);

const isNotificationOpen = ref(false);

// ── Alerts & Events cycling data ──────────────────────────
const alertSets = [
  [
    { id: 1, text: "Weather alert: Heavy rainfall", color: "#facc15" },
    { id: 2, text: "Traffic advisory: Osmeña Blvd", color: "#60a5fa" },
    { id: 3, text: "Accident: Fuente Circle", color: "#f87171" },
  ],
  [
    { id: 1, text: "Event traffic: SM City Cebu", color: "#60a5fa" },
    { id: 2, text: "Flooding alert: Mabolo area", color: "#facc15" },
    { id: 3, text: "Construction: Escario Street", color: "#fb923c" },
  ],
  [
    { id: 1, text: "Construction: Escario Street", color: "#fb923c" },
    { id: 2, text: "Road closure: IT Park area", color: "#f87171" },
    { id: 3, text: "Weather alert: Heavy rainfall", color: "#facc15" },
  ],
];

const eventSets = [
  [
    { id: 1, title: "Sinulog Festival 2025", date: "Jan 19" },
    { id: 2, title: "Public Meeting: Budget 2025", date: "Feb 15" },
    { id: 3, title: "Community Cleanup Drive", date: "Feb 20" },
  ],
  [
    { id: 1, title: "Health & Wellness Fair", date: "Mar 1-3" },
    { id: 2, title: "Tech Summit 2025", date: "Apr 5" },
    { id: 3, title: "Environmental Fair", date: "Apr 22" },
  ],
  [
    { id: 1, title: "Bataan Day Celebration", date: "Apr 9" },
    { id: 2, title: "Investment Forum 2025", date: "May 10" },
    { id: 3, title: "FAB Sports Fest", date: "May 25" },
  ],
];

const currentSetIndex = ref(0);

// HEADER HEIGHT REDUCTION: Slice to only show 2 items instead of 3.
// This reduces the vertical space needed by the alerts and events columns,
// which directly contributes to the shorter header height.
const recentAlerts = ref(alertSets[0].slice(0, 2));
const upcomingEvents = ref(eventSets[0].slice(0, 2));

let interval = null;

// Cycle through alert and event sets every 4 seconds
onMounted(() => {
  interval = setInterval(() => {
    currentSetIndex.value = (currentSetIndex.value + 1) % alertSets.length;
    // HEADER HEIGHT REDUCTION: slice(0, 2) keeps cycling but only shows first 2 items.
    recentAlerts.value = alertSets[currentSetIndex.value].slice(0, 2);
    upcomingEvents.value = eventSets[
      currentSetIndex.value % eventSets.length
    ].slice(0, 2);
  }, 4000);
});

onUnmounted(() => {
  clearInterval(interval);
});

// ── Notifications ─────────────────────────────────────────
const notifications = ref([
  {
    id: 1,
    type: "traffic",
    title: "Traffic Update",
    desc: "Heavy traffic on Osmeña Boulevard due to road construction.",
    time: "10 minutes ago",
    unread: true,
    color: "bg-blue-600",
    icon: "bell",
  },
  {
    id: 2,
    type: "weather",
    title: "Weather Advisory",
    desc: "Thunderstorm warning in effect until 6:00 PM today.",
    time: "30 minutes ago",
    unread: true,
    color: "bg-yellow-600",
    icon: "!",
  },
  {
    id: 3,
    type: "event",
    title: "Event Reminder",
    desc: "Sinulog Festival parade starts at 9:00 AM tomorrow.",
    time: "1 hour ago",
    unread: false,
    color: "bg-teal-600",
    icon: "i",
  },
  {
    id: 4,
    type: "service",
    title: "Service Update",
    desc: "Water service restored in Lahug area.",
    time: "2 hours ago",
    unread: false,
    color: "bg-green-600",
    icon: "✓",
  },
]);

const unreadCount = computed(
  () => notifications.value.filter((n) => n.unread).length,
);

const markAsRead = (notif) => {
  if (notif.unread) notif.unread = false;
};

const markAllAsRead = () => {
  notifications.value.forEach((n) => (n.unread = false));
};

const toggleNotifications = () => {
  isNotificationOpen.value = !isNotificationOpen.value;
};

const handleAppSwitcherClick = () => {
  info("App Switcher is currently under development.");
};

// ── Logout Function ─────────────────────────────────────
const handleLogout = () => {
  localStorage.removeItem("isLoggedIn");
  router.push("/login");
};
</script>

<template>
  <div
    class="fixed inset-0 bg-black transition-opacity duration-500 pointer-events-none z-30"
    :class="isExpanded ? 'opacity-15' : 'opacity-0'"
  ></div>

  <!--
    HEADER HEIGHT REDUCTION: Updated collapse translation values.
    New header height breakdown:
      - Header body: lg:h-40 (160px)
      - Nav bar: ~44px
      - Toggle button: 24px
      - Total: ~228px
    So "-translate-y-57" (228px) on desktop, "-translate-y-36" (144px) on tablet.
  -->
  <div
    class="transition-all duration-500 ease-in-out relative z-40"
    :class="isExpanded ? 'translate-y-0' : `-translate-y-37 lg:-translate-y-57`"
  >
    <!--
      HEADER HEIGHT REDUCTION: "lg:h-55" (220px) → "lg:h-40" (160px).
      TABLET FIX: "md:flex-nowrap" prevents header from wrapping into 2 rows on tablet.
    -->
    <header
      class="h-auto lg:h-40 bg-[#062840] border-teal-700 flex flex-wrap md:flex-nowrap lg:flex-nowrap items-center"
      style="
        background: url(/header-bg.png) #062840 -19.842px -67.992px / 57.485%
          198.98% no-repeat;
      "
    >
      <!-- LOGO
           HEADER HEIGHT REDUCTION: Logo smaller on desktop "lg:w-36" (was lg:w-50).
           Less negative margin "-mt-4" (was -mt-8) since header is shorter.
           TABLET FIX: Reduced px padding and logo size at md. All lg: values are desktop.
      -->
      <div
        class="flex-1 flex items-center h-full px-3 md:px-8 lg:px-20 xl:px-40 shrink-0"
      >
        <img
          src="/freeport-AreaofBataan-logo.png"
          :class="
            isExpanded
              ? 'w-20 md:w-32 lg:w-36 -mt-2 md:-mt-3 lg:-mt-4'
              : 'w-16 md:w-24 lg:w-28'
          "
          class="h-auto transition-all duration-500"
        />
      </div>

      <!-- RECENT ALERTS
           HEADER HEIGHT REDUCTION: Padding tightened "p-2 lg:p-3" (was lg:p-6).
           Only 2 alerts shown via slice(0,2) in <script>.
           TABLET FIX: Width "w-[170px] lg:w-105", truncate on text.
      -->
      <div
        class="flex items-center gap-8 w-50 lg:w-110 p-2 lg:p-4 pr-0 lg:pr-0 h-full"
      >
        <div
          class="border-l-[#3197A3] border-l px-2 lg:px-4 w-full overflow-hidden"
        >
          <p class="text-white text-xs lg:text-sm font-medium">Recent Alerts</p>
          <transition-group
            name="slide-down"
            tag="div"
            class="flex flex-col gap-1 mt-1.5 relative"
          >
            <div
              v-for="alert in recentAlerts"
              :key="currentSetIndex + '-' + alert.text"
              class="flex items-center gap-1.5 lg:gap-2 border border-[#099b96] bg-teal-900/85 hover:bg-teal-800 text-white py-1.5 lg:py-2 px-2 lg:px-3 rounded cursor-pointer text-xs lg:text-sm"
            >
              <span
                class="w-2 h-2 rounded-full shrink-0"
                :style="{ backgroundColor: alert.color }"
              ></span>
              <!-- "truncate" cuts off long text with "..." so it never overflows -->
              <span class="truncate">{{ alert.text }}</span>
            </div>
          </transition-group>
        </div>
      </div>

      <!-- UPCOMING EVENTS
           HEADER HEIGHT REDUCTION: Padding tightened "py-2 lg:py-3" (was lg:py-6).
           Only 2 events shown via slice(0,2) in <script>.
           TABLET FIX: Width "w-[160px] lg:w-105", date hidden on tablet.
      -->
      <div
        class="flex flex-col justify-center items-center gap-8 w-50 lg:w-110 p-4 py-2 lg:py-3 pr-2 h-full"
      >
        <div
          class="border-l-[#F44] border-l px-2 lg:px-4 w-full flex flex-col overflow-hidden"
        >
          <p class="text-white text-xs lg:text-sm font-medium self-start">
            Upcoming Events
          </p>
          <transition-group
            name="slide-down"
            tag="div"
            class="flex flex-col gap-1 mt-1.5 w-full relative"
          >
            <div
              v-for="event in upcomingEvents"
              :key="currentSetIndex + '-' + event.title"
              class="flex items-center justify-between bg-teal-900/50 hover:bg-teal-800 border border-white/10 text-white py-1.5 lg:py-2 px-2 lg:px-3 rounded cursor-pointer text-xs lg:text-sm"
            >
              <div class="flex items-center gap-1.5 lg:gap-2 min-w-0">
                <span class="text-red-400 text-xs shrink-0">🗓</span>
                <!-- "truncate" stops the title from pushing the date off screen -->
                <span class="truncate">{{ event.title }}</span>
              </div>
              <!-- Date hidden on tablet — not enough space, shown on desktop -->
              <span
                class="text-gray-400 text-xs shrink-0 ml-2 hidden lg:inline"
                >{{ event.date }}</span
              >
            </div>
          </transition-group>
        </div>
      </div>

      <!-- NOTIFICATION / APP SWITCHER / SEARCH BUTTONS
           HEADER HEIGHT REDUCTION: "lg:h-45" → "lg:h-32" matches new shorter header.
           TABLET FIX: w-10 h-10 on tablet, lg:w-14 lg:h-14 on desktop. ml-auto keeps
           buttons pinned to the right edge on all screen sizes.
      -->
      <div
        class="flex flex-col border-l border-white/10 h-auto lg:h-27 justify-center items-center px-2 lg:px-5 ml-auto shrink-0"
      >
        <div class="grid grid-cols-2 gap-1.5 lg:gap-2">
          <!-- Bell / Notification -->
          <div class="relative group">
            <div
              @click="toggleNotifications"
              class="w-10 h-10 lg:w-14 lg:h-14 bg-black rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-900 transition-colors"
            >
              <img src="/bell-icon.png" class="w-4 lg:w-5.5 h-auto" />
            </div>
            <span
              v-if="unreadCount > 0"
              class="absolute top-1.5 right-1.5 lg:top-2.5 lg:right-2.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-[#062840]"
            >
              {{ unreadCount }}
            </span>
            <!--
              TABLET FIX: Dropdown width "w-72" on tablet, "lg:w-102.5" on desktop.
              "right-0" anchors it so it never goes off-screen.
            -->
            <div
              v-if="isNotificationOpen"
              class="absolute right-0 top-12 lg:top-16 w-72 lg:w-102.5 bg-[#1b2531] border border-white/10 rounded shadow-2xl z-50 overflow-hidden text-white font-sans"
            >
              <div
                class="p-3 border-b border-white/10 flex justify-between items-center bg-[#242f3d]"
              >
                <span class="font-bold text-lg text-gray-200"
                  >Notifications</span
                >
                <button
                  @click="markAllAsRead"
                  class="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Mark all as read
                </button>
              </div>
              <div class="max-h-112.5 overflow-y-auto">
                <div
                  v-for="notif in notifications"
                  :key="notif.id"
                  @click="markAsRead(notif)"
                  class="relative p-4 border-b border-white/5 hover:bg-[#2c3d50] cursor-pointer flex gap-4 transition-colors"
                  :class="notif.unread ? 'bg-[#253343]' : 'bg-transparent'"
                >
                  <div
                    v-if="notif.unread"
                    class="absolute left-0 top-0 bottom-0 w-0.5 bg-[#3da9fc]"
                  ></div>
                  <div
                    class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 opacity-90"
                    :class="notif.color"
                  >
                    <img
                      v-if="notif.icon === 'bell'"
                      src="/bell-icon.png"
                      class="w-4 h-auto brightness-300"
                    />
                    <span v-else class="text-white font-bold text-m">{{
                      notif.icon
                    }}</span>
                  </div>
                  <div class="flex flex-col text-left">
                    <p class="text-[14px] font-bold">{{ notif.title }}</p>
                    <p class="text-[12px] text-gray-400 leading-tight">
                      {{ notif.desc }}
                    </p>
                    <span class="text-[10px] text-gray-500 mt-2">{{
                      notif.time
                    }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- App Switcher -->
          <div
            @click="handleAppSwitcherClick"
            class="w-10 h-10 lg:w-14 lg:h-14 shrink-0 bg-black rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-900 transition-colors"
          >
            <img src="/app-switcher-icon.png" class="w-5 lg:w-7.5 h-auto" />
          </div>

          <!-- Search -->
          <div
            @click="emit('openSearch')"
            class="w-10 h-10 lg:w-14 lg:h-14 shrink-0 bg-black rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-900 transition-colors"
          >
            <img src="/search-icon.png" class="w-4 lg:w-5.5 h-auto" />
          </div>

          <!-- Logout -->
          <div
            @click="handleLogout"
            class="w-10 h-10 lg:w-14 lg:h-14 shrink-0 bg-black hover:bg-red-700 rounded-full flex items-center justify-center cursor-pointer transition-colors"
          >
            <svg viewBox="0 0 24 24" class="w-4 h-4 lg:w-5 lg:h-5 fill-white">
              <path
                d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"
              />
            </svg>
          </div>
        </div>
      </div>
    </header>

    <!-- NAV BAR
         TABLET FIX: Reduced gap and padding at md. Desktop values restored via lg:.
    -->
    <nav
      class="flex gap-1 md:gap-1.5 lg:gap-2.5 px-1.5 md:px-2 lg:px-2.5 py-1.5 md:py-2 lg:py-2.5 bg-[#031E31]"
    >
      <!-- Strategic Dashboard -->
      <div
        @click="emit('open-strategic-dashboard')"
        :class="
          isStrategicOpen
            ? 'border-cyan-400 bg-[#099b96]/20 shadow-[0_0_12px_#22d3ee40]'
            : 'border-[#099b96]/60 bg-[#062840] hover:bg-[#099b96]/20 hover:border-[#099b96]'
        "
        class="flex-1 flex items-center justify-center gap-1.5 lg:gap-3 py-2 lg:py-3 border rounded-sm cursor-pointer transition-all group"
      >
        <svg
          viewBox="0 0 24 24"
          :class="
            isStrategicOpen
              ? 'text-white'
              : 'text-[#1c8995] group-hover:text-white'
          "
          class="w-5 h-5 fill-current transition-colors shrink-0"
        >
          <path
            d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"
          />
        </svg>
        <!-- Full label on desktop (lg+) -->
        <span
          :class="
            isStrategicOpen
              ? 'text-white'
              : 'text-[#1c8995] group-hover:text-white'
          "
          class="hidden lg:inline text-[15px] font-bold tracking-wider transition-colors uppercase"
        >
          Strategic Dashboard
        </span>
        <!-- Short label on tablet (below lg) -->
        <span
          :class="
            isStrategicOpen
              ? 'text-white'
              : 'text-[#1c8995] group-hover:text-white'
          "
          class="inline lg:hidden text-[10px] md:text-[11px] font-bold tracking-wide transition-colors uppercase text-center leading-tight"
        >
          Strategic
        </span>
      </div>

      <!-- Performance Analytics -->
      <div
        @click="emit('open-performance-analytics')"
        :class="
          isAnalyticsOpen
            ? 'border-cyan-400 bg-[#099b96]/20 shadow-[0_0_12px_#22d3ee40]'
            : 'border-[#099b96]/60 bg-[#062840] hover:bg-[#099b96]/20 hover:border-[#099b96]'
        "
        class="flex-1 flex items-center justify-center gap-1.5 lg:gap-3 py-2 lg:py-3 border rounded-sm cursor-pointer transition-all group"
      >
        <svg
          viewBox="0 0 24 24"
          :class="
            isAnalyticsOpen
              ? 'text-white'
              : 'text-[#1c8995] group-hover:text-white'
          "
          class="w-5 h-5 fill-current transition-colors shrink-0"
        >
          <path
            d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"
          />
        </svg>
        <span
          :class="
            isAnalyticsOpen
              ? 'text-white'
              : 'text-[#1c8995] group-hover:text-white'
          "
          class="hidden lg:inline text-[15px] font-bold tracking-wider transition-colors uppercase"
        >
          Performance Analytics
        </span>
        <span
          :class="
            isAnalyticsOpen
              ? 'text-white'
              : 'text-[#1c8995] group-hover:text-white'
          "
          class="inline lg:hidden text-[10px] md:text-[11px] font-bold tracking-wide transition-colors uppercase text-center leading-tight"
        >
          Analytics
        </span>
      </div>

      <!-- Executive Summary Report -->
      <div
        @click="emit('open-executive-summary')"
        :class="
          isExecutiveOpen
            ? 'border-cyan-400 bg-[#099b96]/20 shadow-[0_0_12px_#22d3ee40]'
            : 'border-[#099b96]/60 bg-[#062840] hover:bg-[#099b96]/20 hover:border-[#099b96]'
        "
        class="flex-1 flex items-center justify-center gap-1.5 lg:gap-3 py-2 lg:py-3 border rounded-sm cursor-pointer transition-all group"
      >
        <svg
          viewBox="0 0 24 24"
          :class="
            isExecutiveOpen
              ? 'text-white'
              : 'text-[#1c8995] group-hover:text-white'
          "
          class="w-5 h-5 fill-none stroke-current stroke-2 transition-colors shrink-0"
        >
          <path
            d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
          ></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
        </svg>
        <span
          :class="
            isExecutiveOpen
              ? 'text-white'
              : 'text-[#1c8995] group-hover:text-white'
          "
          class="hidden lg:inline text-[15px] font-bold tracking-wider transition-colors uppercase"
        >
          Executive Summary Report
        </span>
        <span
          :class="
            isExecutiveOpen
              ? 'text-white'
              : 'text-[#1c8995] group-hover:text-white'
          "
          class="inline lg:hidden text-[10px] md:text-[11px] font-bold tracking-wide transition-colors uppercase text-center leading-tight"
        >
          Executive
        </span>
      </div>

      <!-- Issue Report -->
      <div
        @click="emit('open-issue-report')"
        :class="
          isIssueOpen
            ? 'border-cyan-400 bg-[#099b96]/20 shadow-[0_0_12px_#22d3ee40]'
            : 'border-[#099b96]/60 bg-[#062840] hover:bg-[#099b96]/20 hover:border-[#099b96]'
        "
        class="flex-1 flex items-center justify-center gap-1.5 lg:gap-3 py-2 lg:py-3 border rounded-sm cursor-pointer transition-all group"
      >
        <svg
          viewBox="0 0 24 24"
          :class="
            isIssueOpen ? 'text-white' : 'text-[#1c8995] group-hover:text-white'
          "
          class="w-5 h-5 fill-none stroke-current stroke-2 transition-colors shrink-0"
        >
          <path
            d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
          ></path>
        </svg>
        <span
          :class="
            isIssueOpen ? 'text-white' : 'text-[#1c8995] group-hover:text-white'
          "
          class="hidden lg:inline text-[15px] font-bold tracking-wider transition-colors uppercase"
        >
          Issue Report
        </span>
        <span
          :class="
            isIssueOpen ? 'text-white' : 'text-[#1c8995] group-hover:text-white'
          "
          class="inline lg:hidden text-[10px] md:text-[11px] font-bold tracking-wide transition-colors uppercase text-center leading-tight"
        >
          Issues
        </span>
      </div>
    </nav>

    <!-- COLLAPSE TOGGLE BUTTON — unchanged -->
    <div class="absolute left-1/2 -translate-x-1/2 -bottom-6">
      <div
        @click="emit('update:isExpanded', !isExpanded)"
        class="w-16 h-5.5 bg-[#F38200] rounded-b-2xl flex items-center justify-center cursor-pointer shadow-lg hover:bg-[#cfbc44] transition-colors"
      >
        <svg
          viewBox="0 0 100 100"
          class="max-w-3.5 h-3.5 text-white fill-current transition-transform duration-500"
          :class="{ 'rotate-180': !isExpanded }"
        >
          <polygon points="50,15 100,85 0,85" />
        </svg>
      </div>
    </div>
  </div>
</template>

<style scoped>
.slide-down-move,
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-40px) scaleY(0.8);
}
.slide-down-enter-to {
  opacity: 1;
  transform: translateY(0) scaleY(1);
}
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(20px) scaleY(0.8);
}
.slide-down-leave-active {
  position: absolute;
  width: 100%;
}

/* Staggered delay so each tile drops in one by one */
.slide-down-enter-active:nth-child(1) {
  transition-delay: 0s;
}
.slide-down-enter-active:nth-child(2) {
  transition-delay: 0.12s;
}
.slide-down-enter-active:nth-child(3) {
  transition-delay: 0.24s;
}
</style>
