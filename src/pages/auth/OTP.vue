<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import OTPInput from '@/components/auth/OTPInput.vue'

const otp = ref('')
const router = useRouter()

function verifyOTP() {
  if (otp.value.length !== 6) {
    alert("Please enter 6-digit OTP")
    return
  }
  router.push('/reset')
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">

      <h2 class="text-2xl font-bold text-center mb-2">
        OTP Verification
      </h2>

      <p class="text-center text-gray-500 mb-6">
        Enter the 6-digit code sent to your phone
      </p>

      <OTPInput @update="otp = $event" />

      <button
        @click="verifyOTP"
        class="w-full mt-6 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold"
      >
        Verify
      </button>

      <div class="text-center text-sm text-gray-500 mt-4">
        Didn’t receive code?
        <span class="text-green-600 hover:underline cursor-pointer">
          Resend
        </span>
      </div>
    </div>
  </div>
</template>
