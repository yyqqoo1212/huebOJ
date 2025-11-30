<template>
  <div class="admin-page">
    <div class="page-header">
      <h1>题库管理</h1>
      <p class="page-subtitle">管理题目、难度、标签等</p>
    </div>
    <div class="page-content">
      <div class="coming-soon">
        <div class="coming-soon-icon">🚧</div>
        <h2>功能开发中</h2>
        <p>题库管理功能正在开发中，敬请期待！</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProblemManagement'
}
</script>

<style scoped>
.admin-page {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e8e8e8;
}

.page-header h1 {
  font-size: 24px;
  color: #333333;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 14px;
  color: #666666;
  margin: 0;
}

.page-content {
  min-height: 400px;
}

.coming-soon {
  text-align: center;
  padding: 60px 20px;
}

.coming-soon-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.coming-soon h2 {
  font-size: 20px;
  color: #333333;
  margin-bottom: 8px;
}

.coming-soon p {
  font-size: 14px;
  color: #666666;
}
</style>

