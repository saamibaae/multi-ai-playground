"use client";
import { ChatMessage } from "./ChatMessage";
import { AIColumnHeader } from "./AIColumnHeader";

export type Message = { id: string; role: "user" | "assistant"; content: string; imageDataUrl?: string | null };

export function ModelResponseColumn({
  title,
  color,
  messages,
  onNewChat,
  isTyping,
}: {
  title: string;
  color: string;
  messages: Message[];
  onNewChat?: () => void;
  isTyping?: boolean;
}) {
  return (
    <div className="card p-4 flex flex-col">
      <AIColumnHeader title={title} color={color} onNewChat={onNewChat} />
      <div className="mt-3 flex-1 space-y-2 overflow-y-auto pr-1">
        {messages.map((m) => (
          <ChatMessage key={m.id} role={m.role} text={m.content} imageDataUrl={m.imageDataUrl} />
        ))}
        {isTyping && (
          <div className="mr-auto max-w-[60%] rounded-2xl bg-black/5 dark:bg-white/10 px-4 py-2">
            <span className="inline-flex gap-1">
              <span className="h-2 w-2 rounded-full bg-current animate-typing" />
              <span className="h-2 w-2 rounded-full bg-current animate-typing [animation-delay:150ms]" />
              <span className="h-2 w-2 rounded-full bg-current animate-typing [animation-delay:300ms]" />
            </span>
          </div>
        )}
      </div>
    </div>
  );
}


