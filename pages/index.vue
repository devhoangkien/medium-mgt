<template>
  <div class="space-y-8">
    <!-- Hero Section -->
    <div class="text-center py-12">
      <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        Quản Lý & Tự Động Đăng Bài Medium
      </h1>
      <p class="text-xl text-gray-600 dark:text-gray-300 mb-8">
        Đăng bài lên nhiều Medium accounts cùng lúc. Tiết kiệm thời gian, tăng hiệu quả.
      </p>
      <div class="flex justify-center space-x-4">
        <NuxtLink 
          to="/dashboard" 
          class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          Vào Dashboard
        </NuxtLink>
        <NuxtLink 
          to="/accounts" 
          class="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          Quản Lý Accounts
        </NuxtLink>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0 bg-blue-500 rounded-md p-3">
            <span class="text-2xl">📊</span>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Accounts</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">0</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0 bg-green-500 rounded-md p-3">
            <span class="text-2xl">📝</span>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Articles</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">0</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0 bg-yellow-500 rounded-md p-3">
            <span class="text-2xl">⏰</span>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Scheduled</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">0</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0 bg-purple-500 rounded-md p-3">
            <span class="text-2xl">✅</span>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Published</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">0</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Features -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 py-12">
      <div class="text-center">
        <div class="text-4xl mb-4">🚀</div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Tự Động Đăng Bài
        </h3>
        <p class="text-gray-600 dark:text-gray-300">
          Lên lịch và tự động đăng bài lên nhiều Medium accounts cùng lúc
        </p>
      </div>

      <div class="text-center">
        <div class="text-4xl mb-4">📈</div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Theo Dõi Stats
        </h3>
        <p class="text-gray-600 dark:text-gray-300">
          Theo dõi views, reads, likes từ tất cả accounts trên một dashboard
        </p>
      </div>

      <div class="text-center">
        <div class="text-4xl mb-4">🔒</div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Bảo Mật & An Toàn
        </h3>
        <p class="text-gray-600 dark:text-gray-300">
          Sessions được mã hóa, rate limiting để tránh bị ban
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Home page - will fetch stats from API
definePageMeta({
  layout: 'default'
})
</script>
