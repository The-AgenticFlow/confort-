-- Create the transactions table for Confort Lounge
-- All DB operations must go through secure Vercel Serverless API routes
-- using the Supabase Service Role Key. The public anon key has NO access.

CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cinetpay_trans_id VARCHAR(255) NULL,
    code VARCHAR(5) UNIQUE NOT NULL,
    time_slot INTEGER NOT NULL,
    amount INTEGER NOT NULL,
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('MOMO', 'ORANGE', 'CRYPTO')),
    status VARCHAR(15) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'USED', 'EXPIRED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Deny all access by default for the public anon key
CREATE POLICY "Deny all public access" ON transactions
    FOR ALL
    TO anon
    USING (false);

-- Service role key bypasses RLS by default, but we also enforce it explicitly
-- The API layer (Vercel serverless) will use the service role key.
