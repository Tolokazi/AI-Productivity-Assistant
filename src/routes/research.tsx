import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { ToolPage } from "@/components/tool-page";
import { AIOutput } from "@/components/ai-output";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { researchTopic } from "@/lib/ai.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/research")({
  head: () => ({ meta: [{ title: "Research Assistant — Workplace AI" }] }),
  component: ResearchPage,
});

function ResearchPage() {
  const fn = useServerFn(researchTopic);
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("business professionals");
  const [depth, setDepth] = useState("overview");
  const [out, setOut] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!topic.trim()) return toast.error("Enter a topic to research.");
    setLoading(true); setOut("");
    try {
      const r = await fn({ data: { topic, audience, depth } });
      setOut(r.text);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Research failed");
    } finally { setLoading(false); }
  };

  return (
    <ToolPage
      title="AI Research Assistant"
      description="Get a structured briefing on any topic — fast."
      icon={<Search className="h-5 w-5" />}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-xl border bg-card p-5">
          <div>
            <Label>Topic *</Label>
            <Input placeholder="e.g. Vector databases for RAG" value={topic} onChange={(e) => setTopic(e.target.value)} />
          </div>
          <div>
            <Label>Audience</Label>
            <Input value={audience} onChange={(e) => setAudience(e.target.value)} />
          </div>
          <div>
            <Label>Depth</Label>
            <Select value={depth} onValueChange={setDepth}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="overview">Overview</SelectItem>
                <SelectItem value="deep dive">Deep dive</SelectItem>
                <SelectItem value="comparison">Comparison</SelectItem>
                <SelectItem value="executive">Executive brief</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={submit} disabled={loading} className="w-full">
            <Sparkles className="mr-2 h-4 w-4" /> {loading ? "Researching…" : "Generate Briefing"}
          </Button>
          <p className="text-xs text-muted-foreground">
            AI summaries can be inaccurate. Verify facts before citing.
          </p>
        </div>
        <div>
          <AIOutput value={out} loading={loading} filename="research-brief.md" />
        </div>
      </div>
    </ToolPage>
  );
}
