-- Compteur partagé entre les instances Vercel, sans stocker les e-mails ou IP en clair.
CREATE TABLE IF NOT EXISTS login_attempts(key_hash text PRIMARY KEY,count integer NOT NULL CHECK(count>0),expires_at timestamptz NOT NULL);
CREATE INDEX IF NOT EXISTS login_attempts_expiry_idx ON login_attempts(expires_at);
