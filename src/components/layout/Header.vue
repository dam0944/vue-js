<script setup>
import { useRouter } from "vue-router"

const router = useRouter()
const user = { name: "Dam", role: "Administrator" }

function logout() {
  localStorage.removeItem("token")
  router.push("/")
}
</script>

<template>
  <VaNavbar class="header-bar">
    <template #left>
      <div class="left-section">
        <slot name="toggle" />
        <div class="brand">
          <div class="brand-title">New POS</div>
          <div class="brand-sub">Guesthouse Management</div>
        </div>
      </div>
    </template>

    <template #right>
      <div class="right-area">
        <VaButton preset="secondary" icon="notifications" color="#64748b" class="nav-icon-btn" />
        <div class="vertical-divider" />
        
        <VaDropdown placement="bottom-end" :offset="[10, 0]">
          <template #anchor>
            <div class="user-profile-trigger">
              <VaAvatar size="32px" color="#3b82f6" text="D" />
              <div class="user-info">
                <span class="user-name">{{ user.name }}</span>
                <span class="user-role">{{ user.role }}</span>
              </div>
              <VaIcon name="expand_more" size="small" color="#94a3b8" />
            </div>
          </template>

          <VaDropdownContent class="profile-dropdown">
            <div class="dropdown-header">Account</div>
            <VaButton preset="secondary" icon="person" class="dropdown-link">Profile</VaButton>
            <div class="dropdown-divider" />
            <VaButton preset="secondary" icon="logout" class="dropdown-link logout-btn" @click="logout">
              Logout
            </VaButton>
          </VaDropdownContent>
        </VaDropdown>
      </div>
    </template>
  </VaNavbar>
</template>

<style scoped>
.header-bar {
  height: 64px;
  background: rgba(255, 255, 255, 0.85) !important;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #f1f5f9;
  padding: 0 1.5rem;
}

.left-section { display: flex; align-items: center; gap: 0.5rem; }
.brand { margin-left: 0.5rem; line-height: 1.2; }
.brand-title { font-weight: 700; font-size: 1.1rem; color: #1e293b; }
.brand-sub { font-size: 10px; color: #94a3b8; font-weight: 600; text-transform: uppercase; }

.right-area { display: flex; align-items: center; gap: 0.5rem; }
.vertical-divider { width: 1px; height: 20px; background: #e2e8f0; margin: 0 0.5rem; }

.user-profile-trigger {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 4px 8px; border-radius: 8px; cursor: pointer; transition: 0.2s;
}
.user-profile-trigger:hover { background: #f1f5f9; }

.user-info { display: flex; flex-direction: column; }
.user-name { font-weight: 700; font-size: 0.85rem; color: #1e293b; }
.user-role { font-size: 11px; color: #64748b; }

.profile-dropdown { padding: 0.5rem; width: 180px; border-radius: 12px; }
.dropdown-header { padding: 0.4rem 0.75rem; font-size: 10px; color: #94a3b8; font-weight: 800; text-transform: uppercase; }
.dropdown-link { width: 100%; justify-content: flex-start !important; color: #475569 !important; }
.logout-btn { color: #ef4444 !important; }
.dropdown-divider { height: 1px; background: #f1f5f9; margin: 0.4rem 0; }
</style>