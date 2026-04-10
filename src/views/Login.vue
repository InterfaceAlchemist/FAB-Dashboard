<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

// Form state
const username = ref("");
const password = ref("");
const showPassword = ref(false);
const errorMessage = ref("");
const isLoading = ref(false);

// Hardcoded demo credentials (POC only — replace with real API later)
const DEMO_USERNAME = "demo";
const DEMO_PASSWORD = "demo123";

const handleLogin = () => {
  errorMessage.value = "";

  // Basic validation
  if (!username.value || !password.value) {
    errorMessage.value = "Please enter both username and password.";
    return;
  }

  isLoading.value = true;

  // Simulate a small loading delay for better UX feel
  setTimeout(() => {
    if (username.value === DEMO_USERNAME && password.value === DEMO_PASSWORD) {
      // Set login flag in localStorage so the router guard knows we're logged in
      localStorage.setItem("isLoggedIn", "true");
      router.push("/dashboard");
    } else {
      errorMessage.value = "Invalid username or password.";
      isLoading.value = false;
    }
  }, 800);
};
</script>

<template>
  <div
    class="min-h-screen w-full flex items-center justify-center bg-[#020f1a] relative overflow-hidden"
  >
    <!-- BACKGROUND GLOW EFFECTS -->
    <div
      class="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"
    ></div>
    <div
      class="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"
    ></div>

    <!-- LOGIN CARD -->
    <div
      class="relative z-10 w-full max-w-md mx-4 bg-[#0a1929] border border-white/20 rounded-2xl shadow-2xl p-8"
    >
      <!-- LOGO -->
      <div class="flex flex-col items-center mb-8">
        <img src="/freeport-AreaofBataan-logo.png" class="w-40 h-auto mb-4" />
        <p class="text-white/50 text-sm-2xl">Sign in to start your session</p>
      </div>

      <!-- FORM -->
      <div class="flex flex-col gap-4">
        <!-- Username -->
        <div class="flex flex-col gap-1.5">
          <label class="text-white/60 text-sm font-medium">Username</label>
          <input
            v-model="username"
            type="text"
            placeholder="Enter your username"
            @keyup.enter="handleLogin"
            class="w-full bg-[#0d2035] border border-white/10 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-cyan-500/60 placeholder:text-white/20 transition-colors"
          />
        </div>

        <!-- Password -->
        <div class="flex flex-col gap-1.5">
          <label class="text-white/60 text-sm font-medium">Password</label>
          <div class="relative">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Enter your password"
              @keyup.enter="handleLogin"
              class="w-full bg-[#0d2035] border border-white/10 text-white rounded-lg px-4 py-3 pr-12 text-sm focus:outline-none focus:border-cyan-500/60 placeholder:text-white/20 transition-colors"
            />
            <!-- Show/hide password toggle -->
            <button
              @click="showPassword = !showPassword"
              class="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-black transition-colors"
            >
              <svg
                v-if="!showPassword"
                viewBox="0 0 24 24"
                class="w-4 h-4 fill-current"
              >
                <path
                  d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
                />
              </svg>
              <svg v-else viewBox="0 0 24 24" class="w-4 h-4 fill-current">
                <path
                  d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- Error message -->
        <p v-if="errorMessage" class="text-red-400 text-sm text-center">
          ⚠ {{ errorMessage }}
        </p>

        <!-- Login button -->
        <button
          @click="handleLogin"
          :disabled="isLoading"
          class="w-full py-3 border border-cyan-500 bg-cyan-500/60 hover:bg-cyan-500 disabled:bg-cyan-500/40 disabled:cursor-not-allowed text-white font-bold text-sm rounded-lg transition-colors mt-2 cursor-pointer"
        >
          <span v-if="!isLoading">Login</span>
          <span v-else class="flex items-center justify-center gap-2">
            <svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            Signing in...
          </span>
        </button>

        <!-- Demo credentials hint -->
        <p class="text-white/20 text-xs text-center mt-2">
          Demo credentials — username: <span class="text-white/40">demo</span> /
          password: <span class="text-white/40">demo123</span>
        </p>
      </div>
    </div>

    <!-- FOOTER -->
    <p class="absolute bottom-4 text-white/30 text-xs">
      ©2024 ITBS Corporation. All rights reserved.
    </p>
  </div>
</template>
