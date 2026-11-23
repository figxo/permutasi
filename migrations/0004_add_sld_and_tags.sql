-- Add sld and tags columns to available_domains
-- Note: tags is intentionally left NULL at this stage (reserved for the next tagging phase).
ALTER TABLE available_domains ADD COLUMN sld TEXT;
ALTER TABLE available_domains ADD COLUMN tags TEXT;

CREATE INDEX IF NOT EXISTS idx_available_domains_sld
ON available_domains (sld, extension, checked_at DESC);

-- Safe SQL backfill for existing rows (handles both single-part TLDs and multi-part TLDs like .my.id / .web.id)
UPDATE available_domains
SET sld = substr(domain, 1, length(domain) - length(extension))
WHERE (sld IS NULL OR trim(sld) = '')
  AND extension LIKE '.%'
  AND length(domain) > length(extension)
  AND lower(substr(domain, length(domain) - length(extension) + 1)) = lower(extension);
