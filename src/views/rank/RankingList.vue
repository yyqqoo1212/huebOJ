<template>
  <div class="ranking-list">
    <div class="ranking-list-container">
      <div class="page-header">
        <h1>排行榜</h1>
      </div>

      <div class="ranking-tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.key"
          :class="['tab-btn', { active: activeTab === tab.key }]"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- 做题量排行榜 -->
      <div v-if="activeTab === 'solved'" class="ranking-content">
        <div class="ranking-table">
          <div class="table-header">
            <div class="col-rank">排名</div>
            <div class="col-user">用户</div>
            <div class="col-motto">个性签名</div>
            <div class="col-solved">正确题数</div>
          </div>

          <div v-if="loading" class="loading-state">
            <p class="loading-text">加载中...</p>
          </div>

          <div v-else-if="solvedRanking.length > 0">
            <div 
              v-for="(user, index) in solvedRanking" 
              :key="user.id"
              :class="['table-row', `rank-${index + 1}`, { 'current-user': isCurrentUser(user.id) }]"
            >
              <div class="col-rank">
                <span v-if="index < 3" class="medal">{{ getMedal(index) }}</span>
                <span v-else class="rank-number">{{ (pagination.page - 1) * pagination.page_size + index + 1 }}</span>
              </div>
              <div class="col-user">
                <div class="user-info">
                  <div class="avatar">{{ user.username?.charAt(0)?.toUpperCase() || 'U' }}</div>
                  <div class="user-details">
                    <span class="username">{{ user.username }}</span>
                    <span v-if="user.real_name" class="user-real-name">{{ user.real_name }}</span>
                    <span v-else class="user-id">ID: {{ user.id }}</span>
                  </div>
                </div>
              </div>
              <div class="col-motto">
                <span class="motto-text">{{ user.motto || '-' }}</span>
              </div>
              <div class="col-solved">
                <span class="solved-count">{{ user.accepted_submissions }}</span>
                <span class="solved-label">题</span>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <p class="empty-text">暂无排行榜数据</p>
          </div>
        </div>

        <!-- 翻页器 -->
        <div v-if="!loading && pagination.total_pages > 0" class="pagination-container">
          <div class="pagination-info">
            <span>共 {{ pagination.total }} 人</span>
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
            <button
              v-for="pageNum in getPageNumbers()"
              :key="pageNum"
              :class="['pagination-btn', 'pagination-number', { active: pageNum === pagination.page, disabled: pageNum === '...' }]"
              :disabled="pageNum === '...' || loading"
              @click="pageNum !== '...' && handlePageChange(pageNum)"
            >
              {{ pageNum }}
            </button>
            <button 
              class="pagination-btn"
              :disabled="!pagination.has_next || loading"
              @click="handlePageChange(pagination.page + 1)"
            >
              下一页
            </button>
          </div>
        </div>
      </div>

      <!-- 其他排行榜占位 -->
      <div v-else class="ranking-content">
        <div class="coming-soon">
          <div class="coming-soon-icon">🚧</div>
          <h2>敬请期待</h2>
          <p>该排行榜功能正在开发中，敬请期待！</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getRanking } from '@/api/user'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'RankingList',
  data() {
    return {
      activeTab: 'solved',
      tabs: [
        { key: 'solved', label: '做题量' },
        { key: 'rating', label: '评级' },
        { key: 'contest', label: '比赛' }
      ],
      solvedRanking: [],
      loading: false,
      pagination: {
        page: 1,
        page_size: 20,
        total: 0,
        total_pages: 0,
        has_next: false,
        has_previous: false
      }
    }
  },
  computed: {
    authStore() {
      return useAuthStore()
    },
    currentUserId() {
      return this.authStore.userId || null
    }
  },
  mounted() {
    this.loadRanking()
  },
  methods: {
    async loadRanking() {
      this.loading = true
      try {
        const params = {
          page: this.pagination.page,
          page_size: this.pagination.page_size
        }
        
        const response = await getRanking(params)
        
        if (response.code === 'success' && response.data) {
          this.solvedRanking = response.data.users || []
          if (response.data.pagination) {
            this.pagination = {
              ...this.pagination,
              ...response.data.pagination
            }
          }
        } else {
          this.$message?.error(response.message || '获取排行榜失败')
          this.solvedRanking = []
        }
      } catch (error) {
        console.error('获取排行榜失败:', error)
        this.$message?.error(error.response?.data?.message || error.message || '获取排行榜失败，请稍后重试')
        this.solvedRanking = []
      } finally {
        this.loading = false
      }
    },
    getMedal(index) {
      const medals = ['🥇', '🥈', '🥉']
      return medals[index] || ''
    },
    isCurrentUser(userId) {
      return this.currentUserId && String(this.currentUserId) === String(userId)
    },
    handlePageChange(page) {
      this.pagination.page = page
      this.loadRanking()
      // 滚动到顶部
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    // 生成页码数组（带省略号）
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
    }
  }
}
</script>

<style scoped>
.ranking-list {
  min-height: calc(100vh - 60px);
  background-color: #f5f5f5;
  padding: 40px 20px;
}

.ranking-list-container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h1 {
  font-size: 32px;
  color: #333333;
  margin-bottom: 8px;
}

.ranking-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  background-color: #ffffff;
  padding: 8px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tab-btn {
  flex: 1;
  padding: 6px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background-color: #ffffff;
  color: #333333;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
}

.tab-btn:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.tab-btn.active {
  background-color: #1890ff;
  border-color: #1890ff;
  color: #ffffff;
}

.ranking-content {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.ranking-table {
  padding: 0;
}

.table-header {
  display: grid;
  grid-template-columns: 100px 1fr 300px 150px;
  gap: 20px;
  padding: 10px 24px;
  background-color: #fafafa;
  border-bottom: 2px solid #e8e8e8;
  font-weight: 600;
  font-size: 14px;
  color: #666666;
}

.table-row {
  display: grid;
  grid-template-columns: 100px 1fr 300px 150px;
  gap: 20px;
  padding: 12px 24px;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.2s ease;
}

.table-row:hover {
  background-color: #f8f9fa;
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.table-row.current-user {
  background-color: #e6f7ff;
  border-left: 4px solid #1890ff;
  font-weight: 500;
}

.table-row.current-user:hover {
  background-color: #bae7ff;
}

.table-row:last-child {
  border-bottom: none;
}

.col-rank {
  display: flex;
  align-items: center;
  font-weight: 600;
  font-size: 14px;
  color: #333333;
}

.medal {
  font-size: 20px;
}

.rank-number {
  color: #666666;
  font-size: 14px;
}

.col-user {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #1890ff;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.username {
  font-size: 15px;
  font-weight: 500;
  color: #333333;
}

.user-real-name {
  font-size: 12px;
  color: #666666;
}

.user-id {
  font-size: 12px;
  color: #999999;
}

.col-motto {
  display: flex;
  align-items: center;
}

.motto-text {
  font-size: 14px;
  color: #666666;
  font-style: italic;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.col-solved {
  display: flex;
  align-items: center;
  gap: 4px;
}

.solved-count {
  font-size: 16px;
  font-weight: 600;
  color: #333333;
}

.solved-label {
  font-size: 14px;
  color: #666666;
}

.loading-state {
  padding: 60px 20px;
  text-align: center;
}

.loading-text {
  font-size: 18px;
  color: #666666;
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
}

.empty-text {
  font-size: 18px;
  color: #666666;
}

.coming-soon {
  padding: 60px 20px;
  text-align: center;
}

.coming-soon-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.coming-soon h2 {
  font-size: 20px;
  color: #333333;
  margin-bottom: 8px;
}

.coming-soon p {
  font-size: 14px;
  color: #666666;
}

/* 翻页器样式 */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-top: 1px solid #f0f0f0;
  background-color: #fafafa;
}

.pagination-info {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: #666666;
}

.page-info {
  color: #999999;
}

.pagination {
  display: flex;
  gap: 8px;
  align-items: center;
}

.pagination-btn {
  min-width: 36px;
  height: 36px;
  padding: 0 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background-color: #ffffff;
  color: #333333;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
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

.pagination-number {
  min-width: 36px;
}

.pagination-number.active {
  background-color: #1890ff;
  border-color: #1890ff;
  color: #ffffff;
}

.pagination-number.disabled {
  cursor: default;
  border: none;
  background: transparent;
}

.pagination-number.disabled:hover {
  border: none;
  color: #333333;
}

@media (max-width: 768px) {
  .table-header,
  .table-row {
    grid-template-columns: 80px 1fr 200px 100px;
    gap: 12px;
    padding: 12px;
  }

  .ranking-tabs {
    flex-direction: column;
  }

  .tab-btn {
    width: 100%;
  }

  .avatar {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }

  .solved-count {
    font-size: 20px;
  }

  .pagination-container {
    flex-direction: column;
    gap: 16px;
  }

  .pagination {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
