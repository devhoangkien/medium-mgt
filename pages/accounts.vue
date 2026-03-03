<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Medium Accounts</h1>
      <button 
        @click="showAddModal = true"
        class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
      >
        ➕ Add Account
      </button>
    </div>

    <!-- Accounts Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="account in accounts" 
        :key="account.id"
        class="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
      >
        <div class="flex items-start justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <span class="text-xl">👤</span>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 dark:text-white">{{ account.accountName }}</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">@{{ account.mediumUsername }}</p>
            </div>
          </div>
          <span :class="getStatusBadge(account.status)" class="px-2 py-1 rounded text-xs font-medium">
            {{ account.status }}
          </span>
        </div>

        <div class="mt-4 space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-gray-500 dark:text-gray-400">Articles</span>
            <span class="text-gray-900 dark:text-white">{{ account.articleCount || 0 }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-500 dark:text-gray-400">Last Used</span>
            <span class="text-gray-900 dark:text-white">{{ formatDate(account.lastUsedAt) }}</span>
          </div>
        </div>

        <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex space-x-2">
          <button 
            @click="verifyAccount(account.id)"
            class="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-sm font-medium py-2 px-3 rounded transition-colors"
          >
            🔍 Verify
          </button>
          <button 
            @click="editAccount(account)"
            class="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-sm font-medium py-2 px-3 rounded transition-colors"
          >
            ✏️ Edit
          </button>
          <button 
            @click="deleteAccount(account.id)"
            class="flex-1 bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 text-red-900 dark:text-red-200 text-sm font-medium py-2 px-3 rounded transition-colors"
          >
            🗑️
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="accounts.length === 0" class="col-span-full text-center py-12">
        <span class="text-6xl">📭</span>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mt-4">No Accounts Yet</h3>
        <p class="text-gray-600 dark:text-gray-300 mt-2">Add your first Medium account to get started</p>
        <button 
          @click="showAddModal = true"
          class="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          Add Account
        </button>
      </div>
    </div>

    <!-- Add Account Modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Add Medium Account</h2>
        </div>
        
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Account Name
            </label>
            <input 
              v-model="newAccount.accountName"
              type="text"
              placeholder="My Medium Account"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Session Cookie
            </label>
            <textarea 
              v-model="newAccount.cookies"
              placeholder="Paste your Medium session cookie here..."
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            ></textarea>
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              How to get: Login to Medium → Open DevTools → Copy `sid` cookie
            </p>
          </div>

          <div v-if="error" class="text-red-600 dark:text-red-400 text-sm">
            {{ error }}
          </div>
        </div>

        <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
          <button 
            @click="showAddModal = false"
            class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button 
            @click="addAccount"
            :disabled="loading"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50"
          >
            {{ loading ? 'Adding...' : 'Add Account' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

const showAddModal = ref(false)
const loading = ref(false)
const error = ref('')

const accounts = ref<any[]>([])

const newAccount = ref({
  accountName: '',
  cookies: ''
})

const addAccount = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await $fetch('/api/accounts', {
      method: 'POST',
      body: newAccount.value
    })
    
    showAddModal.value = false
    newAccount.value = { accountName: '', cookies: '' }
    // Refresh accounts list
    await fetchAccounts()
  } catch (err: any) {
    error.value = err.data?.message || err.message || 'Failed to add account'
  } finally {
    loading.value = false
  }
}

const verifyAccount = async (id: string) => {
  // TODO: API call to verify account
  console.log('Verifying account:', id)
}

const editAccount = (account: any) => {
  // TODO: Open edit modal
  console.log('Editing account:', account)
}

const deleteAccount = async (id: string) => {
  if (!confirm('Are you sure you want to delete this account?')) return
  
  // TODO: API call to delete account
  console.log('Deleting account:', id)
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'ACTIVE': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'INACTIVE': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    case 'BANNED': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
  }
}

const formatDate = (date: string | null) => {
  if (!date) return 'Never'
  return new Date(date).toLocaleString('vi-VN')
}

const fetchAccounts = async () => {
  try {
    const data = await $fetch<any[]>('/api/accounts')
    accounts.value = data
  } catch (err) {
    console.error('Error fetching accounts:', err)
  }
}

onMounted(() => {
  fetchAccounts()
})
</script>
