import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import ProblemList from '../views/problem/ProblemList.vue'
import CourseList from '../views/course/CourseList.vue'
import ContestList from '../views/contest/ContestList.vue'
import RankingList from '../views/rank/RankingList.vue'
import SubmissionList from '../views/submission/SubmissionList.vue'
import DiscussionList from '../views/disscussion/DiscussionList.vue'

import Register from '../views/auth/Register.vue'
import Login from '../views/auth/Login.vue'
import Settings from '../views/user/Settings.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: { requiresAuth: true }
  },
  {
    path: '/problems',
    name: 'ProblemList',
    component: ProblemList
  },
  {
    path: '/courses',
    name: 'CourseList',
    component: CourseList
  },
  {
    path: '/contests',
    name: 'ContestList',
    component: ContestList
  },
  {
    path: '/ranking',
    name: 'RankingList',
    component: RankingList
  },
  {
    path: '/submissions',
    name: 'SubmissionList',
    component: SubmissionList
  },
  {
    path: '/discussions',
    name: 'DiscussionList',
    component: DiscussionList
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
