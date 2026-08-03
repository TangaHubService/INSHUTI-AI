#!/usr/bin/env sh
set -eu

: "${DATABASE_URL:?DATABASE_URL is required}"
: "${BACKUP_DIR:?BACKUP_DIR is required and must be an explicit protected directory}"
: "${BACKUP_ENCRYPTION_KEY:?BACKUP_ENCRYPTION_KEY is required and must come from a secret manager}"

mkdir -p "$BACKUP_DIR"
timestamp=$(date -u +%Y%m%dT%H%M%SZ)
target="$BACKUP_DIR/inshuti-$timestamp.dump.enc"
pg_dump --format=custom --no-owner --no-acl "$DATABASE_URL" | openssl enc -aes-256-cbc -pbkdf2 -salt -pass env:BACKUP_ENCRYPTION_KEY -out "$target"
shasum -a 256 "$target" > "$target.sha256"
printf '%s\n' "$target"
