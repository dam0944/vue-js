<template>
  <div class="pm-page">
    <!-- Header -->
    <header class="pm-header">
      <div>
        <h1 class="pm-title">Settings · Payment Methods</h1>
        <p class="pm-subtitle">
          Manage how guests can pay (Cash, KHQR, Card, Bank transfer) and control fees & rules.
        </p>
      </div>

      <div class="pm-actions">
        <VaButton preset="secondary" icon="restart_alt" @click="resetFilters">
          Reset
        </VaButton>

        <VaButton color="primary" icon="add" @click="openCreate">
          Add Method
        </VaButton>
      </div>
    </header>

    <!-- Summary -->
    <section class="pm-summary" aria-label="Payment summary">
      <div class="pm-card">
        <div class="pm-card-label">Total</div>
        <div class="pm-card-value">{{ methods.length }}</div>
        <div class="pm-card-meta">Payment methods configured</div>
      </div>

      <div class="pm-card">
        <div class="pm-card-label">Active</div>
        <div class="pm-card-value">{{ activeCount }}</div>
        <div class="pm-card-meta">Visible to cashier / checkout</div>
      </div>

      <div class="pm-card">
        <div class="pm-card-label">Online / KHQR</div>
        <div class="pm-card-value">{{ onlineCount }}</div>
        <div class="pm-card-meta">Scan / wallet payments</div>
      </div>

      <div class="pm-card">
        <div class="pm-card-label">With Fees</div>
        <div class="pm-card-value">{{ feeCount }}</div>
        <div class="pm-card-meta">Card or provider fee enabled</div>
      </div>
    </section>

    <!-- Filters -->
    <section class="pm-filters" aria-label="Filters">
      <VaInput
        v-model="q"
        class="pm-search"
        placeholder="Search method… (Cash, ABA, Card)"
        clearable
      >
        <template #prependInner>
          <VaIcon name="search" color="secondary" />
        </template>
      </VaInput>

      <VaSelect
        v-model="typeFilter"
        :options="typeOptions"
        text-by="label"
        value-by="value"
        label="Type"
        class="pm-select"
      />

      <VaSelect
        v-model="statusFilter"
        :options="statusOptions"
        text-by="label"
        value-by="value"
        label="Status"
        class="pm-select"
      />

      <VaSelect
        v-model="currencyFilter"
        :options="currencyOptions"
        text-by="label"
        value-by="value"
        label="Currency"
        class="pm-select"
      />
    </section>

    <!-- Content -->
    <section class="pm-content">
      <!-- Left: List -->
      <div class="pm-list">
        <VaCard
          v-for="m in filtered"
          :key="m.id"
          class="pm-item"
          :class="{ 'pm-item--inactive': !m.is_active, 'pm-item--selected': selectedId === m.id }"
          @click="select(m.id)"
        >
          <div class="pm-item-left">
            <div class="pm-icon">
              <VaIcon :name="m.icon" size="22px" />
            </div>

            <div class="pm-item-main">
              <div class="pm-item-top">
                <div class="pm-name">{{ m.name }}</div>

                <div class="pm-badges">
                  <span class="pm-badge" :class="m.is_active ? 'b-active' : 'b-inactive'">
                    {{ m.is_active ? "Active" : "Inactive" }}
                  </span>
                  <span class="pm-badge b-type">{{ labelType(m.type) }}</span>
                </div>
              </div>

              <div class="pm-desc">{{ m.description }}</div>

              <div class="pm-meta">
                <span class="pm-pill">Code: {{ m.code }}</span>
                <span class="pm-pill">Currency: {{ m.currency.join(", ") }}</span>
                <span class="pm-pill" v-if="m.auto_confirm">Auto-confirm</span>
                <span class="pm-pill" v-if="m.require_reference">Ref required</span>
                <span class="pm-pill" v-if="hasFee(m)">Fee: {{ feeLabel(m) }}</span>
              </div>
            </div>
          </div>

          <div class="pm-item-right">
            <VaSwitch
              :model-value="m.is_active"
              @update:model-value="(val) => toggleActive(m.id, val)"
              aria-label="Toggle active"
            />
          </div>
        </VaCard>

        <div v-if="filtered.length === 0" class="pm-empty">
          <VaIcon name="payments" size="36px" color="secondary" />
          <div class="pm-empty-title">No payment methods found</div>
          <div class="pm-empty-sub">Try clearing filters or add a new method.</div>
          <VaButton color="primary" icon="add" @click="openCreate">Add Method</VaButton>
        </div>
      </div>

      <!-- Right: Details -->
      <aside class="pm-detail" aria-label="Selected method details">
        <VaCard class="pm-detail-card" v-if="selected">
          <div class="pm-detail-head">
            <div class="pm-detail-title">
              <div class="pm-detail-icon">
                <VaIcon :name="selected.icon" size="22px" />
              </div>
              <div>
                <div class="pm-detail-name">{{ selected.name }}</div>
                <div class="pm-detail-sub">{{ selected.description }}</div>
              </div>
            </div>

            <div class="pm-detail-actions">
              <VaButton preset="secondary" icon="edit" @click="openEdit(selected)">
                Edit
              </VaButton>
              <VaButton preset="secondary" color="danger" icon="delete" @click="remove(selected.id)">
                Remove
              </VaButton>
            </div>
          </div>

          <div class="pm-detail-grid">
            <div class="pm-kv">
              <div class="k">Status</div>
              <div class="v">
                <span class="pm-badge" :class="selected.is_active ? 'b-active' : 'b-inactive'">
                  {{ selected.is_active ? "Active" : "Inactive" }}
                </span>
              </div>
            </div>

            <div class="pm-kv">
              <div class="k">Type</div>
              <div class="v">{{ labelType(selected.type) }}</div>
            </div>

            <div class="pm-kv">
              <div class="k">Currencies</div>
              <div class="v">{{ selected.currency.join(", ") }}</div>
            </div>

            <div class="pm-kv">
              <div class="k">Auto-confirm</div>
              <div class="v">{{ selected.auto_confirm ? "Yes" : "No" }}</div>
            </div>

            <div class="pm-kv">
              <div class="k">Reference required</div>
              <div class="v">{{ selected.require_reference ? "Yes" : "No" }}</div>
            </div>

            <div class="pm-kv">
              <div class="k">Fee</div>
              <div class="v">{{ hasFee(selected) ? feeLabel(selected) : "None" }}</div>
            </div>
          </div>

          <div class="pm-detail-note">
            Tip: Enable “Reference required” for KHQR / Bank transfer so staff can record txn id.
          </div>
        </VaCard>

        <VaCard class="pm-detail-card pm-detail-empty" v-else>
          <div class="pm-empty-title">Select a payment method</div>
          <div class="pm-empty-sub">Click a card on the left to view details.</div>
        </VaCard>
      </aside>
    </section>

    <!-- Create/Edit Modal -->
    <VaModal
      v-model="modalOpen"
      hide-default-actions
      size="large"
      max-width="760px"
    >
      <template #header>
        <div class="pm-modal-title">
          <VaIcon :name="form.id ? 'edit' : 'add'" />
          <span>{{ form.id ? "Edit Payment Method" : "Add Payment Method" }}</span>
        </div>
      </template>

      <div class="pm-modal-body">
        <div class="pm-form-grid">
          <VaInput v-model="form.name" label="Name" placeholder="e.g. ABA Pay / KHQR" />
          <VaInput v-model="form.code" label="Code" placeholder="e.g. ABA" />

          <VaSelect
            v-model="form.type"
            :options="typeOptions"
            text-by="label"
            value-by="value"
            label="Type"
          />

          <VaSelect
            v-model="form.icon"
            :options="iconOptions"
            label="Icon"
          />

          <VaTextarea
            v-model="form.description"
            label="Description"
            placeholder="Short help text for staff"
            autosize
          />

          <div class="pm-form-row">
            <div class="pm-label">Currencies</div>
            <div class="pm-chips">
              <VaChip
                v-for="c in allCurrencies"
                :key="c"
                :model-value="form.currency.includes(c)"
                @update:model-value="(v) => toggleCurrency(c, v)"
                outline
              >
                {{ c }}
              </VaChip>
            </div>
          </div>

          <div class="pm-form-row pm-form-split">
            <VaInput
              v-model.number="form.fee_percent"
              label="Fee %"
              type="number"
              min="0"
              step="0.1"
              placeholder="0"
            />
            <VaInput
              v-model.number="form.fee_fixed"
              label="Fee fixed"
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
            />
          </div>

          <div class="pm-form-row pm-form-switches">
            <VaSwitch v-model="form.is_active" label="Active" />
            <VaSwitch v-model="form.auto_confirm" label="Auto-confirm" />
            <VaSwitch v-model="form.require_reference" label="Reference required" />
          </div>
        </div>

        <div class="pm-modal-footer">
          <VaButton preset="secondary" @click="closeModal">Cancel</VaButton>
          <VaButton color="primary" @click="save">
            {{ form.id ? "Save Changes" : "Create Method" }}
          </VaButton>
        </div>
      </div>
    </VaModal>
  </div>
</template>
<script setup>
import { computed, ref } from "vue";
import { payment_method as paymentMethodData } from "@/data/setting/payment_method"; 
// If your file exports a different name, change it:
// e.g. import { paymentMethods as paymentMethodData } from "@/data/setting/payment_method";

/** ---------- Data ---------- */
// IMPORTANT: methods must exist
const methods = ref(Array.isArray(paymentMethodData) ? paymentMethodData : []);

/** ---------- Filters ---------- */
const q = ref("");
const typeFilter = ref("all");
const statusFilter = ref("all");
const currencyFilter = ref("all");

const typeOptions = [
  { label: "All", value: "all" },
  { label: "Offline", value: "offline" },
  { label: "Online / KHQR", value: "online" },
  { label: "Terminal", value: "terminal" },
  { label: "Manual", value: "manual" },
];

const statusOptions = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

const currencyOptions = [
  { label: "All", value: "all" },
  { label: "USD", value: "USD" },
  { label: "KHR", value: "KHR" },
];

const filtered = computed(() => {
  const text = q.value.trim().toLowerCase();

  return methods.value.filter((m) => {
    // protect against missing fields
    const name = (m.name || "").toLowerCase();
    const code = (m.code || "").toLowerCase();
    const desc = (m.description || "").toLowerCase();
    const currency = Array.isArray(m.currency) ? m.currency : [];

    const matchesText = !text || name.includes(text) || code.includes(text) || desc.includes(text);
    const matchesType = typeFilter.value === "all" || m.type === typeFilter.value;

    const matchesStatus =
      statusFilter.value === "all" ||
      (statusFilter.value === "active" ? !!m.is_active : !m.is_active);

    const matchesCurrency =
      currencyFilter.value === "all" || currency.includes(currencyFilter.value);

    return matchesText && matchesType && matchesStatus && matchesCurrency;
  });
});

function resetFilters() {
  q.value = "";
  typeFilter.value = "all";
  statusFilter.value = "all";
  currencyFilter.value = "all";
}

/** ---------- Helpers ---------- */
function labelType(type) {
  const found = typeOptions.find((x) => x.value === type);
  return found ? found.label : (type || "-");
}
function hasFee(m) {
  return (Number(m?.fee_percent) || 0) > 0 || (Number(m?.fee_fixed) || 0) > 0;
}
function feeLabel(m) {
  const p = Number(m?.fee_percent) || 0;
  const f = Number(m?.fee_fixed) || 0;
  if (p && f) return `${p}% + ${f}`;
  if (p) return `${p}%`;
  if (f) return `${f}`;
  return "0";
}

/** ---------- Summary ---------- */
const totalCount = computed(() => methods.value.length);
const activeCount = computed(() => methods.value.filter((m) => !!m.is_active).length);
const onlineCount = computed(() => methods.value.filter((m) => m.type === "online").length);
const feeCount = computed(() => methods.value.filter((m) => hasFee(m)).length);

/** ---------- Selection ---------- */
const selectedId = ref(null);
const selected = computed(() => methods.value.find((m) => m.id === selectedId.value) || null);

function select(id) {
  selectedId.value = id;
}

function toggleActive(id, val) {
  const idx = methods.value.findIndex((m) => m.id === id);
  if (idx >= 0) methods.value[idx].is_active = !!val;
}

/** ---------- Modal (Create/Edit) ---------- */
const modalOpen = ref(false);
const allCurrencies = ["USD", "KHR"];

const iconOptions = [
  "payments",
  "qr_code",
  "qr_code_2",
  "credit_card",
  "account_balance",
  "account_balance_wallet",
  "receipt_long",
];

const emptyForm = () => ({
  id: null,
  code: "",
  name: "",
  icon: "payments",
  description: "",
  type: "offline",
  currency: ["USD", "KHR"],
  fee_percent: 0,
  fee_fixed: 0,
  auto_confirm: true,
  require_reference: false,
  is_active: true,
});

const form = ref(emptyForm());

function openCreate() {
  form.value = emptyForm();
  modalOpen.value = true;
}

function openEdit(m) {
  form.value = JSON.parse(JSON.stringify(m));
  modalOpen.value = true;
}

function closeModal() {
  modalOpen.value = false;
}

function toggleCurrency(c, val) {
  const arr = Array.isArray(form.value.currency) ? form.value.currency : [];
  const has = arr.includes(c);

  if (val && !has) arr.push(c);
  if (!val && has) form.value.currency = arr.filter((x) => x !== c);

  if (!form.value.currency || form.value.currency.length === 0) {
    form.value.currency = ["USD"];
  }
}

function save() {
  if (!form.value.name.trim()) return;
  if (!form.value.code.trim()) return;

  form.value.code = form.value.code.trim().toUpperCase();

  if (form.value.id) {
    const idx = methods.value.findIndex((m) => m.id === form.value.id);
    if (idx >= 0) methods.value[idx] = JSON.parse(JSON.stringify(form.value));
    selectedId.value = form.value.id;
  } else {
    const nextId = Math.max(0, ...methods.value.map((m) => Number(m.id) || 0)) + 1;
    const newItem = { ...form.value, id: nextId };
    methods.value.unshift(newItem);
    selectedId.value = nextId;
  }

  modalOpen.value = false;
}

function remove(id) {
  methods.value = methods.value.filter((m) => m.id !== id);
  if (selectedId.value === id) selectedId.value = null;
}
</script>

<style scoped>
.pm-page {
  min-height: calc(100vh - 60px);
  background: #f8fafc;
  padding: 18px 18px 28px;
  color: #0f172a;
  font-family: Inter, system-ui, sans-serif;
}

/* Header */
.pm-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  margin-bottom: 14px;
}
.pm-title {
  margin: 0;
  font-size: 22px;
  font-weight: 900;
}
.pm-subtitle {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 13px;
  line-height: 1.5;
  max-width: 720px;
}
.pm-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

/* Summary */
.pm-summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}
.pm-card {
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 14px;
  padding: 14px 14px 12px;
  box-shadow: 0 1px 2px rgba(2, 6, 23, 0.04);
}
.pm-card-label {
  font-size: 12px;
  font-weight: 800;
  color: #64748b;
}
.pm-card-value {
  margin-top: 6px;
  font-size: 26px;
  font-weight: 900;
}
.pm-card-meta {
  margin-top: 4px;
  font-size: 12px;
  color: #94a3b8;
}

/* Filters */
.pm-filters {
  display: grid;
  grid-template-columns: 1.4fr 220px 220px 180px;
  gap: 10px;
  margin-bottom: 14px;
  align-items: end;
}
.pm-search {
  background: #fff;
  border-radius: 14px;
}
.pm-select {
  background: #fff;
  border-radius: 14px;
}

/* Content layout */
.pm-content {
  display: grid;
  grid-template-columns: 1.35fr 0.9fr;
  gap: 12px;
  align-items: start;
}

/* List cards */
.pm-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pm-item {
  border-radius: 16px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 1px 2px rgba(2, 6, 23, 0.04);
  padding: 14px;
  cursor: pointer;
  transition: transform 140ms ease, box-shadow 140ms ease, border-color 140ms ease;
}
.pm-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 26px rgba(2, 6, 23, 0.08);
  border-color: rgba(14, 165, 233, 0.35);
}
.pm-item--inactive {
  opacity: 0.72;
}
.pm-item--selected {
  border-color: rgba(14, 165, 233, 0.55);
  box-shadow: 0 10px 26px rgba(14, 165, 233, 0.08);
}

.pm-item-left {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}
.pm-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: rgba(14, 165, 233, 0.10);
  border: 1px solid rgba(14, 165, 233, 0.18);
  color: #0284c7;
  flex: 0 0 auto;
}
.pm-item-main {
  flex: 1;
  min-width: 0;
}
.pm-item-top {
  display: flex;
  gap: 10px;
  justify-content: space-between;
  align-items: center;
}
.pm-name {
  font-weight: 900;
  font-size: 15px;
}
.pm-badges {
  display: inline-flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: flex-end;
}
.pm-badge {
  font-size: 11px;
  font-weight: 800;
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid rgba(15, 23, 42, 0.10);
  background: rgba(15, 23, 42, 0.03);
}
.b-active {
  border-color: rgba(16, 185, 129, 0.25);
  background: rgba(16, 185, 129, 0.10);
  color: #047857;
}
.b-inactive {
  border-color: rgba(148, 163, 184, 0.35);
  background: rgba(148, 163, 184, 0.12);
  color: #475569;
}
.b-type {
  border-color: rgba(14, 165, 233, 0.22);
  background: rgba(14, 165, 233, 0.10);
  color: #0369a1;
}

.pm-desc {
  margin-top: 6px;
  color: #64748b;
  font-size: 13px;
  line-height: 1.45;
}

.pm-meta {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.pm-pill {
  font-size: 11px;
  color: #475569;
  background: rgba(2, 6, 23, 0.04);
  border: 1px solid rgba(15, 23, 42, 0.08);
  padding: 4px 8px;
  border-radius: 999px;
}

.pm-item-right {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
}

/* Detail */
.pm-detail {
  position: sticky;
  top: 14px;
}
.pm-detail-card {
  border-radius: 16px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 10px 28px rgba(2, 6, 23, 0.06);
  padding: 14px;
}
.pm-detail-empty {
  padding: 18px;
  text-align: center;
}
.pm-detail-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}
.pm-detail-title {
  display: flex;
  gap: 10px;
  align-items: center;
}
.pm-detail-icon {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: rgba(14, 165, 233, 0.10);
  border: 1px solid rgba(14, 165, 233, 0.18);
  color: #0284c7;
}
.pm-detail-name {
  font-weight: 900;
  font-size: 16px;
}
.pm-detail-sub {
  margin-top: 2px;
  color: #64748b;
  font-size: 12px;
}
.pm-detail-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.pm-detail-grid {
  margin-top: 12px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.pm-kv .k {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 800;
}
.pm-kv .v {
  margin-top: 4px;
  font-weight: 800;
  color: #0f172a;
  font-size: 13px;
}
.pm-detail-note {
  margin-top: 12px;
  font-size: 12px;
  color: #64748b;
  background: rgba(2, 6, 23, 0.03);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 14px;
  padding: 10px 12px;
}

/* Modal */
.pm-modal-title {
  display: flex;
  gap: 10px;
  align-items: center;
  font-weight: 900;
}
.pm-modal-body {
  padding: 6px 2px 2px;
}
.pm-form-grid {
  display: grid;
  gap: 12px;
}
.pm-form-row {
  display: grid;
  gap: 8px;
}
.pm-form-split {
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.pm-form-switches {
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
  align-items: center;
}
.pm-label {
  font-weight: 900;
  font-size: 12px;
  color: #64748b;
}
.pm-chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.pm-modal-footer {
  margin-top: 14px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* Empty */
.pm-empty {
  border: 1px dashed rgba(15, 23, 42, 0.18);
  background: rgba(255, 255, 255, 0.65);
  border-radius: 16px;
  padding: 22px;
  text-align: center;
  display: grid;
  gap: 8px;
}
.pm-empty-title {
  font-weight: 900;
  font-size: 14px;
}
.pm-empty-sub {
  font-size: 12px;
  color: #64748b;
}

/* Responsive */
@media (max-width: 1100px) {
  .pm-summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .pm-filters {
    grid-template-columns: 1fr 1fr;
  }
  .pm-content {
    grid-template-columns: 1fr;
  }
  .pm-detail {
    position: static;
  }
}
</style>
