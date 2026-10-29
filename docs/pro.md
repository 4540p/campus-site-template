# Pro 版与接口契约

公开仓库是纯静态官网。Pro 增强包单独授权、单独交付，源码不在这个仓库里。

## 免费版与 Pro 的区别

| 能力 | 公开仓库 | Pro 增强包 |
| --- | --- | --- |
| 11 个页面 | ✅ | ✅ |
| 配置化品牌与主题 | ✅ | ✅ |
| JSON 内容 | ✅ | ✅ |
| 本地 FAQ 检索 | ✅ | ✅ |
| 校长信箱 | 浏览器 localStorage 演示 | 持久化、查询码、管理员回复 |
| 内容管理后台 | ❌ | ✅ |
| 新闻 / 公告 / 招生 CRUD | 手动改 JSON | 在线管理 |
| 访问统计 | ❌ | ✅ |
| 邮件通知 | ❌ | ✅ |
| 自动备份 | ❌ | ✅ |
| AI / RAG 问答 | 预留接入点 | ✅ 可接本地或云端模型 |
| 许可 | MIT | 商业许可 |

## Pro 包里有什么

Pro 交付包通常包含：

- <code>server/</code>：Flask 后端
- <code>admin.html</code> / <code>admin.js</code>：内容管理后台
- <code>assets/css/admin.css</code>
- <code>data/knowledge/</code>：知识库示例
- 安装脚本和部署说明
- 商业许可文本

Pro 的安装方式、环境变量、部署和销售交付说明在 Pro 包内，不放进公开仓库。

## 前端如何接入

公开模板已经预留了两个配置项：

~~~js
// assets/js/config.js
api: {
  base: 'https://api.example.com', // 留空 = 纯静态
},
ai: {
  endpoint: '/api/chat',           // 留空 = 使用本地 FAQ
},
~~~

接入后：

- 新闻、公告、招生优先从 API 读取，失败时回退到本地 JSON
- 校长信箱走后端持久化接口
- 首页公开回复走 <code>/api/mailbox/public</code>
- 问答按钮走后端 AI 接口

## 接口契约

如果你自建后端，按下面的路径实现即可复用前端逻辑。

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | <code>/api/health</code> | 健康检查 |
| GET | <code>/api/content/news</code> | 新闻列表 |
| GET | <code>/api/content/announcements</code> | 公告列表 |
| GET | <code>/api/content/recruitments</code> | 招生简章列表 |
| GET | <code>/api/content/file/&lt;name&gt;</code> | 简章文件下载 |
| POST | <code>/api/mailbox/submit</code> | 提交留言 |
| GET | <code>/api/mailbox/query/&lt;code&gt;</code> | 查询留言 |
| GET | <code>/api/mailbox/public</code> | 公开回复 |
| GET | <code>/api/faq/list</code> | FAQ 列表 |
| POST | <code>/api/faq/ask</code> | FAQ 检索 |
| POST | <code>/api/chat</code> | AI 问答 |
| POST | <code>/api/chat/stream</code> | AI 流式问答 |
| POST | <code>/api/analytics/track</code> | 访问打点 |

响应结构以公开前端代码里的读取方式为准，例如列表接口返回 <code>{ ok: true, items: [] }</code>，AI 接口返回 <code>{ answer, sources }</code>。

## 如何获取 Pro

Pro 通过私有仓库或压缩包交付。购买前建议确认：

- 学校数量 / 站点数量
- 是否需要部署、内容迁移和培训
- 是否需要 AI 知识库
- 是否需要年度维护
- 授权范围（单校 / 多校 / 托管）

联系方式：ai4540p@163.com

## 价格参考（早期阶段）

下面是个人开发者 / 学生团队的起步价，不是行业标准。正式报价按学校规模、部署范围、内容量、维护年限调整。

| 方案 | 起步价 | 包含 |
| --- | --- | --- |
| 开源版 | ¥0 | 静态官网、配置化内容、本地 FAQ、演示信箱 |
| Pro 自助授权 | ¥399 起 | Pro 包和文档，自行部署，不含部署和长期支持 |
| Pro 部署 | ¥999–1,999 | 远程部署、基础配置、1 次验收修改 |
| 内容迁移 | ¥300–800 | 约 20–50 条新闻 / 公告 / 图片 |
| AI 知识库 | ¥399–899 | 约 20–50 条问答，接通模型并测试 |
| 年度维护 | ¥299–599 / 年 | 备份、证书、少量修改，限定响应时间 |


## 许可

Pro 使用商业许可，禁止公开源码、转售和未授权的多校部署。具体条款以 Pro 包内的 <code>LICENSE-COMMERCIAL.md</code> 和双方合同为准。

