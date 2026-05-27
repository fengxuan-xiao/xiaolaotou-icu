# my-blog-frontend

基于 **Vue 3 + Vite + Element Plus** 构建的博客管理平台前端，集成了文章管理、数据可视化、消息队列、报表统计、权限控制和审核流程等功能模块。

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue 3 | ^3.5 | 前端框架（Composition API + `<script setup>`） |
| Vite | ^8.0 | 构建工具与开发服务器 |
| Vue Router | ^5.0 | 客户端路由 |
| Pinia | ^3.0 | 状态管理 |
| Element Plus | ^2.13 | UI 组件库 |
| Axios | ^1.15 | HTTP 客户端 |
| ECharts | ^6.0 | 数据可视化图表 |
| json-bigint | ^1.0 | 安全的大整数 JSON 解析 |

## 功能模块

### 博客模块
- 文章列表分页展示，支持附件下载
- 文章新增/删除，支持富文本编辑与多文件上传（图片、Word、Excel）
- Token 认证与角色鉴权

### 数据可视化
- ECharts 图表看板（柱状图、折线图、旋转柱状图、南丁格尔玫瑰图）
- 支持按省/市/区及日期范围筛选

### 统计报表
- 嵌入 JimuReport 报表工具，通过 iframe + Token 授权访问

### 消息队列
- RabbitMQ 社保数据消息管理：发送、重发、废弃
- RabbitMQ 税务数据消息管理：处理结果与原因记录

### 模糊查询
- Elasticsearch 模糊搜索界面

### 批量导入
- Excel 模板下载
- 文件上传批量导入，展示成功/失败明细

### 权限控制
- 用户角色分配（author / first_check / recheck / admin）
- 基于角色的菜单与功能权限控制

### 审核流程
- 文章二级审核机制：初审 → 复审
- 审核通过/驳回操作，支持审核历史追溯

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器（默认 http://localhost:5173）
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 环境变量

| 变量 | 开发环境 | 生产环境 | 说明 |
|------|----------|----------|------|
| `VITE_APP_BASE_API` | `http://localhost:8080` | `''` | 后端 API 地址，生产环境通过 Nginx 反向代理 |

## 目录结构

```
src/
├── main.js                 # 应用入口
├── App.vue                 # 根组件
├── Index.vue               # 应用外层（含备案信息）
├── router/index.js          # 路由配置
├── api/                    # API 接口层（axios 请求封装）
│   ├── blog.js             # 文章 CRUD
│   ├── user.js             # 登录/注册
│   ├── visualization.js    # 可视化数据
│   ├── rabbitmq.js         # 消息队列
│   ├── excelbatch.js       # 批量导入
│   ├── permission.js       # 权限管理
│   ├── auditProcess.js     # 审核流程
│   └── elasticsearch.js    # 模糊查询
├── stores/                 # Pinia 状态管理
│   ├── blog.js
│   ├── user.js
│   ├── visualization.js
│   ├── rabbitmq.js
│   ├── excelbatch.js
│   └── permission.js
├── views/                  # 页面组件
│   ├── Home.vue            # 首页（导航菜单）
│   ├── Login.vue           # 登录/注册
│   ├── Blog.vue            # 博客管理
│   ├── Visualization.vue   # 数据可视化
│   ├── Report.vue          # 统计报表
│   ├── Rabbitmq.vue        # 消息队列
│   ├── Elasticsearch.vue   # 模糊查询
│   ├── Excelbatch.vue      # 批量导入
│   ├── Permission.vue      # 权限控制
│   └── AuditProcess.vue    # 审核流程
└── utils/
    └── request.js          # Axios 实例（拦截器、Token 注入、错误处理）
```

## 认证流程

- 使用 JWT Token，存储在 Pinia / localStorage 中
- 请求拦截器自动注入 `Authorization: Bearer <token>` 头
- 401 响应自动清除 Token 并跳转登录页
- 路由守卫检查 `meta.requiresAuth`，未登录用户访问受保护页面时重定向至 `/login`

## 备案信息

赣公网安备 36073102000210 号 | 赣 ICP 备 2026008359 号
