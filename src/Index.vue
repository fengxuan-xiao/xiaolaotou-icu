<template>
  <!-- 1. 外层容器：占满视口高度，使用 Flex 纵向布局 -->
  <div class="app-layout">
    
    <!-- 2. 内容区域：flex: 1 让它自动占据剩余空间 -->
    <main class="app-main">
      <router-view />
    </main>

    <!-- 3. 底部备案：固定在布局的最下方 -->
    <div class="beian-box">
      <a href="https://beian.mps.gov.cn/#/query/webSearch?code=36073102000210" rel="noreferrer" target="_blank">
        <!-- 注意：图片路径建议去掉 /public，直接写文件名，因为 public 目录下的文件在根路径访问 -->
        <img src="/备案图标.png" alt="公安备案">赣公网安备36073102000210号
      </a>
      <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener">
        赣ICP备2026008359号
      </a>
    </div>

    <!-- <div class="beian-box">
    <a href="https://beian.mps.gov.cn/#/query/webSearch?code=36073102000210" rel="noreferrer" target="_blank">
      <img src="/public/备案图标.png" alt="公安备案">赣公网安备36073102000210号
    </a>
    <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener">
        赣ICP备2026008359号
      </a>
  </div> -->
  </div>
</template>

<script setup>
// 必须留空脚本，否则 vite 报错
</script>

<style scoped>
/* 核心布局样式 */
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh; /* 关键：至少占满整个视口高度 */
}

.app-main {
  flex: 1; /* 关键：自动填充剩余空间，把 footer 挤到底部 */
  width: 100%;
}

.beian-box {
  text-align: center;
  padding: 20px 0; /* 适当调整内边距 */
  font-size: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  background-color: #fff;
  flex-shrink: 0; /* 防止被压缩 */
  border-top: 1px solid #eee; /* 可选：加个顶部边框区分 */
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