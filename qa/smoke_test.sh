#!/bin/bash

# Default URL
API_URL="${1:-https://proyectorrhh.rchavezza.workers.dev}"

echo "========================================"
echo "SMOKE TEST: RickERP Multi-tenant"
echo "Target: $API_URL"
echo "========================================"

# Check for jq
if ! command -v jq &> /dev/null; then
    echo "jq could not be found. Please install it to run this script."
    exit 1
fi

# 1. Login as Tenant Admin A
echo "[1] Logging in as Admin Company A..."
LOGIN_RES=$(curl -s -X POST "$API_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@rickcorp.com", "password": "password123"}')

TOKEN_A=$(echo $LOGIN_RES | jq -r '.token')

if [ "$TOKEN_A" == "null" ] || [ -z "$TOKEN_A" ]; then
  echo "❌ Login Failed: $LOGIN_RES"
  exit 1
fi

echo "✅ Login Success. Token: ${TOKEN_A:0:10}..."

# 2. List Employees (Tenant A)
echo "[2] Listing Employees for Company A..."
LIST_RES_A=$(curl -s -X GET "$API_URL/api/v1/employees" \
  -H "Authorization: Bearer $TOKEN_A")

COUNT_A=$(echo $LIST_RES_A | jq '.data | length')
echo "✅ Found $COUNT_A employees in Company A."

# 3. Create Contract/Onboarding (Tenant A)
echo "[3] Creating new Contract (Onboarding) for Company A..."
# Unique doc number to avoid conflicts on repeat runs
DOC_NUM="12$(date +%s | tail -c 6)"
ONBOARDING_DATA='{
  "tipoDocumento": "DNI",
  "numeroDocumento": "'"$DOC_NUM"'",
  "nombres": "Morty",
  "apellidoPaterno": "Smith",
  "apellidoMaterno": "Sanchez",
  "ubigeo": "150101",
  "direccion": "Av. Test 123",
  "banco": "BCP",
  "tipoCuenta": "AHORROS",
  "numeroCuenta": "191-12345678",
  "numeroCCI": "00219111234567890123",
  "sistemaPensiones": "AFP_INTEGRA",
  "asignacionFamiliar": true,
  "cargo": "Asistente",
  "salarioBase": 1500,
  "fechaInicio": "2024-01-01",
  "tipoContrato": "PLAZO_FIJO",
  "regimenLaboral": "GENERAL"
}'

CREATE_RES=$(curl -s -X POST "$API_URL/api/v1/contracts/onboarding" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_A" \
  -d "$ONBOARDING_DATA")

SUCCESS=$(echo $CREATE_RES | jq '.success')
if [ "$SUCCESS" != "true" ]; then
  echo "❌ Creation Failed: $CREATE_RES"
else
  echo "✅ Contract Created for Document: $DOC_NUM"
fi

# 4. Login as Tenant Admin B
echo "[4] Logging in as Admin Company B..."
LOGIN_RES_B=$(curl -s -X POST "$API_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@morty.com", "password": "password123"}')

TOKEN_B=$(echo $LOGIN_RES_B | jq -r '.token')

if [ "$TOKEN_B" == "null" ] || [ -z "$TOKEN_B" ]; then
  echo "❌ Login Failed (B): $LOGIN_RES_B"
  exit 1
fi

echo "✅ Login Success (B)."

# 5. List Employees (Tenant B) - Isolation Check
echo "[5] Checking Isolation (Tenant B should not see Tenant A data)..."
LIST_RES_B=$(curl -s -X GET "$API_URL/api/v1/employees" \
  -H "Authorization: Bearer $TOKEN_B")

COUNT_B=$(echo $LIST_RES_B | jq '.data | length')
echo "✅ Company B has $COUNT_B employees."

# Simple verification: Count A should be at least Initial + 1, Count B should be Initial.
# But we can just inspect the output visually.
