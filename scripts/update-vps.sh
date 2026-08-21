#!/usr/bin/env bash
set -euo pipefail
APP_DIR="${APP_DIR:-/opt/atendefacil}"
if [[ "${EUID}" -ne 0 ]]; then echo "Execute como root: sudo APP_DIR=$APP_DIR bash $APP_DIR/scripts/update-vps.sh"; exit 1; fi
[[ -d "$APP_DIR/.git" ]] || { echo "Instalação não encontrada em $APP_DIR"; exit 1; }
cd "$APP_DIR"
git fetch origin main
git pull --ff-only origin main
docker compose build --pull
docker compose up -d --remove-orphans
docker image prune -f
echo "Atende Fácil atualizado com sucesso."
