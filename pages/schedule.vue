<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Scheduled Posts</h1>
    </div>

    <!-- Calendar View -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div class="text-center py-12">
        <span class="text-6xl">📅</span>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mt-4">Calendar View</h3>
        <p class="text-gray-600 dark:text-gray-300 mt-2">Coming soon - visualize your posting schedule</p>
      </div>
    </div>

    <!-- Scheduled List -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Posts</h2>
      </div>
      <div class="divide-y divide-gray-200 dark:divide-gray-700">
        <div 
          v-for="post in scheduledPosts" 
          :key="post.id"
          class="px-6 py-4 flex items-center justify-between"
        >
          <div class="flex items-center space-x-4">
            <div class="text-center min-w-[60px]">
              <div class="text-sm text-gray-500 dark:text-gray-400">{{ getMonth(post.scheduledAt) }}</div>
              <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ getDay(post.scheduledAt) }}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">{{ getTime(post.scheduledAt) }}</div>
            </div>
            <div>
              <h3 class="font-medium text-gray-900 dark:text-white">{{ post.title }}</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                → {{ post.accountName }}
              </p>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <button 
              @click="reschedulePost(post.id)"
              class="text-blue-600 hover:text-blue-900 dark:text-blue-400"
            >
              🔄
            </button>
            <button 
              @click="cancelPost(post.id)"
              class="text-red-600 hover:text-red-900 dark:text-red-400"
            >
              ❌
            </button>
          </div>
        </div>
        <div v-if="scheduledPosts.length === 0" class="px-6 py-12 text-center">
          <p class="text-gray-500 dark:text-gray-400">No scheduled posts</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

const scheduledPosts = ref<any[]>([])

const getMonth = (date: string) => {
  return new Date(date).toLocaleString('vi-VN', { month: 'short' })
}

const getDay = (date: string) => {
  return new Date(date).getDate()
}

const getTime = (date: string) => {
  return new Date(date).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

const reschedulePost = async (id: string) => {
  // TODO: Open reschedule modal
  console.log('Reschedule:', id)
}

const cancelPost = async (id: string) => {
  if (!confirm('Cancel this scheduled post?')) return
  // TODO: API call
  console.log('Cancel:', id)
}

onMounted(() => {
  // TODO: Fetch scheduled posts from API
  // scheduledPosts.value = await $fetch('/api/schedule')
})
</script>
