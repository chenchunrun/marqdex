# Markdown智能协同工作系统

一个功能完整的实时协作Markdown编辑系统，集成AI功能、模板管理和团队协作特性。

## 🎯 项目状态：约 75% 完成

### ✅ 已完成功能

#### 后端架构 (100%)
- ✅ 完整的Prisma数据库架构（13个模型）
- ✅ NextAuth.js v5 认证系统
- ✅ 基于角色的访问控制（RBAC）
- ✅ 9个完整的API模块（认证、团队、项目、模板、文件、版本、评论、AI、实时协作）
- ✅ 内置4种中文模板（问题定义、方案设计、执行跟踪、复盘总结）

#### 前端界面 (75%)
- ✅ 用户认证页面（登录/注册）
- ✅ 仪表板（含统计数据和快速操作）
- ✅ 团队管理（列表+创建）
- ✅ 项目管理（列表+创建）
- ✅ 模板中心（浏览+复制）
- ✅ 文件管理（列表+搜索）
- ✅ Markdown编辑器（实时预览+工具栏+自动保存）

#### 集成功能
- ✅ Liveblocks实时协作基础
- ✅ OpenAI兼容AI客户端
- ✅ 版本控制系统
- ✅ 评论系统（API完成）

---

## 🚀 快速开始

### 前置要求

1. **Node.js** 18+
2. **PostgreSQL数据库**（推荐使用Neon免费版）
3. **Liveblocks账户**（用于实时协作）
4. **OpenAI API密钥**（可选，用于AI功能）

### 安装步骤

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入您的配置

# 3. 生成Prisma客户端
npm run db:generate

# 4. 运行数据库迁移
npm run db:migrate

# 5. 导入内置模板
npm run db:seed

# 6. 启动开发服务器
npm run dev
```

访问 http://localhost:3000

---

## 📝 环境变量配置

```env
# 数据库（从 https://console.neon.tech/ 获取）
DATABASE_URL="postgresql://user:password@host/database?schema=public"

# NextAuth（生成密钥：openssl rand -base64 32）
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Liveblocks（从 https://liveblocks.io/dashboard 获取）
LIVEBLOCKS_SECRET="sk_liveblocks_your_secret_key_here"
LIVEBLOCKS_PUBLIC_KEY="pk_liveblocks_your_public_key_here"

# 加密密钥（32字符）
ENCRYPTION_KEY="your-32-character-encryption-key-here"

# 应用环境
NODE_ENV="development"
```

---

## 🛠️ 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 框架 | Next.js 14+ | App Router, SSR/SSG |
| 语言 | TypeScript | 类型安全 |
| 数据库 | PostgreSQL (Neon) | Serverless数据库 |
| ORM | Prisma | 类型安全的数据库访问 |
| 认证 | NextAuth.js v5 | JWT会话管理 |
| 实时协作 | Liveblocks | 多人同步编辑 |
| 样式 | Tailwind CSS | 实用优先的CSS框架 |
| AI | OpenAI API | 内容生成辅助 |
| 部署 | Vercel | 一键部署 |

---

## 📚 项目结构

```
markdown-collab/
├── app/                    # Next.js应用目录
│   ├── (auth)/            # 认证页面（登录、注册）
│   ├── api/               # API路由（9个模块）
│   ├── dashboard/         # 仪表板
│   ├── teams/             # 团队管理
│   ├── projects/          # 项目管理
│   ├── templates/         # 模板中心
│   ├── files/             # 文件管理
│   └── editor/            # Markdown编辑器
├── components/            # React组件
│   ├── auth/              # 认证组件
│   ├── dashboard/         # 仪表板组件
│   ├── team/              # 团队组件
│   ├── project/           # 项目组件
│   ├── editor/            # 编辑器组件
│   └── ui/                # 通用UI组件
├── lib/                   # 工具库
│   ├── auth/              # 认证逻辑
│   ├── ai/                # AI集成
│   ├── liveblocks/        # 实时协作配置
│   ├── utils/             # 工具函数
│   └── db.ts              # 数据库客户端
├── prisma/                # Prisma配置
│   ├── schema.prisma      # 数据库架构
│   └── seed.ts            # 内置模板种子数据
└── public/                # 静态资源
```

---

## 🎯 核心功能

### 1. 用户认证
- 邮箱密码注册/登录
- JWT会话管理
- 安全的密码加密（bcryptjs）

### 2. 团队协作
- 创建/管理团队
- 添加团队成员
- 基于角色的权限控制（管理员/成员）

### 3. 项目管理
- 创建/管理项目
- 项目成员管理
- 项目文件组织

### 4. 模板系统
- 4种内置中文模板
  - 🎯 问题定义
  - 💡 方案设计
  - 📊 执行跟踪
  - 📝 复盘总结
- 自定义模板支持
- 一键复制使用

### 5. 文件编辑
- 实时Markdown编辑
- 分屏预览
- 工具栏快捷操作
- 自动保存（30秒）
- 导出为.md/.pdf

### 6. AI集成
- OpenAI兼容API
- 模板专属AI提示
- 一键内容生成

### 7. 版本控制
- 完整的版本历史
- 版本对比
- 一键回滚

### 8. 评论与通知
- 文件评论（API完成）
- @提及功能（API完成）
- 实时通知系统

---

## 📖 使用指南

### 快速上手流程

1. **注册账户**
   ```
   访问首页 → 点击"Create Account" → 填写信息 → 完成注册
   ```

2. **创建团队**
   ```
   进入仪表板 → 点击"Create Team" → 输入团队信息 → 创建
   ```

3. **创建项目**
   ```
   进入"Teams" → 选择团队 → 点击"Create Project" → 输入项目信息
   ```

4. **创建文件**
   ```
   方式1: 进入"Templates" → 选择模板 → 复制内容
   方式2: 在项目中直接创建空白文件
   ```

5. **编辑协作**
   ```
   进入"Files" → 选择文件 → 使用工具栏编辑 → 实时预览 → 自动保存
   ```

---

## 📋 API端点

### 认证
```
POST /api/auth/register    # 用户注册
POST /api/auth/signin      # 用户登录
GET  /api/auth/session     # 获取会话
POST /api/auth/signout     # 用户登出
```

### 团队
```
GET    /api/teams          # 获取团队列表
POST   /api/teams          # 创建团队
GET    /api/teams/:id      # 获取团队详情
PATCH  /api/teams/:id      # 更新团队
DELETE /api/teams/:id      # 删除团队
```

### 项目
```
GET    /api/projects       # 获取项目列表
POST   /api/projects       # 创建项目
GET    /api/projects/:id   # 获取项目详情
PATCH  /api/projects/:id   # 更新项目
DELETE /api/projects/:id   # 删除项目
```

### 文件
```
GET    /api/files          # 获取文件列表
POST   /api/files          # 创建文件
GET    /api/files/:id      # 获取文件详情
PATCH  /api/files/:id      # 更新文件
DELETE /api/files/:id      # 删除文件
```

### 模板
```
GET    /api/templates      # 获取模板列表
POST   /api/templates      # 创建自定义模板
GET    /api/templates/:id  # 获取模板详情
```

### AI
```
POST   /api/ai/generate    # AI生成内容
```

---

## 🔧 开发指南

### 可用的NPM脚本

```bash
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run start        # 启动生产服务器
npm run lint         # 代码检查
npm run db:generate  # 生成Prisma客户端
npm run db:migrate   # 运行数据库迁移
npm run db:seed      # 导入种子数据
```

### 数据库架构

项目使用以下主要模型：
- User, Account, Session - 用户认证
- Team, TeamMember - 团队管理
- Project, ProjectMember - 项目管理
- File, FileVersion - 文件和版本
- Comment, Mention - 评论和提及
- Template - 模板系统
- Notification - 通知系统
- ActivityLog - 活动日志

完整架构请查看 `prisma/schema.prisma`

---

## 🚧 剩余工作

### 高优先级（18-25小时）
1. **实时协作完整实现** - Liveblocks房间完整集成
2. **文件创建UI** - 从模板创建流程
3. **设置页面** - API密钥管理界面
4. **评论UI** - 评论面板和@提及
5. **通知UI** - 通知中心

### 中优先级（8-12小时）
6. **版本历史UI** - 版本列表和对比
7. **导出优化** - PDF美化
8. **搜索增强** - 全文搜索

### 低优先级（6-8小时）
9. **移动端适配** - 响应式优化
10. **性能优化** - 缓存和懒加载

详细内容请查看：
- [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - 项目完成总结
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - 部署指南
- [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) - 实施状态

---

## 🤝 贡献

欢迎提交Issue和Pull Request！

---

## 📄 许可证

MIT License

---

**项目状态**: ✅ 基础功能完整，可进入测试阶段
**最后更新**: 2026-01-28
**版本**: 0.1.0-beta

---

## 📞 支持

如有问题，请查阅项目文档或查看代码注释。
