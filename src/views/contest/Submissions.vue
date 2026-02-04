<template>
  <div class="submission-list">
    <div class="submission-list-container">

      <!-- 筛选栏（复用提交列表页样式与字段） -->
      <div class="filter-bar">
        <div class="filter-group">
          <label class="filter-label">题目ID：</label>
          <input 
            v-model="filters.problem_id" 
            type="text"
            placeholder="输入题目ID"
            class="filter-input"
          />
        </div>

        <div class="filter-group">
          <label class="filter-label">语言：</label>
          <select 
            v-model="filters.language" 
            @change="handleFilterChange"
            class="filter-select"
            :disabled="loading"
          >
            <option value="">全部</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">状态：</label>
          <select 
            v-model="filters.status" 
            @change="handleFilterChange"
            class="filter-select"
            :disabled="loading"
          >
            <option value="">全部</option>
            <option value="0">Accepted</option>
            <option value="-1">Wrong Answer</option>
            <option value="1">Time Limit Exceeded</option>
            <option value="3">Memory Limit Exceeded</option>
            <option value="4">Runtime Error</option>
            <option value="5">Compile Error</option>
            <option value="6">System Error</option>
            <option value="7">Judging</option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">测评ID：</label>
          <input 
            v-model="filters.submission_id" 
            type="text"
            placeholder="输入测评ID"
            class="filter-input"
          />
        </div>

        <button 
          class="btn-clear-filters" 
          @click="clearFilters"
          :disabled="loading"
        >
          清除筛选
        </button>
      </div>

      <div v-if="loading" class="loading-container">
        <p>加载中...</p>
      </div>

      <div v-else-if="error" class="error-container">
        <p class="error-text">{{ error }}</p>
        <button class="btn-retry" @click="loadSubmissions">重试</button>
      </div>

      <div v-else class="submission-table">
        <div class="table-header">
          <div class="col-id">测评ID</div>
          <div class="col-problem">题目</div>
          <div class="col-status">状态</div>
          <div class="col-time">运行时间</div>
          <div class="col-memory">运行内存</div>
          <div class="col-length">代码长度</div>
          <div class="col-language">语言</div>
          <div class="col-user">提交用户</div>
          <div class="col-submit-time">提交时间</div>
        </div>

        <div v-if="submissions.length > 0">
          <div 
            v-for="submission in submissions" 
            :key="submission.submission_id"
            class="table-row"
            @click="viewSubmission(submission.submission_id)"
          >
            <div class="col-id">
              <span class="id-link">
                {{ submission.submission_id }}
              </span>
            </div>
            <div class="col-problem">
              <span class="problem-link" @click.stop="goToProblem(submission.problem_id)">
                {{ submission.problem_title }}
              </span>
            </div>
            <div class="col-status">
              <span :class="['status-badge', getStatusClass(submission.status)]">
                {{ submission.status_text }}
              </span>
            </div>
            <div class="col-time">{{ submission.cpu_time }}ms</div>
            <div class="col-memory">{{ formatMemory(submission.memory) }}KB</div>
            <div class="col-length">{{ submission.code_length }}B</div>
            <div class="col-language">{{ getLanguageName(submission.language) }}</div>
            <div class="col-user">
              <span class="user-link">
                {{ submission.username }}
              </span>
            </div>
            <div class="col-submit-time">{{ formatDateTime(submission.submit_time) }}</div>
          </div>
        </div>
        <div v-else class="empty-state">
          <p class="empty-text">暂无提交记录</p>
        </div>

        <!-- 翻页器，与提交列表页保持一致 -->
        <div v-if="!loading && pagination && pagination.total_pages > 0" class="pagination-container">
          <div class="pagination-info">
            <span>共 {{ pagination.total }} 条</span>
            <span class="page-info">第 {{ pagination.page }} / {{ pagination.total_pages }} 页</span>
          </div>
          <div class="pagination">
            <button 
              class="pagination-btn"
              :disabled="!pagination.has_previous || loading"
              @click="handlePageChange(pagination.page - 1)"
            >
              上一页
            </button>
            
            <div class="pagination-pages">
              <button
                v-for="page in getPageNumbers()"
                :key="page"
                :class="['pagination-page-btn', { active: page === pagination.page, ellipsis: page === '...' }]"
                :disabled="page === '...' || loading"
                @click="page !== '...' && handlePageChange(page)"
              >
                {{ page }}
              </button>
            </div>
            
            <button 
              class="pagination-btn"
              :disabled="!pagination.has_next || loading"
              @click="handlePageChange(pagination.page + 1)"
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
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getContestSubmissions } from '@/api/contest'

const router = useRouter()
const route = useRoute()

const submissions = ref([])
const loading = ref(true)
const error = ref(null)

const pagination = ref({
  page: 1,
  page_size: 20,
  total: 0,
  total_pages: 0,
  has_next: false,
  has_previous: false
})

const filters = ref({
  problem_id: '',
  language: '',
  status: '',
  submission_id: ''
})

let problemIdTimer = null
let submissionIdTimer = null

const viewSubmission = (submissionId) => {
  router.push({
    name: 'SubmissionDetail',
    params: { id: submissionId }
  })
}

const goToProblem = (problemId) => {
  router.push({
    name: 'ProblemDetail',
    params: { id: problemId }
  })
}

const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return ''
  const date = new Date(dateTimeStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

const formatMemory = (memoryBytes) => {
  if (!memoryBytes) return '0'
  return Math.round(memoryBytes / 1024)
}

const getLanguageName = (lang) => {
  const map = {
    cpp: 'C++',
    java: 'Java',
    python: 'Python',
    javascript: 'JavaScript'
  }
  return map[lang] || lang
}

const getStatusClass = (status) => {
  const statusMap = {
    0: 'status-accepted',
    '-1': 'status-wrong-answer',
    1: 'status-time-limit',
    2: 'status-time-limit',
    3: 'status-memory-limit',
    4: 'status-runtime-error',
    5: 'status-compile-error',
    6: 'status-system-error',
    7: 'status-judging'
  }
  return statusMap[status] || 'status-unknown'
}

// 监听题目ID和测评ID变化，使用防抖与提交列表页保持一致
watch(
  () => filters.value.problem_id,
  () => {
    debounceProblemId()
  }
)

watch(
  () => filters.value.submission_id,
  () => {
    debounceSubmissionId()
  }
)

const debounceProblemId = () => {
  if (problemIdTimer) {
    clearTimeout(problemIdTimer)
  }
  problemIdTimer = setTimeout(() => {
    pagination.value.page = 1
    loadSubmissions()
    problemIdTimer = null
  }, 800)
}

const debounceSubmissionId = () => {
  if (submissionIdTimer) {
    clearTimeout(submissionIdTimer)
  }
  submissionIdTimer = setTimeout(() => {
    pagination.value.page = 1
    loadSubmissions()
    submissionIdTimer = null
  }, 800)
}

const handleFilterChange = () => {
  pagination.value.page = 1
  loadSubmissions()
}

const clearFilters = () => {
  if (problemIdTimer) {
    clearTimeout(problemIdTimer)
    problemIdTimer = null
  }
  if (submissionIdTimer) {
    clearTimeout(submissionIdTimer)
    submissionIdTimer = null
  }
  filters.value = {
    problem_id: '',
    language: '',
    status: '',
    submission_id: ''
  }
  handleFilterChange()
}

const loadSubmissions = async () => {
  const contestId = route.params.id
  if (!contestId) {
    error.value = '比赛ID不存在'
    return
  }

  loading.value = true
  error.value = null
  try {
    const params = {
      page: pagination.value.page,
      page_size: pagination.value.page_size
    }

    if (filters.value.problem_id && filters.value.problem_id.trim()) {
      const problemId = parseInt(filters.value.problem_id.trim())
      if (!isNaN(problemId) && problemId > 0) {
        params.problem_id = problemId
      }
    }
    if (filters.value.language) {
      params.language = filters.value.language
    }
    if (filters.value.status !== '') {
      params.status = parseInt(filters.value.status)
    }
    if (filters.value.submission_id && filters.value.submission_id.trim()) {
      const submissionId = parseInt(filters.value.submission_id.trim())
      if (!isNaN(submissionId) && submissionId > 0) {
        params.submission_id = submissionId
      }
    }

    const response = await getContestSubmissions(contestId, params)

    if (response.code === 'success' && response.data) {
      submissions.value = response.data.submissions || []
      if (response.data.pagination) {
        pagination.value = {
          ...pagination.value,
          ...response.data.pagination
        }
      }
    } else {
      error.value = response.message || '获取提交记录失败'
      submissions.value = []
    }
  } catch (e) {
    console.error('获取比赛提交记录失败:', e)
    error.value = e.response?.data?.message || e.message || '获取提交记录失败，请稍后重试'
    submissions.value = []
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page) => {
  pagination.value.page = page
  loadSubmissions()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handlePageSizeChange = (pageSize) => {
  pagination.value.page_size = pageSize
  pagination.value.page = 1
  loadSubmissions()
}

const getPageNumbers = () => {
  const current = pagination.value.page
  const total = pagination.value.total_pages
  const pages = []

  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 3) {
      pages.push(1)
      pages.push('...')
      for (let i = total - 4; i <= total; i++) {
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
}

onMounted(() => {
  loadSubmissions()
})
</script>

<style scoped>
.submission-list {
  min-height: calc(100vh - 60px);
  background-color: #f5f5f5;
  padding: 40px 20px;
}

.submission-list-container {
  max-width: 1400px;
  margin: 0 auto;
}

.filter-bar {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px 24px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  font-size: 14px;
  color: #666666;
  font-weight: 500;
  white-space: nowrap;
}

.filter-select {
  padding: 6px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  color: #333333;
  background-color: #ffffff;
  cursor: pointer;
  outline: none;
  transition: all 0.3s ease;
  min-width: 150px;
}

.filter-select:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.filter-select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.filter-input {
  padding: 6px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  color: #333333;
  background-color: #ffffff;
  outline: none;
  transition: all 0.3s ease;
  min-width: 180px;
}

.filter-input:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.filter-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.filter-input::placeholder {
  color: #999999;
}

.btn-clear-filters {
  padding: 6px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background-color: #ffffff;
  color: #666666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
  white-space: nowrap;
  margin-left: auto;
}

.btn-clear-filters:hover:not(:disabled) {
  border-color: #ff4d4f;
  color: #ff4d4f;
  background-color: #fff1f0;
}

.btn-clear-filters:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading-container,
.error-container {
  text-align: center;
  padding: 60px 20px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.error-text {
  color: #ff4d4f;
  font-size: 16px;
  margin-bottom: 20px;
}

.btn-retry {
  padding: 8px 24px;
  border: 1px solid #1890ff;
  border-radius: 6px;
  background-color: #1890ff;
  color: #ffffff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-retry:hover {
  background-color: #40a9ff;
  border-color: #40a9ff;
}

.submission-table {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 100px 1fr 120px 120px 120px 120px 100px 120px 180px;
  gap: 20px;
  padding: 8px 24px;
  background-color: #fafafa;
  border-bottom: 2px solid #e8e8e8;
  font-weight: 600;
  font-size: 14px;
  color: #666666;
}

.table-row {
  display: grid;
  grid-template-columns: 100px 1fr 120px 120px 120px 120px 100px 120px 180px;
  gap: 20px;
  padding: 8px 24px;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.2s ease;
  cursor: pointer;
}

.table-row:hover {
  background-color: #f8f9fa;
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.table-row:last-child {
  border-bottom: none;
}

.col-id {
  display: flex;
  align-items: center;
}

.id-link {
  color: #1890ff;
  font-weight: 600;
  transition: all 0.2s ease;
}

.col-problem {
  display: flex;
  align-items: center;
}

.problem-link {
  color: #333333;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.problem-link:hover {
  color: #1890ff;
  text-decoration: underline;
}

.col-status {
  display: flex;
  align-items: center;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.status-accepted {
  background-color: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

.status-wrong-answer {
  background-color: #fff1f0;
  color: #ff4d4f;
  border: 1px solid #ffccc7;
}

.status-time-limit {
  background-color: #fffbe6;
  color: #faad14;
  border: 1px solid #ffe58f;
}

.status-memory-limit {
  background-color: #fff7e6;
  color: #fa8c16;
  border: 1px solid #ffd591;
}

.status-runtime-error {
  background-color: #fff0f6;
  color: #eb2f96;
  border: 1px solid #ffadd2;
}

.status-compile-error {
  background-color: #f9f0ff;
  color: #722ed1;
  border: 1px solid #d3adf7;
}

.status-system-error {
  background-color: #f5f5f5;
  color: #8c8c8c;
  border: 1px solid #d9d9d9;
}

.status-judging {
  background-color: #e6f7ff;
  color: #1890ff;
  border: 1px solid #91d5ff;
}

.status-unknown {
  background-color: #f5f5f5;
  color: #8c8c8c;
  border: 1px solid #d9d9d9;
}

.col-time,
.col-memory,
.col-length,
.col-language,
.col-submit-time {
  display: flex;
  align-items: center;
  color: #666666;
  font-size: 14px;
}

.col-user {
  display: flex;
  align-items: center;
}

.user-link {
  color: #1890ff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.user-link:hover {
  color: #40a9ff;
  text-decoration: underline;
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
}

.empty-text {
  font-size: 18px;
  color: #666666;
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
  .submission-table {
    overflow-x: auto;
  }

  .table-header,
  .table-row {
    min-width: 1400px;
  }

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

  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-group {
    width: 100%;
  }

  .filter-select,
  .filter-input {
    flex: 1;
    min-width: 0;
  }

  .btn-clear-filters {
    margin-left: 0;
    width: 100%;
  }
}
</style>

