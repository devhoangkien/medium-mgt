<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
// Global app setup
useHead({
  titleTemplate: (titleChunk) => {
    const appTitle = 'Medium Bot Manager'
    return titleChunk ? `${titleChunk} - ${appTitle}` : appTitle
  },
  meta: [
    { name: 'description', content: 'Manage and automate Medium posting across multiple accounts' }
  ]
})
</script>
