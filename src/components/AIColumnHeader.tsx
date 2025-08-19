export function AIColumnHeader({ title, color, onNewChat }: { title: string; color: string; onNewChat?: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <div className="font-medium" style={{ color }}>{title}</div>
      <div className="flex items-center gap-2">
        <button
          className="text-xs rounded-full border px-3 py-1 hover:bg-black/5 dark:hover:bg-white/10"
          onClick={onNewChat}
        >
          New chat
        </button>
      </div>
    </div>
  );
}


