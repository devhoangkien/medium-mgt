<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl">
      <div>
        <h2 class="mt-6 text-center text-3xl flex justify-center items-center font-extrabold text-gray-900 dark:text-white pb-2">
          Medium Bot Manager
        </h2>
        <h3 class="mt-2 text-center text-xl font-medium text-gray-700 dark:text-gray-300">
          Sign in to your account
        </h3>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <input type="hidden" name="remember" value="true" />
        <div class="rounded-md shadow-sm space-y-4">
          <div>
            <label for="email-address" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email address
            </label>
            <input
              id="email-address"
              name="email"
              type="email"
              autocomplete="email"
              required
              v-model="email"
              class="appearance-none rounded relative block w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Email address"
            />
          </div>
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              v-model="password"
              class="appearance-none rounded relative block w-full px-3 py-2 mt-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Password"
            />
          </div>
        </div>

        <div v-if="errorMsg" class="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded">
          {{ errorMsg }}
        </div>

        <div class="flex items-center justify-between">
          <div class="text-sm">
            <!-- Registration is temporarily disabled -->
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-75 disabled:cursor-not-allowed transition-colors"
          >
            <span class="absolute left-0 inset-y-0 flex items-center pl-3">
              <!-- Heroicon name: solid/lock-closed -->
              <svg class="h-5 w-5 text-blue-500 group-hover:text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
              </svg>
            </span>
            {{ loading ? 'Signing in...' : 'Sign in' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({
  layout: 'empty' // Define layout empty for login
})

const email = ref('')
const password = ref('')
const errorMsg = ref('')
const loading = ref(false)
const router = useRouter()

const handleLogin = async () => {
  loading.value = true
  errorMsg.value = ''
  
  try {
    const data = await $fetch<any>('/api/auth/login', {
      method: 'POST',
      body: {
        email: email.value,
        password: password.value
      }
    })
    
    // Store token in cookie
    const tokenCookie = useCookie('auth_token', { maxAge: 60 * 60 * 24 * 7 }) // 7 days
    tokenCookie.value = data.token

    // Redirect to home/dashboard
    router.push('/')
  } catch (err: any) {
    errorMsg.value = err.data?.message || err.message || 'Login failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>
