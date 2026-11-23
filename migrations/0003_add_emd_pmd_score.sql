-- Add EMD/PMD over-optimization risk score and match type classification to available_domains
ALTER TABLE available_domains ADD COLUMN emd_pmd_score INTEGER;
ALTER TABLE available_domains ADD COLUMN emd_pmd_match_type TEXT;

CREATE INDEX IF NOT EXISTS idx_available_domains_emd_pmd
ON available_domains (emd_pmd_score, emd_pmd_match_type, checked_at DESC);
