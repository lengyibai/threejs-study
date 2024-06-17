<script setup lang="ts">
import { onMounted, ref } from "vue";

import { BoxGeometry } from "./hooks/BoxGeometry";
import { PlaneGeometry } from "./hooks/PlaneGeometry";

const three = new PlaneGeometry();

const appRef = ref<HTMLElement>();

onMounted(() => {
  appRef.value!.appendChild(three.renderer.domElement);
});
</script>

<template>
  <div ref="appRef" class="App"></div>
</template>

<style scoped lang="less">
canvas {
  width: 100%;
  height: 100%;
}
</style>
