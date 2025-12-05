import http from '@/utils/request'

/**
 * 获取题目列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码（默认1）
 * @param {number} params.page_size - 每页数量（默认20）
 * @param {string} params.search - 搜索关键词（题号或标题）
 * @param {number} params.level - 难度筛选（1=简单, 2=中等, 3=困难）
 * @param {number} params.auth - 权限筛选（1=公开, 2=私密, 3=比赛）
 * @returns {Promise}
 */
export const getProblemList = (params = {}) => {
  return http.get('/problems/list', { params })
}

/**
 * 获取题目详情
 * @param {number} problemId - 题目ID
 * @param {Object} params - 查询参数（可选，如 allow_all=true 用于管理员获取所有题目）
 * @returns {Promise}
 */
export const getProblemDetail = (problemId, params = {}) => {
  return http.get(`/problems/${problemId}`, { params })
}

/**
 * 创建题目
 * @param {Object} data - 题目数据
 * @returns {Promise}
 */
export const createProblem = (data) => {
  return http.post('/problems/create', data)
}

/**
 * 更新题目
 * @param {number} problemId - 题目ID
 * @param {Object} data - 题目数据
 * @returns {Promise}
 */
export const updateProblem = (problemId, data) => {
  return http.put(`/problems/${problemId}/update`, data)
}

/**
 * 上传压缩包并解压验证
 * @param {FormData} formData - 包含压缩包文件的 FormData
 * @param {Function} onProgress - 进度回调函数
 * @returns {Promise}
 */
export const uploadZipFile = (formData, onProgress) => {
  return http.post('/problems/upload-zip', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: onProgress
  })
}

/**
 * 上传手动输入的测试用例文件
 * @param {number} problemId - 题目ID
 * @param {Array} files - 文件数组，每个元素包含 {name, content}
 * @returns {Promise}
 */
export const uploadTestcaseFiles = (problemId, files) => {
  return http.post(`/problems/${problemId}/upload-testcases`, { files })
}

/**
 * 上传解压后的测试用例文件
 * @param {number} problemId - 题目ID
 * @param {string} token - 解压验证返回的 token
 * @returns {Promise}
 */
export const uploadExtractedTestcases = (problemId, token) => {
  return http.post(`/problems/${problemId}/upload-extracted-testcases`, { token })
}

/**
 * 清空题目测评数据
 * @param {number} problemId - 题目ID
 * @returns {Promise}
 */
export const clearProblemTestcases = (problemId) => {
  return http.delete(`/problems/${problemId}/testcases/clear`)
}

/**
 * 删除题目
 * @param {number} problemId - 题目ID
 * @returns {Promise}
 */
export const deleteProblem = (problemId) => {
  return http.delete(`/problems/${problemId}/delete`)
}

