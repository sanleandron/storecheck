# StoreCheck HD — Guion de despliegue en producción (PowerShell)
# Uso: completa .env primero, luego ejecuta:  .\scripts\deploy.ps1
# ============================================================

$ErrorActionPreference = 'Stop'

function Fail($msg) {
  Write-Host "[ERROR] $msg" -ForegroundColor Red
  exit 1
}

Write-Host "=== StoreCheck HD — Deploy en producción ===" -ForegroundColor Cyan

# 1) Validar variables de entorno
if (!(Test-Path ".env")) { Fail "No existe .env. Copia .env.example a .env y complétalo." }

$url = (Select-String -Path ".env" -Pattern "^VITE_SUPABASE_URL=(.+)$").Matches.Groups[1].Value
$key = (Select-String -Path ".env" -Pattern "^VITE_SUPABASE_ANON_KEY=(.+)$").Matches.Groups[1].Value

if (!$url -or !$key) {
  Fail "VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY vacíos en .env"
}
Write-Host "  URL detectada: $($url.Substring(0, [Math]::Min(20, $url.Length)))..."

# 1b) Verificación del esquema (tablas Supabase)
Write-Host "- Verificando esquema en Supabase..." -ForegroundColor Cyan
$env:SB_URL = $url
$env:SB_KEY = $key
node -e "const r=await fetch(process.env.SB_URL+'/rest/v1/audits?select=id&limit=1',{headers:{apikey:process.env.SB_KEY,Authorization:'Bearer '+process.env.SB_KEY}}); process.exit(r.status===200?0:(r.status===404?2:3))" --input-type=module 2>&1
$code = $LASTEXITCODE
Remove-Item Env:SB_URL -ErrorAction SilentlyContinue
Remove-Item Env:SB_KEY -ErrorAction SilentlyContinue
if ($code -eq 2) {
  Fail "El esquema NO está aplicado en Supabase. Ejecuta supabase/schema.sql en el SQL Editor del panel y vuelve a intentar."
} elseif ($code -eq 3) {
  Fail "No se pudo conectar a Supabase. Revisa las credenciales y la red."
}
Write-Host "  Esquema OK (tabla audits accesible)." -ForegroundColor Green

# 2) Instalar dependencias (si hace falta)
Write-Host "- Instalando dependencias..." -ForegroundColor Cyan
npm install 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) { Fail "npm install falló" }

# 3) Calidad
Write-Host "- Lint..." -ForegroundColor Cyan
npm run lint 2>&1
if ($LASTEXITCODE -ne 0) { Fail "Lint falló" }

Write-Host "- Tests..." -ForegroundColor Cyan
npm run test 2>&1 | Select-Object -Last 5
if ($LASTEXITCODE -ne 0) { Fail "Tests fallaron" }

# 4) Build de producción (incluye variables de .env)
Write-Host "- Build de producción..." -ForegroundColor Cyan
npm run build 2>&1 | Select-Object -Last 8
if ($LASTEXITCODE -ne 0) { Fail "Build falló" }

# 5) Despliegue a Netlify
Write-Host "- Desplegando a Netlify..." -ForegroundColor Cyan
# Si ya existe el enlace del sitio, usa deploy --prod; si no, init interactivo.
$hasRemote = (git remote -v 2>&1 | Measure-Object -Line).Lines -gt 0
if ($hasRemote) {
  # Deploy por Git: se hace mediante push a GitHub + Netlify connect.
  Write-Host "  Deploy por Git detectado. Haz push a la rama y Netlify construirá." -ForegroundColor Yellow
  Write-Host "  Git: git add -A && git commit -am 'release' && git push origin main" -ForegroundColor Yellow
} else {
  Write-Host "  Sin remote. Usando deploy directo de la carpeta dist/..." -ForegroundColor Yellow
  netlify deploy --prod --dir=dist
  if ($LASTEXITCODE -ne 0) { Fail "netlify deploy falló. ¿Ejecutaste 'netlify login'?." }
}

Write-Host ""
Write-Host "=== Listo. Abre la URL de Netlify en tu teléfono para instalar la PWA. ===" -ForegroundColor Green