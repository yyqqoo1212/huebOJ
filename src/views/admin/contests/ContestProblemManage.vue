<template>
  <div class="contest-problem-manage">
    <div class="page-header">
      <div>
        <button class="btn-back" @click="handleBack">
          ← 返回
        </button>
        <h1>题目编辑 - {{ contestName }}</h1>
        <p class="page-subtitle">管理该比赛的所有题目信息</p>
      </div>
      <div class="page-actions">
        <button class="btn-create-problem" @click="handleCreateProblem">
          创建题目
        </button>
        <button class="btn-add-from-bank" @click="handleAddFromBank">
          题库添加
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <p>加载中...</p>
    </div>
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button class="btn-retry" @click="fetchProblems">重试</button>
    </div>
    <div v-else-if="problems.length === 0" class="empty-state">
      <p>暂无题目</p>
    </div>
    <div v-else class="problems-table-container">
      <table class="problems-table">
        <thead>
          <tr>
            <th>题目ID</th>
            <th>题目序号</th>
            <th>题目标题</th>
            <th style="text-align: center;">气球颜色</th>
            <th style="width: 150px; text-align: center;">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="problem in problems" :key="problem.id">
            <td>{{ problem.problem_id }}</td>
            <td>{{ problem.display_order }}</td>
            <td>{{ problem.display_title }}</td>
            <td>
              <div class="color-cell">
                <div 
                  class="color-circle"
                  :style="{ backgroundColor: problem.color || '#ffffff', borderColor: problem.color ? problem.color : '#d9d9d9' }"
                  @click="openColorPicker(problem)"
                  :title="problem.color ? `当前颜色: ${problem.color}，点击修改` : '点击设置颜色'"
                ></div>
              </div>
            </td>
            <td style="text-align: center;">
              <div class="action-buttons">
                <button 
                  class="btn-action btn-edit" 
                  @click="handleEditProblem(problem)"
                  title="修改"
                >
                  修改
                </button>
                <button 
                  class="btn-action btn-delete" 
                  @click="handleDeleteProblem(problem)"
                  title="删除"
                >
                  删除
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 题库添加对话框 -->
    <transition name="fade">
      <div
        v-if="showProblemBankModal"
        class="modal-overlay"
        @click.self="closeProblemBankModal"
      >
        <div class="modal-card problem-bank-modal">
          <div class="modal-header">
            <h3>从题库添加</h3>
            <button class="modal-close-btn" @click="closeProblemBankModal">×</button>
          </div>
          <div class="modal-body">
            <!-- 搜索框 -->
            <div class="search-container">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="搜索题目ID或标题..."
                class="search-input"
                @keyup.enter="handleSearch"
              />
              <button class="btn-search" @click="handleSearch">搜索</button>
            </div>

            <div v-if="problemBankLoading" class="loading-state">
              <p>加载中...</p>
            </div>
            <div v-else-if="problemBankError" class="error-state">
              <p>{{ problemBankError }}</p>
            </div>
            <div v-else-if="problemBank.length === 0" class="empty-state">
              <p>暂无题目</p>
            </div>
            <div v-else class="problem-bank-table-container">
              <table class="problem-bank-table">
                <thead>
                  <tr>
                    <th style="width: 100px;">题目ID</th>
                    <th>题目标题</th>
                    <th style="width: 80px; text-align: center;">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="problem in problemBank" :key="problem.id">
                    <td>{{ problem.id }}</td>
                    <td>{{ problem.title }}</td>
                    <td style="text-align: center;">
                      <button 
                        class="btn-add-problem" 
                        @click="handleAddProblemToContest(problem)"
                        title="添加到比赛"
                      >
                        +
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
              
              <!-- 分页 -->
              <div v-if="problemBankPagination.total_pages > 0" class="pagination-container">
                <div class="pagination-info">
                  <span>共 {{ problemBankPagination.total }} 道题目</span>
                </div>
                <div class="pagination">
                  <button
                    class="pagination-btn"
                    :disabled="!problemBankPagination.has_previous || problemBankLoading"
                    @click="changeProblemBankPage(problemBankPagination.page - 1)"
                  >
                    上一页
                  </button>

                  <div class="pagination-pages">
                    <button
                      v-for="page in getPageNumbers()"
                      :key="page"
                      :class="['pagination-page-btn', { active: page === problemBankPagination.page, ellipsis: page === '...' }]"
                      :disabled="page === '...' || problemBankLoading"
                      @click="page !== '...' && changeProblemBankPage(page)"
                    >
                      {{ page }}
                    </button>
                  </div>

                  <button
                    class="pagination-btn"
                    :disabled="!problemBankPagination.has_next || problemBankLoading"
                    @click="changeProblemBankPage(problemBankPagination.page + 1)"
                  >
                    下一页
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- 颜色选择器对话框 -->
    <transition name="fade">
      <div
        v-if="showColorPicker"
        class="modal-overlay"
        @click.self="closeColorPicker"
      >
        <div class="modal-card color-picker-modal">
          <div class="modal-header">
            <h3>设置气球颜色</h3>
            <button class="modal-close-btn" @click="closeColorPicker">×</button>
          </div>
          <div class="modal-body color-picker-body">
            <p class="color-picker-label">题目：{{ currentColorProblem?.display_title }}</p>
            <div class="color-picker-wrapper">
              <Chrome v-model="selectedColor" />
            </div>
            <div class="color-picker-actions">
              <button class="btn-cancel" @click="closeColorPicker">取消</button>
              <button class="btn-confirm" @click="confirmColorChange">确定</button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- 删除确认对话框 -->
    <ConfirmDialog
      :visible="showDeleteConfirm"
      title="确认删除"
      message="这只会删除比赛中的题目关联，不会删除原题目。"
      :detail="deleteTarget?.display_title"
      confirm-text="删除"
      cancel-text="取消"
      :loading="deleteLoading"
      loading-text="删除中..."
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>

<script>
import { getContestProblems, getContestDetail, getProblemBank, addProblemToContest, deleteContestProblem, updateContestProblemColor } from '@/api/contest'
import { Chrome } from '@ckpack/vue-color'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

export default {
  name: 'ContestProblemManage',
  components: {
    Chrome,
    ConfirmDialog
  },
  data() {
    return {
      contestId: null,
      contestName: '',
      problems: [],
      loading: false,
      error: null,
      showProblemBankModal: false,
      problemBank: [],
      problemBankLoading: false,
      problemBankError: null,
      searchQuery: '',
      problemBankPagination: {
        page: 1,
        page_size: 10,
        total: 0,
        total_pages: 0,
        has_next: false,
        has_previous: false
      },
      showColorPicker: false,
      currentColorProblem: null,
      selectedColor: '#FF0000',
      showDeleteConfirm: false,
      deleteTarget: null,
      deleteLoading: false
    }
  },
  mounted() {
    this.contestId = this.$route.params.id
    if (this.contestId) {
      this.fetchContestInfo()
      this.fetchProblems()
    }
  },
  methods: {
    async fetchContestInfo() {
      try {
        const response = await getContestDetail(this.contestId)
        if (response.code === 'success' && response.data) {
          this.contestName = response.data.name || `比赛 #${this.contestId}`
        }
      } catch (err) {
        console.error('获取比赛信息失败:', err)
        this.contestName = `比赛 #${this.contestId}`
      }
    },
    async fetchProblems() {
      if (!this.contestId) return
      
      this.loading = true
      this.error = null
      try {
        const response = await getContestProblems(this.contestId)
        if (response.code === 'success' && response.data) {
          this.problems = response.data.problems || []
        } else {
          this.error = response.message || '获取题目列表失败'
          this.problems = []
        }
      } catch (err) {
        console.error('获取题目列表失败:', err)
        this.error = err.message || '获取题目列表失败，请稍后重试'
        this.problems = []
      } finally {
        this.loading = false
      }
    },
    handleBack() {
      this.$router.push('/admin/contests/manage')
    },
    handleCreateProblem() {
      // 传递比赛ID到创建页面
      this.$router.push({
        path: '/admin/contests/problem/create',
        query: { contest_id: this.contestId }
      })
    },
    async handleAddFromBank() {
      this.showProblemBankModal = true
      await this.fetchProblemBank()
    },
    async fetchProblemBank(page = 1) {
      this.problemBankLoading = true
      this.problemBankError = null
      try {
        const params = {
          page,
          page_size: this.problemBankPagination.page_size
        }
        if (this.searchQuery.trim()) {
          params.search = this.searchQuery.trim()
        }
        const response = await getProblemBank(params)
        if (response.code === 'success' && response.data) {
          this.problemBank = response.data.problems || []
          this.problemBankPagination = {
            ...this.problemBankPagination,
            ...response.data.pagination
          }
        } else {
          this.problemBankError = response.message || '获取题库列表失败'
          this.problemBank = []
        }
      } catch (err) {
        console.error('获取题库列表失败:', err)
        this.problemBankError = err.message || '获取题库列表失败，请稍后重试'
        this.problemBank = []
      } finally {
        this.problemBankLoading = false
      }
    },
    handleSearch() {
      this.problemBankPagination.page = 1
      this.fetchProblemBank(1)
    },
    changeProblemBankPage(page) {
      this.fetchProblemBank(page)
    },
    getPageNumbers() {
      const current = this.problemBankPagination.page
      const total = this.problemBankPagination.total_pages
      const pages = []

      if (total <= 7) {
        for (let i = 1; i <= total; i++) {
          pages.push(i)
        }
      } else {
        if (current <= 3) {
          for (let i = 1; i <= 4; i++) {
            pages.push(i)
          }
          pages.push('...')
          pages.push(total)
        } else if (current >= total - 2) {
          pages.push(1)
          pages.push('...')
          for (let i = total - 3; i <= total; i++) {
            pages.push(i)
          }
        } else {
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
    closeProblemBankModal() {
      this.showProblemBankModal = false
      this.problemBank = []
      this.problemBankError = null
      this.searchQuery = ''
      this.problemBankPagination.page = 1
    },
    async handleAddProblemToContest(problem) {
      if (!this.contestId) return
      
      try {
        const response = await addProblemToContest(this.contestId, {
          problem_id: problem.id,
          display_title: problem.title
        })
        
        if (response.code === 'success') {
          if (this.$message?.success) {
            this.$message.success(`成功添加题目：${problem.title}`)
          }
          // 刷新比赛题目列表
          await this.fetchProblems()
        } else {
          if (this.$message?.error) {
            this.$message.error(response.message || '添加题目失败')
          }
        }
      } catch (err) {
        console.error('添加题目失败:', err)
        if (this.$message?.error) {
          this.$message.error(err.message || '添加题目失败，请稍后重试')
        }
      }
    },
    handleEditProblem(problem) {
      // 修改逻辑暂时不涉及
      if (this.$message?.info) {
        this.$message.info(`修改题目功能待实现：${problem.display_title}`)
      }
    },
    handleDeleteProblem(problem) {
      this.deleteTarget = problem
      this.showDeleteConfirm = true
    },
    cancelDelete() {
      this.showDeleteConfirm = false
      this.deleteTarget = null
    },
    async confirmDelete() {
      if (!this.contestId || !this.deleteTarget) return
      
      this.deleteLoading = true
      try {
        const response = await deleteContestProblem(this.contestId, this.deleteTarget.id)
        
        if (response.code === 'success') {
          if (this.$message?.success) {
            this.$message.success(`成功删除题目：${this.deleteTarget.display_title}`)
          }
          // 刷新比赛题目列表
          await this.fetchProblems()
          this.showDeleteConfirm = false
          this.deleteTarget = null
        } else {
          if (this.$message?.error) {
            this.$message.error(response.message || '删除题目失败')
          }
        }
      } catch (err) {
        console.error('删除题目失败:', err)
        if (this.$message?.error) {
          this.$message.error(err.message || '删除题目失败，请稍后重试')
        }
      } finally {
        this.deleteLoading = false
      }
    },
    openColorPicker(problem) {
      this.currentColorProblem = problem
      // 如果有颜色，转换为hex格式；否则使用默认红色
      const color = problem.color || '#FF0000'
      // 如果是 rgb 格式，转换为 hex
      this.selectedColor = color.startsWith('rgb') ? this.rgbToHex(color) : color
      this.showColorPicker = true
    },
    closeColorPicker() {
      this.showColorPicker = false
      this.currentColorProblem = null
      this.selectedColor = '#FF0000'
    },
    rgbToHex(rgb) {
      // 将 rgb(r, g, b) 或 rgba(r, g, b, a) 转换为 #RRGGBB
      if (!rgb || rgb.startsWith('#')) return rgb
      const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
      if (!match) return rgb
      const r = parseInt(match[1])
      const g = parseInt(match[2])
      const b = parseInt(match[3])
      return '#' + [r, g, b].map(x => {
        const hex = x.toString(16)
        return hex.length === 1 ? '0' + hex : hex
      }).join('').toUpperCase()
    },
    hexToRgb(hex) {
      // 将 #RRGGBB 转换为 rgb(r, g, b)
      if (!hex || !hex.startsWith('#')) return hex
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      if (!result) return hex
      const r = parseInt(result[1], 16)
      const g = parseInt(result[2], 16)
      const b = parseInt(result[3], 16)
      return `rgb(${r}, ${g}, ${b})`
    },
    async confirmColorChange() {
      if (!this.contestId || !this.currentColorProblem) return
      
      // 处理颜色选择器返回的对象格式
      let colorValue = this.selectedColor
      if (typeof colorValue === 'object' && colorValue.hex) {
        colorValue = colorValue.hex
      }
      
      // 将 hex 颜色转换为 RGB 格式
      const rgbColor = this.hexToRgb(colorValue)
      
      try {
        const response = await updateContestProblemColor(
          this.contestId, 
          this.currentColorProblem.id,
          { color: rgbColor }
        )
        
        if (response.code === 'success') {
          if (this.$message?.success) {
            this.$message.success('颜色更新成功')
          }
          // 刷新比赛题目列表
          await this.fetchProblems()
          this.closeColorPicker()
        } else {
          if (this.$message?.error) {
            this.$message.error(response.message || '颜色更新失败')
          }
        }
      } catch (err) {
        console.error('颜色更新失败:', err)
        if (this.$message?.error) {
          this.$message.error(err.message || '颜色更新失败，请稍后重试')
        }
      }
    }
  }
}
</script>

<style scoped>
.contest-problem-manage {
  min-height: 400px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e8e8e8;
}

.btn-back {
  padding: 6px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background-color: #ffffff;
  color: #333333;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 12px;
}

.btn-back:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.page-header h1 {
  font-size: 24px;
  line-height: 32px;
  color: #222222;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 14px;
  color: #444444;
  margin: 0;
}

.page-actions {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-top: 28px;
}

.btn-create-problem,
.btn-add-from-bank {
  padding: 8px 16px;
  border: 1px solid #1890ff;
  border-radius: 4px;
  background-color: #1890ff;
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-create-problem:hover,
.btn-add-from-bank:hover {
  background-color: #40a9ff;
  border-color: #40a9ff;
}

.btn-add-from-bank {
  background-color: #52c41a;
  border-color: #52c41a;
}

.btn-add-from-bank:hover {
  background-color: #73d13d;
  border-color: #73d13d;
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666666;
}

.error-state {
  color: #ff4d4f;
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
  margin-top: 16px;
}

.btn-retry:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.problems-table-container {
  overflow-x: auto;
}

.problems-table {
  width: 100%;
  border-collapse: collapse;
  background-color: #ffffff;
}

.problems-table thead {
  background-color: #fafafa;
}

.problems-table th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  font-size: 14px;
  color: #222222;
  border-bottom: 2px solid #e8e8e8;
  white-space: nowrap;
}

.problems-table td {
  padding: 12px 16px;
  font-size: 14px;
  color: #333333;
  border-bottom: 1px solid #f0f0f0;
}

.problems-table tbody tr:hover {
  background-color: #f8f9fa;
}

.color-cell {
  display: flex;
  align-items: center;
  justify-content: center;
}

.color-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.color-circle:hover {
  transform: scale(1.15);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
}

.btn-action {
  padding: 5px 14px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid;
  white-space: nowrap;
}

.btn-edit {
  background-color: #e6f7ff;
  border-color: #1890ff;
  color: #1890ff;
}

.btn-edit:hover {
  background-color: #1890ff;
  color: #ffffff;
}

.btn-delete {
  background-color: #fff1f0;
  border-color: #ff4d4f;
  color: #ff4d4f;
}

.btn-delete:hover {
  background-color: #ff4d4f;
  color: #ffffff;
}

/* 题库添加对话框样式 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.problem-bank-modal {
  width: 90%;
  max-width: 900px;
  max-height: 85vh;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e8e8e8;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333333;
}

.modal-close-btn {
  background: none;
  border: none;
  font-size: 28px;
  color: #666666;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.modal-close-btn:hover {
  background-color: #f5f5f5;
  color: #333333;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.search-container {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.search-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;
}

.search-input:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.btn-search {
  padding: 8px 20px;
  border: 1px solid #1890ff;
  border-radius: 4px;
  background-color: #1890ff;
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-search:hover {
  background-color: #40a9ff;
  border-color: #40a9ff;
}

.problem-bank-table-container {
  overflow-x: auto;
}

.problem-bank-table {
  width: 100%;
  border-collapse: collapse;
  background-color: #ffffff;
}

.problem-bank-table thead {
  background-color: #fafafa;
}

.problem-bank-table th {
  padding: 8px 12px;
  text-align: left;
  font-weight: 600;
  font-size: 13px;
  color: #222222;
  border-bottom: 2px solid #e8e8e8;
  white-space: nowrap;
}

.problem-bank-table td {
  padding: 8px 12px;
  font-size: 13px;
  color: #333333;
  border-bottom: 1px solid #f0f0f0;
}

.problem-bank-table tbody tr:hover {
  background-color: #f8f9fa;
}

.btn-add-problem {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  border: 1px solid #52c41a;
  background-color: #f6ffed;
  color: #52c41a;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.btn-add-problem:hover {
  background-color: #52c41a;
  color: #ffffff;
}

.pagination-container {
  margin-top: 16px;
  padding: 12px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid #e8e8e8;
}

.pagination-info {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 13px;
  color: #444444;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-btn {
  padding: 4px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background-color: #ffffff;
  color: #333333;
  font-size: 13px;
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
  min-width: 28px;
  height: 28px;
  padding: 0 6px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background-color: #ffffff;
  color: #333333;
  font-size: 13px;
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

/* 颜色选择器对话框样式 */
.color-picker-modal {
  width: 90%;
  max-width: 320px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
}

.color-picker-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.color-picker-label {
  font-size: 14px;
  color: #333333;
  margin: 0;
  font-weight: 500;
}

.color-picker-wrapper {
  display: flex;
  justify-content: center;
}

.color-picker-wrapper :deep(.vc-chrome) {
  box-shadow: none;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
}

.color-picker-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e8e8e8;
}

.btn-cancel,
.btn-confirm {
  padding: 8px 20px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid;
}

.btn-cancel {
  background-color: #ffffff;
  border-color: #d9d9d9;
  color: #333333;
}

.btn-cancel:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.btn-confirm {
  background-color: #1890ff;
  border-color: #1890ff;
  color: #ffffff;
}

.btn-confirm:hover {
  background-color: #40a9ff;
  border-color: #40a9ff;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .page-actions {
    width: 100%;
    flex-direction: column;
  }

  .btn-create-problem,
  .btn-add-from-bank {
    width: 100%;
  }

  .problem-bank-modal {
    width: 95%;
    max-height: 90vh;
  }

  .pagination-container {
    flex-direction: column;
    gap: 12px;
  }

  .pagination-info {
    width: 100%;
    justify-content: center;
  }

  .pagination {
    width: 100%;
    justify-content: center;
  }
}
</style>

