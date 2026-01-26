<script setup>
import { ref } from 'vue'
import PhoneInput from '@/components/auth/PhoneInput.vue'

const phone = ref('')

function sendOTP() {
  console.log(phone.value)
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">

      <h2 class="text-2xl font-bold text-center mb-2">
        Forgot Password
      </h2>

      <p class="text-center text-gray-500 mb-6">
        Enter your phone number to reset your password
      </p>

      <div class="space-y-5">
        <PhoneInput @update="phone = $event" />

        <button
          @click="sendOTP"
          class="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition"
        >
          Continue
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
