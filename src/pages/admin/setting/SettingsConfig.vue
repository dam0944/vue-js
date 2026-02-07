<template>
  <div class="page">

    <!-- Header -->
    <div class="header">
      <div>
        <h1 class="title">System Configuration</h1>
        <p class="subtitle">Manage property, billing, POS, security and system behavior.</p>
      </div>
      <VaButton icon="save" @click="saveAll">Save Changes</VaButton>
    </div>

    <!-- Groups -->
    <div
      v-for="group in config"
      :key="group.key"
      class="group-card"
    >
      <div class="group-header">
        <div>
          <h2>{{ group.title }}</h2>
          <p>{{ group.description }}</p>
        </div>
      </div>

      <div class="group-body">
        <div
          v-for="item in visibleItems(group.items)"
          :key="item.key"
          class="field"
        >
          <!-- TEXT -->
          <VaInput
            v-if="item.type === 'text'"
            v-model="item.value"
            :label="item.label"
            :placeholder="item.hint"
          />

          <!-- NUMBER -->
          <VaInput
            v-else-if="item.type === 'number'"
            v-model.number="item.value"
            type="number"
            :label="item.label"
            :min="item.min"
            :max="item.max"
            :step="item.step"
          />

          <!-- TIME -->
          <VaInput
            v-else-if="item.type === 'time'"
            v-model="item.value"
            type="time"
            :label="item.label"
          />

          <!-- SELECT -->
          <VaSelect
            v-else-if="item.type === 'select'"
            v-model="item.value"
            :options="item.options"
            :label="item.label"
          />

          <!-- SWITCH -->
          <VaSwitch
            v-else-if="item.type === 'switch'"
            v-model="item.value"
            :label="item.label"
          />

          <div v-if="item.hint" class="hint">{{ item.hint }}</div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { system_config } from "@/data/setting/system_config"
import { reactive } from "vue"

const config = reactive(system_config)

/**
 * Show items only if dependsOn satisfied
 */
function visibleItems(items) {
  return items.filter(item => {
    if (!item.dependsOn) return true
    const dep = items.find(i => i.key === item.dependsOn.key)
    return dep?.value === item.dependsOn.value
  })
}

function saveAll() {
  console.log("Saved config:", JSON.parse(JSON.stringify(config)))
}
</script>

<style scoped>
.page {
  background: #ffffff;
  min-height: 100vh;
  padding: 20px;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: end;
  margin-bottom: 20px;
}

.title {
  font-size: 22px;
  font-weight: 900;
}

.subtitle {
  font-size: 13px;
  color: #64748b;
}

/* Group card */
.group-card {
  background: white;
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.06);
  padding: 18px;
  margin-bottom: 18px;
}

.group-header h2 {
  font-size: 16px;
  font-weight: 900;
  margin: 0;
}

.group-header p {
  font-size: 12px;
  color: #64748b;
  margin-top: 4px;
}

/* Fields grid */
.group-body {
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
}

.hint {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 4px;
}

/* Responsive */
@media (max-width: 900px) {
  .group-body {
    grid-template-columns: 1fr;
  }
}
</style>
