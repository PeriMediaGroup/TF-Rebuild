create table news_logs (
  id bigint generated always as identity primary key,
  event text not null,
  context jsonb,
  created_at timestamptz default now()
);
