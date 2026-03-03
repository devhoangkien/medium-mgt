<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b">
      <div class="max-w-7xl mx-auto px-4 py-6">
        <h1 class="text-2xl font-bold text-gray-900">🕷️ Web Crawler</h1>
        <p class="text-gray-600 mt-1">Crawl articles từ websites và rewrite với OpenClaw</p>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-white p-4 rounded-lg shadow">
          <div class="text-sm text-gray-600">Total Jobs</div>
          <div class="text-2xl font-bold">{{ totalJobs }}</div>
        </div>
        <div class="bg-white p-4 rounded-lg shadow">
          <div class="text-sm text-gray-600">Completed</div>
          <div class="text-2xl font-bold text-green-600">{{ completedJobs }}</div>
        </div>
        <div class="bg-white p-4 rounded-lg shadow">
          <div class="text-sm text-gray-600">Running</div>
          <div class="text-2xl font-bold text-blue-600">{{ runningJobs }}</div>
        </div>
        <div class="bg-white p-4 rounded-lg shadow">
          <div class="text-sm text-gray-600">Failed</div>
          <div class="text-2xl font-bold text-red-600">{{ failedJobs }}</div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left: Add Source & Quick Crawl -->
        <div class="lg:col-span-1 space-y-6">
          <!-- Quick Crawl -->
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold mb-4">⚡ Quick Crawl</h2>
            <form @submit.prevent="quickCrawl" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">URL</label>
                <input
                  v-model="quickUrl"
                  type="url"
                  placeholder="https://juejin.cn/post/..."
                  class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Rewrite Style</label>
                <select v-model="rewriteStyle" class="w-full px-3 py-2 border rounded-lg">
                  <option value="blog">Blog Post</option>
                  <option value="tutorial">Tutorial</option>
                  <option value="news">News Article</option>
                  <option value="opinion">Opinion Piece</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Language</label>
                <select v-model="rewriteLanguage" class="w-full px-3 py-2 border rounded-lg">
                  <option value="zh">Chinese (中文)</option>
                  <option value="en">English</option>
                  <option value="vi">Vietnamese (Tiếng Việt)</option>
                </select>
              </div>

              <div class="flex items-center">
                <input
                  v-model="enableRewrite"
                  type="checkbox"
                  id="rewrite"
                  class="w-4 h-4 text-blue-600 rounded"
                />
                <label for="rewrite" class="ml-2 text-sm text-gray-700">
                  Rewrite với OpenClaw
                </label>
              </div>

              <div class="flex items-center">
                <input
                  v-model="enableAutoPost"
                  type="checkbox"
                  id="autopost"
                  class="w-4 h-4 text-green-600 rounded"
                  :disabled="!enableRewrite"
                />
                <label for="autopost" class="ml-2 text-sm text-gray-700">
                  📤 Auto-post lên Medium
                </label>
              </div>

              <div v-if="enableAutoPost" class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">Medium Account</label>
                <select v-model="selectedMediumAccount" class="w-full px-3 py-2 border rounded-lg">
                  <option value="">-- Chọn tài khoản --</option>
                  <option v-for="acc in mediumAccounts" :key="acc.id" :value="acc.id">
                    {{ acc.accountName }} ({{ acc.mediumUsername || 'No username' }})
                  </option>
                </select>
                <p class="text-xs text-orange-600">
                  ⚠️ Chỉ dùng cho testing! Auto-post có thể vi phạm Medium TOS.
                </p>
              </div>

              <button
                type="submit"
                :disabled="loading"
                class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {{ loading ? 'Đang xử lý...' : enableAutoPost ? '🚀 Crawl + Auto-Post' : '🚀 Crawl Ngay' }}
              </button>
            </form>
          </div>

          <!-- Add Source -->
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold mb-4">📚 Add Crawl Source</h2>
            <form @submit.prevent="addSource" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  v-model="newSource.name"
                  type="text"
                  placeholder="Juejin Daily"
                  class="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Base URL</label>
                <input
                  v-model="newSource.url"
                  type="url"
                  placeholder="https://juejin.cn/"
                  class="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  CSS Selector (optional)
                </label>
                <input
                  v-model="newSource.selector"
                  type="text"
                  placeholder=".article-content"
                  class="w-full px-3 py-2 border rounded-lg"
                />
                <p class="text-xs text-gray-500 mt-1">Để trống để auto-detect</p>
              </div>

              <button
                type="submit"
                class="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
              >
                ➕ Add Source
              </button>
            </form>
          </div>

          <!-- Sources List -->
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold mb-4">💾 Saved Sources</h2>
            <div v-if="sources.length === 0" class="text-gray-500 text-sm">
              Chưa có source nào
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="source in sources"
                :key="source.id"
                class="border rounded-lg p-3 hover:bg-gray-50"
              >
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <div class="font-medium">{{ source.name }}</div>
                    <div class="text-xs text-gray-500 truncate">{{ source.url }}</div>
                    <div class="text-xs text-gray-400 mt-1">
                      {{ source._count?.crawlJobs || 0 }} jobs
                    </div>
                  </div>
                  <button
                    @click="crawlSource(source.id)"
                    class="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    ▶️
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Jobs List -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-lg shadow">
            <div class="p-6 border-b flex justify-between items-center">
              <h2 class="text-lg font-semibold">📋 Crawl Jobs</h2>
              <button
                @click="loadJobs"
                class="text-sm text-blue-600 hover:text-blue-800"
              >
                🔄 Refresh
              </button>
            </div>

            <div class="divide-y max-h-[600px] overflow-y-auto">
              <div
                v-for="job in jobs"
                :key="job.id"
                class="p-4 hover:bg-gray-50"
              >
                <div class="flex justify-between items-start mb-2">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                      <span
                        :class="{
                          'bg-green-100 text-green-800': job.status === 'COMPLETED',
                          'bg-blue-100 text-blue-800': job.status === 'RUNNING',
                          'bg-yellow-100 text-yellow-800': job.status === 'PENDING',
                          'bg-red-100 text-red-800': job.status === 'FAILED'
                        }"
                        class="px-2 py-0.5 rounded text-xs font-medium"
                      >
                        {{ job.status }}
                      </span>
                      <span class="text-xs text-gray-500">
                        {{ new Date(job.createdAt).toLocaleString() }}
                      </span>
                    </div>
                    <div class="font-medium text-sm truncate">{{ job.url }}</div>
                    <div class="text-xs text-gray-500">
                      Source: {{ job.source?.name || 'Manual' }}
                    </div>
                  </div>
                  <button
                    @click="viewJob(job.id)"
                    class="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    View →
                  </button>
                </div>

                <!-- Progress bar for running jobs -->
                <div v-if="job.status === 'RUNNING'" class="mt-2">
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div
                      class="bg-blue-600 h-2 rounded-full transition-all"
                      :style="{ width: `${job.progress || 50}%` }"
                    ></div>
                  </div>
                </div>

                <!-- Rewritten badge -->
                <div v-if="job.rewrittenContent" class="mt-2">
                  <span class="inline-flex items-center px-2 py-1 rounded text-xs bg-purple-100 text-purple-800">
                    ✨ Rewritten by OpenClaw
                  </span>
                </div>
              </div>

              <div v-if="jobs.length === 0" class="p-8 text-center text-gray-500">
                Chưa có job nào. Crawl bài viết đầu tiên ngay!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Job Detail Modal -->
    <div
      v-if="selectedJob"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @click.self="selectedJob = null"
    >
      <div class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
          <h3 class="text-lg font-semibold">Job Details</h3>
          <button @click="selectedJob = null" class="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        
        <div class="p-6 space-y-6">
          <!-- Status -->
          <div class="flex items-center gap-3">
            <span
              :class="{
                'bg-green-100 text-green-800': selectedJob.status === 'COMPLETED',
                'bg-blue-100 text-blue-800': selectedJob.status === 'RUNNING',
                'bg-red-100 text-red-800': selectedJob.status === 'FAILED'
              }"
              class="px-3 py-1 rounded-full text-sm font-medium"
            >
              {{ selectedJob.status }}
            </span>
            <span v-if="selectedJob.duration" class="text-sm text-gray-500">
              Duration: {{ selectedJob.duration }}s
            </span>
          </div>

          <!-- URL -->
          <div>
            <div class="text-sm text-gray-600 mb-1">URL</div>
            <a :href="selectedJob.url" target="_blank" class="text-blue-600 hover:underline">
              {{ selectedJob.url }}
            </a>
          </div>

          <!-- Raw Content -->
          <div v-if="selectedJob.rawContent">
            <div class="text-sm text-gray-600 mb-1">Raw Content</div>
            <div class="bg-gray-50 p-4 rounded-lg text-sm max-h-40 overflow-y-auto">
              {{ selectedJob.rawContent.slice(0, 500) }}{{ selectedJob.rawContent.length > 500 ? '...' : '' }}
            </div>
          </div>

          <!-- Rewritten Content -->
          <div v-if="selectedJob.rewrittenContent" class="border-t pt-6">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-lg">✨</span>
              <div class="text-sm text-gray-600">Rewritten by OpenClaw</div>
            </div>
            <div class="bg-purple-50 p-4 rounded-lg">
              <div v-if="selectedJob.openclawResponse" class="mb-4">
                <div class="font-semibold text-lg mb-2">
                  {{ selectedJob.openclawResponse.title }}
                </div>
                <div class="text-sm text-gray-600 mb-2">
                  {{ selectedJob.openclawResponse.summary }}
                </div>
                <div class="flex gap-2">
                  <span
                    v-for="tag in selectedJob.openclawResponse.tags"
                    :key="tag"
                    class="px-2 py-1 bg-purple-200 text-purple-800 rounded text-xs"
                  >
                    #{{ tag }}
                  </span>
                </div>
              </div>
              <div class="mt-4 text-sm whitespace-pre-wrap max-h-60 overflow-y-auto">
                {{ selectedJob.rewrittenContent }}
              </div>
            </div>
            
            <div class="mt-4 flex gap-3">
              <button
                @click="copyContent(selectedJob.rewrittenContent)"
                class="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm"
              >
                📋 Copy
              </button>
              <button
                @click="createArticle(selectedJob)"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                📝 Create Article
              </button>
            </div>
          </div>

          <!-- Error -->
          <div v-if="selectedJob.error" class="border-t pt-6">
            <div class="text-sm text-red-600 mb-1">❌ Error</div>
            <div class="bg-red-50 p-4 rounded-lg text-sm text-red-800">
              {{ selectedJob.error }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const loading = ref(false)
const quickUrl = ref('')
const enableRewrite = ref(true)
const rewriteStyle = ref('blog')
const rewriteLanguage = ref('zh')
const enableAutoPost = ref(false)
const selectedMediumAccount = ref('')
const mediumAccounts = ref([])
const sources = ref([])
const jobs = ref([])
const selectedJob = ref(null)

const newSource = ref({
  name: '',
  url: '',
  selector: ''
})

// Computed stats
const totalJobs = computed(() => jobs.value.length)
const completedJobs = computed(() => jobs.value.filter(j => j.status === 'COMPLETED').length)
const runningJobs = computed(() => jobs.value.filter(j => j.status === 'RUNNING').length)
const failedJobs = computed(() => jobs.value.filter(j => j.status === 'FAILED').length)

// Load data
async function loadSources() {
  try {
    const res = await fetch('/api/crawl-sources')
    const data = await res.json()
    sources.value = data.data || []
  } catch (err) {
    console.error('Failed to load sources:', err)
  }
}

async function loadJobs() {
  try {
    const res = await fetch('/api/crawl-jobs')
    const data = await res.json()
    jobs.value = data.data || []
  } catch (err) {
    console.error('Failed to load jobs:', err)
  }
}

// Actions
async function quickCrawl() {
  if (!quickUrl.value) return
  
  if (enableAutoPost.value && !selectedMediumAccount.value) {
    alert('⚠️ Please select a Medium account for auto-post!')
    return
  }
  
  loading.value = true
  try {
    const endpoint = enableAutoPost.value ? '/api/crawl-auto' : '/api/crawl'
    
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: quickUrl.value,
        rewrite: enableRewrite.value,
        rewriteStyle: rewriteStyle.value,
        rewriteLanguage: rewriteLanguage.value,
        autoPost: enableAutoPost.value,
        mediumAccountId: selectedMediumAccount.value || null
      })
    })
    
    const data = await res.json()
    
    if (data.success) {
      alert(enableAutoPost.value 
        ? '✅ Crawl + Auto-post started! Check progress below.' 
        : '✅ Crawl job started! Check the list below.')
      quickUrl.value = ''
      setTimeout(loadJobs, 2000)
    } else {
      alert('❌ Error: ' + data.message)
    }
  } catch (err) {
    alert('❌ Failed: ' + err.message)
  } finally {
    loading.value = false
  }
}

async function loadMediumAccounts() {
  try {
    const res = await fetch('/api/accounts')
    const data = await res.json()
    mediumAccounts.value = data.data || []
    
    // Select first account if available
    if (mediumAccounts.value.length > 0) {
      selectedMediumAccount.value = mediumAccounts.value[0].id
    }
  } catch (err) {
    console.error('Failed to load Medium accounts:', err)
  }
}

async function addSource() {
  try {
    const res = await fetch('/api/crawl-sources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSource.value)
    })
    
    const data = await res.json()
    
    if (data.success) {
      alert('✅ Source added!')
      newSource.value = { name: '', url: '', selector: '' }
      loadSources()
    } else {
      alert('❌ Error: ' + data.message)
    }
  } catch (err) {
    alert('❌ Failed to add source: ' + err.message)
  }
}

async function crawlSource(sourceId) {
  try {
    const res = await fetch('/api/crawl', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourceId })
    })
    
    const data = await res.json()
    
    if (data.success) {
      alert('✅ Crawl started for this source!')
      setTimeout(loadJobs, 2000)
    } else {
      alert('❌ Error: ' + data.message)
    }
  } catch (err) {
    alert('❌ Failed: ' + err.message)
  }
}

async function viewJob(jobId) {
  try {
    const res = await fetch(`/api/crawl/${jobId}`)
    const data = await res.json()
    
    if (data.success) {
      selectedJob.value = data.data
    }
  } catch (err) {
    console.error('Failed to load job:', err)
  }
}

function copyContent(content) {
  navigator.clipboard.writeText(content)
  alert('✅ Copied to clipboard!')
}

function createArticle(job) {
  // Navigate to articles page with pre-filled data
  const params = new URLSearchParams({
    title: job.openclawResponse?.title || 'New Article',
    content: job.rewrittenContent,
    sourceUrl: job.url
  })
  navigateTo(`/articles?${params.toString()}`)
}

// Auto-refresh running jobs
onMounted(() => {
  loadSources()
  loadJobs()
  loadMediumAccounts()
  
  // Refresh every 10 seconds if there are running jobs
  const interval = setInterval(() => {
    if (jobs.value.some(j => j.status === 'RUNNING')) {
      loadJobs()
    }
  }, 10000)
  
  onUnmounted(() => clearInterval(interval))
})
</script>
