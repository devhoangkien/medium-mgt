<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
      <button 
        @click="refreshStats"
        class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
      >
        🔄 Refresh
      </button>
    </div>

    <!-- Stats Overview -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Medium Accounts</p>
            <p class="text-3xl font-semibold text-gray-900 dark:text-white mt-1">{{ stats.accounts }}</p>
            <p class="text-sm text-green-600 mt-1">{{ stats.activeAccounts }} active</p>
          </div>
          <div class="bg-blue-100 dark:bg-blue-900 rounded-full p-3">
            <span class="text-2xl">👥</span>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Articles</p>
            <p class="text-3xl font-semibold text-gray-900 dark:text-white mt-1">{{ stats.articles }}</p>
            <p class="text-sm text-gray-500 mt-1">{{ stats.drafts }} drafts</p>
          </div>
          <div class="bg-green-100 dark:bg-green-900 rounded-full p-3">
            <span class="text-2xl">📝</span>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Scheduled</p>
            <p class="text-3xl font-semibold text-gray-900 dark:text-white mt-1">{{ stats.scheduled }}</p>
            <p class="text-sm text-yellow-600 mt-1">Next: {{ stats.nextScheduled }}</p>
          </div>
          <div class="bg-yellow-100 dark:bg-yellow-900 rounded-full p-3">
            <span class="text-2xl">⏰</span>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Published</p>
            <p class="text-3xl font-semibold text-gray-900 dark:text-white mt-1">{{ stats.published }}</p>
            <p class="text-sm text-purple-600 mt-1">{{ stats.thisMonth }} this month</p>
          </div>
          <div class="bg-purple-100 dark:bg-purple-900 rounded-full p-3">
            <span class="text-2xl">✅</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
      </div>
      <div class="p-6">
        <div v-if="recentLogs.length === 0" class="text-center py-8">
          <p class="text-gray-500 dark:text-gray-400">No recent activity</p>
        </div>
        <div v-else class="space-y-4">
          <div 
            v-for="log in recentLogs" 
            :key="log.id"
            class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            <div class="flex items-center space-x-3">
              <span :class="getStatusIcon(log.status)" class="text-xl"></span>
              <div>
                <p class="font-medium text-gray-900 dark:text-white">{{ log.articleTitle }}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ log.accountName }} • {{ formatDate(log.postedAt) }}
                </p>
              </div>
            </div>
            <span :class="getStatusBadge(log.status)" class="px-3 py-1 rounded-full text-sm font-medium">
              {{ log.status }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <NuxtLink 
        to="/articles/new" 
        class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-md transition-shadow"
      >
        <div class="text-center">
          <span class="text-4xl">✨</span>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mt-4">New Article</h3>
          <p class="text-gray-600 dark:text-gray-300 text-sm mt-2">Create a new article</p>
        </div>
      </NuxtLink>

      <NuxtLink 
        to="/accounts" 
        class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-md transition-shadow"
      >
        <div class="text-center">
          <span class="text-4xl">➕</span>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mt-4">Add Account</h3>
          <p class="text-gray-600 dark:text-gray-300 text-sm mt-2">Connect Medium account</p>
        </div>
      </NuxtLink>

      <NuxtLink 
        to="/schedule" 
        class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-md transition-shadow"
      >
        <div class="text-center">
          <span class="text-4xl">📅</span>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mt-4">Schedule</h3>
          <p class="text-gray-600 dark:text-gray-300 text-sm mt-2">View scheduled posts</p>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

// Mock data - will be replaced with API calls
const stats = ref({
  accounts: 0,
  activeAccounts: 0,
  articles: 0,
  drafts: 0,
  scheduled: 0,
  published: 0,
  thisMonth: 0,
  nextScheduled: '-'
})

const recentLogs = ref<any[]>([])

const refreshStats = async () => {
  // TODO: Fetch from API
  console.log('Refreshing stats...')
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'SUCCESS': return '✅'
    case 'FAILED': return '❌'
    case 'PENDING': return '⏳'
    default: return '📝'
  }
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'SUCCESS': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'FAILED': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    case 'PENDING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('vi-VN')
}

onMounted(() => {
  refreshStats()
})
</script>
