<template>
  <div class="problem-create">
    <div class="page-header">
      <h1>编辑题目</h1>
      <p class="page-subtitle">请完整填写题目信息，* 为必填项</p>
    </div>

    <div v-if="loading" class="loading-state">正在加载题目信息...</div>
    <div v-else-if="loadError" class="error-state">{{ loadError }}</div>
    <div v-else class="form-container">
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
        <div class="content-editor-wrapper">
          <div class="content-editor-left">
            <div class="form-item textarea-item">
              <textarea
                v-model="form.content"
                rows="10"
                placeholder="请详细描述题目背景和要求"
                ref="contentTextarea"
                :class="{ 'input-error': fieldErrors.content }"
              ></textarea>
            </div>
          </div>
          <div class="content-preview-right">
            <div class="preview-header">预览</div>
            <div v-if="form.content.trim()" class="preview-content" v-html="renderContent(form.content)"></div>
            <div v-else class="preview-placeholder">
              预览内容将显示在这里
            </div>
          </div>
        </div>

        <div class="content-editor-wrapper">
          <div class="content-editor-left">
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
          </div>
          <div class="content-preview-right">
            <div class="preview-header">预览</div>
            <div v-if="form.input_description.trim()" class="preview-content" v-html="renderContent(form.input_description)"></div>
            <div v-else class="preview-placeholder">
              预览内容将显示在这里
            </div>
          </div>
        </div>

        <div class="content-editor-wrapper">
          <div class="content-editor-left">
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
          <div class="content-preview-right">
            <div class="preview-header">预览</div>
            <div v-if="form.output_description.trim()" class="preview-content" v-html="renderContent(form.output_description)"></div>
            <div v-else class="preview-placeholder">
              预览内容将显示在这里
            </div>
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

        <div class="content-editor-wrapper">
          <div class="content-editor-left">
            <div class="form-item textarea-item">
              <label>提示信息</label>
              <textarea
                v-model="form.hint"
                rows="3"
                placeholder="可选：给出解题提示或注意事项"
                ref="hintTextarea"
              ></textarea>
            </div>
          </div>
          <div class="content-preview-right">
            <div class="preview-header">预览</div>
            <div v-if="form.hint.trim()" class="preview-content" v-html="renderContent(form.hint)"></div>
            <div v-else class="preview-placeholder">
              预览内容将显示在这里
            </div>
          </div>
        </div>
      </section>

      

      <section class="form-section">
        <h2>测评数据</h2>
        <div class="testcase-upload-mode">
          <label class="mode-option">
            <input
              type="radio"
              v-model="testcaseUploadMode"
              value="manual"
            />
            <span>手动上传</span>
          </label>
          <label class="mode-option">
            <input
              type="radio"
              v-model="testcaseUploadMode"
              value="auto"
            />
            <span>自动上传</span>
          </label>
        </div>

        <!-- 手动上传模式 -->
        <div v-if="testcaseUploadMode === 'manual'" class="manual-upload">
          <div class="testcase-list">
            <div
              v-for="(testcase, index) in form.testcases"
              :key="index"
              class="testcase-item"
            >
              <div class="testcase-header">
                <span>测评数据 {{ index + 1 }}</span>
                <button
                  class="btn-link"
                  @click="removeTestcase(index)"
                  v-if="form.testcases.length > 1"
                >
                  删除
                </button>
              </div>
              <div class="form-grid">
                <div class="form-item textarea-item">
                  <label>输入 {{ index + 1 }}</label>
                  <textarea
                    v-model="testcase.input"
                    rows="3"
                    placeholder="请输入测评输入数据"
                  ></textarea>
                </div>
                <div class="form-item textarea-item">
                  <label>输出 {{ index + 1 }}</label>
                  <textarea
                    v-model="testcase.output"
                    rows="3"
                    placeholder="请输入测评输出数据"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
          <button class="btn-add-testcase" @click="addTestcase">
            + 添加测评数据
          </button>
        </div>

        <!-- 自动上传模式 -->
        <div v-if="testcaseUploadMode === 'auto'" class="auto-upload">
          <div class="upload-zone">
            <input
              ref="zipFileInput"
              type="file"
              accept=".zip,.rar,.7z"
              style="display: none"
              @change="handleZipFileChange"
            />
            <div
              v-if="!zipFile"
              class="upload-placeholder"
              @click="$refs.zipFileInput?.click()"
            >
              <p>点击选择压缩包文件</p>
              <small>支持 .zip, .rar, .7z 格式</small>
            </div>
            <div v-else class="upload-file-info">
              <span>{{ zipFile.name }}</span>
              <button class="btn-remove-file" @click="removeZipFile">×</button>
            </div>
          </div>
          <div v-if="extracting" class="extract-progress">
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: extractProgress + '%' }"
              ></div>
            </div>
            <p>解压进度: {{ extractProgress }}%</p>
          </div>
          <div v-if="extractError" class="extract-error">
            {{ extractError }}
          </div>
        </div>
      </section>

      <div class="form-actions">
        <button class="btn-primary" :disabled="saving" @click="submitForm">
          {{ saving ? '保存中...' : '保存题目' }}
        </button>
        <button class="btn-secondary" @click="goBack">
          返回
        </button>
      </div>

      <transition name="fade">
        <div v-if="feedbackVisible" class="center-feedback" :class="`center-feedback-${feedbackType}`">
          {{ feedbackMessage }}
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import { getProblemDetail, updateProblem, uploadZipFile, uploadTestcaseFiles, uploadExtractedTestcases, clearProblemTestcases } from '@/api/problem'
import MarkdownIt from 'markdown-it'
import katex from 'katex'
import 'katex/dist/katex.min.css'

export default {
  name: 'ProblemEdit',
  data() {
    return {
      md: null, // Markdown 渲染器实例
      problemId: null,
      loading: false,
      loadError: '',
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
        ],
        testcases: [
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
      saveSuccess: false,
      feedbackVisible: false,
      feedbackMessage: '',
      feedbackType: 'success',
      testcaseUploadMode: 'manual',
      zipFile: null,
      extracting: false,
      extractProgress: 0,
      extractError: '',
      extractedFiles: [],
      extractedToken: ''
    }
  },
  created() {
    // 初始化 Markdown 渲染器
    this.md = new MarkdownIt({
      html: true, // 允许 HTML 标签
      linkify: true, // 自动识别链接
      breaks: true // 将换行符转换为 <br>
    })
    
    this.problemId = parseInt(this.$route.params.id)
    if (!this.problemId) {
      this.loadError = '题目ID无效'
      return
    }
    this.loadProblem()
  },
  methods: {
    // 渲染 Markdown 和 LaTeX 内容（与 Detail.vue 保持一致）
    renderContent(text) {
      if (!text) return ''
      
      // 先处理换行符（将 \n 转换为实际的换行）
      let processed = text.replace(/\\n/g, '\n')
      
      // 保留行首空格：使用占位符临时标记行首空格
      const spacePlaceholders = new Map()
      let spaceIndex = 0
      processed = processed.split('\n').map(line => {
        // 匹配行首的空格
        const match = line.match(/^(\s+)/)
        if (match) {
          const spaces = match[1]
          const placeholder = `<span data-space-placeholder="${spaceIndex}"></span>`
          spacePlaceholders.set(spaceIndex, spaces.replace(/ /g, '&nbsp;'))
          spaceIndex++
          return line.replace(/^(\s+)/, placeholder)
        }
        return line
      }).join('\n')
      
      // 使用占位符临时替换 LaTeX 公式，避免与 Markdown 处理冲突
      const placeholders = new Map()
      let placeholderIndex = 0
      
      // 处理块级公式：$$...$$ 或 \[...\]
      processed = processed.replace(/\$\$([\s\S]*?)\$\$/g, (match, formula) => {
        try {
          const rendered = katex.renderToString(formula.trim(), { displayMode: true, throwOnError: false })
          const placeholder = `<span data-latex-placeholder="${placeholderIndex}"></span>`
          placeholders.set(placeholderIndex, rendered)
          placeholderIndex++
          return placeholder
        } catch (e) {
          return match
        }
      })
      processed = processed.replace(/\\\[([\s\S]*?)\\\]/g, (match, formula) => {
        try {
          const rendered = katex.renderToString(formula.trim(), { displayMode: true, throwOnError: false })
          const placeholder = `<span data-latex-placeholder="${placeholderIndex}"></span>`
          placeholders.set(placeholderIndex, rendered)
          placeholderIndex++
          return placeholder
        } catch (e) {
          return match
        }
      })
      
      // 处理行内公式：$...$ 或 \(...\)
      processed = processed.replace(/\$([^$\n]+?)\$/g, (match, formula) => {
        // 检查是否包含数学符号或字母（避免匹配普通文本中的 $）
        if (/[a-zA-Zα-ωΑ-Ω_^\\{}[\]]/.test(formula)) {
          try {
            const rendered = katex.renderToString(formula.trim(), { displayMode: false, throwOnError: false })
            const placeholder = `<span data-latex-placeholder="${placeholderIndex}"></span>`
            placeholders.set(placeholderIndex, rendered)
            placeholderIndex++
            return placeholder
          } catch (e) {
            return match
          }
        }
        return match
      })
      processed = processed.replace(/\\\(([^\\]+?)\\\)/g, (match, formula) => {
        try {
          const rendered = katex.renderToString(formula.trim(), { displayMode: false, throwOnError: false })
          const placeholder = `<span data-latex-placeholder="${placeholderIndex}"></span>`
          placeholders.set(placeholderIndex, rendered)
          placeholderIndex++
          return placeholder
        } catch (e) {
          return match
        }
      })
      
      // 使用 Markdown 渲染
      let html = this.md.render(processed)
      
      // 将占位符替换回渲染后的 LaTeX（按索引从大到小替换，避免索引冲突）
      const sortedIndices = Array.from(placeholders.keys()).sort((a, b) => b - a)
      sortedIndices.forEach(index => {
        const rendered = placeholders.get(index)
        const placeholderRegex = new RegExp(`<span data-latex-placeholder="${index}"></span>`, 'g')
        html = html.replace(placeholderRegex, rendered)
      })
      
      // 将行首空格占位符替换为 &nbsp;
      spacePlaceholders.forEach((spaces, index) => {
        const placeholderRegex = new RegExp(`<span data-space-placeholder="${index}"></span>`, 'g')
        html = html.replace(placeholderRegex, spaces)
      })
      
      return html
    },
    async loadProblem() {
      this.loading = true
      this.loadError = ''
      try {
        const res = await getProblemDetail(this.problemId, { allow_all: true })
        const data = res.data || res
        
        // 填充表单
        this.form.title = data.title || ''
        this.form.content = data.content || ''
        this.form.input_description = data.input_description || ''
        this.form.output_description = data.output_description || ''
        this.form.hint = data.hint || ''
        this.form.time_limit = data.time_limit || 1000
        this.form.memory_limit = data.memory_limit || 256
        this.form.level = data.difficulty || 1
        this.form.auth = data.auth || 1
        this.form.score = data.score || 100
        this.form.tag = (data.tags || []).join('|') || ''
        
        // 处理样例数据
        if (data.samples && data.samples.length > 0) {
          this.form.samples = data.samples.map(s => ({
            input: s.input || '',
            output: s.output || ''
          }))
        } else {
          this.form.samples = [{ input: '', output: '' }]
        }
      } catch (err) {
        console.error('加载题目详情失败:', err)
        this.loadError = err.message || '加载题目详情失败，请稍后重试'
      } finally {
        this.loading = false
      }
    },
    addSample() {
      this.form.samples.push({ input: '', output: '' })
    },
    removeSample(index) {
      if (this.form.samples.length === 1) return
      this.form.samples.splice(index, 1)
    },
    addTestcase() {
      this.form.testcases.push({ input: '', output: '' })
    },
    removeTestcase(index) {
      if (this.form.testcases.length === 1) return
      this.form.testcases.splice(index, 1)
    },
    handleZipFileChange(event) {
      const file = event.target.files?.[0]
      if (!file) return

      this.zipFile = file
      this.extractError = ''
      this.extractedFiles = []
      this.extractedToken = ''
      this.extractProgress = 0

      this.extractZipFile(file)
    },
    async extractZipFile(file) {
      this.extracting = true
      this.extractProgress = 0
      this.extractError = ''

      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await uploadZipFile(formData, (progressEvent) => {
          if (progressEvent.lengthComputable) {
            this.extractProgress = Math.round(
              (progressEvent.loaded * 50) / progressEvent.total
            )
          }
        })

        for (let i = 50; i <= 100; i += 10) {
          await new Promise((resolve) => setTimeout(resolve, 200))
          this.extractProgress = i
        }

        if (response.valid) {
          this.extractedFiles = response.files || []
          this.extractedToken = response.token || ''
        } else {
          this.extractError = response.message || '压缩包不符合规范'
          this.zipFile = null
          this.extractedToken = ''
          if (this.$refs.zipFileInput) {
            this.$refs.zipFileInput.value = ''
          }
        }
      } catch (err) {
        console.error('解压压缩包失败:', err)
        this.extractError = err.message || '解压压缩包失败，请稍后重试'
        this.zipFile = null
        this.extractedToken = ''
        if (this.$refs.zipFileInput) {
          this.$refs.zipFileInput.value = ''
        }
      } finally {
        this.extracting = false
      }
    },
    removeZipFile() {
      this.zipFile = null
      this.extractedFiles = []
      this.extractedToken = ''
      this.extractError = ''
      this.extractProgress = 0
      if (this.$refs.zipFileInput) {
        this.$refs.zipFileInput.value = ''
      }
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
        output_description: 'outputDescTextarea',
        hint: 'hintTextarea'
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
        this.showFeedback('error', msg || '更新失败')
      }
      const showSuccess = (msg) => {
        if (this.$message?.success) {
          this.$message.success(msg)
        } else {
          console.log(msg)
        }
        this.showFeedback('success', msg || '更新成功')
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

      // 判断是否需要处理测评数据
      const hasManualTestcase = this.form.testcases.some(
        (tc) => (tc.input && tc.input.trim()) || (tc.output && tc.output.trim())
      )
      const hasAutoTestcase = this.extractedFiles.length > 0 && this.extractedToken

      this.saving = true

      try {
        await updateProblem(this.problemId, payload)
        // 异步删除旧测评数据并上传新数据
        if (hasManualTestcase || hasAutoTestcase) {
          const uploadPromise = (async () => {
            // 先清空旧的测评数据
            await clearProblemTestcases(this.problemId)
            if (hasManualTestcase) {
              const snapshot = this.form.testcases.map(tc => ({
                input: tc.input || '',
                output: tc.output || ''
              }))
              await this.uploadManualTestcases(this.problemId, snapshot)
            } else if (hasAutoTestcase) {
              await this.uploadAutoTestcases(this.problemId, this.extractedToken)
            }
          })()

          uploadPromise
            .then(() => {
              if (this.$message?.success) this.$message.success('测评数据已更新')
            })
            .catch((err) => {
              console.error('测评数据更新失败:', err)
              if (this.$message?.error) {
                this.$message.error(err?.message || '测评数据更新失败，请稍后重试')
              }
            })
        }

        showSuccess(hasManualTestcase || hasAutoTestcase ? '更新题目成功，测评数据后台更新中' : '更新题目成功')
        this.saveSuccess = true
        // 2秒后返回管理页面
        setTimeout(() => {
          this.$router.push('/admin/problems/manage')
        }, 2000)
      } catch (error) {
        console.error('更新题目失败:', error)
        showError(error.message || '更新题目失败，请稍后重试')
      } finally {
        this.saving = false
      }
    },
    async uploadManualTestcases(problemId, testcases) {
      const files = []
      testcases.forEach((testcase, index) => {
        const num = index + 1
        const hasInput = (testcase.input || '').trim().length > 0
        const hasOutput = (testcase.output || '').trim().length > 0
        if (!hasInput && !hasOutput) return
        files.push({
          name: `${num}.in`,
          content: testcase.input || ''
        })
        files.push({
          name: `${num}.out`,
          content: testcase.output || ''
        })
      })

      if (files.length > 0) {
        await uploadTestcaseFiles(problemId, files)
      }
    },
    async uploadAutoTestcases(problemId, token) {
      await uploadExtractedTestcases(problemId, token)
    },
    showFeedback(type, message) {
      this.feedbackType = type
      this.feedbackMessage = message
      this.feedbackVisible = true
      setTimeout(() => {
        this.feedbackVisible = false
      }, 2000)
    },
    goBack() {
      this.$router.push('/admin/problems/manage')
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

.testcase-upload-mode {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.mode-option {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #333333;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  padding: 8px 12px;
  line-height: 1;
  background-color: #fff;
  transition: all 0.2s ease;
}

.mode-option input[type='radio'] {
  cursor: pointer;
  accent-color: #1890ff;
}

.mode-option:hover {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.12);
}

.manual-upload,
.auto-upload {
  margin-top: 12px;
}

.testcase-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 12px;
}

.testcase-item {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 16px;
  background-color: #fafafa;
}

.testcase-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-weight: 600;
  color: #333333;
}

.btn-add-testcase {
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

.upload-zone {
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
  padding: 24px;
  text-align: center;
}

.upload-placeholder {
  cursor: pointer;
  color: #666666;
}

.upload-placeholder p {
  margin: 0 0 4px 0;
  font-size: 14px;
}

.upload-placeholder small {
  font-size: 12px;
  color: #999999;
}

.upload-file-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.btn-remove-file {
  border: none;
  background: none;
  color: #ff4d4f;
  cursor: pointer;
  font-size: 18px;
  padding: 0 8px;
}

.extract-progress {
  margin-top: 12px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #1890ff, #40a9ff);
  transition: width 0.3s ease;
}

.extract-error {
  margin-top: 12px;
  padding: 10px 14px;
  background-color: #fff2f0;
  border: 1px solid #ffccc7;
  color: #cf1322;
  border-radius: 6px;
  font-size: 13px;
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

.center-feedback {
  position: fixed;
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
  min-width: 220px;
  padding: 12px 18px;
  border-radius: 8px;
  text-align: center;
  font-size: 14px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  z-index: 2000;
}

.center-feedback-success {
  background-color: #f6ffed;
  border: 1px solid #b7eb8f;
  color: #389e0d;
}

.center-feedback-error {
  background-color: #fff2f0;
  border: 1px solid #ffccc7;
  color: #cf1322;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
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

.content-editor-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 12px;
}

.content-editor-left {
  display: flex;
  flex-direction: column;
}

.content-editor-left .textarea-item {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.content-editor-left textarea {
  flex: 1;
  resize: vertical;
}

/* 题面描述使用较大的高度 */
.content-editor-wrapper:first-of-type .content-editor-left textarea {
  min-height: 300px;
}

/* 输入描述、输出描述、提示信息使用较小的高度 */
.content-editor-wrapper:not(:first-of-type) .content-editor-left textarea {
  min-height: 150px;
}

.content-editor-wrapper:not(:first-of-type) .content-preview-right {
  min-height: 150px;
}

.content-editor-wrapper:not(:first-of-type) .preview-content {
  min-height: 130px;
  max-height: 200px;
}

.content-editor-wrapper:not(:first-of-type) .preview-placeholder {
  min-height: 130px;
}

/* 修复对齐问题：确保有 label 的输入框和预览区域顶部对齐 */
.content-editor-wrapper:not(:first-of-type) .content-editor-left {
  display: flex;
  flex-direction: column;
}

.content-editor-wrapper:not(:first-of-type) .content-editor-left .form-item {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.content-editor-wrapper:not(:first-of-type) .content-preview-right {
  display: flex;
  flex-direction: column;
}

/* 给预览区域添加一个与 label 高度相同的占位，使预览内容与 textarea 对齐 */
.content-editor-wrapper:not(:first-of-type) .content-preview-right .preview-header {
  height: 28px; /* 与 label 高度 + margin-bottom 一致 */
  padding: 0;
  display: flex;
  align-items: center;
  padding-left: 0;
  padding-right: 0;
  font-size: 0;
  line-height: 28px;
}

.content-editor-wrapper:not(:first-of-type) .content-preview-right .preview-header::before {
  content: '';
  display: block;
  height: 100%;
  width: 100%;
}

.content-preview-right {
  display: flex;
  flex-direction: column;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background-color: #fafafa;
  overflow: hidden;
  min-height: 300px;
}

.preview-header {
  padding: 10px 12px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e8e8e8;
  font-size: 14px;
  font-weight: 500;
  color: #333333;
}

.preview-content {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
  min-height: 280px;
  max-height: 400px;
  font-size: 14px;
  line-height: 1.8;
  color: #333333;
}

.preview-content :deep(h1),
.preview-content :deep(h2),
.preview-content :deep(h3),
.preview-content :deep(h4),
.preview-content :deep(h5),
.preview-content :deep(h6) {
  margin: 16px 0 12px 0;
  font-weight: 600;
  color: #333333;
  line-height: 1.4;
}

.preview-content :deep(h1) {
  font-size: 24px;
  border-bottom: 2px solid #e8e8e8;
  padding-bottom: 8px;
}

.preview-content :deep(h2) {
  font-size: 20px;
  border-bottom: 1px solid #e8e8e8;
  padding-bottom: 6px;
}

.preview-content :deep(h3) {
  font-size: 18px;
}

.preview-content :deep(h4) {
  font-size: 16px;
}

.preview-content :deep(h5),
.preview-content :deep(h6) {
  font-size: 15px;
}

.preview-content :deep(p) {
  margin: 0 0 12px 0;
  line-height: 1.8;
}

.preview-content :deep(ul),
.preview-content :deep(ol) {
  margin: 12px 0;
  padding-left: 24px;
}

.preview-content :deep(li) {
  margin: 6px 0;
  line-height: 1.8;
}

.preview-content :deep(blockquote) {
  margin: 12px 0;
  padding: 12px 16px;
  border-left: 4px solid #1890ff;
  background-color: #f0f7ff;
  color: #111111;
}

.preview-content :deep(code) {
  padding: 2px 6px;
  background-color: #f5f5f5;
  border: 1px solid #e8e8e8;
  border-radius: 3px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  color: #e83e8c;
}

.preview-content :deep(pre) {
  margin: 12px 0;
  padding: 12px;
  background-color: #f5f5f5;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  overflow-x: auto;
}

.preview-content :deep(pre code) {
  padding: 0;
  background-color: transparent;
  border: none;
  color: #333333;
  font-size: 14px;
}

.preview-content :deep(a) {
  color: #1890ff;
  text-decoration: none;
}

.preview-content :deep(a:hover) {
  text-decoration: underline;
}

.preview-content :deep(table) {
  width: 100%;
  margin: 12px 0;
  border-collapse: collapse;
}

.preview-content :deep(th),
.preview-content :deep(td) {
  padding: 8px 12px;
  border: 1px solid #e8e8e8;
  text-align: left;
}

.preview-content :deep(th) {
  background-color: #fafafa;
  font-weight: 600;
}

.preview-content :deep(hr) {
  margin: 16px 0;
  border: none;
  border-top: 1px solid #e8e8e8;
}

.preview-content :deep(img) {
  max-width: 100%;
  height: auto;
  margin: 12px 0;
  border-radius: 4px;
}

/* LaTeX 数学公式样式 */
.preview-content :deep(.katex) {
  font-size: 1.1em;
}

.preview-content :deep(.katex-display) {
  margin: 16px 0;
  overflow-x: auto;
  overflow-y: hidden;
}

.preview-content :deep(.katex-display > .katex) {
  display: inline-block;
  text-align: left;
}

.preview-placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 280px;
  color: #999999;
  font-size: 14px;
}
</style>

