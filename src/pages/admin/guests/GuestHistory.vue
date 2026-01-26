<script setup>
import { ref, computed, watch } from "vue";
import { guestHistory } from "@/data/guest/guestHistory";

const rows = ref([...guestHistory]);

// filters
const q = ref("");
const roomType = ref("");
const source = ref("");
const durationType = ref("");
const sort = ref("newest");

const safe = (v) => (v ?? "").toString().toLowerCase();

const roomTypeOptions = computed(() => {
  const s = new Set();
  rows.value.forEach((r) => s.add(r.room?.room_type || ""));
  return ["", ...Array.from(s).filter(Boolean)];
});

const sourceOptions = computed(() => {
  const s = new Set();
  rows.value.forEach((r) => s.add(r.source || ""));
  return ["", ...Array.from(s).filter(Boolean)];
});

const filtered = computed(() => {
  const key = safe(q.value);

  let list = rows.value.filter((r) => {
    const hit =
      !key ||
      safe(r.guest_name).includes(key) ||
      safe(r.phone).includes(key) ||
      safe(r.bookingNumber).includes(key) ||
      safe(r.room?.room_number).includes(key) ||
      safe(r.room?.room_type).includes(key);

    const okType = !roomType.value || r.room?.room_type === roomType.value;
    const okSource = !source.value || r.source === source.value;
    const okDur = !durationType.value || r.stay?.durationType === durationType.value;

    return hit && okType && okSource && okDur;
  });

  if (sort.value === "newest")
    list.sort((a, b) => (b.history_id || 0) - (a.history_id || 0));
  if (sort.value === "oldest")
    list.sort((a, b) => (a.history_id || 0) - (b.history_id || 0));
  if (sort.value === "guest")
    list.sort((a, b) => safe(a.guest_name).localeCompare(safe(b.guest_name)));
  if (sort.value === "room")
    list.sort((a, b) =>
      safe(a.room?.room_number).localeCompare(safe(b.room?.room_number))
    );

  return list;
});

// modal view
const open = ref(false);
const selected = ref(null);

const label = (s) => (s ? s.replaceAll("_", " ").toUpperCase() : "-");
const fmt = (s) => (s ? String(s).replace(" ", " • ") : "-");
const money = (n, cur = "USD") => `${cur} ${Number(n || 0).toFixed(2)}`;

function viewRow(r) {
  selected.value = r;
  open.value = true;
}
function close() {
  open.value = false;
  selected.value = null;
}

// ✅ lock scroll
watch(open, (v) => (document.body.style.overflow = v ? "hidden" : ""));

// ✅ simple export CSV
function exportCsv() {
  const head = [
    "history_id",
    "guest_name",
    "phone",
    "bookingNumber",
    "room_number",
    "room_type",
    "checkIn",
    "checkOut",
    "durationType",
    "hours",
    "nights",
    "source",
    "payment_status",
    "payment_method",
    "total",
    "currency",
  ];

  const lines = [head.join(",")];
  filtered.value.forEach((r) => {
    const row = [
      r.history_id,
      r.guest_name,
      r.phone,
      r.bookingNumber,
      r.room?.room_number,
      r.room?.room_type,
      r.stay?.checkIn,
      r.stay?.checkOut,
      r.stay?.durationType,
      r.stay?.hours,
      r.stay?.nights,
      r.source,
      r.payment?.status,
      r.payment?.method,
      r.price?.total,
      r.price?.currency,
    ].map((x) => `"${String(x ?? "").replaceAll('"', '""')}"`);
    lines.push(row.join(","));
  });

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `guest-history-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
</script>

<template>
  <div class="page">
    <!-- header -->
    <div class="head">
      <div>
        <h1>Guest History</h1>
        <p>Past stays • filter by guest, room type, source, duration</p>
      </div>

      <VaButton preset="secondary" icon="download" @click="exportCsv">
        Export CSV
      </VaButton>
    </div>

    <!-- filters -->
    <VaCard class="filters">
      <VaInput v-model="q" placeholder="Search guest / phone / booking / room..." />

      <!-- ✅ teleport fixes dropdown hidden -->
      <VaSelect
        v-model="roomType"
        :options="roomTypeOptions"
        label="Room Type"
        :teleport="true"
      />
      <VaSelect
        v-model="source"
        :options="sourceOptions"
        label="Source"
        :teleport="true"
      />
      <VaSelect
        v-model="durationType"
        :options="['', 'hour', 'night']"
        label="Duration"
        :teleport="true"
      />

      <VaSelect
        v-model="sort"
        :options="[
          { text: 'Newest', value: 'newest' },
          { text: 'Oldest', value: 'oldest' },
          { text: 'Guest A-Z', value: 'guest' },
          { text: 'Room', value: 'room' },
        ]"
        text-by="text"
        value-by="value"
        label="Sort"
        :teleport="true"
      />
    </VaCard>

    <!-- table -->
    <VaCard class="tableCard">
      <div class="tableWrap">
        <table class="tbl">
          <thead>
            <tr>
              <th>Guest</th>
              <th>Booking</th>
              <th>Room</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Duration</th>
              <th>Payment</th>
              <th class="right">Total</th>
              <th class="right">Action</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="filtered.length === 0">
              <td colspan="9" class="empty">No history found.</td>
            </tr>

            <tr v-for="r in filtered" :key="r.history_id">
              <td>
                <div class="main">{{ r.guest_name }}</div>
                <div class="sub">{{ r.phone || "-" }} • {{ r.nationality || "-" }}</div>
              </td>

              <td>
                <div class="main">{{ r.bookingNumber }}</div>
                <div class="sub">Source: {{ label(r.source) }}</div>
              </td>

              <td>
                <div class="main">Room {{ r.room?.room_number || "-" }}</div>
                <div class="sub">
                  {{ r.room?.room_type || "-" }} • Floor {{ r.room?.floor ?? "-" }}
                </div>
              </td>

              <td class="mono">{{ fmt(r.stay?.checkIn) }}</td>
              <td class="mono">{{ fmt(r.stay?.checkOut) }}</td>

              <td>
                <span class="badge">
                  {{ label(r.stay?.durationType) }}
                  <span class="muted">
                    •
                    {{
                      r.stay?.durationType === "hour"
                        ? `${r.stay?.hours || 0}h`
                        : `${r.stay?.nights || 0} night`
                    }}
                  </span>
                </span>
              </td>

              <td>
                <span class="badge pay">{{ label(r.payment?.status) }}</span>
                <div class="sub">Method: {{ label(r.payment?.method) }}</div>
              </td>

              <td class="right">
                <div class="main">{{ money(r.price?.total, r.price?.currency) }}</div>
                <div class="sub" v-if="r.payment?.deposit">
                  Deposit: {{ money(r.payment.deposit, r.price?.currency) }}
                </div>
              </td>

              <td class="right">
                <VaButton size="small" preset="secondary" @click="viewRow(r)"
                  >View</VaButton
                >
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </VaCard>

    <!-- modal view -->
    <Teleport to="body">
      <div v-if="open" class="m-wrap" @click="close">
        <div class="m" @click.stop>
          <header class="m-head">
            <div>
              <div class="m-title">History Details</div>
              <div class="m-sub">{{ selected?.bookingNumber || "-" }}</div>
            </div>
            <VaButton preset="secondary" icon="close" @click="close">Close</VaButton>
          </header>

          <section class="m-body">
            <div v-if="selected" class="viewGrid">
              <div class="card">
                <div class="t">Guest</div>
                <div class="big">{{ selected.guest_name }}</div>
                <div class="muted">{{ selected.phone }} • {{ selected.nationality }}</div>
              </div>

              <div class="card">
                <div class="t">Room</div>
                <div class="big">Room {{ selected.room?.room_number }}</div>
                <div class="muted">
                  {{ selected.room?.room_type }} • Floor {{ selected.room?.floor }}
                </div>
              </div>

              <div class="card">
                <div class="t">Stay</div>
                <div>
                  Check-in: <b class="mono">{{ fmt(selected.stay?.checkIn) }}</b>
                </div>
                <div>
                  Check-out: <b class="mono">{{ fmt(selected.stay?.checkOut) }}</b>
                </div>
                <div class="mt-2">
                  <span class="badge">{{ label(selected.stay?.durationType) }}</span>
                </div>
              </div>

              <div class="card">
                <div class="t">Payment</div>
                <div class="payRow">
                  <span class="pill" :class="selected.payment?.status">{{
                    label(selected.payment?.status)
                  }}</span>
                  <span class="muted">{{ label(selected.payment?.method) }}</span>
                </div>
                <div class="total">
                  {{ money(selected.price?.total, selected.price?.currency) }}
                </div>
              </div>

              <div class="card wide" v-if="selected.note">
                <div class="t">Note</div>
                <div>{{ selected.note }}</div>
              </div>
            </div>
          </section>

          <footer class="m-foot">
            <VaButton preset="secondary" @click="close">Close</VaButton>
          </footer>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.page {
  padding: 20px 24px;
  background: #f6f8fb;
  min-height: 100vh;
}

.head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 14px;
}
.head h1 {
  font-size: 22px;
  font-weight: 900;
  color: #0f172a;
  margin: 0;
}
.head p {
  margin: 6px 0 0;
  font-size: 13px;
  color: #475569;
}

.filters {
  background: #fff;
  border: 1px solid #eef2f6;
  border-radius: 14px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
  padding: 14px;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  gap: 12px;
  margin-bottom: 14px;
}
@media (max-width: 1000px) {
  .filters {
    grid-template-columns: 1fr 1fr;
  }
}
@media (max-width: 520px) {
  .filters {
    grid-template-columns: 1fr;
  }
}

.tableCard {
  border-radius: 14px;
  border: 1px solid #eef2f6;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
}
.tableWrap {
  overflow-x: auto;
}
.tbl {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
}
.tbl th {
  text-align: left;
  padding: 12px 14px;
  font-size: 12px;
  color: #475569;
  border-bottom: 1px solid #eef2f6;
  background: #fbfcfe;
  white-space: nowrap;
}
.tbl td {
  padding: 12px 14px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: top;
}
.tbl tr:hover td {
  background: #fafcff;
}

.right {
  text-align: right;
}
.main {
  font-weight: 900;
  color: #0f172a;
  font-size: 13px;
}
.sub {
  margin-top: 4px;
  font-size: 12px;
  color: #64748b;
}

.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
    "Courier New", monospace;
  font-size: 12px;
  color: #334155;
  white-space: nowrap;
}
.empty {
  text-align: center;
  padding: 20px !important;
  font-weight: 800;
  color: #64748b;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 900;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #334155;
}
.badge.pay {
  background: #eff6ff;
  border-color: #bfdbfe;
  color: #1d4ed8;
}
.muted {
  color: #64748b;
  font-weight: 800;
}

/* modal */
.m-wrap {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: rgba(15, 23, 42, 0.45);
  display: grid;
  place-items: center;
  padding: 18px;
}
.m {
  width: min(980px, 100%);
  max-height: 95vh;
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
  overflow: auto;
  max-height: calc(92vh - 118px);
}
.m-foot {
  padding: 14px 16px;
  border-top: 1px solid #eef2f6;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  background: #fff;
}

.viewGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
@media (max-width: 760px) {
  .viewGrid {
    grid-template-columns: 1fr;
  }
}
.card {
  border: 1px solid #eef2f6;
  border-radius: 14px;
  background: #fbfcfe;
  padding: 14px;
}
.card.wide {
  grid-column: 1 / -1;
}
.t {
  font-size: 12px;
  color: #64748b;
  font-weight: 800;
  margin-bottom: 8px;
}
.big {
  font-size: 18px;
  font-weight: 900;
  color: #0f172a;
}
.payRow {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 10px;
}

.pill {
  padding: 6px 12px;
  border-radius: 999px;
  font-weight: 900;
  font-size: 11px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #334155;
}
.pill.paid {
  background: #dcfce7;
  border-color: #bbf7d0;
  color: #166534;
}
.pill.unpaid {
  background: #fee2e2;
  border-color: #fecaca;
  color: #991b1b;
}
.pill.partial {
  background: #fef9c3;
  border-color: #fde68a;
  color: #854d0e;
}

.total {
  font-size: 24px;
  font-weight: 900;
  color: #1d4ed8;
}

/* vuestic polish */
:deep(.va-input__container),
:deep(.va-select__container) {
  border-radius: 10px;
  background: #f9fafb;
}
:deep(.va-button) {
  border-radius: 10px;
  font-weight: 800;
}
</style>
