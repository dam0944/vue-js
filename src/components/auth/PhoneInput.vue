<template>
  <div class="space-y-2">
    <label class="text-sm font-medium text-gray-700">Phone Number</label>
    <div class="flex gap-2">
      <select class="w-28 border rounded-lg px-3 py-2 bg-gray-50">
        <option>+855</option>
      </select>
      <input
        v-model="phone"
        type="tel"
        placeholder="12 345 678"
        class="flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const phone = ref('')
const emit = defineEmits(['update'])

watch(phone, () => {
  emit('update', phone.value)
})
</script>
