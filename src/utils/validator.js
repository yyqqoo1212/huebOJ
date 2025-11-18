import { USERNAME_RULE, PASSWORD_RULE } from './constants'

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/

export const validateUsername = (value) => {
  if (!value) {
    return '用户名不能为空'
  }
  if (value.length < USERNAME_RULE.min || value.length > USERNAME_RULE.max) {
    return `用户名长度需在 ${USERNAME_RULE.min}-${USERNAME_RULE.max} 个字符之间`
  }
  return ''
}

export const validatePassword = (value) => {
  if (!value) {
    return '密码不能为空'
  }
  if (value.length < PASSWORD_RULE.min) {
    return `密码长度至少为 ${PASSWORD_RULE.min} 个字符`
  }
  return ''
}

export const validateEmail = (value) => {
  if (!value) {
    return '邮箱不能为空'
  }
  if (!EMAIL_REGEX.test(value)) {
    return '请输入正确的邮箱格式'
  }
  return ''
}

export const validateRegisterForm = ({ username, password, email }) => {
  const errors = {
    username: validateUsername(username),
    password: validatePassword(password),
    email: validateEmail(email)
  }

  const firstError = Object.values(errors).find((msg) => !!msg)
  return {
    errors,
    isValid: !firstError,
    message: firstError || ''
  }
}

export const validateLoginForm = ({ username, password }) => {
  const errors = {
    username: validateUsername(username),
    password: validatePassword(password)
  }

  const firstError = Object.values(errors).find((msg) => !!msg)
  return {
    errors,
    isValid: !firstError,
    message: firstError || ''
  }
}
