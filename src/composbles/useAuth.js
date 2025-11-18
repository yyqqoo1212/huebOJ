import { storeToRefs } from 'pinia'
import { computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

export const useAuth = () => {
  const authStore = useAuthStore()
  const { isLoggedIn, username, userId, user, loading, error } = storeToRefs(authStore)

  onMounted(() => {
    if (!authStore.user && !authStore.token) {
      authStore.initFromStorage()
    }
  })

  const logout = () => authStore.logout()

  return {
    authStore,
    isLoggedIn,
    username,
    userId,
    user,
    loading,
    error,
    logout,
    token: computed(() => authStore.token)
  }
}
