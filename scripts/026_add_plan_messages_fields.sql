-- Add plan_id and recipient_type to messages table for plan-specific conversations
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES public.plans(id),
ADD COLUMN IF NOT EXISTS recipient_type TEXT CHECK (recipient_type IN ('client', 'affiliate'));

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_messages_plan_id ON public.messages(plan_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_type ON public.messages(recipient_type);

-- Update RLS policies
DROP POLICY IF EXISTS "Allow all operations on messages for all roles" ON public.messages;

CREATE POLICY "Allow all operations on messages for all roles"
ON public.messages
FOR ALL
TO anon, authenticated, postgres
USING (true)
WITH CHECK (true);
