<script setup>
import { reactive, computed } from "vue"

/**
 * This page matches your DB table: property_settings
 * It is UI-first (static demo). Later you can call API to load/save.
 */

const form = reactive({
  property_name: "Palm Guesthouse",
  address: "Street 2004, Sangkat Teuk Thla",
  city: "Phnom Penh",
  state: "",
  country: "Cambodia",
  postal_code: "12000",
  phone: "012 345 678",
  email: "info@palmguesthouse.com",
  website: "https://palmguesthouse.com",

  tax_rate: 10.0,
  tax_name: "VAT",
  currency_code: "USD",
  currency_symbol: "$",
  timezone: "Asia/Phnom_Penh",
  date_format: "YYYY-MM-DD",
  time_format: "24h",
  check_in_time: "14:00:00",
  check_out_time: "11:00:00",

  cancellation_policy:
    "Free cancellation up to 24 hours before check-in. Late cancellation may be charged 1 night.",
  terms_and_conditions:
    "Guests are responsible for damages. No smoking inside rooms. Quiet hours after 10PM.",
  logo_url:
    "https://dummyimage.com/240x80/0f172a/ffffff&text=PALM+GUESTHOUSE",
})

const canSave = computed(() => String(form.property_name).trim() && String(form.phone).trim())

function save() {
  if (!canSave.value) return alert("Property Name and Phone are required.")
  // TODO: call API
  console.log("save property_settings", JSON.parse(JSON.stringify(form)))
  alert("Saved (demo). Check console.")
}

function reset() {
  // simple reset for demo (clear only)
  form.address = ""
  form.city = ""
  form.state = ""
  form.country = "Cambodia"
  form.postal_code = ""
  form.phone = ""
  form.email = ""
  form.website = ""
  form.tax_rate = 0
  form.tax_name = "Tax"
  form.currency_code = "USD"
  form.currency_symbol = "$"
  form.timezone = "Asia/Phnom_Penh"
  form.date_format = "YYYY-MM-DD"
  form.time_format = "24h"
  form.check_in_time = "14:00:00"
  form.check_out_time = "11:00:00"
  form.cancellation_policy = ""
  form.terms_and_conditions = ""
  form.logo_url = ""
}

function uploadLogo(e) {
  const file = e.target.files?.[0]
  if (!file) return
  if (!file.type.startsWith("image/")) {
    e.target.value = ""
    return alert("File type is incorrect. Please choose an image.")
  }
  const url = URL.createObjectURL(file)
  form.logo_url = url
}
</script>

<template>
  <div class="page">
    <!-- Header -->
    <div class="head">
      <div>
        <h1>General Settings</h1>
        <p>Property profile • tax • currency • timezone • check-in/out time</p>
      </div>

      <div class="headBtns">
        <VaButton preset="secondary" icon="refresh" @click="reset">Reset</VaButton>
        <VaButton color="success" icon="save" :disabled="!canSave" @click="save">
          Save Changes
        </VaButton>
      </div>
    </div>

    <!-- Top quick cards -->
    <div class="topGrid">
      <VaCard class="topCard">
        <div class="topK">Property</div>
        <div class="topV">{{ form.property_name || "-" }}</div>
        <div class="topSub">{{ form.city || "-" }}, {{ form.country || "-" }}</div>
      </VaCard>

      <VaCard class="topCard blue">
        <div class="topK">Currency</div>
        <div class="topV">{{ form.currency_code }} ({{ form.currency_symbol }})</div>
        <div class="topSub">Tax: {{ form.tax_name }} {{ Number(form.tax_rate || 0).toFixed(2) }}%</div>
      </VaCard>

      <VaCard class="topCard ok">
        <div class="topK">Check-in / out</div>
        <div class="topV">{{ form.check_in_time }} → {{ form.check_out_time }}</div>
        <div class="topSub">{{ form.timezone }}</div>
      </VaCard>
    </div>

    <div class="grid">
      <!-- LEFT: main settings -->
      <VaCard class="card">
        <div class="cardHead">
          <div class="title">Property Information</div>
          <div class="hint">Fields with * are required</div>
        </div>

        <div class="formGrid">
          <VaInput v-model="form.property_name" class="wide" label="Property Name *" placeholder="Guesthouse name" />

          <VaInput v-model="form.address" class="wide" label="Address" placeholder="Street, Building, etc." />

          <VaInput v-model="form.city" label="City" placeholder="Phnom Penh" />
          <VaInput v-model="form.state" label="State / Province" placeholder="Optional" />

          <VaInput v-model="form.country" label="Country" placeholder="Cambodia" />
          <VaInput v-model="form.postal_code" label="Postal Code" placeholder="12000" />

          <VaInput v-model="form.phone" label="Phone *" placeholder="012 345 678" />
          <VaInput v-model="form.email" label="Email" placeholder="info@example.com" />

          <VaInput v-model="form.website" class="wide" label="Website" placeholder="https://..." />
        </div>

        <div class="hr"></div>

        <div class="cardHead">
          <div class="title">Tax & Currency</div>
          <div class="hint">Used for invoice + POS totals</div>
        </div>

        <div class="formGrid">
          <VaInput v-model="form.tax_name" label="Tax Name" placeholder="VAT" />
          <VaInput v-model="form.tax_rate" type="number" label="Tax Rate (%)" />

          <VaSelect v-model="form.currency_code" :options="['USD', 'KHR']" label="Currency Code" />
          <VaInput v-model="form.currency_symbol" label="Currency Symbol" placeholder="$" />
        </div>

        <div class="hr"></div>

        <div class="cardHead">
          <div class="title">Time & Format</div>
          <div class="hint">Used for booking calendar</div>
        </div>

        <div class="formGrid">
          <VaSelect
            v-model="form.timezone"
            :options="['Asia/Phnom_Penh','UTC']"
            label="Timezone"
          />
          <VaSelect v-model="form.time_format" :options="['24h', '12h']" label="Time Format" />

          <VaSelect v-model="form.date_format" :options="['YYYY-MM-DD', 'DD/MM/YYYY', 'MM/DD/YYYY']" label="Date Format" />

          <VaInput v-model="form.check_in_time" type="time" step="1" label="Default Check-in Time" />
          <VaInput v-model="form.check_out_time" type="time" step="1" label="Default Check-out Time" />
        </div>

        <div class="hr"></div>

        <div class="cardHead">
          <div class="title">Policies</div>
          <div class="hint">Shown on invoice / booking confirmation</div>
        </div>

        <div class="formGrid">
          <VaTextarea v-model="form.cancellation_policy" class="wide" label="Cancellation Policy" :max-rows="6" />
          <VaTextarea v-model="form.terms_and_conditions" class="wide" label="Terms & Conditions" :max-rows="6" />
        </div>

        <div class="actions">
          <VaButton preset="secondary" icon="refresh" @click="reset">Reset</VaButton>
          <VaButton color="success" icon="save" :disabled="!canSave" @click="save">Save Changes</VaButton>
        </div>
      </VaCard>

      <!-- RIGHT: logo + preview -->
      <VaCard class="card side">
        <div class="cardHead">
          <div class="title">Logo</div>
          <div class="hint">Used on invoice & print</div>
        </div>

        <div class="logoBox">
          <img v-if="form.logo_url" :src="form.logo_url" alt="logo" class="logoImg" />
          <div v-else class="logoEmpty">
            <div class="logoIcon">image</div>
            <div class="logoText">No logo selected</div>
            <div class="logoHint">Upload PNG/JPG</div>
          </div>

          <div class="logoActions">
            <label class="uploadBtn">
              <input type="file" accept="image/*" class="file" @change="uploadLogo" />
              Upload Logo
            </label>
            <VaButton preset="secondary" :disabled="!form.logo_url" @click="form.logo_url = ''">Remove</VaButton>
          </div>
        </div>

        <div class="cardHead mt">
          <div class="title">Quick Preview</div>
          <div class="hint">What you will save</div>
        </div>

        <div class="preview">
          <div class="row">
            <div class="k">Property</div>
            <div class="v">{{ form.property_name || "-" }}</div>
          </div>
          <div class="row">
            <div class="k">Contact</div>
            <div class="v">{{ form.phone || "-" }}</div>
          </div>
          <div class="row">
            <div class="k">Email</div>
            <div class="v">{{ form.email || "-" }}</div>
          </div>

          <div class="hr2"></div>

          <div class="row">
            <div class="k">Tax</div>
            <div class="v">{{ form.tax_name }} {{ Number(form.tax_rate || 0).toFixed(2) }}%</div>
          </div>
          <div class="row">
            <div class="k">Currency</div>
            <div class="v">{{ form.currency_code }} ({{ form.currency_symbol }})</div>
          </div>

          <div class="hr2"></div>

          <div class="row">
            <div class="k">Check-in</div>
            <div class="v mono">{{ form.check_in_time }}</div>
          </div>
          <div class="row">
            <div class="k">Check-out</div>
            <div class="v mono">{{ form.check_out_time }}</div>
          </div>
          <div class="row">
            <div class="k">Timezone</div>
            <div class="v">{{ form.timezone }}</div>
          </div>
        </div>

        <div class="tips">
          <div class="tipTitle">Quick Tips</div>
          <ul>
            <li>Set correct <b>timezone</b> for Cambodia: <b>Asia/Phnom_Penh</b>.</li>
            <li>Use <b>VAT 10%</b> if you include VAT in invoices.</li>
            <li>Logo should be <b>transparent PNG</b> for printing.</li>
          </ul>
        </div>
      </VaCard>
    </div>
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
.headBtns {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.topGrid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
  margin-bottom: 14px;
}
@media (max-width: 900px) {
  .topGrid {
    grid-template-columns: 1fr;
  }
}
.topCard {
  border: 1px solid #eef2f6;
  border-radius: 14px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
  padding: 14px;
}
.topK {
  font-size: 12px;
  color: #64748b;
  font-weight: 800;
}
.topV {
  margin-top: 6px;
  font-size: 20px;
  font-weight: 900;
  color: #0f172a;
}
.topSub {
  margin-top: 6px;
  color: #64748b;
  font-size: 12px;
}
.topCard.blue .topV {
  color: #1d4ed8;
}
.topCard.ok .topV {
  color: #166534;
}

.grid {
  display: grid;
  grid-template-columns: 1.6fr 0.9fr;
  gap: 12px;
}
@media (max-width: 980px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

.card {
  border: 1px solid #eef2f6;
  border-radius: 14px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
  overflow: hidden;
}
.cardHead {
  padding: 14px 16px;
  border-bottom: 1px solid #eef2f6;
  background: #fbfcfe;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
}
.title {
  font-size: 14px;
  font-weight: 900;
  color: #0f172a;
}
.hint {
  font-size: 12px;
  color: #64748b;
  font-weight: 700;
}

.formGrid {
  padding: 14px 16px 16px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
@media (max-width: 720px) {
  .formGrid {
    grid-template-columns: 1fr;
  }
}
.wide {
  grid-column: 1 / -1;
}
.hr {
  height: 1px;
  background: #eef2f6;
}

.actions {
  padding: 14px 16px 16px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  border-top: 1px solid #eef2f6;
  background: #fff;
}

.side {
  position: sticky;
  top: 16px;
  height: fit-content;
}

.logoBox {
  padding: 14px 16px 16px;
}
.logoImg {
  width: 100%;
  max-height: 140px;
  object-fit: contain;
  border: 1px solid #eef2f6;
  border-radius: 14px;
  background: #fff;
  padding: 10px;
}
.logoEmpty {
  border: 1px dashed #cbd5e1;
  border-radius: 14px;
  background: #f8fafc;
  padding: 18px;
  text-align: center;
}
.logoIcon {
  font-weight: 900;
  color: #0f172a;
  margin-bottom: 4px;
}
.logoText {
  font-weight: 900;
  color: #0f172a;
}
.logoHint {
  margin-top: 6px;
  color: #64748b;
  font-size: 12px;
}
.logoActions {
  display: flex;
  gap: 10px;
  margin-top: 12px;
  flex-wrap: wrap;
}
.uploadBtn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #0f172a;
  font-weight: 900;
  cursor: pointer;
}
.uploadBtn:hover {
  background: #f1f5f9;
}
.file {
  display: none;
}

.mt {
  margin-top: 10px;
}

.preview {
  padding: 14px 16px 16px;
}
.row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 0;
}
.k {
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
}
.v {
  color: #0f172a;
  font-size: 12px;
  font-weight: 900;
  text-align: right;
}
.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New",
    monospace;
}
.hr2 {
  height: 1px;
  background: #eef2f6;
  margin: 8px 0;
}

.tips {
  margin: 10px 16px 16px;
  border: 1px solid #eef2f6;
  background: #fbfcfe;
  border-radius: 14px;
  padding: 12px 14px;
}
.tipTitle {
  font-weight: 900;
  color: #0f172a;
  margin-bottom: 8px;
}
.tips ul {
  margin: 0;
  padding-left: 16px;
  color: #334155;
  font-size: 12px;
  line-height: 1.5;
}
.tips li + li {
  margin-top: 6px;
}

/* Vuestic polish */
:deep(.va-input__container),
:deep(.va-select__container),
:deep(.va-textarea__container) {
  border-radius: 10px;
  background: #f9fafb;
}
:deep(.va-button) {
  border-radius: 10px;
  font-weight: 800;
}
</style>
