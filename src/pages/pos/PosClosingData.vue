<script setup>
import { ref, computed, reactive, watch } from "vue"

/**
 * POS Closing (Static Demo)
 * - Daily close shift
 * - Count cash + compare system
 * - Summary + variance
 * - Save (demo)
 */

// ------------------ filters / header ------------------
const closeDate = ref(new Date().toISOString().slice(0, 10))
const shift = ref("morning")
const cashier = ref("Sok Dara")

// ------------------ system summary (demo from DB reports) ------------------
const system = reactive({
  opening_cash_usd: 50,
  opening_cash_khr: 200000,

  // system totals from transactions
  sales_room_usd: 180,
  sales_extra_usd: 25,

  received_cash_usd: 120,
  received_cash_khr: 350000,
  received_aba_usd: 60,
  received_card_usd: 25,
  received_bank_usd: 0,

  refunds_usd: 0,
  voids: 1,
  discounts_usd: 5,
})

// ------------------ counted (input by staff) ------------------
const counted = reactive({
  cash_usd: 0,
  cash_khr: 0,

  aba_usd: 0,
  card_usd: 0,
  bank_usd: 0,

  notes: "",
})

// quick add notes
const noteOptions = [
  "No issues.",
  "Short cash due to change shortage.",
  "Customer paid late (ABA).",
  "One void transaction (mistake).",
]

// ------------------ currency helpers ------------------
const FX_KHR_PER_USD = ref(4100) // demo exchange rate

const moneyUSD = (n) => `USD ${Number(n || 0).toFixed(2)}`
const moneyKHR = (n) => `KHR ${Number(n || 0).toLocaleString()}`
const usdFromKHR = (khr) => Number(khr || 0) / Number(FX_KHR_PER_USD.value || 1)

const systemSalesTotalUSD = computed(() => system.sales_room_usd + system.sales_extra_usd)
const systemReceivedTotalUSD = computed(() => {
  return (
    system.received_cash_usd +
    usdFromKHR(system.received_cash_khr) +
    system.received_aba_usd +
    system.received_card_usd +
    system.received_bank_usd
  )
})

const countedTotalUSD = computed(() => {
  return (
    Number(counted.cash_usd || 0) +
    usdFromKHR(counted.cash_khr) +
    Number(counted.aba_usd || 0) +
    Number(counted.card_usd || 0) +
    Number(counted.bank_usd || 0)
  )
})

const varianceUSD = computed(() => countedTotalUSD.value - systemReceivedTotalUSD.value)

const varianceBadge = computed(() => {
  const v = varianceUSD.value
  if (Math.abs(v) < 0.01) return { text: "BALANCED", cls: "ok" }
  if (v > 0) return { text: "OVER", cls: "blue" }
  return { text: "SHORT", cls: "danger" }
})

// demo “closing total cash drawer” (opening cash + cash received - refunds)
const expectedCashUSD = computed(() => system.opening_cash_usd + system.received_cash_usd - system.refunds_usd)
const expectedCashKHR = computed(() => system.opening_cash_khr + system.received_cash_khr)

const cashVarianceUSD = computed(() => Number(counted.cash_usd || 0) - expectedCashUSD.value)
const cashVarianceKHR = computed(() => Number(counted.cash_khr || 0) - expectedCashKHR.value)

// ------------------ actions ------------------
function resetCount() {
  counted.cash_usd = 0
  counted.cash_khr = 0
  counted.aba_usd = 0
  counted.card_usd = 0
  counted.bank_usd = 0
  counted.notes = ""
}

function applyNote(n) {
  counted.notes = counted.notes ? `${counted.notes}\n- ${n}` : `- ${n}`
}

function saveClosing() {
  // TODO: call API (insert into closing table or submit report)
  const payload = {
    close_date: closeDate.value,
    shift: shift.value,
    cashier: cashier.value,
    fx_khr_per_usd: FX_KHR_PER_USD.value,
    system: JSON.parse(JSON.stringify(system)),
    counted: JSON.parse(JSON.stringify(counted)),
    totals: {
      system_received_usd: systemReceivedTotalUSD.value,
      counted_usd: countedTotalUSD.value,
      variance_usd: varianceUSD.value,
    },
  }
  console.log("POS Closing payload", payload)
  alert("Saved (demo). Check console.")
}

// lock simple validation
const canSave = computed(() => {
  return String(closeDate.value).trim() && String(cashier.value).trim()
})

// watch: if date changes, you can fetch new system totals later
watch(closeDate, () => {
  // TODO: fetch system totals by date
})
</script>

<template>
  <div class="page">
    <!-- Header -->
    <div class="head">
      <div>
        <h1>POS Closing</h1>
        <p>End of shift closing • cash count • compare system vs counted • export / save</p>
      </div>

      <div class="headBtns">
        <VaButton preset="secondary" icon="refresh" @click="resetCount">Reset Count</VaButton>
        <VaButton color="success" icon="save" :disabled="!canSave" @click="saveClosing">Save Closing</VaButton>
      </div>
    </div>

    <!-- Top controls -->
    <VaCard class="controls">
      <VaInput v-model="closeDate" type="date" label="Closing Date" />
      <VaSelect v-model="shift" :options="['morning', 'afternoon', 'night']" label="Shift" />
      <VaInput v-model="cashier" label="Cashier Name" placeholder="ex: Sok Dara" />
      <VaInput v-model="FX_KHR_PER_USD" type="number" label="KHR / USD (Exchange)" />
    </VaCard>

    <!-- Summary stats -->
    <div class="stats">
      <div class="stat">
        <div class="k">System Sales (USD)</div>
        <div class="v">{{ moneyUSD(systemSalesTotalUSD) }}</div>
        <div class="sub">Room: {{ moneyUSD(system.sales_room_usd) }} • Extra: {{ moneyUSD(system.sales_extra_usd) }}</div>
      </div>

      <div class="stat ok">
        <div class="k">System Received (USD)</div>
        <div class="v">{{ moneyUSD(systemReceivedTotalUSD) }}</div>
        <div class="sub">Cash + ABA + Card + Bank (KHR converted)</div>
      </div>

      <div class="stat blue">
        <div class="k">Counted Total (USD)</div>
        <div class="v">{{ moneyUSD(countedTotalUSD) }}</div>
        <div class="sub">From your counted inputs</div>
      </div>

      <div class="stat" :class="varianceBadge.cls">
        <div class="k">Variance</div>
        <div class="v">{{ moneyUSD(varianceUSD) }}</div>
        <div class="sub">
          <span class="pill" :class="varianceBadge.cls">{{ varianceBadge.text }}</span>
        </div>
      </div>
    </div>

    <div class="grid">
      <!-- Left: System -->
      <VaCard class="card">
        <div class="cardHead">
          <div class="title">System Summary</div>
          <div class="hint">Auto from POS transactions (demo)</div>
        </div>

        <div class="twoCol">
          <div class="box">
            <div class="t">Opening Cash</div>
            <div class="row">
              <div class="k2">USD</div>
              <div class="v2">{{ moneyUSD(system.opening_cash_usd) }}</div>
            </div>
            <div class="row">
              <div class="k2">KHR</div>
              <div class="v2">{{ moneyKHR(system.opening_cash_khr) }}</div>
            </div>
          </div>

          <div class="box">
            <div class="t">Sales</div>
            <div class="row">
              <div class="k2">Room</div>
              <div class="v2">{{ moneyUSD(system.sales_room_usd) }}</div>
            </div>
            <div class="row">
              <div class="k2">Extra</div>
              <div class="v2">{{ moneyUSD(system.sales_extra_usd) }}</div>
            </div>
          </div>

          <div class="box wide">
            <div class="t">Received by Method</div>

            <div class="row">
              <div class="k2">Cash USD</div>
              <div class="v2">{{ moneyUSD(system.received_cash_usd) }}</div>
            </div>
            <div class="row">
              <div class="k2">Cash KHR</div>
              <div class="v2">{{ moneyKHR(system.received_cash_khr) }}</div>
            </div>
            <div class="row">
              <div class="k2">ABA</div>
              <div class="v2">{{ moneyUSD(system.received_aba_usd) }}</div>
            </div>
            <div class="row">
              <div class="k2">Card</div>
              <div class="v2">{{ moneyUSD(system.received_card_usd) }}</div>
            </div>
            <div class="row">
              <div class="k2">Bank</div>
              <div class="v2">{{ moneyUSD(system.received_bank_usd) }}</div>
            </div>
          </div>

          <div class="box wide">
            <div class="t">Adjustments</div>
            <div class="row">
              <div class="k2">Refunds</div>
              <div class="v2">{{ moneyUSD(system.refunds_usd) }}</div>
            </div>
            <div class="row">
              <div class="k2">Voids</div>
              <div class="v2">{{ system.voids }}</div>
            </div>
            <div class="row">
              <div class="k2">Discounts</div>
              <div class="v2">{{ moneyUSD(system.discounts_usd) }}</div>
            </div>
          </div>
        </div>
      </VaCard>

      <!-- Right: Counted -->
      <VaCard class="card">
        <div class="cardHead">
          <div class="title">Counted Cash & Methods</div>
          <div class="hint">Input what you counted</div>
        </div>

        <div class="form">
          <div class="section">
            <div class="secTitle">Cash Drawer</div>
            <div class="two">
              <VaInput v-model="counted.cash_usd" type="number" label="Counted Cash USD" />
              <VaInput v-model="counted.cash_khr" type="number" label="Counted Cash KHR" />
            </div>

            <div class="subBox">
              <div class="line">
                <b>Expected Cash USD:</b> {{ moneyUSD(expectedCashUSD) }}
                <span class="miniPill" :class="cashVarianceUSD === 0 ? 'ok' : (cashVarianceUSD > 0 ? 'blue' : 'danger')">
                  {{ moneyUSD(cashVarianceUSD) }}
                </span>
              </div>
              <div class="line">
                <b>Expected Cash KHR:</b> {{ moneyKHR(expectedCashKHR) }}
                <span class="miniPill" :class="cashVarianceKHR === 0 ? 'ok' : (cashVarianceKHR > 0 ? 'blue' : 'danger')">
                  {{ moneyKHR(cashVarianceKHR) }}
                </span>
              </div>
              <div class="muted">KHR is converted using {{ FX_KHR_PER_USD }} rate.</div>
            </div>
          </div>

          <div class="section">
            <div class="secTitle">Non-Cash Methods</div>
            <div class="two">
              <VaInput v-model="counted.aba_usd" type="number" label="ABA (USD)" />
              <VaInput v-model="counted.card_usd" type="number" label="Card (USD)" />
            </div>
            <div class="two">
              <VaInput v-model="counted.bank_usd" type="number" label="Bank Transfer (USD)" />
              <div></div>
            </div>
          </div>

          <div class="section">
            <div class="secTitle">Notes</div>

            <div class="noteBtns">
              <VaButton
                v-for="n in noteOptions"
                :key="n"
                size="small"
                preset="secondary"
                @click="applyNote(n)"
              >
                + {{ n }}
              </VaButton>
            </div>

            <VaTextarea v-model="counted.notes" label="Closing Notes" :max-rows="5" placeholder="Write notes about issues..." />
          </div>

          <div class="actions">
            <VaButton preset="secondary" @click="resetCount">Reset</VaButton>
            <VaButton color="success" icon="save" :disabled="!canSave" @click="saveClosing">Save Closing</VaButton>
          </div>
        </div>
      </VaCard>
    </div>

    <!-- Quick Tips -->
    <div class="tips">
      <div class="tipTitle">Quick Tips</div>
      <ul>
        <li>Count cash twice before closing.</li>
        <li>If KHR cash is used, confirm exchange rate.</li>
        <li>Explain variance in notes (short/over).</li>
        <li>Keep screenshot of ABA transfers if needed.</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.page{
  padding: 16px;
  background:#f8fafc;
  min-height: 100vh;
}
.head{
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  gap: 12px;
  margin-bottom: 12px;
}
.head h1{
  margin:0;
  font-weight: 900;
  color:#0f172a;
  font-size: 20px;
}
.head p{
  margin:4px 0 0;
  color:#64748b;
  font-weight: 700;
  font-size: 12px;
}
.headBtns{ display:flex; gap: 8px; flex-wrap: wrap; }

.controls{
  padding: 12px;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  background:#fff;
  display:grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 10px;
  margin-bottom: 12px;
}
@media(max-width: 900px){
  .controls{ grid-template-columns: 1fr 1fr; }
}
@media(max-width: 520px){
  .controls{ grid-template-columns: 1fr; }
}

.stats{
  display:grid;
  grid-template-columns: repeat(4, minmax(0,1fr));
  gap: 10px;
  margin-bottom: 12px;
}
@media(max-width: 980px){
  .stats{ grid-template-columns: repeat(2, minmax(0,1fr)); }
}
@media(max-width: 520px){
  .stats{ grid-template-columns: 1fr; }
}
.stat{
  background:#fff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 12px;
}
.stat.ok{ border-color:#bbf7d0; background:#f0fdf4; }
.stat.blue{ border-color:#bae6fd; background:#f0f9ff; }
.stat.danger{ border-color:#fecaca; background:#fff1f2; }

.k{ color:#64748b; font-weight: 800; font-size: 12px; }
.v{ color:#0f172a; font-weight: 900; font-size: 20px; margin-top: 4px; }
.sub{ margin-top: 6px; color:#475569; font-weight: 700; font-size: 12px; }

.grid{
  display:grid;
  grid-template-columns: 1.1fr .9fr;
  gap: 12px;
  margin-bottom: 12px;
}
@media(max-width: 980px){
  .grid{ grid-template-columns: 1fr; }
}

.card{
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  overflow:hidden;
}
.cardHead{
  padding: 12px;
  background:#fbfcfe;
  border-bottom: 1px solid #e2e8f0;
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  gap: 10px;
}
.title{ font-weight: 900; color:#0f172a; }
.hint{ color:#64748b; font-weight: 700; font-size: 12px; }

.twoCol{
  padding: 12px;
  display:grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.box{
  border: 1px solid #eef2f6;
  border-radius: 14px;
  padding: 12px;
  background:#fff;
}
.box.wide{ grid-column: 1 / -1; }
.t{ font-weight: 900; color:#0f172a; margin-bottom: 8px; }
.row{ display:flex; justify-content:space-between; gap: 10px; padding: 6px 0; }
.k2{ color:#64748b; font-weight: 800; font-size: 12px; }
.v2{ color:#0f172a; font-weight: 900; font-size: 13px; }

.form{ padding: 12px; }
.section{ margin-bottom: 12px; }
.secTitle{ font-weight: 900; color:#0f172a; margin-bottom: 8px; }
.two{
  display:grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
@media(max-width: 520px){
  .two{ grid-template-columns: 1fr; }
}

.subBox{
  margin-top: 10px;
  border: 1px dashed #cbd5e1;
  background:#f8fafc;
  border-radius: 14px;
  padding: 10px;
}
.line{
  display:flex;
  justify-content:space-between;
  gap: 10px;
  align-items:center;
  color:#334155;
  font-weight: 800;
  font-size: 12px;
  padding: 4px 0;
}
.miniPill{
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid #e2e8f0;
  background:#fff;
  font-weight: 900;
}
.miniPill.ok{ background:#dcfce7; border-color:#bbf7d0; color:#166534; }
.miniPill.blue{ background:#e0f2fe; border-color:#bae6fd; color:#075985; }
.miniPill.danger{ background:#fee2e2; border-color:#fecaca; color:#991b1b; }

.noteBtns{
  display:flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.actions{
  display:flex;
  justify-content:flex-end;
  gap: 10px;
  margin-top: 10px;
}

.pill{
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid #e2e8f0;
  background:#f8fafc;
  font-weight: 900;
  font-size: 11px;
}
.pill.ok{ background:#dcfce7; border-color:#bbf7d0; color:#166534; }
.pill.blue{ background:#e0f2fe; border-color:#bae6fd; color:#075985; }
.pill.danger{ background:#fee2e2; border-color:#fecaca; color:#991b1b; }

.tips{
  border: 1px solid #eef2f6;
  background: #fff;
  border-radius: 16px;
  padding: 12px;
}
.tipTitle{
  font-weight: 900;
  color:#0f172a;
  margin-bottom: 8px;
}
.tips ul{
  margin: 0;
  padding-left: 18px;
  color:#334155;
  font-weight: 700;
  font-size: 13px;
}
.tips li{ margin: 6px 0; }

/* Vuestic polish */
:deep(.va-input__container),
:deep(.va-select__container),
:deep(.va-textarea__container){
  border-radius: 12px;
  background:#f9fafb;
}
:deep(.va-button){ border-radius: 12px; font-weight: 900; }
</style>
