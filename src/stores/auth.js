import { defineStore } from 'pinia'
import { register, login } from '@/api/auth'
import { tokenStorage, userStorage } from '@/utils/storage'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: '',
    tokenType: 'Bearer',
    expiresAt: 0,
    loading: false,
    error: ''
  }),
  getters: {
    isLoggedIn: (state) => !!state.token && Date.now() < state.expiresAt,
    username: (state) => state.user?.username || '',
    userId: (state) => state.user?.id || ''
  },
  actions: {
    setAuth(payload) {
      this.user = payload.data || null
      this.token = payload.token || ''
      this.tokenType = payload.token_type || 'Bearer'
      this.expiresAt = payload.expires_in
        ? Date.now() + Number(payload.expires_in) * 1000
        : 0

      tokenStorage.save({
        token: this.token,
        tokenType: this.tokenType,
        expiresIn: payload.expires_in
      })
      userStorage.save(this.user)
    },
    clearAuth() {
      this.user = null
      this.token = ''
      this.tokenType = 'Bearer'
      this.expiresAt = 0
      tokenStorage.clear()
      userStorage.clear()
    },
    initFromStorage() {
      const storedToken = tokenStorage.load()
      const storedUser = userStorage.load()

      this.token = storedToken.token
      this.tokenType = storedToken.tokenType
      this.expiresAt = storedToken.expiresAt
      this.user = storedUser

      if (!this.isLoggedIn) {
        this.clearAuth()
      }
    },
    async handleRegister(form) {
      this.loading = true
      this.error = ''
      try {
        const response = await register(form)
        this.setAuth(response)
        return response
      } catch (err) {
        this.error = err.message || '注册失败'
        throw err
      } finally {
        this.loading = false
      }
    },
    async handleLogin(form) {
      this.loading = true
      this.error = ''
      try {
        const response = await login(form)
        this.setAuth(response)
        return response
      } catch (err) {
        this.error = err.message || '登录失败'
        throw err
      } finally {
        this.loading = false
      }
    },
    logout() {
      this.clearAuth()
    }
  }
})
