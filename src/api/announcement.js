import http from '@/utils/request'

// 公告列表（公开）
export const getAnnouncementList = (params = {}) =>
  http.get('/announcements/list', { params })

// 管理员接口：创建公告
export const createAnnouncement = (payload = {}) =>
  http.post('/announcements/create', {
    title: payload.title,
    content: payload.content,
    is_important: !!payload.is_important
  })

// 管理员接口：更新公告
export const updateAnnouncement = (announcementId, payload = {}) =>
  http.patch(`/announcements/${announcementId}/update`, {
    title: payload.title,
    content: payload.content,
    is_important: payload.is_important !== undefined ? !!payload.is_important : undefined
  })

// 管理员接口：删除公告
export const deleteAnnouncement = (announcementId) =>
  http.delete(`/announcements/${announcementId}/delete`)

