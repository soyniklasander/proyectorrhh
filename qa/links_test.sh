#!/usr/bin/env bash
set -euo pipefail

echo "Running smoke tests for endpoints and pages..."
tests=(
  "Health Backend|https://rrhhmod-backend.rchavezza.workers.dev/api/v1/health"
  "Employees Backend|https://rrhhmod-backend.rchavezza.workers.dev/api/v1/employees"
  "Nonexistent Backend|https://rrhhmod-backend.rchavezza.workers.dev/api/v1/nonexistent"
  "Pages Root|https://proyectorrhh.pages.dev"
)

for t in "${tests[@]}"; do
  IFS='|' read -r label url <<< "$t"
  code=$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo "000")
  echo "$label -> $code"
done

echo "Done."
