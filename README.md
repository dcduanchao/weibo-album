# 微博相册抓取工具

一个基于 Vue3 + Element Plus 的微博相册抓取工具。

## 功能特性

- 🔍 输入用户UID抓取微博相册
- 📋 查看抓取记录列表
- 🖼️ 图片预览和放大查看
- 🎬 视频播放支持
- 📦 一键打包下载所有图片/视频

## 技术栈

- Vue 3.4
- Vue Router 4
- Element Plus 2.6
- Axios
- JSZip (打包下载)
- FileSaver (文件保存)

## 安装与运行

### 1. 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

项目将在 http://localhost:3000 启动

### 3. 构建生产版本

```bash
npm run build
```

## API 配置

项目默认代理配置指向 `http://192.168.90.161:8888`，如需修改请编辑 `vite.config.js`：

```javascript
server: {
  port: 3000,
  proxy: {
    '/weibo': {
      target: 'http://your-api-server:port',
      changeOrigin: true
    }
  }
}
```

## API 接口说明

### 1. 抓取相册
- **POST** `/weibo/album`
- **请求体**: `{ uid: "用户UID" }`
- **响应**: `{ code: 200, msg: "", data: null }`

### 2. 获取抓取记录
- **GET** `/weibo/records?page=1&page_size=10`
- **响应**: 包含用户ID、名称、头像等信息的列表

### 3. 获取相册列表
- **GET** `/weibo/album?uid=xxx&page=1&page_size=12`
- **响应**: 包含图片/视频URL的列表

## 项目结构

```
weibo-album/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.js
    ├── App.vue
    ├── api/
    │   └── index.js          # API请求封装
    ├── assets/
    │   └── style.css         # 全局样式
    ├── router/
    │   └── index.js          # 路由配置
    └── views/
        ├── FetchView.vue     # 抓取页面
        ├── RecordsView.vue   # 抓取记录页面
        └── AlbumView.vue     # 相册预览页面
```

## 使用说明

1. **抓取页面**: 输入微博用户UID，点击"确定抓取"按钮
2. **抓取记录**: 查看已抓取的用户列表，点击"查看相册"
3. **相册页面**: 
   - 浏览图片/视频网格
   - 点击图片放大预览
   - 使用左右箭头切换图片
   - 点击"打包下载"下载所有内容
