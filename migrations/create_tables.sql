-- Enable necessary extensions
create extension if not exists "uuid-ossp";

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

-- Create RLS policies
create policy "Users can view own profile"
    on public.user_profiles for select
    using (auth.uid() = id);

create policy "Users can update own profile"
    on public.user_profiles for update
    using (auth.uid() = id);

create policy "Users can view own conversations"
    on public.conversations for select
    using (auth.uid() = user_id);

create policy "Users can insert own conversations"
    on public.conversations for insert
    with check (auth.uid() = user_id);

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

-- Triggers for updated_at timestamps
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger handle_updated_at
    before update on public.user_profiles
    for each row
    execute function public.handle_updated_at();

create trigger handle_updated_at
    before update on public.conversations
    for each row
    execute function public.handle_updated_at();

create trigger handle_updated_at
    before update on public.financial_goals
    for each row
    execute function public.handle_updated_at();

create trigger handle_updated_at
    before update on public.budgets
    for each row
    execute function public.handle_updated_at();

create trigger handle_updated_at
    before update on public.portfolios
    for each row
    execute function public.handle_updated_at(); 