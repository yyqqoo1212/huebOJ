import { STORAGE_KEYS } from '../utils/constants'

/**
 * 路由守卫函数
 * 检查用户认证和管理员权限
 */
export function setupRouterGuards(router) {
  router.beforeEach((to, from, next) => {
    // 检查是否需要认证
    if (to.meta.requiresAuth) {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN)
      if (!token) {
        next('/login')
        return
      }
    }

    // 检查是否需要管理员权限
    if (to.meta.requiresAdmin) {
      const userStr = localStorage.getItem(STORAGE_KEYS.USER)
      if (userStr) {
        try {
          const user = JSON.parse(userStr)
          // 支持数字和字符串类型的 permission
          const permission = user.permission
          const isAdmin = permission === 2 || permission === '2' || Number(permission) === 2
          
          if (!isAdmin) {
            // 不是管理员，重定向到首页
            console.warn('权限不足，需要管理员权限。当前 permission:', permission)
            next('/')
            return
          }
        } catch (e) {
          console.error('解析用户信息失败:', e)
          next('/')
          return
        }
      } else {
        console.warn('未找到用户信息，重定向到登录页')
        next('/login')
        return
      }
    }

    next()
  })
}

