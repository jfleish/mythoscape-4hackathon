import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatPanelProps {
  worldPrompt: string;
  onRefinement: (newPrompt: string) => void;
}

const ChatPanel = ({ worldPrompt, onRefinement }: ChatPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", content: input };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput("");
    setLoading(true);

    try {
      const resp = await supabase.functions.invoke("chat-refine", {
        body: { messages: allMessages, worldPrompt },
      });

      if (resp.error) throw resp.error;

      const data = resp.data;
      const assistantContent = data.response || "I couldn't process that. Try again.";
      setMessages((prev) => [...prev, { role: "assistant", content: assistantContent }]);

      if (data.newPrompt) {
        onRefinement(data.newPrompt);
      }
    } catch (err: any) {
      toast.error("Chat error: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="font-display font-semibold text-sm flex items-center gap-2">
          <Bot className="w-4 h-4 text-primary" />
          AI Refinement
        </h3>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-muted-foreground text-sm text-center mt-8">
            Describe changes to refine your world. e.g. "Add a glowing river"
          </p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-3 h-3 text-primary" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "glass-card"
              }`}
            >
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
            {msg.role === "user" && (
              <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center shrink-0 mt-1">
                <User className="w-3 h-3 text-secondary" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <Bot className="w-3 h-3 text-primary" />
            </div>
            <div className="glass-card px-3 py-2 text-sm">
              <span className="animate-pulse">Thinking…</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-border flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Refine your world…"
          className="bg-input border-border text-sm"
        />
        <Button variant="glow" size="icon" onClick={sendMessage} disabled={loading || !input.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChatPanel;
