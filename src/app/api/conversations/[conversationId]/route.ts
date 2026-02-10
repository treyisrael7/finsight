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
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the access token from the Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('No authorization header');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    // Delete all messages in the conversation first
    const { error: messagesError } = await supabase
      .from('messages')
      .delete()
      .eq('conversation_id', params.conversationId);

    if (messagesError) {
      console.error('Error deleting messages:', messagesError);
      return NextResponse.json({ error: 'Failed to delete messages' }, { status: 500 });
    }

    // Then delete the conversation
    const { error: deleteError } = await supabase
      .from('conversations')
      .delete()
      .eq('id', params.conversationId)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error deleting conversation:', deleteError);
      return NextResponse.json({ error: 'Failed to delete conversation' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in delete conversation API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 