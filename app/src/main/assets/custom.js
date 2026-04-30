window.addEventListener("DOMContentLoaded",()=>{const t=document.createElement("script");t.src="https://www.googletagmanager.com/gtag/js?id=G-W5GKHM0893",t.async=!0,document.head.appendChild(t);const n=document.createElement("script");n.textContent="window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-W5GKHM0893');",document.body.appendChild(n)});Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  仓库管理系统 - 一键启动脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查是否以管理员身份运行
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if ($currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "[OK] 已以管理员身份运行" -ForegroundColor Green
} else {
    Write-Host "[WARN] 建议以管理员身份运行以获得更好的体验" -ForegroundColor Yellow
}
Write-Host ""

# 启动后端服务
Write-Host "[1/3] 启动后端服务..." -ForegroundColor Yellow
$backendProcess = Start-Process cmd.exe -ArgumentList "/k cd backend && npm run start" -PassThru -WindowStyle Normal
Write-Host "[INFO] 后端服务进程已启动 (PID: $($backendProcess.Id))" -ForegroundColor Gray
Write-Host ""

# 等待后端服务启动完成
Write-Host "[等待] 等待后端服务启动..." -ForegroundColor Yellow
$backendReady = $false
for ($i = 0; $i -lt 30; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5010/api" -UseBasicParsing -TimeoutSec 2
        if ($response.StatusCode -eq 200) {
            $backendReady = $true
            break
        }
    } catch {
        # 忽略错误，继续等待
    }
    Start-Sleep -Seconds 1
}

if ($backendReady) {
    Write-Host "[OK] 后端服务启动成功" -ForegroundColor Green
} else {
    Write-Host "[WARN] 后端服务启动超时，继续启动前端服务..." -ForegroundColor Yellow
}
Write-Host ""

# 启动前端服务
Write-Host "[2/3] 启动前端服务..." -ForegroundColor Yellow
$frontendProcess = Start-Process cmd.exe -ArgumentList "/k cd frontend && npm run dev" -PassThru -WindowStyle Normal
Write-Host "[INFO] 前端服务进程已启动 (PID: $($frontendProcess.Id))" -ForegroundColor Gray
Write-Host ""

# 等待前端服务启动完成
Write-Host "[等待] 等待前端服务启动..." -ForegroundColor Yellow
$frontendReady = $false
$frontendPort = 3004
for ($i = 0; $i -lt 30; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$frontendPort" -UseBasicParsing -TimeoutSec 2
        if ($response.StatusCode -eq 200) {
            $frontendReady = $true
            break
        }
    } catch {
        # 尝试其他端口
        $frontendPort++
        if ($frontendPort -gt 3010) {
            $frontendPort = 3004
        }
    }
    Start-Sleep -Seconds 1
}

if ($frontendReady) {
    Write-Host "[OK] 前端服务启动成功 (端口: $frontendPort)" -ForegroundColor Green
} else {
    Write-Host "[WARN] 前端服务启动超时，继续启动 ngrok..." -ForegroundColor Yellow
}
Write-Host ""

# 启动 ngrok
Write-Host "[3/3] 启动 ngrok 内网穿透..." -ForegroundColor Yellow
$ngrokProcess = Start-Process cmd.exe -ArgumentList "/k ngrok http $frontendPort" -PassThru -WindowStyle Normal
Write-Host "[INFO] ngrok 服务进程已启动 (PID: $($ngrokProcess.Id))" -ForegroundColor Gray
Write-Host ""

# 等待 ngrok 启动
Write-Host "[等待] 等待 ngrok 连接..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# 获取 ngrok 公网地址
$publicUrl = "获取失败，请查看 ngrok 窗口"
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4040/api/tunnels" -UseBasicParsing
    $json = $response.Content | ConvertFrom-Json
    if ($json.tunnels -and $json.tunnels.Count -gt 0) {
        $publicUrl = $json.tunnels[0].public_url
    }
} catch {
    # 忽略错误
}

# 显示服务状态
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  启动完成！" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "服务状态：" -ForegroundColor Yellow
Write-Host "  后端服务: http://localhost:5010" -ForegroundColor White
Write-Host "  前端服务: http://localhost:$frontendPort" -ForegroundColor White
Write-Host "  ngrok: 已启动" -ForegroundColor White
Write-Host ""
Write-Host "访问地址：" -ForegroundColor Yellow
Write-Host "  本地访问: http://localhost:$frontendPort/" -ForegroundColor White
Write-Host "  局域网访问: http://192.168.101.28:$frontendPort/" -ForegroundColor White
Write-Host "  公网访问: $publicUrl" -ForegroundColor White
Write-Host ""
Write-Host "登录信息：" -ForegroundColor Yellow
Write-Host "  账号: 15199103849" -ForegroundColor White
Write-Host "  密码: 417228" -ForegroundColor White
Write-Host ""
Write-Host "注意事项：" -ForegroundColor Yellow
Write-Host "  1. 保持所有窗口开启以维持服务运行" -ForegroundColor White
Write-Host "  2. 关闭窗口将停止对应服务" -ForegroundColor White
Write-Host "  3. 免费版 ngrok 的地址会在重启后改变" -ForegroundColor White
Write-Host ""
Write-Host "按任意键打开 ngrok Web 界面..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# 打开 ngrok Web 界面
Start-Process "http://localhost:4040"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  脚本执行完成！" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan