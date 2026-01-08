<template>
  <div class="admin-page">
    <div class="page-header">
      <div>
        <h1>题目管理</h1>
        <p class="page-subtitle">查看并管理题库中的题目</p>
      </div>
      <div class="page-actions">
        <button 
          class="btn-batch-delete" 
          :class="{ 'active': batchDeleteMode }"
          @click="toggleBatchDeleteMode"
          :disabled="loading"
        >
          {{ batchDeleteMode ? '取消批量删除' : '批量删除' }}
        </button>
        <button class="btn-refresh" @click="fetchProblems" :disabled="loading">
          {{ loading ? '刷新中...' : '刷新列表' }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="state-text">正在加载题目列表...</div>
    <div v-else-if="error" class="state-text error-text">{{ error }}</div>
    <div v-else>
      <table class="problem-table">
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
            <th style="width: 80px">题目ID</th>
            <th style="text-align: left;">标题</th>
            <th style="text-align: left;">作者</th>
            <th style="text-align: left;">创建时间</th>
            <th style="text-align: left;">权限</th>
            <th style="text-align: center;">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="problems.length === 0">
            <td :colspan="batchDeleteMode ? 7 : 6" class="empty-text">暂无题目数据</td>
          </tr>
          <tr v-for="problem in problems" :key="problem.id">
            <td v-if="batchDeleteMode" style="text-align: center;">
              <input 
                type="checkbox" 
                :value="problem.id"
                v-model="selectedProblems"
                class="checkbox-item"
              />
            </td>
            <td>{{ problem.id }}</td>
            <td class="title-cell">{{ problem.title }}</td>
            <td>{{ problem.author || '未知' }}</td>
            <td>{{ problem.create_time || '-' }}</td>
            <td>
              <span class="auth-tag" :class="`auth-${problem.auth}`">
                {{ authText(problem.auth) }}
              </span>
            </td>
            <td class="actions-cell">
              <button 
                class="icon-btn icon-edit" 
                title="编辑题目"
                @click="$router.push(`/admin/problems/edit/${problem.id}`)"
              >
                ✏️
              </button>
              <button class="icon-btn icon-download" title="下载测评数据">
                ⬇️
              </button>
              <button
                class="icon-btn icon-delete"
                title="删除题目"
                :disabled="deleteLoading && deleteTarget && deleteTarget.id === problem.id"
                @click="openDeleteModal(problem)"
              >
                🗑️
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 批量删除操作栏 -->
      <div v-if="batchDeleteMode && selectedProblems.length > 0" class="batch-actions-bar">
        <span class="batch-info">已选中 {{ selectedProblems.length }} 道题目</span>
        <button class="btn-batch-delete-confirm" @click="openBatchDeleteModal">
          删除选中题目
        </button>
      </div>

      <!-- 翻页器 -->
      <div v-if="!loading && pagination.total_pages > 0" class="pagination-container">
        <div class="pagination-info">
          <span>共 {{ pagination.total }} 题</span>
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

    <!-- 单个删除确认弹窗 -->
    <transition name="fade">
      <div
        v-if="showDeleteModal"
        class="modal-overlay"
        @click.self="closeDeleteModal"
      >
        <div class="modal-card">
          <h3>确认删除题目？</h3>
          <p>删除后将移除该题目的所有信息、测评数据及相关图片，且无法恢复。</p>
          <p v-if="deleteTarget" class="modal-problem-title">
            将删除：{{ deleteTarget.id }} - {{ deleteTarget.title }}
          </p>
          <div class="modal-actions">
            <button
              class="modal-cancel"
              @click="closeDeleteModal"
              :disabled="deleteLoading"
            >
              再想想
            </button>
            <button
              class="modal-confirm"
              @click="confirmDelete"
              :disabled="deleteLoading"
            >
              {{ deleteLoading ? '正在删除...' : '确认删除' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- 批量删除确认弹窗 -->
    <transition name="fade">
      <div
        v-if="showBatchDeleteModal"
        class="modal-overlay"
        @click.self="closeBatchDeleteModal"
      >
        <div class="modal-card">
          <h3>确认批量删除题目？</h3>
          <p>删除后将移除选中题目的所有信息、测评数据及相关图片，且无法恢复。</p>
          <p class="modal-problem-title">
            将删除 {{ selectedProblems.length }} 道题目：
          </p>
          <div class="batch-delete-list">
            <div 
              v-for="problemId in selectedProblems" 
              :key="problemId"
              class="batch-delete-item"
            >
              {{ getProblemById(problemId)?.id }} - {{ getProblemById(problemId)?.title }}
            </div>
          </div>
          <div class="modal-actions">
            <button
              class="modal-cancel"
              @click="closeBatchDeleteModal"
              :disabled="batchDeleteLoading"
            >
              再想想
            </button>
            <button
              class="modal-confirm"
              @click="confirmBatchDelete"
              :disabled="batchDeleteLoading"
            >
              {{ batchDeleteLoading ? '正在删除...' : '确认删除' }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { getProblemList, deleteProblem } from '@/api/problem'

export default {
  name: 'ProblemManage',
  data() {
    return {
      loading: false,
      error: '',
      problems: [],
      pagination: {
        page: 1,
        page_size: 20,
        total: 0,
        total_pages: 1,
        has_next: false,
        has_previous: false
      },
      showDeleteModal: false,
      deleteTarget: null,
      deleteLoading: false,
      batchDeleteMode: false,
      selectedProblems: [],
      showBatchDeleteModal: false,
      batchDeleteLoading: false
    }
  },
  created() {
    this.fetchProblems()
  },
  computed: {
    isAllSelected() {
      return this.problems.length > 0 && 
             this.selectedProblems.length === this.problems.length &&
             this.problems.every(p => this.selectedProblems.includes(p.id))
    }
  },
  methods: {
    authText(auth) {
      const map = {
        1: '公开题目',
        2: '私密题目',
        3: '比赛题目'
      }
      return map[auth] || `未知(${auth})`
    },
    async fetchProblems(page = this.pagination.page) {
      this.loading = true
      this.error = ''
      try {
        const res = await getProblemList({
          page,
          page_size: this.pagination.page_size,
          auth: '1,2,3'
        })
        this.problems = res.data?.problems || []
        this.pagination = {
          ...this.pagination,
          ...(res.data?.pagination || {})
        }
      } catch (err) {
        console.error('获取题目列表失败:', err)
        this.error = err.message || '获取题目列表失败，请稍后重试'
      } finally {
        this.loading = false
      }
    },
    changePage(page) {
      if (page === this.pagination.page || page === '...') return
      this.pagination.page = page
      this.fetchProblems(page)
      // 滚动到顶部
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    handlePageSizeChange(pageSize) {
      this.pagination.page_size = pageSize
      this.pagination.page = 1
      this.fetchProblems(1)
    },
    getPageNumbers() {
      const current = this.pagination.page
      const total = this.pagination.total_pages
      const pages = []
      
      if (total <= 7) {
        // 如果总页数少于等于7页，显示所有页码
        for (let i = 1; i <= total; i++) {
          pages.push(i)
        }
      } else {
        // 总页数大于7页，显示省略号
        if (current <= 4) {
          // 当前页在前4页
          for (let i = 1; i <= 5; i++) {
            pages.push(i)
          }
          pages.push('...')
          pages.push(total)
        } else if (current >= total - 3) {
          // 当前页在后4页
          pages.push(1)
          pages.push('...')
          for (let i = total - 4; i <= total; i++) {
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
        this.selectedProblems = []
      }
    },
    toggleSelectAll(event) {
      if (event.target.checked) {
        // 全选
        this.selectedProblems = this.problems.map(p => p.id)
      } else {
        // 取消全选
        this.selectedProblems = []
      }
    },
    getProblemById(problemId) {
      return this.problems.find(p => p.id === problemId)
    },
    openBatchDeleteModal() {
      if (this.selectedProblems.length === 0) {
        if (this.$message?.warning) {
          this.$message.warning('请先选择要删除的题目')
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
      if (this.selectedProblems.length === 0 || this.batchDeleteLoading) return
      
      this.batchDeleteLoading = true
      try {
        // 依次删除选中的题目
        const deletePromises = this.selectedProblems.map(problemId => 
          deleteProblem(problemId).catch(err => {
            console.error(`删除题目 ${problemId} 失败:`, err)
            return { error: true, problemId, message: err.message }
          })
        )
        
        const results = await Promise.all(deletePromises)
        const errors = results.filter(r => r && r.error)
        const successCount = this.selectedProblems.length - errors.length
        
        if (successCount > 0) {
          if (this.$message?.success) {
            this.$message.success(`成功删除 ${successCount} 道题目`)
          }
        }
        
        if (errors.length > 0) {
          if (this.$message?.error) {
            this.$message.error(`删除失败 ${errors.length} 道题目`)
          }
        }
        
        // 清空选中并刷新列表
        this.selectedProblems = []
        this.batchDeleteMode = false
        this.showBatchDeleteModal = false
        
        // 刷新当前页，如果当前页没有数据了，跳转到上一页
        await this.fetchProblems(this.pagination.page)
        if (this.problems.length === 0 && this.pagination.page > 1) {
          await this.fetchProblems(this.pagination.page - 1)
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
    openDeleteModal(problem) {
      if (this.loading || this.deleteLoading) return
      this.deleteTarget = problem
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
        await deleteProblem(this.deleteTarget.id)
        if (this.$message?.success) {
          this.$message.success('删除题目成功')
        }
        const nextPage =
          this.problems.length === 1 && this.pagination.page > 1
            ? this.pagination.page - 1
            : this.pagination.page
        await this.fetchProblems(nextPage)
        this.showDeleteModal = false
        this.deleteTarget = null
      } catch (err) {
        console.error('删除题目失败:', err)
        if (this.$message?.error) {
          this.$message.error(err.message || '删除题目失败，请稍后重试')
        }
      } finally {
        this.deleteLoading = false
      }
    }
  }
}
</script>

<style scoped>
.admin-page {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 24px;
  min-height: 400px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.page-header h1 {
  font-size: 24px;
  margin-bottom: 8px;
}

.page-subtitle {
  font-size: 14px;
  color: #666666;
}

.page-actions {
  display: flex;
  gap: 8px;
}

.btn-refresh,
.btn-batch-delete {
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-refresh {
  border: 1px solid #1890ff;
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
  border: 1px solid #ff4d4f;
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
  color: #ffffff;
}

.state-text {
  padding: 24px 0;
  text-align: center;
  color: #666666;
}

.error-text {
  color: #ff4d4f;
}

.problem-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 8px;
  font-size: 14px;
}

.problem-table th,
.problem-table td {
  padding: 10px 12px;
  border-bottom: 1px solid #f0f0f0;
  text-align: left;
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

.problem-table thead {
  background-color: #fafafa;
}

.title-cell {
  max-width: 360px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.empty-text {
  text-align: center;
  color: #999999;
}

.auth-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
}

.auth-1 {
  background-color: #f6ffed;
  color: #389e0d;
}

.auth-2 {
  background-color: #fff7e6;
  color: #d46b08;
}

.auth-3 {
  background-color: #fff1f0;
  color: #cf1322;
}

.actions-cell {
  width: 160px;
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

.icon-btn.icon-download {
  background-color: #e6f7ff;
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

.modal-problem-title {
  font-weight: 600;
  color: #111827;
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
  background: #dc2626;
  color: #fff;
}

.modal-confirm:hover:not(:disabled) {
  background: #b91c1c;
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
</style>

