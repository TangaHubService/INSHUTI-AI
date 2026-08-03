#!/usr/bin/env sh
set -eu

: "${API_URL:?Set API_URL to the deployed backend, for example https://api.inshuti.rw}"
: "${FRONTEND_URL:?Set FRONTEND_URL to the deployed frontend}"

curl --fail --silent --show-error "$API_URL/api/v1/health" >/dev/null
curl --fail --silent --show-error "$API_URL/api/v1/facilities" >/dev/null
curl --fail --silent --show-error "$API_URL/api/v1/library/topics" >/dev/null
curl --fail --silent --show-error "$FRONTEND_URL/" >/dev/null
curl --fail --silent --show-error "$FRONTEND_URL/manifest.webmanifest" >/dev/null
printf '%s\n' "Public production smoke checks passed. Continue with authenticated role UAT."
