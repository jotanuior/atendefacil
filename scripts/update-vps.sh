#!/usr/bin/env bash
set -euo pipefail
APP_DIR="${APP_DIR:-/opt/atendefacil}"
if [[ "${EUID}" -ne 0 ]]; then echo "Execute como root: sudo APP_DIR=$APP_DIR bash $APP_DIR/scripts/update-vps.sh"; exit 1; fi
[[ -d "$APP_DIR/.git" ]] || { echo "Instalação não encontrada em $APP_DIR"; exit 1; }
cd "$APP_DIR"
git fetch origin main
git pull --ff-only origin main
port_in_use(){
 local port="$1"
 if command -v ss >/dev/null 2>&1; then ss -H -ltn | awk '{print $4}' | grep -Eq "[:.]${port}$" && return 0; fi
 if command -v netstat >/dev/null 2>&1; then netstat -lnt | awk 'NR>2{print $4}' | grep -Eq "[:.]${port}$" && return 0; fi
 docker ps --format '{{.Ports}}' | grep -Eq "[:.]${port}->" && return 0
 return 1
}
if [[ -f .env ]] && ! docker ps --filter 'name=^/atendefacil$' --format '{{.Names}}' | grep -qx atendefacil; then
 APP_PORT="$(sed -n 's/^APP_PORT=//p' .env | tail -n1)"
 APP_PORT="${APP_PORT:-3100}"
 while port_in_use "$APP_PORT"; do APP_PORT=$((APP_PORT+1)); done
 sed -i "s|^APP_PORT=.*|APP_PORT=${APP_PORT}|" .env
 echo "Porta selecionada para o Atende Fácil: $APP_PORT"
fi
docker compose build --pull
docker compose up -d --remove-orphans
docker image prune -f
echo "Atende Fácil atualizado com sucesso."
