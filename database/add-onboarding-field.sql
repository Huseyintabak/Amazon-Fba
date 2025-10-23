-- Add onboarding completion tracking to profiles table

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Add onboarding completed timestamp
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- Update existing users to have onboarding completed (they're already using the app)
UPDATE profiles 
SET onboarding_completed = TRUE,
    onboarding_completed_at = NOW()
WHERE onboarding_completed IS FALSE OR onboarding_completed IS NULL;

-- Verify
SELECT 
    p.id,
    u.email,
    p.onboarding_completed,
    p.onboarding_completed_at,
    p.created_at
FROM profiles p
LEFT JOIN auth.users u ON p.id = u.id
ORDER BY p.created_at DESC
LIMIT 10;

