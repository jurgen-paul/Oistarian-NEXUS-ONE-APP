import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Cpu, Sparkles, Terminal, User, Bot, Loader2, Share2 } from "lucide-react";
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from "react-markdown";
import { cn } from "@/src/lib/utils";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const AIEngine = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Neural core online. NEXUS ONE Unified AI Engine at your service. How can I assist your digital universe today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [...messages, { role: "user", content: userMessage }].map(m => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }]
        })),
        config: {
          systemInstruction: "You are the NEXUS ONE Unified AI Engine, a hyper-advanced digital co-pilot. You are professional, efficient, and forward-thinking. You help users with marketing, social media, content creation, business management, and more. Your tone is futuristic and intelligent."
        }
      });

      const assistantMessage = response.text || "I encountered a neural synchronization error. Please retry.";
      setMessages(prev => [...prev, { role: "assistant", content: assistantMessage }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: "assistant", content: "Neural link interrupted. Check your connection or API configuration." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto p-6">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-nexus-accent/20 flex items-center justify-center border border-nexus-accent/30 neon-glow">
            <Cpu className="w-6 h-6 text-nexus-accent" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold">Unified AI Engine</h2>
            <p className="text-xs text-nexus-text-dim font-mono">CORE VERSION: 2.5.0-STABLE</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-bold text-green-500">SYNCHRONIZED</span>
        </div>
      </header>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-6 pr-4 scroll-smooth"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-4",
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                msg.role === "user" ? "bg-white/10" : "bg-nexus-accent/20 border border-nexus-accent/30"
              )}>
                {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-nexus-accent" />}
              </div>
              <div className={cn(
                "max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed",
                msg.role === "user" 
                  ? "bg-white/5 border border-white/10 rounded-tr-none" 
                  : "glass rounded-tl-none prose prose-invert prose-sm max-w-none"
              )}>
                {msg.role === "assistant" ? (
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                ) : (
                  msg.content
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-4"
          >
            <div className="w-8 h-8 rounded-lg bg-nexus-accent/20 border border-nexus-accent/30 flex items-center justify-center">
              <Loader2 className="w-4 h-4 text-nexus-accent animate-spin" />
            </div>
            <div className="glass p-4 rounded-2xl rounded-tl-none">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-nexus-accent/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-nexus-accent/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-nexus-accent/40 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="mt-6 relative">
        <div className="absolute inset-0 bg-nexus-accent/5 blur-xl rounded-full opacity-50" />
        <div className="relative glass p-2 rounded-2xl flex items-center gap-2">
          <div className="p-2 text-nexus-text-dim">
            <Terminal className="w-5 h-5" />
          </div>
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Execute command or ask anything..."
            className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-nexus-text-dim py-2"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="p-3 bg-nexus-accent text-black rounded-xl hover:bg-white transition-all disabled:opacity-50 disabled:hover:bg-nexus-accent"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-3 flex gap-4 justify-center">
          {[
            { label: "Market Analysis", icon: Sparkles },
            { label: "Content Strategy", icon: Share2 },
            { label: "Code Optimization", icon: Cpu }
          ].map((suggestion, i) => (
            <button 
              key={i}
              onClick={() => setInput(suggestion.label)}
              className="text-[10px] font-mono uppercase tracking-widest text-nexus-text-dim hover:text-nexus-accent transition-colors flex items-center gap-1"
            >
              <suggestion.icon className="w-3 h-3" />
              {suggestion.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
