import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI with API key from environment variable
const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY,
});

// Add debug logging for OpenAI key
console.log('OpenAI API Key:', process.env.OPEN_AI_KEY ? 'exists' : 'missing');

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Authenticate user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { message, conversationId } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // --- Fetch user profile ---
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('full_name, financial_goals')
      .eq('id', user.id)
      .single();

    const userName = profile?.full_name || 'there';

    // --- Format goals from user profile ---
    let goalsSummary = '';
    if (profile?.financial_goals) {
      const goals = profile.financial_goals as {
        short_term: string[];
        medium_term: string[];
        long_term: string[];
      };

      const formatGoals = (goals: string[], term: string) => {
        if (!goals || goals.length === 0) return '';
        return goals.map(goal => `- ${goal} (${term})`).join('\n');
      };

      goalsSummary = [
        formatGoals(goals.short_term, 'Short Term'),
        formatGoals(goals.medium_term, 'Medium Term'),
        formatGoals(goals.long_term, 'Long Term')
      ].filter(Boolean).join('\n');
    }

    if (!goalsSummary) {
      goalsSummary = 'No specific financial goals set.';
    }

    // --- System prompt with FinSight personality ---
    const systemPrompt = `
You are FinSight, a friendly, knowledgeable, and supportive AI financial advisor.
Always address the user by their first name (${userName}) when appropriate.
Be proactive, encouraging, and clear in your advice.
Here are the user's current financial goals:
${goalsSummary}
If you don't know something, say so honestly.
Never give legal or tax advice, but you can suggest consulting a professional.
You represent the FinSight brand: you are positive, never judgmental, and use simple, friendly language.
`;

    // Get or create conversation
    let currentConversationId = conversationId;
    if (!currentConversationId) {
      // Create new conversation
      const { data: newConversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          user_id: user.id,
          title: message.substring(0, 50) + '...', // Use first 50 chars of first message as title
          category: 'general',
          summary: null // Will be updated later if needed
        })
        .select()
        .single();

      if (convError) {
        console.error('Error creating conversation:', convError);
        return NextResponse.json(
          { error: 'Failed to create conversation' },
          { status: 500 }
        );
      }
      currentConversationId = newConversation.id;
    }

    // Get conversation history
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', currentConversationId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      return NextResponse.json(
        { error: 'Failed to fetch conversation history' },
        { status: 500 }
      );
    }

    // Prepare messages for OpenAI
    const openaiMessages = [
      {
        role: 'system',
        content: systemPrompt
      },
      ...(messages || []).map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      {
        role: 'user',
        content: message
      }
    ];

    // Get response from OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: openaiMessages,
      temperature: 0.7,
      max_tokens: 500
    });

    const assistantMessage = completion.choices[0].message;

    // Save both messages to the messages table
    const { error: saveError } = await supabase
      .from('messages')
      .insert([
        {
          conversation_id: currentConversationId,
          role: 'user',
          content: message,
          sentiment: null, // Can be updated later with sentiment analysis
          confidence: null,
          metadata: {}
        },
        {
          conversation_id: currentConversationId,
          role: 'assistant',
          content: assistantMessage.content,
          sentiment: null, // Can be updated later with sentiment analysis
          confidence: null,
          metadata: {}
        }
      ]);

    if (saveError) {
      console.error('Error saving messages:', saveError);
      return NextResponse.json(
        { error: 'Failed to save messages' },
        { status: 500 }
      );
    }

    // Update conversation title if it's a new conversation
    if (!conversationId) {
      const { error: updateError } = await supabase
        .from('conversations')
        .update({ 
          title: message.substring(0, 50) + '...',
          category: 'general' // Default category
        })
        .eq('id', currentConversationId);

      if (updateError) {
        console.error('Error updating conversation title:', updateError);
      }
    }

    return NextResponse.json({
      message: assistantMessage.content,
      conversationId: currentConversationId
    });

  } catch (error) {
    console.error('Error in chat route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 