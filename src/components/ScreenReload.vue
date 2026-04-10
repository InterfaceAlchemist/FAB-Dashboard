<script setup>
// Define props coming from parent component (Main.vue)
// isScreenLoading will control whether the loading overlay appears or not
defineProps({
  isScreenLoading: Boolean, // expects true or false to show/hide the loading screen
});
</script>

<template>
  <!-- 
    This entire overlay only renders if isScreenLoading is TRUE 
    v-if completely removes/adds it from the DOM instead of just hiding it with CSS
  -->
  <div
    v-if="isScreenLoading"
    class="fixed inset-0 bg-[#1e2a35]/90 z-50 flex justify-center items-center"
  >
    <!--LOADING SPINNER-->
    <span class="loader"></span>
  </div>
</template>

<style scoped>
.loader {
  transform: rotateZ(45deg);
  perspective: 1000px;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  color: #fff;
  position: relative;
}

.loader:before,
.loader:after {
  content: "";
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  width: inherit;
  height: inherit;
  border-radius: 50%;
  transform: rotateX(70deg);
  animation: 1s spin linear infinite;
}

.loader:after {
  color: #ff4f19;
  transform: rotateY(70deg);
  animation-delay: 0.4s;
}

@keyframes spin {
  0%,
  100% {
    box-shadow: 0.2em 0px 0 0px currentcolor;
  }
  12% {
    box-shadow: 0.2em 0.2em 0 0 currentcolor;
  }
  25% {
    box-shadow: 0 0.2em 0 0px currentcolor;
  }
  37% {
    box-shadow: -0.2em 0.2em 0 0 currentcolor;
  }
  50% {
    box-shadow: -0.2em 0 0 0 currentcolor;
  }
  62% {
    box-shadow: -0.2em -0.2em 0 0 currentcolor;
  }
  75% {
    box-shadow: 0px -0.2em 0 0 currentcolor;
  }
  87% {
    box-shadow: 0.2em -0.2em 0 0 currentcolor;
  }
}
</style>
