<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { t } from "@/i18n";

const otp = ref("");
const router = useRouter();

function verifyOTP() {
  const digits = otp.value.replace(/\D/g, "");
  if (digits.length !== 6) {
    alert(t("auth.otp.invalid"));
    return;
  }
  router.push("/reset");
}

function resend() {
  console.log("resend otp...");
}
</script>

<template>
  <div class="otp-form">
    <!-- Title -->
    <div class="head">
      <h2 class="title">{{ t("auth.otp.title") }}</h2>
      <p class="sub">{{ t("auth.otp.subtitle") }}</p>
    </div>

    <VaForm class="form" @submit.prevent="verifyOTP">
      <!-- OTP Input -->
      <VaInput
        v-model="otp"
        :label="t('auth.otp.code')"
        :placeholder="t('auth.otp.placeholder')"
        inputmode="numeric"
        maxlength="6"
        class="otp-input"
      >
        <template #prependInner>
          <VaIcon name="password" color="secondary" />
        </template>
      </VaInput>

      <VaButton to="/reset" type="submit" color="primary" size="large" block class="btn">
        {{ t("auth.otp.verify") }}
      </VaButton>

      <div class="footer">
        <span>{{ t("auth.otp.no_code") }}</span>
        <button type="button" class="resend" @click="resend">
          {{ t("auth.otp.resend") }}
        </button>
      </div>
    </VaForm>
  </div>
</template>

<style scoped>
.otp-form { width: 100%; }

/* Header */
.head { margin-bottom: 18px; }
.title { font-size: 30px; font-weight: 900; color: #0f172a; margin: 0; }
.sub { margin: 6px 0 0; color: #64748b; font-size: 14px; }

/* Form */
.form { display: flex; flex-direction: column; gap: 14px; }

.otp-input :deep(input) {
  text-align: center;
  letter-spacing: 10px;
  font-weight: 800;
  font-size: 18px;
}

/* Button */
.btn { border-radius: 12px; font-weight: 800; margin-top: 6px; }

/* Footer */
.footer {
  margin-top: 10px;
  text-align: center;
  font-size: 13px;
  color: #64748b;
  display: flex;
  justify-content: center;
  gap: 6px;
  align-items: center;
}

.resend {
  border: none;
  background: transparent;
  color: #0ea5e9;
  font-weight: 800;
  cursor: pointer;
  padding: 0;
}
.resend:hover { text-decoration: underline; }
</style>
