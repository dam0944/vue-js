<script setup>
import { ref, computed } from "vue"
import { in_house } from "@/data/guest/in_house"

const stays = ref([...in_house])

const search = ref("")
const status = ref("")
const floor = ref("")

const floors = ["", 1, 2, 3, 4, 5]
const statuses = ["", "in_house", "checked_out"]

const filtered = computed(() => {
  return stays.value.filter(s => {
    const hit =
      !search.value ||
      s.guest_name.toLowerCase().includes(search.value.toLowerCase()) ||
      s.room.room_number.includes(search.value)

    const okStatus = !status.value || s.status === status.value
    const okFloor = !floor.value || s.room.floor === Number(floor.value)

    return hit && okStatus && okFloor
  })
})

function checkout(stay) {
  alert(`Check-out Room ${stay.room.room_number} for ${stay.guest_name}`)
}

function extend(stay) {
  alert(`Extend stay for ${stay.guest_name}`)
}

function addCharge(stay) {
  alert(`Add extra charge to ${stay.guest_name}`)
}
</script>

<template>
  <div class="page">

    <!-- HEADER -->
    <div class="header">
      <div>
        <h1>In-House Guests</h1>
        <p>Guests currently staying in your guesthouse</p>
      </div>

      <VaButton color="success" icon="refresh" class="btn-refresh">
        Refresh
      </VaButton>
    </div>

    <!-- FILTERS -->
    <VaCard class="filters">
      <VaInput v-model="search" placeholder="Search guest or room..." />
      <VaSelect v-model="status" :options="statuses" label="Status" />
      <VaSelect v-model="floor" :options="floors" label="Floor" />
    </VaCard>

    <!-- ROOM CARDS GRID -->
    <div class="room-grid">
      <VaCard
        v-for="s in filtered"
        :key="s.stay_id"
        class="room-card"
      >
        <div class="card-top">
          <div>
            <div class="room-title">
              Room {{ s.room.room_number }}
            </div>
            <div class="room-sub">
              Floor {{ s.room.floor }} • {{ s.room.room_type }}
            </div>
          </div>

          <span class="badge in-house">
            IN HOUSE
          </span>
        </div>

        <div class="card-body">
          <div><b>Guest:</b> {{ s.guest_name }}</div>
          <div><b>Phone:</b> {{ s.phone }}</div>
          <div><b>Check-in:</b> {{ s.stay.checkIn }}</div>
          <div><b>Check-out:</b> {{ s.stay.checkOut }}</div>
          <div><b>Payment:</b> {{ s.payment.status }}</div>
          <div><b>Total:</b> {{ s.price.currency }} {{ s.price.total }}</div>
        </div>

        <div class="card-actions">
          <VaButton size="small" color="danger" @click="checkout(s)">
            Check-out
          </VaButton>

          <VaButton size="small" preset="secondary" @click="extend(s)">
            Extend Stay
          </VaButton>

          <VaButton size="small" preset="secondary" @click="addCharge(s)">
            Add Charge
          </VaButton>
        </div>
      </VaCard>
    </div>

    <!-- EMPTY STATE -->
    <div v-if="filtered.length === 0" class="empty-state">
      No in-house guests found.
    </div>

  </div>
</template>

<style scoped>
.page {
  padding: 20px 24px;
  background: #f6f8fb;
  min-height: 100vh;
}

/* HEADER */
.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 14px;
}

.header h1 {
  font-size: 22px;
  font-weight: 900;
  color: #0f172a;
  margin: 0;
}

.header p {
  margin: 6px 0 0;
  font-size: 13px;
  color: #475569;
}

/* FILTERS */
.filters {
  background: #ffffff;
  border: 1px solid #eef2f6;
  border-radius: 14px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
  padding: 14px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}

@media (max-width: 900px) {
  .filters {
    grid-template-columns: 1fr;
  }
}

/* ROOM GRID */
.room-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

/* ROOM CARD */
.room-card {
  border-radius: 16px;
  border: 1px solid #eef2f6;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
  background: #ffffff;
  padding: 14px;
  transition: transform 0.1s ease, box-shadow 0.1s ease;
}

.room-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.12);
}

/* CARD TOP */
.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.room-title {
  font-size: 16px;
  font-weight: 900;
  color: #0f172a;
}

.room-sub {
  margin-top: 2px;
  font-size: 12px;
  color: #64748b;
}

/* BADGE */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 900;
}

.badge.in-house {
  background: #dcfce7;
  color: #166534;
  border: 1px solid #bbf7d0;
}

/* CARD BODY */
.card-body {
  border-top: 1px solid #eef2f6;
  padding-top: 10px;
  margin-top: 6px;
  font-size: 13px;
  color: #334155;
  line-height: 1.6;
}

/* ACTION BUTTONS */
.card-actions {
  margin-top: 12px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* EMPTY STATE */
.empty-state {
  margin-top: 20px;
  text-align: center;
  font-weight: 800;
  color: #64748b;
}

/* VUESTIC POLISH */
:deep(.va-input__container),
:deep(.va-select__container) {
  border-radius: 10px;
  background: #f8fafc;
}

:deep(.va-button) {
  border-radius: 10px;
  font-weight: 800;
}
</style>
