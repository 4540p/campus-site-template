# 部署指南

> 公开仓库默认是纯静态站点。下面的 Flask 部分适用于购买了 Pro 增强包，或自己实现了兼容接口的情况。

## 纯静态部署

这是默认模式，不需要 Node、Python 或数据库。

### GitHub Pages

1. 把仓库推到 GitHub。
2. Settings → Pages → Source 选择分支和根目录。
3. 等待发布。
4. 在 <code>config.meta.url</code> 中填写 Pages 域名。

如果使用自定义域名，添加 <code>CNAME</code> 文件。

### Cloudflare Pages / Vercel / Netlify

- Build command：留空
- Output directory：<code>/</code> 或仓库根目录
- 不需要环境变量

### Nginx

~~~nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/campus-site;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    location /data/ {
        add_header Cache-Control "no-cache";
    }
}
~~~

## Pro / 自建 Flask 后端部署

推荐结构：

~~~text
浏览器
  ├── /            → Nginx 静态文件
  └── /api/        → 反向代理到 Flask :5000
~~~

Nginx 示例：

~~~nginx
server {
    listen 443 ssl http2;
    server_name example.com;

    root /var/www/campus-site;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
    }

    location /admin/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
~~~

### Gunicorn

~~~bash
cd server
pip install -r requirements-lite.txt gunicorn
gunicorn -w 2 -b 127.0.0.1:5000 app:app
~~~

Windows 可以用 <code>waitress</code>：

~~~bash
pip install waitress
waitress-serve --listen=127.0.0.1:5000 app:app
~~~

### systemd

~~~ini
[Unit]
Description=Campus Site API
After=network.target

[Service]
User=www-data
WorkingDirectory=/var/www/campus-site/server
EnvironmentFile=/var/www/campus-site/server/.env
ExecStart=/var/www/campus-site/server/.venv/bin/gunicorn -w 2 -b 127.0.0.1:5000 app:app
Restart=always

[Install]
WantedBy=multi-user.target
~~~

### 前后端同域

同域部署时，前端配置可以写成：

~~~js
api: { base: '' },
ai: { endpoint: '/api/chat' },
~~~

Nginx 会把 <code>/api</code> 转发到后端。

### 前后端分离

前端在 <code>pages.example.com</code>，后端在 <code>api.example.com</code> 时：

~~~js
api: { base: 'https://api.example.com' },
ai: { endpoint: '/api/chat' },
~~~

并在后端 <code>.env</code> 中设置：

~~~env
CORS_ORIGINS=https://pages.example.com
~~~

## 缓存建议

- HTML：<code>no-cache</code> 或短缓存
- CSS / JS：带 hash 的长缓存（需要改文件名）
- 图片：30 天
- <code>data/*.json</code>：<code>no-cache</code>，方便老师更新后立即生效

## 备份

后端会自动备份到 <code>data/backups/</code>，保留 30 天。也可以手动：

~~~bash
python -c "from backup import _do_backup_once; _do_backup_once()"
~~~

记得把备份目录同步到另一台机器或对象存储，不要只留在同一块磁盘上。
