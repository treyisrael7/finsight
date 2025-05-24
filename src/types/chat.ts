export interface Message {
    id: string;
    content: string;
    created_at: string;
    role: 'user' | 'assistant';
    sentiment?: 'positive' | 'negative' | 'neutral';
    confidence?: number;
    metadata?: Record<string, any>;
  }
  
  export interface Conversation {
    id: string;
    title: string | null;
    created_at: string;
    updated_at: string;
    category?: string | null;
    summary?: string | null;
    messages?: Message[];
  }
  