import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ListChecks, Sparkles } from "lucide-react";
import { ToolPage } from "@/components/tool-page";
import { AIOutput } from "@/components/ai-output";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { planTasks } from "@/lib/ai.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/tasks")({
  head: () => ({ meta: [{ title: "Task Planner — Workplace AI" }] }),
  component: TasksPage,
});

function TasksPage() {
  const fn = useServerFn(planTasks);
  const [goal, setGoal] = useState("");
  const [timeframe, setTimeframe] = useState("this week");
  const [context, setContext] = useState("");
  const [out, setOut] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!goal.trim()) return toast.error("What's your goal?");
    setLoading(true); setOut("");
    try {
      const r = await fn({ data: { goal, timeframe, context } });
      setOut(r.text);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to plan tasks");
    } finally { setLoading(false); }
  };

  return (
    <ToolPage
      title="AI Task Planner"
      description="Turn an ambitious goal into a prioritized, time-boxed plan."
      icon={<ListChecks className="h-5 w-5" />}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-xl border bg-card p-5">
          <div>
            <Label>Goal *</Label>
            <Textarea rows={3} placeholder="e.g. Launch the new pricing page" value={goal} onChange={(e) => setGoal(e.target.value)} />
          </div>
          <div>
            <Label>Timeframe</Label>
            <Input value={timeframe} onChange={(e) => setTimeframe(e.target.value)} placeholder="e.g. next 2 weeks" />
          </div>
          <div>
            <Label>Context (optional)</Label>
            <Textarea rows={4} placeholder="Team size, constraints, dependencies…" value={context} onChange={(e) => setContext(e.target.value)} />
          </div>
          <Button onClick={submit} disabled={loading} className="w-full">
            <Sparkles className="mr-2 h-4 w-4" /> {loading ? "Planning…" : "Generate Plan"}
          </Button>
        </div>
        <div>
          <AIOutput value={out} loading={loading} filename="task-plan.md" />
        </div>
      </div>
    </ToolPage>
  );
}
