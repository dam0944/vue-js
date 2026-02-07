<template>
  <div class="page">
    <!-- Header -->
    <div class="header">
      <div>
        <h1 class="title">Property Settings</h1>
        <p class="subtitle">Manage your guesthouse basic information and operational defaults.</p>
      </div>

      <VaButton color="primary" @click="save">
        Save Changes
      </VaButton>
    </div>

    <!-- Form -->
    <VaCard class="card">
      <VaForm ref="formRef">

        <!-- Basic Info -->
        <h3 class="section-title">Basic Information</h3>
        <div class="grid-3">
          <VaInput v-model="form.property_code" label="Property Code" />
          <VaInput v-model="form.property_name" label="Property Name (EN)" />
          <VaInput v-model="form.property_name_khmer" label="Property Name (KH)" />
        </div>

        <div class="grid-3">
          <VaSelect
            v-model="form.property_type"
            :options="['guesthouse','hotel','resort','hostel']"
            label="Property Type"
          />
          <VaInput v-model="form.phone" label="Primary Phone" />
          <VaInput v-model="form.phone_secondary" label="Secondary Phone" />
        </div>

        <div class="grid-3">
          <VaInput v-model="form.email" label="Email" />
          <VaInput v-model="form.website" label="Website" />
          <VaInput v-model="form.logo_url" label="Logo URL" />
        </div>

        <!-- Address -->
        <h3 class="section-title">Address</h3>
        <div class="grid-3">
          <VaInput v-model="form.address" label="Address" />
          <VaInput v-model="form.city" label="City" />
          <VaInput v-model="form.province" label="Province" />
        </div>

        <div class="grid-3">
          <VaInput v-model="form.country" label="Country" />
          <VaInput v-model="form.postal_code" label="Postal Code" />
        </div>

        <!-- Operational Defaults -->
        <h3 class="section-title">Operational Defaults</h3>
        <div class="grid-4">
          <VaSelect
            v-model="form.default_currency"
            :options="['USD','KHR']"
            label="Currency"
          />
          <VaInput
            v-model="form.default_tax_rate"
            type="number"
            label="Tax Rate (%)"
          />
          <VaInput
            v-model="form.default_check_in_time"
            label="Check-in Time"
          />
          <VaInput
            v-model="form.default_check_out_time"
            label="Check-out Time"
          />
        </div>

        <div class="grid-3">
          <VaInput v-model="form.timezone" label="Timezone" />
          <VaInput v-model="form.total_rooms" type="number" label="Total Rooms" />
          <VaInput v-model="form.total_floors" type="number" label="Total Floors" />
        </div>

      </VaForm>
    </VaCard>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { property } from "@/data/setting/property"

const formRef = ref(null)
const form = ref({ ...property })

function save() {
  console.log("Saving property:", form.value)
}
</script>

<style scoped>
.page {
  background: #fff;
  min-height: 100vh;
  padding: 22px;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 18px;
}

.title {
  font-size: 22px;
  font-weight: 900;
}

.subtitle {
  font-size: 13px;
  color: #64748b;
}

/* Card */
.card {
  padding: 22px;
  border-radius: 16px;
  box-shadow: 0 10px 28px rgba(0,0,0,0.06);
}

/* Sections */
.section-title {
  margin: 22px 0 14px;
  font-size: 15px;
  font-weight: 800;
  color: #0f172a;
}

/* Grid Layouts */
.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-bottom: 14px;
}

.grid-4 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 14px;
}

@media (max-width: 1100px) {
  .grid-3,
  .grid-4 {
    grid-template-columns: 1fr;
  }
}
</style>
