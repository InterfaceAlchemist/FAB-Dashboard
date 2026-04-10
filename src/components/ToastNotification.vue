<script setup>
import { useToast } from "../useToast.js";

const { toasts, removeToast } = useToast();

// ── Icon and color per toast type ─────────────────────────
const toastStyles = {
  success: {
    border: "border-green-500/50",
    icon: "✅",
    title: "text-green-400",
    bar: "bg-green-500",
  },
  warning: {
    border: "border-yellow-500/50",
    icon: "⚠️",
    title: "text-yellow-400",
    bar: "bg-yellow-500",
  },
  error: {
    border: "border-red-500/50",
    icon: "❌",
    title: "text-red-400",
    bar: "bg-red-500",
  },
  info: {
    border: "border-cyan-500/50",
    icon: "ℹ️",
    title: "text-cyan-400",
    bar: "bg-cyan-500",
  },
};
</script>

<template>
  <!-- Toast Container — bottom right -->
  <div class="fixed bottom-10 right-11 z-999 flex flex-col gap-3 items-end">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'relative bg-white border-2 border-gray-500 rounded-lg px-5 py-5 shadow-2xl flex items-center gap-3 min-w-70 max-w-95 overflow-hidden',
          toastStyles[toast.type]?.border || 'border-white/40',
        ]"
      >
        <!-- Icon -->
        <span class="text-lg shrink-0 mt-0.5">{{
          toastStyles[toast.type]?.icon
        }}</span>

        <!-- Message -->
        <p class="text-l font-medium flex-1 text-gray-800">
          {{ toast.message }}
        </p>

        <!-- Close button -->
        <button
          @click="removeToast(toast.id)"
          class="text-gray-400 hover:text-gray-700 text-lg leading-none shrink-0 transition-colors"
        >
          ✕
        </button>

        <!-- Bottom progress bar -->
        <div
          :class="[
            'absolute bottom-0 left-0 h-0.5 animate-shrink',
            toastStyles[toast.type]?.bar,
          ]"
        ></div>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
/* Slide in from right */
.toast-enter-active {
  transition: all 0.3s ease;
}
.toast-leave-active {
  transition: all 0.5s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* Progress bar shrinks over 3 seconds */
@keyframes shrink {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}
.animate-shrink {
  animation: shrink 3s linear forwards;
}
</style>
