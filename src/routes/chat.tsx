import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { MessageSquare, Send, Plus, Trash2, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { chatCompletion } from "@/lib/ai.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/chat")({
  head: () => ({ meta: [{ title: "AI Chatbot — Workplace AI" }] }),
  component: ChatPage,
});

type Msg = { role: "user" | "assistant"; content: string };
type Thread = { id: string; title: string; updatedAt: number; messages: Msg[] };

const KEY = "workplace-ai-threads";

function loadThreads(): Thread[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}

function ChatPage() {
  const fn = useServerFn(chatCompletion);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [bootstrapped, setBootstrapped] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Idempotent bootstrap
  useEffect(() => {
    if (bootstrapped) return;
    const existing = loadThreads();
    if (existing.length === 0) {
      const t: Thread = { id: crypto.randomUUID(), title: "New chat", updatedAt: Date.now(), messages: [] };
      setThreads([t]);
      setActiveId(t.id);
      localStorage.setItem(KEY, JSON.stringify([t]));
    } else {
      setThreads(existing);
      setActiveId(existing[0].id);
    }
    setBootstrapped(true);
  }, [bootstrapped]);

  useEffect(() => {
    if (bootstrapped) localStorage.setItem(KEY, JSON.stringify(threads));
  }, [threads, bootstrapped]);

  const active = threads.find((t) => t.id === activeId) ?? null;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [active?.messages.length, loading]);

  useEffect(() => { inputRef.current?.focus(); }, [activeId]);

  const newThread = () => {
    const t: Thread = { id: crypto.randomUUID(), title: "New chat", updatedAt: Date.now(), messages: [] };
    setThreads((cur) => [t, ...cur]);
    setActiveId(t.id);
  };

  const deleteThread = (id: string) => {
    setThreads((cur) => {
      const next = cur.filter((t) => t.id !== id);
      if (id === activeId) setActiveId(next[0]?.id ?? null);
      if (next.length === 0) {
        const t: Thread = { id: crypto.randomUUID(), title: "New chat", updatedAt: Date.now(), messages: [] };
        setActiveId(t.id);
        return [t];
      }
      return next;
    });
  };

  const send = async () => {
    if (!input.trim() || !active || loading) return;
    const userMsg: Msg = { role: "user", content: input.trim() };
    const updated = [...active.messages, userMsg];
    const newTitle = active.messages.length === 0 ? userMsg.content.slice(0, 40) : active.title;
    setThreads((cur) => cur.map((t) => t.id === active.id ? { ...t, messages: updated, title: newTitle, updatedAt: Date.now() } : t));
    setInput("");
    setLoading(true);
    try {
      const r = await fn({ data: { messages: updated } });
      setThreads((cur) => cur.map((t) => t.id === active.id ? { ...t, messages: [...updated, { role: "assistant", content: r.text }], updatedAt: Date.now() } : t));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Chat failed");
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] w-full">
      {/* Thread list */}
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-muted/20 md:flex">
        <div className="p-3">
          <Button onClick={newThread} className="w-full" size="sm">
            <Plus className="mr-2 h-4 w-4" /> New chat
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {threads.map((t) => (
            <div
              key={t.id}
              className={`group flex items-center gap-1 rounded-md px-2 py-1.5 text-sm transition-colors ${
                t.id === activeId ? "bg-accent text-accent-foreground" : "hover:bg-muted"
              }`}
            >
              <button onClick={() => setActiveId(t.id)} className="flex-1 truncate text-left">
                <MessageSquare className="mr-2 inline h-3.5 w-3.5 opacity-60" />
                {t.title || "New chat"}
              </button>
              <button
                onClick={() => deleteThread(t.id)}
                className="opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Delete chat"
              >
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
              </button>
            </div>
          ))}
        </div>
        <div className="border-t p-3 text-[11px] leading-relaxed text-muted-foreground">
          Chats are saved in this browser only.
        </div>
      </aside>

      {/* Conversation */}
      <div className="flex flex-1 flex-col">
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-3xl px-4 py-6">
            {!active || active.messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent">
                  <Bot className="h-6 w-6 text-accent-foreground" />
                </div>
                <h2 className="mt-4 text-xl font-semibold">How can I help today?</h2>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  Ask anything — brainstorm ideas, draft messages, get summaries, or plan your day.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {active.messages.map((m, i) => (
                  <div key={i} className="flex gap-3">
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                      m.role === "user" ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"
                    }`}>
                      {m.role === "user" ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="mb-1 text-xs font-medium text-muted-foreground">
                        {m.role === "user" ? "You" : "Workplace AI"}
                      </p>
                      {m.role === "assistant" ? (
                        <div className="prose-output text-sm"><ReactMarkdown>{m.content}</ReactMarkdown></div>
                      ) : (
                        <p className="whitespace-pre-wrap text-sm">{m.content}</p>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-accent-foreground">
                      <Bot className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex items-center gap-1.5 pt-2">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="border-t bg-background/80 px-4 py-3 backdrop-blur">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-end gap-2 rounded-xl border bg-card p-2 shadow-sm focus-within:border-primary/40">
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
                }}
                rows={1}
                placeholder="Message Workplace AI…  (Shift+Enter for newline)"
                className="min-h-[40px] flex-1 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0"
              />
              <Button size="icon" onClick={send} disabled={loading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              AI may produce inaccurate information. Verify before acting on suggestions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
