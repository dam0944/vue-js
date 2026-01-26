<script setup>
import PasswordConfirmInput from '@/components/auth/PasswordConfirmInput.vue'
import PasswordNewInput from '@/components/auth/PasswordNewInput.vue'
import { ref } from 'vue'

const password = ref('')
const confirm = ref('')
function resetPassword() {
  if (password.value !== confirm.value) {
    alert("Passwords do not match")
    return
  }
  console.log("Reset:", password.value)
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">

      <h2 class="text-2xl font-bold text-center mb-2">
        Reset Password
      </h2>

      <p class="text-center text-gray-500 mb-6">
        Create a new password for your account
      </p>
      <div class="space-y-5">
        <!-- New Password -->
        <PasswordNewInput/>
        <!-- Confirm Password -->
        <PasswordConfirmInput/>
        <button
          @click="resetPassword"
          class="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition"
        >
          Reset Password
        </button>

        <div class="text-center text-sm text-gray-500">
          Remember your password?
          <router-link
            to="/"
            class="text-green-600 hover:text-green-700 hover:underline ml-1"
          >
            Login
          </router-link>
        </div>
      </div>

    </div>
  </div>
</template>
