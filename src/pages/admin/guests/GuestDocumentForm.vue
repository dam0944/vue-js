<!-- src/pages/admin/guests/documents/GuestDocumentForm.vue -->
<template>
  <div class="min-h-[calc(100vh-60px)] bg-slate-50 px-4 py-5 sm:px-6">
    <div class="mx-auto max-w-3xl">
      <!-- Header -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <span class="material-icons text-slate-700">edit_note</span>
            <h1 class="truncate text-lg font-extrabold text-slate-900 sm:text-xl">
              {{ isEdit ? "Edit Document" : "Add Document" }}
            </h1>
          </div>
          <p class="mt-1 text-sm text-slate-500">
            Guest ID: <span class="font-semibold text-slate-700">#{{ guestId }}</span>
          </p>
        </div>

        <RouterLink
          :to="{ name: 'guest-documents', params: { guestId } }"
          class="rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white"
        >
          ← Back
        </RouterLink>
      </div>

      <!-- Form -->
      <div class="mt-5 rounded-2xl bg-white/70 p-4 sm:p-6">
        <form class="space-y-4" @submit.prevent="save">
          <div class="grid gap-3 sm:grid-cols-2">
            <div>
              <label class="text-xs font-extrabold text-slate-600">Document Type</label>
              <div class="mt-1 rounded-2xl bg-white p-3">
                <select v-model="form.document_type" class="w-full bg-transparent text-sm text-slate-800 focus:outline-none">
                  <option value="id_card">ID Card</option>
                  <option value="passport">Passport</option>
                  <option value="visa">Visa</option>
                  <option value="driving_license">Driving License</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label class="text-xs font-extrabold text-slate-600">Document Number</label>
              <div class="mt-1 rounded-2xl bg-white p-3">
                <input
                  v-model="form.document_number"
                  class="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                  placeholder="e.g. N12345678"
                />
              </div>
            </div>
          </div>

          <div class="grid gap-3 sm:grid-cols-2">
            <div>
              <label class="text-xs font-extrabold text-slate-600">Expiry Date</label>
              <div class="mt-1 rounded-2xl bg-white p-3">
                <input
                  v-model="form.expiry_date"
                  type="date"
                  class="w-full bg-transparent text-sm text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label class="text-xs font-extrabold text-slate-600">Document File Path</label>
              <div class="mt-1 rounded-2xl bg-white p-3">
                <input
                  v-model="form.document_file_path"
                  class="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                  placeholder="/uploads/guests/passport_1.jpg"
                />
              </div>
              <p class="mt-1 text-xs text-slate-500">
                (Static demo) In real app, this should be from file upload.
              </p>
            </div>
          </div>

          <div class="flex flex-wrap items-center justify-between gap-3 pt-2">
            <label class="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
              <input type="checkbox" class="h-4 w-4" v-model="form.is_verified" />
              Mark as verified
            </label>

            <div class="flex items-center gap-2">
              <button
                type="button"
                class="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                @click="reset"
              >
                Reset
              </button>
              <button
                type="submit"
                class="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                {{ isEdit ? "Update" : "Create" }}
              </button>
            </div>
          </div>

          <div v-if="toast" class="mt-3 rounded-2xl bg-white p-3 text-sm font-semibold"
               :class="toast.type === 'ok' ? 'text-emerald-700' : 'text-rose-700'">
            {{ toast.message }}
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue"
import { useRoute } from "vue-router"
import { guestDocuments } from "@/data/guest/guestDocuments"

const route = useRoute()
const guestId = computed(() => Number(route.params.guestId))
const documentId = computed(() => (route.params.documentId ? Number(route.params.documentId) : null))
const isEdit = computed(() => !!documentId.value)

const toast = ref(null)

const blank = () => ({
  document_id: null,
  guest_id: guestId.value,
  document_type: "passport",
  document_number: "",
  document_file_path: "",
  expiry_date: "",
  is_verified: false,
  verified_by: null,
  verified_at: null,
  uploaded_at: "",
  uploaded_by: null,
})

const form = ref(blank())

function reset() {
  form.value = blank()
  toast.value = null
}

function loadForEdit() {
  if (!isEdit.value) return
  const row = seed.find((x) => x.document_id === documentId.value && Number(x.guest_id) === guestId.value)
  if (!row) {
    toast.value = { type: "err", message: "Document not found (static demo)." }
    return
  }
  form.value = {
    ...blank(),
    ...row,
    is_verified: Boolean(row.is_verified),
  }
}

function save() {
  // UI demo only
  toast.value = { type: "ok", message: isEdit.value ? "Updated (static demo)." : "Created (static demo)." }
}

onMounted(() => {
  reset()
  loadForEdit()
})
</script>
