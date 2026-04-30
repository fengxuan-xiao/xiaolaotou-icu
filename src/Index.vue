<template>
  
  <!-- 路由出口：所有页面都从这里渲染 -->
  <router-view />

  <div class="beian-box">
    <a href="https://beian.mps.gov.cn/#/query/webSearch?code=36073102000210" rel="noreferrer" target="_blank">
      <img src="/public/备案图标.png" alt="公安备案">赣公网安备36073102000210号
    </a>
    <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener">
        赣ICP备2026008359号
      </a>
  </div>
</template>

<script setup>
// 必须留空脚本，否则 vite 报错
</script>

<style scoped>
.beian-box {
  text-align: center;
  padding: 50px 0 10px 0;
  font-size: 14px;
  /* 新增以下属性 */
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px; /* 这里调整数值来控制两个备案号之间的空格大小 */
  background-color: #fff; /* 建议添加背景色，避免透明导致视觉重叠 */
  flex-shrink: 0; /* 防止备案号被压缩 */
}
.beian-box img {
  height: 16px;
  vertical-align: middle;
  margin-right: 4px;
}
.beian-box a {
  color: #666;
  text-decoration: none;
}
</style>