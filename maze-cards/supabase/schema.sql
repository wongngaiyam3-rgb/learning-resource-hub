create schema maze_cards;
revoke all on schema maze_cards from public, anon, authenticated;

create table maze_cards.levels (
  id integer primary key,
  board text[] not null,
  row_start integer not null,
  col_start integer not null,
  direction_start integer not null
);
create table maze_cards.progress (
  class_name text not null check (class_name in ('2A', '2B')),
  student_number integer not null check (student_number between 1 and 25),
  level_id integer not null references maze_cards.levels(id),
  draft text not null default '',
  attempts integer not null default 0,
  best integer,
  updated_at timestamptz not null default now(),
  primary key (class_name, student_number, level_id)
);
create table maze_cards.attempt_ids (id uuid primary key);
create table maze_cards.settings (id boolean primary key default true check (id), teacher_hash text not null);
alter table maze_cards.levels enable row level security;
alter table maze_cards.progress enable row level security;
alter table maze_cards.attempt_ids enable row level security;
alter table maze_cards.settings enable row level security;

create function public.maze_cards_progress(p_class text, p_number integer)
returns jsonb
language sql stable security definer set search_path = ''
as $$
  select coalesce(jsonb_agg(to_jsonb(p) - 'class_name' - 'student_number' order by p.level_id), '[]')
    from maze_cards.progress p where p.class_name = p_class and p.student_number = p_number
$$;

create function public.maze_cards_save(p_class text, p_number integer, p_level integer, p_cards text, p_attempt uuid default null)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  level maze_cards.levels%rowtype;
  progress_row maze_cards.progress%rowtype;
  y integer;
  x integer;
  next_y integer;
  next_x integer;
  direction integer;
  polarity integer;
  step_index integer;
  card text;
  tile text;
  best_count integer;
  new_attempt boolean := false;
  dy integer[] := array[-1,0,1,0];
  dx integer[] := array[0,1,0,-1];
begin
  if p_class is null or p_class not in ('2A','2B') or p_number is null or p_number not between 1 and 25
    or p_cards is null or p_cards !~ '^[FBLR]{0,100}$' then
    raise exception 'Invalid practice request' using errcode = '22023';
  end if;
  select * into strict level from maze_cards.levels where id = p_level;
  if p_attempt is not null and length(p_cards) > 0 then
    insert into maze_cards.attempt_ids values (p_attempt) on conflict do nothing;
    new_attempt := found;
    if not new_attempt then
      select * into strict progress_row from maze_cards.progress p
        where p.class_name = p_class and p.student_number = p_number and p.level_id = p_level;
      return to_jsonb(progress_row) - 'class_name' - 'student_number';
    end if;
    y := level.row_start;
    x := level.col_start;
    direction := level.direction_start;
    for step_index in 1..length(p_cards) loop
      card := substr(p_cards, step_index, 1);
      if card in ('L','R') then
        direction := (direction + case card when 'L' then 3 else 1 end) % 4;
      else
        polarity := case card when 'B' then -1 else 1 end;
        next_y := y + polarity * dy[direction+1];
        next_x := x + polarity * dx[direction+1];
        exit when next_y < 1 or next_x < 1;
        tile := substr(level.board[next_y], next_x, 1);
        exit when tile is null or tile in ('','#');
        y := next_y;
        x := next_x;
        if tile = 'E' then
          best_count := step_index;
          exit;
        end if;
      end if;
    end loop;
  end if;
  insert into maze_cards.progress as p (class_name, student_number, level_id, draft, attempts, best)
    values (p_class, p_number, p_level, p_cards, new_attempt::integer, best_count)
    on conflict (class_name, student_number, level_id) do update
    set draft = excluded.draft, attempts = p.attempts + excluded.attempts,
        best = least(p.best, excluded.best), updated_at = now()
    returning * into progress_row;
  return to_jsonb(progress_row) - 'class_name' - 'student_number';
end
$$;

create function public.maze_cards_teacher(p_password text, p_class text)
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare result jsonb;
begin
  if p_password is null or length(p_password) > 64 or p_class is null or p_class not in ('2A','2B') then return null; end if;
  if not exists (
    select 1 from maze_cards.settings s where s.teacher_hash = extensions.crypt(p_password, s.teacher_hash)
  ) then return null; end if;
  select coalesce(jsonb_agg(to_jsonb(p) - 'draft' order by p.student_number, p.level_id), '[]')
    into result from maze_cards.progress p where p.class_name = p_class;
  return result;
end
$$;

revoke execute on function public.maze_cards_progress(text,integer), public.maze_cards_save(text,integer,integer,text,uuid),
  public.maze_cards_teacher(text,text) from public, anon, authenticated;
grant execute on function public.maze_cards_progress(text,integer), public.maze_cards_save(text,integer,integer,text,uuid),
  public.maze_cards_teacher(text,text) to anon, authenticated;
insert into maze_cards.levels values
  (1, array['####','S.E#','####'], 2, 1, 1),
  (2, array['####','S..#','##E#','####'], 2, 1, 1),
  (3, array['####','E.S#','####','####'], 2, 3, 1),
  (4, array['#S###','#.###','#...E','#####'], 1, 2, 2),
  (5, array['#####','###.E','###.#','S...#','#####'], 4, 1, 1),
  (6, array['######','.....#','#.##.#','#.##E#','#S####'], 5, 2, 0),
  (7, array['##...E','##.###','##...#','####.#','####S#','######'], 5, 5, 2),
  (8, array['##....E','##.####','##.####','...#.##','.###..#','.....S#'], 6, 6, 1),
  (9, array['#######','.....E#','.####.#','.##...#','.#..###','.S.####','#######'], 6, 2, 1),
  (10, array['########','#S.....#','###.##.#','#E#.##.#','#.#....#','#.####.#','#......#','##.###.#'], 2, 2, 1);
