# 第一次把模板发布到 GitHub

这份指南按“第一次用 GitHub”的流程写。最省事的方式是 **GitHub Desktop**，不需要记命令。

## 0. 先确认发布哪个目录

要发布的是：

~~~text
D:\bll\school-website\template
~~~

不要发布上一层 <code>D:\bll\school-website</code>，那一层包含原项目、真实学校数据、照片、留言和 AI 后端缓存。

公开模板目录已经是一个独立站点，里面的 <code>.gitignore</code> 会排除：

- <code>.env</code>
- <code>data/messages.json</code>
- <code>data/analytics.json</code>
- 真实备份和上传文件

如果你在本地安装了 Pro 增强包，<code>.gitignore</code> 也会排除：

- <code>server/</code>
- <code>admin.html</code>
- <code>admin.js</code>
- <code>assets/css/admin.css</code>
- <code>data/knowledge/</code>

## 1. 注册 / 登录 GitHub

打开 <https://github.com/>，注册账号并完成邮箱验证。

建议先把用户名想好，它会出现在仓库地址里，例如：

~~~text
https://github.com/yourname/campus-site-template
~~~

## 2. 新建一个空仓库

1. 右上角 <code>+</code> → <code>New repository</code>
2. Repository name 填 <code>campus-site-template</code>
3. 选择 <code>Public</code>
4. **不要**勾选 Add a README file、Add .gitignore、Choose a license
5. 点击 <code>Create repository</code>

因为本地模板已经带有 README、.gitignore 和 LICENSE，远程仓库保持空白最省事。

## 3. 上传（推荐：GitHub Desktop）

### 安装

打开 <https://desktop.github.com/> 下载安装，或者用 winget：

~~~powershell
winget install --id GitHub.GitHubDesktop -e --accept-source-agreements --accept-package-agreements
~~~

安装后登录你的 GitHub 账号。

### 添加本地仓库

1. 打开 GitHub Desktop
2. <code>File</code> → <code>Add local repository...</code>
3. 选择 <code>D:\bll\school-website\template</code>
4. 如果提示这不是 Git 仓库，选择 <code>create a repository</code>
5. 确认路径是 <code>template</code>，点击创建

### 第一次提交

1. 左下角 Summary 填：<code>Initial commit: campus site template</code>
2. 点击 <code>Commit to main</code>
3. 右上角点击 <code>Publish repository</code>
4. 取消勾选 <code>Keep this code private</code>
5. 点击 <code>Publish repository</code>

完成后，仓库地址就是：

~~~text
https://github.com/你的用户名/campus-site-template
~~~

## 4. 或者用命令行

### 安装 Git

~~~powershell
winget install --id Git.Git -e --accept-source-agreements --accept-package-agreements
~~~

安装后**重新打开一个 PowerShell 窗口**，确认：

~~~powershell
git --version
~~~

### 配置身份

只需要做一次：

~~~powershell
git config --global user.name "你的名字"
git config --global user.email "你的 GitHub 邮箱"
~~~

### 初始化并推送

~~~powershell
cd D:\bll\school-website\template

git init
git add .
git status
~~~

先看 <code>git status</code> 的输出。确认没有 <code>.env</code>、<code>data/messages.json</code>、<code>server/</code>、<code>admin.html</code> 这类文件。

然后：

~~~powershell
git commit -m "Initial commit: campus site template"
git branch -M main
git remote add origin https://github.com/你的用户名/campus-site-template.git
git push -u origin main
~~~

第一次 push 会弹出浏览器登录，按提示授权即可。

如果提示 <code>Support for password authentication was removed</code>，不要输入 GitHub 登录密码，使用浏览器授权或 Personal Access Token。

## 4.5 不想安装软件：用网页上传

可以，但只建议做第一次上传，后续更新会比较麻烦。

1. 新建空仓库后，点击 <code>Add file</code> → <code>Upload files</code>
2. 打开 <code>D:llschool-website	emplate</code>
3. 全选**文件夹里的内容**（不要选 <code>template</code> 这一层文件夹本身）
4. 拖进网页上传区域
5. 填写提交信息，点击 <code>Commit changes</code>

注意：

- 网页单次最多上传 100 个文件，模板有 90 多个文件，建议分两批更稳妥
- <code>.gitignore</code> 和 <code>.github</code> 是隐藏项，先在文件资源管理器里开启“显示隐藏的项目”
- 上传后确认仓库根目录直接能看到 <code>index.html</code>，而不是 <code>template/index.html</code>
- 以后每次更新都要重复上传，容易漏文件

## 5. 开启 GitHub Pages

仓库页面 → <code>Settings</code> → 左侧 <code>Pages</code>：

- Source：<code>Deploy from a branch</code>
- Branch：<code>main</code>
- Folder：<code>/ (root)</code>
- 点击 <code>Save</code>

等 1-2 分钟，访问：

~~~text
https://你的用户名.github.io/campus-site-template/
~~~

如果 404：

- 确认仓库根目录有 <code>index.html</code>
- 确认 Pages 里选的是 <code>main</code> 和 <code>/ (root)</code>
- 等几分钟再看，第一次部署会慢一些
- 打开仓库的 <code>Actions</code> 或 <code>Settings → Pages</code> 看状态

GitHub Pages 只能托管静态文件。Pro 后端和 AI 功能需要另外部署到支持 Python 的服务器，见 <code>docs/deployment.md</code>。

## 6. 把仓库信息填完整

在仓库首页右侧点击齿轮，设置：

**Description**

~~~text
可配置的校园官网模板：11 个静态页面 + JSON 内容 + 本地问答；Pro 版提供 Flask 后台与 AI 校务助手。
~~~

**Topics**

~~~text
school-website, education, school, template, static-site, html, css, javascript, flask, rag, ai, chinese
~~~

**Social preview**

上传 <code>assets/img/og-cover.png</code>，这样别人分享仓库链接时会有封面图。

## 7. 发布第一个版本

仓库页面右侧 <code>Releases</code> → <code>Draft a new release</code>：

- Tag：<code>v1.0.0</code>
- Title：<code>v1.0.0 · 首个公开模板</code>
- 描述可以写：

~~~text
首个公开版本：11 个页面、配置化主题与内容、响应式布局、本地 FAQ 问答。Pro 后端与 AI 模块单独授权。
~~~

点击 <code>Publish release</code>。

## 8. 以后怎么更新

### GitHub Desktop

1. 改完文件
2. 打开 Desktop，左侧会显示变更
3. 填 Summary
4. <code>Commit to main</code>
5. 点 <code>Push origin</code>

### 命令行

~~~powershell
cd D:\bll\school-website\template
git add .
git commit -m "描述这次改了什么"
git push
~~~

## 9. 常见问题

**会不会把原项目的真实数据传上去？**

不会，只要你发布的是 <code>template</code> 目录，并且没有强行删除 <code>.gitignore</code> 规则。发布前用 <code>git status</code> 检查一遍。

**GitHub Pages 上为什么新闻/公告是空的？**

不要用 <code>file://</code> 打开。Pages 会通过 HTTP 提供 <code>data/*.json</code>，本地预览也要用 <code>npm run dev</code>。

**后端能直接放 GitHub Pages 吗？**

不能。Pages 只托管静态文件。Pro 或自建后端可以部署到 Render、Railway、Fly.io、自己的服务器等，然后把前端 <code>config.api.base</code> 指向后端地址。

**页面里的示例校名怎么改？**

改 <code>assets/js/config.js</code> 和 <code>data/*.json</code>，然后重新提交、推送。详细步骤见 <code>docs/customization.md</code>。

**可以商用吗？**

代码是 MIT 许可证，可以商用。注意 MIT 也允许别人转售；如果你希望限制闭源转售，考虑 AGPL 或双许可证。见 <code>docs/monetization.md</code>。

**第一次开源，最容易被忽略的是什么？**

- 没有改示例域名和联系方式
- 把真实学生信息、照片、留言传上去
- 没有设置 LICENSE
- README 没有在线预览地址
- 没有说明哪些数据是示例

这个模板已经处理了 LICENSE、示例数据、安全说明和 .gitignore，剩下的主要是换品牌和发布。
