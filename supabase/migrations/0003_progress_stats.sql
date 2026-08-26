-- 0003: public aggregate counts for community metrics.
-- Exposes ONLY counts per topic/status — never user identities —
-- while keeping row-level access restricted to each user's own rows.

create or replace function public.topic_progress_stats()
returns table (topic_slug text, status text, n bigint)
language sql
security definer set search_path = public
stable
as $$
  select topic_slug, status, count(*)::bigint
  from public.topic_progress
  group by 1, 2
$$;

revoke all on function public.topic_progress_stats() from public;
grant execute on function public.topic_progress_stats() to anon, authenticated;
