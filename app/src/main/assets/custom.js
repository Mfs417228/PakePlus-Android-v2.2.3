window.addEventListener("DOMContentLoaded",()=>{const t=document.createElement("script");t.src="https://www.googletagmanager.com/gtag/js?id=G-W5GKHM0893",t.async=!0,document.head.appendChild(t);const n=document.createElement("script");n.textContent="window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-W5GKHM0893');",document.body.appendChild(n)});@echo off
echo 正在启动后端服务器...
start cmd /k "cd backend && node server.js"
echo 后端服务器已启动，运行在 http://localhost:5008/

echo 正在启动前端开发服务器...
start cmd /k "cd frontend && npm run dev"
echo 前端服务器已启动，运行在 http://localhost:3002/

echo 所有服务器已启动完成！
echo 请访问 http://localhost:3002/ 开始使用仓库管理系统
pause