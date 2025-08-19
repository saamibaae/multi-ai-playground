import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function ChatMessage({ role, text, imageDataUrl }: { role: "user" | "assistant"; text: string; imageDataUrl?: string | null }) {
  return (
    <div className={`animate-fadeIn w-full ${role === "user" ? "ml-auto max-w-[80%]" : "mr-auto max-w-[90%]"}`}>
      <div className={`rounded-2xl px-4 py-2 ${role === "user" ? "bg-blue-600 text-white" : "bg-black/5 dark:bg-white/10"}`}>
        {imageDataUrl && (
          <Image src={imageDataUrl} alt="uploaded image" width={512} height={512} className="mb-2 h-auto w-auto max-h-48 rounded-lg" />
        )}
        <div className="prose prose-invert prose-sm max-w-none dark:prose-invert">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
            ul: (props) => <ul {...props} className="list-disc pl-5 my-2" />,
            ol: (props) => <ol {...props} className="list-decimal pl-5 my-2" />,
            li: (props) => <li {...props} className="my-0.5" />,
            p: (props) => <p {...props} className="my-1" />,
            strong: (props) => <strong {...props} className="font-semibold" />,
          }}>
            {text}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}


