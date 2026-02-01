-- Fix Contact Form Submission
-- This script ensures the contact_messages table exists and allows public inserts.

-- 1. Create table if not exists
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'archived', 'replied'))
);

-- 2. Enable RLS
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- 3. Grant permissions to anon and authenticated
GRANT INSERT ON public.contact_messages TO anon;
GRANT INSERT ON public.contact_messages TO authenticated;

GRANT SELECT ON public.contact_messages TO authenticated; -- Admin needs to read
GRANT UPDATE ON public.contact_messages TO authenticated; -- Admin needs to update status

-- 4. Create Policies

-- Allow anyone to insert a message
DROP POLICY IF EXISTS "Anyone can insert contact messages" ON public.contact_messages;
CREATE POLICY "Anyone can insert contact messages" 
ON public.contact_messages 
FOR INSERT 
TO public 
WITH CHECK (true);

-- Allow admins (authenticated) to read all messages
-- Assuming authenticated users are admins for now, or we rely on specific roles.
-- For simplicity in this fix, we allow authenticated to read all.
DROP POLICY IF EXISTS "Authenticated users can read messages" ON public.contact_messages;
CREATE POLICY "Authenticated users can read messages" 
ON public.contact_messages 
FOR SELECT 
TO authenticated 
USING (true);

-- Allow admins to update
DROP POLICY IF EXISTS "Authenticated users can update messages" ON public.contact_messages;
CREATE POLICY "Authenticated users can update messages" 
ON public.contact_messages 
FOR UPDATE
TO authenticated 
USING (true);
