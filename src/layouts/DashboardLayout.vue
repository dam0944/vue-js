<script setup>
import { ref } from "vue"
import Header from "@/components/layout/Header.vue"
import Sidebar from "@/components/layout/Sidebar.vue"

const showSidebar = ref(true)
</script>

<template>
  <VaLayout class="layout-root">
    <!-- TOP -->
    <template #top>
      <!-- IMPORTANT: remove overflow-hidden from header wrapper -->
      <Header class="w-full sticky top-0 z-50">
        <template #toggle>
          <VaButton preset="secondary" icon="menu" @click="showSidebar = !showSidebar" />
        </template>
      </Header>
    </template>

    <!-- LEFT -->
    <template #left>
      <Sidebar v-model="showSidebar" />
    </template>

    <!-- CONTENT -->
    <template #content>
      <!-- This wrapper must own the scroll -->
      <div class="content-shell">
        <main class="content-scroll">
          <router-view />
        </main>
      </div>
    </template>
  </VaLayout>
</template>

<style scoped>
/* keep Vuestic stable */
.layout-root {
  height: 100vh; /* IMPORTANT */
  transform: none !important;
  transition: none !important;
}

/* Make content area fill available height */
.content-shell {
  height: 100%;
  min-height: 0; /* IMPORTANT for flex/overflow children */
  display: flex;
  flex-direction: column;
}

/* Scroll container */
.content-scroll {
  flex: 1;
  min-height: 0; /* IMPORTANT */
  overflow-y: auto;
  overflow-x: hidden;

  /* spacing */
  padding: 16px;

  /* optional background */
  background: #f4f7f9;

  /* optional: hide scrollbar */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
}
.content-scroll::-webkit-scrollbar {
  width: 0;
  height: 0;
  display: none;
}
</style>
