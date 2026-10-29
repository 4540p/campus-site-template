# 开发工具

这些脚本只用于开发和自检，部署时不需要。

| 文件 | 用途 |
| --- | --- |
| <code>serve.mjs</code> | 零依赖本地预览服务器，<code>npm run dev</code> |
| <code>check.mjs</code> | JSON、内部链接、页面外壳、敏感信息检查，<code>npm run check</code> |
| <code>generate-placeholders.mjs</code> | 重新生成 SVG 占位图，<code>npm run assets</code> |
| <code>layout-check.html</code> | 在 390 / 768 / 1440 宽度下检查横向溢出 |
| <code>interaction-check.html</code> | 自动检查导航、问答、搜索、筛选和信箱演示流程 |

<code>layout-check.html</code> 和 <code>interaction-check.html</code> 需要用浏览器打开（通过本地服务器），页面会在完成后把结果写进页面文本，方便人工查看。
