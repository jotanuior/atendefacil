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
ADMIN_PASSWORD="$(openssl rand -base64 24 | tr -d '\n')"
sed -i "s|ADMIN_PASSWORD=.*|ADMIN_PASSWORD=${ADMIN_PASSWORD}|" .env
read -r -p "E-mail do administrador: " ADMIN_EMAIL
read -r -p "Nome do administrador [Administrador]: " ADMIN_NAME
ADMIN_NAME="${ADMIN_NAME:-Administrador}"
sed -i "s|ADMIN_EMAIL=.*|ADMIN_EMAIL=${ADMIN_EMAIL}|" .env
sed -i "s|ADMIN_NAME=.*|ADMIN_NAME=${ADMIN_NAME}|" .env
docker compose up -d --build
echo "Atende Fácil instalado em $APP_DIR"
echo "Acesso interno: http://127.0.0.1:3100"
echo "Usuário inicial: $ADMIN_EMAIL"
echo "Senha inicial: $ADMIN_PASSWORD"
echo "Configure o Nginx externo com deploy/nginx-atendefacil.conf.example e ative HTTPS com Certbot."
