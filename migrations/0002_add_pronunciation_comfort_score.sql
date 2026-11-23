-- Add dedicated pronunciation_comfort_score column separated from brandability & character cleanliness
ALTER TABLE available_domains ADD COLUMN pronunciation_comfort_score INTEGER;
