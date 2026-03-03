<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Articles</h1>
      <NuxtLink 
        to="/articles/new" 
        class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
      >
        ✨ New Article
      </NuxtLink>
    </div>

    <!-- Filters -->
    <div class="flex space-x-4">
      <select 
        v-model="filter"
        class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      >
        <option value="all">All Articles</option>
        <option value="draft">Drafts</option>
        <option value="scheduled">Scheduled</option>
        <option value="published">Published</option>
        <option value="failed">Failed</option>
      </select>
    </div>

    <!-- Articles List -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Title
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Status
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Account
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Scheduled
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="article in filteredArticles" :key="article.id">
            <td class="px-6 py-4">
              <div>
                <div class="text-sm font-medium text-gray-900 dark:text-white">{{ article.title }}</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">{{ article.tags?.slice(0, 3).join(', ') }}</div>
              </div>
            </td>
            <td class="px-6 py-4">
              <span :class="getStatusBadge(article.status)" class="px-2 py-1 rounded text-xs font-medium">
                {{ article.status }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">
              {{ article.accountName || '-' }}
            </td>
            <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">
              {{ article.scheduledAt ? formatDate(article.scheduledAt) : '-' }}
            </td>
            <td class="px-6 py-4 text-right">
              <div class="flex justify-end space-x-2">
                <NuxtLink 
                  :to="`/articles/${article.id}/edit`"
                  class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  ✏️
                </NuxtLink>
                <button 
                  @click="publishArticle(article.id)"
                  class="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                >
                  🚀
                </button>
                <button 
                  @click="deleteArticle(article.id)"
                  class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                >
                  🗑️
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="filteredArticles.length === 0">
            <td colspan="5" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
              No articles found
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

const filter = ref('all')
const articles = ref<any[]>([])

const filteredArticles = computed(() => {
  if (filter.value === 'all') return articles.value
  
  const statusMap: Record<string, string> = {
    draft: 'DRAFT',
    scheduled: 'SCHEDULED',
    published: 'PUBLISHED',
    failed: 'FAILED'
  }
  
  return articles.value.filter(a => a.status === statusMap[filter.value])
})

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'DRAFT': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    case 'SCHEDULED': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    case 'PUBLISHING': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    case 'PUBLISHED': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'FAILED': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('vi-VN')
}

const publishArticle = async (id: string) => {
  if (!confirm('Publish this article now?')) return
  // TODO: API call
  console.log('Publishing:', id)
}

const deleteArticle = async (id: string) => {
  if (!confirm('Delete this article?')) return
  // TODO: API call
  console.log('Deleting:', id)
}

onMounted(() => {
  // TODO: Fetch articles from API
  // articles.value = await $fetch('/api/articles')
})
</script>
