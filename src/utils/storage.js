import { STORAGE_KEYS } from './constants'

const safeJSONParse = (value) => {
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

export const tokenStorage = {
  save({ token, tokenType, expiresIn }) {
    const expiresAt = expiresIn
      ? Date.now() + Number(expiresIn) * 1000
      : Date.now()

    localStorage.setItem(STORAGE_KEYS.TOKEN, token || '')
    localStorage.setItem(STORAGE_KEYS.TOKEN_TYPE, tokenType || 'Bearer')
    localStorage.setItem(STORAGE_KEYS.EXPIRES_AT, String(expiresAt))
  },
  load() {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN)
    const tokenType = localStorage.getItem(STORAGE_KEYS.TOKEN_TYPE)
    const expiresAt = Number(localStorage.getItem(STORAGE_KEYS.EXPIRES_AT))

    return {
      token: token || '',
      tokenType: tokenType || 'Bearer',
      expiresAt: Number.isFinite(expiresAt) ? expiresAt : 0
    }
  },
  clear() {
    localStorage.removeItem(STORAGE_KEYS.TOKEN)
    localStorage.removeItem(STORAGE_KEYS.TOKEN_TYPE)
    localStorage.removeItem(STORAGE_KEYS.EXPIRES_AT)
  }
}

export const userStorage = {
  save(user) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user || {}))
  },
  load() {
    return safeJSONParse(localStorage.getItem(STORAGE_KEYS.USER)) || null
  },
  clear() {
    localStorage.removeItem(STORAGE_KEYS.USER)
  }
}
