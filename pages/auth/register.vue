<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white pb-2 flex justify-center items-center">
          Medium Bot Manager
        </h2>
        <h3 class="mt-2 text-center text-xl font-medium text-gray-700 dark:text-gray-300">
          Create a new account
        </h3>
      </div>
        <div class="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 p-4 rounded-md text-sm text-center">
          Registration is temporarily disabled. Please contact the administrator.
        </div>

        <div class="mt-6 flex justify-center text-sm">
          <NuxtLink to="/auth/login" class="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
            Return to Sign in
          </NuxtLink>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({
  layout: 'empty'
})

const email = ref('')
const password = ref('')
const name = ref('')
const errorMsg = ref('')
const successMsg = ref('')
const loading = ref(false)
const router = useRouter()

const handleRegister = async () => {
  loading.value = true
  errorMsg.value = ''
  successMsg.value = ''
  
  try {
    const data = await $fetch<any>('/api/auth/register', {
      method: 'POST',
      body: {
        email: email.value,
        password: password.value,
        name: name.value
      }
    })
    
    successMsg.value = 'Registration successful! Redirecting...'

    // Store token in cookie
    const tokenCookie = useCookie('auth_token', { maxAge: 60 * 60 * 24 * 7 })
    tokenCookie.value = data.token

    setTimeout(() => {
        router.push('/')
    }, 1500)
  } catch (err: any) {
    errorMsg.value = err.data?.message || err.message || 'Registration failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>
