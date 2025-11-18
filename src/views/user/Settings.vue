<template>
  <div class="settings-page">
    <div class="settings-container">
      <header class="settings-header">
        <h1>账户设置</h1>
        <p>查看和管理您的账户信息</p>
      </header>

      <div v-if="loading" class="loading-container">
        <p>加载中...</p>
      </div>

      <div v-else-if="user" class="settings-content">
        <section class="info-section">
          <h2>基本信息</h2>
          <div class="info-grid">
            <div class="info-item">
              <label>用户名</label>
              <div class="info-value">{{ user.username || '未设置' }}</div>
            </div>

            <div class="info-item">
              <label>邮箱</label>
              <div class="info-value">{{ user.email || '未设置' }}</div>
            </div>

            <div class="info-item">
              <label>用户ID</label>
              <div class="info-value">{{ user.id || '未设置' }}</div>
            </div>

            <div class="info-item" v-if="user.motto">
              <label>个性签名</label>
              <div class="info-value">{{ user.motto }}</div>
            </div>

            <div class="info-item" v-if="user.created_at">
              <label>注册时间</label>
              <div class="info-value">{{ formatDate(user.created_at) }}</div>
            </div>
          </div>
        </section>

        <section class="avatar-section" v-if="user.avatar_url">
          <h2>头像</h2>
          <div class="avatar-container">
            <img :src="user.avatar_url" :alt="user.username" class="avatar-image" />
          </div>
        </section>

        <section class="stats-section" v-if="userStats">
          <h2>统计信息</h2>
          <div class="stats-grid">
            <div class="stat-item" v-if="userStats.submissions_count !== undefined">
              <div class="stat-value">{{ userStats.submissions_count || 0 }}</div>
              <div class="stat-label">提交次数</div>
            </div>
            <div class="stat-item" v-if="userStats.accepted_count !== undefined">
              <div class="stat-value">{{ userStats.accepted_count || 0 }}</div>
              <div class="stat-label">通过次数</div>
            </div>
            <div class="stat-item" v-if="userStats.rank !== undefined">
              <div class="stat-value">{{ userStats.rank || '-' }}</div>
              <div class="stat-label">排名</div>
            </div>
          </div>
        </section>
      </div>

      <div v-else class="error-container">
        <p>无法加载用户信息，请重新登录</p>
        <router-link to="/login" class="login-link">前往登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { fetchProfile } from '@/api/auth'
import { userStorage } from '@/utils/storage'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const userStats = ref(null)

const user = computed(() => authStore.user)

const formatDate = (dateString) => {
  if (!dateString) return '未知'
  try {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateString
  }
}

const loadUserProfile = async () => {
  if (!authStore.isLoggedIn) {
    router.push('/login')
    return
  }

  // 如果 store 中已有用户信息，直接使用
  if (authStore.user) {
    return
  }

  // 否则尝试从 API 获取最新用户信息
  loading.value = true
  try {
    const response = await fetchProfile()
    if (response && response.data) {
      // 更新 store 中的用户信息
      authStore.user = response.data
      // 同时更新本地存储
      userStorage.save(response.data)
    } else if (response) {
      // 如果返回的就是用户对象
      authStore.user = response
      userStorage.save(response)
    }
  } catch (err) {
    console.error('获取用户信息失败:', err)
    // 如果获取失败，可能是 token 过期，跳转到登录页
    if (err.status === 401) {
      authStore.logout()
      router.push('/login')
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (!authStore.user && !authStore.token) {
    authStore.initFromStorage()
  }
  loadUserProfile()
})
</script>

<style scoped>
.settings-page {
  min-height: calc(100vh - 60px);
  background: #f5f7fa;
  padding: 40px 20px;
}

.settings-container {
  max-width: 900px;
  margin: 0 auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.settings-header {
  padding: 32px 40px;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.settings-header h1 {
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.settings-header p {
  font-size: 14px;
  opacity: 0.9;
  margin: 0;
}

.loading-container,
.error-container {
  padding: 60px 40px;
  text-align: center;
  color: #6b7280;
}

.error-container .login-link {
  display: inline-block;
  margin-top: 16px;
  padding: 10px 24px;
  background: #2563eb;
  color: #fff;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  transition: background 0.2s;
}

.error-container .login-link:hover {
  background: #1d4ed8;
}

.settings-content {
  padding: 40px;
}

section {
  margin-bottom: 40px;
}

section:last-child {
  margin-bottom: 0;
}

section h2 {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 24px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #e5e7eb;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item label {
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 16px;
  color: #111827;
  font-weight: 500;
}

.avatar-section {
  margin-top: 32px;
}

.avatar-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.avatar-image {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #e5e7eb;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 24px;
}

.stat-item {
  text-align: center;
  padding: 24px;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #2563eb;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

@media (max-width: 768px) {
  .settings-header {
    padding: 24px 20px;
  }

  .settings-content {
    padding: 24px 20px;
  }

  .info-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>

