import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

export async function GET() {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPEN_AI_KEY,
    });

    // Try to list available models
    const models = await openai.models.list();
    
    // Check if we have access to GPT-3.5
    const hasGPT35 = models.data.some(model => model.id === 'gpt-3.5-turbo');
    
    // Try a simple completion
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Say "Hello, this is a test!"' }],
      max_tokens: 10
    });

    return NextResponse.json({
      status: 'success',
      hasGPT35,
      availableModels: models.data.map(m => m.id),
      testResponse: completion.choices[0].message.content,
      apiKeyFormat: process.env.OPEN_AI_KEY?.substring(0, 7) + '...' // Show just the start of the key
    });
  } catch (error) {
    console.error('OpenAI test error:', error);
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      apiKeyFormat: process.env.OPEN_AI_KEY?.substring(0, 7) + '...' // Show just the start of the key
    }, { status: 500 });
  }
} 