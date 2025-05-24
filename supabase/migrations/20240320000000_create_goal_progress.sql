-- Create goal_progress table
create table if not exists public.goal_progress (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    goal_name text not null,
    current_amount decimal(12,2) not null default 0,
    target_amount decimal(12,2) not null,
    deadline date not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint goal_progress_user_goal_unique unique (user_id, goal_name)
);

-- Enable RLS
alter table public.goal_progress enable row level security;

-- Create policies
create policy "Users can view their own goal progress"
    on public.goal_progress for select
    using (auth.uid() = user_id);

create policy "Users can insert their own goal progress"
    on public.goal_progress for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own goal progress"
    on public.goal_progress for update
    using (auth.uid() = user_id);

create policy "Users can delete their own goal progress"
    on public.goal_progress for delete
    using (auth.uid() = user_id);

-- Create function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Create trigger for updated_at
create trigger handle_goal_progress_updated_at
    before update on public.goal_progress
    for each row
    execute function public.handle_updated_at(); 