<template>
  <div class="auth-page">
    <section class="auth-card">
      <header class="auth-header">
        <h2>创建账号</h2>
        <p>填写以下信息即可加入 hueb Online Judge</p>
      </header>

      <form class="auth-form" @submit.prevent="handleSubmit">
        <div class="form-group" :class="{ error: errors.username }">
          <label for="username">用户名</label>
          <input
            id="username"
            v-model.trim="form.username"
            type="text"
            placeholder="3-50 个字符，支持字母/数字/下划线"
            maxlength="50"
            @blur="validateField('username')"
          />
          <small v-if="errors.username">{{ errors.username }}</small>
        </div>

        <div class="form-group" :class="{ error: errors.email }">
          <label for="email">邮箱</label>
          <input
            id="email"
            v-model.trim="form.email"
            type="email"
            placeholder="example@hust.edu.cn"
            @blur="validateField('email')"
          />
          <small v-if="errors.email">{{ errors.email }}</small>
        </div>

        <div class="form-group" :class="{ error: errors.password }">
          <label for="password">密码</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            placeholder="至少 6 位，建议包含大小写与数字"
            minlength="6"
            @blur="validateField('password')"
          />
          <small v-if="errors.password">{{ errors.password }}</small>
        </div>

        <div class="form-group optional">
          <label for="motto">个性签名（可选）</label>
          <input
            id="motto"
            v-model.trim="form.motto"
            type="text"
            placeholder="写一句话介绍你自己"
            maxlength="80"
          />
        </div>

        <div class="form-group optional">
          <label for="avatar">头像链接（可选）</label>
          <input
            id="avatar"
            v-model.trim="form.avatarUrl"
            type="url"
            placeholder="https://example.com/avatar.png"
          />
        </div>

        <p v-if="errors.general" class="form-error">{{ errors.general }}</p>

        <button class="submit-btn" type="submit" :disabled="!canSubmit">
          {{ isSubmitting ? '注册中...' : '立即注册' }}
        </button>

        <p class="switch-link">
          已有账号？
          <router-link to="/login">去登录</router-link>
        </p>
      </form>
    </section>
  </div>
</template>

<script setup>
import { reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { validateRegisterForm, validateUsername, validatePassword, validateEmail } from '@/utils/validator'

const router = useRouter()
const authStore = useAuthStore()

if (!authStore.user && !authStore.token) {
  authStore.initFromStorage()
}

const form = reactive({
  username: '',
  email: '',
  password: '',
  motto: '',
  avatarUrl: ''
})

const errors = reactive({
  username: '',
  email: '',
  password: '',
  general: ''
})

watch(
  () => [form.username, form.email, form.password],
  () => {
    errors.general = ''
  }
)

const isSubmitting = computed(() => authStore.loading)
const canSubmit = computed(() => {
  return (
    form.username &&
    form.email &&
    form.password &&
    !isSubmitting.value &&
    !errors.username &&
    !errors.email &&
    !errors.password
  )
})

const validators = {
  username: validateUsername,
  email: validateEmail,
  password: validatePassword
}

const validateField = (field) => {
  if (!validators[field]) return
  errors[field] = validators[field](form[field])
  if (errors[field]) {
    errors.general = errors[field]
  } else if (errors.general === errors[field]) {
    errors.general = ''
  }
}

const handleSubmit = async () => {
  const { isValid, errors: fieldErrors, message } = validateRegisterForm(form)
  errors.username = fieldErrors.username
  errors.email = fieldErrors.email
  errors.password = fieldErrors.password
  errors.general = message

  if (!isValid) {
    return
  }

  try {
    await authStore.handleRegister(form)
    router.push('/')
  } catch (err) {
    errors.general = err.message || '注册失败，请稍后再试'
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
  max-width: 520px;
  background: #fff;
  border-radius: 16px;
  padding: 36px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.auth-header h2 {
  font-size: 26px;
  margin-bottom: 8px;
  color: #111827;
}

.auth-header p {
  color: #6b7280;
  font-size: 14px;
}

.auth-form {
  margin-top: 28px;
  display: flex;
  flex-direction: column;
  gap: 18px;
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
  border-radius: 10px;
  padding: 12px 14px;
  font-size: 15px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
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

.form-group.optional label::after {
  content: '（可选）';
  font-weight: 400;
  color: #9ca3af;
  margin-left: 4px;
}

.form-error {
  color: #b91c1c;
  background: #fee2e2;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 14px;
}

.submit-btn {
  margin-top: 10px;
  width: 100%;
  border: none;
  border-radius: 12px;
  padding: 14px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.switch-link {
  text-align: center;
  font-size: 14px;
  color: #6b7280;
}

.switch-link a {
  color: #2563eb;
  text-decoration: none;
  font-weight: 600;
}

@media (max-width: 600px) {
  .auth-card {
    padding: 28px 22px;
  }
}
</style>