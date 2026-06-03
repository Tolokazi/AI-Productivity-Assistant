import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { FileText, Sparkles } from "lucide-react";
import { ToolPage } from "@/components/tool-page";
import { AIOutput } from "@/components/ai-output";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { summarizeMeeting } from "@/lib/ai.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/meetings")({
  head: () => ({ meta: [{ title: "Meeting Summarizer — Workplace AI" }] }),
  component: MeetingsPage,
});

function MeetingsPage() {
  const fn = useServerFn(summarizeMeeting);
  const [notes, setNotes] = useState("");
  const [style, setStyle] = useState("concise");
  const [out, setOut] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (notes.trim().length < 10) return toast.error("Add some meeting notes first.");
    setLoading(true); setOut("");
    try {
      const r = await fn({ data: { notes, style } });
      setOut(r.text);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to summarize");
    } finally { setLoading(false); }
  };

  return (
    <ToolPage
      title="Meeting Notes Summarizer"
      description="Paste raw notes or a transcript. Get a structured summary with action items."
      icon={<FileText className="h-5 w-5" />}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-xl border bg-card p-5">
          <div>
            <Label>Summary style</Label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="concise">Concise</SelectItem>
                <SelectItem value="detailed">Detailed</SelectItem>
                <SelectItem value="executive">Executive brief</SelectItem>
                <SelectItem value="bullet">Bullet points</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Meeting notes / transcript *</Label>
            <Textarea rows={14} placeholder="Paste your raw notes here…" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <Button onClick={submit} disabled={loading} className="w-full">
            <Sparkles className="mr-2 h-4 w-4" /> {loading ? "Summarizing…" : "Summarize"}
          </Button>
        </div>
        <div>
          <AIOutput value={out} loading={loading} filename="meeting-summary.md" />
        </div>
      </div>
    </ToolPage>
  );
}
