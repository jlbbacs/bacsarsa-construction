-- Public-read buckets: getPublicUrl() works for anonymous visitors with no
-- extra select policy needed. Writes are restricted to the authenticated admin.
insert into storage.buckets (id, name, public)
values
  ('project-images', 'project-images', true),
  ('blog-images', 'blog-images', true),
  ('site-images', 'site-images', true)
on conflict (id) do nothing;

create policy "authenticated_insert_images" on storage.objects
  for insert to authenticated
  with check (bucket_id in ('project-images', 'blog-images', 'site-images'));

create policy "authenticated_update_images" on storage.objects
  for update to authenticated
  using (bucket_id in ('project-images', 'blog-images', 'site-images'));

create policy "authenticated_delete_images" on storage.objects
  for delete to authenticated
  using (bucket_id in ('project-images', 'blog-images', 'site-images'));
