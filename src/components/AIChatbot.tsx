import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User, Leaf } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const _apiUrl = import.meta.env.VITE_API_URL?.trim() || window.location.origin;
const API_BASE_URL = _apiUrl.endsWith("/") ? _apiUrl.slice(0, -1) : _apiUrl;

interface Message {
  role: "user" | "bot";
  text: string;
}

const suggestions = [
  "What are the benefits of Tulsi?",
  "How to grow Ashwagandha at home?",
  "Identify common plant diseases",
];

const mockReply = (msg: string): string => {
  const lower = msg.toLowerCase();
  if (lower.includes("tulsi")) return "Tulsi (Holy Basil) is rich in antioxidants, supports immunity, reduces stress, and aids respiratory health. It thrives in warm, sunny conditions with well-drained soil.";
  if (lower.includes("ashwagandha")) return "Ashwagandha grows well in dry, subtropical climates. Plant in sandy loam soil with full sun. Water sparingly — it's drought-tolerant. Harvest roots after 150-180 days.";
  if (lower.includes("disease")) return "Common plant diseases include powdery mildew, leaf spot, and root rot. Upload a photo in the Identify tab for AI-powered diagnosis with treatment suggestions.";
  return "I can help with plant identification, care tips, disease diagnosis, and growth predictions. Try asking about a specific plant or upload an image!";
};

const ChatContent = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  const send = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: "user", text: text.trim() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setIsTyping(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim() }),
      });
      const data = await response.json();
      setMessages((m) => [...m, { role: "bot", text: data.reply || "I'm having trouble thinking. Please try again." }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages((m) => [...m, { role: "bot", text: "Connection issues. Is the backend running?" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 p-1 min-h-[450px] max-h-[600px] scrollbar-hide pr-2">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-6 py-20 opacity-80 transition-all duration-700">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="p-6 rounded-3xl bg-primary/10 ring-1 ring-primary/20 shadow-inner group-hover:scale-110 transition-transform"
            >
              <Leaf className="h-12 w-12 text-primary animate-pulse" />
            </motion.div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-display font-bold text-foreground">Botanical Intelligence</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Ready to answer your queries about Ayurvedic herbs and modern plant science.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-6 px-4">
              {suggestions.map((s, idx) => (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => send(s)}
                  className="rounded-2xl border border-border bg-card/60 px-5 py-3 text-xs font-semibold text-foreground/80 backdrop-blur-sm shadow-sm transition-all hover:bg-primary/5 hover:border-primary/40 hover:text-primary active:scale-95 hover:shadow-md"
                >
                  {s}
                </motion.button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {m.role === "bot" && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm mt-1">
                <Bot className="h-4 w-4" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-[1.25rem] px-4 py-3 text-sm leading-relaxed shadow-sm transition-all ${
                m.role === "user"
                  ? "gradient-hero text-primary-foreground rounded-tr-none"
                  : "bg-secondary/50 border border-border text-foreground rounded-tl-none prose prose-sm prose-green dark:prose-invert max-w-none"
              }`}
            >
              {m.role === "bot" ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {m.text}
                </ReactMarkdown>
              ) : (
                m.text
              )}
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 justify-start">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 animate-pulse">
              <Bot className="h-4 w-4" />
            </div>
            <div className="bg-secondary/50 border border-border rounded-[1.25rem] rounded-tl-none px-4 py-3 flex gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.3s]"></span>
              <span className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.15s]"></span>
              <span className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-bounce"></span>
            </div>
          </motion.div>
        )}
      </div>

      <div className="mt-6 flex gap-3 p-2 bg-secondary/30 rounded-2xl border border-border shadow-inner">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
          placeholder="Ask botanical expert about Tulsi, Neem, or Amla..."
          className="flex-1 rounded-xl border border-transparent bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0"
        />
        <button
          onClick={() => send(input)}
          className="flex h-11 w-20 items-center justify-center rounded-xl gradient-hero text-primary-foreground font-bold shadow-lg transition-all hover:scale-[1.02] active:scale-95 group"
        >
          <Send className="h-4 w-4 mr-1 group-hover:translate-x-1 transition-transform" />
          Ask
        </button>
      </div>
    </div>
  );
};

const AIChatbot = ({ inline = false }: { inline?: boolean }) => {
  const [open, setOpen] = useState(false);

  if (inline) {
    return <ChatContent />;
  }

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full gradient-hero text-primary-foreground shadow-elevated transition-transform hover:scale-110"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-80 glass-strong rounded-2xl p-4 sm:w-96"
          >
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-hero">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">HerbVision Assistant</p>
                <p className="text-xs text-muted-foreground">Online</p>
              </div>
            </div>
            <ChatContent />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatbot;
