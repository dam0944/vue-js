<template>
  <div class="lang-tabs">
    <button
      class="tab"
      :class="{ active: lang === 'en' }"
      @click="set('en')"
    >
      <img src="/flags/en.png" alt="EN" />
      <span>{{ t("common.english") }}</span>
    </button>

    <button
      class="tab"
      :class="{ active: lang === 'kh' }"
      @click="set('kh')"
    >
      <img src="/flags/kh.png" alt="KH" />
      <span>{{ t("common.khmer") }}</span>
    </button>
  </div>
</template>

<script setup>
import { t, lang, changeLang } from "@/i18n";  // ✅ direct import

const set = async (l) => {
  if (l !== lang.value) {
    await changeLang(l);
  }
};
</script>

<style scoped>
.lang-tabs {
  display: inline-flex;
  background: #f1f5f9;
  border-radius: 12px;
  padding: 4px;
  gap: 4px;
}

.tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 10px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-weight: 700;
  font-size: 13px;
  color: #475569;
  transition: all 0.2s ease;
}

.tab img {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  object-fit: cover;
}

.tab:hover {
  background: #e2e8f0;
}

.tab.active {
  background: #ffffff;
  color: #0f172a;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
}
</style>
