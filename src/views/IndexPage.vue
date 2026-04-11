<template>
  <LandingPage v-if="!userStore.isLoggedIn" />
  <MyPlan v-else />
</template>

<script setup>
import { onMounted } from 'vue'
import { useUserStore } from '../stores/userStore'
import LandingPage from './LandingPage.vue'
import MyPlan from './MyPlan.vue'

const userStore = useUserStore()

onMounted(async () => {
  if (userStore.isLoggedIn && !userStore.userProfile) {
    await userStore.login()
  }
})
</script>
