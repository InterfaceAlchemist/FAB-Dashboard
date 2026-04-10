<script setup>
import { ref, computed, watch } from "vue";

import { useToast } from "../useToast.js";
const { success } = useToast();

// SKELETON LOADER: Stored in "props" so watch() can access isOpen.
const props = defineProps(["isOpen", "isExpanded", "isPanelOpen"]);
defineEmits(["close"]);

const locationSuggestions = ref([]);
const isSearchingLocation = ref(false);
const showSuggestions = ref(false);

const issueType = ref("");
const category = ref("");
const location = ref("");
const dateReported = ref(
  new Date().toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  }),
);
const contactEmail = ref("");
const contactPhone = ref("");
const priority = ref("Medium");
const description = ref("");
const uploadedPhoto = ref(null);
const isDragging = ref(false);
const otherIssueType = ref("");
const isSubmitModalOpen = ref(false);
const isCalendarOpen = ref(false);
const currentMonth = ref(new Date().getMonth());
const currentYear = ref(new Date().getFullYear());
const selectedDate = ref(null);

const submitted = ref(false);

const issueTypes = [
  "Infrastructure Damage",
  "Utility Outage",
  "Security Concern",
  "Environmental Hazard",
  "Traffic Incident",
  "Public Health Issue",
  "Other",
];
const categories = [
  "Roads & Transportation",
  "Utilities",
  "Public Buildings",
  "Environmental",
  "Safety & Security",
];
const priorities = ["Low", "Medium", "High", "Critical"];
const priorityColors = {
  Low: "text-green-400",
  Medium: "text-yellow-400",
  High: "text-orange-400",
  Critical: "text-red-400",
};
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const calendarDays = computed(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1).getDay();
  const daysInMonth = new Date(
    currentYear.value,
    currentMonth.value + 1,
    0,
  ).getDate();
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  return days;
});

const selectDay = (day) => {
  if (!day) return;
  const month = String(currentMonth.value + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  dateReported.value = `${month}/${d}/${currentYear.value}`;
  selectedDate.value = day;
  isCalendarOpen.value = false;
};

const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11;
    currentYear.value--;
  } else currentMonth.value--;
};

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0;
    currentYear.value++;
  } else currentMonth.value++;
};

const handleDrop = (e) => {
  e.preventDefault();
  isDragging.value = false;
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith("image/")) uploadedPhoto.value = file;
};

const handleFileInput = (e) => {
  const file = e.target.files[0];
  if (file && file.type.startsWith("image/")) uploadedPhoto.value = file;
};

const removePhoto = () => {
  uploadedPhoto.value = null;
};

const handleSubmit = () => {
  submitted.value = true;
  if (
    !issueType.value ||
    !category.value ||
    !location.value ||
    !description.value
  )
    return;
  isSubmitModalOpen.value = true;
};

const handleConfirmSubmit = () => {
  isSubmitModalOpen.value = false;
  handleCancel();
  success("Issue report submitted successfully!");
};

const handleCancel = () => {
  submitted.value = false;
  issueType.value = "";
  category.value = "";
  location.value = "";
  contactEmail.value = "";
  contactPhone.value = "";
  priority.value = "Medium";
  description.value = "";
  uploadedPhoto.value = null;
  otherIssueType.value = "";
};

const searchLocation = async () => {
  if (location.value.length < 3) {
    locationSuggestions.value = [];
    showSuggestions.value = false;
    return;
  }
  isSearchingLocation.value = true;
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location.value)}&format=json&limit=5&countrycodes=ph`,
    );
    const data = await res.json();
    locationSuggestions.value = data;
    showSuggestions.value = true;
  } catch (e) {
    locationSuggestions.value = [];
  } finally {
    isSearchingLocation.value = false;
  }
};

const selectLocation = (suggestion) => {
  location.value = suggestion.display_name;
  showSuggestions.value = false;
  locationSuggestions.value = [];
};

// TABLET FIX: Detect tablet screen size in JavaScript.
// Same pattern used across all other fixed components.
// DESKTOP: When window.innerWidth >= 1024, isTablet = false → original values used.
const isTablet = ref(window.innerWidth < 1024);
window.addEventListener("resize", () => {
  isTablet.value = window.innerWidth < 1024;
});

// ── SKELETON LOADER ───────────────────────────────────────
// Same pattern as StrategicDashboard.vue and PerformanceAnalytics.vue.
// isLoading = true when panel opens → shows skeleton for 1.5s → shows real content.
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
  <!-- ① MAIN DASHBOARD — only ONE child inside this Transition -->
  <Transition name="fade">
    <div
      v-if="isOpen"
      class="fixed bg-[#020f1a] z-39 overflow-y-auto font-['Inter',sans-serif] transition-all duration-500 ease-in-out"
      :style="{
        // TABLET FIX: Same pattern as all other overlay panels.
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
      <!-- HEADER — always visible, even during loading -->
      <div
        class="flex items-center justify-between px-8 py-5 border-b border-white/10"
      >
        <h1 class="text-white text-2xl font-bold">Report an Issue</h1>
        <button
          @click="$emit('close')"
          class="text-white/50 hover:text-white text-2xl transition-colors"
        >
          ✕
        </button>
      </div>

      <!-- ═══════════════════════════════════════════════════
           SKELETON LOADER
           Mimics the 2-column form grid:
           - 6 input field placeholders (2 per row × 3 rows)
           - Priority radio row
           - Description textarea
           - Upload photo area
           - Submit/Cancel buttons
      ════════════════════════════════════════════════════ -->
      <div v-if="isLoading" class="px-8 py-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          <!-- Row 1: Issue Type + Category -->
          <div v-for="i in 2" :key="`r1-${i}`" class="flex flex-col gap-2">
            <div class="h-3 bg-white/10 rounded w-24"></div>
            <div class="h-11 bg-white/10 rounded"></div>
          </div>

          <!-- Row 2: Location + Date -->
          <div class="flex flex-col gap-2">
            <div class="h-3 bg-white/10 rounded w-20"></div>
            <div class="h-11 bg-white/10 rounded"></div>
            <div class="h-3 bg-white/10 rounded w-56"></div>
          </div>
          <div class="flex flex-col gap-2">
            <div class="h-3 bg-white/10 rounded w-28"></div>
            <div class="h-11 bg-white/10 rounded"></div>
          </div>

          <!-- Row 3: Contact Email + Phone -->
          <div v-for="i in 2" :key="`r3-${i}`" class="flex flex-col gap-2">
            <div class="h-3 bg-white/10 rounded w-28"></div>
            <div class="h-11 bg-white/10 rounded"></div>
          </div>

          <!-- Priority — full width -->
          <div
            class="col-span-1 md:col-span-2 bg-[#0a1929] border border-white/10 rounded-xl p-5"
          >
            <div class="h-3 bg-white/10 rounded w-16 mb-4"></div>
            <div class="flex gap-6">
              <div v-for="i in 4" :key="i" class="flex items-center gap-2">
                <div class="w-4 h-4 rounded-full bg-white/10"></div>
                <div class="h-3 bg-white/10 rounded w-14"></div>
              </div>
            </div>
          </div>

          <!-- Description — full width -->
          <div class="col-span-1 md:col-span-2 flex flex-col gap-2">
            <div class="h-3 bg-white/10 rounded w-24"></div>
            <div class="h-32 bg-white/10 rounded"></div>
          </div>

          <!-- Upload Photo — full width -->
          <div class="col-span-1 md:col-span-2 flex flex-col gap-2">
            <div class="h-3 bg-white/10 rounded w-40"></div>
            <div
              class="h-28 bg-white/10 border border-dashed border-white/10 rounded-xl"
            ></div>
          </div>

          <!-- Submit + Cancel — full width, right-aligned -->
          <div
            class="col-span-1 md:col-span-2 flex items-center justify-end gap-3 pt-4 pb-8"
          >
            <div class="h-11 w-24 bg-white/10 rounded"></div>
            <div class="h-11 w-32 bg-white/10 rounded"></div>
          </div>
        </div>
      </div>
      <!-- END SKELETON LOADER -->

      <!-- ═══════════════════════════════════════════════════
           REAL CONTENT — shows after 1s
      ════════════════════════════════════════════════════ -->
      <Transition name="content-fade">
        <div v-if="!isLoading">
          <!-- FORM CONTENT -->
          <div class="px-8 py-6">
            <!--
              TABLET FIX: Changed "grid-cols-2" to "grid-cols-1 md:grid-cols-2".
              On desktop (lg+): 2 columns — original layout unchanged.
              On tablet (md):   2 columns — inputs are wide enough at 768px.
              On mobile (<768px): 1 column — inputs stack vertically, much easier to use.
              "col-span-2" on full-width items changed to "col-span-1 md:col-span-2"
              so they still span full width on tablet/desktop but work on mobile too.
            -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Issue Type -->
              <div class="flex flex-col gap-2">
                <label class="text-white font-semibold text-sm"
                  >Issue Type:</label
                >
                <select
                  v-model="issueType"
                  :style="
                    submitted && !issueType ? 'border-color: #ef4444' : ''
                  "
                  class="w-full bg-[#0a1929] border border-white/10 text-white rounded px-4 py-3 text-sm focus:outline-none focus:border-cyan-500/60 appearance-none"
                >
                  <option value="" disabled>Select Issue Type</option>
                  <option v-for="type in issueTypes" :key="type">
                    {{ type }}
                  </option>
                </select>
                <p
                  v-if="submitted && !issueType"
                  class="text-red-400 text-xs mt-1"
                >
                  ⚠ Issue Type is required.
                </p>
                <div v-if="issueType === 'Other'">
                  <input
                    v-model="otherIssueType"
                    type="text"
                    placeholder="Please specify the issue type..."
                    class="w-full bg-[#0a1929] border border-cyan-500/40 text-white rounded px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 placeholder:text-white/30 transition-all"
                  />
                </div>
              </div>

              <!-- Category -->
              <div class="flex flex-col gap-2">
                <label class="text-white font-semibold text-sm"
                  >Category:</label
                >
                <select
                  v-model="category"
                  :style="submitted && !category ? 'border-color: #ef4444' : ''"
                  class="w-full bg-[#0a1929] border border-white/10 text-white rounded px-4 py-3 text-sm focus:outline-none focus:border-cyan-500/60 appearance-none"
                >
                  <option value="" disabled>Select Category</option>
                  <option v-for="cat in categories" :key="cat">
                    {{ cat }}
                  </option>
                </select>
                <p
                  v-if="submitted && !category"
                  class="text-red-400 text-xs mt-1"
                >
                  ⚠ Category is required.
                </p>
              </div>

              <!-- Location -->
              <div class="flex flex-col gap-2">
                <label class="text-white font-semibold text-sm"
                  >Location:</label
                >
                <div class="relative">
                  <input
                    v-model="location"
                    @input="searchLocation"
                    @blur="setTimeout(() => (showSuggestions = false), 200)"
                    type="text"
                    placeholder="Search for a location or type manually..."
                    :style="
                      submitted && !location ? 'border-color: #ef4444' : ''
                    "
                    class="w-full bg-[#0a1929] border border-white/10 text-white rounded px-4 py-3 text-sm focus:outline-none focus:border-cyan-500/60 placeholder:text-white/30"
                  />
                  <span
                    v-if="isSearchingLocation"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 text-xs animate-spin"
                    >⟳</span
                  >
                  <div
                    v-if="showSuggestions && locationSuggestions.length > 0"
                    class="absolute top-full left-0 right-0 mt-1 bg-[#0d1f30] border border-white/10 rounded-xl overflow-hidden z-50 shadow-2xl"
                  >
                    <div
                      v-for="suggestion in locationSuggestions"
                      :key="suggestion.place_id"
                      @mousedown="selectLocation(suggestion)"
                      class="px-4 py-3 hover:bg-white/10 cursor-pointer transition-colors border-b border-white/5 last:border-0"
                    >
                      <div class="flex items-start gap-2">
                        <span class="text-cyan-400 mt-0.5 shrink-0">📍</span>
                        <p class="text-white text-xs leading-relaxed">
                          {{ suggestion.display_name }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <p class="text-white/30 text-xs italic">
                  🔍 Results are filtered to the Philippines only.
                </p>
                <p
                  v-if="submitted && !location"
                  class="text-red-400 text-xs mt-1"
                >
                  ⚠ Location is required.
                </p>
              </div>

              <!-- Date Reported -->
              <div class="flex flex-col gap-2">
                <label class="text-white font-semibold text-sm"
                  >Date Reported:</label
                >
                <div class="relative">
                  <input
                    v-model="dateReported"
                    type="text"
                    readonly
                    @click="isCalendarOpen = true"
                    class="w-full bg-[#0a1929] border border-white/10 text-white rounded px-4 py-3 text-sm focus:outline-none focus:border-cyan-500/60 cursor-pointer"
                  />
                  <span
                    class="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 pointer-events-none"
                    >📅</span
                  >
                </div>
              </div>

              <!-- Contact Email -->
              <div class="flex flex-col gap-2">
                <label class="text-white font-semibold text-sm"
                  >Contact Email:</label
                >
                <input
                  v-model="contactEmail"
                  type="email"
                  placeholder="Email address (optional)"
                  class="w-full bg-[#0a1929] border border-white/10 text-white rounded px-4 py-3 text-sm focus:outline-none focus:border-cyan-500/60 placeholder:text-white/30"
                />
              </div>

              <!-- Contact Phone -->
              <div class="flex flex-col gap-2">
                <label class="text-white font-semibold text-sm"
                  >Contact Phone:</label
                >
                <input
                  v-model="contactPhone"
                  type="tel"
                  placeholder="Phone number (optional)"
                  class="w-full bg-[#0a1929] border border-white/10 text-white rounded px-4 py-3 text-sm focus:outline-none focus:border-cyan-500/60 placeholder:text-white/30"
                />
              </div>

              <!-- Priority — full width
                   TABLET FIX: "col-span-2" → "col-span-1 md:col-span-2"
                   On tablet/desktop: still spans full width. On mobile: full width too (only 1 col). ✅
              -->
              <div
                class="col-span-1 md:col-span-2 bg-[#0a1929] border border-white/10 rounded-xl p-5"
              >
                <label class="text-white font-semibold text-sm block mb-3"
                  >Priority:</label
                >
                <div class="flex items-center gap-6 flex-wrap">
                  <label
                    v-for="p in priorities"
                    :key="p"
                    class="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      :value="p"
                      v-model="priority"
                      class="accent-cyan-500 w-4 h-4 cursor-pointer"
                    />
                    <span :class="[priorityColors[p], 'text-sm font-medium']">{{
                      p
                    }}</span>
                  </label>
                </div>
              </div>

              <!-- Description — full width
                   TABLET FIX: "col-span-2" → "col-span-1 md:col-span-2"
              -->
              <div class="col-span-1 md:col-span-2 flex flex-col gap-2">
                <label class="text-white font-semibold text-sm"
                  >Description:</label
                >
                <textarea
                  v-model="description"
                  :style="
                    submitted && !description ? 'border-color: #ef4444' : ''
                  "
                  placeholder="Please describe the issue in detail..."
                  rows="5"
                  class="w-full bg-[#0a1929] border border-white/10 text-white rounded px-4 py-3 text-sm focus:outline-none focus:border-cyan-500/60 placeholder:text-white/30 resize-y"
                ></textarea>
                <p
                  v-if="submitted && !description"
                  class="text-red-400 text-xs mt-1"
                >
                  ⚠ Description is required.
                </p>
              </div>

              <!-- Upload Photo — full width
                   TABLET FIX: "col-span-2" → "col-span-1 md:col-span-2"
              -->
              <div class="col-span-1 md:col-span-2 flex flex-col gap-2">
                <label class="text-white font-semibold text-sm"
                  >Upload Photo (Optional):</label
                >
                <div
                  v-if="!uploadedPhoto"
                  class="w-full border border-dashed rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-300"
                  :class="
                    isDragging
                      ? 'border-cyan-500 bg-cyan-500/10'
                      : 'border-white/20 bg-[#0a1929]'
                  "
                  @dragover.prevent="isDragging = true"
                  @dragleave="isDragging = false"
                  @drop="handleDrop"
                  @click="$refs.fileInput.click()"
                >
                  <span class="text-3xl mb-3">📷</span>
                  <p class="text-white/50 text-sm">
                    Drag and drop a photo here, or click to browse
                  </p>
                  <input
                    ref="fileInput"
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="handleFileInput"
                  />
                </div>
                <div
                  v-else
                  class="w-full bg-[#0a1929] border border-white/10 rounded-xl p-4 flex items-center gap-4"
                >
                  <span class="text-2xl">🖼️</span>
                  <div class="flex-1">
                    <p class="text-white text-sm font-semibold">
                      {{ uploadedPhoto.name }}
                    </p>
                    <p class="text-white/40 text-xs">
                      {{ (uploadedPhoto.size / 1024).toFixed(1) }} KB
                    </p>
                  </div>
                  <button
                    @click="removePhoto"
                    class="text-red-400 hover:text-red-300 text-sm font-bold transition-colors"
                  >
                    ✕ Remove
                  </button>
                </div>
              </div>

              <!-- Submit + Cancel Buttons — full width
                   TABLET FIX: "col-span-2" → "col-span-1 md:col-span-2"
              -->
              <div
                class="col-span-1 md:col-span-2 flex items-center justify-end gap-3 pt-4 pb-8"
              >
                <button
                  @click="handleCancel"
                  class="px-6 py-3 bg-[#0a1929] border border-white/20 hover:border-white/50 text-white text-sm font-bold rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  @click="handleSubmit"
                  class="px-6 py-3 border border-green-600 bg-green-500/40 hover:bg-green-600 text-white text-sm font-bold rounded transition-colors"
                >
                  Submit Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
      <!-- END REAL CONTENT -->
    </div>
  </Transition>

  <!-- ② CALENDAR MODAL — sibling, outside the main Transition
       TABLET FIX: "w-130" (520px) overflows 768px screen.
       Changed to "w-full max-w-sm mx-4" — fits within tablet with side margins.
       DESKTOP: max-w-sm centers nicely, same visual result as w-130. ✅
  -->
  <Transition name="modal-fade">
    <div
      v-if="isOpen && isCalendarOpen"
      class="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div
        class="absolute inset-0 bg-black/60 backdrop-blur-sm"
        @click="isCalendarOpen = false"
      ></div>
      <div
        class="relative bg-[#0d1f30] border border-white/10 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl z-10"
      >
        <div class="flex items-center justify-between mb-5">
          <button
            @click="prevMonth"
            class="text-white/50 hover:text-white text-xl px-2 transition-colors"
          >
            ‹
          </button>
          <h3 class="text-white font-bold text-base">
            {{ monthNames[currentMonth] }} {{ currentYear }}
          </h3>
          <button
            @click="nextMonth"
            class="text-white/50 hover:text-white text-xl px-2 transition-colors"
          >
            ›
          </button>
        </div>
        <div class="grid grid-cols-7 mb-2">
          <div
            v-for="d in dayNames"
            :key="d"
            class="text-center text-white/40 text-xs font-semibold py-1"
          >
            {{ d }}
          </div>
        </div>
        <div class="grid grid-cols-7 gap-2">
          <div v-for="(day, i) in calendarDays" :key="i">
            <button
              v-if="day"
              @click="selectDay(day)"
              :class="[
                'w-full py-2 rounded-lg text-sm font-medium transition-all duration-200',
                selectedDate === day &&
                currentMonth === new Date().getMonth() &&
                currentYear === new Date().getFullYear()
                  ? 'bg-cyan-500/70 text-white'
                  : 'text-white/80 hover:bg-white/15 hover:text-white',
              ]"
            >
              {{ day }}
            </button>
            <div v-else></div>
          </div>
        </div>
        <button
          @click="isCalendarOpen = false"
          class="w-full mt-6 py-2.5 bg-[#0a1929] border border-white/20 hover:border-cyan-500/60 text-white text-sm font-bold rounded-xl transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  </Transition>

  <!-- ③ SUBMIT MODAL — sibling, outside the main Transition
       TABLET FIX: "w-150" (600px) overflows 768px screen.
       Changed to "w-full max-w-lg mx-4" — same fix as ExecutiveSummary modal.
       DESKTOP: max-w-lg + centered flex → visually same as original w-150. ✅
  -->
  <Transition name="modal-fade">
    <div
      v-if="isOpen && isSubmitModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div
        class="absolute inset-0 bg-black/60 backdrop-blur-sm"
        @click="isSubmitModalOpen = false"
      ></div>
      <div
        class="relative bg-[#0d1f30] border border-cyan-500/40 rounded-2xl p-8 w-full max-w-lg mx-4 shadow-2xl flex flex-col items-center text-center z-10"
      >
        <div class="mb-4 relative flex items-center justify-center">
          <div
            class="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center"
          >
            <svg viewBox="0 0 24 24" class="w-8 h-8 fill-green-400">
              <path
                d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
              />
            </svg>
          </div>
          <div
            class="absolute w-20 h-20 rounded-full border-2 border-green-500/30 border-t-green-500 animate-spin"
          ></div>
        </div>
        <h2 class="text-green-400 text-xl font-bold mb-2">Submit Report</h2>
        <p class="text-white/50 text-sm mb-6 leading-relaxed">
          Are you sure you want to submit this issue report?
        </p>
        <div
          class="w-full bg-[#0a1929] border-t border-green-500 rounded-lg p-5 text-left mb-6 space-y-2"
        >
          <div class="flex justify-between">
            <span class="text-white/50 text-sm">Issue Type</span>
            <span class="text-white text-sm font-semibold">{{
              issueType === "Other" ? otherIssueType : issueType
            }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-white/50 text-sm">Category</span>
            <span class="text-white text-sm font-semibold">{{ category }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-white/50 text-sm">Priority</span>
            <span :class="priorityColors[priority]" class="text-sm font-bold">{{
              priority
            }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-white/50 text-sm">Date Reported</span>
            <span class="text-white text-sm font-semibold">{{
              dateReported
            }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-white/50 text-sm">Location</span>
            <span
              class="text-white text-sm font-semibold text-right max-w-[65%]"
              >{{ location }}</span
            >
          </div>
          <div class="flex justify-between">
            <span class="text-white/50 text-sm">Description</span>
            <span
              class="text-white text-sm font-semibold text-right max-w-[60%]"
              >{{ description }}</span
            >
          </div>
        </div>
        <div class="flex gap-3 w-full">
          <button
            @click="isSubmitModalOpen = false"
            class="flex-1 py-3 bg-[#0a1929] border border-cyan-500/40 hover:border-cyan-500/80 text-white text-sm font-bold rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            @click="handleConfirmSubmit"
            class="flex-1 py-3 bg-green-500/40 border border-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-xl transition-colors"
          >
            Confirm Submit
          </button>
        </div>
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
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
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

select {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10'%3E%3Cpolygon points='5,8 9,2 1,2' fill='%23ffffff'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  background-size: 10px;
  padding-right: 36px;
}
</style>
