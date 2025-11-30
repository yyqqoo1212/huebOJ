<template>
  <nav class="navbar">
    <div class="navbar-container">
      <div class="navbar-left">
        <router-link to="/">
          <img src="@/assets/images/hbjmdx.png" alt="Logo" class="logo" />
        </router-link>
        <router-link to="/" class="nav-item">首页</router-link>
        <router-link to="/problems" class="nav-item">题库</router-link>
        <router-link to="/courses" class="nav-item">课程</router-link>
        <router-link to="/contests" class="nav-item">比赛</router-link>
        <router-link to="/submissions" class="nav-item">提交记录</router-link>
        <router-link to="/ranking" class="nav-item">排行榜</router-link>
        <router-link to="/discussions" class="nav-item">讨论区</router-link>
      </div>

      <div class="navbar-right">
        <template v-if="isLoggedIn">
          <div class="user-menu" ref="userMenuRef">
            <div class="avatar-link">
              <img
                v-if="user?.avatar_url"
                :src="user.avatar_url"
                :alt="username"
                class="avatar-img"
              />
              <div v-else class="avatar-placeholder">
                {{ username?.charAt(0)?.toUpperCase() || 'U' }}
              </div>
            </div>
            <div class="user-trigger" @click="toggleDropdown">
              <span class="username-text">{{ username }}</span>
              <span class="dropdown-arrow" :class="{ open: showDropdown }">▼</span>
            </div>
            <transition name="dropdown">
              <div v-if="showDropdown" class="dropdown-menu">
                <router-link to="/settings" class="dropdown-item" @click="closeDropdown">
                  <span class="dropdown-icon"></span>
                  <span>账户管理</span>
                </router-link>
                <a 
                  v-if="isAdmin" 
                  @click.prevent="handleAdminClick" 
                  class="dropdown-item admin-item"
                  href="#"
                >
                  <span class="dropdown-icon"></span>
                  <span>后台管理</span>
                </a>
                <div class="dropdown-divider"></div>
                <a @click.prevent="handleLogout" class="dropdown-item logout-item" href="#">
                  <span class="dropdown-icon"></span>
                  <span>退出登录</span>
                </a>
              </div>
            </transition>
          </div>
        </template>
        <template v-else>
          <router-link to="/login" class="nav-item">登录</router-link>
          <router-link to="/register" class="register-btn">注册</router-link>
        </template>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed, onMounted, ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composbles/useAuth'

const router = useRouter()
const { isLoggedIn, username, user, logout, authStore} = useAuth()

const showDropdown = ref(false)
const userMenuRef = ref(null)

// 确保从存储中初始化用户信息
onMounted(() => {
  if (!authStore.user && !authStore.token) {
    authStore.initFromStorage()
  }
  
  // 点击外部区域关闭下拉菜单
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// 检查是否是管理员（permission === 2）
const isAdmin = computed(() => {
  const userValue = user.value
  if (!userValue) return false
  // 检查 permission 字段（可能是数字或字符串）
  const permission = userValue.permission
  return permission === 2 || permission === '2'
})

// 切换下拉菜单
const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

// 关闭下拉菜单
const closeDropdown = () => {
  showDropdown.value = false
}

// 点击外部区域关闭菜单
const handleClickOutside = (event) => {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target)) {
    showDropdown.value = false
  }
}

// 处理后台管理点击
const handleAdminClick = () => {
  closeDropdown()
  const adminUrl = router.resolve({ name: 'Admin' }).href
  window.open(adminUrl, '_blank')
}

// 处理退出登录
const handleLogout = () => {
  closeDropdown()
  logout()
  router.push('/login')
}
</script>

<style scoped>
.navbar {
  background-color: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  padding: 0;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.navbar-container {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 60px;
}

.register-btn {
  background-color: #1890ff;
  color: #ffffff;
  padding: 8px 20px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
  margin-left: 12px;
}


.navbar-left {
  display: flex;
  align-items: center;
  gap: 30px;
}

.logout-btn {
  background-color: #ffffff;
  color: #333333;
  border: 1px solid #d9d9d9;
  padding: 8px 20px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-left: 12px;
}

.logo {
  height: 40px;
  width: auto;
  margin-right: 10px;
  cursor: pointer;
  transition: opacity 0.3s ease;
}

.logo:hover {
  opacity: 0.8;
}

.nav-item {
  color: #333333;
  text-decoration: none;
  font-size: 20px;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.nav-item:hover {
  color: #1890ff;
  background-color: #f0f0f0;
}

.nav-item.router-link-active {
  color: #1890ff;
  background-color: #e6f7ff;
}

.admin-btn {
  color: #ff4d4f;
  font-weight: 600;
}

.admin-btn:hover {
  color: #ff7875;
  background-color: #fff1f0;
}

.admin-btn.router-link-active {
  color: #ff4d4f;
  background-color: #fff1f0;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-menu {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-trigger {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.user-trigger:hover {
  background-color: #f0f0f0;
}

.username-text {
  font-size: 16px;
  font-weight: 500;
  color: #333333;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-arrow {
  font-size: 10px;
  color: #666666;
  transition: transform 0.3s ease;
}

.dropdown-arrow.open {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 150px;
  padding: 4px 0;
  z-index: 1000;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 8px;
  color: #333333;
  text-decoration: none;
  font-size: 16px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.dropdown-item:hover {
  background-color: #f5f5f5;
  color: #1890ff;
}

.dropdown-item.admin-item {
  color: #ff4d4f;
}

.dropdown-item.admin-item:hover {
  background-color: #fff1f0;
  color: #ff7875;
}

.dropdown-item.logout-item {
  color: #ff4d4f;
}

.dropdown-item.logout-item:hover {
  background-color: #fff1f0;
  color: #ff7875;
}

.dropdown-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.dropdown-divider {
  height: 1px;
  background-color: #e8e8e8;
  margin: 4px 0;
}

/* 下拉菜单过渡动画 */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
  transform-origin: top right;
}

.dropdown-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
}

.dropdown-enter-to {
  opacity: 1;
  transform: scale(1) translateY(0);
}

.dropdown-leave-from {
  opacity: 1;
  transform: scale(1) translateY(0);
}

.dropdown-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
}

.avatar-link {
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  cursor: default;
  pointer-events: none;
  transition: all 0.3s ease;
}

.avatar-img {
  width: 45px;
  height: 45px;
  border-radius: 60%;
  object-fit: cover;
  border: 2px solid #e0e0e0;
  transition: all 0.3s ease;
}

.avatar-link:hover .avatar-img {
  border-color: #1890ff;
  transform: scale(1.05);
}

.avatar-placeholder {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1890ff, #40a9ff);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  border: 2px solid #e0e0e0;
  transition: all 0.3s ease;
}

.avatar-link:hover .avatar-placeholder {
  border-color: #1890ff;
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
}

.account-btn:hover {
  background-color: #40a9ff;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
}

.account-btn:active {
  transform: translateY(0);
}
</style>
