import { Message } from "@/types/chat";
import ChatMessage from "./ChatMessage";
import LoadingIndicator from "./LoadingIndicator";

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export default function MessageList({ messages, isLoading }: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 ? (
        <div className="text-center text-gray-500 mt-8">
          Start a conversation by sending a message below.
        </div>
      ) : (
        messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))
      )}
      {isLoading && <LoadingIndicator />}
    </div>
  );
}
