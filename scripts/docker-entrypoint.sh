#!/usr/bin/env bash
set -euo pipefail
npx wrangler d1 migrations apply DB --local --persist-to /data --config wrangler.jsonc
node ./scripts/smtp-relay.mjs &

# Variáveis do Docker não entram automaticamente no ambiente do Worker local.
# Repassa somente as chaves usadas pela aplicação, preservando espaços e símbolos.
wrangler_args=(
  npx wrangler dev
  --local
  --persist-to /data
  --config wrangler.jsonc
  --port 3000
  --ip 0.0.0.0
)
runtime_vars=(
  APP_BASE_PATH APP_PUBLIC_URL
  ADMIN_NAME ADMIN_EMAIL ADMIN_PASSWORD
  SMTP_HOST SMTP_PORT SMTP_SECURE SMTP_STARTTLS
  SMTP_USER SMTP_PASSWORD SMTP_FROM SMTP_TLS_REJECT_UNAUTHORIZED
  SMTP_RELAY_URL
)
export SMTP_RELAY_URL="${SMTP_RELAY_URL:-http://127.0.0.1:3025/send}"
for key in "${runtime_vars[@]}"; do
  value="${!key:-}"
  if [[ -n "$value" ]]; then
    wrangler_args+=(--var "${key}:${value}")
  fi
done
exec "${wrangler_args[@]}"
