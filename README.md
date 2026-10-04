# 李思彤 · 个人作品集

以浅灰和白色为主色的静态作品集网站，包含个人介绍、服装作品、美术作品。美术作品分为绘画和平面设计。适配桌面、平板和手机，支持点开作品查看完整系列与大图。

目前收录 15 组作品、24 张作品图片，以及 1 张个人照片。图片来自提供的绘画、平面设计文件、服装研究及简历中的服装作品页。作品标题采用描述性名称，可随时修改。个人照片已按要求去除品牌标志；新增图片经过网页压缩，保留完整构图；大尺寸作品最长边为 1920 像素。

## 直接打开

解压后打开 `index.html` 即可浏览。所有资源都在文件夹内，不依赖在线字体或外部库，不需要安装软件或执行构建。

## 文件位置

| 文件 | 用途 |
| --- | --- |
| `index.html` | 页面结构、基础介绍与元信息 |
| `styles.css` | 灰白视觉样式和不同屏幕尺寸的布局 |
| `app.js` | 作品展示、大图弹窗、键盘交互 |
| `data/portfolio.js` | 个人介绍与作品目录，日常更新主要修改此文件 |
| `assets/fashion/` | 服装作品图片 |
| `assets/art/` | 绘画与平面作品图片 |
| `assets/profile/` | 个人介绍照片 |
| `.nojekyll` | 让 GitHub Pages 直接提供静态文件 |

## 补充和替换作品

### 替换一张图片

将新的 JPG、PNG 或 WebP 图片放入 `assets` 的对应文件夹，再更新 `data/portfolio.js` 中的封面和图片路径。建议使用新文件名，避免浏览器缓存继续显示旧图。修改目录或样式后，同步更新 `index.html` 中对应文件的 `?v=` 版本号。

### 添加一组作品

1. 将图片放入 `assets/fashion/` 或 `assets/art/`。文件名建议使用英文字母、数字和连字符。
2. 在 `data/portfolio.js` 的 `projects` 数组内复制一组现有作品。
3. 设置唯一的 `id`，修改标题、简介、封面与图片列表。
4. 设置 `category`：`fashion` 是服装，`illustration` 是绘画，`graphic` 是平面设计。
5. 数组中同类别的排列顺序就是网页中的显示顺序。保存并提交后即可更新。

作品示例：

```javascript
{
  "id": "new-fashion-project",
  "category": "fashion",
  "title": "新作品名称",
  "subtitle": "成衣 / 效果图",
  "description": "作品说明。",
  "cover": "assets/fashion/new-work.jpg",
  "images": [
    {
      "src": "assets/fashion/new-work.jpg",
      "alt": "图片内容的简要描述"
    }
  ]
}
```

作品之间用逗号分隔，注意保留开头的 `window.PORTFOLIO =` 和文件末尾的分号。删除一组作品时，删除对应的整个对象即可。

## 修改个人介绍

修改 `data/portfolio.js` 中的 `profile`：简介、学校、专业、技能、语言、邮箱及首页大图都集中在此处。修改姓名时，也请同步检查 `index.html` 中的页头、页脚和页面描述。

个人照片放在 `assets/profile/`。替换后请同步修改 `index.html` 中 `hero-image` 的路径、描述与宽高；介绍区按竖幅完整展示照片。

公开页面仅使用简历中的专业信息与联系邮箱，网站包不包含原始简历 PDF。

## GitHub Pages 发布配置

源码仓库：https://github.com/GND623/Portfolio-

`index.html` 位于仓库根目录。在仓库的 **Settings → Pages** 中，将 **Source** 设为 **Deploy from a branch**，选择 **main** 分支与 **/(root)**，保存。使用 Pages 页面提供的实际网址。

后续修改和替换文件后提交到同一发布分支，GitHub Pages 会重新发布。

官方说明：https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## 使用与核验说明

支持鼠标、触屏和键盘操作；作品弹窗可以使用“关闭”按钮或 Esc 关闭，关闭后焦点回到原作品按钮。采用相对资源路径，兼容 GitHub 项目子目录。

已检查 JavaScript 语法、作品数据和本地资源引用。发布后可分别在电脑与手机中检查页面及大图弹窗。
