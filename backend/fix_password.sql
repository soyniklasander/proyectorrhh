-- Fix Super Admin Password to 'admin123'
UPDATE users
SET password_hash = '$2a$10$UryCmbqs3PbXS/bcqNK7buJ9bhOm.HKfd2hT1C98Kc4CQfw7JcY4S'
WHERE email = 'super@rickerp.com';
