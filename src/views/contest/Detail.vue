<template>
  <div class="contest-detail">
    <ContestHeader />
    <ContestSubNav />
    <div class="contest-content">
      <router-view />
    </div>

    <!-- 提示弹窗（报名截止、权限拒绝等） -->
    <div v-if="promptMessage" class="register-overlay">
      <div class="register-dialog prompt-dialog">
        <div class="prompt-icon">⚠️</div>
        <h3 class="dialog-title">提示</h3>
        <p class="dialog-desc">{{ promptMessage }}</p>
        <div class="dialog-actions">
          <button class="btn-primary" @click="handlePromptClose">返回比赛列表</button>
        </div>
      </div>
    </div>

    <div v-if="showRegisterDialog" class="register-overlay">
      <div class="register-dialog">
        <h3 class="dialog-title">{{ dialogStep === 'password' ? '私有赛验证' : '比赛报名' }}</h3>
        <p class="dialog-desc">{{ dialogStep === 'password' ? '该比赛为私有赛，请先输入比赛密码' : '进入比赛前请先完成报名信息' }}</p>

        <div v-if="dialogStep === 'password'" class="form-grid">
          <label class="form-item">
            <span class="label">比赛密码</span>
            <input v-model="passwordForm.password" type="password" placeholder="请输入比赛密码" />
          </label>
        </div>

        <div v-else class="form-grid">
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

        <div v-if="dialogStep === 'password' && passwordError" class="error-text">{{ passwordError }}</div>
        <div v-if="dialogStep !== 'password' && submitError" class="error-text">{{ submitError }}</div>

        <div class="dialog-actions">
          <button
            class="btn-ghost"
            :disabled="dialogStep === 'password' ? passwordSubmitting : submitting"
            @click="handleCancel"
          >
            取消
          </button>
          <button
            class="btn-primary"
            :disabled="dialogStep === 'password' ? passwordSubmitting : submitting"
            @click="dialogStep === 'password' ? handlePasswordSubmit() : handleSubmit()"
          >
            {{ dialogStep === 'password' ? (passwordSubmitting ? '验证中...' : '验证密码') : (submitting ? '提交中...' : '提交报名') }}
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
import { getContestDetail, getContestRegistration, registerContest, verifyContestPassword } from '@/api/contest'

const route = useRoute()
const router = useRouter()

const showRegisterDialog = ref(false)
const promptMessage = ref('')
const dialogStep = ref('register')
const submitting = ref(false)
const submitError = ref(null)
const passwordSubmitting = ref(false)
const passwordError = ref(null)
const passwordForm = ref({ password: '' })
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
    const detailRes = await getContestDetail(contestId)
    const contestData = detailRes?.data || {}
    const contestStatus = contestData?.status
    const contestMode = String(contestData?.rule_config?.contest_mode || '').toLowerCase()
    const isPrivateContest = contestMode === '私有赛' || contestMode === 'private' || contestMode === 'private_contest'
    const registerEndTimeRaw = contestData?.time_config?.register_end_time
    const registerEndTime = registerEndTimeRaw ? new Date(registerEndTimeRaw) : null
    const registerClosedBeforeEnd = (
      contestStatus !== '已结束' &&
      registerEndTime instanceof Date &&
      !Number.isNaN(registerEndTime.getTime()) &&
      Date.now() > registerEndTime.getTime()
    )

    if (isPrivateContest) {
      // 私有赛默认先走密码阶段，后端会在已验证时放行并返回报名信息
      dialogStep.value = 'password'
    }

    const res = await getContestRegistration(contestId)
    if (res.code === 'success' && res.data) {
      dialogStep.value = 'register'
      const registered = Boolean(res.data.registered)
      if (!registered && registerClosedBeforeEnd) {
        showRegisterDialog.value = false
        promptMessage.value = '报名已截止，未报名用户在比赛结束前不可进入比赛'
        return
      }
      showRegisterDialog.value = !registered
    } else {
      showRegisterDialog.value = true
    }
  } catch (error) {
    console.error('检查报名状态失败:', error)
    const status = error?.response?.status
    const code = error?.response?.data?.code
    if (status === 403 && code === 'contest_password_required') {
      showRegisterDialog.value = true
      dialogStep.value = 'password'
      passwordError.value = null
      return
    }
    if (status === 403) {
      showRegisterDialog.value = false
      promptMessage.value = error?.response?.data?.message || '当前不可进入比赛'
    } else {
      // 如果接口异常，为确保流程，仍然弹出报名
      showRegisterDialog.value = true
    }
  }
}

const handlePasswordSubmit = async () => {
  const contestId = route.params.id
  if (!contestId) return
  passwordError.value = null
  const password = (passwordForm.value.password || '').trim()
  if (!password) {
    passwordError.value = '请输入比赛密码'
    return
  }
  passwordSubmitting.value = true
  try {
    const res = await verifyContestPassword(contestId, { password })
    if (res.code === 'success') {
      dialogStep.value = 'register'
      passwordForm.value.password = ''
      await checkRegistration()
    } else {
      passwordError.value = res.message || '密码验证失败'
    }
  } catch (error) {
    passwordError.value = error?.response?.data?.message || error.message || '密码验证失败'
  } finally {
    passwordSubmitting.value = false
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
    if (error?.response?.status === 403) {
      showRegisterDialog.value = false
      promptMessage.value = submitError.value
    }
  } finally {
    submitting.value = false
  }
}

const handleCancel = () => {
  showRegisterDialog.value = false
  router.go(-1)
}

const handlePromptClose = () => {
  promptMessage.value = ''
  router.replace('/contests')
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
.form-item input[type='email'],
.form-item input[type='password'] {
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

.prompt-dialog {
  text-align: center;
}

.prompt-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.prompt-dialog .dialog-actions {
  justify-content: center;
  margin-top: 24px;
}

@media (max-width: 480px) {
  .register-dialog {
    padding: 20px;
  }
}
</style>

