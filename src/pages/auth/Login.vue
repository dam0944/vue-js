<template>
  <div class="login-form">
    <!-- Title -->
    <div class="head">
      <h2 class="title">{{ t("auth.login.title") }}</h2>
      <p class="sub">{{ t("auth.login.subtitle") }}</p>
    </div>

    <VaForm class="form" @submit.prevent="login">
      <!-- Phone row -->
      <div class="phone-row">
        <VaSelect
          v-model="countryCode"
          :options="codes"
          text-by="label"
          value-by="value"
          class="code"
          :label="t('auth.login.code')"
        />

        <VaInput
          v-model="phone"
          class="phone"
          :label="t('auth.login.phone')"
          :placeholder="t('auth.login.phone_placeholder')"
          inputmode="numeric"
        >
          <template #prependInner>
            <VaIcon name="call" color="secondary" />
          </template>
        </VaInput>
      </div>

      <!-- Password -->
      <VaInput
        v-model="password"
        :type="showPassword ? 'text' : 'password'"
        :label="t('auth.login.password')"
        :placeholder="t('auth.login.password_placeholder')"
        default-value=""
      >
        <template #prependInner>
          <VaIcon name="lock" color="secondary" />
        </template>

        <!-- Better eye icon -->
        <template #appendInner>
          <VaButton
            preset="plain"
            class="eye-btn"
            type="button"
            @click="showPassword = !showPassword"
            :aria-label="showPassword ? t('auth.login.hide_password') : t('auth.login.show_password')"
          >
            <VaIcon :name="showPassword ? 'visibility_off' : 'visibility'" />
          </VaButton>
        </template>
      </VaInput>

      <!-- Button (always visible) -->
      <VaButton
        to="/admin/dashboard"
        class="btn"
        type="submit"
        color="primary"
        size="large"
        block
      >
        {{ t("auth.login.submit") }}
      </VaButton>

      <!-- Forgot -->
      <div class="footer">
        <router-link to="/forgot" class="forgot">
          {{ t("auth.login.forgot") }}
        </router-link>
      </div>
    </VaForm>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { t } from "@/i18n"; // <-- IMPORTANT: use i18next t()

const countryCode = ref("+855");
const phone = ref("");
const password = ref("");
const showPassword = ref(false);

const codes = [
  { label: "🇰🇭 +855", value: "+855" },
  { label: "🇹🇭 +66", value: "+66" },
  { label: "🇻🇳 +84", value: "+84" },
  { label: "🇺🇸 +1", value: "+1" },
];

function login() {
  console.log("LOGIN:", countryCode.value, phone.value, password.value);
}
</script>

<style scoped>
.login-form { width: 100%; }

/* title */
.head { margin-bottom: 18px; }
.title {
  font-size: 30px;
  font-weight: 900;
  margin: 0;
  color: #0f172a;
}
.sub {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 14px;
}

/* form spacing */
.form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* phone row */
.phone-row {
  display: grid;
  grid-template-columns: 130px 1fr;
  gap: 10px;
}

/* button */
.btn {
  margin-top: 6px;
  border-radius: 12px;
  font-weight: 800;
}

/* eye button inside input */
.eye-btn {
  min-width: 34px;
  height: 34px;
  border-radius: 10px;
}

/* footer */
.footer {
  display: flex;
  justify-content: center;
  margin-top: 6px;
}
.forgot {
  color: #0ea5e9;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
}
.forgot:hover { text-decoration: underline; }

@media (max-width: 420px) {
  .phone-row { grid-template-columns: 1fr; }
}
</style>
