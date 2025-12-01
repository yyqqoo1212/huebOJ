<template>
  <div class="user-management">
    <div class="page-header">
      <h1>用户管理</h1>
      <p class="page-subtitle">管理系统所有用户信息</p>
    </div>
    <div class="management-header">
      <div class="header-actions">
        <input 
          v-model="searchQuery"
          type="text"
          placeholder="搜索用户名、邮箱、学号..."
          class="search-input"
        />
        <button class="btn-refresh" @click="fetchUsers">刷新</button>
      </div>
    </div>
    
    <div v-if="loading" class="loading-state">
      <p>加载中...</p>
    </div>
    
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button class="btn-retry" @click="fetchUsers">重试</button>
    </div>
    
    <div v-else class="user-table-container">
      <table class="user-table">
        <thead>
          <tr>
            <th>用户ID</th>
            <th>用户名</th>
            <th>邮箱</th>
            <th>学号</th>
            <th>真实姓名</th>
            <th>状态</th>
            <th>权限</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.username }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.student_id || '-' }}</td>
            <td>{{ user.real_name || '-' }}</td>
            <td>
              <span :class="['status-badge', `status-${user.status}`]">
                {{ getStatusText(user.status) }}
              </span>
            </td>
            <td>
              <span :class="['permission-badge', `permission-${user.permission}`]">
                {{ getPermissionText(user.permission) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div v-if="filteredUsers.length === 0" class="empty-state">
        <p>暂无用户数据</p>
      </div>
    </div>
  </div>
</template>

<script>
import { getUserList } from '@/api/user'

export default {
  name: 'UserManagement',
  data() {
    return {
      users: [],
      loading: false,
      error: null,
      searchQuery: ''
    }
  },
  computed: {
    filteredUsers() {
      if (!this.searchQuery.trim()) {
        return this.users
      }
      const query = this.searchQuery.toLowerCase()
      return this.users.filter(user => 
        user.username.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        (user.student_id && user.student_id.toLowerCase().includes(query))
      )
    }
  },
  mounted() {
    this.fetchUsers()
  },
  methods: {
    async fetchUsers() {
      this.loading = true
      this.error = null
      try {
        const response = await getUserList()
        if (response.code === 'success' && response.data) {
          this.users = response.data.users || []
        } else {
          this.error = response.message || '获取用户列表失败'
          this.users = []
        }
      } catch (err) {
        console.error('获取用户列表失败:', err)
        this.error = err.message || '获取用户列表失败，请稍后重试'
        this.users = []
      } finally {
        this.loading = false
      }
    },
    getStatusText(status) {
      const map = {
        'normal': '正常',
        'banned': '封禁'
      }
      return map[status] || status
    },
    getPermissionText(permission) {
      const perm = Number(permission) || 0
      const map = {
        0: '普通用户',
        1: '管理员',
        2: '超级管理员'
      }
      return map[perm] || `权限${perm}`
    }
  }
}
</script>

<style scoped>
.user-management {
  min-height: 400px;
}

.page-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e8e8e8;
}

.page-header h1 {
  font-size: 24px;
  color: #333333;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 14px;
  color: #666666;
  margin: 0;
}

.management-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-input {
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  width: 250px;
  outline: none;
  transition: all 0.3s ease;
}

.search-input:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.btn-refresh,
.btn-retry {
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background-color: #ffffff;
  color: #333333;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-refresh:hover,
.btn-retry:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 60px 20px;
  color: #666666;
}

.error-state {
  color: #ff4d4f;
}

.user-table-container {
  overflow-x: auto;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
  background-color: #ffffff;
}

.user-table thead {
  background-color: #fafafa;
}

.user-table th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  font-size: 14px;
  color: #333333;
  border-bottom: 2px solid #e8e8e8;
  white-space: nowrap;
}

.user-table td {
  padding: 12px 16px;
  font-size: 14px;
  color: #666666;
  border-bottom: 1px solid #f0f0f0;
}

.user-table tbody tr:hover {
  background-color: #f8f9fa;
}

.status-badge,
.permission-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-normal {
  background-color: #f6ffed;
  color: #52c41a;
}

.status-banned {
  background-color: #fff1f0;
  color: #ff4d4f;
}

.permission-0 {
  background-color: #f0f0f0;
  color: #666666;
}

.permission-1 {
  background-color: #e6f7ff;
  color: #1890ff;
}

.permission-2 {
  background-color: #fff7e6;
  color: #fa8c16;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999999;
}
</style>


