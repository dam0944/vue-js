<template>
  <div class="space-y-2">
    <label class="text-sm font-medium text-gray-700">OTP Code</label>

    <div class="flex gap-2 justify-center">
      <input
        v-for="(d, i) in digits"
        :key="i"
        maxlength="1"
        class="w-12 h-12 text-center text-xl border rounded-lg focus:ring-2 focus:ring-green-500"
        v-model="digits[i]"
        @input="focusNext(i)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const digits = ref(['', '', '', '', '', ''])
const emit = defineEmits(['update'])

function focusNext(index) {
  const inputs = document.querySelectorAll('input')
  if (digits.value[index] && inputs[index + 1]) {
    inputs[index + 1].focus()
  }
}
watch(digits, () => {
  emit('update', digits.value.join(''))
}, { deep: true })
</script>
