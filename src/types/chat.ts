export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  sentiment?: 'positive' | 'negative' | 'neutral';
  confidence?: number;
}
