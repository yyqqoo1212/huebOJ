<template>
  <div class="contest-detail">
    <ContestHeader />
    <ContestSubNav />
    <div class="contest-content">
      <router-view />
    </div>

    <!-- 报名弹窗 -->
    <div v-if="showRegisterDialog" class="register-overlay">
      <div class="register-dialog">
        <h3 class="dialog-title">比赛报名</h3>
        <p class="dialog-desc">进入比赛前请先完成报名信息</p>

        <div class="form-grid">
          <label class="form-item">
            <span class="label">真实姓名</span>
            <input v-model="form.real_name" type="text" placeholder="可选" />
          </label>
          <label class="form-item">
            <span class="label">学号</span>
            <input v-model="form.student_id" type="text" placeholder="可选" />
          </label>
          <label class="form-item">
            <span class="label">学校</span>
            <input v-model="form.school" type="text" placeholder="可选" />
          </label>
          <label class="form-item">
            <span class="label">联系电话</span>
            <input v-model="form.phone" type="text" placeholder="可选" />
          </label>
          <label class="form-item">
            <span class="label">邮箱</span>
            <input v-model="form.email" type="email" placeholder="可选" />
          </label>
          <label class="form-item checkbox-item">
            <input v-model="form.is_star" type="checkbox" />
            <span class="label">是否打星选手</span>
          </label>
        </div>

        <div v-if="submitError" class="error-text">{{ submitError }}</div>

        <div class="dialog-actions">
          <button class="btn-ghost" :disabled="submitting" @click="handleCancel">
            取消
          </button>
          <button class="btn-primary" :disabled="submitting" @click="handleSubmit">
            {{ submitting ? '提交中...' : '提交报名' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ContestHeader from '@/components/ContestHeader.vue'
import ContestSubNav from '@/components/ContestSubNav.vue'
import { getContestRegistration, registerContest } from '@/api/contest'

const route = useRoute()
const router = useRouter()

const showRegisterDialog = ref(false)
const submitting = ref(false)
const submitError = ref(null)
const form = ref({
  real_name: '',
  student_id: '',
  school: '',
  phone: '',
  email: '',
  is_star: false
})

const checkRegistration = async () => {
  const contestId = route.params.id
  if (!contestId) return
  try {
    const res = await getContestRegistration(contestId)
    if (res.code === 'success' && res.data) {
      showRegisterDialog.value = !res.data.registered
    } else {
      showRegisterDialog.value = true
    }
  } catch (error) {
    console.error('检查报名状态失败:', error)
    // 如果接口异常，为确保流程，仍然弹出报名
    showRegisterDialog.value = true
  }
}

const handleSubmit = async () => {
  const contestId = route.params.id
  if (!contestId) return
  submitError.value = null
  submitting.value = true
  try {
    const res = await registerContest(contestId, { ...form.value })
    if (res.code === 'success' && res.data?.registered) {
      showRegisterDialog.value = false
    } else {
      submitError.value = res.message || '报名失败，请稍后重试'
    }
  } catch (error) {
    console.error('报名失败:', error)
    submitError.value = error.response?.data?.message || error.message || '报名失败，请稍后重试'
  } finally {
    submitting.value = false
  }
}

const handleCancel = () => {
  showRegisterDialog.value = false
  router.go(-1)
}

onMounted(() => {
  checkRegistration()
})
</script>

<style scoped>
.contest-detail {
  min-height: calc(100vh - 60px);
  background-color: #f5f5f5;
}

.contest-content {
  min-height: calc(100vh - 200px);
}

.register-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.register-dialog {
  width: 560px;
  max-width: 90vw;
  background: #fff;
  border-radius: 10px;
  padding: 28px 32px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.dialog-title {
  margin: 0 0 8px 0;
  font-size: 22px;
  font-weight: 700;
  color: #333;
}

.dialog-desc {
  margin: 0 0 20px 0;
  color: #666;
  font-size: 14px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 12px 16px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-item input[type='text'],
.form-item input[type='email'] {
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-item input:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.label {
  font-size: 13px;
  color: #555;
  font-weight: 600;
}

.checkbox-item {
  flex-direction: row;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  background: #fafafa;
}

.dialog-actions {
  margin-top: 18px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-ghost {
  padding: 8px 16px;
  background: #f5f5f5;
  color: #333;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}

.btn-ghost:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-ghost:not(:disabled):hover {
  background: #fff;
  color: #1890ff;
  border-color: #1890ff;
}

.btn-primary {
  padding: 8px 20px;
  background: #1890ff;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s ease;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary:not(:disabled):hover {
  background: #40a9ff;
}

.error-text {
  margin-top: 10px;
  color: #ff4d4f;
  font-size: 13px;
}

@media (max-width: 480px) {
  .register-dialog {
    padding: 20px;
  }
}
</style>

