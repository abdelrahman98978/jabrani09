-- Create private bucket for bank transfer proofs
insert into storage.buckets (id, name, public)
values ('bank-transfers', 'bank-transfers', false)
on conflict (id) do nothing;

-- Allow admins to manage bank transfer proof objects
create policy "Admins manage bank transfer proofs"
on storage.objects
for all
to authenticated
using (
  bucket_id = 'bank-transfers'
  and public.has_role(auth.uid(), 'admin')
)
with check (
  bucket_id = 'bank-transfers'
  and public.has_role(auth.uid(), 'admin')
);