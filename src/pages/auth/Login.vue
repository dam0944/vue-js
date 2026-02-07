<template>
  <div class="login-container">
    <div class="login-form">
      <!-- Title -->
      <header class="head">
        <h2 class="title">{{ t("auth.login.title") }}</h2>
        <p class="sub">{{ t("auth.login.subtitle") }}</p>
      </header>

      <VaForm class="form" @submit.prevent="handleLogin">
        <!-- Phone row -->
        <div class="phone-row">
          <VaSelect
            v-model="formData.countryCode"
            :options="COUNTRY_CODES"
            text-by="label"
            value-by="value"
            class="code"
            style="width: 90px"
            :label="t('auth.login.code')"
          />

          <VaInput
            v-model="formData.phone"
            class="phone w-full"
            :label="t('auth.login.phone')"
            :placeholder="t('auth.login.phone_placeholder')"
            inputmode="numeric"
            autocomplete="false"
            style="width: 200px"
          >
            <template #prependInner>
              <VaIcon name="call" color="primary" />
            </template>
          </VaInput>
        </div>

        <!-- Password -->
        <VaValue
          v-slot="isPasswordVisible"
          :default-value="false"
        >
          <VaInput
            v-model="password"
             :type="showPassword ? 'text' : 'password'"
             :label="t('auth.login.password')"
              :placeholder="t('auth.login.password_placeholder')"
              autocomplete="current-password"
            @click-append-inner="isPasswordVisible.value = !isPasswordVisible.value"
          >
            <template #appendInner>
              <VaIcon
                :name="isPasswordVisible.value ? 'visibility_off' : 'visibility'"
                size="small"
                color="primary"
              />
            </template>
          </VaInput>
        </VaValue>

        <!-- Submit Button -->
        <VaButton
          class="btn"
          type="submit"
          color="primary"
          size="large"
          block
        >
          {{ t("auth.login.submit") }}
        </VaButton>

        <!-- Forgot Password -->
        <footer class="footer">
          <router-link to="/forgot" class="forgot">
            {{ t("auth.login.forgot") }}
          </router-link>
        </footer>
      </VaForm>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { t } from "@/i18n";

const router = useRouter();

const COUNTRY_CODES = [
  { label: "🇰🇭 +855", value: "+855" },
];

const formData = reactive({
  countryCode: "+855",
  phone: "",
  password: "",
});

const showPassword = ref(false);

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const handleLogin = () => {
  console.log("LOGIN:", formData.countryCode, formData.phone, formData.password);
  router.push("/admin/dashboard");
};
</script>

<style scoped>
.login-container {
  width: 100%;
  max-width: 100%;
  padding: 20px;
  box-sizing: border-box;
}

.login-form {
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
}

/* Header */
.head {
  margin-bottom: 24px;
  text-align: center;
}

.title {
  font-size: clamp(24px, 4vw, 30px);
  font-weight: 900;
  margin: 0;
  color: #0f172a;
  line-height: 1.2;
}

.sub {
  margin: 8px 0 0;
  color: #64748b;
  font-size: clamp(13px, 2vw, 14px);
  line-height: 1.5;
}

/* Form */
.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Phone row */
.phone-row {
  display:flex;
  /* grid-template-columns: 140px 1fr; */
  gap: 12px;
  align-items: start;
}

/* Button */
.btn {
  margin-top: 8px;
  border-radius: 12px;
  font-weight: 800;
  min-height: 48px;
}

/* Eye toggle button */
.eye-btn {
  min-width: 36px;
  height: 36px;
  border-radius: 10px;
}

/* Footer */
.footer {
  display: flex;
  justify-content: center;
  margin-top: 8px;
}

.forgot {
  color: #0ea5e9;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  padding: 4px;
}

.forgot:hover {
  text-decoration: underline;
}

/* Tablet landscape (like in your screenshot) */
@media (min-width: 768px) and (max-width: 1024px) {
  .login-container {
    padding: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 50vh;
  }

  .login-form {
    max-width: 520px;
  }

  .head {
    margin-bottom: 32px;
  }

  .form {
    gap: 20px;
  }

  .phone-row {
    grid-template-columns: 160px 1fr;
    gap: 16px;
  }
}

/* Desktop */
@media (min-width: 1025px) {
  .login-container {
    padding: 60px;
  }

  .login-form {
    max-width: 480px;
  }
}

/* Mobile portrait */
@media (max-width: 480px) {
  .login-container {
    padding: 16px;
  }

  .phone-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .head {
    margin-bottom: 20px;
  }
}

/* Very small mobile */
@media (max-width: 360px) {
  .login-container {
    padding: 12px;
  }

  .title {
    font-size: 22px;
  }
}
</style>