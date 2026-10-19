#!/usr/bin/env bash
# ==============================================================================
# BizGen AI - Automated PostgreSQL Database Backup Script
# Creates compressed dumps with timestamp, automated rotation (7 days retention)
# ==============================================================================

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-./backups/postgres}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"
TIMESTAMP="$(date +'%Y%m%d_%H%M%S')"
CONTAINER_NAME="${CONTAINER_NAME:-bizgen-postgres}"
POSTGRES_USER="${POSTGRES_USER:-bizgen}"
POSTGRES_DB="${POSTGRES_DB:-bizgen}"

mkdir -p "${BACKUP_DIR}"

BACKUP_FILE="${BACKUP_DIR}/bizgen_backup_${TIMESTAMP}.sql.gz"

echo "===> [$(date)] Démarrage de la sauvegarde de la base de données BizGen..."

if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "❌ Erreur: Le conteneur ${CONTAINER_NAME} n'est pas actif." >&2
    exit 1
fi

docker exec "${CONTAINER_NAME}" pg_dump -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" --clean --if-exists | gzip > "${BACKUP_FILE}"

BACKUP_SIZE="$(du -h "${BACKUP_FILE}" | cut -f1)"
echo "✅ Sauvegarde réussie: ${BACKUP_FILE} (Taille: ${BACKUP_SIZE})"

# Nettoyage des sauvegardes datant de plus de RETENTION_DAYS jours
echo "===> Purge des sauvegardes antérieures à ${RETENTION_DAYS} jours..."
find "${BACKUP_DIR}" -name "bizgen_backup_*.sql.gz" -type f -mtime +"${RETENTION_DAYS}" -exec rm -f {} \;

echo "✅ Sauvegarde et rotation achevées avec succès."
