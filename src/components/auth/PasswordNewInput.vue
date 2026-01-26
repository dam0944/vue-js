<template>
  <div class="space-y-2">
    <label class="text-sm font-medium text-gray-700">New Password</label>

    <div class="relative">
      <input
        :type="show ? 'text' : 'password'"
        v-model="password"
        placeholder="Enter new password"
        class="w-full border rounded-lg px-4 py-2 pr-12 focus:ring-2 focus:ring-green-500"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const password = ref('')
const show = ref(false)
const emit = defineEmits(['update'])

watch(password, () => {
  emit('update', password.value)
})
</script>
