-- Manual Email Confirmation
-- Use this query to manually confirm user emails in development/testing

-- Confirm a specific user by email
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'grdes111@gmail.com';

-- Verify the confirmation
SELECT email, email_confirmed_at, confirmed_at
FROM auth.users
WHERE email = 'grdes111@gmail.com';

-- Optional: Confirm all unconfirmed users (use with caution!)
-- UPDATE auth.users
-- SET email_confirmed_at = NOW()
-- WHERE email_confirmed_at IS NULL;

-- Optional: Check all unconfirmed users
-- SELECT email, created_at, email_confirmed_at
-- FROM auth.users
-- WHERE email_confirmed_at IS NULL
-- ORDER BY created_at DESC;
