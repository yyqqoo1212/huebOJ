<template>
  <div class="discussion-list">
    <div class="discussion-list-container">
      <div class="page-header">
        <h1>讨论区</h1>
        <p class="subtitle">分享知识，交流经验</p>
      </div>

      <div class="filter-bar">
        <div class="filter-group">
          <span class="filter-label">类型筛选：</span>
          <button 
            v-for="type in typeOptions" 
            :key="type.value"
            :class="['filter-btn', { active: selectedType === type.value }]"
            @click="toggleType(type.value)"
          >
            {{ type.label }}
          </button>
        </div>
      </div>

      <div class="discussion-table">
        <div class="table-header">
          <div class="col-title">标题</div>
          <div class="col-type">类型</div>
          <div class="col-author">发布者</div>
          <div class="col-comments">评论数</div>
          <div class="col-likes">点赞数</div>
          <div class="col-time">发布时间</div>
        </div>

        <div v-if="filteredDiscussions.length > 0">
          <div 
            v-for="discussion in filteredDiscussions" 
            :key="discussion.id"
            class="table-row"
            @click="viewDiscussion(discussion.id)"
          >
            <div class="col-title">
              <span class="title-text">{{ discussion.title }}</span>
            </div>
            <div class="col-type">
              <span 
                :class="['type-badge', `type-${discussion.type}`, { clickable: true }]"
                @click.stop="toggleType(discussion.type)"
              >
                {{ getTypeText(discussion.type) }}
              </span>
            </div>
            <div class="col-author">{{ discussion.author }}</div>
            <div class="col-comments">
              <span class="icon">💬</span>
              <span class="count">{{ discussion.comments }}</span>
            </div>
            <div class="col-likes">
              <span class="icon">👍</span>
              <span class="count">{{ discussion.likes }}</span>
            </div>
            <div class="col-time">{{ formatDateTime(discussion.publishTime) }}</div>
          </div>
        </div>
        <div v-else class="empty-state">
          <p class="empty-text">暂无符合条件的讨论</p>
          <p class="empty-hint">请尝试调整筛选条件</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DiscussionList',
  data() {
    return {
      selectedType: null,
      typeOptions: [
        { value: 'solution', label: '题解' },
        { value: 'chat', label: '闲聊' },
        { value: 'help', label: '求解' },
        { value: 'share', label: '分享' }
      ],
      discussions: [
        {
          id: 'D001',
          title: '两数之和的三种解法详解',
          type: 'solution',
          author: '算法大师',
          comments: 24,
          likes: 156,
          publishTime: '2024-03-20T10:30:00'
        },
        {
          id: 'D002',
          title: '今天刷题刷到怀疑人生',
          type: 'chat',
          author: '代码狂人',
          comments: 45,
          likes: 89,
          publishTime: '2024-03-20T09:15:00'
        },
        {
          id: 'D003',
          title: '动态规划问题求解，求大佬帮助',
          type: 'help',
          author: '编程新星',
          comments: 18,
          likes: 12,
          publishTime: '2024-03-20T08:45:00'
        },
        {
          id: 'D004',
          title: '分享一个超好用的算法模板',
          type: 'share',
          author: '数据结构专家',
          comments: 32,
          likes: 234,
          publishTime: '2024-03-19T16:20:00'
        },
        {
          id: 'D005',
          title: '最长回文子串的Manacher算法详解',
          type: 'solution',
          author: '算法大师',
          comments: 28,
          likes: 178,
          publishTime: '2024-03-19T14:30:00'
        },
        {
          id: 'D006',
          title: '有没有一起刷LeetCode的小伙伴？',
          type: 'chat',
          author: '代码练习者',
          comments: 67,
          likes: 145,
          publishTime: '2024-03-19T12:00:00'
        },
        {
          id: 'D007',
          title: '图论算法入门教程分享',
          type: 'share',
          author: '数据结构专家',
          comments: 41,
          likes: 267,
          publishTime: '2024-03-18T18:15:00'
        },
        {
          id: 'D008',
          title: '这个递归问题怎么优化？',
          type: 'help',
          author: '编程入门者',
          comments: 15,
          likes: 8,
          publishTime: '2024-03-18T15:30:00'
        },
        {
          id: 'D009',
          title: '二分查找的边界问题详解',
          type: 'solution',
          author: '代码狂人',
          comments: 22,
          likes: 134,
          publishTime: '2024-03-18T13:20:00'
        },
        {
          id: 'D010',
          title: '刷题打卡，今天完成了10道题！',
          type: 'chat',
          author: '算法爱好者',
          comments: 38,
          likes: 98,
          publishTime: '2024-03-17T20:45:00'
        },
        {
          id: 'D011',
          title: '分享一个超实用的调试技巧',
          type: 'share',
          author: '编程达人',
          comments: 29,
          likes: 189,
          publishTime: '2024-03-17T17:10:00'
        },
        {
          id: 'D012',
          title: '滑动窗口问题求解思路',
          type: 'solution',
          author: '算法新手',
          comments: 19,
          likes: 112,
          publishTime: '2024-03-17T14:25:00'
        },
        {
          id: 'D013',
          title: '有没有好的刷题计划推荐？',
          type: 'help',
          author: '学习中的小白',
          comments: 52,
          likes: 76,
          publishTime: '2024-03-16T19:30:00'
        },
        {
          id: 'D014',
          title: '今天又是被算法虐的一天',
          type: 'chat',
          author: '新手小白',
          comments: 43,
          likes: 67,
          publishTime: '2024-03-16T16:15:00'
        },
        {
          id: 'D015',
          title: '分享一个超棒的在线调试工具',
          type: 'share',
          author: '代码猎人',
          comments: 35,
          likes: 201,
          publishTime: '2024-03-16T11:20:00'
        }
      ]
    }
  },
  computed: {
    filteredDiscussions() {
      if (this.selectedType) {
        return this.discussions.filter(discussion => discussion.type === this.selectedType)
      }
      return this.discussions
    }
  },
  methods: {
    toggleType(type) {
      // 如果点击的是已选中的类型，则取消筛选
      if (this.selectedType === type) {
        this.selectedType = null
      } else {
        this.selectedType = type
      }
    },
    viewDiscussion(id) {
      // 后续实现：查看具体讨论内容
      console.log('查看讨论:', id)
    },
    getTypeText(type) {
      const map = {
        'solution': '题解',
        'chat': '闲聊',
        'help': '求解',
        'share': '分享'
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
    }
  }
}
</script>

<style scoped>
.discussion-list {
  min-height: calc(100vh - 60px);
  background-color: #f5f5f5;
  padding: 40px 20px;
}

.discussion-list-container {
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
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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

.discussion-table {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 2fr 100px 120px 100px 100px 180px;
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
  grid-template-columns: 2fr 100px 120px 100px 100px 180px;
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

.col-title {
  display: flex;
  align-items: center;
}

.title-text {
  color: #333333;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.5;
}

.col-type {
  display: flex;
  align-items: center;
}

.type-badge {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.type-badge.clickable {
  cursor: pointer;
  transition: all 0.2s ease;
}

.type-badge.clickable:hover {
  opacity: 0.8;
  transform: scale(1.05);
}

.type-solution {
  background-color: #e6f7ff;
  color: #1890ff;
}

.type-chat {
  background-color: #fff7e6;
  color: #fa8c16;
}

.type-help {
  background-color: #fff1f0;
  color: #ff4d4f;
}

.type-share {
  background-color: #f6ffed;
  color: #52c41a;
}

.col-author {
  display: flex;
  align-items: center;
  color: #333333;
  font-size: 14px;
  font-weight: 500;
}

.col-comments,
.col-likes {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666666;
  font-size: 14px;
}

.icon {
  font-size: 16px;
}

.count {
  font-weight: 500;
}

.col-time {
  display: flex;
  align-items: center;
  color: #666666;
  font-size: 14px;
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

@media (max-width: 1200px) {
  .table-header,
  .table-row {
    grid-template-columns: 1.5fr 90px 110px 90px 90px 160px;
    gap: 15px;
    padding: 16px 20px;
  }
}

@media (max-width: 768px) {
  .discussion-table {
    overflow-x: auto;
  }

  .table-header,
  .table-row {
    min-width: 1000px;
  }
}
</style>
