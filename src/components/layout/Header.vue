<!-- src/components/layout/AppNavbar.vue -->
<script setup>
import { computed, ref, watch } from "vue"
import { useRouter } from "vue-router"

const USER = {
  name: "Dam",
  role: "Administrator",
  avatar:
    "https://static.vecteezy.com/system/resources/previews/011/675/374/original/man-avatar-image-for-profile-png.png",
}

const router = useRouter()
function logout() {
  localStorage.removeItem("token")
  router.push("/")
}

/* Logo */
const BRAND_LOGO =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Hotel_icon.svg/512px-Hotel_icon.svg.png"

/* ✅ Language (FIX flags) */
const langOptions = [
  { text: "English", short: "EN", value: "en", flag: "/flags/en.png" },
  { text: "Khmer", short: "KH", value: "kh", flag: "/flags/kh.png" },
]

const lang = ref(localStorage.getItem("lang") || "en")
const activeLang = computed(() => langOptions.find((x) => x.value === lang.value) || langOptions[0])

watch(lang, (v) => {
  localStorage.setItem("lang", v)
  // If later use i18n:
  // i18n.global.locale.value = v
})
</script>

<template>
  <VaNavbar class="navbar">
    <!-- LEFT -->
    <template #left>
      <div class="flex items-center gap-3 min-w-0">
        <slot name="toggle" />

        <img :src="BRAND_LOGO" alt="Logo" class="logo" />

        <div class="leading-tight min-w-0">
          <div class="title truncate">New POS</div>
          <div class="subtitle truncate">Guesthouse Management</div>
        </div>
      </div>
    </template>

    <!-- RIGHT -->
    <template #right>
      <div class="flex items-center gap-3">
        <!-- ✅ LANGUAGE DROPDOWN (LIKE USER PROFILE) -->
        <VaDropdown placement="bottom-end" :offset="[6, 8]">
          <template #anchor>
            <button class="lang-btn" type="button" title="Language">
              <!-- ✅ show selected flag as image -->
              <img :src="activeLang.flag" class="flag-img" alt="lang" />
              <VaIcon name="expand_more" size="small" class="lang-caret" />
            </button>
          </template>

          <VaDropdownContent class="lang-dropdown">
            <div class="lang-head">Language</div>

            <button
              v-for="opt in langOptions"
              :key="opt.value"
              type="button"
              class="lang-item"
              :class="{ active: opt.value === lang }"
              @click="lang = opt.value"
            >
              <img :src="opt.flag" class="flag-img" alt="flag" />

              <div class="lang-item-text">
                <div class="lang-item-title">{{ opt.text }}</div>
                <div class="lang-item-sub">{{ opt.short }}</div>
              </div>

              <VaIcon v-if="opt.value === lang" name="check" class="lang-check" />
            </button>
          </VaDropdownContent>
        </VaDropdown>

        <!-- Notification -->
        <VaButton preset="secondary" round class="icon-btn">
          <VaBadge text="3" color="danger">
            <VaIcon name="notifications" />
          </VaBadge>
        </VaButton>

        <div class="divider" />

        <!-- USER DROPDOWN -->
        <VaDropdown placement="bottom-end" :offset="[6, 8]">
          <template #anchor>
            <button class="user-btn" type="button">
              <VaAvatar size="30px" :src="USER.avatar" class="shrink-0" />

              <div class="hidden sm:flex flex-col items-start leading-tight">
                <div class="user-name">{{ USER.name }}</div>
                <div class="user-role">{{ USER.role }}</div>
              </div>

              <VaIcon name="expand_more" size="small" class="text-slate-400" />
            </button>
          </template>

          <VaDropdownContent class="dropdown">
            <div class="px-2 pt-1 pb-2">
              <div class="text-[13px] font-black text-slate-900">{{ USER.name }}</div>
              <div class="text-[11px] font-bold text-slate-500">{{ USER.role }}</div>
            </div>

            <div class="line" />

            <VaButton preset="secondary" icon="person" class="dd-item">Profile</VaButton>
            <VaButton preset="secondary" icon="settings" class="dd-item">Settings</VaButton>

            <div class="line" />

            <VaButton preset="secondary" icon="logout" class="dd-item dd-danger" @click="logout">
              Logout
            </VaButton>
          </VaDropdownContent>
        </VaDropdown>
      </div>
    </template>
  </VaNavbar>
</template>

<style scoped>
/* Navbar shell */
.navbar {
  height: 56px;
  padding: 0 16px;
  background: #ffffff !important;
  border-bottom: 1px solid #e2e8f0;
}

/* Brand */
.logo {
  height: 34px;
  width: 34px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  padding: 4px;
  background: #fff;
}

.title {
  font-size: 15px;
  font-weight: 900;
  color: #0f172a;
  letter-spacing: -0.2px;
}

.subtitle {
  margin-top: 2px;
  font-size: 10px;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

/* ✅ Language button (50px) */
.lang-btn {
  width: 50px;
  height: 38px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;
}
.lang-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}
.lang-caret {
  color: #94a3b8;
  margin-left: -2px;
}

/* Language dropdown */
.lang-dropdown {
  width: 220px;
  padding: 10px;
  border-radius: 16px;
}
.lang-head {
  padding: 4px 6px 10px;
  font-size: 12px;
  font-weight: 900;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.lang-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 10px;
  border: 1px solid #eef2f7;
  border-radius: 14px;
  background: #fff;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;
  text-align: left;
  margin-bottom: 8px;
}
.lang-item:hover {
  background: #f8fafc;
  border-color: #e2e8f0;
}
.lang-item.active {
  background: #f0f9ff;
  border-color: #93c5fd;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
}
.lang-item-text {
  min-width: 0;
}
.lang-item-title {
  font-size: 13px;
  font-weight: 900;
  color: #0f172a;
}
.lang-item-sub {
  margin-top: 2px;
  font-size: 11px;
  font-weight: 800;
  color: #64748b;
}
.lang-check {
  margin-left: auto;
  color: #0ea5e9;
}

/* Notification */
.icon-btn {
  width: 38px !important;
  height: 38px !important;
  border-radius: 10px !important;
}
.icon-btn :deep(.va-button__content) {
  padding: 0 !important;
}

/* Divider */
.divider {
  width: 1px;
  height: 22px;
  background: #e2e8f0;
}

/* User trigger */
.user-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 38px;
  padding: 0 10px;
  border-radius: 10px;
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;
}
.user-btn:hover {
  background: #f8fafc;
  border-color: #e2e8f0;
}
.user-name {
  font-size: 13px;
  font-weight: 900;
  color: #0f172a;
}
.user-role {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
}

/* User dropdown */
.dropdown {
  width: 220px;
  padding: 10px;
  border-radius: 16px;
}
.line {
  height: 1px;
  background: #eef2f7;
  margin: 8px 0;
}
.dd-item {
  width: 100%;
  justify-content: flex-start !important;
  border-radius: 12px !important;
  color: #334155 !important;
}
.dd-item:hover {
  background: #f8fafc !important;
}
.dd-danger {
  color: #ef4444 !important;
}

/* Responsive */
@media (max-width: 640px) {
  .subtitle {
    display: none;
  }
}

/* ✅ flag image */
.flag-img {
  width: 22px;
  height: 22px;
  object-fit: cover;
  border-radius: 4px;
}
</style>
