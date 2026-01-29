# 邮件功能使用指南

## 前端邮件相关功能

### 1. 邮箱验证 (Email Verification)
**位置**: 设置页面 → 邮箱验证

**功能**:
- 显示当前邮箱的验证状态
- 发送验证邮件
- 验证链接有效期24小时

**使用场景**:
- 新用户注册后自动发送验证邮件
- 用户可在设置页面重新发送验证邮件

### 2. 邮件偏好设置 (Email Preferences)
**位置**: 设置页面 → 邮件偏好设置

**功能**:
- 全局开关：启用/禁用所有邮件通知
- 分类开关：选择接收哪些类型的邮件
  - 💬 @Mentions - 当有人在评论中@提及你
  - 👥 Team Invitations - 当有人添加你到团队
  - 📁 Project Invitations - 当有人添加你到项目
  - 📄 File Updates - 当文件被更新
  - ⚙️ Project Updates - 当项目信息变更

**使用场景**:
- 用户可以选择只接收重要通知
- 避免邮件过多打扰
- 根据工作习惯自定义通知频率

## 邮件发送流程

### 1. 团队邀请邮件
**触发**: 添加成员到团队时
**接收者**: 被添加的成员
**内容**:
- 邀请人信息
- 团队名称
- 团队链接按钮

### 2. 项目邀请邮件
**触发**: 添加成员到项目时
**接收者**: 被添加的成员
**内容**:
- 邀请人信息
- 项目名称
- 团队名称
- 项目链接按钮

### 3. @提及邮件
**触发**: 在评论中使用@username时
**接收者**: 被@提及的用户
**内容**:
- 提及者信息
- 文件名称
- 项目名称
- 评论内容预览
- 文件编辑器链接

### 4. 文件更新邮件
**触发**: 文件被修改时
**接收者**: 项目其他成员
**内容**:
- 更新者信息
- 文件名称
- 项目名称
- 文件编辑器链接

### 5. 项目更新邮件
**触发**: 项目信息被修改时
**接收者**: 项目其他成员
**内容**:
- 更新者信息
- 项目名称
- 项目详情页链接

## 配置说明

### 开发环境配置

#### 方式1: 不配置SMTP（推荐用于开发）
如果不配置SMTP环境变量，邮件会输出到控制台：

```bash
# .env
# 不配置 SMTP_* 变量
```

**输出示例**:
```
[Email Service] SMTP not configured. Email would be sent:
To: user@example.com
Subject: You've been added to Team Name
HTML: <!DOCTYPE html>...
```

#### 方式2: 配置真实SMTP（用于测试）
```bash
# .env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="MarqDex <your-email@gmail.com>"
```

### 生产环境配置

#### 推荐邮件服务
1. **SendGrid** - 可靠性强，免费100封/天
2. **Amazon SES** - 成本低，适合大量发送
3. **Mailgun** - 开发者友好
4. **Postmark** - 到达率高

#### SendGrid 配置示例
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=YOUR_SENDGRID_API_KEY
SMTP_FROM="MarqDex <noreply@yourdomain.com>"
```

## 邮件模板

所有邮件模板位于 `lib/email/templates.ts`：

### baseTemplate
基础模板，包含：
- 统一的页眉和页脚
- 响应式CSS样式
- 品牌化元素

### 专业模板
1. **teamInvitationTemplate** - 团队邀请
2. **projectInvitationTemplate** - 项目邀请
3. **mentionNotificationTemplate** - @提及通知
4. **fileUpdateTemplate** - 文件更新通知
5. **projectUpdateTemplate** - 项目更新通知

### 自定义模板
如需修改邮件样式，编辑 `lib/email/templates.ts` 中的CSS部分。

## 故障排查

### 问题1: 没有收到邮件
**检查清单**:
- [ ] 查看控制台日志（开发环境）
- [ ] 检查SMTP配置是否正确
- [ ] 验证SMTP凭据是否有效
- [ ] 查看垃圾邮件文件夹
- [ ] 确认邮件服务未达到发送限制

### 问题2: Gmail 认证失败
**解决方案**:
1. 启用两步验证
2. 生成应用专用密码
3. 使用应用专用密码而非账户密码

### 问题3: 邮件进入垃圾箱
**解决方案**:
1. 配置SPF记录
2. 配置DKIM签名
3. 使用专业的邮件服务
4. 避免使用被标记的词汇

### 问题4: 发送频率限制
各服务商限制：
- Gmail: 500封/天
- SendGrid: 根据套餐
- Amazon SES: 起始1封/秒，可申请提高

## 最佳实践

### 开发环境
- 使用控制台日志模式
- 测试各种邮件场景
- 验证邮件内容准确

### 生产环境
- 使用专业邮件服务
- 监控邮件发送成功率
- 设置退订链接（未来功能）
- 遵守反垃圾邮件法律

### 安全建议
- 永远不在代码中硬编码SMTP凭据
- 使用环境变量存储敏感信息
- 定期更换SMTP密码
- 监控异常发送行为

## 未来增强

### 计划功能
- [ ] 邮件退订链接
- [ ] 邮件摘要（每日/每周）
- [ ] 自定义邮件模板
- [ ] 邮件发送历史记录
- [ ] 邮件打开率追踪
- [ ] 通知时间段设置
