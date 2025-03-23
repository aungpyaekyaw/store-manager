-- Enable RLS on items table
alter table items enable row level security;

-- Policy for inserting items (shop owners only)
create policy "Shop owners can insert items"
on items
for insert
with check (
  exists (
    select 1 from shops
    where shops.id = items.shop_id
    and shops.user_id = auth.uid()
  )
);

-- Policy for updating items (shop owners only)
create policy "Shop owners can update their items"
on items
for update
using (
  exists (
    select 1 from shops
    where shops.id = items.shop_id
    and shops.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from shops
    where shops.id = items.shop_id
    and shops.user_id = auth.uid()
  )
);

-- Policy for deleting items (shop owners only)
create policy "Shop owners can delete their items"
on items
for delete
using (
  exists (
    select 1 from shops
    where shops.id = items.shop_id
    and shops.user_id = auth.uid()
  )
);

-- Policy for reading items (public access)
create policy "Anyone can view items"
on items
for select
using (true); 