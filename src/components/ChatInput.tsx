"use client";
import { useRef } from "react";

export function ChatInput({ value, onChange, onSend, disabled, onPickImage }: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  disabled?: boolean;
  onPickImage?: (dataUrl: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onPickImage?.(String(reader.result));
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => fileRef.current?.click()}
        className="rounded-full border px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10"
        title="Upload image"
      >
        +
      </button>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ask anything..."
        className="w-full rounded-full border border-black/10 bg-transparent px-5 py-2 outline-none focus:ring-2 focus:ring-blue-500/50"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
          }
        }}
      />
      <button
        onClick={onSend}
        disabled={disabled}
        className={`rounded-full px-5 py-2 font-medium transition-colors ${disabled ? "bg-black/10 dark:bg-white/10 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-500"}`}
      >
        Send
      </button>
    </div>
  );
}


