<!-- src/pages/pos/ReceiptDetails.vue -->
<template>
  <div class="rd-page">
    <VaLayout class="rd-layout" :top="{ fixed: true }">
      <!-- TOP BAR -->
      <template #top>
        <VaNavbar class="rd-navbar" color="backgroundPrimary">
          <template #left>
            <div class="rd-left">
              <VaButton preset="secondary" icon="arrow_back" class="rd-iconBtn" @click="back" />
              <div class="rd-titleWrap">
                <div class="rd-title">Receipt Details</div>
                <div class="rd-sub">
                  POS:
                  <span class="rd-mono">{{ row?.pos_number || "-" }}</span>
                  <span class="rd-dot">•</span>
                  Invoice:
                  <span class="rd-mono">{{ row?.invoice?.invoice_number || "-" }}</span>
                </div>
              </div>
            </div>
          </template>

          <template #right>
            <div class="rd-actions">
              <VaButton
                preset="secondary"
                icon="print"
                :disabled="!row"
                @click="printReceipt"
              >
                Print
              </VaButton>
            </div>
          </template>
        </VaNavbar>
      </template>

      <!-- CONTENT -->
      <template #content>
        <div class="rd-content">
          <!-- Not found -->
          <VaCard v-if="!row" class="rd-card" outlined>
            <VaCardContent class="rd-empty">
              <VaIcon name="info" size="28px" color="secondary" />
              <div>
                <div class="rd-emptyTitle">Receipt not found</div>
                <div class="rd-emptySub">Please go back and select another receipt.</div>
              </div>
            </VaCardContent>
          </VaCard>

          <!-- Found -->
          <div v-else class="rd-grid">
            <!-- LEFT -->
            <div class="rd-leftCol">
              <!-- Guest -->
              <VaCard class="rd-card" outlined>
                <VaCardTitle class="rd-cardTitle">
                  <div class="rd-cardTitleLeft">
                    <VaIcon name="person" color="secondary" />
                    <span>Guest</span>
                  </div>
                </VaCardTitle>

                <VaCardContent>
                  <div class="rd-kvGrid">
                    <div class="rd-kv">
                      <div class="rd-k">Name</div>
                      <div class="rd-v">{{ row.guest?.name || "-" }}</div>
                    </div>
                    <div class="rd-kv">
                      <div class="rd-k">Phone</div>
                      <div class="rd-v rd-mono">{{ row.guest?.phone || "-" }}</div>
                    </div>
                    <div class="rd-kv">
                      <div class="rd-k">Booking #</div>
                      <div class="rd-v rd-mono">{{ row.booking?.booking_number || "-" }}</div>
                    </div>
                    <div class="rd-kv">
                      <div class="rd-k">Cashier</div>
                      <div class="rd-v">{{ row.cashier || "-" }}</div>
                    </div>
                  </div>
                </VaCardContent>
              </VaCard>

              <!-- Rooms -->
              <VaCard class="rd-card" outlined>
                <VaCardTitle class="rd-cardTitle">
                  <div class="rd-cardTitleLeft">
                    <VaIcon name="bed" color="secondary" />
                    <span>Rooms</span>
                  </div>

                  <div class="rd-metaRight">
                    Open {{ formatTime(row.opened_at) }} · Close {{ formatTime(row.closed_at) }}
                  </div>
                </VaCardTitle>

                <VaCardContent>
                  <div class="rd-roomList">
                    <VaCard
                      v-for="(x, idx) in row.rooms"
                      :key="idx"
                      class="rd-roomItem"
                      outlined
                    >
                      <VaCardContent class="rd-roomInner">
                        <div class="rd-roomMain">
                          <div class="rd-roomTitle">
                            Room <span class="rd-strong">{{ x.room_number }}</span>
                            <span class="rd-dot">•</span>
                            {{ x.room_type }}
                            <span class="rd-dot">•</span>
                            {{ x.beds }} bed
                          </div>

                          <div class="rd-roomSub">
                            <VaBadge
                              :text="x.booking_type === 'hourly' ? 'Hourly' : 'Nightly'"
                              color="secondary"
                              class="rd-badge"
                            />
                            <span>
                              {{ x.booking_type === "hourly" ? x.quantity + " hours" : x.quantity + " nights" }}
                              · Unit {{ money(x.unit_price) }}
                            </span>
                          </div>
                        </div>

                        <div class="rd-roomTotal">
                          {{ money(x.total) }}
                        </div>
                      </VaCardContent>
                    </VaCard>
                  </div>
                </VaCardContent>
              </VaCard>
            </div>

            <!-- RIGHT -->
            <div class="rd-rightCol">
              <!-- Summary -->
              <VaCard class="rd-card" outlined>
                <VaCardTitle class="rd-cardTitle">
                  <div class="rd-cardTitleLeft">
                    <VaIcon name="payments" color="secondary" />
                    <span>Summary</span>
                  </div>
                </VaCardTitle>

                <VaCardContent>
                  <div class="rd-summary">
                    <div class="rd-line">
                      <span class="rd-muted">Subtotal</span>
                      <span class="rd-mono rd-strong">{{ money(row.invoice?.subtotal) }}</span>
                    </div>

                    <div v-if="row.invoice?.discount" class="rd-line">
                      <span class="rd-muted">Discount</span>
                      <span class="rd-mono rd-strong">- {{ money(row.invoice?.discount) }}</span>
                    </div>

                    <div v-if="row.invoice?.tax" class="rd-line">
                      <span class="rd-muted">Tax</span>
                      <span class="rd-mono rd-strong">{{ money(row.invoice?.tax) }}</span>
                    </div>

                    <div class="rd-total">
                      <span class="rd-strong">Total</span>
                      <span class="rd-mono rd-totalValue">{{ money(row.invoice?.total) }}</span>
                    </div>
                  </div>

                  <VaDivider class="rd-divider" />

                  <!-- Payment Card -->
                  <VaCard class="rd-payCard" outlined>
                    <VaCardContent class="rd-payInner">
                      <div class="rd-payLeft">
                        <div class="rd-k">Payment Method</div>
                        <div class="rd-v">{{ row.payment?.method || "-" }}</div>

                        <div class="rd-k rd-mt">Reference</div>
                        <div class="rd-v rd-mono">{{ row.payment?.reference || "-" }}</div>
                      </div>

                      <div class="rd-payRight">
                        <div class="rd-k">Status</div>
                        <VaBadge
                          :text="prettyStatus(row.payment?.status)"
                          :color="statusColor(row.payment?.status)"
                          :icon="statusIcon(row.payment?.status)"
                          class="rd-status"
                        />
                      </div>
                    </VaCardContent>
                  </VaCard>
                </VaCardContent>
              </VaCard>

              <!-- Meta -->
              <VaCard class="rd-card" outlined>
                <VaCardTitle class="rd-cardTitle">
                  <div class="rd-cardTitleLeft">
                    <VaIcon name="info" color="secondary" />
                    <span>Meta</span>
                  </div>
                </VaCardTitle>

                <VaCardContent>
                  <div class="rd-kvGrid">
                    <div class="rd-kv">
                      <div class="rd-k">Date</div>
                      <div class="rd-v">{{ formatDate(row.opened_at) }}</div>
                    </div>
                    <div class="rd-kv">
                      <div class="rd-k">POS #</div>
                      <div class="rd-v rd-mono">{{ row.pos_number }}</div>
                    </div>
                    <div class="rd-kv">
                      <div class="rd-k">Invoice #</div>
                      <div class="rd-v rd-mono">{{ row.invoice?.invoice_number }}</div>
                    </div>
                    <div class="rd-kv">
                      <div class="rd-k">Booking #</div>
                      <div class="rd-v rd-mono">{{ row.booking?.booking_number }}</div>
                    </div>
                  </div>
                </VaCardContent>
              </VaCard>

              <!-- Quick Actions (optional) -->
              <VaCard class="rd-card rd-actionsCard" outlined>
                <VaCardContent class="rd-actionsInner">
                  <VaButton preset="secondary" icon="content_copy" @click="copyInvoice">
                    Copy Invoice #
                  </VaButton>
                  <VaButton preset="secondary" icon="content_copy" @click="copyPos">
                    Copy POS #
                  </VaButton>
                </VaCardContent>
              </VaCard>
            </div>
          </div>
        </div>
      </template>
    </VaLayout>
  </div>
</template>

<script setup>
import { computed } from "vue"
import { useRoute, useRouter } from "vue-router"
import { posHistory } from "@/data/posHistory"

const route = useRoute()
const router = useRouter()

const id = computed(() => String(route.params.id || ""))

const row = computed(() => {
  const target = id.value
  return posHistory.find((x) => String(x.pos_id) === target) || null
})

function back() {
  router.back()
}

function money(n) {
  const num = Number(n || 0)
  return `$${num.toFixed(2)}`
}

function formatDate(dt) {
  const s = String(dt || "")
  return s ? s.slice(0, 10) : "-"
}

function formatTime(dt) {
  const s = String(dt || "")
  return s && s.length >= 16 ? s.slice(11, 16) : "-"
}

function prettyStatus(s) {
  const map = {
    completed: "Completed",
    pending: "Pending",
    failed: "Failed",
    refunded: "Refunded",
    cancelled: "Cancelled",
  }
  return map[s] || String(s || "").toUpperCase()
}

function statusColor(status) {
  const map = {
    completed: "success",
    pending: "warning",
    failed: "danger",
    cancelled: "danger",
    refunded: "info",
  }
  return map[status] || "secondary"
}

function statusIcon(status) {
  const map = {
    completed: "check_circle",
    pending: "schedule",
    failed: "error",
    cancelled: "cancel",
    refunded: "restart_alt",
  }
  return map[status] || "info"
}

function printReceipt() {
  alert(`Print: ${row.value?.pos_number || ""}`)
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(String(text || ""))
  } catch {
    // fallback
    const ta = document.createElement("textarea")
    ta.value = String(text || "")
    document.body.appendChild(ta)
    ta.select()
    document.execCommand("copy")
    document.body.removeChild(ta)
  }
}

function copyInvoice() {
  copyText(row.value?.invoice?.invoice_number || "")
}

function copyPos() {
  copyText(row.value?.pos_number || "")
}
</script>

<style scoped>
/* Page */
.rd-page{
  min-height: 100vh;
  background: var(--va-background);
}

/* Layout padding (account for navbar) */
.rd-content{
  padding: 16px;
  max-width: 1100px;
  margin: 0 auto;
}

/* Navbar */
.rd-navbar{
  border-bottom: 1px solid rgba(15,23,42,.10);
}
.rd-left{
  display:flex;
  align-items:center;
  gap: 10px;
}
.rd-iconBtn{
  border-radius: 12px !important;
}
.rd-titleWrap{
  display:flex;
  flex-direction: column;
  gap: 2px;
}
.rd-title{
  font-weight: 900;
  font-size: 16px;
  color: #0f172a;
}
.rd-sub{
  font-weight: 700;
  font-size: 12px;
  color: #64748b;
}
.rd-actions :deep(.va-button){
  border-radius: 12px;
  font-weight: 900;
}

/* Cards */
.rd-card{
  border-radius: 16px;
}
.rd-cardTitle{
  padding-bottom: 0;
}
.rd-cardTitleLeft{
  display:flex;
  align-items:center;
  gap: 8px;
  font-weight: 900;
  color:#0f172a;
}
.rd-divider{
  margin: 14px 0;
}

/* Empty */
.rd-empty{
  display:flex;
  gap: 12px;
  align-items:flex-start;
}
.rd-emptyTitle{
  font-weight: 900;
  color:#0f172a;
}
.rd-emptySub{
  margin-top: 2px;
  font-weight: 700;
  font-size: 12px;
  color:#64748b;
}

/* Grid */
.rd-grid{
  display:grid;
  grid-template-columns: 1.35fr .85fr;
  gap: 12px;
}
@media (max-width: 980px){
  .rd-grid{ grid-template-columns: 1fr; }
}

/* Key/Value */
.rd-kvGrid{
  display:grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
@media (max-width: 520px){
  .rd-kvGrid{ grid-template-columns: 1fr; }
}
.rd-kv .rd-k{
  font-size: 11px;
  font-weight: 800;
  color:#64748b;
  letter-spacing: .08em;
  text-transform: uppercase;
}
.rd-kv .rd-v{
  margin-top: 4px;
  font-size: 13px;
  font-weight: 900;
  color:#0f172a;
}

/* Rooms */
.rd-metaRight{
  font-size: 12px;
  font-weight: 700;
  color:#64748b;
}
.rd-roomList{
  display:flex;
  flex-direction: column;
  gap: 10px;
}
.rd-roomItem{
  border-radius: 14px;
  background: rgba(2,6,23,.02);
}
.rd-roomInner{
  display:flex;
  justify-content: space-between;
  gap: 12px;
  align-items:flex-start;
}
.rd-roomTitle{
  font-weight: 900;
  color:#0f172a;
  font-size: 13px;
}
.rd-roomSub{
  margin-top: 6px;
  display:flex;
  gap: 8px;
  align-items:center;
  color:#64748b;
  font-weight: 700;
  font-size: 12px;
}
.rd-roomTotal{
  font-weight: 900;
  color:#0f172a;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 13px;
}

/* Summary */
.rd-summary{
  display:flex;
  flex-direction: column;
  gap: 8px;
}
.rd-line{
  display:flex;
  justify-content: space-between;
  align-items:center;
  gap: 10px;
  font-size: 13px;
}
.rd-total{
  display:flex;
  justify-content: space-between;
  align-items:center;
  gap: 10px;
  padding-top: 10px;
  margin-top: 4px;
  border-top: 1px solid rgba(15,23,42,.10);
}
.rd-totalValue{
  font-size: 16px;
  font-weight: 900;
}

/* Payment */
.rd-payCard{
  border-radius: 14px;
  background: rgba(2,6,23,.02);
}
.rd-payInner{
  display:flex;
  justify-content: space-between;
  gap: 12px;
}
.rd-payLeft .rd-k,
.rd-payRight .rd-k{
  font-size: 11px;
  font-weight: 800;
  color:#64748b;
  letter-spacing: .08em;
  text-transform: uppercase;
}
.rd-payLeft .rd-v{
  margin-top: 4px;
  font-weight: 900;
  color:#0f172a;
}
.rd-mt{ margin-top: 10px; }
.rd-status{
  margin-top: 6px;
  font-weight: 900;
}

/* Small utils */
.rd-muted{ color:#64748b; font-weight: 800; }
.rd-strong{ font-weight: 900; color:#0f172a; }
.rd-mono{
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}
.rd-dot{
  margin: 0 6px;
  opacity: .7;
}

/* Actions card */
.rd-actionsCard{
  background: rgba(2,6,23,.02);
}
.rd-actionsInner{
  display:flex;
  gap: 10px;
  flex-wrap: wrap;
}
</style>
