# 邮件功能测试指南

## 📋 当前状态检查

### 检查1: 查看控制台输出（开发模式）

如果看到以下输出，说明邮件功能正常工作，只是没有配置SMTP：

```
[Email Service] SMTP not configured. Email would be sent:
To: your-email@example.com
Subject: Verify Your Email Address
HTML: <!DOCTYPE html>...
```

这是**正常的**！开发模式下默认不发送真实邮件。

### 检查2: 查看服务器启动日志

```bash
# 如果配置了SMTP，应该看到：
Email service is ready

# 如果没配置SMTP，不会看到这个信息
```

## 🧪 测试邮件功能

### 测试方式1: 发送验证邮件（最简单）

1. 访问 http://localhost:3002/settings
2. 查看"邮箱验证"卡片
3. 点击"发送验证邮件"按钮
4. 查看终端/控制台输出

### 测试方式2: 创建团队通知

1. 创建一个新团队
2. 添加另一个用户
3. 查看控制台邮件输出

### 测试方式3: 在评论中@提及

1. 打开文件编辑器
2. 在评论中 @某个用户
3. 查看控制台邮件输出

## 🔧 配置真实SMTP（可选）

### 快速配置 - Gmail

**步骤1**: 获取Gmail应用密码

```bash
# 访问以下链接：
https://myaccount.google.com/security  # 启用两步验证
https://myaccount.google.com/apppasswords  # 生成应用密码
```

**步骤2**: 添加到.env文件

```bash
# 复制以下内容到.env文件
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="xxxx xxxx xxxx xxxx"  # 16位应用密码
SMTP_FROM="MarqDex <your-email@gmail.com>"
```

**步骤3**: 重启开发服务器

```bash
# 按 Ctrl+C 停止服务器
npm run dev
```

**步骤4**: 验证配置

启动后应该看到：
```
Email service is ready
```

### 配置 - 163/QQ邮箱

#### 163邮箱
```bash
SMTP_HOST="smtp.163.com"
SMTP_PORT="465"
SMTP_SECURE="true"
SMTP_USER="your-email@163.com"
SMTP_PASS="your-auth-code"  # 授权码，不是登录密码
SMTP_FROM="MarqDex <your-email@163.com>"
```

#### QQ邮箱
```bash
SMTP_HOST="smtp.qq.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@qq.com"
SMTP_PASS="your-auth-code"  # 授权码
SMTP_FROM="MarqDex <your-email@qq.com>"
```

**获取授权码**:
- 163邮箱: 设置 → POP3/SMTP/IMAP → 开启服务 → 生成授权码
- QQ邮箱: 设置 → 账户 → 开启SMTP服务 → 生成授权码

## 🧪 完整测试流程

### 测试1: 验证邮件

```bash
1. 访问 http://localhost:3002/settings
2. 点击"发送验证邮件"
3. 检查真实邮箱或控制台
```

### 测试2: 团队邀请邮件

```bash
1. 创建新用户 (test2@example.com)
2. 用管理员账号登录
3. 创建团队
4. 添加 test2@example.com 到团队
5. 检查 test2@example.com 邮箱
```

### 测试3: @提及通知

```bash
1. 打开一个文件编辑器
2. 在评论框输入: @username test message
3. 提交评论
4. 检查被提及用户的邮箱
```

## ❌ 常见问题排查

### 问题1: "没有收到邮件"

**可能原因**:
- ❌ 没有配置SMTP → 邮件只在控制台显示
- ❌ SMTP配置错误 → 查看错误日志
- ❌ 邮箱在垃圾箱 → 检查垃圾邮件
- ❌ 邮件被限流 → 等待或使用其他账号

**解决方法**:
```bash
# 查看控制台日志
npm run dev | grep "Email"

# 检查.env配置
cat .env | grep SMTP

# 重启服务器
# 按 Ctrl+C，然后 npm run dev
```

### 问题2: "Gmail认证失败"

**错误信息**:
```
Invalid login - 535 Authentication failed
```

**解决方法**:
1. 确认使用的是**应用专用密码**，不是账户密码
2. 重新生成应用密码
3. 检查用户名格式（完整的邮箱地址）

### 问题3: "163邮箱连接超时"

**解决方法**:
1. 确认开启了SMTP服务
2. 使用授权码而不是登录密码
3. 端口改为465，secure改为true

### 问题4: 配置后仍然没收到邮件

**检查清单**:
```bash
# 1. 确认配置已加载
npm run dev
# 应该看到: Email service is ready

# 2. 检查端口是否被占用
lsof -i :587

# 3. 查看完整错误日志
npm run dev 2>&1 | tee dev.log

# 4. 测试SMTP连接
# 安装swaks: brew install swaks (Mac)
swaks --to test@example.com --server smtp.gmail.com:587 \
       --auth-user your@gmail.com --auth-password your-password
```

## 📊 开发 vs 生产环境

### 开发环境
```bash
# 推荐：不配置SMTP
# 邮件输出到控制台，方便调试
# 不会发送真实邮件
```

### 生产环境
```bash
# 必须：配置专业SMTP服务
# SendGrid / Amazon SES / Mailgun
# 确保邮件到达率
```

## 🎯 推荐配置方案

### 个人测试/开发
- **Gmail**: 免费，每天500封
- **163/QQ**: 免费，国内速度快

### 小团队
- **SendGrid**: 免费100封/天，功能强大
- **Mailgun**: 免费5000封/月，开发者友好

### 生产环境
- **Amazon SES**: 成本低，$0.10/1000封
- **SendGrid**: 可靠性高，到达率99.9%
- **Postmark**: 送达速度快，适合事务性邮件

## 💡 调试技巧

### 查看邮件内容（不配置SMTP）

```bash
# 控制台会输出
[Email Service] SMTP not configured. Email would be sent:
To: user@example.com
Subject: Verify Your Email Address
HTML: <!DOCTYPE html>...
```

### 使用Mailtrap（邮件测试服务）

```bash
# Mailtrap提供虚假SMTP服务器
# 可以捕获邮件并查看

SMTP_HOST="smtp.mailtrap.io"
SMTP_PORT="2525"
SMTP_SECURE="false"
SMTP_USER="your-mailtrap-username"
SMTP_PASS="your-mailtrap-password"
```

### 查看完整邮件HTML

```javascript
// 在 lib/email/service.ts 中临时修改
console.log('[Email Service] Full HTML:', html)
```

## 📞 获取帮助

如果仍然无法收到邮件：

1. **检查控制台日志**
   ```bash
   npm run dev
   # 观察启动和操作时的输出
   ```

2. **验证SMTP配置**
   ```bash
   # 使用telnet测试SMTP连接
   telnet smtp.gmail.com 587
   ```

3. **查看完整文档**
   - docs/email-service-setup.md
   - docs/email-features.md

4. **使用配置脚本**
   ```bash
   chmod +x setup-email.sh
   ./setup-email.sh
   ```
