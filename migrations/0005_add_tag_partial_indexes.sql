-- Partial indexes to keep null/empty/brandable backfills fast on large D1 tables
CREATE INDEX IF NOT EXISTS idx_available_domains_missing_sld
ON available_domains (checked_at DESC)
WHERE sld IS NULL OR trim(sld) = '';

CREATE INDEX IF NOT EXISTS idx_available_domains_missing_tags
ON available_domains (checked_at DESC)
WHERE tags IS NULL OR trim(tags) = '';

CREATE INDEX IF NOT EXISTS idx_available_domains_brandable_tags
ON available_domains (checked_at DESC)
WHERE tags LIKE '%"brandable"%';
