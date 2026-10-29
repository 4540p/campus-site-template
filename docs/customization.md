# 定制指南

## 1. 品牌与主题

打开 <code>assets/js/config.js</code>，优先修改：

- <code>meta</code>：校名、简称、英文名、校训、描述、域名、SEO 关键词
- <code>brand.logo</code>：校徽路径
- <code>theme</code>：主色、深色、强调色
- <code>contact</code>：地址、电话、邮箱、办公时间
- <code>nav</code>：导航结构和页面顺序
- <code>footer</code>：底部快捷链接、备案号、版权文案

主题色只需给三个值，页面会自动生成 <code>--primary-50</code> 到 <code>--primary-900</code> 的色阶。

## 2. 页面文案

每个页面的标题、副标题、描述在 <code>config.pages</code> 中。页面内固定板块的标题在 <code>config.sections</code> 中，通过 <code>data-section</code> 属性挂载。例如：

~~~html
<div class="section-header" data-section="sections.news"></div>
~~~

会渲染成“最新资讯”标题。要改文案，只改配置，不用碰 HTML。

学校简介的正文、办学理念、特色卡片在 <code>config.about</code>；学校故事在 <code>config.story</code>。

## 3. 内容 JSON

### 新闻 <code>data/news.json</code>

~~~json
{
  "id": 1,
  "title": "新闻标题",
  "date": "2026-09-01",
  "category": "校园动态",
  "summary": "列表页摘要",
  "content": "正文，支持 ## 标题、- 列表、**加粗**",
  "image": "assets/img/news-1.svg",
  "isNew": true
}
~~~

### 公告 <code>data/announcements.json</code>

分类可用：<code>academic</code> / <code>affairs</code> / <code>urgent</code> / <code>activity</code> / <code>general</code>。

<code>pinned: true</code> 置顶，<code>urgent: true</code> 标红。

### 师资 <code>data/teachers.json</code>

~~~json
{
  "name": "教师姓名",
  "subject": "语文教研组",
  "badge": "高级教师",
  "desc": "一句话介绍",
  "stats": ["从教 18 年", "市级学科带头人"],
  "image": "assets/img/teacher-1.svg"
}
~~~

### 校园风光 <code>data/gallery.json</code>

分类可用：<code>building</code> / <code>nature</code> / <code>sports</code> / <code>life</code>。
<code>tall: true</code> 会让图片在瀑布流中占两行。

### 学子 <code>data/students.json</code>

分类可用：<code>competition</code> / <code>club</code> / <code>volunteer</code>。

### 招生 <code>data/recruitments.json</code>

按年份倒序显示。支持 <code>file</code> 字段关联 PDF：

- 纯静态：文件放到 <code>files/</code>，并填写 <code>file: "2026.pdf"</code>
- 后端模式：通过 <code>/api/content/file/2026.pdf</code> 下载

### FAQ <code>data/faq.json</code>

~~~json
{
  "id": "schedule",
  "category": "作息时间",
  "question": "学校几点上课？",
  "answer": "答案，支持简单 Markdown",
  "keywords": ["上课", "几点", "作息"]
}
~~~

问答匹配会综合问题、答案和关键词。没有后端时完全在浏览器里完成。

## 4. 图片替换

默认图片是 SVG 占位图，可以直接替换为 JPG / PNG / WebP，只要同步修改 JSON 或配置中的路径。

建议：

- 封面图 1600×900，单张控制在 300KB 以内
- 人物图 600×750，使用 WebP
- 校徽使用 SVG 或 512×512 PNG
- 给每张图写 <code>alt</code>，不要只写“图片”

如果只是想重新生成一套抽象占位图：

~~~bash
npm run assets
~~~

## 5. SEO

在 <code>config.meta</code> 中设置真实域名后，页面会自动生成：

- 页面标题与描述
- Open Graph
- Twitter Card
- canonical
- EducationalOrganization 结构化数据

每个页面的标题和描述在 <code>config.pages</code> 中单独配置。

## 6. 导航与新增页面

在 <code>config.nav</code> 中添加一项：

~~~js
{ label: '校园开放日', href: 'openday.html', key: 'openday' }
~~~

新页面需要：

1. 复制一个现有页面作为壳
2. 修改 <code>body data-page="openday"</code>
3. 在 <code>config.pages.openday</code> 中补充标题和描述
4. 在 <code>assets/js/content.js</code> 的 <code>tasks</code> 中注册渲染函数
5. 运行 <code>npm run check</code> 检查链接

## 7. 接入 Pro / 自建后端

<code>config.api.base</code> 留空 = 纯静态。

填写 Pro 或自建后端地址后：

- 新闻、公告、招生优先走 API，失败时自动回退到本地 JSON
- 校长信箱走后端持久化
- 首页公开回复走 <code>/api/mailbox/public</code>

<code>config.ai.endpoint</code> 留空 = 使用本地 FAQ；填写 <code>/api/chat</code> = 使用后端 AI。
