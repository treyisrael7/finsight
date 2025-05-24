import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function DELETE(
  request: Request,
  { params }: { params: { conversationId: string } }
) {
  try {
    console.log('Deleting conversation:', params.conversationId);
    
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the access token from the Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('No authorization header');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const accessToken = authHeader.split(' ')[1];
    
    // Verify the session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.error('Session error:', sessionError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('User authenticated:', session.user.id);

    // First verify the conversation belongs to the user
    const { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', params.conversationId)
      .eq('user_id', session.user.id)
      .single();

    if (conversationError || !conversation) {
      console.error('Conversation error:', conversationError);
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    console.log('Conversation verified:', conversation.id);

    // Delete all messages in the conversation first
    const { error: messagesError } = await supabase
      .from('messages')
      .delete()
      .eq('conversation_id', params.conversationId);

    if (messagesError) {
      console.error('Error deleting messages:', messagesError);
      return NextResponse.json({ error: messagesError.message }, { status: 500 });
    }

    // Then delete the conversation
    const { error: deleteError } = await supabase
      .from('conversations')
      .delete()
      .eq('id', params.conversationId)
      .eq('user_id', session.user.id);

    if (deleteError) {
      console.error('Error deleting conversation:', deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    console.log('Conversation deleted successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in delete conversation API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 