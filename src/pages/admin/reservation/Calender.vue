<script setup>
import { ref, computed } from "vue";
import { calender } from "@/data/booking/calender"; // <- your static data

// Current week start (Mon)
const today = new Date();
const startOfWeek = new Date(today);
startOfWeek.setDate(today.getDate() - ((today.getDay() + 6) % 7)); // Monday

const weekStart = ref(new Date(startOfWeek));

const days = computed(() => {
  const d = new Date(weekStart.value);
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(d);
    x.setDate(d.getDate() + i);
    return x;
  });
});

function fmtDay(d) {
  return d.toISOString().slice(0, 10);
}
function dayLabel(d) {
  return d.toLocaleDateString(undefined, { weekday: "short", day: "2-digit" });
}

const rooms = computed(() => {
  const map = new Map();
  calender.forEach((b) => {
    const key = b.room?.number;
    if (!key) return;
    if (!map.has(key)) map.set(key, { number: b.room.number, type: b.room.type });
  });
  return Array.from(map.values()).sort((a, b) => a.number.localeCompare(b.number));
});

function overlapsDay(booking, dayDate) {
  const day = fmtDay(dayDate);
  const inDay = booking.stay?.checkIn?.slice(0, 10);
  const outDay = booking.stay?.checkOut?.slice(0, 10);
  if (!inDay || !outDay) return false;
  // block shows on dates from checkIn day to (checkOut day - 1) for night bookings
  // for hour booking, show only checkIn day
  if (booking.stay.durationType === "hour") return inDay === day;
  return day >= inDay && day < outDay;
}

function statusClass(b) {
  const s = b.status;
  if (s === "in_house") return "st-inhouse";
  if (s === "reserved") return "st-reserved";
  if (s === "checked_out") return "st-out";
  if (s === "cancelled") return "st-cancel";
  return "st-default";
}

function paymentDotClass(b) {
  const p = b.payment?.status;
  if (p === "paid") return "pd-paid";
  if (p === "partial") return "pd-partial";
  if (p === "unpaid") return "pd-unpaid";
  return "pd-default";
}

// Simple modal (later you can replace with your slideDown form)
const showModal = ref(false);
const selected = ref(null);

function openBooking(b) {
  selected.value = b;
  showModal.value = true;
}
function closeModal() {
  showModal.value = false;
  selected.value = null;
}

function prevWeek() {
  const d = new Date(weekStart.value);
  d.setDate(d.getDate() - 7);
  weekStart.value = d;
}
function nextWeek() {
  const d = new Date(weekStart.value);
  d.setDate(d.getDate() + 7);
  weekStart.value = d;
}
</script>

<template>
  <div class="cal-page">
    <!-- Header -->
    <div class="cal-head">
      <div>
        <h1 class="title">Calendar</h1>
        <p class="sub">Rooms schedule • Click booking to view</p>
      </div>

      <div class="controls">
        <VaButton preset="secondary" icon="chevron_left" @click="prevWeek">Prev</VaButton>
        <div class="range">{{ fmtDay(days[0]) }} → {{ fmtDay(days[6]) }}</div>
        <VaButton preset="secondary" icon="chevron_right" @click="nextWeek"
          >Next</VaButton
        >

        <VaButton color="success" icon="add">New Booking</VaButton>
      </div>
    </div>

    <!-- Calendar Grid -->
    <div class="cal-wrap">
      <!-- Top Row: Days -->
      <div class="grid">
        <div class="corner">
          <div class="cornerTitle">Rooms</div>
          <div class="cornerHint">Type</div>
        </div>

        <div v-for="d in days" :key="fmtDay(d)" class="dayHead">
          <div class="dayLabel">{{ dayLabel(d) }}</div>
          <div class="dayDate">{{ fmtDay(d) }}</div>
        </div>

        <!-- Rows: Rooms -->
        <template v-for="r in rooms" :key="r.number">
          <div class="roomCell">
            <div class="roomNo">Room {{ r.number }}</div>
            <div class="roomType">{{ r.type }}</div>
          </div>

          <div v-for="d in days" :key="r.number + fmtDay(d)" class="slot">
            <!-- Booking Blocks inside slot -->
            <div class="slotInner">
              <button
                v-for="b in calender.filter(
                  (x) => x.room?.number === r.number && overlapsDay(x, d)
                )"
                :key="b.id"
                class="block"
                :class="statusClass(b)"
                @click="openBooking(b)"
                type="button"
              >
                <span class="dot" :class="paymentDotClass(b)"></span>
                <div class="bMain">{{ b.guest?.name || "-" }}</div>
                <div class="bSub">
                  {{
                    b.stay?.durationType === "hour"
                      ? b.stay?.hours + "h"
                      : b.stay?.nights + " night"
                  }}
                  • {{ b.bookingNumber }}
                </div>
              </button>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Simple Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="m-backdrop" @click="closeModal">
        <div class="m" @click.stop>
          <div class="m-head">
            <div>
              <div class="m-title">Booking Detail</div>
              <div class="m-sub">{{ selected?.bookingNumber }}</div>
            </div>
            <VaButton preset="secondary" icon="close" @click="closeModal">Close</VaButton>
          </div>

          <div class="m-body">
            <div class="m-grid">
              <div class="m-card">
                <div class="k">Guest</div>
                <div class="v">{{ selected?.guest?.name }}</div>
                <div class="muted">{{ selected?.guest?.phone }}</div>
              </div>

              <div class="m-card">
                <div class="k">Room</div>
                <div class="v">Room {{ selected?.room?.number }}</div>
                <div class="muted">{{ selected?.room?.type }}</div>
              </div>

              <div class="m-card">
                <div class="k">Stay</div>
                <div class="muted">
                  Check-in: <b>{{ selected?.stay?.checkIn }}</b>
                </div>
                <div class="muted">
                  Check-out: <b>{{ selected?.stay?.checkOut }}</b>
                </div>
              </div>

              <div class="m-card">
                <div class="k">Payment</div>
                <div class="v">{{ selected?.payment?.status }}</div>
                <div class="muted">{{ selected?.payment?.method }}</div>
              </div>
            </div>
          </div>

          <div class="m-foot">
            <VaButton preset="secondary" @click="closeModal">OK</VaButton>
            <VaButton color="primary">Edit</VaButton>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.cal-page {
  padding: 18px;
  background: #f6f8fb;
  min-height: 100vh;
}

.cal-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 14px;
}

.title {
  margin: 0;
  font-size: 22px;
  font-weight: 900;
  color: #0f172a;
}
.sub {
  margin: 6px 0 0;
  font-size: 13px;
  color: #64748b;
  font-weight: 700;
}

.controls {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.range {
  padding: 8px 12px;
  border-radius: 12px;
  border: 1px solid #e5eaf2;
  background: #fff;
  font-weight: 900;
  color: #0f172a;
  font-size: 12px;
}

.cal-wrap {
  border: 1px solid #e5eaf2;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 12px 26px rgba(15, 23, 42, 0.08);
  overflow: auto;
}

/* Grid: 1 room column + 7 day columns */
.grid {
  display: grid;
  grid-template-columns: 220px repeat(7, minmax(180px, 1fr));
  min-width: 1400px; /* allow horizontal scroll on small screens */
}

.corner {
  padding: 12px;
  border-bottom: 1px solid #eef2f6;
  background: #fbfcfe;
  position: sticky;
  left: 0;
  z-index: 2;
}
.cornerTitle {
  font-weight: 900;
  color: #0f172a;
}
.cornerHint {
  margin-top: 4px;
  font-size: 12px;
  color: #64748b;
  font-weight: 700;
}

.dayHead {
  padding: 12px;
  border-bottom: 1px solid #eef2f6;
  background: #fbfcfe;
}
.dayLabel {
  font-weight: 900;
  color: #0f172a;
}
.dayDate {
  margin-top: 4px;
  font-size: 12px;
  color: #64748b;
  font-weight: 700;
}

.roomCell {
  padding: 12px;
  border-bottom: 1px solid #f1f5f9;
  background: #fff;
  position: sticky;
  left: 0;
  z-index: 1;
}
.roomNo {
  font-weight: 900;
  color: #0f172a;
}
.roomType {
  margin-top: 4px;
  font-size: 12px;
  color: #64748b;
  font-weight: 700;
}

.slot {
  border-bottom: 1px solid #f1f5f9;
  border-left: 1px solid #f1f5f9;
  padding: 10px;
  min-height: 86px;
  background: #fff;
}

.slotInner {
  display: grid;
  gap: 8px;
}

.block {
  width: 100%;
  text-align: left;
  border-radius: 12px;
  border: 1px solid #e5eaf2;
  padding: 10px;
  cursor: pointer;
  transition: transform 120ms ease, box-shadow 120ms ease;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
  background: #fff;
}
.block:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 22px rgba(15, 23, 42, 0.12);
}

.dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 999px;
  margin-right: 8px;
}
.bMain {
  display: inline-block;
  font-weight: 900;
  color: #0f172a;
  font-size: 13px;
}
.bSub {
  margin-top: 4px;
  font-size: 12px;
  color: #64748b;
  font-weight: 700;
}

/* Status styles (no gradient) */
.st-inhouse {
  border-left: 6px solid #22c55e;
}
.st-reserved {
  border-left: 6px solid #3b82f6;
}
.st-out {
  border-left: 6px solid #94a3b8;
}
.st-cancel {
  border-left: 6px solid #ef4444;
}
.st-default {
  border-left: 6px solid #a855f7;
}

/* Payment dot */
.pd-paid {
  background: #22c55e;
}
.pd-partial {
  background: #f59e0b;
}
.pd-unpaid {
  background: #ef4444;
}
.pd-default {
  background: #94a3b8;
}

/* Modal */
.m-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  z-index: 99999;
  display: grid;
  place-items: center;
  padding: 16px;
}
.m {
  width: min(820px, 100%);
  background: #fff;
  border-radius: 16px;
  border: 1px solid #eef2f6;
  box-shadow: 0 30px 90px rgba(15, 23, 42, 0.22);
  overflow: hidden;
}
.m-head {
  padding: 14px 16px;
  border-bottom: 1px solid #eef2f6;
  background: #fbfcfe;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}
.m-title {
  font-size: 16px;
  font-weight: 900;
  color: #0f172a;
}
.m-sub {
  margin-top: 2px;
  font-size: 12px;
  color: #64748b;
}
.m-body {
  padding: 16px;
}
.m-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
@media (max-width: 700px) {
  .m-grid {
    grid-template-columns: 1fr;
  }
}
.m-card {
  border: 1px solid #eef2f6;
  background: #fbfcfe;
  border-radius: 14px;
  padding: 14px;
}
.k {
  font-size: 12px;
  color: #64748b;
  font-weight: 800;
}
.v {
  margin-top: 6px;
  font-size: 15px;
  font-weight: 900;
  color: #0f172a;
}
.muted {
  margin-top: 4px;
  color: #64748b;
  font-weight: 700;
  font-size: 12px;
}
.m-foot {
  padding: 14px 16px;
  border-top: 1px solid #eef2f6;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  background: #fff;
}

/* Vuestic polish */
:deep(.va-button) {
  border-radius: 10px;
  font-weight: 800;
}
</style>
