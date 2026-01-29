<template>
  <div id="app">
    <n-config-provider :theme="theme">
      <n-loading-bar-provider>
        <n-dialog-provider>
          <n-notification-provider>
            <n-message-provider>
              <n-layout>
                <n-layout-header v-if="isAuthenticated" bordered>
                  <AppHeader />
                </n-layout-header>
                
                <n-layout-content>
                  <router-view />
                </n-layout-content>
              </n-layout>
            </n-message-provider>
          </n-notification-provider>
        </n-dialog-provider>
      </n-loading-bar-provider>
    </n-config-provider>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { NConfigProvider, darkTheme, NLayout, NLayoutHeader, NLayoutContent, 
  NLoadingBarProvider, NDialogProvider, NNotificationProvider, NMessageProvider } from 'naive-ui'
import { useAuthStore } from '@/store/auth'
import AppHeader from '@/components/shared/AppHeader.vue'

const authStore = useAuthStore()

const theme = computed(() => {
  return authStore.isDarkMode ? darkTheme : null
})

const isAuthenticated = computed(() => authStore.isAuthenticated)

onMounted(() => {
  authStore.checkAuth()
})
</script>

<style>
#app {
  height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.n-layout {
  height: 100%;
}

.n-layout-content {
  padding: 16px;
  min-height: calc(100vh - 64px);
}

.n-layout-header {
  height: 64px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
}
</style>