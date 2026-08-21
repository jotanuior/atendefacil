#!/usr/bin/env bash
set -euo pipefail
APP_DIR="${APP_DIR:-/opt/atendefacil}"
REPO_URL="${REPO_URL:-git@github.com:jotanuior/atendefacil.git}"
if [[ "${EUID}" -ne 0 ]]; then echo "Execute como root: sudo bash scripts/install-vps.sh"; exit 1; fi
for command in git docker openssl; do command -v "$command" >/dev/null || { echo "Instale primeiro: $command"; exit 1; }; done
docker compose version >/dev/null || { echo "O plugin docker compose não está instalado."; exit 1; }
if [[ -e "$APP_DIR" ]]; then echo "A pasta $APP_DIR já existe. Use scripts/update-vps.sh."; exit 1; fi
git clone "$REPO_URL" "$APP_DIR"
cd "$APP_DIR"
cp .env.example .env
port_in_use(){
 local port="$1"
 if command -v ss >/dev/null 2>&1; then ss -H -ltn | awk '{print $4}' | grep -Eq "[:.]${port}$" && return 0; fi
 if command -v netstat >/dev/null 2>&1; then netstat -lnt | awk 'NR>2{print $4}' | grep -Eq "[:.]${port}$" && return 0; fi
 docker ps --format '{{.Ports}}' | grep -Eq "[:.]${port}->" && return 0
 return 1
}
APP_PORT="${APP_PORT:-3100}"
while port_in_use "$APP_PORT"; do APP_PORT=$((APP_PORT+1)); done
sed -i "s|APP_PORT=.*|APP_PORT=${APP_PORT}|" .env
ADMIN_PASSWORD="$(openssl rand -base64 24 | tr -d '\n')"
sed -i "s|ADMIN_PASSWORD=.*|ADMIN_PASSWORD=${ADMIN_PASSWORD}|" .env
read -r -p "E-mail do administrador: " ADMIN_EMAIL
read -r -p "Nome do administrador [Administrador]: " ADMIN_NAME
ADMIN_NAME="${ADMIN_NAME:-Administrador}"
sed -i "s|ADMIN_EMAIL=.*|ADMIN_EMAIL=${ADMIN_EMAIL}|" .env
sed -i "s|ADMIN_NAME=.*|ADMIN_NAME=${ADMIN_NAME}|" .env
docker compose up -d --build
echo "Atende Fácil instalado em $APP_DIR"
echo "Porta livre selecionada automaticamente: $APP_PORT"
echo "Acesso interno: http://127.0.0.1:${APP_PORT}"
echo "Usuário inicial: $ADMIN_EMAIL"
echo "Senha inicial: $ADMIN_PASSWORD"
echo "No Nginx externo, use: proxy_pass http://127.0.0.1:${APP_PORT};"
echo "Depois ative HTTPS com Certbot."
