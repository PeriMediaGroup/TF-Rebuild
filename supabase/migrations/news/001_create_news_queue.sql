create table news_queue (
  id uuid primary key default uuid_generate_v4(),
  source_name text not null,
  source_url text not null,
  title_raw text,
  content_raw text,
  published_at timestamptz,
  fetched_at timestamptz default now(),
  processed boolean default false,
  hash text unique,  -- dedupe key (hash of title + content)
  error text
);
