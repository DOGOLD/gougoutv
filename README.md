# GouGouTV 🎬

一个现代化的影视点播网站前端项目，基于 Next.js 构建，支持多种视频源解析和播放。

## ✨ 特性

- 🌙 **日间/夜间模式** - 支持主题切换
- 🔍 **智能搜索** - 支持多源视频搜索
- 📱 **响应式设计** - 完美适配移动端和桌面端
- 🐳 **Docker 支持** - 一键部署，支持 ARM 架构
- 🔐 **管理员面板** - 支持视频源配置管理

## 🚀 快速开始

### 方式一：Docker 部署（推荐）

```bash
# 创建 docker-compose.yml
version: '3.8'

services:
  gougoutv:
    image: ghcr.io/dogold/gougoutv:latest
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_STORAGE_TYPE: localstorage
      USERNAME: admin
      PASSWORD: admin
      NEXTAUTH_SECRET: your-secret-key
      NEXTAUTH_URL: http://localhost:3000
    restart: unless-stopped
```

```bash
# 启动容器
docker-compose up -d
```

### 方式二：本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm run dev
```

## 🔧 环境变量配置

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `NEXT_PUBLIC_STORAGE_TYPE` | localstorage | 存储类型：`localstorage`, `redis`, `kvrocks` |
| `USERNAME` | admin | 管理员用户名 |
| `PASSWORD` | admin | 管理员密码 |
| `NEXTAUTH_SECRET` | - | 必须设置，用于加密 session |
| `NEXTAUTH_URL` | http://localhost:3000 | 站点 URL |
| `SITE_NAME` | GouGouTV | 站点名称 |

## 🌐 访问地址

- **首页**: http://localhost:3000
- **管理面板**: http://localhost:3000/admin
- **默认账号**: `admin` / `admin`

## 📁 项目结构

```
.
├── src/
│   ├── app/          # Next.js 应用目录
│   ├── components/   # React 组件
│   └── lib/          # 工具函数和配置
├── docker-compose.*.yml  # Docker 配置文件
├── Dockerfile        # Docker 构建文件
└── package.json      # 项目依赖
```

## 🛠️ 技术栈

- **框架**: Next.js 14
- **语言**: TypeScript
- **样式**: Tailwind CSS 3
- **数据库**: Redis / Kvrocks / LocalStorage
- **容器**: Docker

## 📝 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 🙏 致谢

**GouGouTV** 是在 [KatelyaTV](https://github.com/katelya77/KatelyaTV) 项目基础上进行二次开发的项目。

感谢 KatelyaTV 原作者的开源贡献，为本项目提供了良好的架构和设计灵感。

---

⭐ 如果你喜欢这个项目，请给个 Star！
