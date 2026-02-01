<script setup>
import { useRouter } from "vue-router"

// ─── Config ──────────────────────────────────────────────────
// TODO: Replace with your real auth store (e.g. useAuthStore())
const USER = { name: "Dam", role: "Administrator", avatar: "D" }

// ─── Router ──────────────────────────────────────────────────
const router = useRouter()

function logout() {
  localStorage.removeItem("token")
  router.push("/")
}
</script>

<template>
  <VaNavbar class="navbar">

    <!-- ── Left: Toggle + Brand ───────────────────────────── -->
    <template #left>
      <div class="left">
        <slot name="toggle" />
        <div class="brand">
          <div class="brand-title">New POS</div>
          <div class="brand-sub">Guesthouse Management</div>
        </div>
      </div>
    </template>

    <!-- ── Right: Notifications + User Dropdown ───────────── -->
    <template #right>
      <div class="right">

        <!-- Notifications -->
        <VaButton
          preset="secondary"
          icon="notifications"
          color="#64748b"
          class="icon-btn"
        />

        <div class="divider" />

        <!-- User Dropdown -->
        <VaDropdown placement="bottom-end" :offset="[10, 0]">
          <template #anchor>
            <div class="user-trigger">
              <VaAvatar size="32px" color="#3b82f6" :text="USER.avatar" />
              <div class="user-info">
                <span class="user-name">{{ USER.name }}</span>
                <span class="user-role">{{ USER.role }}</span>
              </div>
              <VaIcon name="expand_more" size="small" color="#94a3b8" />
            </div>
          </template>

          <VaDropdownContent class="dropdown">
            <div class="dropdown-label">Account</div>

            <VaButton preset="secondary" icon="person" class="dropdown-item">
              Profile
            </VaButton>

            <div class="dropdown-divider" />

            <VaButton
              preset="secondary"
              icon="logout"
              class="dropdown-item dropdown-item--danger"
              @click="logout"
            >
              Logout
            </VaButton>
          </VaDropdownContent>
        </VaDropdown>

      </div>
    </template>

  </VaNavbar>
</template>

<style scoped>
/* ─── 1. Navbar Shell ───────────────────────────────────────── */
.navbar {
  height: 64px;
  background: rgba(255, 255, 255, 0.85) !important;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #f1f5f9;
  padding: 0 1.5rem;
}

/* ─── 2. Left: Brand ────────────────────────────────────────── */
.left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.brand {
  margin-left: 0.5rem;
  line-height: 1.2;
}
.brand-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
}
.brand-sub {
  font-size: 10px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

/* ─── 3. Right: Actions ─────────────────────────────────────── */
.right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.icon-btn {
  color: #64748b;
}

.divider {
  width: 1px;
  height: 20px;
  background: #e2e8f0;
  margin: 0 0.5rem;
}

/* ─── 4. User Trigger ───────────────────────────────────────── */
.user-trigger {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 4px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease;
}
.user-trigger:hover {
  background: #f1f5f9;
}

.user-info {
  display: flex;
  flex-direction: column;
}
.user-name {
  font-size: 0.85rem;
  font-weight: 700;
  color: #1e293b;
}
.user-role {
  font-size: 11px;
  color: #64748b;
}

/* ─── 5. Dropdown ───────────────────────────────────────────── */
.dropdown {
  width: 180px;
  padding: 0.5rem;
  border-radius: 12px;
}

.dropdown-label {
  padding: 0.4rem 0.75rem;
  font-size: 10px;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.dropdown-item {
  width: 100%;
  justify-content: flex-start !important;
  color: #475569 !important;
}

.dropdown-item--danger {
  color: #ef4444 !important;
}

.dropdown-divider {
  height: 1px;
  background: #f1f5f9;
  margin: 0.4rem 0;
}
</style>