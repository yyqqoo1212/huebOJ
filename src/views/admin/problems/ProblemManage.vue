<template>
  <div class="admin-page">
    <div class="page-header">
      <div>
        <h1>题目管理</h1>
        <p class="page-subtitle">查看并管理题库中的题目</p>
      </div>
      <div class="page-actions">
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
            <th style="width: 80px">题目ID</th>
            <th>标题</th>
            <th style="width: 140px">作者</th>
            <th style="width: 180px">创建时间</th>
            <th style="width: 120px">权限</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="problems.length === 0">
            <td colspan="5" class="empty-text">暂无题目数据</td>
          </tr>
          <tr v-for="problem in problems" :key="problem.id">
            <td>{{ problem.id }}</td>
            <td class="title-cell">{{ problem.title }}</td>
            <td>{{ problem.author || '未知' }}</td>
            <td>{{ problem.create_time || '-' }}</td>
            <td>
              <span class="auth-tag" :class="`auth-${problem.auth}`">
                {{ authText(problem.auth) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="pagination" v-if="pagination.total_pages > 1">
        <button
          class="page-btn"
          :disabled="pagination.page <= 1 || loading"
          @click="changePage(pagination.page - 1)"
        >
          上一页
        </button>
        <span class="page-info">
          第 {{ pagination.page }} / {{ pagination.total_pages }} 页
          （共 {{ pagination.total }} 题）
        </span>
        <button
          class="page-btn"
          :disabled="!pagination.has_next || loading"
          @click="changePage(pagination.page + 1)"
        >
          下一页
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { getProblemList } from '@/api/problem'

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
      }
    }
  },
  created() {
    this.fetchProblems()
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
          page_size: this.pagination.page_size
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
      if (page === this.pagination.page) return
      this.fetchProblems(page)
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

.btn-refresh {
  padding: 6px 12px;
  border-radius: 4px;
  border: 1px solid #1890ff;
  background-color: #e6f7ff;
  color: #1890ff;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-refresh:not(:disabled):hover {
  background-color: #bae7ff;
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

.pagination {
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 13px;
}

.page-btn {
  padding: 4px 10px;
  border-radius: 4px;
  border: 1px solid #d9d9d9;
  background-color: #ffffff;
  cursor: pointer;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #666666;
}
</style>

