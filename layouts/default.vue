<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <header class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <NuxtLink to="/" class="flex items-center space-x-2">
              <span class="text-2xl">📝</span>
              <span class="text-xl font-bold text-gray-900 dark:text-white">Medium Bot Manager</span>
            </NuxtLink>
          </div>
          
          <nav class="flex items-center space-x-4">
            <NuxtLink to="/dashboard" class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium">
              Dashboard
            </NuxtLink>
            <NuxtLink to="/accounts" class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium">
              Accounts
            </NuxtLink>
            <NuxtLink to="/articles" class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium">
              Articles
            </NuxtLink>
            <NuxtLink to="/schedule" class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium">
              Schedule
            </NuxtLink>
            <NuxtLink to="/crawl" class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium">
              🕷️ Crawl
            </NuxtLink>
            <NuxtLink to="/settings" class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium">
              Settings
            </NuxtLink>
          </nav>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <p class="text-center text-sm text-gray-500 dark:text-gray-400">
          © {{ new Date().getFullYear() }} Medium Bot Manager. Built with Nuxt 4 + Prisma.
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
// Layout setup
</script>
