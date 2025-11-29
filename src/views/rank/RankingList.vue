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
            <div class="col-solved">正确题数</div>
            <div class="col-progress">进度</div>
          </div>

          <div v-if="solvedRanking.length > 0">
            <div 
              v-for="(user, index) in solvedRanking" 
              :key="user.id"
              :class="['table-row', `rank-${index + 1}`]"
            >
              <div class="col-rank">
                <span v-if="index < 3" class="medal">{{ getMedal(index) }}</span>
                <span v-else class="rank-number">{{ index + 1 }}</span>
              </div>
               <div class="col-user">
                 <div class="user-info">
                   <div class="avatar">{{ user.avatar || user.name.charAt(0) }}</div>
                   <div class="user-details">
                     <span class="username">{{ user.name }}</span>
                     <span class="user-id">ID: {{ user.id }}</span>
                   </div>
                 </div>
               </div>
              <div class="col-solved">
                <span class="solved-count">{{ user.solvedCount }}</span>
                <span class="solved-label">题</span>
              </div>
              <div class="col-progress">
                <div class="progress-bar">
                  <div 
                    class="progress-fill" 
                    :style="{ width: (user.solvedCount / maxSolved) * 100 + '%' }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <p class="empty-text">暂无排行榜数据</p>
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
       solvedRanking: [
         {
           id: 'U001',
           name: '算法大师',
           avatar: 'A',
           solvedCount: 256,
           slogan: '💪 代码虐我千百遍，我待代码如初恋！'
         },
         {
           id: 'U002',
           name: '代码狂人',
           avatar: 'C',
           solvedCount: 234,
           slogan: '🔥 一天不刷题，浑身不舒服！'
         },
         {
           id: 'U003',
           name: '数据结构专家',
           avatar: 'D',
           solvedCount: 198,
           slogan: '🌳 树是我的好朋友，链表是我的好兄弟！'
         },
         {
           id: 'U004',
           name: '编程新星',
           avatar: 'P',
           solvedCount: 187,
           slogan: '⭐ 虽然我是新星，但我会成为超新星！'
         },
         {
           id: 'U013',
           name: '代码练习者',
           avatar: 'C',
           solvedCount: 65,
           slogan: '📚 每天进步一点点，总有一天会逆袭！'
         },
         {
           id: 'U014',
           name: '编程入门者',
           avatar: 'P',
           solvedCount: 54,
           slogan: '🎯 虽然菜，但我有梦想！'
         },
         {
           id: 'U015',
           name: '新手小白',
           avatar: 'N',
           solvedCount: 43,
           slogan: '😅 小白也有大梦想，总有一天会变强！'
         }
       ]
    }
  },
  computed: {
    maxSolved() {
      return this.solvedRanking.length > 0 ? this.solvedRanking[0].solvedCount : 1
    }
  },
  methods: {
    getMedal(index) {
      const medals = ['🥇', '🥈', '🥉']
      return medals[index] || ''
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
  grid-template-columns: 100px 1fr 150px 200px;
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
  grid-template-columns: 100px 1fr 150px 200px;
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

.user-id {
  font-size: 12px;
  color: #999999;
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

.col-progress {
  display: flex;
  align-items: center;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #52c41a 0%, #73d13d 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
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

@media (max-width: 768px) {
  .table-header,
  .table-row {
    grid-template-columns: 80px 1fr 100px 120px;
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
}
</style>
