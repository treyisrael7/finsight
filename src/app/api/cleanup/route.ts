import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    // Verify the request is authorized (you might want to add more security here)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const accessToken = authHeader.split(' ')[1];
    
    // Verify the session
    const { data: { user }, error: sessionError } = await supabaseAdmin.auth.getUser(accessToken);
    
    if (sessionError || !user) {
      console.error('Session error:', sessionError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Execute the cleanup function
    const { error: cleanupError } = await supabaseAdmin.rpc('cleanup_old_conversations');

    if (cleanupError) {
      console.error('Error cleaning up conversations:', cleanupError);
      return NextResponse.json(
        { error: 'Failed to clean up conversations', details: cleanupError },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Cleanup completed successfully' });
  } catch (error: any) {
    console.error('Cleanup API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
} 