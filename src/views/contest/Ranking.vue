<template>
  <div class="contest-ranking icpc">
    <div class="ranking-container">
      <div class="ranking-card">
        <div v-if="forbiddenMessage" class="empty-state">
          <p>{{ forbiddenMessage }}</p>
        </div>
        <div v-else-if="rankings.length > 0" class="ranking-table">
          <div class="table-header">
            <div class="col-rank">排名</div>
            <div class="col-user">用户</div>
            <div class="col-solved">通过题数</div>
            <div class="col-penalty">{{ valueLabel }}</div>
            <div class="col-problems">题目详情</div>
          </div>
          <div 
            v-for="row in rankings" 
            :key="row.userId"
            class="table-row"
            :class="{ 'current-user': row.isCurrentUser }"
          >
            <div class="col-rank">
              <span class="rank-number">{{ row.rank }}</span>
            </div>
            <div class="col-user">{{ row.username }}</div>
            <div class="col-solved">{{ row.solved }}</div>
            <div class="col-penalty">
              <span v-if="contestType === 'ACM'">{{ formatTime(row.totalTime) }}</span>
              <span v-else>{{ formatScore(row.totalScore) }}</span>
            </div>
            <div class="col-problems">
              <div class="problem-status-list">
                <span 
                  v-for="problemId in problemOrder"
                  :key="problemId"
                  :class="['problem-status', `status-${row.problems?.[problemId] || 'none'}`]"
                >
                  {{ problemId }}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          <p>暂无排名数据</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getContestRankings } from '@/api/contest'

const rankings = ref([])
const route = useRoute()
const contestType = ref('')
const problemOrder = ['A', 'B', 'C', 'D']
const forbiddenMessage = ref('')

const formatScore = (score) => {
  const v = Number(score)
  if (!Number.isFinite(v)) return '0'
  return v.toFixed(2).replace(/\.?0+$/, '')
}

const valueLabel = computed(() => {
  return contestType.value === 'ACM' ? '罚时' : '总分'
})

const formatTime = (t) => {
  const v = Number(t)
  if (!Number.isFinite(v)) return '0'
  return String(Math.floor(v))
}

const fetchRankings = () => {
  const contestId = Number(route.params.id)
  if (!contestId) return

  getContestRankings(contestId)
    .then((response) => {
      if (response.code === 'success' && response.data) {
        forbiddenMessage.value = ''
        contestType.value = response.data.contestType || ''
        rankings.value = response.data.rankings || []
      } else {
        forbiddenMessage.value = response?.message || ''
        rankings.value = []
      }
    })
    .catch((err) => {
      console.error('获取排行榜失败:', err)
      rankings.value = []
      const status = err?.response?.status
      if (status === 403) {
        forbiddenMessage.value = err?.response?.data?.message || '该比赛未开启排行榜展示'
      } else {
        forbiddenMessage.value = ''
      }
    })
}

onMounted(() => {
  fetchRankings()
})

watch(
  () => route.params.id,
  () => {
    rankings.value = []
    forbiddenMessage.value = ''
    fetchRankings()
  }
)
</script>

<style scoped>
.contest-ranking.icpc {
  padding: 30px 20px;
  background: transparent;
  color: #111827;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "DejaVu Sans Mono", monospace;
}

.contest-ranking.icpc .ranking-container {
  max-width: 1100px;
  margin: 0 auto;
}

.contest-ranking.icpc .ranking-card {
  background: #ffffff;
  border-radius: 10px;
  padding: 0;
  border: 1px solid rgba(148,163,184,.25);
  overflow: hidden;
}

.contest-ranking.icpc .card-title {
  font-size: 24px;
  color: #111827;
  margin-bottom: 0;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(229,231,235,1);
  background: #ffffff;
}

.contest-ranking.icpc .ranking-table {
  overflow-x: auto;
}

.contest-ranking.icpc .table-header {
  display: grid;
  grid-template-columns: 70px 180px 120px 120px 1fr;
  gap: 0;
  padding: 12px 18px;
  background: #fafafa;
  border-bottom: 1px solid rgba(229,231,235,1);
  font-weight: 700;
  font-size: 12px;
  color: #666666;
  text-transform: uppercase;
  letter-spacing: .04em;
}

.contest-ranking.icpc .table-row {
  display: grid;
  grid-template-columns: 70px 180px 120px 120px 1fr;
  gap: 0;
  padding: 10px 18px;
  border-bottom: 1px solid rgba(148,163,184,.12);
  align-items: center;
  transition: background .15s ease;
}

.contest-ranking.icpc .table-row:hover {
  background: rgba(248,249,250,1);
}

.contest-ranking.icpc .table-row:nth-child(even) {
  background: #f5f5f5;
}

.contest-ranking.icpc .table-row.current-user {
  background: rgba(29,78,216,.22);
  border-left: 3px solid #3b82f6;
}

.contest-ranking.icpc .col-rank,
.contest-ranking.icpc .col-user,
.contest-ranking.icpc .col-solved,
.contest-ranking.icpc .col-penalty {
  display: flex;
  align-items: center;
}

.contest-ranking.icpc .rank-number {
  font-size: 18px;
  font-weight: 800;
  color: #333333;
}

.contest-ranking.icpc .col-user {
  font-weight: 600;
  color: #333333;
}

.contest-ranking.icpc .col-solved {
  color: #1890ff;
  font-weight: 700;
}

.contest-ranking.icpc .col-penalty {
  font-size: 14px;
  color: #666666;
  opacity: .95;
}

.contest-ranking.icpc .col-problems {
  display: flex;
  align-items: center;
}

.contest-ranking.icpc .problem-status-list {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.contest-ranking.icpc .problem-status {
  display: inline-block;
  width: 22px;
  height: 22px;
  padding: 0;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 800;
  min-width: 22px;
  text-align: center;
  line-height: 22px;
  border: 1px solid rgba(148,163,184,.25);
  background: #f5f5f5;
  color: #999999;
}

.contest-ranking.icpc .problem-status.status-accepted {
  background-color: #f6ffed;
  border-color: #f6ffed;
  color: #52c41a;
}

.contest-ranking.icpc .problem-status.status-none {
  background: #f5f5f5;
  border-color: rgba(148,163,184,.25);
  color: #999999;
}

.contest-ranking.icpc .empty-state {
  padding: 60px 20px;
  text-align: center;
  color: #94a3b8;
}

@media (max-width: 768px) {
  .contest-ranking.icpc .table-header,
  .contest-ranking.icpc .table-row {
    grid-template-columns: 60px 120px 90px 90px 1fr;
    padding: 12px 12px;
  }
}
</style>

