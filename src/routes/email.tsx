import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Mail, Send } from "lucide-react";
import { ToolPage } from "@/components/tool-page";
import { AIOutput } from "@/components/ai-output";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateEmail } from "@/lib/ai.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/email")({
  head: () => ({ meta: [{ title: "Email Generator — Workplace AI" }] }),
  component: EmailPage,
});

function EmailPage() {
  const fn = useServerFn(generateEmail);
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [tone, setTone] = useState("professional");
  const [purpose, setPurpose] = useState("");
  const [keyPoints, setKeyPoints] = useState("");
  const [out, setOut] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!purpose.trim()) return toast.error("Please describe the email purpose.");
    setLoading(true); setOut("");
    try {
      const r = await fn({ data: { recipient, subject, tone, purpose, keyPoints } });
      setOut(r.text);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to generate email");
    } finally { setLoading(false); }
  };

  return (
    <ToolPage
      title="Smart Email Generator"
      description="Describe the email you need. AI drafts it in your tone."
      icon={<Mail className="h-5 w-5" />}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-xl border bg-card p-5">
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <Label>Recipient</Label>
              <Input placeholder="e.g. Marketing team" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
            </div>
            <div>
              <Label>Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="concise">Concise</SelectItem>
                  <SelectItem value="persuasive">Persuasive</SelectItem>
                  <SelectItem value="apologetic">Apologetic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Subject (optional)</Label>
            <Input placeholder="e.g. Q3 launch update" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div>
            <Label>Purpose *</Label>
            <Textarea rows={4} placeholder="What do you want to communicate?" value={purpose} onChange={(e) => setPurpose(e.target.value)} />
          </div>
          <div>
            <Label>Key points (optional)</Label>
            <Textarea rows={3} placeholder="• Bullet points to include" value={keyPoints} onChange={(e) => setKeyPoints(e.target.value)} />
          </div>
          <Button onClick={submit} disabled={loading} className="w-full">
            <Send className="mr-2 h-4 w-4" /> {loading ? "Drafting…" : "Generate Email"}
          </Button>
        </div>
        <div>
          <AIOutput value={out} loading={loading} filename="email-draft.txt" />
        </div>
      </div>
    </ToolPage>
  );
}
