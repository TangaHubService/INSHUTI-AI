#!/usr/bin/env sh
set -eu

: "${RESTORE_DATABASE_URL:?RESTORE_DATABASE_URL must point to an isolated non-production database}"
: "${BACKUP_FILE:?BACKUP_FILE is required}"
: "${BACKUP_ENCRYPTION_KEY:?BACKUP_ENCRYPTION_KEY is required}"

case "$RESTORE_DATABASE_URL" in
  *production*|*prod*) printf '%s\n' "Refusing a database URL that appears to be production" >&2; exit 1 ;;
esac

shasum -a 256 -c "$BACKUP_FILE.sha256"
openssl enc -d -aes-256-cbc -pbkdf2 -pass env:BACKUP_ENCRYPTION_KEY -in "$BACKUP_FILE" | pg_restore --clean --if-exists --no-owner --no-acl --dbname="$RESTORE_DATABASE_URL"
printf '%s\n' "Restore completed; run application integrity and smoke tests before approval."
