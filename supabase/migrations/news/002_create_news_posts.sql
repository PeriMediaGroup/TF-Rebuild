create table news_posts (
  id uuid primary key default uuid_generate_v4(),
  queue_id uuid references news_queue(id) on delete set null,
  title text not null,
  summary text not null,
  image_url text,
  source_name text not null,
  source_url text not null,
  published_at timestamptz,
  created_at timestamptz default now(),
  hashtags text[],
  is_bot boolean default true,
  status text default 'published' check (status in ('draft', 'published')),
  author_id uuid default '5e42c847-367e-46f4-a363-60e034f5a9f9'  -- TF-One, for consistency
);
