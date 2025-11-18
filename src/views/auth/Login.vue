<template>
  <div class="auth-page">
    <section class="auth-card">
      <header class="auth-header">
        <h2>欢迎回来</h2>
        <p>登录以继续使用 hueb Online Judge</p>
      </header>

      <form class="auth-form" @submit.prevent="handleSubmit">
        <div class="form-group" :class="{ error: errors.username }">
          <label for="username">用户名</label>
          <input
            id="username"
            v-model.trim="form.username"
            type="text"
            placeholder="请输入用户名"
            @blur="validateField('username')"
            autocomplete="username"
          />
          <small v-if="errors.username">{{ errors.username }}</small>
        </div>

        <div class="form-group" :class="{ error: errors.password }">
          <label for="password">密码</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            @blur="validateField('password')"
            autocomplete="current-password"
          />
          <small v-if="errors.password">{{ errors.password }}</small>
        </div>

        <div class="form-row">
          <label class="remember">
            <input type="checkbox" v-model="rememberMe" />
            7 天内保持登录
          </label>
          <button class="link-btn" type="button" @click="goRegister">
            没有账号？立即注册
          </button>
        </div>

        <p v-if="errors.general" class="form-error">{{ errors.general }}</p>

        <button class="submit-btn" type="submit" :disabled="!canSubmit">
          {{ isSubmitting ? '登录中...' : '立即登录' }}
        </button>
      </form>
    </section>
  </div>
</template>

<script setup>
import { reactive, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { validateLoginForm, validateUsername, validatePassword } from '@/utils/validator'
import { tokenStorage } from '@/utils/storage'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

if (!authStore.user && !authStore.token) {
  authStore.initFromStorage()
}

const nextUrl = computed(() => route.query.redirect || '/')

const form = reactive({
  username: '',
  password: ''
})

const errors = reactive({
  username: '',
  password: '',
  general: ''
})

watch(
  () => [form.username, form.password],
  () => {
    errors.general = ''
  }
)

const rememberMe = computed({
  get: () => {
    return localStorage.getItem('hueb_remember_me') === '1'
  },
  set: (value) => {
    localStorage.setItem('hueb_remember_me', value ? '1' : '0')
  }
})

const isSubmitting = computed(() => authStore.loading)
const canSubmit = computed(() => {
  return (
    form.username &&
    form.password &&
    !errors.username &&
    !errors.password &&
    !isSubmitting.value
  )
})

const validators = {
  username: validateUsername,
  password: validatePassword
}

const validateField = (field) => {
  if (!validators[field]) return
  errors[field] = validators[field](form[field])
  if (errors[field]) {
    errors.general = errors[field]
  }
}

const goRegister = () => {
  router.push({
    path: '/register',
    query: route.query.redirect ? { redirect: route.query.redirect } : undefined
  })
}

watch(
  () => authStore.error,
  (msg) => {
    if (msg) {
      errors.general = msg
    }
  }
)

const handleSubmit = async () => {
  const { isValid, errors: fieldErrors, message } = validateLoginForm(form)
  errors.username = fieldErrors.username
  errors.password = fieldErrors.password
  errors.general = message

  if (!isValid) return

  try {
    await authStore.handleLogin(form)
    if (!rememberMe.value) {
      const tokenData = tokenStorage.load()
      tokenStorage.save({
        token: tokenData.token,
        tokenType: tokenData.tokenType,
        expiresIn: 24 * 60 * 60
      })
    }
    router.replace(nextUrl.value)
  } catch (err) {
    errors.general = err.message || '登录失败，请稍后再试'
  }
}
</script>

<style scoped>
.auth-page {
  min-height: calc(100vh - 60px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  padding: 40px 20px;
}

.auth-card {
  width: 100%;
  max-width: 460px;
  background: #fff;
  border-radius: 18px;
  padding: 34px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.auth-header h2 {
  font-size: 26px;
  color: #111827;
}

.auth-header p {
  margin-top: 6px;
  color: #6b7280;
}

.auth-form {
  margin-top: 26px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  color: #1f2937;
  font-weight: 600;
}

.form-group input {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 15px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.form-group.error input {
  border-color: #ef4444;
}

.form-group small {
  font-size: 13px;
  color: #ef4444;
}

.form-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  color: #6b7280;
}

.remember {
  display: flex;
  align-items: center;
  gap: 8px;
}

.link-btn {
  border: none;
  background: none;
  color: #2563eb;
  cursor: pointer;
  font-weight: 600;
  padding: 0;
}

.form-error {
  color: #b91c1c;
  background: #fee2e2;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 14px;
}

.submit-btn {
  width: 100%;
  border: none;
  border-radius: 12px;
  padding: 14px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 560px) {
  .auth-card {
    padding: 28px 20px;
  }

  .form-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
