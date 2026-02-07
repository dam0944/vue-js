<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { t } from "@/i18n";

const router = useRouter();

const password = ref("");
const confirm = ref("");

const showPassword = ref(false);
const showConfirm = ref(false);

function resetPassword() {
  if (password.value.length < 6) {
    alert(t("auth.reset.errors.min6"));
    return;
  }
  if (password.value !== confirm.value) {
    alert(t("auth.reset.errors.mismatch"));
    return;
  }

  console.log("Reset:", password.value);
  router.push("/");
}
</script>

<template>
  <div class="reset-form">
    <!-- Title -->
    <div class="head">
      <h2 class="title">{{ t("auth.reset.title") }}</h2>
      <p class="sub">{{ t("auth.reset.subtitle") }}</p>
    </div>

    <VaForm class="form" @submit.prevent="resetPassword">
      <!-- New Password -->
      <VaInput
        v-model="password"
        :label="t('auth.reset.new_password')"
        :type="showPassword ? 'text' : 'password'"
        :placeholder="t('auth.reset.new_placeholder')"
      >
        <template #prependInner>
          <VaIcon name="lock" />
        </template>

        <template #appendInner>
          <VaButton
            preset="plain"
            class="eye-btn"
            type="button"
            @click="showPassword = !showPassword"
            :aria-label="showPassword ? t('auth.reset.hide_password') : t('auth.reset.show_password')"
          >
            <VaIcon :name="showPassword ? 'visibility_off' : 'visibility'" />
          </VaButton>
        </template>
      </VaInput>

      <!-- Confirm Password -->
      <VaInput
        v-model="confirm"
        :label="t('auth.reset.confirm_password')"
        :type="showConfirm ? 'text' : 'password'"
        :placeholder="t('auth.reset.confirm_placeholder')"
      >
        <template #prependInner>
          <VaIcon name="verified_user" />
        </template>

        <template #appendInner>
          <VaButton
            preset="plain"
            class="eye-btn"
            type="button"
            @click="showConfirm = !showConfirm"
            :aria-label="showConfirm ? t('auth.reset.hide_password') : t('auth.reset.show_password')"
          >
            <VaIcon :name="showConfirm ? 'visibility_off' : 'visibility'" />
          </VaButton>
        </template>
      </VaInput>

      <VaButton type="submit" color="primary" size="large" block class="btn">
        {{ t("auth.reset.submit") }}
      </VaButton>

      <div class="footer">
        <span>{{ t("auth.reset.remember") }}</span>
        <RouterLink class="link" to="/">{{ t("auth.reset.back_login") }}</RouterLink>
      </div>
    </VaForm>
  </div>
</template>

<style scoped>
.reset-form { width: 100%; }
.head { margin-bottom: 18px; }
.title { font-size: 30px; font-weight: 900; color: #0f172a; margin: 0; }
.sub { margin: 6px 0 0; color: #64748b; font-size: 14px; }

.form { display: flex; flex-direction: column; gap: 14px; }
.btn { border-radius: 12px; font-weight: 800; margin-top: 6px; }

.eye-btn {
  min-width: 34px;
  height: 34px;
  border-radius: 10px;
}

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

.link {
  color: #0ea5e9;
  font-weight: 800;
  text-decoration: none;
}
.link:hover { text-decoration: underline; }
</style>
