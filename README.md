# Please Love Life（每日名言与图片）

这是一个 Obsidian 插件：当你用模板创建笔记后，自动把占位符替换为“今日名言”和“今日图片”。

## 功能

- 每天不同名言（支持自定义 API）
- 每天不同图片（支持自定义 API）
- 支持模板占位符自动替换
- 支持图片下载到仓库（默认开启）
- 支持用户自行填写 API Key

## 安装与启用

1. 安装依赖：

```bash
npm install
```

2. 构建：

```bash
npm run build
```

3. 确认插件目录顶层有：
- `main.js`
- `manifest.json`
- `styles.css`

4. 在 Obsidian 打开 **设置 → 社区插件**，启用本插件。

## 快速开始

在模板中写入：

```md
# 今日记录

> {{pll_quote}}

{{pll_photo}}
```

创建笔记并应用模板后，会自动替换占位符。

## API 申请与填写

如果你使用的接口需要密钥，可以在设置中填写：

- `名言 API 地址`
- `名言 API Key`
- `图片 API 地址`
- `图片 API Key`

### 默认配置（可直接用）

- 名言 API 地址：`https://zenquotes.io/api/today`
- 图片 API 地址：`https://picsum.photos/seed/{date}/{width}/{height}`

这两个默认源通常不需要 API Key，可留空。

### URL 变量说明

插件支持以下变量，写在 API 地址里会自动替换：

- `{apiKey}`：你填写的 API Key
- `{date}`：当天日期（`YYYY-MM-DD`）
- `{width}`：图片宽度
- `{height}`：图片高度

示例：

```text
https://example.com/daily-image?date={date}&w={width}&h={height}&key={apiKey}
```

## 设置说明（中文）

- 自动替换占位符：新建 Markdown 文件时自动替换
- 名言占位符：例如 `{{pll_quote}}`
- 图片占位符：例如 `{{pll_photo}}`
- 名言 API 地址：名言接口 URL
- 名言 API Key：可选
- 图片 API 地址：图片接口 URL
- 图片 API Key：可选
- 下载图片到仓库：开启后写入本地 `please-love-life-images/`
- 图片宽度 / 图片高度：用于构建图片请求

## 命令

- `Insert today's quote`
- `Insert today's photo`
- `Resolve quote and photo placeholders in current note`

## 常见问题

### 占位符没有自动替换

- 检查“自动替换占位符”是否开启
- 检查模板占位符与设置一致
- 可执行命令：`Resolve quote and photo placeholders in current note`

### API 报错

- 检查 API 地址是否正确
- 检查 API Key 是否有效
- 检查 URL 参数是否需要用 `{apiKey}` 注入

### 图片下载失败

- 插件会自动回退为远程图片链接
- 可先关闭“下载图片到仓库”

## 开发

```bash
npm run dev
npm run build
npm run lint
```
