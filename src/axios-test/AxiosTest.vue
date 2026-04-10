<script setup>
import { ref, onMounted } from "vue";
import api from "./axiosInstance.js";

const result = ref(null);
const loading = ref(false);
const error = ref(null);
const posts = ref([]);

// just to test CORS error
onMounted(async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await api.get("/sites");
    posts.value = response.data.data;
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div style="padding: 20px">
    <h1>Axios Practice — CORS Test</h1>

    <p v-if="loading">Loading...</p>

    <!-- this will show the error -->
    <div
      v-if="error"
      style="
        background: #fee;
        border: 1px solid red;
        padding: 10px;
        border-radius: 6px;
      "
    >
      <strong>❌ Error:</strong> {{ error }}
    </div>

    <p v-if="posts.length > 0">✅ Got {{ posts.length }} sites!</p>
  </div>
</template>
