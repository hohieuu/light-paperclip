import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { issuesApi } from "../api/issues";
import { Button } from "./ui/button";
import { MarkdownBody } from "./MarkdownBody";
import { MarkdownEditor } from "./MarkdownEditor";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "../lib/utils";
import { Check, X, HelpCircle, Loader2 } from "lucide-react";
import { queryKeys } from "../lib/queryKeys";
import { useToast } from "../context/ToastContext";

interface BrainstormingTabProps {
  issueId: string;
  companyId: string;
}

export function BrainstormingTab({ issueId, companyId }: BrainstormingTabProps) {
  const queryClient = useQueryClient();
  const { pushToast } = useToast();
  const [input, setInput] = useState("");

  const { data: session, isLoading } = useQuery({
    queryKey: ["issues", issueId, "brainstorming"],
    queryFn: () => issuesApi.getBrainstormingSession(issueId),
  });

  const addMessage = useMutation({
    mutationFn: (data: { role: "ai" | "user"; content: string; options?: string[] }) =>
      issuesApi.addBrainstormingMessage(issueId, data.role, data.content, data.options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issues", issueId, "brainstorming"] });
      setInput("");
    },
    onError: (err) => {
      pushToast({ title: "Failed to send message", body: err instanceof Error ? err.message : "Unknown error", tone: "error" });
    },
  });

  const updatePart = useMutation({
    mutationFn: (data: { partId: string; status: "pending" | "approved" | "rejected" | "clarify" }) =>
      issuesApi.updateBrainstormingPlanPart(issueId, data.partId, data.status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issues", issueId, "brainstorming"] });
    },
    onError: (err) => {
      pushToast({ title: "Failed to update plan part", body: err instanceof Error ? err.message : "Unknown error", tone: "error" });
    },
  });

  const completeSession = useMutation({
    mutationFn: () => issuesApi.completeBrainstormingSession(issueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issues", issueId, "brainstorming"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.issues.documents(issueId) });
      pushToast({ title: "Plan generated successfully", tone: "success" });
    },
    onError: (err) => {
      pushToast({ title: "Failed to generate plan", body: err instanceof Error ? err.message : "Unknown error", tone: "error" });
    },
  });

  if (isLoading) {
    return <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  if (!session) {
    return <div className="p-4 text-sm text-muted-foreground">Failed to load brainstorming session.</div>;
  }

  const isCompleted = session.status === "completed";
  const messages = session.messages || [];
  const planParts = session.planParts || [];

  return (
    <div className="flex flex-col md:flex-row gap-4 h-[600px]">
      {/* Left side: Chat */}
      <div className="flex-1 flex flex-col border border-border rounded-lg overflow-hidden bg-card">
        <div className="p-3 border-b border-border bg-muted/30 font-medium text-sm">
          Brainstorming Chat
        </div>
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-8">
                No messages yet. Start the brainstorming session!
              </div>
            )}
            {messages.map((msg: any, i: number) => (
              <div key={i} className={cn("flex flex-col max-w-[85%]", msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start")}>
                <div className={cn("text-[10px] uppercase tracking-wider mb-1 text-muted-foreground", msg.role === "user" ? "text-right" : "text-left")}>
                  {msg.role === "ai" ? "Agent" : "You"}
                </div>
                <div className={cn("rounded-lg p-3 text-sm", msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted")}>
                  <MarkdownBody className={cn(msg.role === "user" && "text-primary-foreground prose-p:text-primary-foreground prose-headings:text-primary-foreground")}>
                    {msg.content}
                  </MarkdownBody>
                  {msg.options && msg.options.length > 0 && !isCompleted && (
                    <div className="mt-3 space-y-2">
                      {msg.options.map((opt: string, j: number) => (
                        <Button
                          key={j}
                          variant="outline"
                          size="sm"
                          className="w-full justify-start text-left h-auto py-2 whitespace-normal"
                          onClick={() => addMessage.mutate({ role: "user", content: opt })}
                          disabled={addMessage.isPending}
                        >
                          {opt}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        {!isCompleted && (
          <div className="p-3 border-t border-border bg-muted/10">
            <div className="flex flex-col gap-2">
              <MarkdownEditor
                value={input}
                onChange={setInput}
                placeholder="Type your message..."
                onSubmit={() => {
                  if (input.trim()) {
                    addMessage.mutate({ role: "user", content: input.trim() });
                  }
                }}
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  disabled={!input.trim() || addMessage.isPending}
                  onClick={() => {
                    if (input.trim()) {
                      addMessage.mutate({ role: "user", content: input.trim() });
                    }
                  }}
                >
                  Send
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right side: Plan Parts */}
      <div className="w-full md:w-80 flex flex-col border border-border rounded-lg overflow-hidden bg-card">
        <div className="p-3 border-b border-border bg-muted/30 font-medium text-sm flex items-center justify-between">
          <span>Draft Plan</span>
          <span className={cn("text-xs px-2 py-0.5 rounded-full", session.allPartsApproved ? "bg-green-500/20 text-green-600" : "bg-amber-500/20 text-amber-600")}>
            {session.allPartsApproved ? "All Approved" : "Pending"}
          </span>
        </div>
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {planParts.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-8">
                No plan parts proposed yet.
              </div>
            )}
            {planParts.map((part: any) => (
              <div key={part.id} className="border border-border rounded-md overflow-hidden">
                <div className="bg-muted/50 p-2 text-sm font-medium border-b border-border flex items-center justify-between">
                  <span className="truncate pr-2">{part.title}</span>
                  {part.status === "approved" && <Check className="h-4 w-4 text-green-500 shrink-0" />}
                  {part.status === "rejected" && <X className="h-4 w-4 text-destructive shrink-0" />}
                  {part.status === "clarify" && <HelpCircle className="h-4 w-4 text-amber-500 shrink-0" />}
                </div>
                <div className="p-3 text-xs prose prose-sm max-w-none dark:prose-invert">
                  <MarkdownBody>
                    {part.content}
                  </MarkdownBody>
                </div>
                {!isCompleted && (
                  <div className="p-2 bg-muted/30 border-t border-border flex flex-wrap gap-2">
                    <Button
                      variant={part.status === "approved" ? "default" : "outline"}
                      size="xs"
                      className={cn("flex-1", part.status === "approved" && "bg-green-600 hover:bg-green-700")}
                      onClick={() => updatePart.mutate({ partId: part.id, status: "approved" })}
                      disabled={updatePart.isPending}
                    >
                      Approve
                    </Button>
                    <Button
                      variant={part.status === "rejected" ? "destructive" : "outline"}
                      size="xs"
                      className="flex-1"
                      onClick={() => updatePart.mutate({ partId: part.id, status: "rejected" })}
                      disabled={updatePart.isPending}
                    >
                      Reject
                    </Button>
                    <Button
                      variant={part.status === "clarify" ? "secondary" : "outline"}
                      size="xs"
                      className="w-full"
                      onClick={() => updatePart.mutate({ partId: part.id, status: "clarify" })}
                      disabled={updatePart.isPending}
                    >
                      Needs Clarification
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="p-3 border-t border-border bg-muted/10">
          <Button
            className="w-full"
            disabled={!session.allPartsApproved || isCompleted || completeSession.isPending || planParts.length === 0}
            onClick={() => completeSession.mutate()}
          >
            {completeSession.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {isCompleted ? "Plan Generated" : "Generate Plan"}
          </Button>
        </div>
      </div>
    </div>
  );
}
