#!/usr/bin/env bash
set -euo pipefail

echo "Running health smoke tests..."
codes=(
  "Health Backend|https://rrhhmod-backend.rchavezza.workers.dev/api/v1/health"
  "Employees Backend|https://rrhhmod-backend.rchavezza.workers.dev/api/v1/employees"
  "Not Found|https://rrhhmod-backend.rchavezza.workers.dev/api/v1/nonexistent"
  "Pages Home|https://proyectorrhh.pages.dev"
)

for item in "${codes[@]}"; do
  IFS='|' read -r label url <<< "$item"
  code=$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo "000")
  echo "$label -> $code"
done

echo "Done"
