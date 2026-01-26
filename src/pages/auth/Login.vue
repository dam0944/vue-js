<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">

      <h2 class="text-2xl font-bold text-center mb-2">Welcome Back</h2>
      <p class="text-center text-gray-500 mb-6">
        Sign in to your account
      </p>

      <div class="space-y-5">
        <PhoneInput @update="phone = $event" />
        <PasswordInput @update="password = $event" />

        <button
          @click="login"
          class="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition"
        >
          Login
        </button>

        <!-- Forgot password -->
        <div class="text-center">
          <router-link
            to="/forgot"
            class="text-sm text-green-600 hover:text-green-700 hover:underline"
          >
            Forgot your password?
          </router-link>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import PhoneInput from '@/components/auth/PhoneInput.vue'
import PasswordInput from '@/components/auth/PasswordInput.vue'

const phone = ref('')
const password = ref('')

function login() {
  console.log(phone.value, password.value)
}
</script>
