# 接入后端

公开仓库默认是纯静态站点。需要持久化留言、内容管理或 AI 时，可以连接自建后端，或使用单独授权的 Pro 增强包。

## 前端配置

在 <code>assets/js/config.js</code> 中设置：

~~~js
api: {
  base: 'https://api.example.com', // 留空 = 纯静态
},
ai: {
  endpoint: '/api/chat',           // 留空 = 使用本地 FAQ
},
~~~

## 接口契约

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

列表接口建议返回：

~~~json
{ "ok": true, "items": [] }
~~~

AI 接口建议返回：

~~~json
{ "answer": "回答内容", "sources": [] }
~~~

留言提交建议返回：

~~~json
{ "ok": true, "query_code": "AB12CD34" }
~~~

## 接入行为

- 新闻、公告、招生优先从 API 读取，失败时回退到本地 JSON
- 校长信箱填写 <code>api.base</code> 后走后端持久化
- 首页公开回复走 <code>/api/mailbox/public</code>
- 问答按钮填写 <code>ai.endpoint</code> 后走后端 AI，否则使用本地 FAQ

## 跨域

前后端不同域时，在后端设置允许的来源，例如：

~~~env
CORS_ORIGINS=https://pages.example.com
~~~

生产环境不要长期使用 <code>CORS_ORIGINS=*</code>。
