-- Update clan_applications table to store complete application data
ALTER TABLE clan_applications 
ADD COLUMN application_data TEXT AFTER description;

-- Show the updated table structure
DESCRIBE clan_applications; 