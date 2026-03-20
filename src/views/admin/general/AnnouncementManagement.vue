<template>
  <div class="announcement-management">
    <div class="page-header">
      <h1>公告管理</h1>
      <p class="page-subtitle">管理系统公告（用于首页公告栏）</p>
    </div>

    <div class="management-header">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="搜索标题..."
        class="search-input"
      />

      <div class="header-actions">
        <button class="btn-new" @click="openCreateModal" :disabled="loading">
          新建公告
        </button>
        <button class="btn-refresh" @click="fetchAnnouncements" :disabled="loading">
          {{ loading ? '刷新中...' : '刷新' }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <p>加载中...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button class="btn-retry" @click="fetchAnnouncements">重试</button>
    </div>

    <div v-else class="announcement-table-container">
      <table class="announcement-table">
        <thead>
          <tr>
            <th style="width: 80px;">ID</th>
            <th>标题</th>
            <th style="width: 90px;">置顶</th>
            <th style="width: 170px;">发布时间</th>
            <th style="width: 160px; text-align: center;">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="announcements.length === 0">
            <td :colspan="5" class="empty-text">暂无公告数据</td>
          </tr>

          <tr v-for="a in announcements" :key="a.id">
            <td>{{ a.id }}</td>
            <td class="title-cell">
              <span class="title-text">{{ a.title }}</span>
            </td>
            <td>
              <span :class="['status-badge', a.is_important ? 'status-yes' : 'status-no']">
                {{ a.is_important ? '置顶' : '普通' }}
              </span>
            </td>
            <td>{{ formatDateTime(a.create_time) }}</td>
            <td class="actions-cell">
              <button class="icon-btn icon-edit" title="编辑公告" @click="openEditModal(a)">
                ✏️
              </button>
              <button
                class="icon-btn icon-delete"
                title="删除公告"
                :disabled="deleteLoading && deleteTarget && deleteTarget.id === a.id"
                @click="openDeleteModal(a)"
              >
                🗑️
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="!loading && pagination.total_pages > 0" class="pagination-container">
        <div class="pagination-info">
          <span>共 {{ pagination.total }} 条公告</span>
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

    <!-- 删除确认弹窗 -->
    <ConfirmDialog
      :visible="showDeleteModal"
      title="确认删除公告？"
      message="删除后将移除该公告，且无法恢复。"
      :detail="deleteTarget ? `将删除：${deleteTarget.title}` : ''"
      confirm-text="确认删除"
      cancel-text="再想想"
      :loading="deleteLoading"
      loading-text="正在删除..."
      @confirm="confirmDelete"
      @cancel="closeDeleteModal"
      @update:visible="showDeleteModal = $event"
    />

    <!-- 新建/编辑弹窗 -->
    <transition name="fade">
      <div
        v-if="showEditModal"
        class="modal-overlay"
        @click.self="closeEditModal"
      >
        <div class="modal-card edit-modal-card">
          <h3>{{ editForm.id ? '编辑公告' : '新建公告' }}</h3>

          <div class="edit-form">
            <div class="form-group">
              <label>公告标题 <span class="required">*</span></label>
              <input
                type="text"
                v-model="editForm.title"
                class="form-input"
                placeholder="请输入公告标题"
              />
            </div>

            <div class="form-group">
              <label>公告内容 <span class="required">*</span></label>
              <textarea
                v-model="editForm.content"
                class="form-textarea"
                rows="8"
                placeholder="请输入公告内容（支持markdown）"
              ></textarea>
            </div>

            <div class="form-group check-group">
              <label class="check-label">
                <input type="checkbox" v-model="editForm.is_important" />
                <span>是否置顶</span>
              </label>
            </div>
          </div>

          <div class="modal-actions">
            <button class="modal-cancel" @click="closeEditModal" :disabled="editLoading">
              取消
            </button>
            <button class="modal-confirm" @click="confirmEdit" :disabled="editLoading">
              {{ editLoading ? '保存中...' : '保存' }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import {
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncementList,
  updateAnnouncement
} from '@/api/announcement'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

export default {
  name: 'AnnouncementManagement',
  components: {
    ConfirmDialog
  },
  data() {
    return {
      announcements: [],
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

      showEditModal: false,
      editLoading: false,
      editForm: {
        id: null,
        title: '',
        content: '',
        is_important: false
      },

      showDeleteModal: false,
      deleteTarget: null,
      deleteLoading: false
    }
  },
  mounted() {
    this.fetchAnnouncements()
  },
  watch: {
    searchQuery() {
      this.debounceSearch()
    }
  },
  methods: {
    debounceSearch() {
      if (this.searchTimer) clearTimeout(this.searchTimer)
      this.searchTimer = setTimeout(() => {
        this.pagination.page = 1
        this.fetchAnnouncements(1)
      }, 500)
    },

    async fetchAnnouncements(page = this.pagination.page) {
      this.loading = true
      this.error = null
      try {
        const params = {
          page,
          page_size: this.pagination.page_size
        }
        if (this.searchQuery.trim()) {
          params.search = this.searchQuery.trim()
        }

        const res = await getAnnouncementList(params)
        if (res.code === 'success' && res.data) {
          this.announcements = res.data.announcements || []
          this.pagination = {
            ...this.pagination,
            ...(res.data.pagination || {})
          }
        } else {
          this.announcements = []
          this.error = res.message || '获取公告列表失败'
        }
      } catch (err) {
        console.error('获取公告列表失败:', err)
        this.announcements = []
        this.error = err.message || '获取公告列表失败，请稍后重试'
      } finally {
        this.loading = false
      }
    },

    changePage(page) {
      if (page === this.pagination.page || page === '...') return
      this.fetchAnnouncements(page)
      this.pagination.page = page
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },

    handlePageSizeChange(size) {
      if (!size) return
      this.pagination.page_size = size
      this.pagination.page = 1
      this.fetchAnnouncements(1)
    },

    getPageNumbers() {
      const current = this.pagination.page
      const total = this.pagination.total_pages
      const pages = []

      if (total <= 7) {
        for (let i = 1; i <= total; i++) pages.push(i)
      } else if (current <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i)
        pages.push('...')
        pages.push(total)
      } else if (current >= total - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = total - 3; i <= total; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = current - 1; i <= current + 1; i++) pages.push(i)
        pages.push('...')
        pages.push(total)
      }
      return pages
    },

    formatDateTime(dateString) {
      if (!dateString) return '--'
      try {
        const date = new Date(dateString)
        if (Number.isNaN(date.getTime())) return '--'
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        return `${year}-${month}-${day} ${hours}:${minutes}`
      } catch (e) {
        return '--'
      }
    },

    openCreateModal() {
      this.editForm = {
        id: null,
        title: '',
        content: '',
        is_important: false
      }
      this.showEditModal = true
    },

    openEditModal(item) {
      this.editForm = {
        id: item.id,
        title: item.title || '',
        content: item.content || '',
        is_important: !!item.is_important
      }
      this.showEditModal = true
    },

    closeEditModal() {
      if (this.editLoading) return
      this.showEditModal = false
    },

    async confirmEdit() {
      if (this.editLoading) return

      if (!this.editForm.title.trim()) {
        this.$message?.error?.('公告标题不能为空')
        return
      }
      if (!this.editForm.content.trim()) {
        this.$message?.error?.('公告内容不能为空')
        return
      }

      this.editLoading = true
      try {
        if (this.editForm.id) {
          await updateAnnouncement(this.editForm.id, {
            title: this.editForm.title.trim(),
            content: this.editForm.content.trim(),
            is_important: this.editForm.is_important
          })
          this.$message?.success?.('编辑公告成功')
        } else {
          await createAnnouncement({
            title: this.editForm.title.trim(),
            content: this.editForm.content.trim(),
            is_important: this.editForm.is_important
          })
          this.$message?.success?.('创建公告成功')
        }

        this.showEditModal = false
        this.fetchAnnouncements()
      } catch (err) {
        console.error('保存公告失败:', err)
        this.$message?.error?.(err.message || '保存公告失败，请稍后重试')
      } finally {
        this.editLoading = false
      }
    },

    openDeleteModal(item) {
      if (this.loading || this.deleteLoading) return
      this.deleteTarget = item
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
        await deleteAnnouncement(this.deleteTarget.id)
        this.$message?.success?.('删除公告成功')
        this.showDeleteModal = false
        this.deleteTarget = null

        // 删除后，如果当前页没数据了，回退一页
        await this.fetchAnnouncements(this.pagination.page)
        if (this.announcements.length === 0 && this.pagination.page > 1) {
          this.pagination.page -= 1
          await this.fetchAnnouncements(this.pagination.page)
        }
      } catch (err) {
        console.error('删除公告失败:', err)
        this.$message?.error?.(err.message || '删除公告失败，请稍后重试')
      } finally {
        this.deleteLoading = false
      }
    }
  },
  beforeUnmount() {
    if (this.searchTimer) clearTimeout(this.searchTimer)
  }
}
</script>

<style scoped>
.announcement-management {
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
  gap: 12px;
}

.search-input {
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  width: 320px;
  outline: none;
  transition: all 0.3s ease;
}

.search-input:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.15);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}

.btn-new,
.btn-refresh {
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid;
}

.btn-new {
  border-color: #1890ff;
  background-color: #e6f7ff;
  color: #1890ff;
}

.btn-new:disabled,
.btn-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-new:not(:disabled):hover {
  background-color: #bae7ff;
}

.btn-refresh {
  border-color: #1890ff;
  background-color: #ffffff;
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

.btn-retry {
  margin-top: 12px;
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background-color: #ffffff;
  cursor: pointer;
}

.announcement-table-container {
  overflow-x: auto;
}

.announcement-table {
  width: 100%;
  border-collapse: collapse;
  background-color: #ffffff;
}

.announcement-table thead {
  background-color: #fafafa;
}

.announcement-table th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  font-size: 14px;
  color: #333333;
  border-bottom: 2px solid #e8e8e8;
  white-space: nowrap;
}

.announcement-table td {
  padding: 12px 16px;
  font-size: 14px;
  color: #666666;
  border-bottom: 1px solid #f0f0f0;
}

.announcement-table tbody tr:hover {
  background-color: #f8f9fa;
}

.empty-text {
  text-align: center;
  padding: 60px 20px;
  color: #999999;
}

.title-cell {
  max-width: 520px;
}

.title-text {
  display: inline-block;
  max-width: 520px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: #333333;
  font-weight: 600;
  font-size: 14px;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.status-yes {
  background-color: #fff1f0;
  color: #ff4d4f;
}

.status-no {
  background-color: #f0f0f0;
  color: #666666;
}

.actions-cell {
  width: 160px;
  text-align: right;
  white-space: nowrap;
}

.icon-btn {
  min-width: 32px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid #d9d9d9;
  background: #ffffff;
  cursor: pointer;
  font-size: 14px;
  padding: 0 8px;
  margin-left: 8px;
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
  border-radius: 6px;
  background-color: #ffffff;
  color: #333333;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-page-btn {
  min-width: 36px;
  height: 32px;
  padding: 0 10px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background-color: #ffffff;
  color: #333333;
  font-size: 14px;
  cursor: pointer;
  outline: none;
  display: flex;
  align-items: center;
  justify-content: center;
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
  color: #999999;
}

.pagination-pages {
  display: flex;
  align-items: center;
  gap: 6px;
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
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  cursor: pointer;
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
  width: min(800px, 95vw);
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.35);
}

.edit-modal-card h3 {
  margin: 0 0 16px;
  font-size: 18px;
  color: #111827;
}

.edit-form {
  margin: 0 0 20px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #333333;
  font-weight: 600;
  margin-bottom: 8px;
}

.required {
  color: #ff4d4f;
}

.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 13px;
  outline: none;
}

.form-input:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.15);
}

.form-textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 13px;
  outline: none;
  resize: vertical;
  min-height: 150px;
  font-family: inherit;
}

.form-textarea:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.15);
}

.check-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
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
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-cancel {
  background: #f3f4f6;
  color: #374151;
}

.modal-confirm {
  background: #1890ff;
  color: #fff;
}

.modal-cancel:disabled,
.modal-confirm:disabled {
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
</style>


