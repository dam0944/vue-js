<script setup>
import { ref } from "vue";
import { t } from "@/i18n";

const countryCode = ref("+855");
const phone = ref("");

const codes = [
  { label: "🇰🇭 +855", value: "+855" },
  { label: "🇹🇭 +66", value: "+66" },
  { label: "🇻🇳 +84", value: "+84" },
  { label: "🇺🇸 +1", value: "+1" },
];

function sendOTP() {
  console.log("Send OTP to:", countryCode.value, phone.value);
}
</script>

<template>
  <div class="forgot-form">
    <!-- Title -->
    <div class="head">
      <h2 class="title">{{ t("auth.forgot.title") }}</h2>
      <p class="sub">{{ t("auth.forgot.subtitle") }}</p>
    </div>

    <VaForm class="form" @submit.prevent="sendOTP">
      <!-- Phone -->
      <div class="phone-row">
        <VaSelect
          v-model="countryCode"
          :options="codes"
          text-by="label"
          value-by="value"
          :label="t('auth.forgot.code')"
        />

        <VaInput
          v-model="phone"
          :label="t('auth.forgot.phone')"
          :placeholder="t('auth.forgot.phone_placeholder')"
          inputmode="numeric"
        >
          <template #prependInner>
            <VaIcon name="call" color="secondary" />
          </template>
        </VaInput>
      </div>

      <!-- Button -->
      <VaButton
        to="/otp"
        type="submit"
        color="primary"
        size="large"
        block
        class="btn"
      >
        {{ t("auth.forgot.continue") }}
      </VaButton>

      <!-- Back to login -->
      <div class="footer">
        <span>{{ t("auth.forgot.remember") }}</span>
        <router-link to="/" class="login-link">
          {{ t("auth.forgot.back_login") }}
        </router-link>
      </div>
    </VaForm>
  </div>
</template>

<style scoped>
.forgot-form {
  width: 100%;
}

/* Title */
.head { margin-bottom: 18px; }

.title {
  font-size: 30px;
  font-weight: 900;
  color: #0f172a;
  margin: 0;
}

.sub {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 14px;
}

/* Layout */
.form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.phone-row {
  display: grid;
  grid-template-columns: 130px 1fr;
  gap: 10px;
}

/* Button */
.btn {
  border-radius: 12px;
  font-weight: 800;
  margin-top: 6px;
}

/* Footer */
.footer {
  margin-top: 10px;
  text-align: center;
  font-size: 13px;
  color: #64748b;
}

.login-link {
  margin-left: 6px;
  color: #0ea5e9;
  font-weight: 700;
  text-decoration: none;
}

.login-link:hover {
  text-decoration: underline;
}

/* Mobile */
@media (max-width: 420px) {
  .phone-row {
    grid-template-columns: 1fr;
  }
}
</style>
