import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Copy, Check, Pencil, Eye, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface AIOutputProps {
  value: string;
  loading?: boolean;
  filename?: string;
}

export function AIOutput({ value, loading, filename = "ai-output.md" }: AIOutputProps) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setText(value);
  }, [value]);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 1500);
  };

  const download = () => {
    const blob = new Blob([text], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="rounded-xl border bg-card p-6">
        <div className="space-y-3 animate-pulse">
          <div className="h-3 w-1/3 bg-muted rounded" />
          <div className="h-3 w-full bg-muted rounded" />
          <div className="h-3 w-5/6 bg-muted rounded" />
          <div className="h-3 w-4/6 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!value) return null;

  return (
    <div className="rounded-xl border bg-card">
      <div className="flex items-center justify-between border-b px-4 py-2">
        <p className="text-xs font-medium text-muted-foreground">AI Output (editable)</p>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => setEditing((e) => !e)}>
            {editing ? <Eye className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
            <span className="ml-1.5 text-xs">{editing ? "Preview" : "Edit"}</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={copy}>
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            <span className="ml-1.5 text-xs">Copy</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={download}>
            <Download className="h-3.5 w-3.5" />
            <span className="ml-1.5 text-xs">Download</span>
          </Button>
        </div>
      </div>
      <div className="p-5">
        {editing ? (
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[320px] font-mono text-sm"
          />
        ) : (
          <div className="prose-output text-sm">
            <ReactMarkdown>{text}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
