<template>
  <div class="contest-problems">
    <div class="problems-container">
      <div class="problems-card">
        <div v-if="loading" class="loading-state">
          <p>正在加载题目列表...</p>
        </div>
        <div v-else-if="error" class="error-state">
          <p>{{ error }}</p>
        </div>
        <div v-else-if="problems.length > 0" class="problems-list">
          <div 
            v-for="problem in problems" 
            :key="problem.id"
            class="problem-item"
            @click="goToProblem(problem)"
          >
            <div class="problem-id">{{ problem.display_order }}</div>
            <div class="problem-title">{{ problem.display_title }}</div>
            <div class="problem-stats">
              <span class="stat-item">通过: {{ problem.accept_count }}</span>
              <span class="stat-item">提交: {{ problem.submit_count }}</span>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          <p>暂无题目</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getContestProblems } from '@/api/contest'

const route = useRoute()
const router = useRouter()
const problems = ref([])
const loading = ref(false)
const error = ref('')

const goToProblem = (item) => {
  const contestId = route.params.id
  const pid = item.problem_id ?? item.id
  if (!pid) return
  router.push(`/contests/${contestId}/problems/${pid}`)
}

const fetchProblems = async () => {
  const contestId = route.params.id
  if (!contestId) {
    error.value = '比赛ID无效'
    return
  }

  loading.value = true
  error.value = ''
  
  try {
    const response = await getContestProblems(contestId)
    
    if (response.code === 'success' && response.data) {
      problems.value = response.data.problems || []
    } else {
      error.value = response.message || '获取题目列表失败'
      problems.value = []
    }
  } catch (err) {
    console.error('获取题目列表失败:', err)
    error.value = err.message || '获取题目列表失败，请稍后重试'
    problems.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchProblems()
})
</script>

<style scoped>
.contest-problems {
  padding: 30px 20px;
}

.problems-container {
  max-width: 1100px;
  margin: 0 auto;
}

.problems-card {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-title {
  font-size: 24px;
  color: #333333;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e8e8e8;
}

.problems-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.problem-item {
  display: flex;
  align-items: center;
  padding: 8px 15px;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  gap: 20px;
}

.problem-item:hover {
  border-color: #1890ff;
  background-color: #f0f7ff;
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.1);
}

.problem-id {
  font-size: 16px;
  font-weight: 600;
  color: #1890ff;
  min-width: 50px;
}

.problem-title {
  flex: 1;
  font-size: 15px;
  color: #333333;
  font-weight: 500;
}

.problem-stats {
  display: flex;
  gap: 20px;
  font-size: 13px;
  color: #666666;
}

.stat-item {
  white-space: nowrap;
}

.empty-state,
.loading-state,
.error-state {
  padding: 60px 20px;
  text-align: center;
  color: #999999;
}

.error-state {
  color: #ff4d4f;
}

.loading-state {
  color: #1890ff;
}
</style>

