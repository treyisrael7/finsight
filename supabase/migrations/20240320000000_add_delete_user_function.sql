-- Create a function to delete a user and their associated data
create or replace function delete_user()
returns void
language plpgsql
security definer
as $$
declare
  current_user_id uuid;
begin
  -- Get the current user's ID
  current_user_id := auth.uid();
  
  if current_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Start a transaction to ensure all deletions succeed or none do
  begin
    -- Log the deletion first if audit_logs table exists
    if exists (select from pg_tables where schemaname = 'public' and tablename = 'audit_logs') then
      insert into public.audit_logs (
        user_id,
        action,
        details
      ) values (
        current_user_id,
        'account_deleted',
        jsonb_build_object(
          'timestamp', now(),
          'tables_affected', array['messages', 'conversations', 'financial_goals', 'budgets', 'portfolios', 'user_profiles', 'auth.users']
        )
      );
    end if;

    -- Delete user's data from all tables
    -- The order matters due to foreign key constraints
    delete from public.messages 
    where conversation_id in (
      select id from public.conversations where conversations.user_id = current_user_id
    );
    
    delete from public.conversations where conversations.user_id = current_user_id;
    delete from public.financial_goals where financial_goals.user_id = current_user_id;
    delete from public.budgets where budgets.user_id = current_user_id;
    delete from public.portfolios where portfolios.user_id = current_user_id;
    
    -- Delete the user profile
    delete from public.user_profiles where id = current_user_id;
    
    -- Explicitly delete from auth.users
    delete from auth.users where id = current_user_id;

  exception
    when others then
      -- Log the error if audit_logs table exists
      if exists (select from pg_tables where schemaname = 'public' and tablename = 'audit_logs') then
        insert into public.audit_logs (
          user_id,
          action,
          details
        ) values (
          current_user_id,
          'account_deletion_failed',
          jsonb_build_object(
            'timestamp', now(),
            'error', SQLERRM,
            'error_detail', SQLSTATE
          )
        );
      end if;
      -- Re-raise the error
      raise;
  end;
end;
$$; 