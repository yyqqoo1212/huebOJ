<template>
  <nav class="contest-sub-nav">
    <div class="sub-nav-container">
      <router-link 
        v-for="item in navItems" 
        :key="item.path"
        :to="item.path"
        class="sub-nav-item"
        active-class="active"
      >
        {{ item.label }}
      </router-link>
    </div>
  </nav>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getContestDetail } from '@/api/contest'

const route = useRoute()
const showRank = ref(true)

const fetchContestPermission = async () => {
  const contestId = route.params.id
  if (!contestId) return
  try {
    const res = await getContestDetail(contestId)
    const permissionConfig = res?.data?.permission_config
    if (permissionConfig && typeof permissionConfig.show_rank === 'boolean') {
      showRank.value = permissionConfig.show_rank
      return
    }
  } catch (error) {
    console.error('获取比赛权限配置失败:', error)
  }
  showRank.value = true
}

const navItems = computed(() => {
  const contestId = route.params.id
  const basePath = `/contests/${contestId}`
  
  const items = [
    { path: `${basePath}/description`, label: '比赛描述' },
    { path: `${basePath}/problems`, label: '题目' },
    { path: `${basePath}/submissions`, label: '提交' },
    { path: `${basePath}/announcements`, label: '公告' }
  ]

  if (showRank.value) {
    items.splice(3, 0, { path: `${basePath}/ranking`, label: '排名' })
  }
  return items
})

onMounted(() => {
  fetchContestPermission()
})

watch(
  () => route.params.id,
  () => {
    fetchContestPermission()
  }
)
</script>

<style scoped>
.contest-sub-nav {
  background-color: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  padding: 0;
  position: sticky;
  top: 60px;
  z-index: 999;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-top: 0;
}

.sub-nav-container {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  padding: 0 20px;
  height: 50px;
  gap: 36px;
}

.sub-nav-item {
  color: #333333;
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 4px;
  transition: all 0.3s ease;
  white-space: nowrap;
  position: relative;
}

.sub-nav-item:hover {
  color: #1890ff;
  background-color: #f0f0f0;
}

.sub-nav-item.active {
  color: #1890ff;
  background-color: #e6f7ff;
}

.sub-nav-item.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 2px;
  background-color: #1890ff;
  border-radius: 2px 2px 0 0;
}

@media (max-width: 768px) {
  .sub-nav-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    gap: 10px;
  }
  
  .sub-nav-container::-webkit-scrollbar {
    display: none;
  }
  
  .sub-nav-item {
    font-size: 14px;
    padding: 8px 12px;
  }
}
</style>

