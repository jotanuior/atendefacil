#!/usr/bin/env bash
set -euo pipefail
npx wrangler d1 migrations apply DB --local --persist-to /data --config wrangler.jsonc
exec npx wrangler dev --local --persist-to /data --config wrangler.jsonc --port 3000 --ip 0.0.0.0
