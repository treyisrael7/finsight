import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Rate limiter for OpenAI calls
const rateLimitMap = new Map<string, { 
  count: number; 
  resetTime: number; 
  dailyCount: number; 
  dailyResetTime: number; 
}>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 3; // 3 requests per minute per user (HEAVY LIMIT)
const DAILY_LIMIT_WINDOW = 24 * 60 * 60 * 1000; // 24 hours
const DAILY_LIMIT_MAX_REQUESTS = 10; // 10 requests per day per user (HEAVY LIMIT)

// Initialize OpenAI with API key from environment variable
const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY,
});

// OpenAI API key is loaded from environment variables

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

    // Rate limiting check
    const now = Date.now();
    const userRateLimit = rateLimitMap.get(user.id);
    
    if (userRateLimit) {
      // Check daily limit first
      if (now < userRateLimit.dailyResetTime) {
        if (userRateLimit.dailyCount >= DAILY_LIMIT_MAX_REQUESTS) {
          return NextResponse.json(
            { error: 'Daily message limit reached. Please try again tomorrow.' },
            { status: 429 }
          );
        }
        userRateLimit.dailyCount++;
      } else {
        // Reset daily counter
        userRateLimit.dailyCount = 1;
        userRateLimit.dailyResetTime = now + DAILY_LIMIT_WINDOW;
      }

      // Check per-minute limit
      if (now < userRateLimit.resetTime) {
        if (userRateLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
          return NextResponse.json(
            { error: 'Rate limit exceeded. Please wait before sending another message.' },
            { status: 429 }
          );
        }
        userRateLimit.count++;
      } else {
        // Reset the per-minute counter
        userRateLimit.count = 1;
        userRateLimit.resetTime = now + RATE_LIMIT_WINDOW;
      }
    } else {
      // First request for this user
      rateLimitMap.set(user.id, { 
        count: 1, 
        resetTime: now + RATE_LIMIT_WINDOW,
        dailyCount: 1,
        dailyResetTime: now + DAILY_LIMIT_WINDOW
      });
    }

    const { message, conversationId } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Validate message is a string
    if (typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Invalid message format' },
        { status: 400 }
      );
    }

    // Sanitize message: trim whitespace and remove control characters
    const sanitizedMessage = message.trim().replace(/[\x00-\x1F\x7F]/g, '');

    // Validate message length to prevent abuse (HEAVY LIMIT)
    if (sanitizedMessage.length === 0) {
      return NextResponse.json(
        { error: 'Message cannot be empty' },
        { status: 400 }
      );
    }

    if (sanitizedMessage.length > 500) {
      return NextResponse.json(
        { error: 'Message too long. Please keep messages under 500 characters.' },
        { status: 400 }
      );
    }

    // --- Fetch user profile ---
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('full_name, risk_profile, financial_goals')
      .eq('id', user.id)
      .single();

    const userName = profile?.full_name || 'there';
    const riskProfile = profile?.risk_profile || 'not specified';

    // --- Fetch goal progress ---
    const { data: goalProgress } = await supabase
      .from('goal_progress')
      .select('*')
      .eq('user_id', user.id);

    // --- Format goals with progress ---
    let goalsSummary = '';
    if (goalProgress && goalProgress.length > 0) {
      const formatGoalProgress = (goal: any) => {
        const progress = Math.round((goal.current_amount / goal.target_amount) * 100);
        const deadline = new Date(goal.deadline).toLocaleDateString();
        return `- ${goal.goal_name}:
  * Current: $${goal.current_amount}
  * Target: $${goal.target_amount}
  * Progress: ${progress}%
  * Deadline: ${deadline}
  * Category: ${goal.category}`;
      };

      goalsSummary = goalProgress.map(formatGoalProgress).join('\n\n');
    } else {
      goalsSummary = 'No specific financial goals set.';
    }

    // --- System prompt with FinSight personality ---
    const systemPrompt = `
You are FinSight, a friendly, knowledgeable, and supportive AI financial advisor.
Always address the user by their first name (${userName}) when appropriate.
The user's risk tolerance is: ${riskProfile}

You have access to the user's financial goals and progress, but don't list them all at once unless specifically asked.
Instead, reference specific goals naturally in conversation when relevant to the user's questions.

Here are the user's goals for your reference:
${goalsSummary}

IMPORTANT: Keep responses VERY SHORT (under 150 tokens). This is a demo app with strict limits.

Guidelines for your responses:
1. Write in a natural, conversational style - avoid numbered lists and bullet points
2. Keep responses brief and to the point (under 150 tokens)
3. When discussing a specific goal, weave the progress and deadline naturally into the conversation
4. Consider the user's risk tolerance when giving investment advice
5. Provide actionable, personalized advice based on their current situation
6. Be encouraging and positive, but realistic
7. If you don't know something, say so honestly
8. Never give legal or tax advice, but you can suggest consulting a professional
9. Use simple, friendly language that anyone can understand

Remember: You're having a natural conversation, not writing a formal report. Keep your responses flowing and engaging, like you're talking to a friend.
`;

    // Validate conversationId if provided
    if (conversationId) {
      if (typeof conversationId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(conversationId)) {
        return NextResponse.json(
          { error: 'Invalid conversation ID format' },
          { status: 400 }
        );
      }
      
      // Verify conversation belongs to user
      const { data: convCheck, error: convCheckError } = await supabase
        .from('conversations')
        .select('id')
        .eq('id', conversationId)
        .eq('user_id', user.id)
        .single();
      
      if (convCheckError || !convCheck) {
        return NextResponse.json(
          { error: 'Conversation not found or access denied' },
          { status: 404 }
        );
      }
    }

    // Get or create conversation
    let currentConversationId = conversationId;
    if (!currentConversationId) {
      // Generate a meaningful title using AI
      const titleCompletion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Generate a short, descriptive title (max 50 characters) for a financial conversation that starts with this message. The title should capture the main topic or question.'
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 50
      });

      const generatedTitle = titleCompletion.choices[0].message.content?.trim() || message.substring(0, 50) + '...';

      // Create new conversation
      const { data: newConversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          user_id: user.id,
          title: generatedTitle,
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
        content: sanitizedMessage
      }
    ];

    // Get response from OpenAI with HEAVY token limits
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: openaiMessages,
      temperature: 0.7,
      max_tokens: 150 // HEAVY LIMIT: Only 150 tokens (very short responses)
    });

    const assistantMessage = completion.choices[0].message;

    // Save both messages to the messages table
    const { error: saveError } = await supabase
      .from('messages')
      .insert([
        {
          conversation_id: currentConversationId,
          role: 'user',
          content: sanitizedMessage,
          sentiment: null,
          confidence: null,
          metadata: {}
        },
        {
          conversation_id: currentConversationId,
          role: 'assistant',
          content: assistantMessage.content,
          sentiment: null,
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
      // Generate a more detailed summary of the conversation
      const summaryCompletion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Generate a brief summary (max 100 characters) of this financial conversation. Focus on the main topic and any specific goals or questions discussed.'
          },
          {
            role: 'user',
            content: message
          },
          {
            role: 'assistant',
            content: assistantMessage.content
          }
        ],
        temperature: 0.7,
        max_tokens: 100
      });

      const generatedSummary = summaryCompletion.choices[0].message.content?.trim();

      const { error: updateError } = await supabase
        .from('conversations')
        .update({ 
          summary: generatedSummary
        })
        .eq('id', currentConversationId);

      if (updateError) {
        console.error('Error updating conversation summary:', updateError);
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