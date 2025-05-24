-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_cron";

-- Add performance-optimizing indexes
create index if not exists idx_user_profiles_email on public.user_profiles(email);
create index if not exists idx_user_profiles_created_at on public.user_profiles(created_at);
create index if not exists idx_conversations_updated_at on public.conversations(updated_at);
create index if not exists idx_messages_created_at on public.messages(created_at);
create index if not exists idx_financial_goals_status on public.financial_goals(status);
create index if not exists idx_budgets_month on public.budgets(month);
create index if not exists idx_portfolios_risk_level on public.portfolios(risk_level);

-- Audit logs table
create table if not exists public.audit_logs (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users on delete cascade,
    action text not null,
    details jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Users table (extends Supabase auth.users)
create table if not exists public.user_profiles (
    id uuid references auth.users on delete cascade primary key,
    email text unique not null,
    full_name text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    preferences jsonb default '{}'::jsonb,
    risk_profile text,
    financial_goals jsonb default '[]'::jsonb
);

-- Chat conversations table
create table if not exists public.conversations (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.user_profiles(id) on delete cascade,
    title text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    category text, -- investing, retirement, budgeting, etc.
    summary text
);

-- Chat messages table
create table if not exists public.messages (
    id uuid default uuid_generate_v4() primary key,
    conversation_id uuid references public.conversations(id) on delete cascade,
    content text not null,
    role text not null, -- 'user' or 'assistant'
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    sentiment text,
    confidence float,
    metadata jsonb default '{}'::jsonb
);

-- Financial goals table
create table if not exists public.financial_goals (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.user_profiles(id) on delete cascade,
    title text not null,
    target_amount decimal,
    current_amount decimal default 0,
    deadline timestamp with time zone,
    category text,
    status text default 'active',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Budget tracking table
create table if not exists public.budgets (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.user_profiles(id) on delete cascade,
    month date not null,
    income decimal default 0,
    expenses jsonb default '{}'::jsonb,
    savings_target decimal default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Investment portfolio table
create table if not exists public.portfolios (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.user_profiles(id) on delete cascade,
    name text not null,
    risk_level text,
    total_value decimal default 0,
    assets jsonb default '[]'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better query performance
create index if not exists idx_conversations_user_id on public.conversations(user_id);
create index if not exists idx_messages_conversation_id on public.messages(conversation_id);
create index if not exists idx_financial_goals_user_id on public.financial_goals(user_id);
create index if not exists idx_budgets_user_id on public.budgets(user_id);
create index if not exists idx_portfolios_user_id on public.portfolios(user_id);

-- Enable Row Level Security (RLS)
alter table public.user_profiles enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.financial_goals enable row level security;
alter table public.budgets enable row level security;
alter table public.portfolios enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Users can view own profile" on public.user_profiles;
drop policy if exists "Users can update own profile" on public.user_profiles;
drop policy if exists "Users can insert own profile" on public.user_profiles;
drop policy if exists "Service role can manage profiles" on public.user_profiles;
drop policy if exists "Users can view own conversations" on public.conversations;
drop policy if exists "Users can insert own conversations" on public.conversations;
drop policy if exists "Users can update own conversations" on public.conversations;
drop policy if exists "Users can delete own conversations" on public.conversations;
drop policy if exists "Service role can manage conversations" on public.conversations;
drop policy if exists "Users can view messages in own conversations" on public.messages;
drop policy if exists "Users can insert messages in own conversations" on public.messages;
drop policy if exists "Users can delete messages in own conversations" on public.messages;
drop policy if exists "Service role can manage messages" on public.messages;
drop policy if exists "Users can view own financial goals" on public.financial_goals;
drop policy if exists "Users can insert own financial goals" on public.financial_goals;
drop policy if exists "Users can update own financial goals" on public.financial_goals;
drop policy if exists "Users can view own budgets" on public.budgets;
drop policy if exists "Users can insert own budgets" on public.budgets;
drop policy if exists "Users can update own budgets" on public.budgets;
drop policy if exists "Users can view own portfolios" on public.portfolios;
drop policy if exists "Users can insert own portfolios" on public.portfolios;
drop policy if exists "Users can update own portfolios" on public.portfolios;

-- Create RLS policies
create policy "Users can view own profile"
    on public.user_profiles for select
    using (id = auth.uid());

create policy "Users can update own profile"
    on public.user_profiles for update
    using (id = auth.uid());

create policy "Users can insert own profile"
    on public.user_profiles for insert
    with check (id = auth.uid());

-- Add service role policy that bypasses RLS
create policy "Service role can manage profiles"
    on public.user_profiles
    using (auth.role() = 'service_role')
    with check (auth.role() = 'service_role');

-- Conversation policies
create policy "Users can view own conversations"
    on public.conversations for select
    using (user_id = auth.uid());

create policy "Users can insert own conversations"
    on public.conversations for insert
    with check (user_id = auth.uid());

create policy "Users can update own conversations"
    on public.conversations for update
    using (user_id = auth.uid());

create policy "Users can delete own conversations"
    on public.conversations for delete
    using (user_id = auth.uid());

create policy "Service role can manage conversations"
    on public.conversations
    using (auth.role() = 'service_role')
    with check (auth.role() = 'service_role');

-- Message policies
create policy "Users can view messages in own conversations"
    on public.messages for select
    using (
        exists (
            select 1 from public.conversations
            where conversations.id = messages.conversation_id
            and conversations.user_id = auth.uid()
        )
    );

create policy "Users can insert messages in own conversations"
    on public.messages for insert
    with check (
        exists (
            select 1 from public.conversations
            where conversations.id = messages.conversation_id
            and conversations.user_id = auth.uid()
        )
    );

create policy "Users can delete messages in own conversations"
    on public.messages for delete
    using (
        exists (
            select 1 from public.conversations
            where conversations.id = messages.conversation_id
            and conversations.user_id = auth.uid()
        )
    );

create policy "Service role can manage messages"
    on public.messages
    using (auth.role() = 'service_role')
    with check (auth.role() = 'service_role');

-- Add RLS policies for other tables
create policy "Users can view own financial goals"
    on public.financial_goals for select
    using (user_id = (select auth.uid()));

create policy "Users can insert own financial goals"
    on public.financial_goals for insert
    with check (user_id = (select auth.uid()));

create policy "Users can update own financial goals"
    on public.financial_goals for update
    using (user_id = (select auth.uid()));

create policy "Users can view own budgets"
    on public.budgets for select
    using (user_id = (select auth.uid()));

create policy "Users can insert own budgets"
    on public.budgets for insert
    with check (user_id = (select auth.uid()));

create policy "Users can update own budgets"
    on public.budgets for update
    using (user_id = (select auth.uid()));

create policy "Users can view own portfolios"
    on public.portfolios for select
    using (user_id = (select auth.uid()));

create policy "Users can insert own portfolios"
    on public.portfolios for insert
    with check (user_id = (select auth.uid()));

create policy "Users can update own portfolios"
    on public.portfolios for update
    using (user_id = (select auth.uid()));

-- Triggers for updated_at timestamps
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

drop trigger if exists handle_updated_at on public.user_profiles;
create trigger handle_updated_at
    before update on public.user_profiles
    for each row
    execute function public.handle_updated_at();

drop trigger if exists handle_updated_at on public.conversations;
create trigger handle_updated_at
    before update on public.conversations
    for each row
    execute function public.handle_updated_at();

drop trigger if exists handle_updated_at on public.financial_goals;
create trigger handle_updated_at
    before update on public.financial_goals
    for each row
    execute function public.handle_updated_at();

drop trigger if exists handle_updated_at on public.budgets;
create trigger handle_updated_at
    before update on public.budgets
    for each row
    execute function public.handle_updated_at();

drop trigger if exists handle_updated_at on public.portfolios;
create trigger handle_updated_at
    before update on public.portfolios
    for each row
    execute function public.handle_updated_at();

-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.user_profiles (id, email, full_name)
    values (new.id, new.email, new.raw_user_meta_data->>'full_name');
    return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user creation
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- Add retention policy for conversations
create or replace function public.cleanup_old_conversations()
returns void as $$
begin
    -- Delete conversations older than 30 days
    delete from public.conversations
    where updated_at < now() - interval '30 days';
    
    -- Delete messages from deleted conversations (cascade should handle this, but being explicit)
    delete from public.messages
    where conversation_id not in (select id from public.conversations);
end;
$$ language plpgsql security definer;

-- Create a trigger to automatically update conversation timestamps
create or replace function public.update_conversation_timestamp()
returns trigger as $$
begin
    update public.conversations
    set updated_at = now()
    where id = new.conversation_id;
    return new;
end;
$$ language plpgsql;

-- Create trigger for message updates
drop trigger if exists update_conversation_timestamp on public.messages;
create trigger update_conversation_timestamp
    after insert on public.messages
    for each row
    execute function public.update_conversation_timestamp(); 