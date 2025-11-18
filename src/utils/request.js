import axios from 'axios'
import { API_BASE_URL, API_ERROR_MESSAGES, DEFAULT_ERROR_MESSAGE } from './constants'
import { tokenStorage, userStorage } from './storage'

const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

const getAuthHeader = () => {
  const { token, tokenType, expiresAt } = tokenStorage.load()
  if (!token) return ''
  if (expiresAt && Date.now() > expiresAt) {
    tokenStorage.clear()
    userStorage.clear()
    return ''
  }
  return `${tokenType || 'Bearer'} ${token}`
}

http.interceptors.request.use(
  (config) => {
    const auth = getAuthHeader()
    if (auth) {
      config.headers.Authorization = auth
    }
    return config
  },
  (error) => Promise.reject(error)
)

const normalizeError = (error) => {
  if (error.response) {
    const { data, status } = error.response
    const code = data?.code || 'invalid_request'
    const message =
      data?.message || API_ERROR_MESSAGES[code] || DEFAULT_ERROR_MESSAGE
    return Promise.reject({
      code,
      message,
      status,
      details: data
    })
  }
  if (error.request) {
    return Promise.reject({
      code: 'network_error',
      message: '网络请求失败，请检查网络后重试。',
      status: 0
    })
  }
  return Promise.reject({
    code: 'unknown_error',
    message: error.message || DEFAULT_ERROR_MESSAGE,
    status: 0
  })
}

http.interceptors.response.use(
  (response) => response.data,
  (error) => normalizeError(error)
)

export default http
