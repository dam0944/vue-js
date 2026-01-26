<script setup>
import { onMounted } from "vue"

onMounted(() => {
  // Remove the no-motion class after first paint (prevents refresh scale/jump)
  requestAnimationFrame(() => {
    document.documentElement.classList.remove("no-motion")
  })
})
</script>

<template>
  <router-view />
</template>
