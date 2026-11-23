-- Add EMD/PMD over-optimization risk score and compact 2-char match type code to available_domains
-- Compact 2-char emd_pmd_match_type codes:
--   nk = neutral_no_kw            (tanpa keyword target)
--   np = natural_pmd              (PMD alami & ringkas)
--   up = unnatural_pmd            (PMD kaku / sulit dilafalkan)
--   be = balanced_emd             (EMD ringkas & bersih)
--   nc = non_match_clean          (non-match bersih)
--   nn = non_match_noisy          (non-match berisik/panjang)
--   os = over_optimized_stuffing  (keyword stuffing / berulang)
--   of = over_optimized_forced    (tanda hubung / angka dipaksakan)
--   ol = over_optimized_long      (terlalu panjang mengejar keyword)
ALTER TABLE available_domains ADD COLUMN emd_pmd_score INTEGER;
ALTER TABLE available_domains ADD COLUMN emd_pmd_match_type TEXT;

CREATE INDEX IF NOT EXISTS idx_available_domains_emd_pmd
ON available_domains (emd_pmd_score, emd_pmd_match_type, checked_at DESC);
