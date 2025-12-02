<template>
  <div class="problem-create">
    <div class="page-header">
      <h1>新增题目</h1>
      <p class="page-subtitle">请完整填写题目信息，* 为必填项</p>
    </div>

    <div class="form-container">
      <section class="form-section">
        <h2>基础信息</h2>
        <div class="form-grid">
          <div class="form-item">
            <label>题目标题 *</label>
            <input
              v-model="form.title"
              type="text"
              placeholder="请输入题目标题"
              ref="titleInput"
              :class="{ 'input-error': fieldErrors.title }"
            />
          </div>
          <div class="form-item">
            <label>难度等级 *</label>
            <select
              v-model.number="form.level"
              ref="levelSelect"
              :class="{ 'input-error': fieldErrors.level }"
            >
              <option value=1>简单</option>
              <option value=2>中等</option>
              <option value=3>困难</option>
            </select>
          </div>
          <div class="form-item">
            <label>时间限制 (毫秒) *</label>
            <input
              v-model.number="form.time_limit"
              type="number"
              placeholder="例如：1000"
              min="1"
              ref="timeLimitInput"
              :class="{ 'input-error': fieldErrors.time_limit }"
            />
          </div>
          <div class="form-item">
            <label>内存限制 (MB) *</label>
            <input
              v-model.number="form.memory_limit"
              type="number"
              placeholder="例如：256"
              min="1"
              ref="memoryLimitInput"
              :class="{ 'input-error': fieldErrors.memory_limit }"
            />
          </div>
          <div class="form-item">
            <label>题目标签</label>
            <input
              v-model="form.tag"
              type="text"
              placeholder="例如：数组, 动态规划"
            />
          </div>
          <div class="form-item">
            <label>题目权限 *</label>
            <select
              v-model.number="form.auth"
              ref="authSelect"
              :class="{ 'input-error': fieldErrors.auth }"
            >
              <option value=1>公开题目</option>
              <option value=2>私密题目</option>
              <option value=3>比赛题目</option>
            </select>
          </div>
          <div class="form-item">
            <label>分数</label>
            <input
              v-model="form.score"
              type="number"
              min="0"
            />
          </div>
        </div>
      </section>

      <section class="form-section">
        <h2>题面描述 *</h2>
        <textarea
          v-model="form.content"
          ref="contentTextarea"
          :class="['textarea', { 'input-error': fieldErrors.content }]"
          rows="6"
          placeholder="请详细描述题目背景和要求"
        ></textarea>

        <div class="form-grid">
          <div class="form-item textarea-item">
            <label>输入描述 *</label>
            <textarea
              v-model="form.input_description"
              rows="4"
              placeholder="说明输入格式"
              ref="inputDescTextarea"
              :class="{ 'input-error': fieldErrors.input_description }"
            ></textarea>
          </div>
          <div class="form-item textarea-item">
            <label>输出描述 *</label>
            <textarea
              v-model="form.output_description"
              rows="4"
              placeholder="说明输出格式"
              ref="outputDescTextarea"
              :class="{ 'input-error': fieldErrors.output_description }"
            ></textarea>
          </div>
        </div>

        <div class="sample-list">
          <div
            v-for="(sample, index) in form.samples"
            :key="index"
            class="sample-item"
          >
            <div class="sample-header">
              <span>样例 {{ index + 1 }}</span>
              <button class="btn-link" @click="removeSample(index)" v-if="form.samples.length > 1">
                删除
              </button>
            </div>
            <div class="form-grid">
              <div class="form-item textarea-item">
                <label>输入 {{ index + 1 }}</label>
                <textarea
                  v-model="sample.input"
                  rows="3"
                  placeholder="请输入样例输入内容"
                ></textarea>
              </div>
              <div class="form-item textarea-item">
                <label>输出 {{ index + 1 }}</label>
                <textarea
                  v-model="sample.output"
                  rows="3"
                  placeholder="请输入样例输出内容"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <button class="btn-add-sample" @click="addSample">
          + 添加样例
        </button>

        <div class="form-item textarea-item">
          <label>提示信息</label>
          <textarea
            v-model="form.hint"
            rows="3"
            placeholder="可选：给出解题提示或注意事项"
          ></textarea>
        </div>
      </section>

      

      <section class="form-section">
        <h2>测评数据</h2>
        <div class="placeholder-box">
          测评数据上传功能开发中，敬请期待...
        </div>
      </section>

      <div class="form-actions">
        <button class="btn-primary" :disabled="saving" @click="submitForm">
          {{ saving ? '保存中...' : '保存题目' }}
        </button>
        <button class="btn-secondary" @click="resetForm">
          重置表单
        </button>
      </div>

      <div v-if="saveSuccess" class="save-success-banner">
        题目已成功保存到题库。
      </div>
    </div>
  </div>
</template>

<script>
import { createProblem } from '@/api/problem'
import { userStorage } from '@/utils/storage'

export default {
  name: 'ProblemCreate',
  data() {
    return {
      form: {
        title: '',
        content: '',
        score: 100,
        time_limit: 1000,
        memory_limit: 256,
        level: 1,
        input_description: '',
        output_description: '',
        input_demo: '',
        output_demo: '',
        hint: '',
        tag: '',
        auth: 1,
        samples: [
          { input: '', output: '' }
        ]
      },
      fieldErrors: {
        title: false,
        content: false,
        input_description: false,
        output_description: false,
        time_limit: false,
        memory_limit: false,
        level: false,
        auth: false
      },
      saving: false,
      saveSuccess: false
    }
  },
  methods: {
    addSample() {
      this.form.samples.push({ input: '', output: '' })
    },
    removeSample(index) {
      if (this.form.samples.length === 1) return
      this.form.samples.splice(index, 1)
    },
    focusField(field) {
      const refMap = {
        title: 'titleInput',
        level: 'levelSelect',
        time_limit: 'timeLimitInput',
        memory_limit: 'memoryLimitInput',
        auth: 'authSelect',
        content: 'contentTextarea',
        input_description: 'inputDescTextarea',
        output_description: 'outputDescTextarea'
      }
      const refName = refMap[field]
      const el = refName ? this.$refs[refName] : null
      if (el && typeof el.focus === 'function') {
        el.focus()
      }
      if (el && typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    },
    async submitForm() {
      const showError = (msg) => {
        if (this.$message?.error) {
          this.$message.error(msg)
        } else {
          console.error(msg)
        }
      }
      const showSuccess = (msg) => {
        if (this.$message?.success) {
          this.$message.success(msg)
        } else {
          console.log(msg)
        }
      }

      // 重置错误状态和状态提示
      this.fieldErrors = {
        title: false,
        content: false,
        input_description: false,
        output_description: false,
        time_limit: false,
        memory_limit: false,
        level: false,
        auth: false
      }
      this.saveSuccess = false

      // 基本校验
      if (!this.form.title.trim()) {
        this.fieldErrors.title = true
        this.$nextTick(() => this.focusField('title'))
        return showError('题目标题不能为空')
      }
      if (!this.form.content.trim()) {
        this.fieldErrors.content = true
        this.$nextTick(() => this.focusField('content'))
        return showError('题面描述不能为空')
      }
      if (!this.form.input_description.trim()) {
        this.fieldErrors.input_description = true
        this.$nextTick(() => this.focusField('input_description'))
        return showError('输入描述不能为空')
      }
      if (!this.form.output_description.trim()) {
        this.fieldErrors.output_description = true
        this.$nextTick(() => this.focusField('output_description'))
        return showError('输出描述不能为空')
      }
      if (!this.form.time_limit || this.form.time_limit <= 0) {
        this.fieldErrors.time_limit = true
        this.$nextTick(() => this.focusField('time_limit'))
        return showError('时间限制必须是大于 0 的整数')
      }
      if (!this.form.memory_limit || this.form.memory_limit <= 0) {
        this.fieldErrors.memory_limit = true
        this.$nextTick(() => this.focusField('memory_limit'))
        return showError('内存限制必须是大于 0 的整数')
      }
      if (![1, 2, 3].includes(Number(this.form.level))) {
        this.fieldErrors.level = true
        this.$nextTick(() => this.focusField('level'))
        return showError('难度等级非法，只能是 1/2/3')
      }
      if (![1, 2, 3].includes(Number(this.form.auth))) {
        this.fieldErrors.auth = true
        this.$nextTick(() => this.focusField('auth'))
        return showError('题目权限非法，只能是 1/2/3')
      }

      const user = userStorage.load()
      const author = user?.username || ''
      if (!author) {
        return showError('当前未登录或用户信息缺失，无法创建题目')
      }

      // 将样例数据合并到 input_demo / output_demo
      let input_demo = ''
      let output_demo = ''

      if (this.form.samples && this.form.samples.length > 0) {
        if (this.form.samples.length === 1) {
          input_demo = this.form.samples[0].input || ''
          output_demo = this.form.samples[0].output || ''
        } else {
          input_demo = this.form.samples.map(s => s.input || '').join('|')
          output_demo = this.form.samples.map(s => s.output || '').join('|')
        }
      }

      const payload = {
        author,
        title: this.form.title,
        level: Number(this.form.level),
        time_limit: this.form.time_limit,
        memory_limit: this.form.memory_limit,
        tag: this.form.tag,
        auth: Number(this.form.auth),
        score: this.form.score,
        content: this.form.content,
        input_description: this.form.input_description,
        output_description: this.form.output_description,
        input_demo,
        output_demo,
        hint: this.form.hint
      }

      this.saving = true

      try {
        await createProblem(payload)
        showSuccess('创建题目成功')
        this.saveSuccess = true
        this.resetForm()
      } catch (error) {
        console.error('创建题目失败:', error)
        showError(error.message || '创建题目失败，请稍后重试')
      } finally {
        this.saving = false
      }
    },
    resetForm() {
      this.form = {
        title: '',
        content: '',
        time_limit: 1000,
        memory_limit: 256,
        level: 1,
        input_description: '',
        output_description: '',
        input_demo: '',
        output_demo: '',
        hint: '',
        tag: '',
        auth: 1,
        samples: [
          { input: '', output: '' }
        ]
      }
    }
  }
}
</script>

<style scoped>
.problem-create {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 24px;
}

.page-header h1 {
  font-size: 24px;
  margin-bottom: 8px;
}

.page-subtitle {
  font-size: 14px;
  color: #666666;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-section {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 20px;
}

.form-section h2 {
  font-size: 18px;
  margin: 0 0 16px 0;
  color: #333333;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-item label {
  font-size: 14px;
  color: #333333;
  font-weight: 500;
}

input,
select,
textarea {
  padding: 10px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease;
  width: 100%;
  box-sizing: border-box;
}

input:focus,
select:focus,
textarea:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.input-error {
  border-color: #ff4d4f !important;
  box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.2);
}

.textarea {
  min-height: 140px;
}

.textarea-item textarea {
  min-height: 120px;
}

.sample-list {
  padding: 10px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sample-item {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 16px;
  background-color: #fafafa;
}

.sample-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-weight: 600;
  color: #333333;
}

.btn-link {
  border: none;
  background: none;
  color: #ff4d4f;
  cursor: pointer;
  font-size: 13px;
  padding: 0;
}

.btn-add-sample {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 4px;
  margin-bottom: 10px;
  border: 1px dashed #1890ff;
  color: #1890ff;
  background-color: #e6f7ff;
  border-radius: 6px;
  cursor: pointer;
}

.placeholder-box {
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  color: #999999;
  background-color: #fafafa;
}

.section-desc {
  font-size: 13px;
  color: #888888;
  margin: 0 0 12px 0;
}

.form-actions {
  display: flex;
  gap: 12px;
}

.btn-primary,
.btn-secondary {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #1890ff, #40a9ff);
  color: #ffffff;
}

.btn-secondary {
  background-color: #f5f5f5;
  color: #333333;
}

.btn-primary:hover {
  opacity: 0.9;
}

.btn-secondary:hover {
  background-color: #e0e0e0;
}

.save-success-banner {
  margin-top: 16px;
  padding: 10px 14px;
  border-radius: 6px;
  background-color: #f6ffed;
  border: 1px solid #b7eb8f;
  color: #389e0d;
  font-size: 14px;
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666666;
}

.error-state {
  color: #ff4d4f;
}
</style>
