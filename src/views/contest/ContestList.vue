<template>
  <div class="contest-list">
    <div class="contest-list-container">

      <div class="filter-bar">
        <div class="search-box">
          <input 
            type="text" 
            v-model="searchQuery"
            placeholder="搜索比赛号..." 
            class="search-input"
          />
          <span class="search-icon">🔍</span>
        </div>
        <div class="filter-buttons">
          <div class="filter-group">
            <span class="filter-label">赛制筛选：</span>
            <button 
              v-for="format in formatOptions" 
              :key="format.value"
              :class="['filter-btn', { active: selectedFilter === 'format' && selectedFilterValue === format.value }]"
              @click="toggleFilter('format', format.value)"
            >
              {{ format.label }}
            </button>
          </div>
          <div class="filter-group">
            <span class="filter-label">赛种筛选：</span>
            <button 
              v-for="type in typeOptions" 
              :key="type.value"
              :class="['filter-btn', { active: selectedFilter === 'type' && selectedFilterValue === type.value }]"
              @click="toggleFilter('type', type.value)"
            >
              {{ type.label }}
            </button>
          </div>
          <div class="filter-group">
            <span class="filter-label">状态筛选：</span>
            <button 
              v-for="status in statusOptions" 
              :key="status.value"
              :class="['filter-btn', { active: selectedFilter === 'status' && selectedFilterValue === status.value }]"
              @click="toggleFilter('status', status.value)"
            >
              {{ status.label }}
            </button>
          </div>
        </div>
      </div>

      <div class="contest-table">
        <div class="table-header">
          <div class="col-image">图片</div>
          <div class="col-id">比赛号</div>
          <div class="col-name">比赛名称</div>
          <div class="col-start-time">开始时间</div>
          <div class="col-duration">持续时间</div>
          <div class="col-format">赛制</div>
          <div class="col-type">赛种</div>
          <div class="col-participants">参赛人数</div>
          <div class="col-status">状态</div>
        </div>

        <div v-if="filteredContests.length > 0">
          <div 
            v-for="contest in filteredContests" 
            :key="contest.id"
            class="table-row"
          >
            <div class="col-image">
              <img :src="contest.image" :alt="contest.name" class="contest-image" />
            </div>
            <div class="col-id">{{ contest.id }}</div>
            <div class="col-name">
              <span class="name-text">{{ contest.name }}</span>
            </div>
            <div class="col-start-time">{{ formatDateTime(contest.startTime) }}</div>
            <div class="col-duration">{{ formatDuration(contest.duration) }}</div>
            <div class="col-format">
              <span 
                :class="['format-badge', `format-${contest.format}`, { clickable: true }]"
                @click.stop="toggleFilter('format', contest.format)"
              >
                {{ getFormatText(contest.format) }}
              </span>
            </div>
            <div class="col-type">
              <span 
                :class="['type-badge', `type-${contest.type}`, { clickable: true }]"
                @click.stop="toggleFilter('type', contest.type)"
              >
                {{ getTypeText(contest.type) }}
              </span>
            </div>
            <div class="col-participants">{{ contest.participants }}</div>
            <div class="col-status">
              <span 
                :class="['status-badge', `status-${contest.status}`, { clickable: true }]"
                @click.stop="toggleFilter('status', contest.status)"
              >
                {{ getStatusText(contest.status) }}
              </span>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          <p class="empty-text">暂无符合条件的比赛</p>
          <p class="empty-hint">请尝试调整搜索条件</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ContestList',
  data() {
    return {
      searchQuery: '',
      selectedFilter: null, // 'format', 'type', 'status' 或 null
      selectedFilterValue: null,
      formatOptions: [
        { value: 'acm', label: 'ACM' },
        { value: 'ioi', label: 'IOI' },
        { value: 'io', label: 'IO' }
      ],
      typeOptions: [
        { value: 'public', label: '公开赛' },
        { value: 'private', label: '私有赛' }
      ],
      statusOptions: [
        { value: 'upcoming', label: '即将开始' },
        { value: 'active', label: '进行中' },
        { value: 'ended', label: '已结束' }
      ],
      contests: [
        {
          id: 'C001',
          name: '2024春季ACM程序设计竞赛',
          startTime: '2024-03-20T09:00:00',
          duration: 180,
          format: 'acm',
          type: 'public',
          participants: 256,
          status: 'upcoming',
          image: require('@/assets/images/acm.png')
        },
        {
          id: 'C002',
          name: '算法竞赛训练营',
          startTime: '2024-03-15T14:00:00',
          duration: 120,
          format: 'ioi',
          type: 'private',
          participants: 128,
          status: 'active',
          image: require('@/assets/images/acm.png')
        },
        {
          id: 'C003',
          name: '数据结构挑战赛',
          startTime: '2024-03-10T10:00:00',
          duration: 150,
          format: 'io',
          type: 'public',
          participants: 189,
          status: 'ended',
          image: require('@/assets/images/acm.png')
        },
        {
          id: 'C004',
          name: '全国大学生程序设计竞赛',
          startTime: '2024-04-01T08:00:00',
          duration: 300,
          format: 'acm',
          type: 'public',
          participants: 512,
          status: 'upcoming',
          image: require('@/assets/images/acm.png')
        },
        {
          id: 'C005',
          name: 'IOI赛制练习赛',
          startTime: '2024-03-18T13:30:00',
          duration: 240,
          format: 'ioi',
          type: 'public',
          participants: 203,
          status: 'active',
          image: require('@/assets/images/acm.png')
        },
        {
          id: 'C006',
          name: '校内选拔赛',
          startTime: '2024-03-05T09:00:00',
          duration: 180,
          format: 'acm',
          type: 'private',
          participants: 96,
          status: 'ended',
          image: require('@/assets/images/acm.png')
        },
        {
          id: 'C007',
          name: '动态规划专题赛',
          startTime: '2024-03-25T15:00:00',
          duration: 120,
          format: 'io',
          type: 'public',
          participants: 167,
          status: 'upcoming',
          image: require('@/assets/images/acm.png')
        }
      ]
    }
  },
  computed: {
    filteredContests() {
      let result = [...this.contests]

      // 搜索筛选（比赛号）
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.trim().toUpperCase()
        result = result.filter(contest => {
          return contest.id.toUpperCase().includes(query)
        })
      }

      // 互斥筛选：只应用最后一个选择的筛选条件
      if (this.selectedFilter && this.selectedFilterValue) {
        if (this.selectedFilter === 'format') {
          result = result.filter(contest => contest.format === this.selectedFilterValue)
        } else if (this.selectedFilter === 'type') {
          result = result.filter(contest => contest.type === this.selectedFilterValue)
        } else if (this.selectedFilter === 'status') {
          result = result.filter(contest => contest.status === this.selectedFilterValue)
        }
      }

      // 按开始时间排序，越晚开始的排在前面
      result.sort((a, b) => {
        const timeA = new Date(a.startTime).getTime()
        const timeB = new Date(b.startTime).getTime()
        return timeB - timeA // 降序排列
      })

      return result
    }
  },
  methods: {
    toggleFilter(filterType, filterValue) {
      // 如果点击的是已选中的筛选条件，则取消筛选
      if (this.selectedFilter === filterType && this.selectedFilterValue === filterValue) {
        this.selectedFilter = null
        this.selectedFilterValue = null
      } else {
        // 否则设置新的筛选条件（会覆盖之前的筛选）
        this.selectedFilter = filterType
        this.selectedFilterValue = filterValue
      }
    },
    getStatusText(status) {
      const map = {
        'upcoming': '即将开始',
        'active': '进行中',
        'ended': '已结束'
      }
      return map[status] || status
    },
    getFormatText(format) {
      const map = {
        'acm': 'ACM',
        'ioi': 'IOI',
        'io': 'IO'
      }
      return map[format] || format
    },
    getTypeText(type) {
      const map = {
        'public': '公开赛',
        'private': '私有赛'
      }
      return map[type] || type
    },
    formatDateTime(dateString) {
      const date = new Date(dateString)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}`
    },
    formatDuration(minutes) {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      if (hours > 0) {
        return `${hours}小时${mins}分钟`
      }
      return `${mins}分钟`
    }
  }
}
</script>

<style scoped>
.contest-list {
  min-height: calc(100vh - 60px);
  background-color: #f5f5f5;
  padding: 40px 20px;
}

.contest-list-container {
  max-width: 1400px;
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

.subtitle {
  font-size: 16px;
  color: #666666;
}

.filter-bar {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 20px 24px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.filter-buttons {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-label {
  font-size: 14px;
  color: #666666;
  font-weight: 500;
  min-width: 80px;
}

.filter-btn {
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

.filter-btn:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.filter-btn.active {
  background-color: #1890ff;
  border-color: #1890ff;
  color: #ffffff;
}

.filter-btn.active:hover {
  background-color: #40a9ff;
  border-color: #40a9ff;
}

.search-box {
  position: relative;
  max-width: 500px;
}

.search-input {
  width: 100%;
  padding: 10px 40px 10px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.3s ease;
  outline: none;
}

.search-input:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.search-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  color: #999999;
  pointer-events: none;
}

.contest-table {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 100px 100px 1fr 180px 120px 100px 100px 100px 100px;
  gap: 20px;
  padding: 16px 24px;
  background-color: #fafafa;
  border-bottom: 2px solid #e8e8e8;
  font-weight: 600;
  font-size: 14px;
  color: #666666;
}

.table-row {
  display: grid;
  grid-template-columns: 100px 100px 1fr 180px 120px 100px 100px 100px 100px;
  gap: 20px;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.table-row:hover {
  background-color: #f8f9fa;
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.table-row:last-child {
  border-bottom: none;
}

.col-image {
  display: flex;
  align-items: center;
}

.contest-image {
  width: 80px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
}

.col-id {
  font-weight: 600;
  color: #1890ff;
  display: flex;
  align-items: center;
}

.col-name {
  display: flex;
  align-items: center;
}

.name-text {
  color: #333333;
  font-size: 15px;
  font-weight: 500;
}

.col-start-time {
  display: flex;
  align-items: center;
  color: #666666;
  font-size: 14px;
}

.col-duration {
  display: flex;
  align-items: center;
  color: #666666;
  font-size: 14px;
}

.col-format {
  display: flex;
  align-items: center;
}

.col-type {
  display: flex;
  align-items: center;
}

.col-participants {
  display: flex;
  align-items: center;
  color: #666666;
  font-size: 14px;
}

.col-status {
  display: flex;
  align-items: center;
}

.format-badge,
.type-badge,
.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.format-badge.clickable,
.type-badge.clickable,
.status-badge.clickable {
  cursor: pointer;
  transition: all 0.2s ease;
}

.format-badge.clickable:hover,
.type-badge.clickable:hover,
.status-badge.clickable:hover {
  opacity: 0.8;
  transform: scale(1.05);
}

.format-acm {
  background-color: #e6f7ff;
  color: #1890ff;
}

.format-ioi {
  background-color: #fff7e6;
  color: #fa8c16;
}

.format-io {
  background-color: #f6ffed;
  color: #52c41a;
}

.type-public {
  background-color: #f0f0f0;
  color: #333333;
}

.type-private {
  background-color: #fff1f0;
  color: #ff4d4f;
}

.status-upcoming {
  background-color: #e6f7ff;
  color: #1890ff;
}

.status-active {
  background-color: #f6ffed;
  color: #52c41a;
}

.status-ended {
  background-color: #fff1f0;
  color: #ff4d4f;
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
}

.empty-text {
  font-size: 18px;
  color: #666666;
  margin-bottom: 8px;
}

.empty-hint {
  font-size: 14px;
  color: #999999;
}

@media (max-width: 1400px) {
  .table-header,
  .table-row {
    grid-template-columns: 80px 90px 1fr 160px 110px 90px 90px 90px 90px;
    gap: 15px;
    padding: 16px 20px;
  }
}

@media (max-width: 1200px) {
  .table-header,
  .table-row {
    grid-template-columns: 70px 80px 1fr 150px 100px 80px 80px 80px 80px;
    gap: 12px;
    padding: 14px 16px;
  }

  .contest-image {
    width: 60px;
    height: 40px;
  }
}

@media (max-width: 768px) {
  .contest-table {
    overflow-x: auto;
  }

  .table-header,
  .table-row {
    min-width: 1200px;
  }

  .search-box {
    max-width: 100%;
  }
}
</style>
