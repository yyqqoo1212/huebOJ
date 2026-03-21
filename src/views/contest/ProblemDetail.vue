<template>
  <div class="contest-problems">
    <div class="problems-container">
      <div class="problems-card">
        <div v-if="loading" class="loading-state">
          <p>正在加载题目详情...</p>
        </div>
        <div v-else-if="error" class="error-state">
          <p>{{ error }}</p>
        </div>
        <div v-else class="problem-detail-container">
          <!-- 左侧：题面 -->
          <div class="problem-info-section">
            <div class="problem-header">
              <div class="problem-title-row">
                <h1 class="problem-title">{{ displayTitle }}</h1>
              </div>
              <div class="problem-meta">
                <div class="meta-item">
                  <span class="meta-label">题号：</span>
                  <span class="meta-value">{{ displayOrder }}</span>
                </div>
                <div class="meta-item" v-if="problem.time_limit != null">
                  <span class="meta-label">时间限制：</span>
                  <span class="meta-value">{{ problem.time_limit }}ms</span>
                </div>
                <div class="meta-item" v-if="problem.memory_limit != null">
                  <span class="meta-label">内存限制：</span>
                  <span class="meta-value">{{ problem.memory_limit }}MB</span>
                </div>
              </div>
            </div>

            <div class="problem-content">
              <div class="content-section">
                <h2 class="section-title">题目描述</h2>
                <div class="section-content">
                  <div v-if="problem.content" v-html="renderContent(problem.content)"></div>
                  <p v-else class="placeholder-text">题目描述内容待完善...</p>
                </div>
              </div>

              <div class="content-section">
                <h2 class="section-title">输入描述</h2>
                <div class="section-content">
                  <div v-if="problem.input_description" v-html="renderContent(problem.input_description)"></div>
                  <p v-else class="placeholder-text">输入描述内容待完善...</p>
                </div>
              </div>

              <div class="content-section">
                <h2 class="section-title">输出描述</h2>
                <div class="section-content">
                  <div v-if="problem.output_description" v-html="renderContent(problem.output_description)"></div>
                  <p v-else class="placeholder-text">输出描述内容待完善...</p>
                </div>
              </div>

              <div class="content-section" v-if="sampleList.length > 0">
                <h2 class="section-title">样例</h2>
                <div class="sample-container">
                  <div v-for="(sample, index) in sampleList" :key="index" class="sample-group">
                    <div class="sample-group-header">
                      <h3 class="sample-group-title">样例 {{ index + 1 }}</h3>
                    </div>
                    <div class="sample-group-content">
                      <div class="sample-item" v-if="sample.input">
                        <div class="sample-header">
                          <h4 class="sample-label">输入：</h4>
                          <button class="btn-copy" @click="copyToClipboard(sample.input)" title="复制输入样例">📋</button>
                        </div>
                        <pre class="sample-code">{{ sample.input }}</pre>
                      </div>
                      <div class="sample-item" v-if="sample.output">
                        <div class="sample-header">
                          <h4 class="sample-label">输出：</h4>
                          <button class="btn-copy" @click="copyToClipboard(sample.output)" title="复制输出样例">📋</button>
                        </div>
                        <pre class="sample-code">{{ sample.output }}</pre>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="content-section" v-if="problem.hint">
                <h2 class="section-title">提示</h2>
                <div class="section-content">
                  <div v-html="renderContent(problem.hint)"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧：代码编辑+提交 -->
          <div class="code-section">
            <div class="code-header">
              <div class="language-selector">
                <label for="language">语言：</label>
                <select id="language" v-model="selectedLanguage" class="language-select">
                  <option
                    v-for="lang in availableLanguages"
                    :key="lang"
                    :value="lang"
                  >
                    {{ languageLabelMap[lang] || lang }}
                  </option>
                </select>
              </div>

              <div
                v-if="submissionStatus"
                class="submission-status"
                :class="getSubmissionStatusClass()"
                @click="goToSubmissionDetail"
                :title="submissionStatus === 'Judging' ? '判题中...' : (submissionId ? '点击查看详情' : '')"
              >
                <span class="status-text">{{ submissionStatus }}</span>
              </div>

              <div class="code-actions">
                <div class="editor-settings">
                  <div class="font-size-selector">
                    <select id="fontSize" v-model="fontSize" @change="updateFontSize" class="font-size-select">
                      <option value="12">12px</option>
                      <option value="14">14px</option>
                      <option value="16">16px</option>
                      <option value="18">18px</option>
                      <option value="20">20px</option>
                    </select>
                  </div>
                  <button
                    class="btn-theme-toggle"
                    @click="toggleTheme"
                    :title="isDarkTheme ? '切换到亮色主题' : '切换到暗色主题'"
                  >
                    {{ isDarkTheme ? '☀️' : '🌙' }}
                  </button>
                </div>
                <button class="btn-reset" @click="resetCode">⟲</button>
                <button class="btn-test" :class="{ active: showTestPanel }" @click="toggleTestPanel">
                  {{ showTestPanel ? '收起自测' : '在线自测' }}
                </button>
                <button
                  class="btn-submit"
                  @click="handleSubmit"
                  :disabled="submitLoading || !canSubmitAfterEndRule"
                  :title="!canSubmitAfterEndRule ? submitBlockReason : ''"
                >
                  {{ submitLoading ? '提交中...' : '提交代码' }}
                </button>
              </div>
            </div>
            <div class="editor-container">
              <div ref="editorContainer" class="codemirror-editor"></div>
              <div v-if="!editor" class="editor-loading">
                <div class="loading-spinner"></div>
                <p>编辑器加载中...</p>
              </div>
            </div>

            <transition name="slide-up">
              <div v-if="showTestPanel" class="test-panel" :style="{ height: testPanelHeight + 'px' }">
                <div class="test-panel-resizer" @mousedown="startResize"></div>
                <div class="test-panel-content">
                  <div class="test-input-section">
                    <div class="test-section-header">
                      <label class="test-section-label">测试用例输入</label>
                      <div class="test-section-actions">
                        <button
                          v-for="(sample, index) in sampleList"
                          :key="index"
                          class="btn-fill-sample"
                          @click="fillTestInput(sample.input)"
                          :title="`填充样例 ${index + 1} 的输入`"
                        >
                          样例 {{ index + 1 }}
                        </button>
                        <button class="btn-clear" @click="testInput = ''">清空</button>
                      </div>
                    </div>
                    <textarea
                      v-model="testInput"
                      class="test-input-area"
                      placeholder="请输入测试用例，或点击上方按钮填充样例输入..."
                      rows="6"
                    ></textarea>
                  </div>
                  <div class="test-output-section">
                    <div class="test-section-header">
                      <label class="test-section-label">运行结果</label>
                      <button class="btn-run-test" @click="handleRunTest" :disabled="!testInput.trim() || testRunning">
                        {{ testRunning ? '运行中...' : '▶ 运行自测' }}
                      </button>
                    </div>
                    <div class="test-output-area">
                      <div v-if="testRunning" class="test-output-loading">
                        <div class="loading-spinner-small"></div>
                        <span>正在运行...</span>
                      </div>
                      <div v-else-if="testResult" class="test-result-container">
                        <div class="test-result-header">
                          <div class="test-result-status" :class="getResultStatusClass(testResult.result)">
                            {{ getResultStatusText(testResult.result) }}
                          </div>
                          <div class="test-result-info">
                            <span class="info-item">运行时间: {{ testResult.cpu_time || 0 }}ms</span>
                            <span class="info-item">内存使用: {{ formatMemory(testResult.memory) }}KB</span>
                          </div>
                        </div>
                        <div class="test-output-content-wrapper">
                          <pre class="test-output-content">{{ testResult.output || '(无输出)' }}</pre>
                        </div>
                      </div>
                      <div v-else class="test-output-placeholder">
                        运行结果将显示在这里...
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MarkdownIt from 'markdown-it'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import { getContestDetail, getContestProblemDetail } from '@/api/contest'
import { runTest, submitCode } from '@/api/problem'
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, highlightSpecialChars, drawSelection, dropCursor, rectangularSelection, crosshairCursor } from '@codemirror/view'
import { EditorState, Compartment } from '@codemirror/state'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { foldGutter, foldKeymap, syntaxHighlighting, defaultHighlightStyle, bracketMatching } from '@codemirror/language'
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete'
import { oneDark } from '@codemirror/theme-one-dark'
import { cpp } from '@codemirror/lang-cpp'
import { java } from '@codemirror/lang-java'
import { python } from '@codemirror/lang-python'
import { javascript } from '@codemirror/lang-javascript'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const error = ref('')

// 比赛显示字段
const displayOrder = ref('')
const displayTitle = ref('')
const realProblemId = ref(null)

// 题库题目字段（尽量兼容后端返回结构）
const problem = ref({
  id: null,
  title: '',
  time_limit: null,
  memory_limit: null,
  content: '',
  input_description: '',
  output_description: '',
  input_demo: '',
  output_demo: '',
  hint: ''
})

const sampleList = ref([])

// 右侧编辑器相关
const editorContainer = ref(null)
const editor = ref(null)
const selectedLanguage = ref('cpp')
const availableLanguages = ref(['cpp', 'java', 'python', 'javascript'])
const languageCompartment = ref(null)
const fontSize = ref(14)
const isDarkTheme = ref(true)
const fontSizeCompartment = ref(null)
const themeCompartment = ref(null)
const submitLoading = ref(false)
const submissionStatus = ref('')
const submissionId = ref(null)
const defaultCode = {
  cpp: ``,
  java: ``,
  python: ``,
  javascript: ``
}
const languageLabelMap = {
  cpp: 'C++',
  java: 'Java',
  python: 'Python',
  javascript: 'JavaScript'
}

// 在线自测
const showTestPanel = ref(false)
const testInput = ref('')
const testResult = ref(null)
const testRunning = ref(false)
const testPanelHeight = ref(400)

const md = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: true
})

const contestId = computed(() => route.params.id)
const problemId = computed(() => route.params.problemId)
const contestStatus = ref('')
const allowSubmitAfterEnd = ref(false)
const canSubmitAfterEndRule = computed(() => {
  if (contestStatus.value === '已结束') return allowSubmitAfterEnd.value
  return true
})
const submitBlockReason = computed(() => '该比赛已结束，当前不允许继续提交代码')

function parseSamples(inputDemo, outputDemo) {
  sampleList.value = []
  if (!inputDemo && !outputDemo) return
  const inputList = inputDemo ? String(inputDemo).split('|').map(s => s.trim()).filter(Boolean) : []
  const outputList = outputDemo ? String(outputDemo).split('|').map(s => s.trim()).filter(Boolean) : []
  const maxLength = Math.max(inputList.length, outputList.length)
  for (let i = 0; i < maxLength; i++) {
    sampleList.value.push({ input: inputList[i] || '', output: outputList[i] || '' })
  }
}

function renderContent(text) {
  if (!text) return ''

  let processed = String(text).replace(/\\n/g, '\n')

  const placeholders = new Map()
  let placeholderIndex = 0

  // 块级公式 $$...$$
  processed = processed.replace(/\$\$([\s\S]*?)\$\$/g, (match, formula) => {
    try {
      const rendered = katex.renderToString(String(formula).trim(), { displayMode: true, throwOnError: false })
      const placeholder = `<span data-latex-placeholder="${placeholderIndex}"></span>`
      placeholders.set(placeholderIndex, rendered)
      placeholderIndex++
      return placeholder
    } catch {
      return match
    }
  })

  // 行内公式 $...$
  processed = processed.replace(/\$([^$\n]+?)\$/g, (match, formula) => {
    if (/[a-zA-Zα-ωΑ-Ω_^\\{}[\]]/.test(formula)) {
      try {
        const rendered = katex.renderToString(String(formula).trim(), { displayMode: false, throwOnError: false })
        const placeholder = `<span data-latex-placeholder="${placeholderIndex}"></span>`
        placeholders.set(placeholderIndex, rendered)
        placeholderIndex++
        return placeholder
      } catch {
        return match
      }
    }
    return match
  })

  let html = md.render(processed)

  Array.from(placeholders.keys())
    .sort((a, b) => b - a)
    .forEach(index => {
      const rendered = placeholders.get(index)
      const placeholderRegex = new RegExp(`<span data-latex-placeholder="${index}"></span>`, 'g')
      html = html.replace(placeholderRegex, rendered)
    })

  return html
}

function copyToClipboard(text) {
  if (!text) return
  navigator.clipboard?.writeText(text).catch(() => {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    try {
      document.execCommand('copy')
    } finally {
      document.body.removeChild(textarea)
    }
  })
}

async function loadContestProblem() {
  if (!contestId.value || !problemId.value) {
    error.value = '参数不完整'
    return
  }

  loading.value = true
  error.value = ''
  try {
    // 使用比赛规则配置中的 language_limit 控制语言下拉
    const contestResp = await getContestDetail(contestId.value)
    const languageLimit = contestResp?.data?.rule_config?.language_limit
    contestStatus.value = contestResp?.data?.status || ''
    allowSubmitAfterEnd.value = Boolean(contestResp?.data?.rule_config?.allow_submit_after_end)
    if (Array.isArray(languageLimit) && languageLimit.length > 0) {
      const filtered = languageLimit
        .map(item => String(item || '').trim())
        .filter(lang => Object.prototype.hasOwnProperty.call(languageLabelMap, lang))
      availableLanguages.value = filtered.length > 0 ? Array.from(new Set(filtered)) : ['cpp', 'java', 'python', 'javascript']
    } else {
      availableLanguages.value = ['cpp', 'java', 'python', 'javascript']
    }
    if (!availableLanguages.value.includes(selectedLanguage.value)) {
      selectedLanguage.value = availableLanguages.value[0] || 'cpp'
    }

    // 单次请求：比赛题目详情（含 display_order/display_title），不再先拉列表
    const detailResp = await getContestProblemDetail(contestId.value, problemId.value)
    if (detailResp.code !== 'success' || !detailResp.data) {
      error.value = detailResp.message || '获取题目详情失败'
      return
    }
    const rawProblem = detailResp.data

    realProblemId.value = rawProblem.id ?? Number(problemId.value)
    displayOrder.value = rawProblem.display_order ?? ''
    displayTitle.value = rawProblem.display_title ?? rawProblem.title ?? ''

    problem.value = {
      ...problem.value,
      ...rawProblem
    }

    if (Array.isArray(rawProblem.samples) && rawProblem.samples.length > 0) {
      sampleList.value = rawProblem.samples
    } else {
      parseSamples(rawProblem.input_demo, rawProblem.output_demo)
    }
  } catch (e) {
    console.error('获取题目详情失败:', e)
    error.value = e?.message || '获取题目详情失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

function getLanguageSupport(lang) {
  const map = {
    cpp: cpp(),
    java: java(),
    python: python(),
    javascript: javascript()
  }
  return map[lang] || cpp()
}

function initEditor() {
  if (!editorContainer.value) return
  if (editor.value) {
    try { editor.value.destroy() } catch (e) { console.warn('销毁编辑器失败:', e) }
    editor.value = null
  }

  languageCompartment.value = new Compartment()
  fontSizeCompartment.value = new Compartment()
  themeCompartment.value = new Compartment()
  const languageSupport = getLanguageSupport(selectedLanguage.value)

  const state = EditorState.create({
    doc: defaultCode[selectedLanguage.value] || '',
    extensions: [
      lineNumbers(),
      highlightActiveLineGutter(),
      highlightSpecialChars(),
      history(),
      foldGutter(),
      drawSelection(),
      dropCursor(),
      EditorState.allowMultipleSelections.of(true),
      rectangularSelection(),
      crosshairCursor(),
      highlightActiveLine(),
      EditorView.lineWrapping,
      bracketMatching(),
      closeBrackets(),
      keymap.of([
        ...defaultKeymap,
        ...historyKeymap,
        ...foldKeymap,
        ...closeBracketsKeymap
      ]),
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
      fontSizeCompartment.value.of(EditorView.theme({
        '&': { fontSize: fontSize.value + 'px' },
        '.cm-content': { fontSize: fontSize.value + 'px', lineHeight: '1.6' }
      })),
      themeCompartment.value.of(isDarkTheme.value ? oneDark : EditorView.theme({
        '&': { backgroundColor: '#ffffff', color: '#333333' },
        '.cm-gutters': { backgroundColor: '#f5f5f5', color: '#999999', borderRight: '1px solid #e8e8e8' },
        '.cm-activeLineGutter': { backgroundColor: '#f0f0f0' },
        '.cm-activeLine': { backgroundColor: '#f8f8f8' }
      })),
      languageCompartment.value.of(languageSupport)
    ]
  })

  editor.value = new EditorView({
    state,
    parent: editorContainer.value
  })
}

function updateEditorLanguage() {
  if (!editor.value || !languageCompartment.value) return
  const support = getLanguageSupport(selectedLanguage.value)
  editor.value.dispatch({ effects: languageCompartment.value.reconfigure(support) })
}

function resetCode() {
  if (!editor.value) return
  const code = defaultCode[selectedLanguage.value] || ''
  editor.value.dispatch({
    changes: { from: 0, to: editor.value.state.doc.length, insert: code }
  })
}

function updateFontSize() {
  if (!editor.value || !fontSizeCompartment.value) return
  editor.value.dispatch({
    effects: fontSizeCompartment.value.reconfigure(EditorView.theme({
      '&': { fontSize: fontSize.value + 'px' },
      '.cm-content': { fontSize: fontSize.value + 'px', lineHeight: '1.6' }
    }))
  })
}

function toggleTheme() {
  isDarkTheme.value = !isDarkTheme.value
  if (!editor.value || !themeCompartment.value) return
  const lightTheme = EditorView.theme({
    '&': { backgroundColor: '#ffffff', color: '#333333' },
    '.cm-gutters': { backgroundColor: '#f5f5f5', color: '#999999', borderRight: '1px solid #e8e8e8' },
    '.cm-activeLineGutter': { backgroundColor: '#f0f0f0' },
    '.cm-activeLine': { backgroundColor: '#f8f8f8' },
    '.cm-selectionBackground': { backgroundColor: '#b3d4fc' }
  })
  editor.value.dispatch({
    effects: themeCompartment.value.reconfigure(isDarkTheme.value ? oneDark : lightTheme)
  })
}

function getSubmissionStatusClass() {
  const status = String(submissionStatus.value || '').toLowerCase()
  if (status === 'judging') return 'status-judging'
  if (status === 'accepted') return 'status-accepted'
  if (status.includes('wrong')) return 'status-wrong-answer'
  if (status.includes('time')) return 'status-time-limit'
  if (status.includes('memory')) return 'status-memory-limit'
  if (status.includes('runtime')) return 'status-runtime-error'
  if (status.includes('compile')) return 'status-compile-error'
  return 'status-system-error'
}

function goToSubmissionDetail() {
  if (submissionId.value) {
    router.push({ name: 'SubmissionDetail', params: { id: submissionId.value } })
  }
}

async function handleSubmit() {
  if (!realProblemId.value) return
  if (!editor.value) return
  if (!canSubmitAfterEndRule.value) {
    submissionStatus.value = submitBlockReason.value
    return
  }

  const code = editor.value.state.doc.toString()
  if (!code.trim()) {
    submissionStatus.value = '代码不能为空'
    return
  }

  submitLoading.value = true
  submissionStatus.value = 'Judging'
  submissionId.value = null
  try {
    const resp = await submitCode(realProblemId.value, {
      code,
      language: selectedLanguage.value,
      contest_id: Number(contestId.value)
    })
    if (resp.code === 'success' && resp.data) {
      submissionId.value = resp.data.submission_id
      const statusMap = {
        0: 'Accepted',
        '-1': 'Wrong Answer',
        1: 'Time Limit Exceeded',
        2: 'Time Limit Exceeded',
        3: 'Memory Limit Exceeded',
        4: 'Runtime Error',
        5: 'Compile Error',
        6: 'System Error',
        7: 'Judging'
      }
      submissionStatus.value = resp.data.status_text || statusMap[String(resp.data.status)] || 'Unknown'
    } else {
      submissionStatus.value = resp.message || '提交失败'
    }
  } catch (e) {
    submissionStatus.value = e?.message || '提交失败，请稍后重试'
  } finally {
    submitLoading.value = false
  }
}

function toggleTestPanel() {
  showTestPanel.value = !showTestPanel.value
  if (showTestPanel.value) {
    if (!testInput.value && sampleList.value.length > 0 && sampleList.value[0]?.input) {
      testInput.value = sampleList.value[0].input
    }
  }
}

function fillTestInput(input) {
  testInput.value = input || ''
}

async function handleRunTest() {
  if (!testInput.value.trim()) return
  if (!editor.value || !realProblemId.value) return

  const code = editor.value.state.doc.toString()
  if (!code.trim()) {
    testResult.value = { result: 5, output: '代码不能为空', cpu_time: 0, memory: 0 }
    return
  }

  testRunning.value = true
  testResult.value = null
  try {
    const resp = await runTest(realProblemId.value, {
      code,
      language: selectedLanguage.value,
      test_input: testInput.value
    })
    if (resp.code === 'success' && resp.data) {
      testResult.value = resp.data
    } else {
      testResult.value = { result: 5, output: `运行失败: ${resp.message || '未知错误'}`, cpu_time: 0, memory: 0 }
    }
  } catch (e) {
    testResult.value = { result: 5, output: `运行失败: ${e?.message || '请稍后重试'}`, cpu_time: 0, memory: 0 }
  } finally {
    testRunning.value = false
  }
}

function getResultStatusText(result) {
  const resultNum = Number(result)
  const statusMap = {
    0: 'Accepted',
    '-1': 'Wrong Answer',
    1: 'Time Limit Exceeded',
    2: 'Time Limit Exceeded',
    3: 'Memory Limit Exceeded',
    4: 'Runtime Error',
    5: 'System Error'
  }
  return statusMap[resultNum] || statusMap[String(resultNum)] || 'Unknown'
}

function getResultStatusClass(result) {
  const resultNum = Number(result)
  const classMap = {
    0: 'status-accepted',
    '-1': 'status-wrong-answer',
    1: 'status-time-limit',
    2: 'status-time-limit',
    3: 'status-memory-limit',
    4: 'status-runtime-error',
    5: 'status-system-error'
  }
  return classMap[resultNum] || classMap[String(resultNum)] || 'status-unknown'
}

function formatMemory(memoryBytes) {
  if (!memoryBytes) return '0'
  return Math.round(memoryBytes / 1024)
}

function startResize(e) {
  const startY = e.clientY
  const startHeight = testPanelHeight.value

  const doResize = (moveEvent) => {
    const deltaY = startY - moveEvent.clientY
    const newHeight = Math.max(200, Math.min(800, startHeight + deltaY))
    testPanelHeight.value = newHeight
  }

  const stopResize = () => {
    document.removeEventListener('mousemove', doResize)
    document.removeEventListener('mouseup', stopResize)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }

  document.addEventListener('mousemove', doResize)
  document.addEventListener('mouseup', stopResize)
  document.body.style.cursor = 'row-resize'
  document.body.style.userSelect = 'none'
}

onMounted(async () => {
  await loadContestProblem()
  await nextTick()
  initEditor()
})

watch(
  () => [contestId.value, problemId.value],
  async () => {
    if (contestId.value && problemId.value) await loadContestProblem()
  }
)

watch(selectedLanguage, () => {
  updateEditorLanguage()
})

onBeforeUnmount(() => {
  if (editor.value) {
    try { editor.value.destroy() } catch (e) { console.warn('销毁编辑器失败:', e) }
    editor.value = null
  }
})
</script>

<style scoped>
.contest-problems {
  padding: 30px 20px;
}

.problems-container {
  max-width: 1800px;
  margin: 0 auto;
}

.problems-card {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.problem-detail-container {
  max-width: 1600px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  height: calc(100vh - 260px);
}

.problem-info-section {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 24px;
  overflow-y: auto;
}

.loading-state,
.error-state {
  padding: 60px 20px;
  text-align: center;
  color: #999999;
}

.error-state {
  color: #ff4d4f;
}

.problem-header {
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 20px;
  margin-bottom: 24px;
}

.problem-title-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.problem-title {
  font-size: 26px;
  color: #333333;
  margin: 0;
  flex: 1;
}

.problem-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.meta-item {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.meta-label {
  color: #333333;
  margin-right: 4px;
}

.meta-value {
  color: #333333;
  font-weight: 500;
}

.problem-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.content-section {
  margin-bottom: 8px;
}

.section-title {
  font-size: 18px;
  color: #333333;
  margin: 0 0 12px 0;
  font-weight: 600;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.section-content {
  color: #333333;
  line-height: 1.8;
  font-size: 15px;
}

.section-content :deep(pre) {
  margin: 12px 0;
  padding: 12px;
  background-color: #f5f5f5;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  overflow-x: auto;
}

.placeholder-text {
  color: #999999;
  font-style: italic;
}

.sample-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.sample-group {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 16px;
  background-color: #fafafa;
}

.sample-group-header {
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e8e8e8;
}

.sample-group-title {
  font-size: 16px;
  color: #333333;
  margin: 0;
  font-weight: 600;
}

.sample-group-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sample-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.sample-label {
  font-size: 14px;
  color: #333333;
  margin: 0;
  font-weight: 500;
}

.btn-copy {
  padding: 4px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background-color: #ffffff;
  color: #666666;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-copy:hover {
  border-color: #1890ff;
  color: #1890ff;
  background-color: #f0f7ff;
}

.sample-code {
  background-color: #f5f5f5;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  padding: 12px;
  margin: 0;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  color: #333333;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-x: auto;
}

.code-section {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-bottom: 1px solid #f0f0f0;
  background-color: #fafafa;
  gap: 16px;
}

.language-selector {
  display: flex;
  align-items: center;
  gap: 6px;
}

.language-selector label {
  font-size: 13px;
  color: #666666;
  font-weight: 500;
}

.language-select {
  padding: 4px 10px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 13px;
  color: #333333;
  background-color: #ffffff;
  cursor: pointer;
  outline: none;
}

.code-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.editor-settings {
  display: flex;
  align-items: center;
  gap: 8px;
}

.font-size-select {
  padding: 4px 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 13px;
  color: #333333;
  background-color: #ffffff;
  cursor: pointer;
  outline: none;
}

.btn-theme-toggle {
  padding: 4px 10px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background-color: #ffffff;
  color: #333333;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 28px;
}

.btn-reset,
.btn-test,
.btn-submit {
  padding: 6px 16px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
}

.btn-reset {
  background-color: #ffffff;
  color: #666666;
  border: 1px solid #d9d9d9;
}

.btn-reset:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.btn-test {
  background-color: #52c41a;
  color: #ffffff;
  border: 1px solid #52c41a;
}

.btn-test:hover {
  background-color: #73d13d;
  border-color: #73d13d;
}

.btn-test.active {
  background-color: #faad14;
  border-color: #faad14;
}

.btn-test.active:hover {
  background-color: #ffc53d;
  border-color: #ffc53d;
}

.btn-submit {
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  color: #ffffff;
  border: 1px solid #1890ff;
  box-shadow: 0 2px 6px rgba(24, 144, 255, 0.3);
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.editor-container {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  position: relative;
}

.codemirror-editor {
  width: 100%;
  height: 100%;
  min-height: 400px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.codemirror-editor :deep(.cm-editor) {
  height: 100%;
  flex: 1;
}

.editor-loading {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #666666;
  background: rgba(255, 255, 255, 0.85);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f0f0f0;
  border-top-color: #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.submission-status {
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  user-select: none;
  color: #ffffff;
  cursor: pointer;
}

.status-judging { background-color: #1890ff; }
.status-accepted { background-color: #52c41a; }
.status-wrong-answer { background-color: #ff4d4f; }
.status-time-limit { background-color: #faad14; }
.status-memory-limit { background-color: #fa8c16; }
.status-runtime-error { background-color: #eb2f96; }
.status-compile-error { background-color: #722ed1; }
.status-system-error { background-color: #8c8c8c; }

@media (max-width: 1200px) {
  .problem-detail-container {
    grid-template-columns: 1fr;
    height: auto;
  }
  .code-section {
    min-height: 500px;
  }
}

/* 向上弹出过渡动画（自测面板） */
.slide-up-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(100%);
}

.slide-up-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.slide-up-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(100%);
}

.test-panel {
  border-top: 2px solid #e8e8e8;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  min-height: 200px;
  max-height: 800px;
}

.test-panel-resizer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  cursor: row-resize;
  background-color: transparent;
  z-index: 10;
  transition: background-color 0.2s;
}

.test-panel-resizer:hover {
  background-color: #1890ff;
}

.test-panel-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  padding: 16px 20px;
  overflow: hidden;
  flex: 1;
  min-height: 0;
}

.test-input-section,
.test-output-section {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.test-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.test-section-label {
  font-size: 14px;
  color: #333333;
  font-weight: 500;
}

.test-section-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.btn-fill-sample {
  padding: 4px 10px;
  border: 1px solid #1890ff;
  border-radius: 4px;
  background-color: #ffffff;
  color: #1890ff;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
}

.btn-fill-sample:hover {
  background-color: #e6f7ff;
  border-color: #40a9ff;
}

.btn-clear {
  padding: 4px 10px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background-color: #ffffff;
  color: #666666;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
}

.btn-clear:hover {
  border-color: #ff4d4f;
  color: #ff4d4f;
  background-color: #fff1f0;
}

.test-input-area {
  flex: 1;
  padding: 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  resize: none;
  outline: none;
  transition: border-color 0.3s ease;
  min-height: 150px;
}

.test-input-area:focus {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.test-output-area {
  flex: 1;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background-color: #fafafa;
  padding: 0;
  overflow-y: auto;
  min-height: 150px;
}

.test-output-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #666666;
  font-size: 14px;
  gap: 12px;
}

.loading-spinner-small {
  width: 24px;
  height: 24px;
  border: 3px solid #f0f0f0;
  border-top-color: #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.btn-run-test {
  padding: 6px 16px;
  border: none;
  border-radius: 6px;
  background-color: #1890ff;
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
}

.btn-run-test:hover:not(:disabled) {
  background-color: #40a9ff;
}

.btn-run-test:disabled {
  background-color: #d9d9d9;
  color: #999999;
  cursor: not-allowed;
}

.test-result-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.test-result-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid #e8e8e8;
  background-color: #ffffff;
  flex-shrink: 0;
}

.test-result-status {
  padding: 6px 16px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 14px;
  color: #ffffff;
}

.test-result-status.status-accepted { background-color: #52c41a; }
.test-result-status.status-wrong-answer { background-color: #ff4d4f; }
.test-result-status.status-time-limit { background-color: #faad14; }
.test-result-status.status-memory-limit { background-color: #fa8c16; }
.test-result-status.status-runtime-error { background-color: #eb2f96; }
.test-result-status.status-system-error { background-color: #722ed1; }
.test-result-status.status-unknown { background-color: #8c8c8c; }

.test-result-info {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #666666;
  align-items: center;
}

.test-result-info .info-item {
  white-space: nowrap;
}

.test-output-content-wrapper {
  flex: 1;
  padding: 12px 16px;
  overflow-y: auto;
}

.test-output-content {
  margin: 0;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  color: #333333;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.test-output-placeholder {
  color: #999999;
  font-style: italic;
  font-size: 14px;
  text-align: center;
  padding: 20px 0;
}

@media (max-width: 768px) {
  .test-panel-content {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
</style>

