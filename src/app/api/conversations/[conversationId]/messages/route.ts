import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function GET(
  request: Request,
  { params }: { params: { conversationId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the access token from the Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('No authorization header');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const accessToken = authHeader.split(' ')[1];
    
    // Verify the user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('User error:', userError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // First verify the conversation belongs to the user
    const { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', params.conversationId)
      .eq('user_id', user.id)
      .single();

    if (conversationError || !conversation) {
      console.error('Conversation error:', conversationError);
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Fetch messages for the conversation
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', params.conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error in messages API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 