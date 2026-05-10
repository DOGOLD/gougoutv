# GouGouTV 🎬

一个基于 Next.js 构建的影视点播网站，支持视频源解析和播放。

## 主要修复与改进

- 🐛 **封面显示修复** - 修复了电影封面无法正常显示的问题
- 🎨 **UI 优化** - 改进界面设计和用户体验
- 🐳 **Docker 支持** - 支持 ARM 架构设备部署
- 🔐 **管理员面板** - 内置管理员登录和管理功能

## 🚀 快速部署

### Docker 部署

```bash
docker run -d -p 3000:3000 \
  -e NEXT_PUBLIC_STORAGE_TYPE=localstorage \
  -e USERNAME=admin \
  -e PASSWORD=admin \
  -e NEXTAUTH_SECRET=your-secret-key \
  ghcr.io/dogold/gougoutv:latest
```

### docker-compose 部署

```yaml
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
    restart: unless-stopped
```

## 🔧 环境变量

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `NEXT_PUBLIC_STORAGE_TYPE` | localstorage | 存储类型 |
| `USERNAME` | admin | 管理员用户名 |
| `PASSWORD` | admin | 管理员密码 |
| `NEXTAUTH_SECRET` | - | 加密密钥（必填） |

## 🌐 访问地址

- **首页**: http://localhost:3000
- **管理面板**: http://localhost:3000/admin
- **默认账号**: `admin` / `admin`

## 🛠️ 技术栈

- Next.js 14 + TypeScript
- Tailwind CSS
- Docker

## 📝 许可证

MIT License

## 🙏 致谢

本项目基于 [KatelyaTV](https://github.com/katelya77/KatelyaTV) 二次开发，感谢原项目开源贡献。

---

⭐ 如果对你有帮助，请给个 Star！
