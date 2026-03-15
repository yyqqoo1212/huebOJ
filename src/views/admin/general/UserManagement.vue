<template>
  <div class="user-management">
    <div class="page-header">
      <h1>用户管理</h1>
      <p class="page-subtitle">管理系统所有用户信息</p>
    </div>
    <div class="management-header">
      <input 
        v-model="searchQuery"
        type="text"
        placeholder="搜索用户名、邮箱、学号..."
        class="search-input"
        @input="handleSearch"
      />
      <div class="header-actions">
        <button 
          class="btn-batch-delete" 
          :class="{ 'active': batchDeleteMode }"
          @click="toggleBatchDeleteMode"
          :disabled="loading"
        >
          {{ batchDeleteMode ? '取消批量删除' : '批量删除' }}
        </button>
        <button class="btn-refresh" @click="handleRefresh" :disabled="loading">
          {{ loading ? '刷新中...' : '刷新' }}
        </button>
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
            <th v-if="batchDeleteMode" style="width: 50px; text-align: center;">
              <input 
                type="checkbox" 
                :checked="isAllSelected"
                @change="toggleSelectAll"
                class="checkbox-select-all"
              />
            </th>
            <th>用户ID</th>
            <th>用户名</th>
            <th>邮箱</th>
            <th>学号</th>
            <th>真实姓名</th>
            <th>状态</th>
            <th>权限</th>
            <th style="text-align: center;">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="users.length === 0">
            <td :colspan="batchDeleteMode ? 9 : 8" class="empty-text">暂无用户数据</td>
          </tr>
          <tr v-for="user in users" :key="user.id">
            <td v-if="batchDeleteMode" style="text-align: center;">
              <input 
                type="checkbox" 
                :value="user.id"
                v-model="selectedUsers"
                class="checkbox-item"
              />
            </td>
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
            <td class="actions-cell">
              <button 
                class="icon-btn icon-edit" 
                title="编辑用户"
                @click="openEditModal(user)"
              >
                ✏️
              </button>
              <button
                class="icon-btn icon-delete"
                title="删除用户"
                :disabled="deleteLoading && deleteTarget && deleteTarget.id === user.id"
                @click="openDeleteModal(user)"
              >
                🗑️
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 批量删除操作栏 -->
      <div v-if="batchDeleteMode && selectedUsers.length > 0" class="batch-actions-bar">
        <span class="batch-info">已选中 {{ selectedUsers.length }} 个用户</span>
        <button class="btn-batch-delete-confirm" @click="openBatchDeleteModal">
          删除选中用户
        </button>
      </div>

      <!-- 翻页器 -->
      <div v-if="!loading && pagination.total_pages > 0" class="pagination-container">
        <div class="pagination-info">
          <span>共 {{ pagination.total }} 个用户</span>
          <span class="page-info">第 {{ pagination.page }} / {{ pagination.total_pages }} 页</span>
        </div>
        <div class="pagination">
          <button 
            class="pagination-btn"
            :disabled="!pagination.has_previous || loading"
            @click="changePage(pagination.page - 1)"
          >
            上一页
          </button>
          
          <div class="pagination-pages">
            <button
              v-for="page in getPageNumbers()"
              :key="page"
              :class="['pagination-page-btn', { active: page === pagination.page, ellipsis: page === '...' }]"
              :disabled="page === '...' || loading"
              @click="page !== '...' && changePage(page)"
            >
              {{ page }}
            </button>
          </div>
          
          <button 
            class="pagination-btn"
            :disabled="!pagination.has_next || loading"
            @click="changePage(pagination.page + 1)"
          >
            下一页
          </button>
        </div>
        <div class="page-size-selector">
          <span>每页显示：</span>
          <select 
            :value="pagination.page_size" 
            @change="handlePageSizeChange(Number($event.target.value))"
            :disabled="loading"
            class="page-size-select"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 批量删除确认弹窗 -->
    <ConfirmDialog
      :visible="showBatchDeleteModal"
      title="确认批量删除用户？"
      message="删除后将移除选中用户的所有信息及相关数据，且无法恢复。"
      :detail="`将删除 ${selectedUsers.length} 个用户：`"
      confirm-text="确认删除"
      cancel-text="再想想"
      :loading="batchDeleteLoading"
      loading-text="正在删除..."
      @confirm="confirmBatchDelete"
      @cancel="closeBatchDeleteModal"
      @update:visible="showBatchDeleteModal = $event"
    >
      <template #content>
        <div class="batch-delete-list">
          <div 
            v-for="userId in selectedUsers" 
            :key="userId"
            class="batch-delete-item"
          >
            {{ getUserById(userId)?.id }} - {{ getUserById(userId)?.username }}
          </div>
        </div>
      </template>
    </ConfirmDialog>

    <!-- 单个删除确认弹窗 -->
    <ConfirmDialog
      :visible="showDeleteModal"
      title="确认删除用户？"
      message="删除后将移除该用户的所有信息及相关数据，且无法恢复。"
      :detail="deleteTarget ? `将删除：${deleteTarget.id} - ${deleteTarget.username}` : ''"
      confirm-text="确认删除"
      cancel-text="再想想"
      :loading="deleteLoading"
      loading-text="正在删除..."
      @confirm="confirmDelete"
      @cancel="closeDeleteModal"
      @update:visible="showDeleteModal = $event"
    />

    <!-- 编辑用户弹窗 -->
    <transition name="fade">
      <div
        v-if="showEditModal"
        class="modal-overlay"
        @click.self="closeEditModal"
      >
        <div class="modal-card edit-modal-card">
          <h3>编辑用户信息</h3>
          <div class="edit-form">
            <div class="form-row">
              <div class="form-group">
                <label>用户ID</label>
                <input type="text" :value="editForm.id" disabled class="form-input" />
              </div>
              <div class="form-group">
                <label>用户名 <span class="required">*</span></label>
                <input 
                  type="text" 
                  v-model="editForm.username" 
                  class="form-input"
                  placeholder="请输入用户名"
                />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>邮箱 <span class="required">*</span></label>
                <input 
                  type="email" 
                  v-model="editForm.email" 
                  class="form-input"
                  placeholder="请输入邮箱"
                />
              </div>
              <div class="form-group">
                <label>性别</label>
                <select v-model="editForm.gender" class="form-input">
                  <option value="M">男</option>
                  <option value="F">女</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>学号</label>
                <input 
                  type="text" 
                  v-model="editForm.student_id" 
                  class="form-input"
                  placeholder="请输入学号"
                />
              </div>
              <div class="form-group">
                <label>班级</label>
                <input 
                  type="text" 
                  v-model="editForm.class_name" 
                  class="form-input"
                  placeholder="请输入班级"
                />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>真实姓名</label>
                <input 
                  type="text" 
                  v-model="editForm.real_name" 
                  class="form-input"
                  placeholder="请输入真实姓名"
                />
              </div>
              <div class="form-group">
                <label>状态</label>
                <select v-model="editForm.status" class="form-input">
                  <option value="normal">正常</option>
                  <option value="banned">封禁</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>权限</label>
                <select v-model.number="editForm.permission" class="form-input">
                  <option :value="0">普通用户</option>
                  <option :value="1">管理员</option>
                  <option :value="2">超级管理员</option>
                </select>
              </div>
              <div class="form-group">
                <label>密码</label>
                <div class="password-reset-section">
                  <input 
                    type="password" 
                    value="********" 
                    disabled 
                    class="form-input password-disabled"
                  />
                  <button 
                    class="btn-reset-password"
                    @click="openResetPasswordModal"
                    :disabled="editLoading"
                  >
                    重置密码
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-actions">
            <button
              class="modal-cancel"
              @click="closeEditModal"
              :disabled="editLoading"
            >
              取消
            </button>
            <button
              class="modal-confirm"
              @click="confirmEdit"
              :disabled="editLoading"
            >
              {{ editLoading ? '保存中...' : '保存' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- 重置密码弹窗 -->
    <transition name="fade">
      <div
        v-if="showResetPasswordModal"
        class="modal-overlay"
        @click.self="closeResetPasswordModal"
      >
        <div class="modal-card">
          <h3>重置用户密码</h3>
          <p>请输入新密码（至少6位）</p>
          <div class="form-group">
            <label>新密码 <span class="required">*</span></label>
            <input 
              type="password" 
              v-model="resetPasswordForm.newPassword" 
              class="form-input"
              placeholder="请输入新密码"
              @keyup.enter="confirmResetPassword"
            />
          </div>
          <div class="form-group">
            <label>确认密码 <span class="required">*</span></label>
            <input 
              type="password" 
              v-model="resetPasswordForm.confirmPassword" 
              class="form-input"
              placeholder="请再次输入新密码"
              @keyup.enter="confirmResetPassword"
            />
          </div>
          <div class="modal-actions">
            <button
              class="modal-cancel"
              @click="closeResetPasswordModal"
              :disabled="resetPasswordLoading"
            >
              取消
            </button>
            <button
              class="modal-confirm"
              @click="confirmResetPassword"
              :disabled="resetPasswordLoading"
            >
              {{ resetPasswordLoading ? '重置中...' : '确认重置' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- 反馈提示弹窗 -->
    <transition name="fade">
      <div v-if="feedbackVisible" class="center-feedback" :class="`center-feedback-${feedbackType}`">
        {{ feedbackMessage }}
      </div>
    </transition>
  </div>
</template>

<script>
import { getUserList, deleteUser, updateUser, resetUserPassword } from '@/api/user'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

export default {
  name: 'UserManagement',
  components: {
    ConfirmDialog
  },
  data() {
    return {
      users: [],
      loading: false,
      error: null,
      searchQuery: '',
      searchTimer: null,
      pagination: {
        page: 1,
        page_size: 20,
        total: 0,
        total_pages: 0,
        has_next: false,
        has_previous: false
      },
      batchDeleteMode: false,
      selectedUsers: [],
      showBatchDeleteModal: false,
      batchDeleteLoading: false,
      showDeleteModal: false,
      deleteTarget: null,
      deleteLoading: false,
      showEditModal: false,
      editForm: {
        id: null,
        username: '',
        email: '',
        gender: '',
        student_id: '',
        class_name: '',
        real_name: '',
        status: 'normal',
        permission: 0
      },
      editLoading: false,
      showResetPasswordModal: false,
      resetPasswordForm: {
        newPassword: '',
        confirmPassword: ''
      },
      resetPasswordLoading: false,
      feedbackVisible: false,
      feedbackMessage: '',
      feedbackType: 'success'
    }
  },
  computed: {
    isAllSelected() {
      return this.users.length > 0 && 
             this.selectedUsers.length === this.users.length &&
             this.users.every(u => this.selectedUsers.includes(u.id))
    }
  },
  mounted() {
    this.fetchUsers()
  },
  watch: {
    searchQuery() {
      this.debounceSearch()
    }
  },
  methods: {
    debounceSearch() {
      if (this.searchTimer) {
        clearTimeout(this.searchTimer)
      }
      this.searchTimer = setTimeout(() => {
        this.pagination.page = 1
        this.fetchUsers()
      }, 500)
    },
    async fetchUsers(page = this.pagination.page) {
      this.loading = true
      this.error = null
      try {
        const params = {
          page,
          page_size: this.pagination.page_size
        }
        
        // 添加搜索参数
        if (this.searchQuery.trim()) {
          params.search = this.searchQuery.trim()
        }
        
        const response = await getUserList(params)
        if (response.code === 'success' && response.data) {
          this.users = response.data.users || []
          this.pagination = {
            ...this.pagination,
            ...(response.data.pagination || {})
          }
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
    changePage(page) {
      if (page === this.pagination.page || page === '...') return
      this.pagination.page = page
      this.fetchUsers(page)
      // 滚动到顶部
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    handlePageSizeChange(pageSize) {
      this.pagination.page_size = pageSize
      this.pagination.page = 1
      this.fetchUsers(1)
    },
    getPageNumbers() {
      const current = this.pagination.page
      const total = this.pagination.total_pages
      const pages = []
      
      if (total <= 7) {
        // 总页数少于等于7，显示所有页码
        for (let i = 1; i <= total; i++) {
          pages.push(i)
        }
      } else {
        // 总页数大于7，显示部分页码和省略号
        if (current <= 3) {
          // 当前页在前3页
          for (let i = 1; i <= 4; i++) {
            pages.push(i)
          }
          pages.push('...')
          pages.push(total)
        } else if (current >= total - 2) {
          // 当前页在后3页
          pages.push(1)
          pages.push('...')
          for (let i = total - 3; i <= total; i++) {
            pages.push(i)
          }
        } else {
          // 当前页在中间
          pages.push(1)
          pages.push('...')
          for (let i = current - 1; i <= current + 1; i++) {
            pages.push(i)
          }
          pages.push('...')
          pages.push(total)
        }
      }
      
      return pages
    },
    toggleBatchDeleteMode() {
      this.batchDeleteMode = !this.batchDeleteMode
      if (!this.batchDeleteMode) {
        // 退出批量删除模式时清空选中
        this.selectedUsers = []
      }
    },
    toggleSelectAll(event) {
      if (event.target.checked) {
        // 全选
        this.selectedUsers = this.users.map(u => u.id)
      } else {
        // 取消全选
        this.selectedUsers = []
      }
    },
    getUserById(userId) {
      return this.users.find(u => u.id === userId)
    },
    openBatchDeleteModal() {
      if (this.selectedUsers.length === 0) {
        if (this.$message?.warning) {
          this.$message.warning('请先选择要删除的用户')
        }
        return
      }
      this.showBatchDeleteModal = true
    },
    closeBatchDeleteModal() {
      if (this.batchDeleteLoading) return
      this.showBatchDeleteModal = false
    },
    async confirmBatchDelete() {
      if (this.selectedUsers.length === 0 || this.batchDeleteLoading) return
      
      this.batchDeleteLoading = true
      try {
        // 依次删除选中的用户
        const deletePromises = this.selectedUsers.map(userId => 
          deleteUser(userId).catch(err => {
            console.error(`删除用户 ${userId} 失败:`, err)
            return { error: true, userId, message: err.message }
          })
        )
        
        const results = await Promise.all(deletePromises)
        const errors = results.filter(r => r && r.error)
        const successCount = this.selectedUsers.length - errors.length
        
        if (successCount > 0) {
          if (this.$message?.success) {
            this.$message.success(`成功删除 ${successCount} 个用户`)
          }
        }
        
        if (errors.length > 0) {
          if (this.$message?.error) {
            this.$message.error(`删除失败 ${errors.length} 个用户`)
          }
        }
        
        // 清空选中并刷新列表
        this.selectedUsers = []
        this.batchDeleteMode = false
        this.showBatchDeleteModal = false
        
        // 刷新当前页，如果当前页没有数据了，跳转到上一页
        await this.fetchUsers(this.pagination.page)
        if (this.users.length === 0 && this.pagination.page > 1) {
          await this.fetchUsers(this.pagination.page - 1)
        }
      } catch (err) {
        console.error('批量删除失败:', err)
        if (this.$message?.error) {
          this.$message.error(err.message || '批量删除失败，请稍后重试')
        }
      } finally {
        this.batchDeleteLoading = false
      }
    },
    handleSearch() {
      // 搜索由 watch 监听处理
    },
    handleRefresh() {
      // 刷新当前页
      this.fetchUsers(this.pagination.page)
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
    },
    openDeleteModal(user) {
      if (this.loading || this.deleteLoading) return
      this.deleteTarget = user
      this.showDeleteModal = true
    },
    closeDeleteModal() {
      if (this.deleteLoading) return
      this.showDeleteModal = false
      this.deleteTarget = null
    },
    async confirmDelete() {
      if (!this.deleteTarget || this.deleteLoading) return
      this.deleteLoading = true
      try {
        await deleteUser(this.deleteTarget.id)
        if (this.$message?.success) {
          this.$message.success('删除用户成功')
        }
        const nextPage =
          this.users.length === 1 && this.pagination.page > 1
            ? this.pagination.page - 1
            : this.pagination.page
        await this.fetchUsers(nextPage)
        this.showDeleteModal = false
        this.deleteTarget = null
      } catch (err) {
        console.error('删除用户失败:', err)
        if (this.$message?.error) {
          this.$message.error(err.message || '删除用户失败，请稍后重试')
        }
      } finally {
        this.deleteLoading = false
      }
    },
    openEditModal(user) {
      if (this.loading || this.editLoading) return
      this.editForm = {
        id: user.id,
        username: user.username || '',
        email: user.email || '',
        gender: user.gender || '',
        student_id: user.student_id || '',
        class_name: user.class_name || '',
        real_name: user.real_name || '',
        status: user.status || 'normal',
        permission: Number(user.permission) || 0
      }
      this.showEditModal = true
    },
    closeEditModal() {
      if (this.editLoading) return
      this.showEditModal = false
      this.editForm = {
        id: null,
        username: '',
        email: '',
        gender: '',
        student_id: '',
        class_name: '',
        real_name: '',
        status: 'normal',
        permission: 0
      }
    },
    async confirmEdit() {
      if (!this.editForm.id || this.editLoading) return
      
      // 验证必填字段
      if (!this.editForm.username || !this.editForm.email) {
        this.showFeedback('error', '用户名和邮箱不能为空')
        return
      }
      
      this.editLoading = true
      try {
        await updateUser(this.editForm.id, {
          username: this.editForm.username,
          email: this.editForm.email,
          gender: this.editForm.gender,
          studentId: this.editForm.student_id,
          className: this.editForm.class_name,
          realName: this.editForm.real_name,
          status: this.editForm.status,
          permission: this.editForm.permission
        })
        
        // 显示成功反馈（绿色弹窗）
        this.showFeedback('success', '更新用户信息成功')
        
        // 刷新当前页
        await this.fetchUsers(this.pagination.page)
        
        // 延迟关闭弹窗，确保用户能看到反馈消息
        setTimeout(() => {
          this.closeEditModal()
        }, 500)
      } catch (err) {
        console.error('更新用户信息失败:', err)
        // 显示失败反馈（红色弹窗）
        this.showFeedback('error', err.message || '更新用户信息失败，请稍后重试')
      } finally {
        this.editLoading = false
      }
    },
    openResetPasswordModal() {
      this.resetPasswordForm = {
        newPassword: '',
        confirmPassword: ''
      }
      this.showResetPasswordModal = true
    },
    closeResetPasswordModal() {
      if (this.resetPasswordLoading) return
      this.showResetPasswordModal = false
      this.resetPasswordForm = {
        newPassword: '',
        confirmPassword: ''
      }
    },
    async confirmResetPassword() {
      if (!this.editForm.id || this.resetPasswordLoading) return
      
      // 验证密码
      if (!this.resetPasswordForm.newPassword) {
        this.showFeedback('error', '请输入新密码')
        return
      }
      
      if (this.resetPasswordForm.newPassword.length < 6) {
        this.showFeedback('error', '密码长度至少6位')
        return
      }
      
      if (this.resetPasswordForm.newPassword !== this.resetPasswordForm.confirmPassword) {
        this.showFeedback('error', '两次输入的密码不一致')
        return
      }
      
      this.resetPasswordLoading = true
      try {
        await resetUserPassword(this.editForm.id, this.resetPasswordForm.newPassword)
        
        // 显示成功反馈（绿色弹窗）
        this.showFeedback('success', '密码重置成功')
        
        // 延迟关闭弹窗，确保用户能看到反馈消息
        setTimeout(() => {
          this.closeResetPasswordModal()
        }, 500)
      } catch (err) {
        console.error('重置密码失败:', err)
        // 显示失败反馈（红色弹窗）
        this.showFeedback('error', err.message || '重置密码失败，请稍后重试')
      } finally {
        this.resetPasswordLoading = false
      }
    },
    showFeedback(type, message) {
      this.feedbackType = type
      this.feedbackMessage = message
      this.feedbackVisible = true
      setTimeout(() => {
        this.feedbackVisible = false
      }, 2000)
    }
  },
  beforeUnmount() {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer)
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
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
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
.btn-batch-delete {
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid;
  outline: none;
}

.btn-refresh {
  border-color: #1890ff;
  background-color: #e6f7ff;
  color: #1890ff;
}

.btn-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-refresh:not(:disabled):hover {
  background-color: #bae7ff;
}

.btn-batch-delete {
  border-color: #ff4d4f;
  background-color: #fff1f0;
  color: #ff4d4f;
}

.btn-batch-delete.active {
  background-color: #ff4d4f;
  color: #ffffff;
}

.btn-batch-delete:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-batch-delete:not(:disabled):hover {
  background-color: #ff7875;
  border-color: #ff7875;
  color: #ffffff;
}

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

.checkbox-select-all,
.checkbox-item {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #1890ff;
}

.batch-actions-bar {
  margin-top: 16px;
  padding: 12px 16px;
  background-color: #fff7e6;
  border: 1px solid #ffd591;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.batch-info {
  color: #d46b08;
  font-size: 14px;
  font-weight: 500;
}

.btn-batch-delete-confirm {
  padding: 6px 16px;
  border-radius: 4px;
  border: 1px solid #ff4d4f;
  background-color: #ff4d4f;
  color: #ffffff;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-batch-delete-confirm:hover {
  background-color: #ff7875;
  border-color: #ff7875;
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

.empty-text {
  text-align: center;
  color: #999999;
}

.actions-cell {
  width: 120px;
  text-align: right;
  white-space: nowrap;
}

.icon-btn {
  min-width: 28px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid #d9d9d9;
  background: #ffffff;
  cursor: pointer;
  font-size: 12px;
  margin-left: 6px;
  padding: 0 6px;
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.icon-btn:hover {
  transform: translateY(-1px);
  opacity: 0.85;
}

.icon-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.icon-btn.icon-edit {
  background-color: #f5f5f5;
}

.icon-btn.icon-delete {
  background-color: #fff1f0;
}

.pagination-container {
  margin-top: 24px;
  padding: 20px 24px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.pagination-info {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 14px;
  color: #666666;
}

.page-info {
  color: #1890ff;
  font-weight: 500;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-btn {
  padding: 6px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background-color: #ffffff;
  color: #333333;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
}

.pagination-btn:hover:not(:disabled) {
  border-color: #1890ff;
  color: #1890ff;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-pages {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pagination-page-btn {
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background-color: #ffffff;
  color: #333333;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination-page-btn:hover:not(:disabled):not(.ellipsis) {
  border-color: #1890ff;
  color: #1890ff;
}

.pagination-page-btn.active {
  background-color: #1890ff;
  border-color: #1890ff;
  color: #ffffff;
}

.pagination-page-btn.ellipsis {
  border: none;
  cursor: default;
  background-color: transparent;
}

.pagination-page-btn:disabled {
  cursor: not-allowed;
}

.page-size-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666666;
}

.page-size-select {
  padding: 4px 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-size-select:focus {
  border-color: #1890ff;
}

.page-size-select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-card {
  width: min(420px, 90vw);
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.35);
}

.modal-card h3 {
  margin: 0 0 8px;
  font-size: 18px;
  color: #111827;
}

.modal-card p {
  margin: 4px 0 16px;
  color: #4b5563;
  line-height: 1.6;
  font-size: 14px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.modal-cancel,
.modal-confirm {
  padding: 8px 18px;
  border-radius: 999px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-cancel {
  background: #f3f4f6;
  color: #374151;
}

.modal-cancel:hover:not(:disabled) {
  background: #e5e7eb;
}

.modal-confirm {
  background: #1890ff;
  color: #fff;
}

.modal-confirm:hover:not(:disabled) {
  background: #1677d9;
}

.modal-confirm:disabled,
.modal-cancel:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.batch-delete-list {
  max-height: 200px;
  overflow-y: auto;
  margin: 12px 0;
  padding: 8px;
  background-color: #f9fafb;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.batch-delete-item {
  padding: 6px 8px;
  font-size: 13px;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
}

.batch-delete-item:last-child {
  border-bottom: none;
}

.center-feedback {
  position: fixed;
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
  min-width: 220px;
  padding: 12px 18px;
  border-radius: 8px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  z-index: 2000;
}

.center-feedback-success {
  background-color: #f6ffed;
  border: 1px solid #b7eb8f;
  color: #389e0d;
}

.center-feedback-error {
  background-color: #fff2f0;
  border: 1px solid #ffccc7;
  color: #cf1322;
}

.edit-modal-card {
  width: min(800px, 90vw);
  max-height: 90vh;
  overflow-y: auto;
}

.edit-modal-card h3 {
  margin: 0 0 16px;
  font-size: 18px;
  color: #111827;
}

.edit-form {
  margin: 0 0 20px 0;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 12px;
}

.form-group {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  color: #333333;
  font-weight: 500;
}

.form-group .required {
  color: #ff4d4f;
}

.form-input {
  width: 100%;
  padding: 7px 11px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 13px;
  outline: none;
  transition: all 0.3s ease;
  box-sizing: border-box;
  height: 32px;
}

.form-input:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.form-input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
  color: #999999;
}

.password-reset-section {
  display: flex;
  gap: 8px;
  align-items: center;
}

.password-disabled {
  flex: 1;
}

.btn-reset-password {
  padding: 8px 16px;
  border: 1px solid #1890ff;
  border-radius: 4px;
  background-color: #e6f7ff;
  color: #1890ff;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-reset-password:hover:not(:disabled) {
  background-color: #bae7ff;
}

.btn-reset-password:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .pagination-container {
    flex-direction: column;
    align-items: stretch;
  }

  .pagination {
    justify-content: center;
    flex-wrap: wrap;
  }

  .pagination-info {
    justify-content: center;
  }

  .page-size-selector {
    justify-content: center;
  }

  .edit-modal-card {
    width: min(95vw, 600px);
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .form-group {
    margin-bottom: 12px;
  }
}
</style>


