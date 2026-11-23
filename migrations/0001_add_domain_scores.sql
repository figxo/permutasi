-- Add deterministic domain evaluation score columns to available_domains
ALTER TABLE available_domains ADD COLUMN brandability_score INTEGER;
ALTER TABLE available_domains ADD COLUMN structure_length_score INTEGER;
ALTER TABLE available_domains ADD COLUMN extension_lang_fit_score INTEGER;
ALTER TABLE available_domains ADD COLUMN character_cleanliness_score INTEGER;
ALTER TABLE available_domains ADD COLUMN niche_clarity_score INTEGER;
ALTER TABLE available_domains ADD COLUMN overall_heuristic_score INTEGER;
ALTER TABLE available_domains ADD COLUMN scored_at INTEGER;
