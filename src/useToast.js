import { ref } from "vue";

// ── Shared toast state — one instance for the whole app ───
const toasts = ref([]);
let nextId = 0;

export function useToast() {
  // Show a toast message
  const showToast = (message, type = "success", duration = 3000) => {
    const id = nextId++;
    toasts.value.push({ id, message, type });

    // Auto-remove after duration
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  // Remove a toast by id
  const removeToast = (id) => {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  };

  // Shorthand helpers
  const success = (message) => showToast(message, "success");
  const warning = (message) => showToast(message, "warning");
  const error = (message) => showToast(message, "error");
  const info = (message) => showToast(message, "info");

  return { toasts, showToast, removeToast, success, warning, error, info };
}