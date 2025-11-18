<template>
  <div class="submission-list">
    <div class="submission-list-container">
      <div class="page-header">
        <h1>提交记录</h1>
        <p class="subtitle">查看所有用户的提交记录</p>
      </div>

      <div class="submission-table">
        <div class="table-header">
          <div class="col-id">测评ID</div>
          <div class="col-problem">题目</div>
          <div class="col-status">状态</div>
          <div class="col-time">运行时间</div>
          <div class="col-memory">运行内存</div>
          <div class="col-length">代码长度</div>
          <div class="col-language">语言</div>
          <div class="col-user">提交用户</div>
          <div class="col-submit-time">提交时间</div>
        </div>

        <div v-if="submissions.length > 0">
          <div 
            v-for="submission in submissions" 
            :key="submission.id"
            class="table-row"
          >
            <div class="col-id">
              <span class="id-link" @click="viewSubmission(submission.id)">
                {{ submission.id }}
              </span>
            </div>
            <div class="col-problem">
              <span class="problem-link" @click="goToProblem(submission.problemId)">
                {{ submission.problemTitle }}
              </span>
            </div>
            <div class="col-status">
              <span :class="['status-badge', `status-${submission.status.toLowerCase()}`]">
                {{ submission.status }}
              </span>
            </div>
            <div class="col-time">{{ submission.runtime }}ms</div>
            <div class="col-memory">{{ submission.memory }}KB</div>
            <div class="col-length">{{ submission.codeLength }}B</div>
            <div class="col-language">{{ submission.language }}</div>
            <div class="col-user">
              <span class="user-link" @click="goToUser(submission.userId)">
                {{ submission.username }}
              </span>
            </div>
            <div class="col-submit-time">{{ formatDateTime(submission.submitTime) }}</div>
          </div>
        </div>
        <div v-else class="empty-state">
          <p class="empty-text">暂无提交记录</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SubmissionList',
  data() {
    return {
      submissions: [
        {
          id: 'S001',
          problemId: 1001,
          problemTitle: '两数之和',
          status: 'Accepted',
          runtime: 12,
          memory: 8.5,
          codeLength: 256,
          language: 'C++',
          userId: 'U001',
          username: '算法大师',
          submitTime: '2024-03-20T10:30:00'
        },
        {
          id: 'S002',
          problemId: 1002,
          problemTitle: '两数相加',
          status: 'Accepted',
          runtime: 18,
          memory: 9.2,
          codeLength: 312,
          language: 'Java',
          userId: 'U002',
          username: '代码狂人',
          submitTime: '2024-03-20T09:15:00'
        },
        {
          id: 'S003',
          problemId: 1003,
          problemTitle: '无重复字符的最长子串',
          status: 'Accepted',
          runtime: 25,
          memory: 10.8,
          codeLength: 445,
          language: 'Python',
          userId: 'U003',
          username: '数据结构专家',
          submitTime: '2024-03-20T08:45:00'
        },
        {
          id: 'S004',
          problemId: 1001,
          problemTitle: '两数之和',
          status: 'Accepted',
          runtime: 15,
          memory: 8.0,
          codeLength: 278,
          language: 'C++',
          userId: 'U004',
          username: '编程新星',
          submitTime: '2024-03-20T07:20:00'
        },
        {
          id: 'S005',
          problemId: 1004,
          problemTitle: '寻找两个正序数组的中位数',
          status: 'Accepted',
          runtime: 32,
          memory: 12.5,
          codeLength: 512,
          language: 'C++',
          userId: 'U001',
          username: '算法大师',
          submitTime: '2024-03-19T16:30:00'
        },
        {
          id: 'S006',
          problemId: 1005,
          problemTitle: '最长回文子串',
          status: 'Accepted',
          runtime: 28,
          memory: 11.2,
          codeLength: 389,
          language: 'Java',
          userId: 'U002',
          username: '代码狂人',
          submitTime: '2024-03-19T14:15:00'
        },
        {
          id: 'S007',
          problemId: 1006,
          problemTitle: 'Z字形变换',
          status: 'Accepted',
          runtime: 22,
          memory: 9.8,
          codeLength: 356,
          language: 'Python',
          userId: 'U005',
          username: '算法爱好者',
          submitTime: '2024-03-19T12:00:00'
        },
        {
          id: 'S008',
          problemId: 1007,
          problemTitle: '整数反转',
          status: 'Accepted',
          runtime: 8,
          memory: 7.5,
          codeLength: 198,
          language: 'C++',
          userId: 'U006',
          username: '代码猎人',
          submitTime: '2024-03-19T10:30:00'
        },
        {
          id: 'S009',
          problemId: 1008,
          problemTitle: '字符串转换整数',
          status: 'Accepted',
          runtime: 35,
          memory: 13.2,
          codeLength: 567,
          language: 'Java',
          userId: 'U003',
          username: '数据结构专家',
          submitTime: '2024-03-18T18:45:00'
        },
        {
          id: 'S010',
          problemId: 1009,
          problemTitle: '回文数',
          status: 'Accepted',
          runtime: 10,
          memory: 7.8,
          codeLength: 234,
          language: 'Python',
          userId: 'U007',
          username: '编程达人',
          submitTime: '2024-03-18T15:20:00'
        },
        {
          id: 'S011',
          problemId: 1010,
          problemTitle: '正则表达式匹配',
          status: 'Accepted',
          runtime: 45,
          memory: 15.6,
          codeLength: 678,
          language: 'C++',
          userId: 'U001',
          username: '算法大师',
          submitTime: '2024-03-18T13:10:00'
        },
        {
          id: 'S012',
          problemId: 1002,
          problemTitle: '两数相加',
          status: 'Accepted',
          runtime: 20,
          memory: 9.5,
          codeLength: 298,
          language: 'Java',
          userId: 'U008',
          username: '算法新手',
          submitTime: '2024-03-17T20:30:00'
        },
        {
          id: 'S013',
          problemId: 1003,
          problemTitle: '无重复字符的最长子串',
          status: 'Accepted',
          runtime: 30,
          memory: 11.0,
          codeLength: 412,
          language: 'Python',
          userId: 'U004',
          username: '编程新星',
          submitTime: '2024-03-17T17:45:00'
        },
        {
          id: 'S014',
          problemId: 1004,
          problemTitle: '寻找两个正序数组的中位数',
          status: 'Accepted',
          runtime: 38,
          memory: 12.8,
          codeLength: 534,
          language: 'C++',
          userId: 'U009',
          username: '代码新手',
          submitTime: '2024-03-17T14:20:00'
        },
        {
          id: 'S015',
          problemId: 1005,
          problemTitle: '最长回文子串',
          status: 'Accepted',
          runtime: 26,
          memory: 10.5,
          codeLength: 367,
          language: 'Java',
          userId: 'U010',
          username: '学习中的小白',
          submitTime: '2024-03-16T19:00:00'
        }
      ]
    }
  },
  methods: {
    viewSubmission(id) {
      // 后续实现：查看提交的代码和通过样例详情
      console.log('查看提交记录:', id)
    },
    goToProblem(problemId) {
      // 后续实现：跳转到指定题目
      console.log('跳转到题目:', problemId)
    },
    goToUser(userId) {
      // 后续实现：跳转到指定用户主页
      console.log('跳转到用户主页:', userId)
    },
    formatDateTime(dateString) {
      const date = new Date(dateString)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}`
    }
  }
}
</script>

<style scoped>
.submission-list {
  min-height: calc(100vh - 60px);
  background-color: #f5f5f5;
  padding: 40px 20px;
}

.submission-list-container {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h1 {
  font-size: 32px;
  color: #333333;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 16px;
  color: #666666;
}

.submission-table {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 100px 1fr 120px 120px 120px 120px 100px 120px 180px;
  gap: 20px;
  padding: 16px 24px;
  background-color: #fafafa;
  border-bottom: 2px solid #e8e8e8;
  font-weight: 600;
  font-size: 14px;
  color: #666666;
}

.table-row {
  display: grid;
  grid-template-columns: 100px 1fr 120px 120px 120px 120px 100px 120px 180px;
  gap: 20px;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.2s ease;
}

.table-row:hover {
  background-color: #f8f9fa;
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.table-row:last-child {
  border-bottom: none;
}

.col-id {
  display: flex;
  align-items: center;
}

.id-link {
  color: #1890ff;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.id-link:hover {
  color: #40a9ff;
  text-decoration: underline;
}

.col-problem {
  display: flex;
  align-items: center;
}

.problem-link {
  color: #333333;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.problem-link:hover {
  color: #1890ff;
  text-decoration: underline;
}

.col-status {
  display: flex;
  align-items: center;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.status-accepted {
  background-color: #f6ffed;
  color: #52c41a;
}

.col-time {
  display: flex;
  align-items: center;
  color: #666666;
  font-size: 14px;
}

.col-memory {
  display: flex;
  align-items: center;
  color: #666666;
  font-size: 14px;
}

.col-length {
  display: flex;
  align-items: center;
  color: #666666;
  font-size: 14px;
}

.col-language {
  display: flex;
  align-items: center;
  color: #666666;
  font-size: 14px;
}

.col-user {
  display: flex;
  align-items: center;
}

.user-link {
  color: #1890ff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.user-link:hover {
  color: #40a9ff;
  text-decoration: underline;
}

.col-submit-time {
  display: flex;
  align-items: center;
  color: #666666;
  font-size: 14px;
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
}

.empty-text {
  font-size: 18px;
  color: #666666;
}

@media (max-width: 1400px) {
  .table-header,
  .table-row {
    grid-template-columns: 90px 1fr 110px 110px 110px 110px 90px 110px 160px;
    gap: 15px;
    padding: 16px 20px;
  }
}

@media (max-width: 1200px) {
  .table-header,
  .table-row {
    grid-template-columns: 80px 1fr 100px 100px 100px 100px 80px 100px 150px;
    gap: 12px;
    padding: 14px 16px;
  }
}

@media (max-width: 768px) {
  .submission-table {
    overflow-x: auto;
  }

  .table-header,
  .table-row {
    min-width: 1400px;
  }
}
</style>
