<!-- src/pages/admin/guests/documents/GuestDocumentsList.vue -->
<template>
  <div class="min-h-[calc(100vh-60px)] bg-slate-50 px-4 py-5 sm:px-6">
    <div class="mx-auto max-w-6xl">
      <!-- Error State: Invalid Guest ID -->
      <div v-if="!guestId" class="rounded-2xl bg-white/70 p-8 text-center">
        <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
          <span class="material-icons text-rose-600">error_outline</span>
        </div>
        <h3 class="mt-3 text-base font-extrabold text-slate-900">Invalid Guest ID</h3>
        <p class="mt-1 text-sm text-slate-500">
          Please provide a valid guest ID in the URL.
        </p>
        <RouterLink
          to="/admin/guests"
          class="mt-4 inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Back to Guests
        </RouterLink>
      </div>

      <!-- Main Content: Valid Guest ID -->
      <template v-else>
        <!-- Header -->
        <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <span class="material-icons text-slate-700">description</span>
              <h1 class="truncate text-lg font-extrabold text-slate-900 sm:text-xl">
                Guest Documents
              </h1>
            </div>
            <p class="mt-1 text-sm text-slate-500">
              Guest ID: <span class="font-semibold text-slate-700">#{{ guestId }}</span>
              • Manage ID cards, passport, visa, and verification.
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <button
              type="button"
              class="rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white"
              @click="refresh()"
            >
              Refresh
            </button>

            <RouterLink
              :to="{ name: 'guest-documents-create', params: { guestId } }"
              class="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              + Add Document
            </RouterLink>
          </div>
        </div>

        <!-- Controls -->
        <div class="mt-5 grid gap-3 md:grid-cols-12">
          <div class="md:col-span-5">
            <div class="rounded-2xl bg-white/70 p-3">
              <div class="flex items-center gap-2">
                <span class="material-icons text-slate-500">search</span>
                <input
                  v-model="q"
                  class="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                  placeholder="Search by doc number / type / file path..."
                />
              </div>
            </div>
          </div>

          <div class="md:col-span-4">
            <div class="rounded-2xl bg-white/70 p-3">
              <select
                v-model="type"
                class="w-full bg-transparent text-sm text-slate-800 focus:outline-none"
              >
                <option value="all">All types</option>
                <option value="id_card">ID Card</option>
                <option value="passport">Passport</option>
                <option value="visa">Visa</option>
                <option value="driving_license">Driving License</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div class="md:col-span-3">
            <div class="rounded-2xl bg-white/70 p-3">
              <select
                v-model="verified"
                class="w-full bg-transparent text-sm text-slate-800 focus:outline-none"
              >
                <option value="all">All status</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Content -->
        <div class="mt-5">
          <!-- Loading skeleton -->
          <div v-if="loading" class="space-y-3">
            <div
              v-for="i in 6"
              :key="i"
              class="rounded-2xl bg-white/70 p-4"
            >
              <div class="animate-pulse">
                <div class="h-4 w-44 rounded bg-slate-200"></div>
                <div class="mt-3 grid gap-2 sm:grid-cols-3">
                  <div class="h-3 w-full rounded bg-slate-200"></div>
                  <div class="h-3 w-full rounded bg-slate-200"></div>
                  <div class="h-3 w-full rounded bg-slate-200"></div>
                </div>
                <div class="mt-4 flex gap-2">
                  <div class="h-9 w-24 rounded-full bg-slate-200"></div>
                  <div class="h-9 w-24 rounded-full bg-slate-200"></div>
                  <div class="h-9 w-24 rounded-full bg-slate-200"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty -->
          <div
            v-else-if="filtered.length === 0"
            class="rounded-2xl bg-white/70 p-8 text-center"
          >
            <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <span class="material-icons text-slate-600">inbox</span>
            </div>
            <h3 class="mt-3 text-base font-extrabold text-slate-900">No documents found</h3>
            <p class="mt-1 text-sm text-slate-500">
              Try another filter or add a new document.
            </p>
            <RouterLink
              :to="{ name: 'guest-documents-create', params: { guestId } }"
              class="mt-4 inline-flex rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              + Add Document
            </RouterLink>
          </div>

          <!-- List -->
          <div v-else class="space-y-3">
            <div
              v-for="row in filtered"
              :key="row.document_id"
              class="rounded-2xl bg-white/70 p-4"
            >
              <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <!-- Left -->
                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-700">
                      #{{ row.document_id }}
                    </span>

                    <span class="text-sm font-extrabold text-slate-900">
                      {{ prettyType(row.document_type) }}
                    </span>

                    <span
                      class="rounded-full px-3 py-1 text-xs font-extrabold"
                      :class="row.is_verified ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'"
                    >
                      {{ row.is_verified ? "Verified" : "Not Verified" }}
                    </span>
                  </div>

                  <div class="mt-2 grid gap-2 sm:grid-cols-3">
                    <div class="text-sm text-slate-700">
                      <div class="text-xs font-bold text-slate-500">Document Number</div>
                      <div class="truncate font-semibold">{{ row.document_number || "—" }}</div>
                    </div>

                    <div class="text-sm text-slate-700">
                      <div class="text-xs font-bold text-slate-500">Expiry Date</div>
                      <div class="font-semibold">{{ row.expiry_date || "—" }}</div>
                    </div>

                    <div class="text-sm text-slate-700">
                      <div class="text-xs font-bold text-slate-500">File Path</div>
                      <div class="truncate font-semibold">{{ row.document_file_path || "—" }}</div>
                    </div>
                  </div>

                  <div class="mt-2 text-xs text-slate-500">
                    Uploaded: <span class="font-semibold text-slate-700">{{ row.uploaded_at || "—" }}</span>
                    • Uploaded by: <span class="font-semibold text-slate-700">{{ row.uploaded_by ?? "—" }}</span>
                    <span v-if="row.is_verified">
                      • Verified by: <span class="font-semibold text-slate-700">{{ row.verified_by ?? "—" }}</span>
                      • Verified at: <span class="font-semibold text-slate-700">{{ row.verified_at ?? "—" }}</span>
                    </span>
                  </div>
                </div>

                <!-- Right actions -->
                <div class="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    class="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    @click="toggleVerify(row.document_id)"
                  >
                    {{ row.is_verified ? "Unverify" : "Verify" }}
                  </button>

                  <RouterLink
                    :to="{
                      name: 'guest-documents-edit',
                      params: { guestId, documentId: row.document_id }
                    }"
                    class="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    Edit
                  </RouterLink>

                  <button
                    type="button"
                    class="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
                    @click="remove(row.document_id)"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
        <!-- /Content -->
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from "vue"
import { useRoute } from "vue-router"
import { guestDocuments } from "@/data/guest/guestDocuments"

const route = useRoute()

// Get guestId from route params and validate it
const guestId = computed(() => {
  const id = route.params.guestId
  // Return the ID only if it's a valid non-empty value
  return id && String(id).trim() ? String(id).trim() : null
})

const loading = ref(true)
const rows = ref([])

const q = ref("")
const type = ref("all")
const verified = ref("all")

function prettyType(t) {
  const map = {
    id_card: "ID Card",
    passport: "Passport",
    visa: "Visa",
    driving_license: "Driving License",
    other: "Other",
  }
  return map[t] || String(t || "—")
}

function refresh() {
  // Don't refresh if guestId is invalid
  if (!guestId.value) {
    loading.value = false
    return
  }

  loading.value = true
  // simulate API delay for UX
  setTimeout(() => {
    rows.value = (guestDocuments || [])
      .filter((x) => String(x.guest_id) === String(guestId.value))
      .map((x) => ({ ...x }))
    loading.value = false
  }, 700)
}

const filtered = computed(() => {
  const term = q.value.trim().toLowerCase()

  return rows.value.filter((r) => {
    if (type.value !== "all" && r.document_type !== type.value) return false

    if (verified.value !== "all") {
      const want = verified.value === "verified"
      if (Boolean(r.is_verified) !== want) return false
    }

    if (!term) return true
    const hay = [
      r.document_type,
      r.document_number,
      r.document_file_path,
      r.expiry_date,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()

    return hay.includes(term)
  })
})

// UI-only actions for static demo
function toggleVerify(id) {
  const i = rows.value.findIndex((x) => x.document_id === id)
  if (i === -1) return
  const now = new Date()
  rows.value[i].is_verified = rows.value[i].is_verified ? 0 : 1
  rows.value[i].verified_by = rows.value[i].is_verified ? 2 : null
  rows.value[i].verified_at = rows.value[i].is_verified
    ? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:00`
    : null
}

function remove(id) {
  rows.value = rows.value.filter((x) => x.document_id !== id)
}

// Watch for guestId changes and refresh
watch(guestId, (newId) => {
  if (newId) {
    refresh()
  }
}, { immediate: true })

onMounted(() => {
  // refresh() is now called by the watcher
})
</script>