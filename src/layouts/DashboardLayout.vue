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
      <!-- IMPORTANT: this wrapper must take full height & allow children to shrink -->
      <div class="content-shell">
        <!-- Vuestic Scroll Container owns the scroll -->
        <VaScrollContainer class="content-scroll" vertical>
          <div class="content-inner">
            <router-view />
          </div>
        </VaScrollContainer>
      </div>
    </template>
  </VaLayout>
</template>

<style scoped>
/* Root must be 100vh so layout areas calculate correctly */
.layout-root {
  height: 100vh;
  min-height: 0;
  transform: none !important;
  transition: none !important;
}

/* Content area fill height */
.content-shell {
  height: 100%;
  min-height: 0; /* IMPORTANT */
  display: flex;
  flex-direction: column;
}

/* VaScrollContainer should be the ONLY scroll */
.content-scroll {
  flex: 1;
  min-height: 0; /* IMPORTANT */
  width: 100%;
}

.content-inner {
  padding: 16px;
  padding-bottom: 90px; /* ✅ important: allow last content to be visible */
  background: #f4f7f9;
  min-height: auto;     /* ✅ remove min-height: 100% */
}

/* Optional: smoother for anchor scroll / router transitions */
:global(html) {
  scroll-behavior: smooth;
}
/* Hide scrollbar for Vuestic ScrollContainer */
.va-scroll-container__content {
  scrollbar-width: none !important;       /* Firefox */
  -ms-overflow-style: none !important;    /* IE/Edge */
}

.va-scroll-container__content::-webkit-scrollbar {
  width: 0px !important;
  height: 0px !important;
  display: none !important;              /* Chrome/Safari */
}
</style>
