-- Add application_data column to store complete application details
ALTER TABLE clan_applications 
ADD COLUMN application_data TEXT AFTER description;

-- Update existing records to have basic data structure
UPDATE clan_applications 
SET application_data = JSON_OBJECT(
    'clanTag', '',
    'region', '',
    'language', 'العربية',
    'maxMembers', 50,
    'membershipType', 'open'
) 
WHERE application_data IS NULL;

-- Show updated table structure
DESCRIBE clan_applications; 