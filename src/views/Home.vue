<template>
  <div class="home">
    <!-- 公告栏 -->
    <div
      class="notice-bar"
    >
      <div class="notice-inner">
        <div class="notice-header">公告</div>

        <transition name="notice-flip" mode="out-in">
          <div
            v-if="noticeItems.length > 0"
            :key="currentNotice?.id || noticeRotateIndex"
            class="notice-rotate"
          >
            <div class="notice-rotate-title">
              {{ currentNotice?.title }}
            </div>
            <div class="notice-rotate-content">
              {{ currentNoticeContentPreview }}
            </div>
          </div>
          <div
            v-else
            key="empty"
            class="notice-empty"
          >
            暂无公告
          </div>
        </transition>
      </div>
    </div>

    <!-- 三个并排板块 -->
    <div class="latest-panels">
      <div class="panels-row">
        <!-- 最新题目 -->
        <section class="panel-card">
          <div class="panel-header">
            <h2 class="panel-title">最新题目</h2>
          </div>
          <div class="panel-list">
            <div v-if="problemsLoading" class="panel-empty">加载中...</div>
            <div v-else-if="latestProblems.length === 0" class="panel-empty">暂无题目</div>
            <div
              v-else
              v-for="p in latestProblems"
              :key="p.id"
              class="panel-item problem-item"
              @click="goToProblem(p.id)"
              role="button"
              tabindex="0"
            >
              <span class="problem-id">{{ p.id }}</span>
              <span class="problem-title">{{ p.title }}</span>
            </div>
          </div>
        </section>

        <!-- 最新比赛 -->
        <section class="panel-card">
          <div class="panel-header">
            <h2 class="panel-title">最新比赛</h2>
          </div>
          <div class="panel-list">
            <div v-if="contestsLoading" class="panel-empty">加载中...</div>
            <div v-else-if="latestContests.length === 0" class="panel-empty">暂无比赛</div>
            <div
              v-else
              v-for="c in latestContests"
              :key="c.id"
              class="panel-item contest-item"
              @click="goToContest(c.id)"
              role="button"
              tabindex="0"
            >
              <span class="contest-name">{{ c.name }}</span>
              <span class="contest-status-badge" :class="`status-${c.status}`">
                {{ getContestStatusText(c.status) }}
              </span>
            </div>
          </div>
        </section>

        <!-- 最新讨论 -->
        <section class="panel-card">
          <div class="panel-header">
            <h2 class="panel-title">最新讨论</h2>
          </div>
          <div class="panel-list">
            <div v-if="discussionsLoading" class="panel-empty">加载中...</div>
            <div v-else-if="latestDiscussions.length === 0" class="panel-empty">暂无讨论</div>
            <div
              v-else
              v-for="d in latestDiscussions"
              :key="d.id"
              class="panel-item discussion-item"
              @click="goToDiscussion(d.id)"
              role="button"
              tabindex="0"
            >
              <span class="discussion-title">{{ d.title }}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { getProblemList } from '@/api/problem'
import { getAnnouncementList } from '@/api/announcement'
import { getContestList } from '@/api/contest'
import { getDiscussionList } from '@/api/discussion'

const router = useRouter()

const noticeItems = ref([]) // [{ title, content, create_time }]
const noticeRotateIndex = ref(0)
let noticeRotateTimer = null

const currentNotice = computed(() => {
  if (!noticeItems.value.length) return null
  const idx = noticeRotateIndex.value % noticeItems.value.length
  return noticeItems.value[idx]
})

const currentNoticeContentPreview = computed(() => {
  const content = currentNotice.value?.content || ''
  // 只做轻量截断，避免过长撑高公告栏
  const normalized = String(content).replace(/\s+/g, ' ').trim()
  if (!normalized) return ''
  return normalized.length > 120 ? normalized.slice(0, 120) + '...' : normalized
})

const problemsLoading = ref(false)
const contestsLoading = ref(false)
const discussionsLoading = ref(false)

const latestProblems = ref([]) // [{id, title}]
const latestContests = ref([]) // [{id, name, status}]
const latestDiscussions = ref([]) // [{id, title}]

const getContestStatusText = (status) => {
  const map = {
    upcoming: '即将开始',
    active: '进行中',
    ended: '已结束'
  }
  return map[status] || status || '--'
}

const normalizeContestStatus = (status) => {
  // 后端可能返回中文状态（即将开始/进行中/已结束），也可能返回英文枚举
  const map = {
    // 中文
    '即将开始': 'upcoming',
    '进行中': 'active',
    '已结束': 'ended',
    // 英文
    upcoming: 'upcoming',
    active: 'active',
    ended: 'ended'
  }
  return map[status] || status || 'upcoming'
}

const goToProblem = (id) => {
  router.push(`/problems/${id}`)
}

const goToContest = (id) => {
  router.push(`/contests/${id}`)
}

const goToDiscussion = (id) => {
  router.push(`/discussions/${id}`)
}

const fetchNotice = async () => {
  try {
    const res = await getAnnouncementList({ page: 1, page_size: 5 })
    const announcements = res?.data?.announcements || []
    noticeItems.value = announcements
      .slice(0, 5)
      .map(a => ({ title: a.title, content: a.content || '', create_time: a.create_time || '' }))
  } catch (e) {
    console.error('获取公告失败:', e)
  }
}

const fetchLatestProblems = async () => {
  problemsLoading.value = true
  try {
    // 后端已按题目 id 倒序返回，这里直接取前 8 条
    const res = await getProblemList({ page: 1, page_size: 8 })
    if (res.code !== 'success') return

    const list = res?.data?.problems || []
    latestProblems.value = list.map(p => ({ id: p.id, title: p.title }))
  } catch (e) {
    console.error('获取最新题目失败:', e)
    latestProblems.value = []
  } finally {
    problemsLoading.value = false
  }
}

const fetchLatestContests = async () => {
  contestsLoading.value = true
  try {
    // 后端已按 contest.create_time 倒序返回，这里直接取前 4 条
    const res = await getContestList({ page: 1, page_size: 4 })
    if (res.code !== 'success') return

    const list = res?.data?.contests || []
    latestContests.value = list.map(c => ({
      id: c.id,
      name: c.name,
      status: normalizeContestStatus(c.status)
    }))
  } catch (e) {
    console.error('获取最新比赛失败:', e)
    latestContests.value = []
  } finally {
    contestsLoading.value = false
  }
}

const fetchLatestDiscussions = async () => {
  discussionsLoading.value = true
  try {
    // 后端已按 created_at 倒序返回，这里直接取前 4 条
    const res = await getDiscussionList({ page: 1, page_size: 4 })
    if (res.code !== 'success') return

    const list = res?.data?.discussions || []
    latestDiscussions.value = list.map(d => ({ id: d.id, title: d.title }))
  } catch (e) {
    console.error('获取最新讨论失败:', e)
    latestDiscussions.value = []
  } finally {
    discussionsLoading.value = false
  }
}

onMounted(async () => {
  await Promise.all([
    fetchNotice(),
    fetchLatestProblems(),
    fetchLatestContests(),
    fetchLatestDiscussions()
  ])

  // 只有拿到公告后才启动轮播
  if (noticeItems.value.length > 1) {
    noticeRotateIndex.value = 0
    noticeRotateTimer = window.setInterval(() => {
      noticeRotateIndex.value = (noticeRotateIndex.value + 1) % noticeItems.value.length
    }, 5000)
  }
})

onBeforeUnmount(() => {
  if (noticeRotateTimer) {
    window.clearInterval(noticeRotateTimer)
    noticeRotateTimer = null
  }
})

</script>

<style scoped lang="scss">
@import '@/assets/styles/variable.scss';

.home {
  min-height: calc(100vh - 60px);
  background-color: $bg-color-light;
  padding: 20px 0 60px;
}

.notice-bar {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  max-width: 1200px;
  margin: 0 auto 24px;
  /* 与下方 panel-card 对齐的内边距 */
  padding: 18px 18px 10px;

  /* 保证高度与下方卡片一致：即使没公告也不塌陷 */
  min-height: 235px;
  display: flex;
  align-items: stretch;
}

.notice-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.notice-header {
  width: 100%;
  text-align: center;
  color: $text-color-primary;
  font-size: 22px;
  font-weight: 900;
  letter-spacing: 0.5px;
}

.notice-rotate {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  /* 内部承载层，让公告视觉更像“卡片” */
  padding: 10px 12px;
  box-sizing: border-box;
  border: 1px solid rgba(24, 144, 255, 0.18);
  border-radius: 10px;
  background: linear-gradient(180deg, #f7fbff 0%, #ffffff 100%);
}

.notice-rotate-title {
  color: $text-color-primary;
  font-size: 20px;
  font-weight: 800;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.notice-rotate-content {
  color: #666666;
  font-size: 13px;
  line-height: 1.6;
  width: 100%;
  text-align: left;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.notice-empty {
  flex: 1;
  color: #999999;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  width: 100%;
  padding: 10px 12px;
  box-sizing: border-box;
  border: 1px dashed rgba(24, 144, 255, 0.25);
  border-radius: 10px;
  background: #ffffff;
}

/* 翻转切换动画 */
.notice-flip-enter-active,
.notice-flip-leave-active {
  transition: transform 0.45s ease, opacity 0.45s ease;
  transform-origin: center center;
  perspective: 800px;
}

.notice-flip-enter-from {
  opacity: 0;
  transform: rotateX(70deg) translateY(6px);
}

.notice-flip-leave-to {
  opacity: 0;
  transform: rotateX(-70deg) translateY(-6px);
}

.latest-panels {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.panels-row {
  display: flex;
  gap: 20px;
}

.panel-card {
  flex: 1;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 18px 18px 10px;
}

.panel-header {
  margin-bottom: 12px;
}

.panel-title {
  font-size: 18px;
  font-weight: 700;
  color: $text-color-primary;
  margin: 0;
}

.panel-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 12px;
}

.panel-empty {
  color: #999999;
  font-size: 14px;
  text-align: center;
  padding: 14px 0;
}

.panel-item {
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  padding: 10px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #ffffff;
}

.panel-item:hover {
  border-color: #1890ff;
  box-shadow: 0 2px 10px rgba(24, 144, 255, 0.08);
  transform: translateY(-2px);
}

.problem-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.problem-id {
  color: #1890ff;
  font-weight: 700;
  flex-shrink: 0;
  width: 70px;
}

.problem-title {
  color: #333333;
  font-weight: 600;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.contest-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.contest-name {
  color: #333333;
  font-weight: 600;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.contest-status-badge {
  flex-shrink: 0;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.contest-status-badge.status-upcoming {
  background-color: #e6f7ff;
  color: #1890ff;
}

.contest-status-badge.status-active {
  background-color: #f6ffed;
  color: #52c41a;
}

.contest-status-badge.status-ended {
  background-color: #fff1f0;
  color: #ff4d4f;
}

.discussion-item {
  display: flex;
  align-items: center;
}

.discussion-title {
  color: #333333;
  font-weight: 600;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 980px) {
  .panels-row {
    flex-direction: column;
  }
}

.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 80px 20px;
  text-align: center;
  color: $text-color-inverse;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 20px;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 24px;
  margin-bottom: 40px;
  opacity: 0.9;
}

.hero-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.btn-primary,
.btn-secondary {
  padding: 14px 32px;
  border-radius: $border-radius-base;
  font-size: $font-size-base;
  font-weight: 500;
  text-decoration: none;
  transition: $transition-base;
  display: inline-block;
}

.btn-primary {
  background-color: $text-color-inverse;
  color: #667eea;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
}

.btn-secondary {
  background-color: transparent;
  color: $text-color-inverse;
  border: 2px solid $text-color-inverse;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
}

.features-section {
  padding: 80px 20px;
  background-color: $bg-color-base;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  font-size: 36px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 48px;
  color: $text-color-primary;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 32px;
}

.feature-card {
  background: $bg-color-base;
  border: 1px solid $border-color-base;
  border-radius: $border-radius-lg;
  padding: 32px;
  text-align: center;
  transition: $transition-base;

  &:hover {
    border-color: $primary-color;
    box-shadow: $box-shadow-base;
    transform: translateY(-4px);
  }
}

.feature-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.feature-card h3 {
  font-size: $font-size-lg;
  font-weight: 600;
  margin-bottom: 12px;
  color: $text-color-primary;
}

.feature-card p {
  font-size: $font-size-sm;
  color: $text-color-secondary;
  line-height: $line-height-lg;
}

.quick-access-section {
  padding: 60px 20px;
  background-color: $bg-color-light;
}

.quick-links {
  display: flex;
  justify-content: center;
  gap: 24px;
  flex-wrap: wrap;
}

.quick-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px 32px;
  background: $bg-color-base;
  border: 1px solid $border-color-base;
  border-radius: $border-radius-lg;
  text-decoration: none;
  color: $text-color-primary;
  transition: $transition-base;
  min-width: 120px;

  &:hover {
    border-color: $primary-color;
    color: $primary-color;
    transform: translateY(-2px);
    box-shadow: $box-shadow-base;
  }
}

.link-icon {
  font-size: 32px;
}

.link-text {
  font-size: $font-size-base;
  font-weight: 500;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 32px;
  }

  .hero-subtitle {
    font-size: 18px;
  }

  .hero-actions {
    flex-direction: column;
    align-items: center;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    max-width: 300px;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>
