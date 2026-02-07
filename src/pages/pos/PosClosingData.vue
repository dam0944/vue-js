<!-- POSClosing.vue (Vuestic UI layout + clean dashboard look) -->
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
const FX_KHR_PER_USD = ref(4100)

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
  if (Math.abs(v) < 0.01) return { text: "BALANCED", color: "success", icon: "check_circle" }
  if (v > 0) return { text: "OVER", color: "info", icon: "trending_up" }
  return { text: "SHORT", color: "danger", icon: "trending_down" }
})

// expected cash drawer
const expectedCashUSD = computed(() => system.opening_cash_usd + system.received_cash_usd - system.refunds_usd)
const expectedCashKHR = computed(() => system.opening_cash_khr + system.received_cash_khr)

const cashVarianceUSD = computed(() => Number(counted.cash_usd || 0) - expectedCashUSD.value)
const cashVarianceKHR = computed(() => Number(counted.cash_khr || 0) - expectedCashKHR.value)

const cashVarToneUSD = computed(() => {
  const v = cashVarianceUSD.value
  if (Math.abs(v) < 0.01) return { color: "success", icon: "check" }
  if (v > 0) return { color: "info", icon: "north" }
  return { color: "danger", icon: "south" }
})
const cashVarToneKHR = computed(() => {
  const v = cashVarianceKHR.value
  if (Math.abs(v) < 1) return { color: "success", icon: "check" }
  if (v > 0) return { color: "info", icon: "north" }
  return { color: "danger", icon: "south" }
})

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

const canSave = computed(() => String(closeDate.value).trim() && String(cashier.value).trim())

watch(closeDate, () => {
  // TODO: fetch system totals by date
})
</script>

<template>
  <div class="pc-page">
    <!-- Top Header -->
    <div class="pc-top">
      <div class="pc-top__left">
        <div class="pc-titleRow">
          <VaIcon name="point_of_sale" color="primary" />
          <div>
            <h1 class="pc-title">POS Closing</h1>
            <p class="pc-sub">
              End of shift closing • count cash • compare system vs counted • save report
            </p>
          </div>
        </div>

        <div class="pc-meta">
          <VaBadge
            :text="varianceBadge.text"
            :color="varianceBadge.color"
            :icon="varianceBadge.icon"
            class="pc-badge"
          />
          <div class="pc-metaText">
            Variance: <b>{{ moneyUSD(varianceUSD) }}</b>
          </div>
        </div>
      </div>

    
    </div>

    <!-- Filters / Controls -->
    <VaCard class="pc-card pc-controls">
      <VaCardContent class="pc-controls__grid">
        <VaInput v-model="closeDate" type="date" label="Closing Date" />
        <VaSelect v-model="shift" :options="['morning', 'afternoon', 'night']" label="Shift" />
        <VaInput v-model="cashier" label="Cashier" placeholder="ex: Sok Dara" />
        <VaInput v-model="FX_KHR_PER_USD" type="number" label="KHR / USD" />
      </VaCardContent>
    </VaCard>

    <!-- Summary KPI -->
    <div class="pc-kpis">
      <VaCard class="pc-card" >
        <VaCardContent class="pc-kpi">
          <div class="pc-kpi__head">  
            <div class="pc-kpi__label">System Sales</div>
            <VaIcon name="receipt_long" color="primary" />
          </div>
          <div class="pc-kpi__value">{{ moneyUSD(systemSalesTotalUSD) }}</div>
          <div class="pc-kpi__sub">
            Room: {{ moneyUSD(system.sales_room_usd) }} • Extra: {{ moneyUSD(system.sales_extra_usd) }}
          </div>
        </VaCardContent>
      </VaCard>

      <VaCard class="pc-card" >
        <VaCardContent class="pc-kpi">
          <div class="pc-kpi__head">
            <div class="pc-kpi__label">System Received</div>
            <VaIcon name="payments" color="success" />
          </div>
          <div class="pc-kpi__value">{{ moneyUSD(systemReceivedTotalUSD) }}</div>
          <div class="pc-kpi__sub">Cash + ABA + Card + Bank (KHR converted)</div>
        </VaCardContent>
      </VaCard>

      <VaCard class="pc-card" >
        <VaCardContent class="pc-kpi">
          <div class="pc-kpi__head">
            <div class="pc-kpi__label">Counted Total</div>
            <VaIcon name="calculate" color="info" />
          </div>
          <div class="pc-kpi__value">{{ moneyUSD(countedTotalUSD) }}</div>
          <div class="pc-kpi__sub">From your counted inputs</div>
        </VaCardContent>
      </VaCard>

      <VaCard class="pc-card" >
        <VaCardContent class="pc-kpi">
          <div class="pc-kpi__head">
            <div class="pc-kpi__label">Variance</div>
            <VaIcon :name="varianceBadge.icon" :color="varianceBadge.color" />
          </div>

          <div class="pc-kpi__value">{{ moneyUSD(varianceUSD) }}</div>

          <div class="pc-kpi__sub">
            <VaBadge
              :text="varianceBadge.text"
              :color="varianceBadge.color"
              :icon="varianceBadge.icon"
              class="pc-badge"
            />
          </div>
        </VaCardContent>
      </VaCard>
    </div>

    <!-- Main Grid -->
    <div class="pc-grid">
      <!-- Left: System Summary -->
      <VaCard class="pc-card" >
        <VaCardTitle class="pc-cardTitle">
          <div>
            <div class="pc-cardTitle__title">System Summary</div>
            <div class="pc-cardTitle__hint">Auto from POS transactions (demo)</div>
          </div>
          <VaIcon name="query_stats" color="primary" />
        </VaCardTitle>

        <VaCardContent class="pc-body">
          <div class="pc-panels">
            <VaCard class="pc-panel" >
              <VaCardContent>
                <div class="pc-panel__t">Opening Cash</div>
                <div class="pc-row"><span>USD</span><b>{{ moneyUSD(system.opening_cash_usd) }}</b></div>
                <div class="pc-row"><span>KHR</span><b>{{ moneyKHR(system.opening_cash_khr) }}</b></div>
              </VaCardContent>
            </VaCard>

            <VaCard class="pc-panel" >
              <VaCardContent>
                <div class="pc-panel__t">Sales</div>
                <div class="pc-row"><span>Room</span><b>{{ moneyUSD(system.sales_room_usd) }}</b></div>
                <div class="pc-row"><span>Extra</span><b>{{ moneyUSD(system.sales_extra_usd) }}</b></div>
              </VaCardContent>
            </VaCard>

            <VaCard class="pc-panel pc-panel--wide" >
              <VaCardContent>
                <div class="pc-panel__t">Received by Method</div>
                <div class="pc-row"><span>Cash USD</span><b>{{ moneyUSD(system.received_cash_usd) }}</b></div>
                <div class="pc-row"><span>Cash KHR</span><b>{{ moneyKHR(system.received_cash_khr) }}</b></div>
                <div class="pc-row"><span>ABA</span><b>{{ moneyUSD(system.received_aba_usd) }}</b></div>
                <div class="pc-row"><span>Card</span><b>{{ moneyUSD(system.received_card_usd) }}</b></div>
                <div class="pc-row"><span>Bank</span><b>{{ moneyUSD(system.received_bank_usd) }}</b></div>
              </VaCardContent>
            </VaCard>

            <VaCard class="pc-panel pc-panel--wide" >
              <VaCardContent>
                <div class="pc-panel__t">Adjustments</div>
                <div class="pc-row"><span>Refunds</span><b>{{ moneyUSD(system.refunds_usd) }}</b></div>
                <div class="pc-row"><span>Voids</span><b>{{ system.voids }}</b></div>
                <div class="pc-row"><span>Discounts</span><b>{{ moneyUSD(system.discounts_usd) }}</b></div>
              </VaCardContent>
            </VaCard>
          </div>
        </VaCardContent>
      </VaCard>

      <!-- Right: Counted -->
      <VaCard class="pc-card" >
        <VaCardTitle class="pc-cardTitle">
          <div>
            <div class="pc-cardTitle__title">Counted Cash & Methods</div>
            <div class="pc-cardTitle__hint">Input what you counted</div>
          </div>
          <VaIcon name="fact_check" color="info" />
        </VaCardTitle>

        <VaCardContent class="pc-body">
          <!-- Cash Drawer -->
          <div class="pc-section">
            <div class="pc-section__head">
              <div class="pc-section__title">Cash Drawer</div>
              <VaBadge
                :text="cashVarToneUSD.color === 'success' && cashVarToneKHR.color === 'success' ? 'OK' : 'CHECK'"
                :color="cashVarToneUSD.color === 'success' && cashVarToneKHR.color === 'success' ? 'success' : 'warning'"
                icon="info"
              />
            </div>

            <div class="pc-two">
              <VaInput v-model="counted.cash_usd" type="number" label="Counted Cash USD" />
              <VaInput v-model="counted.cash_khr" type="number" label="Counted Cash KHR" />
            </div>

            <VaAlert class="pc-alert" color="secondary" border="left" dense>
              <div class="pc-alertRow">
                <div>
                  <b>Expected USD:</b> {{ moneyUSD(expectedCashUSD) }}
                </div>
                <VaBadge
                  :text="moneyUSD(cashVarianceUSD)"
                  :color="cashVarToneUSD.color"
                  :icon="cashVarToneUSD.icon"
                />
              </div>

              <div class="pc-alertRow">
                <div>
                  <b>Expected KHR:</b> {{ moneyKHR(expectedCashKHR) }}
                </div>
                <VaBadge
                  :text="moneyKHR(cashVarianceKHR)"
                  :color="cashVarToneKHR.color"
                  :icon="cashVarToneKHR.icon"
                />
              </div>

              <div class="pc-muted">KHR is converted using {{ FX_KHR_PER_USD }} rate.</div>
            </VaAlert>
          </div>

          <!-- Non-cash -->
          <div class="pc-section">
            <div class="pc-section__head">
              <div class="pc-section__title">Non-Cash Methods</div>
              <div class="pc-muted">Fill based on receipts / banking app</div>
            </div>

            <div class="pc-two">
              <VaInput v-model="counted.aba_usd" type="number" label="ABA (USD)" />
              <VaInput v-model="counted.card_usd" type="number" label="Card (USD)" />
            </div>
            <div class="pc-two">
              <VaInput v-model="counted.bank_usd" type="number" label="Bank Transfer (USD)" />
              <div />
            </div>
          </div>

          <!-- Notes -->
          <div class="pc-section">
            <div class="pc-section__head">
              <div class="pc-section__title">Notes</div>
              <VaButton preset="secondary" size="small" icon="playlist_add" @click="applyNote('No issues.')">
                Quick Note
              </VaButton>
            </div>

            <div class="pc-chips">
              <VaChip
                v-for="n in noteOptions"
                :key="n"
                size="small"
                class="pc-chip"
                @click="applyNote(n)"
              >
                + {{ n }}
              </VaChip>
            </div>

            <VaTextarea
              v-model="counted.notes"
              label="Closing Notes"
              :max-rows="6"
              placeholder="Write notes about issues..."
            />
          </div>

          <!-- Actions -->
          <div class="pc-actions">
            <VaButton preset="secondary" icon="refresh" @click="resetCount">Reset</VaButton>
            <VaButton color="success" icon="save" :disabled="!canSave" @click="saveClosing">
              Save Closing
            </VaButton>
          </div>
        </VaCardContent>
      </VaCard>
    </div>

    <!-- Tips -->
    <VaCard class="pc-card pc-tips" >
      <VaCardTitle class="pc-cardTitle">
        <div>
          <div class="pc-cardTitle__title">Quick Tips</div>
          <div class="pc-cardTitle__hint">Best practice for closing shift</div>
        </div>
        <VaIcon name="tips_and_updates" color="warning" />
      </VaCardTitle>

      <VaCardContent class="pc-body">
        <ul class="pc-ul">
          <li>Count cash twice before closing.</li>
          <li>If KHR cash is used, confirm exchange rate.</li>
          <li>Explain variance in notes (short/over).</li>
          <li>Keep screenshot of ABA transfers if needed.</li>
        </ul>
      </VaCardContent>
    </VaCard>
  </div>
</template>

<style scoped>
/* Layout tokens */
.pc-page{
  padding: 16px;
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
}

/* Header */
.pc-top{
  display:flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}
.pc-titleRow{
  display:flex;
  align-items:flex-start;
  gap: 10px;
}
.pc-title{
  margin:0;
  font-weight: 900;
  color:#0f172a;
  font-size: 22px;
  letter-spacing: -0.02em;
}
.pc-sub{
  margin:4px 0 0;
  color:#64748b;
  font-weight: 700;
  font-size: 12px;
}
.pc-meta{
  display:flex;
  align-items:center;
  gap: 10px;
  margin-top: 10px;
  flex-wrap: wrap;
}
.pc-metaText{
  color:#475569;
  font-weight: 800;
  font-size: 12px;
}
.pc-top__right{
  display:flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* Cards */
.pc-card{
  border-radius: 16px;
}

/* Controls */
.pc-controls{
  margin-bottom: 12px;
}
.pc-controls__grid{
  display:grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}
@media(max-width: 900px){
  .pc-controls__grid{ grid-template-columns: repeat(2, minmax(0,1fr)); }
}
@media(max-width: 520px){
  .pc-controls__grid{ grid-template-columns: 1fr; }
}

/* KPI */
.pc-kpis{
  display:grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 12px;
}
@media(max-width: 980px){
  .pc-kpis{ grid-template-columns: repeat(2, minmax(0,1fr)); }
}
@media(max-width: 520px){
  .pc-kpis{ grid-template-columns: 1fr; }
}

.pc-kpi__head{
  display:flex;
  justify-content: space-between;
  align-items:center;
  gap: 10px;
}
.pc-kpi__label{
  color:#64748b;
  font-weight: 900;
  font-size: 12px;
  letter-spacing: .08em;
  text-transform: uppercase;
}
.pc-kpi__value{
  margin-top: 6px;
  color:#0f172a;
  font-weight: 900;
  font-size: 20px;
  letter-spacing: -0.01em;
}
.pc-kpi__sub{
  margin-top: 8px;
  color:#475569;
  font-weight: 700;
  font-size: 12px;
}

/* Main Grid */
.pc-grid{
  display:grid;
  grid-template-columns: 1.1fr .9fr;
  gap: 12px;
  margin-bottom: 12px;
}
@media(max-width: 980px){
  .pc-grid{ grid-template-columns: 1fr; }
}

/* Card titles */
.pc-cardTitle{
  display:flex;
  justify-content: space-between;
  align-items:flex-start;
  gap: 10px;
  padding-bottom: 0;
}
.pc-cardTitle__title{
  font-weight: 900;
  color:#0f172a;
}
.pc-cardTitle__hint{
  margin-top: 2px;
  color:#64748b;
  font-weight: 700;
  font-size: 12px;
}

/* Body */
.pc-body{
  padding-top: 12px;
}

/* Panels inside system */
.pc-panels{
  display:grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
@media(max-width: 520px){
  .pc-panels{ grid-template-columns: 1fr; }
}
.pc-panel{
  border-radius: 14px;
}
.pc-panel--wide{
  grid-column: 1 / -1;
}
.pc-panel__t{
  font-weight: 900;
  color:#0f172a;
  margin-bottom: 8px;
}
.pc-row{
  display:flex;
  justify-content: space-between;
  align-items:center;
  gap: 10px;
  padding: 6px 0;
  color:#334155;
  font-weight: 800;
  font-size: 12px;
}

/* Sections (right) */
.pc-section{
  margin-bottom: 14px;
}
.pc-section__head{
  display:flex;
  justify-content: space-between;
  align-items:center;
  gap: 10px;
  margin-bottom: 8px;
}
.pc-section__title{
  font-weight: 900;
  color:#0f172a;
}
.pc-muted{
  color:#64748b;
  font-weight: 700;
  font-size: 12px;
}

/* Two columns form */
.pc-two{
  display:grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
@media(max-width: 520px){
  .pc-two{ grid-template-columns: 1fr; }
}

/* Alert */
.pc-alert{
  margin-top: 10px;
  border-radius: 14px;
}
.pc-alertRow{
  display:flex;
  justify-content: space-between;
  align-items:center;
  gap: 10px;
  padding: 6px 0;
  font-weight: 800;
  font-size: 12px;
  color:#334155;
}

/* Chips */
.pc-chips{
  display:flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}
.pc-chip{
  cursor: pointer;
}

/* Actions */
.pc-actions{
  display:flex;
  justify-content:flex-end;
  gap: 10px;
  margin-top: 8px;
  flex-wrap: wrap;
}

/* Tips */
.pc-tips{
  margin-top: 8px;
}
.pc-ul{
  margin: 0;
  padding-left: 18px;
  color:#334155;
  font-weight: 700;
  font-size: 13px;
}
.pc-ul li{
  margin: 6px 0;
}

/* Vuestic polish */
.pc-badge{
  font-weight: 900;
}
:deep(.va-input__container),
:deep(.va-select__container),
:deep(.va-textarea__container){
  border-radius: 12px;
}
:deep(.va-card){
  box-shadow: 0 10px 28px rgba(2,6,23,.06);
}
:deep(.va-button){
  border-radius: 12px;
  font-weight: 900;
}
</style>
