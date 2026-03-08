# Please Love Life

一个 Obsidian 插件：自动在模板/笔记中替换每日名言和每日图片。

## 占位符

- `{{pll_quote}}`：使用今日缓存名言
- `{{pll_photo}}`：使用今日缓存图片
- `{{pll_quote_new}}`：强制拉取新名言并覆盖今日缓存
- `{{pll_photo_new}}`：强制拉取新图片并覆盖今日缓存

## 源预设

- 名言源预设：一言（中文）/ ZenQuotes（英文）/ 今日诗词（中文）/ 自定义
- 图片源预设：Picsum / 自定义

当预设不是“自定义”时，对应 API 地址输入框会自动锁定并使用预设地址。

## 常用设置

- 自动替换占位符（新建文件）
- 实时监听当前文件修改
- 名言 API 地址 / 名言 API Key
- 图片 API 地址 / 图片 API Key
- 下载图片到仓库
- 图片宽度 / 图片高度

API 地址支持变量：`{apiKey}`、`{date}`、`{width}`、`{height}`。

## 公益 API 网站（本项目用到/支持）

- 一言 Hitokoto（中文名言）
  - 网站：https://hitokoto.cn
  - 开发文档：https://developer.hitokoto.cn/sentence/

- ZenQuotes（英文名言）
  - 网站：https://zenquotes.io

- 今日诗词（中文诗词）
  - 网站：https://www.jinrishici.com
  - 文档：https://www.jinrishici.com/doc/

- Lorem Picsum（随机图片）
  - 网站：https://picsum.photos

## 构建

```bash
npm install
npm run build
```
