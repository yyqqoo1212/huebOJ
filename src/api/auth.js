import http from '@/utils/request'

export const register = (payload) =>
  http.post('/users/register', {
    username: payload.username,
    password: payload.password,
    email: payload.email,
    motto: payload.motto || '',
    avatar_url: payload.avatarUrl || ''
  })

export const login = (payload) =>
  http.post('/users/login', {
    username: payload.username,
    password: payload.password
  })

export const fetchProfile = () => http.get('/users/me')
