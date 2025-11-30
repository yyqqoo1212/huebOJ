import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

export const useAuth = () => {
  const authStore = useAuthStore()
  const { isLoggedIn, username, userId, user, loading, error } = storeToRefs(authStore)

  // 确保从存储中初始化用户信息（不只在 onMounted 时）
  if (!authStore.user && !authStore.token) {
    authStore.initFromStorage()
  }

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
