<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
</script>

<template>
  <div class="container">
    <RouterView />
  </div>
</template>

<style scoped lang="scss">
.container {
  @include flex(center, center);
  width: 100vw;
  height: 100vh;
}
</style>
